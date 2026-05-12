const express = require('express');
const router = express.Router();
const { registrarAvanceFisico, getAvancesPorRubro } = require('../controllers/avance.controller');

const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');
const { requireProjectAccess } = require('../middlewares/projectAccess.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/', 
  requireAuth, 
  requireRole([ROLES.RESIDENTE, ROLES.ADMIN]), 
  upload.single('evidencia'), // Recibe el archivo 'evidencia'
  requireProjectAccess, 
  registrarAvanceFisico
);
router.get('/rubro/:idRubro', requireAuth, getAvancesPorRubro);

module.exports = router;
