const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('./emailService');

async function getUser(userId) {
    const user = await prisma.User.findUnique({
        where: { id: userId },
    });

    safeUser = { ...user, id: Number(user.id) };
    return safeUser;
}

async function registerUser(data) {

    const { username, name, lastname, age, gender, email, password, id_entidad, id_municipio, id_localidad } = data;

    const existingUser = await prisma.User.findFirst({
        where: {
            username
        },
    });

    if (existingUser) {
        throw new Error('El nombre de usuario ya existe');
    }

    const existingEmail = await prisma.User.findFirst({
        where: {
            email
        },
    });

    if (existingEmail) {
        throw new Error('El correo electrónico ya existe');
    }

    //Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // Generar token de verificación de email (válido por 15 minutos)
    const emailVerifyToken = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const emailVerifyTokenExp = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos desde ahora

    //Crear el usuario
    const newUser = await prisma.User.create({
        data: {
            username,
            name,
            lastname,
            age,
            gender,
            email,
            password: hashedPassword,
            id_entidad,
            id_municipio,
            id_localidad,
            email_verify_token: emailVerifyToken,
            email_verify_token_exp: emailVerifyTokenExp,
        },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            lastname: true,
            createdAt: true,
        },
    })

    //Para convertir el id que está en bigint a number
    //JS no maneja bien los bigint
    const safeUser = {
        ...newUser,
        id: Number(newUser.id)
    };

    // Enviar email de verificación
    try {
        await sendVerificationEmail(email, emailVerifyToken);
    } catch (error) {
        console.error('Error al enviar email de verificación:', error.message);
        // No lanzamos error aquí porque el usuario fue creado exitosamente
        // Solo registramos el error
    }

    return {
        user: safeUser,
        message: 'Usuario creado. Se ha enviado un email de verificación a tu correo.'
    };

}


//OPCIONALMENTE ACÁ PODEMOS HACER QUE EL USERNAME Y EL EMAIL SEAN LO MISMO
//INGRESAS UNO DE LOS 2 EN LA MISMA VARIABLE, Y ESA VARIABLE SE BUSCA EN AMBOS CAMPOS
//COMO ESTÁ ACTUALMENTE HACES QUE EN EL FRONTEND SE HAGA UNA DISTINCIÓN ENTRE AMBOS
//PARA PODER COLOCARLO EN UN CAMPO O EN EL OTRO
async function loginUser(identifier, password) {

    const user = await prisma.User.findFirst({
        where: {
            OR: [{ username: identifier },
            { email: identifier }]
        },
    });

    if (!user) {
        throw new Error('Invalid username/email or password');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid username/email or password');
    }

    const token = jwt.sign(
        { userId: Number(user.id), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return {
        token,
        user: {
            id: Number(user.id),
            username: user.username,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
        }
    }
}

async function verifyEmail(token) {
    try {
        console.log('🔍 Verificando token...');
        
        // Verificar y decodificar el token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        console.log('✅ Token decodificado correctamente. Email:', email);

        // Buscar el usuario por email
        const user = await prisma.User.findFirst({
            where: { email }
        });

        if (!user) {
            console.error('❌ Usuario no encontrado para email:', email);
            throw new Error('Usuario no encontrado');
        }

        console.log('👤 Usuario encontrado:', user.username);

        // Verificar que el token coincida y no haya expirado
        if (user.email_verify_token !== token) {
            console.error('❌ Token no coincide');
            throw new Error('Token inválido');
        }

        if (new Date() > user.email_verify_token_exp) {
            console.error('❌ Token expirado');
            throw new Error('Token expirado');
        }

        // Marcar el email como verificado
        const verifiedUser = await prisma.User.update({
            where: { id: user.id },
            data: {
                email_verified: true,
                email_verified_at: new Date(),
                email_verify_token: null,
                email_verify_token_exp: null,
            },
            select: {
                id: true,
                username: true,
                email: true,
                email_verified: true,
            }
        });

        console.log('✅ Usuario verificado correctamente:', verifiedUser.username);

        return {
            ...verifiedUser,
            id: Number(verifiedUser.id),
            message: 'Email verificado correctamente'
        };

    } catch (error) {
        console.error('Error en verifyEmail:', error.message);
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado. Solicita un nuevo código de verificación.');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Token inválido');
        }
        throw error;
    }
}

module.exports = { registerUser, loginUser, getUser, verifyEmail };