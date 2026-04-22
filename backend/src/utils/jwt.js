const jwt = require('jsonwebtoken');

// Token secreto almacenado en variables de entorno (.env)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_development';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Genera un nuevo JSON Web Token
 * @param {Object} payload Datos a encriptar (ej: id, email, rol)
 * @returns {string} Token firmado
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: EXPIRES_IN,
  });
};

/**
 * Verifica y decodifica un JWT
 * @param {string} token El token provisto
 * @returns {Object} Payload desencriptado si es exitoso
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
