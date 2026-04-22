const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');

const { requireAuth, ROLES }     = require('../middlewares/auth.middleware');
const { requireProjectAccess }   = require('../middlewares/projectAccess.middleware');

const prisma = new PrismaClient();

/**
 * GET /api/v1/proyectos
 * Lista los proyectos asignados al usuario autenticado.
 * El Administrador ve todos los proyectos.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    let proyectos;

    if (req.user.rol === ROLES.ADMIN) {
      // El Admin ve todos
      proyectos = await prisma.proyecto.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, codigo: true, nombre: true,
          estado: true, fechaInicio: true, fechaFinPrevista: true,
          presupuestoTotal: true,
        },
      });
    } else {
      // Otros roles solo ven los proyectos donde tienen asignación vigente
      const hoy = new Date();
      const asignaciones = await prisma.asignacionProyectoUsuario.findMany({
        where: {
          idUsuario:  req.user.id,
          fechaInicio: { lte: hoy },
          fechaFin:    { gte: hoy },
        },
        include: {
          proyecto: {
            select: {
              id: true, codigo: true, nombre: true,
              estado: true, fechaInicio: true, fechaFinPrevista: true,
              presupuestoTotal: true,
            },
          },
        },
      });
      proyectos = asignaciones.map((a) => a.proyecto);
    }

    return res.status(200).json({ data: proyectos });
  } catch (error) {
    console.error('[ProyectosRouter] GET /:', error);
    return res.status(500).json({ error: 'Error al obtener proyectos.' });
  }
});

/**
 * GET /api/v1/proyectos/:idProyecto
 * Detalle de un proyecto específico.
 * Protegido: el usuario debe tener asignación activa (fecha vigente).
 * El Administrador tiene acceso irrestricto.
 *
 * Criterio de aceptación Act. 9:
 *   Middleware valida Token vs ID Proyecto y rango de fechas.
 *   Error 403 si no está asignado o si la asignación expiró.
 */
router.get('/:idProyecto', requireAuth, requireProjectAccess, async (req, res) => {
  try {
    const { idProyecto } = req.params;

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: idProyecto },
      include: {
        rubros:  { select: { id: true, codigo: true, descripcion: true, unidad: true, precioUnitario: true, cantidadPresupuestada: true, cantidadEjecutada: true } },
        asignaciones: {
          select: { idUsuario: true, fechaInicio: true, fechaFin: true, accessMode: true },
        },
      },
    });

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    return res.status(200).json({ data: proyecto });
  } catch (error) {
    console.error('[ProyectosRouter] GET /:idProyecto:', error);
    return res.status(500).json({ error: 'Error al obtener el proyecto.' });
  }
});

module.exports = router;
