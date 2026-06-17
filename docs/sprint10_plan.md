# Sprint 10 — Auditoría, Cierre Mensual e Inmutabilidad
## ICARO CONSTRUCTORES BMGM S.A.S.

## Análisis del Proyecto Existente

| Capa | Hallazgo clave |
|---|---|
| **DB / Prisma** | `cierre_mensual` ya existe con `estado_cierre`, `hash_seguridad`, `monto_total`. `audit_log` ya existe con restricción FK inmutable |
| **Backend** | `audit.service.js` + `audit.middleware.js` operativos. `cierresContables.routes.js` es placeholder vacío |
| **Frontend** | `AuditTraceabilityView.jsx` ya implementado (lectura básica). `BillingDocumentsView.jsx` usa datos mock. No hay vistas de consolidación ni cierre real |

---

## A) Tablas SQL nuevas (Migración Sprint 10)

### `consolidacion_mensual` — Snapshot contable-operativo
```sql
CREATE TABLE "consolidacion_mensual" (
  "id"                UUID NOT NULL,
  "id_cierre"         UUID NOT NULL,
  "id_proyecto"       UUID NOT NULL,
  "mes_anio"          VARCHAR(7) NOT NULL,
  -- Avances
  "total_avance_qty"  DECIMAL(14,4) NOT NULL DEFAULT 0,
  "total_avance_monto" DECIMAL(14,2) NOT NULL DEFAULT 0,
  -- Compras / Recepciones
  "total_requerimientos" INTEGER NOT NULL DEFAULT 0,
  "total_compras_monto"  DECIMAL(14,2) NOT NULL DEFAULT 0,
  -- Consumos en Obra
  "total_consumos_qty"   DECIMAL(14,4) NOT NULL DEFAULT 0,
  -- Inventario cierre
  "snapshot_inventario"  JSONB,
  -- Metadata
  "generado_por"      UUID NOT NULL,
  "generado_en"       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "consolidacion_mensual_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "consolidacion_mensual_id_cierre_fkey"
    FOREIGN KEY ("id_cierre") REFERENCES "cierre_mensual"("id") ON DELETE RESTRICT
);
```

### `validacion_pre_cierre` — Log de validaciones
```sql
CREATE TABLE "validacion_pre_cierre" (
  "id"             UUID NOT NULL,
  "id_proyecto"    UUID NOT NULL,
  "mes_anio"       VARCHAR(7) NOT NULL,
  "estado"         VARCHAR(10) NOT NULL DEFAULT 'PENDIENTE', -- OK | BLOQUEADO
  "errores"        JSONB,
  "ejecutado_por"  UUID NOT NULL,
  "ejecutado_en"   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "validacion_pre_cierre_pkey" PRIMARY KEY ("id")
);
```

### Índices adicionales `audit_log` (inmutabilidad a nivel DB)
```sql
-- Prohibir DELETE/UPDATE en audit_log mediante RULE de PostgreSQL
CREATE RULE audit_no_delete AS ON DELETE TO "audit_log" DO INSTEAD NOTHING;
CREATE RULE audit_no_update AS ON UPDATE TO "audit_log" DO INSTEAD NOTHING;
```

---

## B) Archivos Backend creados

| Archivo | Propósito |
|---|---|
| `src/services/cierre.service.js` | Lógica transaccional completa: consolidar → validar → cerrar → hash |
| `src/controllers/cierre.controller.js` | Controladores REST para los 4 endpoints |
| `src/routes/cierresContables.routes.js` | **Reemplaza** el placeholder existente con rutas reales |

### Endpoints resultantes

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/cierres-contables/consolidacion` | Resumen contable-operativo por proyecto+periodo |
| `POST` | `/api/v1/cierres-contables/validar` | Validación pre-cierre (devuelve errores o OK) |
| `POST` | `/api/v1/cierres-contables/ejecutar` | Cierre transaccional con hash SHA-256 |
| `GET` | `/api/v1/cierres-contables` | Listado de cierres con estado |
| `GET` | `/api/v1/cierres-contables/:id` | Detalle de un cierre (incluye consolidación) |

---

## C) Archivos Frontend creados

| Archivo | Propósito |
|---|---|
| `src/services/cierre.service.js` | Llamadas HTTP a los 5 endpoints de cierre |
| `src/views/contabilidad/ConsolidacionMensualView.jsx` | Panel consolidación + ejecución de cierre |
| `src/views/auditoria/AuditTraceabilityView.jsx` | **Actualizado** con exportación PDF/Excel y filtro por usuario |

---

## Flujo de Cierre (Transacción)

```
BEGIN TX
  1. Consolidar: agregar avances, compras, consumos, inventario
  2. Validar pre-cierre:
     - avances con estado PENDING_SYNC → BLOQUEO
     - requerimientos EN_REVISION → BLOQUEO
     - cierre ya existente → BLOQUEO
  3. Insertar consolidacion_mensual
  4. UPDATE cierre_mensual SET estado_cierre='CERRADO', fecha_cierre=NOW()
  5. Generar SHA-256 del payload de consolidación
  6. UPDATE cierre_mensual SET hash_seguridad = sha256_hash
  7. Insertar audit_log (operacion=INSERT, tabla=cierre_mensual)
COMMIT / ROLLBACK si cualquier paso falla
```
