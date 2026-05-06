const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registrarAvanceFisico = async (req, res) => {
  const { idProyecto, idRubro, cantidadEjecutada, observaciones, fechaRegistro } = req.body;
  const idResidente = req.user ? req.user.id : "00000000-0000-0000-0000-000000000000"; // Mock si no hay req.user

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const rubro = await tx.rubro.findUnique({
        where: { id: idRubro },
        include: { proyecto: true }
      });

      if (!rubro || rubro.idProyecto !== idProyecto) {
        throw new Error('VALIDATION_ERROR: Rubro o Proyecto no encontrado / mismatch.');
      }

      const avanceAcumulado = parseFloat(rubro.cantidadEjecutada) || 0;
      const parsedCantidad = parseFloat(cantidadEjecutada);
      const nuevoTotal = avanceAcumulado + parsedCantidad;
      const presupuestado = parseFloat(rubro.cantidadPresupuestada);

      console.log(`[AvanceController] Intento de registro: Acumulado=${avanceAcumulado}, A agregar=${parsedCantidad}, Total=${nuevoTotal}, Presupuesto=${presupuestado}`);

      // (Actividad 3) Validación de Presupuesto Central
      if (nuevoTotal > presupuestado) {
        console.error('[AvanceController] Rechazado: Supera el presupuesto.');
        throw new Error('BUDGET_EXCEEDED: El avance supera el presupuesto. Requiere Orden de Cambio.');
      }

      const nuevoAvance = await tx.avanceObra.create({
        data: {
          idRubro,
          idProyecto,
          idResidente, // Requerido por esquema
          cantidadAvance: parseFloat(cantidadEjecutada),
          notas: observaciones,
          fechaRegistro: new Date(fechaRegistro || Date.now()),
          estado: 'VALIDATED'
        }
      });

      await tx.rubro.update({
        where: { id: idRubro },
        data: { cantidadEjecutada: nuevoTotal }
      });

      return nuevoAvance;
    });

    res.status(201).json({ success: true, data: resultado, message: 'Avance registrado correctamente.' });

  } catch (error) {
    if (error.message.includes('BUDGET_EXCEEDED')) {
      return res.status(403).json({ 
        success: false, 
        code: 'REQUIRES_CHANGE_ORDER',
        message: 'El avance reportado supera el presupuesto establecido para este rubro. Se requiere generar una Orden de Cambio.' 
      });
    }
    if (error.message.includes('VALIDATION_ERROR')) {
        return res.status(400).json({ success: false, message: error.message });
    }
    
    console.error('Error al registrar avance:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.', error: error.message });
  }
};
const getAvancesPorRubro = async (req, res) => {
  try {
    const { idRubro } = req.params;
    const avances = await prisma.avanceObra.findMany({
      where: { idRubro },
      orderBy: { fechaRegistro: 'desc' },
      include: {
        residente: { select: { nombre: true, apellido: true } }
      }
    });
    res.status(200).json({ success: true, data: avances });
  } catch (error) {
    console.error('Error al obtener avances:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el historial de avances.' });
  }
};

module.exports = { registrarAvanceFisico, getAvancesPorRubro };
