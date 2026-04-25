const { logAction, extractIp } = require('../services/audit.service');

// Mapa de método HTTP → operación de auditoría
const METHOD_TO_OPERATION = {
  POST:   'INSERT',
  PUT:    'UPDATE',
  PATCH:  'UPDATE',
  DELETE: 'DELETE',
};

/**
 * Infiere el nombre de la tabla auditada a partir de la URL de la ruta.
 * Ejemplo: /api/v1/users/123 → 'usuarios'
 * @param {string} path Ruta de la petición
 * @returns {string}
 */
const inferTabla = (path) => {
  // Eliminar el prefijo /api/v1/ y tomar el primer segmento
  const segment = path.replace(/^\/api\/v1\//, '').split('/')[0];
  // Normalizar nombres conocidos al nombre real de la tabla
  const tableMap = {
    users:     'usuarios',
    proyectos: 'proyectos',
    avances:   'avance_obra',
    compras:   'requerimiento_compra',
    auth:      'usuarios',
  };
  return tableMap[segment] || segment;
};

/**
 * Extrae el ID de registro del parámetro de ruta (:id).
 * Asume que el segmento posterior al nombre de la tabla es el UUID.
 * @param {string} path
 * @returns {string|null}
 */
const inferIdRegistro = (path) => {
  const parts = path.replace(/^\/api\/v1\//, '').split('/');
  const possibleId = parts[1];
  
  // Validar estrictamente que sea un UUID v4 o similar, para evitar crashes en Prisma
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (possibleId && uuidRegex.test(possibleId)) {
    return possibleId;
  }
  return null;
};

/**
 * Middleware de auditoría automática (CUD).
 *
 * Registra en audit_log DESPUÉS de que la respuesta es enviada al cliente,
 * por lo que no agrega latencia perceptible al request.
 *
 * Uso: app.use(auditMiddleware) o router.use(auditMiddleware)
 *
 * Criterio de aceptación: Toda acción CUD registra ID, fecha, IP y acción.
 */
const auditMiddleware = (req, res, next) => {
  const operacion = METHOD_TO_OPERATION[req.method];

  // Solo auditar métodos CUD (ignorar GET, HEAD, OPTIONS)
  if (!operacion) {
    return next();
  }

  // Guardar referencia al body ANTES de que Express lo procese
  const bodySnapshot = req.body ? { ...req.body } : null;

  // Eliminar campos sensibles del snapshot (nunca registrar contraseñas)
  if (bodySnapshot) {
    delete bodySnapshot.password;
    delete bodySnapshot.passwordHash;
    delete bodySnapshot.password_hash;
  }

  // Escuchar el evento 'finish' (response enviado) para no bloquear el flujo
  res.on('finish', () => {
    // Solo registrar operaciones exitosas (2xx) o 4xx de negocio relevantes
    if (res.statusCode >= 500) return;

    const tabla      = inferTabla(req.path);
    const idRegistro = inferIdRegistro(req.path) || req.params?.id || null;
    const idUsuario  = req.user?.id || null;
    const ipOrigen   = extractIp(req);

    logAction({
      tabla,
      operacion,
      idRegistro,
      idUsuario,
      datosAntes:   req.method === 'DELETE' ? bodySnapshot : null,
      datosDespues: req.method !== 'DELETE' ? bodySnapshot : null,
      ipOrigen,
    });
    // logAction atrapa sus propios errores internamente
  });

  next();
};

module.exports = { auditMiddleware };
