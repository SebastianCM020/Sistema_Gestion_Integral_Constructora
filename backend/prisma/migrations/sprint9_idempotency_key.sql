-- ─────────────────────────────────────────────────────────────────────────────
-- Sprint 9: Migración de base de datos
-- Añade el campo idempotency_key a movimiento_inventario
-- para prevenir duplicación en sincronización offline.
--
-- HU-S9-4: El idempotencyKey es un UUID v4 generado por el cliente.
-- Si el servidor ya procesó ese UUID, retorna el resultado original (HTTP 200).
-- ─────────────────────────────────────────────────────────────────────────────

-- Añadir la columna (opcional, puede ser NULL para movimientos anteriores)
ALTER TABLE movimiento_inventario
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(36) UNIQUE;

-- Índice para búsqueda rápida por clave de idempotencia
CREATE UNIQUE INDEX IF NOT EXISTS idx_movimiento_idempotency_key
  ON movimiento_inventario (idempotency_key)
  WHERE idempotency_key IS NOT NULL;
