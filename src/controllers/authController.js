const authService = require('../services/authServices');
const { validateRegister } = require('../validators/authValidator');

async function getUser(req, res) {
    try {
        const user = await authService.getUser(req.user.userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ succes: false, error: error.message || "Ocurrio un error inesperado" });
    }
}

async function register(req, res) {
    try {
        const data = validateRegister(req.body);
        const result = await authService.registerUser(data);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ succes: false, error: error.message || "Ocurrio un error inesperado" });
    }
}

async function login(req, res) {

    const { identifier, password } = req.body;

    try {
        const result = await authService.loginUser(identifier, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
}

async function verifyEmail(req, res) {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token de verificación requerido' });
        }

        const result = await authService.verifyEmail(token);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = { register, login, getUser, verifyEmail };