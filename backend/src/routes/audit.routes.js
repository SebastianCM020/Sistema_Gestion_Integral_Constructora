// ─────────────────────────────────────────────────────────────────────────────
// audit.routes.js — Rutas de Auditoría y Trazabilidad
//
// RBAC: Solo Administrador del Sistema puede consultar el audit_log.
// Endpoint de solo lectura; el log es inmutable por diseño.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');
const prisma = require('../utils/prisma');

const onlyAdmin = [requireAuth, requireRole([ROLES.ADMIN])];

/**
 * GET /api/v1/audit-logs
 *
 * Parámetros de query:
 *   limit   (default 50, max 200)
 *   offset  (default 0)
 *   tabla   — filtro por tabla (ej: 'requerimiento_compra')
 *   operacion — 'INSERT' | 'UPDATE' | 'DELETE'
 *   idUsuario — UUID del usuario que realizó la acción
 *   idRegistro — UUID del registro afectado
 *   desde   — ISO date string (inclusive)
 *   hasta   — ISO date string (inclusive)
 */
router.get('/', ...onlyAdmin, async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || '50', 10), 200);
    const offset = parseInt(req.query.offset || '0', 10);

    // Construir filtro where dinámico
    const where = {};
    if (req.query.tabla)      where.tabla      = req.query.tabla;
    if (req.query.operacion)  where.operacion  = req.query.operacion;
    if (req.query.idUsuario)  where.idUsuario  = req.query.idUsuario;
    if (req.query.idRegistro) where.idRegistro = req.query.idRegistro;

    if (req.query.desde || req.query.hasta) {
      where.timestamp = {};
      if (req.query.desde) where.timestamp.gte = new Date(req.query.desde);
      if (req.query.hasta) {
        // Incluir todo el día de la fecha "hasta"
        const hasta = new Date(req.query.hasta);
        hasta.setHours(23, 59, 59, 999);
        where.timestamp.lte = hasta;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take:    limit,
        skip:    offset,
        include: {
          // Incluir datos del usuario que realizó la acción si existe
          usuario: {
            select: { id: true, nombre: true, apellido: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Mapear a un formato consistente para el frontend
    // Nota: id es BigInt en Prisma → convertir a string para JSON serialization
    const data = logs.map((log) => ({
      id:           log.id.toString(),
      timestamp:    log.timestamp,
      tabla:        log.tabla,
      operacion:    log.operacion,
      idRegistro:   log.idRegistro,
      idUsuario:    log.idUsuario,
      userName:     log.usuario ? `${log.usuario.nombre} ${log.usuario.apellido}` : null,
      userEmail:    log.usuario?.email ?? null,
      datosAntes:   log.datosAntes,
      datosDespues: log.datosDespues,
      ipOrigen:     log.ipOrigen,
    }));

    return res.status(200).json({ data, total, limit, offset });
  } catch (error) {
    console.error('[audit] GET /audit-logs:', error.message);
    return res.status(500).json({ error: 'Error al obtener los registros de auditoría.' });
  }
});

module.exports = router;
