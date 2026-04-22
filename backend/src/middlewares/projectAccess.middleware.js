const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware: Control de Acceso por Proyecto y Fecha.
 *
 * Verifica que el usuario autenticado (req.user) tiene una asignación activa
 * al proyecto indicado en req.params.idProyecto o req.params.id, y que la
 * fecha actual está dentro del rango [fechaInicio, fechaFin] de la asignación.
 *
 * Criterio de aceptación:
 *   - El middleware valida Token vs ID Proyecto y rango de fechas.
 *   - Retorna 403 Forbidden si el usuario no tiene acceso.
 *
 * Flujo:
 *   1. Extrae el idProyecto del parámetro de ruta
 *   2. Busca la asignación en AsignacionProyectoUsuario
 *   3. Verifica el rango de fechas
 *   4. Si todo es válido, inyecta la asignación en req.proyectoAsignacion y llama next()
 *
 * Uso:
 *   router.get('/:idProyecto', requireAuth, requireProjectAccess, handler)
 */
const requireProjectAccess = async (req, res, next) => {
  try {
    // El idProyecto puede venir de :idProyecto o :id según la ruta
    const idProyecto = req.params.idProyecto || req.params.id;

    if (!idProyecto) {
      return res.status(400).json({
        error: 'Se requiere un ID de proyecto en la ruta.'
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        error: 'No hay sesión activa. Por favor inicie sesión.'
      });
    }

    // Verificar que el proyecto existe
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: idProyecto },
      select: { id: true, nombre: true, estado: true },
    });

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    // El Administrador tiene acceso irrestricto a todos los proyectos
    const { ROLES } = require('./auth.middleware');
    if (req.user.rol === ROLES.ADMIN) {
      req.proyecto = proyecto;
      return next();
    }

    // Buscar la asignación del usuario al proyecto
    const asignacion = await prisma.asignacionProyectoUsuario.findFirst({
      where: {
        idUsuario:  req.user.id,
        idProyecto: idProyecto,
      },
    });

    if (!asignacion) {
      return res.status(403).json({
        error: 'Acceso denegado. No está asignado a este proyecto.'
      });
    }

    // Verificar rango de fechas (fechaInicio ≤ hoy ≤ fechaFin)
    const hoy        = new Date();
    const fechaInicio = new Date(asignacion.fechaInicio);
    const fechaFin    = new Date(asignacion.fechaFin);

    // Comparar solo fecha (sin hora)
    hoy.setHours(0, 0, 0, 0);
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(23, 59, 59, 999);

    if (hoy < fechaInicio) {
      return res.status(403).json({
        error: `Acceso denegado. Su asignación al proyecto inicia el ${fechaInicio.toLocaleDateString('es-CO')}.`
      });
    }

    if (hoy > fechaFin) {
      return res.status(403).json({
        error: `Acceso denegado. Su asignación al proyecto finalizó el ${fechaFin.toLocaleDateString('es-CO')}.`
      });
    }

    // Inyectar los datos de proyecto y asignación para uso en el controlador
    req.proyecto   = proyecto;
    req.asignacion = asignacion;

    next();
  } catch (error) {
    console.error('[ProjectAccessMiddleware] Error:', error);
    return res.status(500).json({
      error: 'Error al verificar el acceso al proyecto.'
    });
  }
};

module.exports = { requireProjectAccess };
