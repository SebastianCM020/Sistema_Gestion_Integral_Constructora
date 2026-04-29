// ─────────────────────────────────────────────────────────────────────────────
// materiales.routes.js — HU-02: Rutas del Catálogo de Materiales
// Acceso RBAC: Admin, Bodeguero, Residente (lectura); Admin (escritura)
// ─────────────────────────────────────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');
const materialesController = require('../controllers/materiales.controller');

// Roles con permiso de lectura del catálogo
const canRead  = [requireAuth, requireRole([
  ROLES.ADMIN, ROLES.BODEGUERO, ROLES.RESIDENTE, ROLES.PRESIDENTE, ROLES.CONTADOR,
])];

// Solo Admin puede crear, editar o desactivar materiales del catálogo base
const onlyAdmin = [requireAuth, requireRole([ROLES.ADMIN])];

/**
 * GET /api/v1/materiales/categorias
 * IMPORTANTE: esta ruta debe ir ANTES de "/:id" para evitar que Express
 * interprete "categorias" como un UUID.
 */
router.get('/categorias', ...canRead, materialesController.listarCategorias);

/**
 * GET  /api/v1/materiales?categoria=&busqueda=&soloActivos=
 * Lista el catálogo completo con filtros.
 */
router.get('/', ...canRead, materialesController.listarMateriales);

/**
 * GET /api/v1/materiales/:id
 * Detalle de un material específico.
 */
router.get('/:id', ...canRead, materialesController.obtenerMaterial);

/**
 * POST /api/v1/materiales
 * Crea un nuevo material en el catálogo base.
 * Body: { codigo, nombre, categoria, unidad, descripcion? }
 */
router.post('/', ...onlyAdmin, materialesController.crearMaterial);

/**
 * PUT /api/v1/materiales/:id
 * Actualiza los datos de un material.
 * Body: { nombre?, categoria?, unidad?, descripcion?, activo? }
 */
router.put('/:id', ...onlyAdmin, materialesController.actualizarMaterial);

/**
 * DELETE /api/v1/materiales/:id
 * Soft-delete: desactiva el material (no lo borra de la BD).
 */
router.delete('/:id', ...onlyAdmin, materialesController.eliminarMaterial);

module.exports = router;
