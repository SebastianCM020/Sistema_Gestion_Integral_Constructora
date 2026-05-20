const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Sincronizando roles canonicales y usuarios...');

  // 1. Roles
  const roles = [
    'Administrador del Sistema',
    'Presidente / Gerente',
    'Contador',
    'Auxiliar de Contabilidad',
    'Residente',
    'Bodeguero'
  ];

  const roleMap = {};
  for (const name of roles) {
    const rol = await prisma.rol.upsert({
      where: { nombre: name },
      update: {},
      create: { nombre: name, descripcion: `Rol ${name}` }
    });
    roleMap[name] = rol.id;
  }
  console.log('✅ Roles sincronizados:', roleMap);

  // 2. Usuarios
  const hash = await bcrypt.hash('Icaro2025!', 10);

  const usuariosData = [
    { nombre: 'Gerente', apellido: 'Pérez', email: 'gerente@icaro.dev', rol: 'Presidente / Gerente' },
    { nombre: 'Residente', apellido: 'Gómez', email: 'residente@icaro.dev', rol: 'Residente' },
    { nombre: 'Auxiliar', apellido: 'Sánchez', email: 'auxiliar@icaro.dev', rol: 'Auxiliar de Contabilidad' },
    { nombre: 'Bodeguero', apellido: 'Mendoza', email: 'bodeguero@icaro.dev', rol: 'Bodeguero' },
  ];

  const userMap = {};
  for (const usr of usuariosData) {
    const dbUser = await prisma.usuario.upsert({
      where: { email: usr.email },
      update: { idRol: roleMap[usr.rol] },
      create: {
        nombre: usr.nombre,
        apellido: usr.apellido,
        email: usr.email,
        passwordHash: hash,
        idRol: roleMap[usr.rol],
        activo: true
      }
    });
    userMap[usr.nombre] = dbUser.id;
  }
  console.log('✅ Usuarios creados/actualizados:', userMap);

  // 3. Proyectos
  console.log('🔄 Buscando o creando proyecto de prueba...');
  let project = await prisma.proyecto.findFirst();
  if (!project) {
    project = await prisma.proyecto.create({
      data: {
        codigo: 'PRJ-TEST-001',
        nombre: 'Proyecto Test Central',
        descripcion: 'Proyecto central de pruebas integradas',
        presupuestoTotal: 150000.00,
        fechaInicio: new Date(),
        fechaFinPrevista: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        estado: 'ACTIVO'
      }
    });
  }
  console.log('✅ Proyecto activo:', project.codigo, project.id);

  // 4. Asignar Residente al proyecto
  const asignacionExistente = await prisma.asignacionProyectoUsuario.findFirst({
    where: { idUsuario: userMap['Residente'], idProyecto: project.id }
  });
  if (!asignacionExistente) {
    await prisma.asignacionProyectoUsuario.create({
      data: {
        idUsuario: userMap['Residente'],
        idProyecto: project.id,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        accessMode: 'READ_WRITE'
      }
    });
    console.log('✅ Residente asignado al proyecto.');
  }

  // 5. Materiales
  console.log('🔄 Sincronizando materiales catálogo...');
  const materialesData = [
    { codigo: 'MAT-CEM-001', nombre: 'Cemento Portland Tipo I', categoria: 'General', unidad: 'unidad' },
    { codigo: 'MAT-ARE-002', nombre: 'Arena Fina Lavada', categoria: 'General', unidad: 'unidad' },
    { codigo: 'MAT-VAR-003', nombre: 'Varilla de Acero 12mm', categoria: 'General', unidad: 'unidad' }
  ];

  const materials = [];
  for (const mat of materialesData) {
    const dbMat = await prisma.material.upsert({
      where: { codigo: mat.codigo },
      update: { activo: true },
      create: { ...mat, activo: true }
    });
    materials.push(dbMat);
  }
  console.log('✅ Catálogo de materiales listo.');

  // 6. Insertar solicitudes de revisión (EN_REVISION)
  console.log('🔄 Creando requerimientos en revisión para pruebas...');
  const countReqs = await prisma.requerimientoCompra.count({
    where: { estado: 'EN_REVISION', idProyecto: project.id }
  });

  if (countReqs === 0) {
    await prisma.requerimientoCompra.create({
      data: {
        idProyecto: project.id,
        idSolicitante: userMap['Residente'],
        estado: 'EN_REVISION',
        justificacion: 'Material urgente para fundición de losa del segundo piso.',
        detalles: {
          create: [
            { idMaterial: materials[0].id, cantidadSolicitada: 50 },
            { idMaterial: materials[1].id, cantidadSolicitada: 10 }
          ]
        }
      }
    });

    await prisma.requerimientoCompra.create({
      data: {
        idProyecto: project.id,
        idSolicitante: userMap['Residente'],
        estado: 'EN_REVISION',
        justificacion: 'Estructuras de refuerzo de acero para vigas de cimentación.',
        detalles: {
          create: [
            { idMaterial: materials[2].id, cantidadSolicitada: 120 }
          ]
        }
      }
    });

    console.log('✅ Requerimientos EN_REVISION insertados exitosamente.');
  } else {
    console.log('ℹ️ Ya existen requerimientos EN_REVISION en la BD.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
