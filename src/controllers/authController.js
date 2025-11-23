const authService = require('../services/authServices');
const { validateRegister } = require('../validators/authValidator');

async function register(req, res) {
    try {
        console.log(req.body);
        const data = validateRegister(req.body);
        const result = await authService.registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
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

module.exports = { register, login };