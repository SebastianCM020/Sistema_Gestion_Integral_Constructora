/**
 * cierresContables.routes.js — Sprint 10 (Reemplaza placeholder Sprint 05)
 * Módulo: Cierre Contable Mensual con Transacciones y Hash SHA-256
 *
 * Actividades cubiertas:
 *   Act-1: GET  /consolidacion        — Consolidación mensual
 *   Act-2: POST /validar              — Validación pre-cierre
 *   Act-3: POST /ejecutar             — Cierre transaccional + hash
 *   Act-5: Rollback automático via Prisma $transaction
 *
 * RBAC:
 *   - Lectura (consolidacion, listado, detalle): Admin, Contador, Presidente
 *   - Escritura (validar, ejecutar):             Admin, Contador
 */

const router = require('express').Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');

const {
  getConsolidacion,
  postValidarPreCierre,
  postEjecutarCierre,
  getCierres,
  getCierreById,
  postRechazarConsumo,
  postAprobarConsumo,
} = require('../controllers/cierre.controller');

// ── Grupos de roles ───────────────────────────────────────────────────────────

// Roles que pueden leer/consultar cierres y consolidaciones
const rolesLectura = [ROLES.ADMIN, ROLES.CONTADOR, ROLES.PRESIDENTE, ROLES.AUXILIAR];

// Roles que pueden ejecutar cierre y validación
const rolesEjecucion = [ROLES.ADMIN, ROLES.CONTADOR];

// ── Rutas ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/cierres-contables/consolidacion?idProyecto=&mesAnio=YYYY-MM
 *
 * Act-1: Resumen contable-operativo por proyecto y periodo.
 * Sin persistencia — solo previsualización.
 */
router.get(
  '/consolidacion',
  requireAuth,
  requireRole(rolesLectura),
  getConsolidacion,
);

/**
 * POST /api/v1/cierres-contables/validar
 * Body: { idProyecto: string, mesAnio: "YYYY-MM" }
 *
 * Act-2: Validación pre-cierre.
 * Responde 200 si puede proceder o 422 con lista de errores.
 */
router.post(
  '/validar',
  requireAuth,
  requireRole(rolesEjecucion),
  postValidarPreCierre,
);

/**
 * POST /api/v1/cierres-contables/ejecutar
 * Body: { idProyecto: string, mesAnio: "YYYY-MM" }
 *
 * Act-3 + Act-5: Cierre mensual transaccional.
 * BEGIN → consolidar → cerrar → hash SHA-256 → COMMIT (o ROLLBACK).
 */
router.post(
  '/ejecutar',
  requireAuth,
  requireRole(rolesEjecucion),
  postEjecutarCierre,
);

/**
 * GET /api/v1/cierres-contables?idProyecto=&limit=&offset=
 *
 * Historial de cierres mensuales.
 */
router.get(
  '/',
  requireAuth,
  requireRole(rolesLectura),
  getCierres,
);

/**
 * GET /api/v1/cierres-contables/:id
 *
 * Detalle de un cierre: incluye hash de integridad y consolidación.
 */
router.get(
  '/:id',
  requireAuth,
  requireRole(rolesLectura),
  getCierreById,
);

/**
 * POST /api/v1/cierres-contables/rechazar-consumo
 * Body: { idMovimiento: string, observacion: string }
 *
 * Rechaza un consumo creando un movimiento inverso de AJUSTE.
 */
router.post(
  '/rechazar-consumo',
  requireAuth,
  requireRole(rolesEjecucion),
  postRechazarConsumo,
);

/**
 * POST /api/v1/cierres-contables/aprobar-consumo
 * Body: { idMovimiento: string }
 *
 * Aprueba (valida) un consumo y registra trazabilidad en audit_log.
 * No modifica el movimiento ni el inventario.
 */
router.post(
  '/aprobar-consumo',
  requireAuth,
  requireRole(rolesEjecucion),
  postAprobarConsumo,
);

module.exports = router;
