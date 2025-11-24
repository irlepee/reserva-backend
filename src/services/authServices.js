const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');

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

    return safeUser;

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


module.exports = { registerUser, loginUser, getUser };