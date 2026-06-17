const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.usuario.findMany({ select: { email: true, rol: { select: { nombre: true } } } })
.then(res => console.log(res))
.catch(console.error)
.finally(() => p.$disconnect());
