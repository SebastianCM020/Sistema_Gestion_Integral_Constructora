const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

// Rutas Públicas
router.post('/login', authController.login);
router.post('/recover-password', authController.recoverPassword);

// Rutas Protegidas (Requieren llevar el token JWT en el header)
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
