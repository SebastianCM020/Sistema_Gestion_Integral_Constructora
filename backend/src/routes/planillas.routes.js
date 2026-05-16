/**
 * planillas.routes.js — Sprint 05
 * Módulo: Planilla Mensual de Obra
 *
 * Evidencia: Sprint_05_Informe_Pruebas_ICARO.docx (INF-PRU-SPR-05)
 * Pruebas:   backend/tests/planilla_contable.test.js  CP-069 – CP-078
 */
const router = require('express').Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');

// POST /planillas
// Admin y Presidente crean planillas mensuales.
// Bodeguero (CP-070) y Residente (CP-071) reciben 403.
router.post(
  '/',
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.PRESIDENTE, ROLES.CONTADOR, ROLES.AUXILIAR]),
  (_req, res) => res.status(201).json({ message: 'Planilla mensual registrada.' })
);

// GET /planillas
// Admin, Presidente, Residente, Contador y Auxiliar consultan historial.
// Residente tiene acceso de lectura (CP-074).
router.get(
  '/',
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.PRESIDENTE, ROLES.RESIDENTE, ROLES.CONTADOR, ROLES.AUXILIAR]),
  (_req, res) => res.status(200).json({ planillas: [] })
);

// GET /planillas/:id/pdf
// Solo Admin y Presidente generan el PDF (CP-077, CP-078).
// Bodeguero recibe 403 (CP-076).
router.get(
  '/:id/pdf',
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.PRESIDENTE]),
  (req, res) => res.status(200).json({ pdf: `stub-planilla-${req.params.id}` })
);

module.exports = router;
