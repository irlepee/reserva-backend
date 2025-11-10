const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');

async function registerUser(data) {

    const { username, name, lastname, age, gender, email, password, id_estado, id_municipio, id_localidad } = data;


    //Verificar si el email o el username ya existen
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }]
        },
    });

    if (existingUser) {
        throw new Error('Username or email already exists');
    }

    //Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    //Crear el usuario
    const newUser = await prisma.user.create({
        data: {
            username,
            name,
            lastname,
            age,
            gender,
            email,
            password: hashedPassword,
            id_estado,
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

async function loginUser(username, email, password) {
    const user = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }]
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
        { userId: user.id, email: user.email },
        JWT_SECET = process.env.JWT_SECRET,
        { expiresIn: '1h' }
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


module.exports = { registerUser,loginUser };