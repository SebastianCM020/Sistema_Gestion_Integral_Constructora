const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  console.log("Requirements in APROBADO state:");
  const reqs = await p.requerimientoCompra.findMany({ 
    where: { estado: 'APROBADO' },
    include: { proyecto: true }
  });
  console.log(JSON.stringify(reqs, null, 2));
}

run().catch(console.error).finally(() => p.$disconnect());
