const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando DB Seeding...');

  // 1. Crear Roles según la documentación oficial
  const rolesData = [
    { nombre: 'Administrador', descripcion: 'Control total del sistema' },
    { nombre: 'Superintendente', descripcion: 'Valida avances y aprueba requerimientos' },
    { nombre: 'Residente', descripcion: 'Registra avances de obra' },
    { nombre: 'Bodeguero', descripcion: 'Controla inventario y emite requerimientos' },
    { nombre: 'Contador', descripcion: 'Genera planillas y cierre de caja' }
  ];

  for (const r of rolesData) {
    await prisma.rol.upsert({
      where: { nombre: r.nombre },
      update: {},
      create: r,
    });
  }
  console.log('✅ Roles predeterminados creados.');

  // 2. Crear un usuario Administrador de prueba
  const adminRol = await prisma.rol.findUnique({ where: { nombre: 'Administrador' } });
  
  if (adminRol) {
    const defaultPassword = 'admin'; // Contraseña temporal
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(defaultPassword, salt);

    const adminUser = await prisma.usuario.upsert({
      where: { email: 'admin@icaro.dev' },
      update: {},
      create: {
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@icaro.dev',
        passwordHash: hash,
        idRol: adminRol.id,
        activo: true
      },
    });
    console.log(`✅ Usuario Administrador inicializado: ${adminUser.email} / pass: ${defaultPassword}`);

    // Insertar cuenta Oficial de Isaac
    const isaaUser = await prisma.usuario.upsert({
      where: { email: 'isaac.castro@espoch.edu.ec' },
      update: {},
      create: {
        nombre: 'Isaac',
        apellido: 'Castro',
        email: 'isaac.castro@espoch.edu.ec',
        passwordHash: hash, // Mismo default 'admin'
        idRol: adminRol.id,
        activo: true
      },
    });
    console.log(`✅ Cuenta Autorizada: ${isaaUser.email} / pass: ${defaultPassword}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en DB Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
