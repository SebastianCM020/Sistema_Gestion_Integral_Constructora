-- ============================================================
-- SPRINT 7 - MIGRACIÓN POSTGRESQL
-- Sistema ICARO CONSTRUCTORES BMGM S.A.S.
-- ============================================================
-- Ejecutar en orden secuencial dentro de una transacción.
-- Compatible con el esquema generado por Prisma (schema.prisma).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. TABLA: ordenes_cambio
--    Soporta la Actividad 4: Validación de excedente de avance
--    con orden aprobada como condición habilitante.
--
--    estados: PENDIENTE | APROBADA | RECHAZADA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ordenes_cambio" (
  "id"              UUID         NOT NULL DEFAULT gen_random_uuid(),
  "id_proyecto"     UUID         NOT NULL,
  "id_rubro"        UUID         NOT NULL,
  "id_solicitante"  UUID         NOT NULL,
  "id_aprobador"    UUID,
  "estado"          VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE',
  "motivo"          TEXT         NOT NULL,
  "cantidad_adicional" DECIMAL(12,4) NOT NULL,
  "comentario_aprobador" TEXT,
  "fecha_solicitud" TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fecha_resolucion" TIMESTAMPTZ,
  "created_at"      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ordenes_cambio_pkey"            PRIMARY KEY ("id"),
  CONSTRAINT "ordenes_cambio_proyecto_fkey"   FOREIGN KEY ("id_proyecto")    REFERENCES "proyectos"("id"),
  CONSTRAINT "ordenes_cambio_rubro_fkey"      FOREIGN KEY ("id_rubro")       REFERENCES "rubros"("id"),
  CONSTRAINT "ordenes_cambio_solicitante_fkey" FOREIGN KEY ("id_solicitante") REFERENCES "usuarios"("id"),
  CONSTRAINT "ordenes_cambio_aprobador_fkey"  FOREIGN KEY ("id_aprobador")   REFERENCES "usuarios"("id"),
  CONSTRAINT "ordenes_cambio_estado_chk"      CHECK ("estado" IN ('PENDIENTE','APROBADA','RECHAZADA')),
  CONSTRAINT "ordenes_cambio_cantidad_pos_chk" CHECK ("cantidad_adicional" > 0)
);

-- Índice para consulta rápida por rubro + estado (CA Actividad 4)
CREATE INDEX IF NOT EXISTS "idx_ordenes_cambio_rubro_estado"
  ON "ordenes_cambio" ("id_rubro", "estado");

CREATE INDEX IF NOT EXISTS "idx_ordenes_cambio_proyecto"
  ON "ordenes_cambio" ("id_proyecto");

-- ------------------------------------------------------------
-- 2. TABLA: notificaciones_sistema
--    Persiste alertas internas para la bandeja gerencial y
--    para el solicitante del requerimiento (aprobado/rechazado).
--
--    tipo: REQUERIMIENTO_CREADO | APROBADO | RECHAZADO |
--          RECIBIDO | ORDEN_CAMBIO
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "notificaciones_sistema" (
  "id"              UUID         NOT NULL DEFAULT gen_random_uuid(),
  "id_usuario_dest" UUID         NOT NULL,   -- destinatario
  "tipo"            VARCHAR(40)  NOT NULL,
  "titulo"          VARCHAR(200) NOT NULL,
  "mensaje"         TEXT         NOT NULL,
  "id_referencia"   UUID,                    -- UUID del req/orden referenciado
  "tabla_referencia" VARCHAR(60),            -- 'requerimiento_compra' | 'ordenes_cambio'
  "leida"           BOOLEAN      NOT NULL DEFAULT FALSE,
  "created_at"      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notificaciones_sistema_pkey"  PRIMARY KEY ("id"),
  CONSTRAINT "notificaciones_usuario_fkey"  FOREIGN KEY ("id_usuario_dest") REFERENCES "usuarios"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_notif_usuario_leida"
  ON "notificaciones_sistema" ("id_usuario_dest", "leida", "created_at" DESC);

-- ------------------------------------------------------------
-- 3. FUNCIÓN + TRIGGER: bloquear_reprocesamiento_requerimiento
--    Activa 4 → CA: estados APROBADO / RECHAZADO son finales
--    en requerimiento_compra. Solo RECIBIDO puede venir de APROBADO
--    (lo gestiona bodega).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION bloquear_reprocesamiento_requerimiento()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  -- Estado RECHAZADO: absolutamente final, no se puede regresar a ningún otro estado
  IF OLD.estado = 'RECHAZADO' THEN
    RAISE EXCEPTION
      'REPROCESAMIENTO_BLOQUEADO: El requerimiento % ya está RECHAZADO y no puede modificarse.',
      OLD.id
      USING ERRCODE = 'P0001';
  END IF;

  -- Estado APROBADO: solo puede avanzar a RECIBIDO (transición de bodega)
  IF OLD.estado = 'APROBADO' AND NEW.estado NOT IN ('RECIBIDO') THEN
    RAISE EXCEPTION
      'REPROCESAMIENTO_BLOQUEADO: Un requerimiento APROBADO solo puede pasar a RECIBIDO. Transición solicitada: % → %.',
      OLD.estado, NEW.estado
      USING ERRCODE = 'P0001';
  END IF;

  -- Estado RECIBIDO: absolutamente final
  IF OLD.estado = 'RECIBIDO' THEN
    RAISE EXCEPTION
      'REPROCESAMIENTO_BLOQUEADO: El requerimiento % ya está en estado RECIBIDO (estado final).',
      OLD.id
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bloquear_reprocesamiento ON "requerimiento_compra";
CREATE TRIGGER trg_bloquear_reprocesamiento
  BEFORE UPDATE OF "estado" ON "requerimiento_compra"
  FOR EACH ROW
  EXECUTE FUNCTION bloquear_reprocesamiento_requerimiento();

-- ------------------------------------------------------------
-- 4. FUNCIÓN + TRIGGER: notificar_decision_requerimiento
--    CA Actividad 2: Al aprobar/rechazar se notifica al solicitante.
--    Inserta una fila en notificaciones_sistema para el solicitante.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION notificar_decision_requerimiento()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_titulo  TEXT;
  v_mensaje TEXT;
BEGIN
  -- Solo disparar cuando el estado realmente cambia a APROBADO o RECHAZADO
  IF NEW.estado = OLD.estado THEN
    RETURN NEW;
  END IF;

  IF NEW.estado = 'APROBADO' THEN
    v_titulo  := 'Requerimiento Aprobado ✓';
    v_mensaje := format(
      'Tu requerimiento de compra ha sido APROBADO. Los materiales serán enviados a bodega.',
      NEW.id
    );
  ELSIF NEW.estado = 'RECHAZADO' THEN
    v_titulo  := 'Requerimiento Rechazado';
    v_mensaje := format(
      'Tu requerimiento de compra fue RECHAZADO. Motivo: %s',
      COALESCE(NEW.comentario_rechazo, 'Sin comentario registrado.')
    );
  ELSE
    RETURN NEW; -- no notificar para otras transiciones (ej: RECIBIDO lo maneja bodega)
  END IF;

  INSERT INTO "notificaciones_sistema" (
    "id_usuario_dest",
    "tipo",
    "titulo",
    "mensaje",
    "id_referencia",
    "tabla_referencia"
  ) VALUES (
    NEW.id_solicitante,
    NEW.estado,                     -- 'APROBADO' | 'RECHAZADO'
    v_titulo,
    v_mensaje,
    NEW.id,
    'requerimiento_compra'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notificar_decision ON "requerimiento_compra";
CREATE TRIGGER trg_notificar_decision
  AFTER UPDATE OF "estado" ON "requerimiento_compra"
  FOR EACH ROW
  EXECUTE FUNCTION notificar_decision_requerimiento();

-- ------------------------------------------------------------
-- 5. FUNCIÓN: validar_excedente_con_orden_cambio
--    CA Actividad 4: Un avance que supera la cantidad presupuestada
--    de un rubro solo se permite si existe una orden_cambio APROBADA
--    vigente para ese rubro que cubra el excedente.
--
--    Retorna JSONB con { permitido: bool, margen_disponible: numeric,
--                        id_orden: uuid }
--    Se invoca desde la capa de aplicación (avance.controller.js).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION validar_excedente_con_orden_cambio(
  p_id_rubro         UUID,
  p_cantidad_avance  DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql AS $$
DECLARE
  v_rubro             RECORD;
  v_orden             RECORD;
  v_ejecutado_total   DECIMAL;
  v_nuevo_total       DECIMAL;
  v_margen            DECIMAL;
BEGIN
  -- 1. Obtener el rubro con su presupuesto
  SELECT id, cantidad_presupuestada, cantidad_ejecutada
    INTO v_rubro
    FROM rubros
   WHERE id = p_id_rubro;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Rubro no encontrado', 'permitido', false);
  END IF;

  v_ejecutado_total := COALESCE(v_rubro.cantidad_ejecutada, 0);
  v_nuevo_total     := v_ejecutado_total + p_cantidad_avance;

  -- 2. Si no hay excedente, permitir directamente
  IF v_nuevo_total <= v_rubro.cantidad_presupuestada THEN
    RETURN jsonb_build_object(
      'permitido',         true,
      'excedente',         false,
      'margen_disponible', v_rubro.cantidad_presupuestada - v_ejecutado_total,
      'id_orden',          NULL
    );
  END IF;

  -- 3. Hay excedente: buscar orden de cambio APROBADA vigente para el rubro
  SELECT id, cantidad_adicional
    INTO v_orden
    FROM ordenes_cambio
   WHERE id_rubro = p_id_rubro
     AND estado   = 'APROBADA'
   ORDER BY fecha_resolucion DESC
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'permitido',         false,
      'excedente',         true,
      'margen_disponible', 0,
      'id_orden',          NULL,
      'mensaje',           'Excedente presupuestal sin orden de cambio aprobada. Genere una Orden de Cambio.'
    );
  END IF;

  -- 4. Calcular el margen disponible con la orden de cambio
  v_margen := (v_rubro.cantidad_presupuestada + v_orden.cantidad_adicional) - v_ejecutado_total;

  IF p_cantidad_avance <= v_margen THEN
    RETURN jsonb_build_object(
      'permitido',         true,
      'excedente',         true,
      'margen_disponible', v_margen,
      'id_orden',          v_orden.id
    );
  ELSE
    RETURN jsonb_build_object(
      'permitido',         false,
      'excedente',         true,
      'margen_disponible', v_margen,
      'id_orden',          v_orden.id,
      'mensaje',           format(
        'El avance (%.4f) supera el límite aprobado. Margen disponible con orden de cambio: %.4f.',
        p_cantidad_avance, v_margen
      )
    );
  END IF;
END;
$$;

-- ------------------------------------------------------------
-- 6. ÍNDICES adicionales de auditoría para trazabilidad E2E
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_audit_log_tabla_registro"
  ON "audit_log" ("tabla", "id_registro", "timestamp" DESC);

CREATE INDEX IF NOT EXISTS "idx_audit_log_usuario"
  ON "audit_log" ("id_usuario", "timestamp" DESC);

CREATE INDEX IF NOT EXISTS "idx_requerimiento_estado_solicitud"
  ON "requerimiento_compra" ("estado", "fecha_solicitud" DESC);

CREATE INDEX IF NOT EXISTS "idx_requerimiento_solicitante"
  ON "requerimiento_compra" ("id_solicitante", "estado");

-- ------------------------------------------------------------
-- 7. VISTA: v_bandeja_gerencial
--    Optimiza la consulta de la bandeja gerencial agregando
--    datos de proyecto, solicitante y conteo de líneas.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW "v_bandeja_gerencial" AS
SELECT
  rc.id,
  rc.estado,
  rc.justificacion,
  rc.comentario_rechazo,
  rc.fecha_solicitud,
  rc.fecha_aprobacion,
  rc.created_at,
  -- Proyecto
  p.id          AS proyecto_id,
  p.codigo      AS proyecto_codigo,
  p.nombre      AS proyecto_nombre,
  -- Solicitante
  us.id         AS solicitante_id,
  us.nombre     AS solicitante_nombre,
  us.apellido   AS solicitante_apellido,
  us.email      AS solicitante_email,
  -- Aprobador (puede ser NULL si aún EN_REVISION)
  ua.id         AS aprobador_id,
  ua.nombre     AS aprobador_nombre,
  ua.apellido   AS aprobador_apellido,
  -- Conteo de líneas de detalle
  COUNT(dr.id)  AS total_lineas,
  SUM(dr.cantidad_solicitada) AS cantidad_total_solicitada
FROM "requerimiento_compra" rc
JOIN "proyectos"  p  ON p.id  = rc.id_proyecto
JOIN "usuarios"   us ON us.id = rc.id_solicitante
LEFT JOIN "usuarios" ua ON ua.id = rc.id_aprobador
LEFT JOIN "detalle_requerimiento" dr ON dr.id_requerimiento = rc.id
GROUP BY
  rc.id, rc.estado, rc.justificacion, rc.comentario_rechazo,
  rc.fecha_solicitud, rc.fecha_aprobacion, rc.created_at,
  p.id, p.codigo, p.nombre,
  us.id, us.nombre, us.apellido, us.email,
  ua.id, ua.nombre, ua.apellido;

COMMENT ON VIEW "v_bandeja_gerencial"
  IS 'Vista optimizada para la bandeja gerencial Sprint 7. Incluye datos de proyecto, solicitante, aprobador y resumen de líneas.';

COMMIT;
