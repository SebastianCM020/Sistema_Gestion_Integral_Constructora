const express = require('express');
const router = express.Router();
const { registrarAvanceFisico, getAvancesPorRubro } = require('../controllers/avance.controller');

const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');

router.post('/', requireAuth, requireRole([ROLES.RESIDENTE, ROLES.ADMIN]), registrarAvanceFisico);
router.get('/rubro/:idRubro', requireAuth, getAvancesPorRubro);

module.exports = router;
