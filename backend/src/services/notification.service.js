// ─────────────────────────────────────────────────────────────────────────────
// notification.service.js — Sprint 6: Servicio de Notificaciones Internas
//
// Implementa el patrón Observer nativo de Node.js (EventEmitter).
// Al crearse un RequerimientoCompra válido en estado EN_REVISION, se emite
// el evento 'requerimiento:creado' que persiste una notificación en BD para
// los roles Presidente / Gerente.
//
// Decisión de arquitectura:
//   Se usa EventEmitter en lugar de un bus externo (Redis, RabbitMQ) para
//   mantener la coherencia con el stack actual (Node.js monolítico).
//   Si el sistema escala a microservicios, este servicio se reemplaza por
//   un publisher de eventos sin cambiar los callers.
// ─────────────────────────────────────────────────────────────────────────────

const EventEmitter = require('events');
const prisma       = require('../utils/prisma');

// ── Singleton EventEmitter para todo el proceso ───────────────────────────────
class NotificationService extends EventEmitter {}
const notificationService = new NotificationService();

// ── Constantes ────────────────────────────────────────────────────────────────
const ROLES_GERENCIALES = ['Presidente / Gerente', 'Administrador del Sistema'];

/**
 * @typedef {Object} NotificacionRequerimiento
 * @property {string} idRequerimiento - UUID del requerimiento creado
 * @property {string} idProyecto      - UUID del proyecto asociado
 * @property {string} idSolicitante   - UUID del usuario que creó el requerimiento
 * @property {string} justificacion   - Justificación del requerimiento
 * @property {number} cantidadItems   - Número de ítems en el requerimiento
 */

/**
 * Emite el evento de requerimiento creado.
 * Llamar desde el service de compras tras la creación exitosa.
 *
 * @param {NotificacionRequerimiento} payload
 */
const emitirRequerimientoCreado = (payload) => {
  notificationService.emit('requerimiento:creado', payload);
};

/**
 * Handler interno: persiste la notificación en audit_log como registro
 * de alerta gerencial y además en la tabla interna de notificaciones.
 *
 * Se registra como INSERT en tabla 'notificaciones_gerenciales' para que
 * el middleware de auditoría pueda rastrear el evento.
 */
notificationService.on('requerimiento:creado', async (payload) => {
  try {
    const { idRequerimiento, idProyecto, idSolicitante, justificacion, cantidadItems } = payload;

    // Obtener usuarios con rol gerencial para notificar
    const usuariosGerenciales = await prisma.usuario.findMany({
      where: {
        activo: true,
        rol: {
          nombre: { in: ROLES_GERENCIALES },
        },
      },
      select: { id: true, nombre: true, apellido: true, email: true },
    });

    if (usuariosGerenciales.length === 0) {
      console.warn('[NotificationService] No se encontraron usuarios gerenciales activos para notificar.');
      return;
    }

    // Persistir notificación interna en audit_log como evento de sistema
    await prisma.auditLog.create({
      data: {
        tabla:        'requerimiento_compra',
        operacion:    'INSERT',
        idRegistro:   idRequerimiento,
        idUsuario:    idSolicitante,
        datosAntes:   null,
        datosDespues: {
          evento:          'REQUERIMIENTO_CREADO',
          idProyecto,
          justificacion,
          cantidadItems,
          notificadoA:     usuariosGerenciales.map((u) => `${u.nombre} ${u.apellido}`),
          timestampAlerta: new Date().toISOString(),
        },
        ipOrigen: 'sistema-interno',
      },
    });

    console.info(
      `[NotificationService] Alerta generada para requerimiento ${idRequerimiento}. ` +
      `Notificados: ${usuariosGerenciales.map((u) => u.email).join(', ')}`
    );
  } catch (err) {
    // El NotificationService NUNCA debe romper el flujo principal
    console.error('[NotificationService] Error al procesar evento requerimiento:creado:', err.message);
  }
});

/**
 * Obtiene las alertas gerenciales pendientes (requerimientos EN_REVISION).
 * Usado por el endpoint de bandeja gerencial.
 *
 * @param {object} opciones
 * @param {number} [opciones.limit=50]   - Máximo de registros a retornar
 * @param {number} [opciones.offset=0]   - Paginación
 * @returns {Promise<object>}
 */
const obtenerBandejaGerencial = async ({ limit = 50, offset = 0 } = {}) => {
  const [requerimientos, total] = await Promise.all([
    prisma.requerimientoCompra.findMany({
      where: { estado: 'EN_REVISION' },
      include: {
        proyecto:    { select: { id: true, codigo: true, nombre: true } },
        solicitante: { select: { id: true, nombre: true, apellido: true, email: true } },
        detalles: {
          include: {
            material: { select: { id: true, codigo: true, nombre: true, unidad: true } },
          },
        },
      },
      orderBy: { fechaSolicitud: 'desc' },
      take:    limit,
      skip:    offset,
    }),
    prisma.requerimientoCompra.count({ where: { estado: 'EN_REVISION' } }),
  ]);

  return { requerimientos, total, limit, offset };
};

module.exports = {
  notificationService,
  emitirRequerimientoCreado,
  obtenerBandejaGerencial,
};
