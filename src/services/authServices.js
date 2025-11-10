const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');

async function registerUser(data) {

    const { username, name, lastname, age, gender, email, password, id_entidad, id_municipio, id_localidad } = data;

    //Verificar si el email o el username ya existen
    const existingUser = await prisma.User.findFirst({
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
async function loginUser(username, email, password) {

    const user = await prisma.User.findFirst({
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
        { userId: Number(user.id), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    console.log('User logged in:', user.id);

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


module.exports = { registerUser, loginUser };