const express = require('express');
const router  = express.Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');
const usersController = require('../controllers/users.controller');

// Todas las rutas de este módulo requieren:
//   1. Token JWT válido (requireAuth)
//   2. Rol: Administrador del Sistema (requireRole)
const onlyAdmin = [requireAuth, requireRole([ROLES.ADMIN])];

/**
 * GET /api/v1/users
 * Lista todos los usuarios con filtros y paginación.
 * Criterio de aceptación: Administrador puede crear usuarios y asignar roles dinámicamente.
 */
router.get(  '/',           ...onlyAdmin, usersController.listUsers);

/**
 * GET /api/v1/users/roles
 * Lista todos los roles disponibles (para selects del frontend).
 */
router.get(  '/roles',      ...onlyAdmin, usersController.listRoles);

/**
 * POST /api/v1/users
 * Crea un nuevo usuario. Registra en audit_log automáticamente.
 */
router.post( '/',           ...onlyAdmin, usersController.createUser);

/**
 * PUT /api/v1/users/:id
 * Actualiza datos de un usuario. Registra en audit_log automáticamente.
 */
router.put(  '/:id',        ...onlyAdmin, usersController.updateUser);

/**
 * PATCH /api/v1/users/:id/role
 * Cambia el rol de un usuario. Registra en audit_log automáticamente.
 */
router.patch('/:id/role',   ...onlyAdmin, usersController.changeUserRole);

/**
 * PATCH /api/v1/users/:id/status
 * Activa o desactiva la cuenta. Registra en audit_log automáticamente.
 */
router.patch('/:id/status', ...onlyAdmin, usersController.toggleUserStatus);

module.exports = router;
