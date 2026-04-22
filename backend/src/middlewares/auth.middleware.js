const { verifyToken } = require('../utils/jwt');

// ─── Roles canónicos del sistema ICARO ──────────────────────────────────────
// Fuente única de verdad: usar estas constantes en todo middleware/controlador
const ROLES = {
  ADMIN:        'Administrador del Sistema',
  PRESIDENTE:   'Presidente / Gerente',
  CONTADOR:     'Contador',
  AUXILIAR:     'Auxiliar de Contabilidad',
  RESIDENTE:    'Residente',
  BODEGUERO:    'Bodeguero',
};

// ─── Mapa de acceso por módulo (RBAC) ───────────────────────────────────────
// Define qué roles tienen acceso a cada módulo del sistema
const MODULE_ROLES = {
  usuarios:     [ROLES.ADMIN],
  proyectos:    [ROLES.ADMIN, ROLES.PRESIDENTE, ROLES.CONTADOR, ROLES.RESIDENTE],
  avances:      [ROLES.ADMIN, ROLES.RESIDENTE, ROLES.PRESIDENTE],
  compras:      [ROLES.ADMIN, ROLES.RESIDENTE, ROLES.PRESIDENTE, ROLES.CONTADOR],
  inventario:   [ROLES.ADMIN, ROLES.BODEGUERO, ROLES.RESIDENTE],
  reportes:     [ROLES.ADMIN, ROLES.PRESIDENTE, ROLES.CONTADOR],
  auditoria:    [ROLES.ADMIN],
  configuracion:[ROLES.ADMIN],
};

/**
 * Middleware para validar el Bearer Token en rutas protegidas.
 * Inyecta req.user con el payload decodificado del JWT.
 */
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Acceso Denegado. Token no proveído o formato inválido (Bearer <token>).'
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedPayload = verifyToken(token);

    // Inyectar el payload en la petición para uso de siguientes middlewares/controllers
    req.user = decodedPayload;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'La sesión ha expirado. Inicie sesión nuevamente.' });
    }
    return res.status(403).json({ error: 'Token inválido o corrupto.' });
  }
};

/**
 * Middleware RBAC: restringe el acceso a uno o más roles específicos.
 * Debe usarse DESPUÉS de requireAuth.
 * @param {string[]} roles - Lista de roles permitidos (usar constantes ROLES)
 * @example router.get('/admin', requireAuth, requireRole([ROLES.ADMIN]), handler)
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(403).json({
        error: 'No se ha detectado rol en el token de usuario.'
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}.`
      });
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
  ROLES,
  MODULE_ROLES,
};
