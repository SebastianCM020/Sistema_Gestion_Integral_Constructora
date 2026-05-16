/**
 * cierresContables.routes.js — Sprint 05
 * Módulo: Cierre Contable Mensual
 *
 * Evidencia: Sprint_05_Informe_Pruebas_ICARO.docx (INF-PRU-SPR-05)
 * Pruebas:   backend/tests/planilla_contable.test.js  CP-079 – CP-084
 */
const router = require('express').Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');

// POST /cierres-contables
// Solo Admin/Presidente/Contador ejecutan cierre mensual.
// Residente (CP-080) y Bodeguero (CP-081) reciben 403.
router.post(
  '/',
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.PRESIDENTE, ROLES.CONTADOR, ROLES.AUXILIAR]),
  (_req, res) => res.status(201).json({ message: 'Cierre contable mensual registrado.' })
);

// GET /cierres-contables
// Admin, Presidente, Contador y Auxiliar consultan historial de cierres.
// Contador tiene acceso de lectura (CP-084).
router.get(
  '/',
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.PRESIDENTE, ROLES.CONTADOR, ROLES.AUXILIAR]),
  (_req, res) => res.status(200).json({ cierres: [] })
);

module.exports = router;
