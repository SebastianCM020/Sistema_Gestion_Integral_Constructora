const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.rol.findMany().then(console.log).finally(() => prisma.$disconnect());
