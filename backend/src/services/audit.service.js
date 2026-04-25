const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUuid = (id) => (id && typeof id === 'string' && uuidRegex.test(id) ? id : null);


/**
 * Extrae la IP real del cliente, soportando proxies y load balancers.
 * @param {import('express').Request} req
 * @returns {string}
 */
const extractIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // X-Forwarded-For puede contener múltiples IPs separadas por coma
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || 'desconocida';
};

/**
 * Registra una acción en la tabla de auditoría inmutable (audit_log).
 * Esta función NUNCA lanza excepciones al caller; los errores internos
 * solo se reportan por consola para no interrumpir el flujo principal.
 *
 * @param {Object} params
 * @param {string}  params.tabla        - Nombre de la tabla afectada (ej: 'usuarios')
 * @param {string}  params.operacion    - Tipo: 'INSERT' | 'UPDATE' | 'DELETE'
 * @param {string}  [params.idRegistro] - UUID del registro afectado
 * @param {string}  [params.idUsuario]  - UUID del usuario que ejecutó la acción
 * @param {Object}  [params.datosAntes] - Snapshot del registro antes de la operación
 * @param {Object}  [params.datosDespues] - Snapshot del registro después de la operación
 * @param {string}  [params.ipOrigen]   - IP del cliente (extraída del req)
 * @returns {Promise<void>}
 */
const logAction = async ({
  tabla,
  operacion,
  idRegistro = null,
  idUsuario  = null,
  datosAntes = null,
  datosDespues = null,
  ipOrigen   = null,
}) => {
  try {
    const validIdRegistro = isValidUuid(idRegistro);
    const validIdUsuario  = isValidUuid(idUsuario);

    await prisma.auditLog.create({
      data: {
        tabla,
        operacion,
        idRegistro: validIdRegistro,
        idUsuario: validIdUsuario,
        datosAntes,
        datosDespues,
        ipOrigen,
        // timestamp se asigna automáticamente por @default(now()) en el schema
      },
    });
  } catch (err) {
    // El log de auditoría nunca debe romper la operación principal
    console.error('[AuditService] Error al escribir en audit_log:', err.message);
  }
};

/**
 * Helper: construye y registra un log a partir de un objeto request Express.
 * Extrae automáticamente el idUsuario del token (req.user) y la IP del cliente.
 *
 * @param {import('express').Request} req
 * @param {Object} logData
 * @param {string}  logData.tabla
 * @param {string}  logData.operacion
 * @param {string}  [logData.idRegistro]
 * @param {Object}  [logData.datosAntes]
 * @param {Object}  [logData.datosDespues]
 * @returns {Promise<void>}
 */
const logFromRequest = async (req, { tabla, operacion, idRegistro, datosAntes, datosDespues }) => {
  await logAction({
    tabla,
    operacion,
    idRegistro: idRegistro ?? null,
    idUsuario:  req.user?.id ?? null,
    datosAntes: datosAntes ?? null,
    datosDespues: datosDespues ?? null,
    ipOrigen:   extractIp(req),
  });
};

module.exports = {
  logAction,
  logFromRequest,
  extractIp,
};
