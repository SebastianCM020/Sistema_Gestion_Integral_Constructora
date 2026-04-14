#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# init-db.sh
# Se ejecuta automáticamente por Docker al crear el contenedor de PostgreSQL
# por primera vez. Restaura el dump personalizado con pg_restore.
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo ">>> [ICARO] Restaurando esquema desde base.dump en la base Icaro_System..."

pg_restore \
  --username="$POSTGRES_USER" \
  --dbname="$POSTGRES_DB" \
  --no-password \
  --verbose \
  --clean \
  --if-exists \
  /docker-entrypoint-initdb.d/base.dump || true

echo ">>> [ICARO] Restauración completada."

