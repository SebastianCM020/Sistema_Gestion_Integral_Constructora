// ─────────────────────────────────────────────────────────────────────────────
// ordenesCambio.routes.js - Sprint 7
//
// RBAC:
//   Creación:         Admin, Residente, Presidente/Gerente
//   Aprobación/Rechazo: Admin, Presidente/Gerente
//   Lectura:          Admin, Residente, Presidente/Gerente, Contador
//   Validación de excedente: cualquier usuario autenticado con rol de obra
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const express  = require('express');
const router   = express.Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');
const ordenCambioController = require('../controllers/ordenCambio.controller');

/** Roles que pueden aprobar o rechazar órdenes de cambio */
const canApprove = [requireAuth, requireRole([ROLES.ADMIN, ROLES.PRESIDENTE])];

/** Roles que pueden crear órdenes de cambio */
const canCreate  = [requireAuth, requireRole([ROLES.ADMIN, ROLES.RESIDENTE, ROLES.PRESIDENTE])];

/** Roles que pueden leer órdenes de cambio */
const canRead    = [requireAuth, requireRole([
  ROLES.ADMIN, ROLES.RESIDENTE, ROLES.PRESIDENTE, ROLES.CONTADOR,
])];

/**
 * GET /api/v1/ordenes-cambio/validar-excedente
 * Consulta si un excedente de avance está cubierto por una orden aprobada.
 * IMPORTANTE: va ANTES de las rutas parametrizadas.
 * Query: ?idRubro=UUID&cantidadAvance=NUMBER
 */
router.get('/validar-excedente', requireAuth, ordenCambioController.validarExcedente);

/**
 * POST /api/v1/ordenes-cambio/proyectos/:idProyecto
 * Crea una orden de cambio en estado PENDIENTE.
 */
router.post(
  '/proyectos/:idProyecto',
  ...canCreate,
  ordenCambioController.crearOrdenCambio
);

/**
 * GET /api/v1/ordenes-cambio/proyectos/:idProyecto
 * Lista las órdenes de cambio de un proyecto.
 * Query: ?estado=PENDIENTE|APROBADA|RECHAZADA&idRubro=UUID
 */
router.get(
  '/proyectos/:idProyecto',
  ...canRead,
  ordenCambioController.listarOrdenesCambio
);

/**
 * PUT /api/v1/ordenes-cambio/:id/aprobar
 * Aprueba una orden de cambio PENDIENTE.
 */
router.put('/:id/aprobar',  ...canApprove, ordenCambioController.aprobarOrdenCambio);

/**
 * PUT /api/v1/ordenes-cambio/:id/rechazar
 * Rechaza una orden de cambio PENDIENTE.
 */
router.put('/:id/rechazar', ...canApprove, ordenCambioController.rechazarOrdenCambio);

module.exports = router;
