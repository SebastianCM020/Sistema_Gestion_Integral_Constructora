const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando población global de rubros y asignaciones...');

  const residenteEmail = 'ivan.santiago@icaro.dev';
  const password = 'admin';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // 1. Asegurar que el usuario existe y tiene la contraseña correcta
  const residente = await prisma.usuario.upsert({
    where: { email: residenteEmail },
    update: { passwordHash: hash, activo: true },
    create: {
      nombre: 'Ivan',
      apellido: 'Santiago',
      email: residenteEmail,
      passwordHash: hash,
      idRol: 5, // Residente
      activo: true
    }
  });
  console.log(`✅ Usuario ${residenteEmail} actualizado/creado con éxito. Contraseña: ${password}`);

  // 2. Obtener todos los proyectos
  const proyectos = await prisma.proyecto.findMany();
  console.log(`📂 Encontrados ${proyectos.length} proyectos.`);

  const hoy = new Date();
  const fechaInicio = new Date('2026-01-01');
  const fechaFin = new Date('2026-12-31');

  for (const proyecto of proyectos) {
    console.log(`🔧 Procesando proyecto: ${proyecto.nombre} (${proyecto.codigo})`);

    // 3. Crear asignación para el residente
    await prisma.asignacionProyectoUsuario.upsert({
      where: {
        id: `asig-${proyecto.codigo}-${residente.id}`.slice(0, 36) // Intento de ID estable
      },
      update: { fechaInicio, fechaFin },
      create: {
        idUsuario: residente.id,
        idProyecto: proyecto.id,
        fechaInicio,
        fechaFin,
        accessMode: 'READ_WRITE'
      }
    }).catch(async () => {
        // Si el upsert falla por el ID custom, intentamos buscar y actualizar o crear
        const exist = await prisma.asignacionProyectoUsuario.findFirst({
            where: { idUsuario: residente.id, idProyecto: proyecto.id }
        });
        if (exist) {
            await prisma.asignacionProyectoUsuario.update({
                where: { id: exist.id },
                data: { fechaInicio, fechaFin }
            });
        } else {
            await prisma.asignacionProyectoUsuario.create({
                data: {
                    idUsuario: residente.id,
                    idProyecto: proyecto.id,
                    fechaInicio,
                    fechaFin,
                    accessMode: 'READ_WRITE'
                }
            });
        }
    });

    // 4. Agregar rubros si no tiene
    const rubrosCount = await prisma.rubro.count({ where: { idProyecto: proyecto.id } });
    if (rubrosCount === 0) {
      const sampleRubros = [
        { codigo: 'R-001', descripcion: 'Limpieza y Descapote', unidad: 'm2', precioUnitario: 15.50, cantidadPresupuestada: 1000 },
        { codigo: 'R-002', descripcion: 'Excavación Manual', unidad: 'm3', precioUnitario: 45.00, cantidadPresupuestada: 500 },
        { codigo: 'R-003', descripcion: 'Hormigón de Cimentación', unidad: 'm3', precioUnitario: 220.00, cantidadPresupuestada: 200 },
        { codigo: 'R-004', descripcion: 'Acero de Refuerzo', unidad: 'kg', precioUnitario: 3.80, cantidadPresupuestada: 5000 },
        { codigo: 'R-005', descripcion: 'Mampostería de Bloque', unidad: 'm2', precioUnitario: 28.00, cantidadPresupuestada: 800 }
      ];

      await prisma.rubro.createMany({
        data: sampleRubros.map(r => ({ ...r, idProyecto: proyecto.id }))
      });
      console.log(`   ✅ Se agregaron 5 rubros al proyecto.`);
    } else {
      console.log(`   ℹ️ El proyecto ya tiene ${rubrosCount} rubros.`);
    }
  }

  console.log('✨ Proceso completado.');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
