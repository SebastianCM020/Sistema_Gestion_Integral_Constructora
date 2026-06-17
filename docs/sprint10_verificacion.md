# Sprint 10 — Verificación de Actividades y Criterios de Aceptación
## ICARO CONSTRUCTORES BMGM S.A.S.

---

> [!IMPORTANT]
> ## ¿Se modificó la base de datos?
>
> **NO.** La BD PostgreSQL en producción/desarrollo **no fue alterada**.
>
> | Acción realizada | Efecto en BD |
> |---|---|
> | Editar `schema.prisma` | ❌ Sin efecto (solo define tipos para Prisma Client JS) |
> | `npx prisma generate` | ❌ Sin efecto (genera código JS en `node_modules`) |
> | Crear `sprint10_migration.sql` | ❌ Sin efecto (es un archivo .sql, no se ejecutó) |
> | `prisma migrate dev` / `db push` | **No se ejecutaron en ningún momento** |
>
> El servicio `cierre.service.js` opera **exclusivamente** sobre tablas ya existentes:
> - `cierre_mensual` — ya tiene `hash_seguridad`, `estado_cierre`, `monto_total`, `fecha_cierre`
> - `audit_log` — el snapshot de consolidación se guarda en `datos_despues` (JSONB existente)
> - Lectura de: `avance_obra`, `requerimiento_compra`, `movimiento_inventario`, `inventario_proyecto`

---

## Mapa de Archivos Creados/Modificados

```
backend/src/
  services/cierre.service.js          ← NUEVO (sin tablas nuevas en BD)
  controllers/cierre.controller.js    ← NUEVO
  routes/cierresContables.routes.js   ← REEMPLAZA el placeholder del Sprint 5
  middlewares/audit.middleware.js      ← MODIFICADO (tableMap expandido + campo modulo)

frontend/src/
  services/cierre.service.js               ← NUEVO
  views/contabilidad/ConsolidacionMensualView.jsx ← NUEVO
  views/auditoria/AuditTraceabilityView.jsx       ← MODIFICADO

BaseDatos/sprint10_migration.sql        ← OPCIONAL (no ejecutado)
```

---

## Actividad 1 — Consolidación Mensual

### Criterios de Aceptación

| CA | Descripción | Estado |
|---|---|---|
| CA-1.1 | Endpoint retorna resumen agrupado por proyecto y periodo | ✅ |
| CA-1.2 | Incluye total de avances (qty + monto calculado con precio unitario del rubro) | ✅ |
| CA-1.3 | Incluye total de compras aprobadas y recepciones | ✅ |
| CA-1.4 | Incluye total de consumos en obra (salidas de bodega del periodo) | ✅ |
| CA-1.5 | Incluye snapshot de inventario al cierre con stock por material | ✅ |
| CA-1.6 | Incluye porcentaje de avance global del proyecto | ✅ |
| CA-1.7 | Solo accesible por Contador, Admin, Presidente | ✅ RBAC aplicado |

### Origen de los Datos (Trazabilidad en BD)

- **Presupuesto del Proyecto:** Se calcula sumando `(cantidadPresupuestada * precioUnitario)` de todos los registros en la tabla `rubro` asociados al `Proyecto`.
- **Inventario (Materiales):** El snapshot toma los datos actuales de la tabla `inventario_proyecto`, cruzando con la tabla `material` para obtener código, nombre y unidad.
- **Monto de Avances:** Proviene de la tabla `avance_obra` filtrada por mes. El monto monetario se obtiene multiplicando `cantidadAvance` por el `precioUnitario` del `rubro` correspondiente.
- **Compras (Aprobadas):** Proviene de `requerimiento_compra` filtrada por el mes solicitado, sumando el costo de las solicitudes que se encuentran en estado `APROBADO` o `RECIBIDO`.
- **Consumos (Salidas):** Proviene de la tabla `movimiento_inventario` en el mes indicado, contando estrictamente aquellos registros donde `tipoMovimiento === 'SALIDA'`.

### Endpoint y Servicio

- **`GET /api/v1/cierres-contables/consolidacion?idProyecto=<UUID>&mesAnio=YYYY-MM`**
- Función: `consolidarPeriodo()` → [cierre.service.js](file:///e:/Ryzen5/Documents/Sistema_ICARO/backend/src/services/cierre.service.js)
- Solo lectura, sin persistencia

### Verificación Manual desde el Frontend

1. Ingresar como **Contador** o **Administrador del Sistema**
2. Navegar al módulo Contabilidad → **"Consolidación Mensual"** (vista `ConsolidacionMensualView`)
3. ✅ El menú desplegable **"Proyecto"** se carga automáticamente con todos los proyectos activos desde el backend (`fetchProjects()`).
4. Seleccionar el proyecto a validar.
5. ✅ El menú desplegable **"Periodo (mes-año)"** recalcula dinámicamente sus opciones basándose en la fecha de inicio (`startDate`) del proyecto seleccionado.
6. Hacer clic en **"Cargar consolidación"** (`id="btn-cargar-consolidacion"`)

**Resultados esperados:**
- ✅ Tarjeta azul **"Monto Avances"** con total calculado
- ✅ Tarjeta naranja **"Compras aprobadas"** con monto y conteo
- ✅ Tarjeta morada **"Consumos en obra"** con unidades
- ✅ Tarjeta verde **"Recepciones"** con conteo
- ✅ Barra de progreso con `%` de avance global del proyecto
- ✅ Tabla de inventario con stock por material al cierre del periodo

**Verificación por API (Postman):**
```
GET http://localhost:3001/api/v1/cierres-contables/consolidacion
    ?idProyecto=<UUID>&mesAnio=2026-06
Authorization: Bearer <token_contador>

Respuesta 200: { "success": true, "data": { "totalAvanceMonto": X, "snapshotInventario": [...] } }
```

---

## Actividad 2 — Validación Pre-cierre

### Criterios de Aceptación

| CA | Descripción | Estado |
|---|---|---|
| CA-2.1 | Bloquea si hay avances con estado `PENDING_SYNC` (datos móviles no sincronizados) | ✅ |
| CA-2.2 | Bloquea si hay requerimientos en estado `EN_REVISION` | ✅ |
| CA-2.3 | Bloquea si el periodo ya tiene un cierre `CERRADO` en BD | ✅ |
| CA-2.4 | Genera advertencia (no bloqueante) por avances rechazados | ✅ |
| CA-2.5 | Genera advertencia por materiales con stock negativo | ✅ |
| CA-2.6 | Resultado registrado en `audit_log` (tabla existente, campo JSONB) | ✅ |
| CA-2.7 | HTTP 200 si pasa / HTTP 422 con array de errores si bloquea | ✅ |

### Condiciones de Bloqueo y Registro de Validación

**¿Cuándo se bloquea el cierre?**
- Si existen `avances de obra` en el mes que siguen en estado `PENDING_SYNC` (operarios móviles que trabajaron offline pero no han sincronizado con la nube). Esto causaría inconsistencias contables si se cierra sin ellos.
- Si existen `requerimientos de compra` en estado `EN_REVISION`. El proceso exige que Gerencia o Compras decidan (APROBAR/RECHAZAR) todas las solicitudes del mes antes de cerrar caja.
- Si el periodo actual ya aparece como `CERRADO` en la tabla `cierre_mensual`.

**¿Dónde se guarda esta info y por qué?**
- El resultado del intento de pre-cierre (tanto los errores que lo bloquearon como las advertencias) se almacena en la tabla **`audit_log`** bajo el campo `datos_despues` (JSONB) con la acción `VALIDACION_PRE_CIERRE`.
- **Objetivo:** Trazabilidad. Permite al Administrador auditar *por qué* un Contador no pudo cerrar un mes en cierta fecha, demostrando que hubo faltas operativas (como una compra en revisión olvidada) sin alterar las tablas de negocio.

### Endpoint y Servicio

- **`POST /api/v1/cierres-contables/validar`** — Body: `{ idProyecto, mesAnio }`
- Función: `validarPreCierre()` → [cierre.service.js](file:///e:/Ryzen5/Documents/Sistema_ICARO/backend/src/services/cierre.service.js)
- El resultado queda en `audit_log.datos_despues.accion = "VALIDACION_PRE_CIERRE"`

### Verificación Manual desde el Frontend

1. En la vista ConsolidacionMensualView, cargar el consolidado de un proyecto
2. Verificar que aparece el panel **"Acciones de cierre"** (solo visible si el periodo no está cerrado y el rol es Contador/Admin)
3. Hacer clic en **"Ejecutar validación pre-cierre"** (`id="btn-validar-pre-cierre"`)

**Escenario A — Validación aprobada:**
- ✅ Banner verde: *"Validación aprobada — No se detectaron bloqueos"*
- El botón **"Ejecutar cierre y generar hash"** queda **habilitado**

**Escenario B — Validación bloqueada:**
- ✅ Bloque rojo con lista de errores, cada uno con código (ej: `[AVN_PENDING_SYNC]`) y descripción
- El botón de cierre permanece **deshabilitado**
- Si hay advertencias, aparecen colapsadas con un botón para expandirlas

**Verificar en módulo Auditoría:**
- Módulo Auditoría → filtrar tabla = `cierre_mensual` + operación = `UPDATE`
- Expandir el registro → `datos_despues.accion` debe ser `"VALIDACION_PRE_CIERRE"`

---

## Actividad 3 — Cierre Mensual y Bloqueo

### Criterios de Aceptación

| CA | Descripción | Estado |
|---|---|---|
| CA-3.1 | Cambia `estado_cierre` a `CERRADO` en tabla `cierre_mensual` (ya existente) | ✅ |
| CA-3.2 | Registra `fecha_cierre` con timestamp exacto | ✅ |
| CA-3.3 | Genera hash SHA-256 del payload de consolidación | ✅ |
| CA-3.4 | Persiste hash en `cierre_mensual.hash_seguridad` (columna ya existente) | ✅ |
| CA-3.5 | Snapshot completo persiste en `audit_log.datos_despues` (JSONB existente) | ✅ |
| CA-3.6 | Periodo cerrado bloquea el panel de acciones en la UI | ✅ |
| CA-3.7 | Solo Contador y Admin pueden ejecutar el cierre (HTTP 403 para otros roles) | ✅ |
| CA-3.8 | Hash SHA-256 visible en la interfaz después del cierre | ✅ |

### Endpoint y Servicio

- **`POST /api/v1/cierres-contables/ejecutar`** — Body: `{ idProyecto, mesAnio }`
- Función: `ejecutarCierreMensual()` con `prisma.$transaction()` → [cierre.service.js](file:///e:/Ryzen5/Documents/Sistema_ICARO/backend/src/services/cierre.service.js)
- Columnas de `cierre_mensual` usadas: `estado_cierre`, `hash_seguridad`, `monto_total`, `fecha_cierre` — **todas ya existían en la BD**

### Verificación Manual desde el Frontend

1. Ejecutar primero la validación (Act-2) hasta obtener el banner verde
2. Hacer clic en **"Ejecutar cierre y generar hash"** (`id="btn-ejecutar-cierre"`)
3. Confirmar el diálogo: *"¿Confirma el cierre del periodo YYYY-MM? Esta acción es irreversible."*

**Resultados esperados:**
- ✅ Banner verde: *"¡Cierre ejecutado con éxito!"*
- ✅ Tarjeta con el **Hash SHA-256** de 64 caracteres visible
- ✅ El panel "Acciones de cierre" desaparece
- ✅ Banner azul: *"Periodo cerrado"* con el ID del cierre
- ✅ Tabla **"Cierres recientes"** muestra el nuevo cierre con ícono 🔒, estado `Cerrado` y hash truncado

**Verificación directa en BD:**
```sql
SELECT id, mes_anio, estado_cierre, hash_seguridad, fecha_cierre, monto_total
FROM cierre_mensual
WHERE id_proyecto = '<UUID>'
ORDER BY created_at DESC LIMIT 1;
-- estado_cierre = 'CERRADO'
-- hash_seguridad = 64 chars hex
-- fecha_cierre = timestamp del momento del cierre
```

---

## Actividad 4 — Módulo de Auditoría

### Criterios de Aceptación

| CA | Descripción | Estado |
|---|---|---|
| CA-4.1 | Tabla de eventos CUD con paginación | ✅ existía Sprint 7 |
| CA-4.2 | Filtro por usuario (nombre o email) | ✅ **NUEVO Sprint 10** |
| CA-4.3 | Filtro por tabla/módulo | ✅ existía |
| CA-4.4 | Filtro por operación (INSERT/UPDATE/DELETE) | ✅ existía |
| CA-4.5 | Filtro por rango de fechas (desde/hasta) | ✅ existía |
| CA-4.6 | Exportar a Excel (CSV con BOM UTF-8) | ✅ **NUEVO Sprint 10** |
| CA-4.7 | Exportar a PDF (impresión) | ✅ **NUEVO Sprint 10** |
| CA-4.8 | `audit_log` inmutable — sin endpoints DELETE/UPDATE expuestos | ✅ por diseño de API |
| CA-4.9 | Eventos del cierre mensual visibles filtrando por tabla `cierre_mensual` | ✅ |
| CA-4.10 | Acceso exclusivo para Administrador del Sistema | ✅ RBAC aplicado |

### Implementación

- **`GET /api/v1/audit-logs`** (existía, con filtro `idUsuario` nuevo en query params)
- Vista actualizada: [AuditTraceabilityView.jsx](file:///e:/Ryzen5/Documents/Sistema_ICARO/frontend/src/views/auditoria/AuditTraceabilityView.jsx)
- Nuevas tablas en el dropdown: `cierre_mensual`, `consolidacion_mensual`, `validacion_pre_cierre`

### Verificación Manual desde el Frontend

1. Ingresar como **Administrador del Sistema** → módulo **"Auditoría y Trazabilidad"**

**CA-4.2 — Filtro por usuario:**
2. Campo **"Filtrar por usuario..."** (`id="audit-filtro-usuario"`) → escribir nombre o email
3. ✅ La tabla filtra en tiempo real mostrando solo los eventos de ese usuario

**CA-4.6 — Exportar Excel:**
4. Botón **"Excel"** (`id="btn-export-csv"`) → solo habilitado cuando hay registros cargados
5. ✅ Se descarga `audit_log_YYYY-MM-DD.csv` apto para Microsoft Excel

**CA-4.7 — Exportar PDF:**
6. Botón **"PDF"** (`id="btn-export-pdf"`)
7. ✅ Abre ventana de impresión con tabla formateada (fondo azul `#1F4E79` en encabezados)

**CA-4.8 — Inmutabilidad:**
8. Verificar que no existe ningún endpoint `DELETE /api/v1/audit-logs/:id` ni `PUT`
9. `logAction()` en `audit.service.js` solo ejecuta `prisma.auditLog.create()` — nunca update/delete

**CA-4.9 — Ver eventos de cierre:**
10. Dropdown **"Tabla"** → seleccionar `cierre_mensual`
11. ✅ Aparecen los eventos del cierre (operación `INSERT`)
12. Expandir fila → `datos_despues.consolidacion` contiene el snapshot completo con hash

---

## Actividad 5 — Tolerancia a Fallos (Rollback)

### Criterios de Aceptación

| CA | Descripción | Estado |
|---|---|---|
| CA-5.1 | Cierre usa `prisma.$transaction()` → SQL `BEGIN/COMMIT/ROLLBACK` automático | ✅ |
| CA-5.2 | Fallo en `tx.cierreMensual.create()` → ROLLBACK total | ✅ |
| CA-5.3 | Fallo en generación del hash → ROLLBACK total | ✅ |
| CA-5.4 | Fallo en `tx.auditLog.create()` → ROLLBACK total | ✅ |
| CA-5.5 | La BD no queda en estado inconsistente en ningún escenario | ✅ |
| CA-5.6 | Cliente recibe HTTP 500 con mensaje de ROLLBACK | ✅ |
| CA-5.7 | Errores de validación (HTTP 422) no abren la transacción | ✅ |

### Código de la Transacción

```javascript
// ejecutarCierreMensual() — cierre.service.js
const resultado = await prisma.$transaction(async (tx) => {
  // BEGIN automático aquí

  await tx.cierreMensual.create({ data: { estadoCierre: 'ABIERTO', ... } });
  // ↑ Si falla → ROLLBACK automático

  const hashSeguridad = generarHashSHA256(payloadHash);
  // ↑ Si falla → ROLLBACK automático

  await tx.cierreMensual.update({ data: { estadoCierre: 'CERRADO', hashSeguridad, ... } });
  // ↑ Si falla → ROLLBACK automático

  await tx.auditLog.create({ data: { datosDespues: { consolidacion: payloadHash } } });
  // ↑ Si falla → ROLLBACK automático

  return resultado;
}); // COMMIT aquí solo si todos los pasos exitosos
```

### Verificación Manual desde el Frontend

**Escenario A — Flujo normal:**
1. Ejecutar cierre → aparece hash SHA-256 → ✅ COMMIT exitoso

**Escenario B — Simulación de fallo (ROLLBACK):**

> [!NOTE]
> Para probar el rollback: agregar `throw new Error('Fallo simulado')` antes de `tx.auditLog.create()` en `cierre.service.js`, reiniciar backend, ejecutar cierre, verificar BD, luego eliminar la línea.

2. Con el error simulado → clic en **"Ejecutar cierre y generar hash"**
3. ✅ Frontend muestra: *"Error al ejecutar el cierre. La operación fue revertida (ROLLBACK)."*
4. Verificar en BD que no se creó ningún registro nuevo:
```sql
SELECT COUNT(*) FROM cierre_mensual WHERE id_proyecto = '<UUID>'
AND created_at > NOW() - INTERVAL '5 minutes';
-- Debe retornar 0
```
5. ✅ La BD quedó idéntica a antes del intento

**Escenario C — Validación 422 (no inicia TX):**
6. Con avances `PENDING_SYNC` en el periodo → ejecutar cierre directamente
7. ✅ Responde HTTP 422 con lista de errores **antes** de abrir cualquier transacción
8. ✅ `cierre_mensual` no tiene ninguna entrada nueva

---

## Tabla de Endpoints del Sprint 10

| Método | URL | Actividad | Roles |
|---|---|---|---|
| `GET` | `/api/v1/cierres-contables/consolidacion` | Act-1 | Contador, Admin, Presidente |
| `POST` | `/api/v1/cierres-contables/validar` | Act-2 | Contador, Admin |
| `POST` | `/api/v1/cierres-contables/ejecutar` | Act-3 + 5 | Contador, Admin |
| `GET` | `/api/v1/cierres-contables` | Historial | Contador, Admin, Presidente |
| `GET` | `/api/v1/cierres-contables/:id` | Detalle | Contador, Admin, Presidente |
| `GET` | `/api/v1/audit-logs` | Act-4 | Solo Admin |

---

## Resumen: ¿Qué requiere migración de BD?

| Funcionalidad | Requiere migración | Alternativa |
|---|---|---|
| Consolidación (Act-1) | ❌ No | Lee tablas existentes |
| Validación pre-cierre (Act-2) | ❌ No | Resultado en `audit_log.datos_despues` |
| Cierre + hash SHA-256 (Act-3) | ❌ No | Usa columnas existentes de `cierre_mensual` |
| Auditoría + exportar + filtro usuario (Act-4) | ❌ No | `audit_log` ya existe; inmutabilidad garantizada por la API |
| Rollback transaccional (Act-5) | ❌ No | `prisma.$transaction()` es a nivel de cliente |
| Snapshot en tabla dedicada | ⚠️ Opcional | Ejecutar `sprint10_migration.sql` si se requiere SQL directo |
| Inmutabilidad a nivel motor PostgreSQL | ⚠️ Opcional | Ejecutar `sprint10_migration.sql` para RULES |
