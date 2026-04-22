#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# entrypoint.sh — Backend ICARO
# 1. Aplica migraciones de Prisma pendientes (idempotente)
# 2. Ejecuta seed si la tabla 'roles' está vacía
# 3. Levanta el servidor con nodemon
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo ">>> [ICARO] Aplicando migraciones Prisma..."
npx prisma migrate deploy

echo ">>> [ICARO] Verificando si la BD necesita seed..."
ROLE_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.rol.count().then(n => { console.log(n); p.\$disconnect(); }).catch(() => { console.log(0); p.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$ROLE_COUNT" = "0" ]; then
  echo ">>> [ICARO] BD vacía, ejecutando seed..."
  npx prisma db seed
else
  echo ">>> [ICARO] BD ya inicializada ($ROLE_COUNT roles encontrados). Omitiendo seed."
fi

echo ">>> [ICARO] Iniciando servidor..."
exec npm run dev
