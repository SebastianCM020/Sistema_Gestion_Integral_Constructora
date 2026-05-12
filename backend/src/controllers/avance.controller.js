const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logFromRequest } = require('../services/audit.service');
const storageService = require('../services/storage.service');

const registrarAvanceFisico = async (req, res) => {
  const { idProyecto, idRubro, cantidadEjecutada, observaciones, fechaRegistro } = req.body;
  const idResidente = req.user ? req.user.id : "00000000-0000-0000-0000-000000000000";
  const archivoEvidencia = req.file;

  try {
    // 1. Validación de Evidencia (Obligatoria en Sprint 5)
    if (!archivoEvidencia) {
      return res.status(400).json({ 
        success: false, 
        message: 'La evidencia fotográfica es obligatoria para registrar un avance.' 
      });
    }

    // Validar formato y tamaño usando el servicio
    storageService.validateImage(archivoEvidencia.mimetype, archivoEvidencia.size);

    const resultado = await prisma.$transaction(async (tx) => {
      // 2. Buscar rubro y verificar proyecto
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

      // 3. Validación de Presupuesto Central
      if (nuevoTotal > presupuestado) {
        throw new Error('BUDGET_EXCEEDED: El avance supera el presupuesto.');
      }

      // 4. Guardar archivo físicamente
      const uploadResult = await storageService.uploadFile(
        archivoEvidencia.buffer,
        archivoEvidencia.originalname,
        'evidencias'
      );

      // 5. Crear el registro de Avance
      const nuevoAvance = await tx.avanceObra.create({
        data: {
          idRubro,
          idProyecto,
          idResidente,
          cantidadAvance: parsedCantidad,
          notas: observaciones,
          fechaRegistro: new Date(fechaRegistro || Date.now()),
          estado: 'SYNCED', // Ya está en el servidor
          // 6. Crear la asociación de evidencia
          evidencias: {
            create: {
              urlImagen: uploadResult.url,
              storageKey: uploadResult.storageKey,
              sizeBytes: uploadResult.size,
              mimeType: archivoEvidencia.mimetype,
              timestampCaptura: new Date()
            }
          }
        },
        include: { evidencias: true }
      });

      // 7. Actualizar el acumulado en Rubro
      await tx.rubro.update({
        where: { id: idRubro },
        data: { cantidadEjecutada: nuevoTotal }
      });

      return nuevoAvance;
    });

    res.status(201).json({ success: true, data: resultado, message: 'Avance y evidencia registrados correctamente.' });

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
