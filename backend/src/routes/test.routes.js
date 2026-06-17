const router = require('express').Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');

// GET /api/v1/test/401
// Retorna 401 si no hay token o es inválido (lo maneja requireAuth)
router.get('/401', requireAuth, (req, res) => {
  res.status(200).json({ success: true, message: 'Autenticado correctamente' });
});

// GET /api/v1/test/403
// Retorna 403 si el rol no es ADMIN
router.get('/403', requireAuth, requireRole([ROLES.ADMIN]), (req, res) => {
  res.status(200).json({ success: true, message: 'Autorizado como ADMIN' });
});

module.exports = router;
