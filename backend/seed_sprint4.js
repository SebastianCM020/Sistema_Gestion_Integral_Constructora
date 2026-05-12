const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inicializando datos para Sprint 4 (Proyectos, Rubros, Residente)...');

  // 1. Obtener o crear Rol Residente
  const rolResidente = await prisma.rol.upsert({
    where: { nombre: 'Residente' },
    update: {},
    create: { nombre: 'Residente', descripcion: 'Registra avances de obra' }
  });

  // 2. Crear un usuario Residente
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('residente123', salt);

  const residente = await prisma.usuario.upsert({
    where: { email: 'residente@icaro.dev' },
    update: {},
    create: {
      nombre: 'Carlos',
      apellido: 'Residente',
      email: 'residente@icaro.dev',
      passwordHash: hash,
      idRol: rolResidente.id,
      activo: true
    }
  });
  console.log('✅ Residente creado: residente@icaro.dev / residente123');

  // 3. Crear Proyecto de prueba
  const proyecto = await prisma.proyecto.upsert({
    where: { codigo: 'PRJ-001' },
    update: {},
    create: {
      codigo: 'PRJ-001',
      nombre: 'Edificio Residencial Las Palmas',
      descripcion: 'Construcción de 5 pisos',
      presupuestoTotal: 150000.00,
      fechaInicio: new Date('2026-01-01'),
      fechaFinPrevista: new Date('2026-12-31'),
      estado: 'ACTIVO'
    }
  });
  console.log('✅ Proyecto creado:', proyecto.codigo);

  // 4. Asignar Residente al Proyecto
  const existeAsignacion = await prisma.asignacionProyectoUsuario.findFirst({
    where: { idUsuario: residente.id, idProyecto: proyecto.id }
  });

  if (!existeAsignacion) {
    await prisma.asignacionProyectoUsuario.create({
      data: {
        idUsuario: residente.id,
        idProyecto: proyecto.id,
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-12-31'),
        accessMode: 'READ_WRITE'
      }
    });
    console.log('✅ Residente asignado a la obra.');
  } else {
    console.log('✅ El Residente ya estaba asignado a la obra.');
  }

  // 5. Crear Rubros
  const rubrosData = [
    { codigo: 'RUB-01', descripcion: 'Excavación manual', unidad: 'm3', precioUnitario: 15.5, cantidadPresupuestada: 100 },
    { codigo: 'RUB-02', descripcion: 'Hormigón simple', unidad: 'm3', precioUnitario: 120.0, cantidadPresupuestada: 50 },
    { codigo: 'RUB-03', descripcion: 'Acero de refuerzo', unidad: 'kg', precioUnitario: 1.2, cantidadPresupuestada: 2000 }
  ];

  for (const r of rubrosData) {
    const existe = await prisma.rubro.findFirst({ where: { idProyecto: proyecto.id, codigo: r.codigo }});
    if (!existe) {
      await prisma.rubro.create({
        data: {
          ...r,
          idProyecto: proyecto.id
        }
      });
    }
  }
  console.log('✅ Rubros iniciales de prueba creados.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
