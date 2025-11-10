const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET

function authMiddleware(req, res, next) {
    //Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    //Separar el "Bearer" del token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = parts[1];

    //Verificar el token
    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded; //Agregar la información del usuario al request
        next(); //Continuar al siguiente middleware o ruta
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = authMiddleware