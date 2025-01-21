const jwt = require('jsonwebtoken');

// Genera un token
const generateToken = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Verifica un token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return null;
    }
};

module.exports = { generateToken, verifyToken };
