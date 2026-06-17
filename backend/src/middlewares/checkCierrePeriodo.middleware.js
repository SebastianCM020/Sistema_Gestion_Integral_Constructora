// ─────────────────────────────────────────────────────────────────────────────
// checkCierrePeriodo.middleware.js — Sprint 10
// Escudo de protección para la inmutabilidad de periodos cerrados.
//
// Intercepta operaciones POST, PUT, DELETE en módulos transaccionales
// (Avances, Compras, Bodega) y verifica que la fecha de la operación
// no pertenezca a un periodo que ya tiene estado 'CERRADO'.
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require('../utils/prisma');

/**
 * Middleware que bloquea ediciones en periodos cerrados.
 * Requiere que se le pase una función extractora para obtener
 * la fecha y el idProyecto de la request (body o params).
 *
 * @param {Function} extractor - Función (req) => { idProyecto, fecha }
 */
const bloquearPeriodoCerrado = (extractor) => {
  return async (req, res, next) => {
    // Solo validamos operaciones de escritura/modificación
    if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) {
      return next();
    }

    try {
      const { idProyecto, fecha } = await extractor(req);

      if (!idProyecto || !fecha) {
        // Si no hay datos suficientes para validar, dejamos pasar
        // (la validación del schema de la ruta fallará luego si faltan requeridos)
        return next();
      }

      const dateObj = new Date(fecha);
      if (isNaN(dateObj.getTime())) {
        return next(); // Fecha inválida, el validador principal la atrapará
      }

      // Calcular YYYY-MM
      const anio = dateObj.getUTCFullYear();
      const mes  = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const mesAnio = `${anio}-${mes}`;

      // Consultar si existe un cierre CERRADO para este proyecto y mes
      const cierre = await prisma.cierreMensual.findFirst({
        where: {
          idProyecto,
          mesAnio,
          estadoCierre: 'CERRADO',
        },
      });

      if (cierre) {
        return res.status(403).json({
          success: false,
          message: `Operación denegada. El periodo ${mesAnio} ya se encuentra CERRADO y bloqueado para este proyecto. No se permiten modificaciones.`,
        });
      }

      next();
    } catch (error) {
      console.error('[BloqueoPeriodoMiddleware] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error interno al validar el estado del periodo contable.',
      });
    }
  };
};

module.exports = {
  bloquearPeriodoCerrado,
};
