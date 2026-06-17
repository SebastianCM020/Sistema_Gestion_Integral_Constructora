-- ============================================================================
-- SPRINT 10 — Migración Base de Datos
-- Sistema ICARO CONSTRUCTORES BMGM S.A.S.
-- Actividades: Consolidación, Validación Pre-cierre, Cierre Mensual, Auditoría
-- Autor: Sistema Antigravity — Sprint 10
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: consolidacion_mensual
-- Guarda el snapshot contable-operativo generado durante el cierre.
-- Relacionada con cierre_mensual (1:1).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "consolidacion_mensual" (
    "id"                     UUID          NOT NULL,
    "id_cierre"              UUID          NOT NULL,
    "id_proyecto"            UUID          NOT NULL,
    "mes_anio"               VARCHAR(7)    NOT NULL,  -- formato "YYYY-MM"

    -- Avances de obra en el periodo
    "total_avance_qty"       DECIMAL(14,4) NOT NULL DEFAULT 0,
    "total_avance_monto"     DECIMAL(14,2) NOT NULL DEFAULT 0,
    "rubros_ejecutados"      INTEGER       NOT NULL DEFAULT 0,

    -- Compras / Requerimientos aprobados
    "total_requerimientos"   INTEGER       NOT NULL DEFAULT 0,
    "total_compras_monto"    DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_recepciones"      INTEGER       NOT NULL DEFAULT 0,

    -- Consumos en obra
    "total_consumos_qty"     DECIMAL(14,4) NOT NULL DEFAULT 0,
    "total_consumos_monto"   DECIMAL(14,2) NOT NULL DEFAULT 0,

    -- Snapshot JSON del inventario al momento del cierre
    "snapshot_inventario"    JSONB,

    -- Porcentaje de avance global del proyecto
    "porcentaje_avance"      DECIMAL(5,2)  NOT NULL DEFAULT 0,

    -- Metadata
    "generado_por"           UUID          NOT NULL,
    "generado_en"            TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hash_payload"           VARCHAR(64),   -- SHA-256 del JSON de consolidación

    CONSTRAINT "consolidacion_mensual_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "consolidacion_mensual_id_cierre_fkey"
        FOREIGN KEY ("id_cierre") REFERENCES "cierre_mensual"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "consolidacion_mensual_id_proyecto_fkey"
        FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "consolidacion_mensual_generado_por_fkey"
        FOREIGN KEY ("generado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "consolidacion_mensual_uq_cierre" UNIQUE ("id_cierre")  -- un cierre → una consolidación
);

CREATE INDEX IF NOT EXISTS "consolidacion_mensual_proyecto_mes_idx"
    ON "consolidacion_mensual"("id_proyecto", "mes_anio");

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: validacion_pre_cierre
-- Registra cada intento de validación (auditable), con los errores encontrados.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "validacion_pre_cierre" (
    "id"             UUID        NOT NULL,
    "id_proyecto"    UUID        NOT NULL,
    "mes_anio"       VARCHAR(7)  NOT NULL,
    -- 'OK' = puede proceder al cierre | 'BLOQUEADO' = hay inconsistencias
    "estado"         VARCHAR(10) NOT NULL DEFAULT 'PENDIENTE',
    -- JSON array de objetos { codigo, descripcion, tipo: 'ERROR'|'ADVERTENCIA' }
    "errores"        JSONB,
    "ejecutado_por"  UUID        NOT NULL,
    "ejecutado_en"   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validacion_pre_cierre_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "validacion_pre_cierre_id_proyecto_fkey"
        FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "validacion_pre_cierre_ejecutado_por_fkey"
        FOREIGN KEY ("ejecutado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "validacion_pre_cierre_proyecto_mes_idx"
    ON "validacion_pre_cierre"("id_proyecto", "mes_anio");

-- ─────────────────────────────────────────────────────────────────────────────
-- INMUTABILIDAD audit_log — RULES de PostgreSQL
-- Previene DELETE y UPDATE directos sobre la tabla de auditoría a nivel de BD.
-- Esto garantiza que ni siquiera un DBA pueda alterar el historial sin un DROP RULE.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    -- Regla: bloquear DELETE en audit_log
    IF NOT EXISTS (
        SELECT 1 FROM pg_rules
        WHERE tablename = 'audit_log' AND rulename = 'audit_log_no_delete'
    ) THEN
        EXECUTE 'CREATE RULE audit_log_no_delete AS ON DELETE TO "audit_log" DO INSTEAD NOTHING';
    END IF;

    -- Regla: bloquear UPDATE en audit_log
    IF NOT EXISTS (
        SELECT 1 FROM pg_rules
        WHERE tablename = 'audit_log' AND rulename = 'audit_log_no_update'
    ) THEN
        EXECUTE 'CREATE RULE audit_log_no_update AS ON UPDATE TO "audit_log" DO INSTEAD NOTHING';
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CAMPO adicional en audit_log: modulo
-- Permite filtrar los logs por módulo del sistema (cierre, compras, bodega…)
-- Se agrega con IF NOT EXISTS para ser idempotente.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "audit_log"
    ADD COLUMN IF NOT EXISTS "modulo" VARCHAR(60);

-- Índices de rendimiento para el módulo de auditoría
CREATE INDEX IF NOT EXISTS "audit_log_timestamp_idx" ON "audit_log"("timestamp" DESC);
CREATE INDEX IF NOT EXISTS "audit_log_id_usuario_idx" ON "audit_log"("id_usuario");
CREATE INDEX IF NOT EXISTS "audit_log_tabla_idx"     ON "audit_log"("tabla");
CREATE INDEX IF NOT EXISTS "audit_log_modulo_idx"    ON "audit_log"("modulo");

-- ─────────────────────────────────────────────────────────────────────────────
-- ÍNDICE único en cierre_mensual: un proyecto solo puede tener un cierre
-- ABIERTO por mes (el CERRADO puede coexistir al ser historial).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS "cierre_mensual_uq_abierto"
    ON "cierre_mensual"("id_proyecto", "mes_anio")
    WHERE "estado_cierre" = 'ABIERTO';

-- ============================================================================
-- FIN MIGRACIÓN SPRINT 10
-- ============================================================================
