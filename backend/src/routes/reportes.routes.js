const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middlewares/auth.middleware');

const prisma = new PrismaClient();

// GET /api/v1/reportes/dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { idRol, rol } = req.user;
    
    // Obtener los proyectos a los que tiene acceso
    let proyectosCond = {};
    if (rol.nombre !== 'ADMIN' && rol.nombre !== 'PRESIDENTE') {
      const asignaciones = await prisma.asignacionProyectoUsuario.findMany({
        where: { idUsuario: userId },
        select: { idProyecto: true }
      });
      const proyectoIds = asignaciones.map(a => a.idProyecto);
      proyectosCond = { id: { in: proyectoIds } };
    }

    const proyectos = await prisma.proyecto.findMany({
      where: { ...proyectosCond, estado: 'ACTIVO' },
      select: { id: true, nombre: true, presupuestoTotal: true }
    });

    const proyectoIds = proyectos.map(p => p.id);

    // Obtener consolidaciones de esos proyectos para los indicadores
    const consolidaciones = await prisma.consolidacionMensual.findMany({
      where: { idProyecto: { in: proyectoIds } },
      orderBy: { mesAnio: 'asc' }
    });

    res.json({
      success: true,
      proyectos,
      consolidaciones
    });
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
