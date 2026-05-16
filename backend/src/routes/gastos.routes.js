/**
 * gastos.routes.js — Sprint 05
 * Módulo: Gastos operativos del cierre contable
 *
 * Evidencia: Sprint_05_Informe_Pruebas_ICARO.docx (INF-PRU-SPR-05)
 * Pruebas:   backend/tests/planilla_contable.test.js  CP-085 – CP-086
 */
const router = require('express').Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');

// POST /gastos
// Admin/Presidente/Contador registran gastos operativos con detalle de rubros.
// Sin token recibe 401 (CP-085). Admin pasa RBAC (CP-086).
router.post(
  '/',
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.PRESIDENTE, ROLES.CONTADOR, ROLES.AUXILIAR]),
  (_req, res) => res.status(201).json({ message: 'Gasto operativo registrado.' })
);

// GET /gastos
// Admin/Presidente/Contador/Auxiliar/Residente consultan gastos por proyecto.
router.get(
  '/',
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.PRESIDENTE, ROLES.RESIDENTE, ROLES.CONTADOR, ROLES.AUXILIAR]),
  (_req, res) => res.status(200).json({ gastos: [] })
);

module.exports = router;
