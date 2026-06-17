const express = require('express');
const router = express.Router();
const { registrarAvanceFisico, getAvancesPorRubro } = require('../controllers/avance.controller');

const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');
const { requireProjectAccess } = require('../middlewares/projectAccess.middleware');
const { bloquearPeriodoCerrado } = require('../middlewares/checkCierrePeriodo.middleware');
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB para evidencias
});

router.post(
  '/', 
  requireAuth, 
  requireRole([ROLES.RESIDENTE, ROLES.ADMIN]), 
  upload.single('evidencia'), // Recibe el archivo 'evidencia'
  requireProjectAccess, 
  bloquearPeriodoCerrado(async (req) => ({
    idProyecto: req.body.idProyecto,
    fecha: req.body.fechaRegistro || new Date()
  })),
  registrarAvanceFisico
);
router.get('/rubro/:idRubro', requireAuth, getAvancesPorRubro);

module.exports = router;
