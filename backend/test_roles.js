const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.rol.findMany().then(roles => {
  console.log(roles);
}).catch(console.error).finally(() => p.$disconnect());
