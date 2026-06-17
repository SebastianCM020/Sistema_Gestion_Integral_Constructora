const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './.env' });

async function run() {
  const bodeguero = await prisma.usuario.findFirst({
    where: { email: 'bodeguero@icaro.dev' },
    include: { rol: true }
  });
  
  if (!bodeguero) {
    console.log("No se encontro bodeguero@icaro.dev");
    return;
  }
  
  const token = jwt.sign(
    { id: bodeguero.id, rol: bodeguero.rol.nombre, email: bodeguero.email },
    process.env.JWT_SECRET || 'secret'
  );
  
  console.log("Token", token);
  
  const res = await fetch('http://localhost:3000/api/v1/proyectos', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.json();
  console.log("API Proyectos:", data.data ? data.data.length : data);
}

run().finally(() => prisma.$disconnect());
