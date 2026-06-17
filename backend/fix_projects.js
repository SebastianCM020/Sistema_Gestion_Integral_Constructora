const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.proyecto.updateMany({
  where: { estado: 'ACTIVE' },
  data: { estado: 'ACTIVO' }
}).then(res => console.log('Updated:', res)).finally(() => p.$disconnect());
