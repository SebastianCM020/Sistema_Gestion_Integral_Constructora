// ─────────────────────────────────────────────────────────────────────────────
// cierre.controller.js — Sprint 10
// Controladores REST para el módulo de Cierre Mensual y Consolidación
//
// Endpoints:
//   GET  /api/v1/cierres-contables/consolidacion  — Act-1: Previsualizar consolidado
//   POST /api/v1/cierres-contables/validar         — Act-2: Validación pre-cierre
//   POST /api/v1/cierres-contables/ejecutar        — Act-3 + Act-5: Cierre transaccional
//   GET  /api/v1/cierres-contables                 — Listar cierres
//   GET  /api/v1/cierres-contables/:id             — Detalle de un cierre
// ─────────────────────────────────────────────────────────────────────────────

const {
  consolidarPeriodo,
  validarPreCierre,
  ejecutarCierreMensual,
  listarCierres,
  obtenerCierre,
  rechazarConsumo,
} = require('../services/cierre.service');
const { extractIp } = require('../services/audit.service');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extrae y valida los parámetros comunes idProyecto y mesAnio de una request.
 * @param {import('express').Request} req
 * @returns {{ idProyecto: string, mesAnio: string } | null}
 */
const extraerParametros = (req) => {
  const idProyecto = req.query.idProyecto || req.body?.idProyecto;
  const mesAnio    = req.query.mesAnio    || req.body?.mesAnio;
  return { idProyecto, mesAnio };
};

// ── Controladores ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/cierres-contables/consolidacion?idProyecto=&mesAnio=YYYY-MM
 *
 * Act-1: Genera el resumen contable-operativo sin persistir datos.
 * Útil para previsualización antes del cierre.
 * Roles: Contador, Admin, Presidente
 */
const getConsolidacion = async (req, res) => {
  try {
    const { idProyecto, mesAnio } = extraerParametros(req);

    if (!idProyecto || !mesAnio) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren los parámetros "idProyecto" y "mesAnio" (formato YYYY-MM).',
      });
    }

    const consolidacion = await consolidarPeriodo(idProyecto, mesAnio);

    return res.status(200).json({
      success: true,
      data:    consolidacion,
    });
  } catch (error) {
    console.error('[CierreController] getConsolidacion:', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error al generar el consolidado mensual.',
    });
  }
};

/**
 * POST /api/v1/cierres-contables/validar
 * Body: { idProyecto: string, mesAnio: "YYYY-MM" }
 *
 * Act-2: Ejecuta la validación pre-cierre.
 * Devuelve { valido: bool, errores: [], advertencias: [] }
 * Roles: Contador, Admin
 */
const postValidarPreCierre = async (req, res) => {
  try {
    const { idProyecto, mesAnio } = req.body || {};
    const idUsuario = req.user?.id;

    if (!idProyecto || !mesAnio) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren "idProyecto" y "mesAnio" en el body.',
      });
    }

    if (!idUsuario) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
    }

    const resultado = await validarPreCierre(idProyecto, mesAnio, idUsuario);

    const httpStatus = resultado.valido ? 200 : 422;
    return res.status(httpStatus).json({
      success: resultado.valido,
      data:    resultado,
    });
  } catch (error) {
    console.error('[CierreController] postValidarPreCierre:', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error durante la validación pre-cierre.',
    });
  }
};

/**
 * POST /api/v1/cierres-contables/ejecutar
 * Body: { idProyecto: string, mesAnio: "YYYY-MM" }
 *
 * Act-3 + Act-5: Cierre mensual completo con transacción y hash SHA-256.
 * Si ocurre cualquier error, ROLLBACK automático (Prisma $transaction).
 * Roles: Contador, Admin
 */
const postEjecutarCierre = async (req, res) => {
  try {
    const { idProyecto, mesAnio } = req.body || {};
    const idContador = req.user?.id;
    const ipOrigen   = extractIp(req);

    if (!idProyecto || !mesAnio) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren "idProyecto" y "mesAnio" en el body.',
      });
    }

    if (!idContador) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
    }

    // Ejecutar cierre transaccional (BEGIN/COMMIT/ROLLBACK automático)
    const resultado = await ejecutarCierreMensual(idProyecto, mesAnio, idContador, ipOrigen);

    return res.status(201).json({
      success: true,
      message: `Cierre del periodo ${mesAnio} ejecutado con éxito. Hash SHA-256 generado.`,
      data:    resultado,
    });
  } catch (error) {
    console.error('[CierreController] postEjecutarCierre:', error.message);

    // Errores de validación pre-cierre (422 Unprocessable Entity)
    if (error.statusCode === 422) {
      return res.status(422).json({
        success:     false,
        message:     error.message,
        errores:     error.errores     || [],
        advertencias: error.advertencias || [],
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error durante el proceso de cierre. La operación fue revertida (ROLLBACK).',
    });
  }
};

/**
 * GET /api/v1/cierres-contables?idProyecto=&limit=&offset=
 *
 * Lista el historial de cierres, opcionalmente filtrado por proyecto.
 * Roles: Contador, Admin, Presidente
 */
const getCierres = async (req, res) => {
  try {
    const idProyecto = req.query.idProyecto || null;
    const limit      = Math.min(parseInt(req.query.limit  || '20', 10), 100);
    const offset     = parseInt(req.query.offset || '0', 10);

    const resultado = await listarCierres(idProyecto, { limit, offset });

    return res.status(200).json({
      success: true,
      data:    resultado.cierres,
      total:   resultado.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[CierreController] getCierres:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al listar los cierres contables.',
    });
  }
};

/**
 * GET /api/v1/cierres-contables/:id
 *
 * Devuelve el detalle completo de un cierre, incluyendo consolidación y hash.
 * Roles: Contador, Admin, Presidente
 */
const getCierreById = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await obtenerCierre(id);

    return res.status(200).json({
      success: true,
      data:    resultado,
    });
  } catch (error) {
    console.error('[CierreController] getCierreById:', error.message);
    const status = error.message.includes('no encontrado') ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Error al obtener el detalle del cierre.',
    });
  }
};

/**
 * POST /api/v1/cierres-contables/rechazar-consumo
 * Body: { idMovimiento: string, observacion: string }
 *
 * Rechaza un consumo creando un movimiento de AJUSTE inverso.
 * Roles: Contador, Admin
 */
const postRechazarConsumo = async (req, res) => {
  try {
    const { idMovimiento, observacion } = req.body || {};
    const idUsuario = req.user?.id;

    if (!idMovimiento || !observacion) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren "idMovimiento" y "observacion" en el body.',
      });
    }

    if (!idUsuario) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
    }

    const resultado = await rechazarConsumo(idMovimiento, idUsuario, observacion);

    return res.status(201).json({
      success: true,
      message: 'Consumo rechazado correctamente. Inventario reversado.',
      data: resultado,
    });
  } catch (error) {
    console.error('[CierreController] postRechazarConsumo:', error.message);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Error al rechazar el consumo.',
    });
  }
};

module.exports = {
  getConsolidacion,
  postValidarPreCierre,
  postEjecutarCierre,
  getCierres,
  getCierreById,
  postRechazarConsumo,
};
