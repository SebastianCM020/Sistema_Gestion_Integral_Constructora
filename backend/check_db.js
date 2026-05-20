const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuario.findMany({
    include: { rol: true }
  });
  const asignaciones = await prisma.asignacionProyectoUsuario.findMany({
    include: {
      proyecto: true,
      usuario: true
    }
  });
  console.log('--- USUARIOS EN BD ---');
  console.log(JSON.stringify(users.map(u => ({ id: u.id, email: u.email, rol: u.rol?.nombre, nombre: u.nombre })), null, 2));
  console.log('--- ASIGNACIONES EN BD ---');
  console.log(JSON.stringify(asignaciones.map(a => ({
    id: a.id,
    proyectoCodigo: a.proyecto?.codigo,
    proyectoNombre: a.proyecto?.nombre,
    usuarioEmail: a.usuario?.email,
    fechaInicio: a.fechaInicio,
    fechaFin: a.fechaFin,
    accessMode: a.accessMode
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
