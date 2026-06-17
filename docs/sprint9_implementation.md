# Sprint 9 — Documentación Técnica por Actividades
## Sistema ICARO · Gestión Integral de Consumo en Obra

> **Servidores activos:**
> - Backend: `http://localhost:3001` — `cd backend && npm run dev`
> - Frontend: `http://localhost:5173` — `cd frontend && npm run dev`
>
> **BD:** PostgreSQL en `localhost:5433` · Sin cambios al schema original

---

## Mapa de Archivos por Actividad

| Actividad | Archivos clave |
|-----------|---------------|
| Act. 1 | [MobileConsumptionView.jsx](file:///e:/Ryzen5/Documents/Sistema_ICARO/frontend/src/views/obra/MobileConsumptionView.jsx), [consumo.service.js (FE)](file:///e:/Ryzen5/Documents/Sistema_ICARO/frontend/src/services/consumo.service.js) |
| Act. 2 | [consumo.service.js (BE)](file:///e:/Ryzen5/Documents/Sistema_ICARO/backend/src/services/consumo.service.js), [consumo.controller.js](file:///e:/Ryzen5/Documents/Sistema_ICARO/backend/src/controllers/consumo.controller.js), [consumo.routes.js](file:///e:/Ryzen5/Documents/Sistema_ICARO/backend/src/routes/consumo.routes.js) |
| Act. 3 | [consumo.service.js (BE)](file:///e:/Ryzen5/Documents/Sistema_ICARO/backend/src/services/consumo.service.js) — sección validaciones |
| Act. 4 | [syncManager.js](file:///e:/Ryzen5/Documents/Sistema_ICARO/frontend/src/services/syncManager.js), [consumosLocalService.js](file:///e:/Ryzen5/Documents/Sistema_ICARO/frontend/src/db/consumosLocalService.js), [database.js](file:///e:/Ryzen5/Documents/Sistema_ICARO/frontend/src/db/database.js) |
| Act. 5 | [sprint9_consumo_inventario.test.js](file:///e:/Ryzen5/Documents/Sistema_ICARO/backend/tests/sprint9_consumo_inventario.test.js) |

---

---

# Actividad 1 — Interfaz Móvil de Consumo con Selección desde Inventario

**CA:** El Residente consume solo materiales del proyecto autorizado y vigente.

## Qué se implementó

`MobileConsumptionView.jsx` fue actualizado para consumir datos reales del backend en lugar de mocks estáticos:

1. **Carga de proyectos asignados:** al montar la vista, llama a `fetchProyectosAsignados()` que hace `GET /api/v1/proyectos`. El backend filtra automáticamente por las asignaciones vigentes del usuario autenticado, por lo que el Residente solo recibe sus proyectos.
2. **Carga de materiales por proyecto:** al seleccionar un proyecto, llama a `fetchMaterialesDisponibles(idProyecto)` que hace `GET /api/v1/consumo/proyectos/:id/materiales-disponibles`. El endpoint verifica la asignación en la BD antes de retornar los materiales.
3. **Filtro de stock > 0:** el servicio backend ya filtra `cantidadDisponible: { gt: 0 }`, así que la UI solo muestra materiales con existencias.
4. **Adaptador de formato:** `adaptarMaterialServidor()` convierte el DTO del servidor al formato esperado por los componentes de UI existentes.
5. **Detección de conectividad:** escucha eventos `online`/`offline` y muestra el banner `WifiOff` cuando no hay red.

## Verificación por API

```http
# Obtener token del Residente
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json
{ "email": "residente@icaro.com", "password": "icaro2025" }
→ 200 OK · copiar data.token como TOKEN_R

# Ver proyectos asignados al residente
GET http://localhost:3001/api/v1/proyectos
Authorization: Bearer {TOKEN_R}
→ 200 OK · lista SOLO de proyectos con asignación vigente
→ copiar data[0].id como ID_PROYECTO

# Ver materiales disponibles del proyecto
GET http://localhost:3001/api/v1/consumo/proyectos/{ID_PROYECTO}/materiales-disponibles
Authorization: Bearer {TOKEN_R}
→ 200 OK · lista de materiales con stockDisponible > 0
→ copiar data[0].idMaterial como ID_MATERIAL

# Intentar con proyecto ajeno → 403
GET http://localhost:3001/api/v1/consumo/proyectos/00000000-ffff-0000-0000-000000000000/materiales-disponibles
Authorization: Bearer {TOKEN_R}
→ 403 · { "codigo": "PROYECTO_NO_AUTORIZADO" }
```

## Verificación desde el Frontend

### Paso A1.1 — Acceso a la vista

1. Abrir **`http://localhost:5173`** en Chrome o Edge.
2. Se muestra la pantalla de login de ICARO.
3. Campo **"Correo electrónico"**: escribir `residente@icaro.com`
4. Campo **"Contraseña"**: escribir `icaro2025`
5. Hacer clic en **"Iniciar sesión"** (botón azul).
6. ✅ Redirige al dashboard. En la barra lateral aparece el nombre del Residente y su rol.

### Paso A1.2 — Navegar a Consumo en Obra

1. En la barra lateral izquierda, buscar la opción **"Consumo en obra"** (ícono de caja/inventario).
2. Si la barra lateral está colapsada en móvil, hacer clic en el ícono de menú ☰ (esquina superior izquierda).
3. Hacer clic en **"Consumo en obra"**.
4. ✅ Se carga la vista `MobileConsumptionView`. Aparece un indicador de carga brevemente.
5. ✅ Tras la carga: se ve un selector/lista de proyectos en la parte superior del panel principal.

### Paso A1.3 — Verificar que solo aparecen proyectos asignados

1. Observar el **selector de proyecto** (dropdown o tarjeta con el nombre del proyecto).
2. Si hay más de uno: hacer clic en el selector y ver el menú desplegable.
3. ✅ La lista muestra **solo** los proyectos donde el Residente tiene asignación activa. No aparecen proyectos de otros usuarios ni proyectos sin asignación.
4. Si se ve el botón **"Cambiar proyecto"**: hacer clic para ver la lista completa.

### Paso A1.4 — Verificar que solo aparecen materiales con stock > 0

1. Con el proyecto seleccionado, observar la sección de **"Materiales disponibles"** o la lista de materiales.
2. ✅ Todos los materiales listados tienen cantidad disponible mayor a 0.
3. ✅ Se muestra el nombre del material, el código, la unidad de medida y el stock disponible.
4. Si el proyecto no tiene ningún material con stock: aparece el mensaje **"No hay materiales disponibles para este proyecto"**.
5. Usar el buscador de materiales (campo de búsqueda): escribir parte del nombre de un material.
6. ✅ La lista filtra en tiempo real mostrando solo los materiales que coincidan con la búsqueda.

### Paso A1.5 — Verificar restricción de proyecto ajeno

1. Iniciar sesión con otro usuario que NO sea el Residente (ej: `bodega@icaro.com`).
2. Intentar navegar a la URL directa de un proyecto del primer Residente.
3. ✅ El frontend muestra un banner de acceso restringido con ícono de escudo 🔒.

---

---

# Actividad 2 — Descuento Transaccional de Stock y Movimiento de Salida

**CA:** Un consumo válido descuenta el stock y genera un movimiento de inventario tipo Salida.

## Qué se implementó

`consumo.service.js` (backend) implementa la transacción atómica en un solo `prisma.$transaction`:

1. **Verificación de proyecto ACTIVO** → `tx.proyecto.findUnique()`
2. **Verificación de asignación vigente** → `tx.asignacionProyectoUsuario.findFirst()` con rango de fechas
3. **Verificación de material activo** → `tx.material.findUnique({ where: { activo: true } })`
4. **Lectura de stock dentro de la transacción** → `tx.inventarioProyecto.findUnique()`
5. **Creación del movimiento SALIDA** → `tx.movimientoInventario.create()` con `tipoMovimiento: 'SALIDA'`, `cantidadAnterior` y `cantidadResultante`
6. **Actualización del inventario** → `tx.inventarioProyecto.upsert()` con `Math.max(resultado, 0)`
7. **Registro en audit_log** → `tx.auditLog.create()` con `operacion: 'INSERT'`

Si cualquier paso falla, Prisma revierte la transacción completa (`ROLLBACK` automático).

El **controlador** responde `201 Created` con el movimiento creado, el stock anterior y el stock actual.

La **ruta** aplica RBAC: solo Residente (`'Residente'`) y Admin (`'Administrador del Sistema'`) pueden hacer `POST /consumir`.

## Verificación por API

```http
# Consumo exitoso
POST http://localhost:3001/api/v1/consumo/proyectos/{ID_PROYECTO}/consumir
Authorization: Bearer {TOKEN_R}
Content-Type: application/json
{
  "idMaterial": "{ID_MATERIAL}",
  "cantidad": 5,
  "observacion": "Verificación Act.2"
}
→ 201 Created
{
  "message": "Consumo registrado correctamente. Stock actualizado: X unidad.",
  "data": {
    "id": "...",
    "tipoMovimiento": "SALIDA",
    "cantidad": "5",
    "cantidadAnterior": "20",
    "cantidadResultante": "15",
    "material": { "nombre": "...", "unidad": "..." },
    "proyecto": { "nombre": "...", "codigo": "..." },
    "usuario": { "nombre": "...", "apellido": "..." }
  },
  "stockAnterior": 20,
  "stockActual": 15
}

# Verificar movimiento en historial
GET http://localhost:3001/api/v1/consumo/proyectos/{ID_PROYECTO}/historial
Authorization: Bearer {TOKEN_R}
→ data[0].tipoMovimiento == "SALIDA"
→ data[0].cantidadResultante nunca negativa

# Bodeguero no puede consumir → 403
POST http://localhost:3001/api/v1/consumo/proyectos/{ID_PROYECTO}/consumir
Authorization: Bearer {TOKEN_BODEGUERO}
Content-Type: application/json
{ "idMaterial": "{ID_MATERIAL}", "cantidad": 1 }
→ 403 Forbidden
```

## Verificación desde el Frontend

### Paso A2.1 — Registrar un consumo exitoso

1. Iniciar sesión como Residente (`residente@icaro.com` / `icaro2025`).
2. Navegar a **"Consumo en obra"** desde la barra lateral.
3. Esperar a que carguen los materiales del proyecto.
4. En la lista de materiales, hacer clic sobre un material con stock disponible (ej: "Cemento — 20 bultos").
5. ✅ Se abre el **formulario de consumo** a la derecha o en un panel inferior. Se muestra:
   - Nombre del material seleccionado
   - Stock disponible actual
   - Campo "Cantidad" vacío
   - Campo "Observación" opcional
6. En el campo **"Cantidad"**: escribir `5`
7. En el campo **"Observación"**: escribir `Verificación manual Actividad 2`
8. Hacer clic en el botón **"Registrar consumo"** o **"Confirmar"** (botón azul).
9. ✅ Aparece un mensaje de éxito (panel verde o banner): _"Consumo registrado correctamente"_
10. ✅ El stock del material en la lista se actualiza de 20 a 15.
11. ✅ El formulario se limpia automáticamente.

### Paso A2.2 — Verificar en el historial de consumos

1. En la misma vista, buscar la sección **"Historial"** o hacer clic en la pestaña de historial.
2. O navegar a **"Historial de consumos"** si hay un ítem dedicado en el menú.
3. ✅ El primer registro (más reciente) muestra:
   - **Tipo:** SALIDA
   - **Material:** el que se consumió
   - **Cantidad:** 5
   - **Stock anterior:** 20
   - **Stock resultante:** 15
   - **Usuario:** nombre del Residente logueado
   - **Fecha:** hora actual (± 1 min)
4. ✅ `cantidadResultante` no es nunca negativa (validado visualmente).

### Paso A2.3 — Comprobar que Bodeguero no puede consumir

1. Hacer clic en el ícono de usuario/perfil (esquina superior derecha).
2. Seleccionar **"Cerrar sesión"**.
3. Iniciar sesión con `bodega@icaro.com` / `icaro2025`.
4. Navegar a **"Consumo en obra"**.
5. Seleccionar un material de la lista.
6. ✅ El botón **"Registrar consumo"** aparece deshabilitado (gris) O no existe en la interfaz.
7. Si se intenta forzar la acción: la UI muestra un mensaje de error `403 Forbidden`.
8. Volver a iniciar sesión como Residente.

---

---

# Actividad 3 — Bloqueo por Stock Insuficiente, Conflicto y Material Ajeno

**CA:** Consumos sin stock, sobre material ajeno o con conflicto son rechazados sin afectar el inventario.

## Qué se implementó

Dentro de `prisma.$transaction`, antes de cualquier escritura:

| Validación | Código de error | HTTP | Cuándo |
|-----------|-----------------|------|--------|
| Proyecto inexistente | — | 404 | `findUnique` retorna null |
| Proyecto inactivo | `PROYECTO_INACTIVO` | 422 | `estado !== 'ACTIVO'` |
| Sin asignación | `PROYECTO_NO_AUTORIZADO` | 403 | `findFirst` de asignación retorna null |
| Asignación expirada | `ASIGNACION_NO_VIGENTE` | 403 | `hoy < fechaInicio` o `hoy > fechaFin` |
| Material inactivo | — | 404 | `activo === false` |
| Stock insuficiente | `STOCK_INSUFICIENTE` | 422 | `cantidadSolicitada > stockDisponible` |
| Stock post-update negativo | `CONFLICTO_CONCURRENCIA` | 409 | Condición de carrera detectada |

**El inventario nunca cambia si cualquiera de estas validaciones falla**, porque se lanza una excepción dentro de `$transaction` que hace rollback automático antes de ejecutar `movimientoInventario.create()` o `inventarioProyecto.upsert()`.

La validación de cantidad ≤ 0 ocurre **antes** de la transacción, por lo que ni siquiera abre una conexión a la BD.

## Verificación por API

```http
# Stock insuficiente → 422
POST http://localhost:3001/api/v1/consumo/proyectos/{ID_PROYECTO}/consumir
Authorization: Bearer {TOKEN_R}
Content-Type: application/json
{ "idMaterial": "{ID_MATERIAL}", "cantidad": 99999 }
→ 422 Unprocessable Entity
{
  "error": "Stock insuficiente para \"Cemento\". Disponible: 15, solicitado: 99999.",
  "codigo": "STOCK_INSUFICIENTE",
  "detalle": { "stockDisponible": 15, "cantidadSolicitada": 99999, "faltante": 99984 }
}
# Verificar en BD: stock sin cambios
SELECT cantidad_disponible FROM inventario_proyecto WHERE id_material='{ID_MATERIAL}';
→ sigue siendo 15

# Proyecto ajeno → 403
POST http://localhost:3001/api/v1/consumo/proyectos/99999999-9999-9999-9999-999999999999/consumir
Authorization: Bearer {TOKEN_R}
Content-Type: application/json
{ "idMaterial": "{ID_MATERIAL}", "cantidad": 1 }
→ 403 · { "codigo": "PROYECTO_NO_AUTORIZADO" }

# Cantidad cero → 400
POST http://localhost:3001/api/v1/consumo/proyectos/{ID_PROYECTO}/consumir
Authorization: Bearer {TOKEN_R}
Content-Type: application/json
{ "idMaterial": "{ID_MATERIAL}", "cantidad": 0 }
→ 400 · { "error": "La cantidad a consumir debe ser un número positivo mayor a 0." }

# Proyecto inactivo → 422
PATCH http://localhost:3001/api/v1/proyectos/{ID_PROYECTO}/estado
Authorization: Bearer {TOKEN_ADMIN}
Content-Type: application/json
{ "estado": "INACTIVO" }
→ 200 OK

POST http://localhost:3001/api/v1/consumo/proyectos/{ID_PROYECTO}/consumir
Authorization: Bearer {TOKEN_R}
Content-Type: application/json
{ "idMaterial": "{ID_MATERIAL}", "cantidad": 1 }
→ 422 · { "codigo": "PROYECTO_INACTIVO" }

# Restaurar proyecto
PATCH http://localhost:3001/api/v1/proyectos/{ID_PROYECTO}/estado
Authorization: Bearer {TOKEN_ADMIN}
Content-Type: application/json
{ "estado": "ACTIVO" }
```

## Verificación desde el Frontend

### Paso A3.1 — Intentar consumir más del stock disponible

1. Iniciar sesión como Residente. Navegar a **"Consumo en obra"**.
2. Seleccionar un material con, por ejemplo, **8 unidades** de stock.
3. En el formulario de consumo, campo **"Cantidad"**: escribir `50`.
4. ✅ **Validación en tiempo real:** el campo se colorea de rojo/naranja y aparece texto de advertencia debajo: _"Máximo disponible: 8"_ o _"Stock insuficiente"_. El botón "Registrar" puede quedar deshabilitado.
5. Hacer clic en **"Registrar consumo"** (si el botón está activo).
6. ✅ Aparece un modal o banner de error bloqueante: _"Stock insuficiente. Disponible: 8, solicitado: 50"_.
7. El formulario permanece abierto para corregir.
8. ✅ El stock en la lista de materiales **no cambia** (sigue en 8).

### Paso A3.2 — Validación de cantidad en tiempo real

1. Con el formulario de consumo abierto, en el campo **"Cantidad"**:
2. Borrar el valor y escribir `0`.
3. ✅ Error inmediato: _"La cantidad debe ser mayor a 0"_ y botón deshabilitado.
4. Escribir `-5`.
5. ✅ El campo rechaza el valor negativo o muestra error de validación inmediato.
6. Escribir `3` (valor válido dentro del stock).
7. ✅ El error desaparece, el botón se habilita.

### Paso A3.3 — Verificar que el stock nunca llega a negativo

1. Seleccionar un material con exactamente **3 unidades** de stock.
2. En cantidad: escribir `3` (exactamente todo el stock).
3. Hacer clic en **"Registrar consumo"**.
4. ✅ Consumo exitoso. Stock mostrado en la lista: **0 unidades**.
5. Seleccionar de nuevo ese material.
6. En cantidad: escribir `1`.
7. ✅ El campo muestra error inmediato (stock 0 < cantidad 1).
8. Intentar confirmar de todas formas: el backend devuelve `422 STOCK_INSUFICIENTE`.
9. ✅ Stock en la lista sigue en **0**, no en **-1**.

### Paso A3.4 — Proyecto inactivo (como Admin)

1. Cerrar sesión. Iniciar sesión como Admin (`admin@icaro.com` / `icaro2025`).
2. Navegar a **"Proyectos"** → seleccionar el proyecto del Residente.
3. Buscar el botón **"Cambiar estado"** o **"Desactivar"** y hacer clic.
4. Confirmar el cambio a estado **"INACTIVO"**.
5. Cerrar sesión. Iniciar sesión como Residente.
6. Navegar a **"Consumo en obra"**. Seleccionar el proyecto desactivado.
7. Intentar registrar un consumo.
8. ✅ Aparece error: _"El proyecto no está activo. Solo se pueden registrar consumos en proyectos ACTIVOS."_
9. **Restaurar:** cerrar sesión → Admin → Proyectos → Cambiar estado a **"ACTIVO"**.

---

---

# Actividad 4 — Cola Offline: Consumos, Avances y Evidencias con Reintentos

**CA:** El SyncManager procesa pendientes; estados `pending`, `synced` y `error` se actualizan sin duplicar operaciones.

## Qué se implementó

**`database.js` (Dexie v3):**
Añade la tabla `consumos_local` con índices en `sync_status` e `idProyecto`.

**`consumosLocalService.js`:**
- `guardarConsumoLocal()`: genera `id` (UUID local) e `idempotencyKey` (UUID único) y guarda con `sync_status: 'pending'`.
- `getConsumosPendientes()`: filtra por `sync_status === 'pending'`.
- `marcarConsumoSincronizado()`: actualiza a `sync_status: 'synced'` y guarda `server_id`.
- `marcarConsumoError()`: si `permanent=true` → `sync_status: 'error'`; si temporal → sigue en `'pending'` y incrementa `sync_attempts`.

**`syncManager.js`:**
- `ejecutarSincronizacion()`: semáforo `isSyncing` evita ejecuciones paralelas. Procesa consumos primero, luego avances.
- `sincronizarConsumos()`: por cada consumo pendiente: verifica si superó `MAX_RETRY_ATTEMPTS (3)`, hace `POST /consumir`, evalúa respuesta:
  - `200/201 ok` → `marcarConsumoSincronizado()`
  - `4xx` permanente → `marcarConsumoError(..., true)` (no se reintenta)
  - `5xx` temporal → `marcarConsumoError(..., false)` (se reintenta)
  - Sin red → `break` del bucle, se reintentará al próximo evento `'online'`
- `registrarSyncAutomatico()`: listener del evento `'online'` que dispara `ejecutarSincronizacion()` automáticamente.
- `getPendingCounts()`: retorna `{ consumos, avances, total }` para el contador de la UI.

**`MobileConsumptionView.jsx`:**
- Llama a `registrarSyncAutomatico()` al montar la vista.
- Muestra el contador de pendientes en el header.
- El botón "Sincronizar ahora" llama a `ejecutarSincronizacion()` manualmente.

## Verificación por API

No aplica directamente (la cola offline es del cliente). La verificación de la sincronización se hace con:

```http
# Consumo que el SyncManager enviará al recuperar red:
POST http://localhost:3001/api/v1/consumo/proyectos/{ID_PROYECTO}/consumir
Authorization: Bearer {TOKEN_R}
Content-Type: application/json
{
  "idMaterial": "{ID_MATERIAL}",
  "cantidad": 2,
  "observacion": "Test offline sync"
}
→ 201 Created (mismo endpoint que online; el SyncManager lo llama igual)
```

## Verificación desde el Frontend

### Paso A4.1 — Simular modo offline

1. Iniciar sesión como Residente. Navegar a **"Consumo en obra"**.
2. Verificar que los materiales cargaron correctamente (ver lista con stock).
3. Presionar `F12` para abrir **DevTools**.
4. Ir a la pestaña **"Network"** (Red).
5. Hacer clic en el ícono de limitación de red (señal de WiFi o "No throttling").
6. Seleccionar **"Offline"** en el dropdown.
7. ✅ En la interfaz de ICARO aparece un **banner naranja/amarillo** con ícono `WifiOff` (📶) y mensaje: _"Sin conexión. Los consumos se guardarán localmente."_

### Paso A4.2 — Registrar consumos en modo offline

1. Con el modo offline activo, seleccionar un material de la lista.
2. En el formulario, campo **"Cantidad"**: escribir `2`.
3. Campo **"Observación"**: escribir `"Test offline A"`.
4. Hacer clic en **"Registrar consumo"**.
5. ✅ Aparece mensaje tipo: _"📴 Guardado localmente. Se sincronizará cuando recupere la conexión."_
6. ✅ El contador en el header o banner muestra: **"1 pendiente(s)"**.
7. Repetir con otro material: cantidad `1`, observación `"Test offline B"`.
8. ✅ Contador sube a **"2 pendiente(s)"**.

### Paso A4.3 — Inspeccionar IndexedDB

1. Con DevTools abierto, ir a la pestaña **"Application"** (Aplicación).
2. En el panel izquierdo: expandir **"Storage"** → **"IndexedDB"**.
3. Buscar la base de datos **"ICARO_DB"** (o el nombre configurado en `database.js`).
4. Expandir → seleccionar la tabla **"consumos_local"**.
5. ✅ Aparecen 2 registros con:
   - `sync_status: "pending"`
   - `sync_attempts: 0`
   - `idempotencyKey:` un UUID único para cada uno
   - `cantidad: 2` / `cantidad: 1`
   - `observacion: "Test offline A"` / `"Test offline B"`

### Paso A4.4 — Restaurar conexión y ver sincronización automática

1. En DevTools → pestaña **"Network"** → cambiar de **"Offline"** a **"No throttling"**.
2. Observar la interfaz durante los siguientes 3-5 segundos.
3. ✅ En la **Consola** de DevTools (pestaña "Console") aparece:
   ```
   [SyncManager] Conexión restaurada — iniciando sincronización automática.
   [SyncManager] Completado — Enviados: 2, Temporales: 0, Permanentes: 0
   ```
4. ✅ El contador de pendientes baja de **2 a 0**.
5. ✅ El banner naranja de offline desaparece (si hay conexión nuevamente).
6. En DevTools → **Application** → IndexedDB → tabla `consumos_local` → hacer clic en **"Refresh"** (ícono de recarga).
7. ✅ Los 2 registros ahora tienen:
   - `sync_status: "synced"`
   - `server_id:` un UUID del servidor (el ID del movimiento en BD)
   - `sync_timestamp:` fecha/hora de sincronización

### Paso A4.5 — Verificar en historial que no hay duplicados

1. En la vista de consumo, ir a la sección **"Historial"**.
2. ✅ Aparecen 2 nuevos registros SALIDA (uno por `"Test offline A"` y otro por `"Test offline B"`).
3. ✅ **No** hay registros duplicados — cada `idempotencyKey` solo generó 1 movimiento.

### Paso A4.6 — Sincronización manual con botón

1. Activar modo offline nuevamente (DevTools → Network → Offline).
2. Registrar 1 consumo offline (cantidad 3, observación `"Test manual sync"`).
3. Restaurar conexión.
4. **Antes** de que el SyncManager actúe automáticamente, buscar el botón **"Sincronizar ahora"** en el banner o header.
5. Hacer clic en **"Sincronizar ahora"**.
6. ✅ El botón muestra un ícono de carga giratoria (spinner) durante ~1 segundo.
7. ✅ El contador baja a 0 y aparece confirmación.

### Paso A4.7 — Verificar error permanente (error de negocio)

1. Activar modo offline.
2. Registrar un consumo con la **cantidad exacta igual al stock disponible** (ej: stock = 5, consumir 5).
3. Restaurar conexión → SyncManager sincroniza → `sync_status: "synced"`.
4. Activar offline nuevamente.
5. Registrar un consumo del **mismo material con cantidad 1** (stock ahora = 0 en el servidor).
6. Restaurar conexión → SyncManager intenta sincronizar.
7. ✅ El servidor devuelve `422 STOCK_INSUFICIENTE` (error permanente).
8. En IndexedDB: el segundo consumo tiene `sync_status: "error"` y `sync_error: "Stock insuficiente..."`.
9. ✅ Los demás consumos de la cola (si hay) sí se sincronizan; solo el consumo inválido queda en error.

---

---

# Actividad 5 — Pruebas Integradas: Consumo, Inventario, Offline/Sync y Trazabilidad

**CA:** Stock nunca queda negativo; sincronización conserva relaciones; `audit_log` registra la operación.

## Qué se implementó

**29 pruebas de integración** en [`sprint9_consumo_inventario.test.js`](file:///e:/Ryzen5/Documents/Sistema_ICARO/backend/tests/sprint9_consumo_inventario.test.js):

| Grupo | Tests | CA que cubre |
|-------|-------|-------------|
| Grupo 1 (tests 1-5) | Materiales disponibles — RBAC por rol | CA Act.1: solo proyecto autorizado |
| Grupo 2 (tests 6-13) | Consumo transaccional — RBAC + validaciones entrada | CA Act.2: solo Residente/Admin consumen |
| Grupo 3 (tests 14-18) | Validaciones de seguridad con mock Prisma | CA Act.3: stock insuficiente, proyecto ajeno |
| Grupo 4 (tests 19-20) | Estrategia offline cliente — consumo mock | CA Act.4: movimiento SALIDA correcto sin BD |
| Grupo 5 (tests 21-26) | Historial + audit_log en transacción (mock) | CA Act.5: audit_log, cantidadResultante ≥ 0 |
| Grupo 6 (tests 27-29) | Rollback transaccional | CA Act.5: stock nunca negativo, sin registros creados |

**Test 16 (clave para el CA de Act. 5):** usa un mock de `inventarioProyecto.upsert` que captura el valor de `cantidadDisponible` que intenta guardarse, y aserta `expect(stockGuardado).toBeGreaterThanOrEqual(0)`.

**Test 26 (audit_log):** el mock de `auditLog.create` verifica que se llamó con `tabla: 'movimiento_inventario'`, `operacion: 'INSERT'` e `idUsuario` presente.

**Test 27 (rollback completo):** stock insuficiente → ninguno de `movimientoInventario.create`, `inventarioProyecto.upsert` ni `auditLog.create` se ejecutan.

## Ejecutar los tests

```bash
cd backend
npx jest tests/sprint9_consumo_inventario.test.js --verbose --forceExit
```

Resultado esperado:
```
PASS tests/sprint9_consumo_inventario.test.js
  Sprint09 – Grupo 1: Materiales Disponibles del Proyecto (HU-S9-1)
    ✓ 1. GET materiales-disponibles sin token → 401 Unauthorized
    ✓ 2. GET materiales-disponibles con Residente → pasa RBAC
    ✓ 3. GET materiales-disponibles con Admin → 200/404/500
    ✓ 4. GET materiales-disponibles con Bodeguero → pasa RBAC
    ✓ 5. GET materiales-disponibles con Contador → pasa RBAC
  Sprint09 – Grupo 2: Consumo Transaccional — RBAC y Validaciones
    ✓ 6-13. [RBAC, cantidades inválidas, body vacío]
  Sprint09 – Grupo 3: Validaciones de Seguridad (HU-S9-3)
    ✓ 14. Stock insuficiente → 422 STOCK_INSUFICIENTE
    ✓ 15. Proyecto ajeno → 403 PROYECTO_NO_AUTORIZADO
    ✓ 16. Stock nunca queda negativo
    ✓ 17-18. Pre-validaciones cantidad negativa y campos faltantes
  Sprint09 – Grupo 4: Sincronización Offline — Estrategia Cliente
    ✓ 19-20. Consumo mock exitoso — SALIDA + stock actualizado
  Sprint09 – Grupo 5: Historial de Consumos y Trazabilidad
    ✓ 21-25. Historial RBAC + cantidadResultante ≥ 0
    ✓ 26. audit_log registrado en transacción
  Sprint09 – Grupo 6: Rollback Transaccional
    ✓ 27. Stock insuficiente → 0 escrituras en BD
    ✓ 28. Proyecto ajeno → inventario sin cambios
    ✓ 29. Proyecto INACTIVO → 422 PROYECTO_INACTIVO

Tests: 29 passed, 29 total
```

## Verificación desde el Frontend — Trazabilidad y Audit

### Paso A5.1 — Verificar que el audit_log se genera

1. Realizar un consumo exitoso desde la UI (ver Actividad 2, Paso A2.1).
2. Como Admin, consultar el audit log desde el panel de administración:
   - Navegar a **"Auditoría"** en la barra lateral (rol Admin requerido).
   - Buscar el registro más reciente con tabla `movimiento_inventario` y operación `INSERT`.
3. ✅ El registro existe y contiene:
   - `tabla: "movimiento_inventario"`
   - `operacion: "INSERT"`
   - `idUsuario:` el UUID del Residente que consumió
   - `datosAntes:` con `stockAnterior` y `tipoMovimiento: "SALIDA"`
   - `datosDespues:` con el stock resultante

### Paso A5.2 — Verificar que el stock nunca queda negativo

1. Tomar nota del stock actual de un material (ej: 3 unidades).
2. Consumir exactamente 3 unidades → stock = 0. ✅
3. Intentar consumir 1 unidad más → error `422 STOCK_INSUFICIENTE`. ✅
4. El stock en la UI y en la BD sigue siendo **0**, no **-1**. ✅

### Paso A5.3 — Verificar sincronización conserva relaciones

1. Hacer 3 consumos en modo offline (ver Act.4, pasos A4.1 y A4.2).
2. Restaurar conexión → SyncManager sincroniza.
3. Ir al historial de consumos.
4. ✅ Cada movimiento SALIDA tiene:
   - `material:` con nombre, código y unidad del material consumido
   - `proyecto:` con nombre y código del proyecto
   - `usuario:` con nombre y apellido del Residente
   - `cantidadAnterior` y `cantidadResultante` coherentes (no nulos)
5. ✅ La suma de todos los consumos sincronizados corresponde al total de stock descontado.

---

---

# ✅ Lista de Verificación Final — Sprint 9

## Actividad 1 — Interfaz Móvil

| # | Ítem | Cómo verificar | Estado |
|---|------|----------------|--------|
| 1 | Solo proyectos asignados en selector | Login Residente → selector proyecto | ☐ |
| 2 | Solo materiales con stock > 0 | Ver lista de materiales | ☐ |
| 3 | Buscador filtra materiales en tiempo real | Escribir en campo búsqueda | ☐ |
| 4 | Banner offline al desconectar red | DevTools → Network → Offline | ☐ |
| 5 | Sin token → 401 en API | Petición sin Authorization | ☐ |

## Actividad 2 — Descuento Transaccional

| # | Ítem | Cómo verificar | Estado |
|---|------|----------------|--------|
| 6 | Consumo exitoso → 201 con movimiento SALIDA | POST /consumir desde Postman o UI | ☐ |
| 7 | Stock baja visiblemente en la UI | Ver lista materiales tras consumo | ☐ |
| 8 | Historial muestra el movimiento | Ver sección historial | ☐ |
| 9 | Bodeguero no puede consumir (403) | Login bodeguero → intentar consumir | ☐ |
| 10 | Contador de cantidades en BD: anterior - consumido = actual | Consulta SQL en BD | ☐ |

## Actividad 3 — Bloqueos de Seguridad

| # | Ítem | Cómo verificar | Estado |
|---|------|----------------|--------|
| 11 | Cantidad > stock → 422 + inventario sin cambios | Consumir 99999 → verificar stock en BD | ☐ |
| 12 | Cantidad 0 → 400 | Campo cantidad = 0 → Confirmar | ☐ |
| 13 | Cantidad negativa → 400 | Campo cantidad = -5 → Confirmar | ☐ |
| 14 | Proyecto ajeno → 403 | API con proyecto no asignado | ☐ |
| 15 | Proyecto INACTIVO → 422 | Desactivar proyecto → intentar consumir | ☐ |
| 16 | Stock nunca < 0 | Consumir todo el stock → intentar 1 más | ☐ |

## Actividad 4 — Cola Offline

| # | Ítem | Cómo verificar | Estado |
|---|------|----------------|--------|
| 17 | Consumo offline → sync_status: "pending" en IndexedDB | DevTools → Application → IndexedDB | ☐ |
| 18 | Sync automático al reconectar | Desactivar offline → observar consola | ☐ |
| 19 | sync_status cambia a "synced" tras sync | Refrescar IndexedDB | ☐ |
| 20 | Sync manual con botón "Sincronizar ahora" | Clic en botón → spinner → contador = 0 | ☐ |
| 21 | Sin duplicados en BD tras sync | COUNT(*) por observación = 1 | ☐ |
| 22 | Error permanente (422) → sync_status: "error" | Consumir material sin stock offline | ☐ |
| 23 | Semáforo: doble sync no se ejecuta dos veces | Ver consola: "ya en curso" | ☐ |

## Actividad 5 — Tests y Trazabilidad

| # | Ítem | Cómo verificar | Estado |
|---|------|----------------|--------|
| 24 | 29/29 tests pasando | `npx jest tests/sprint9_consumo_inventario.test.js` | ☐ |
| 25 | audit_log registrado en cada consumo | Panel Auditoría como Admin | ☐ |
| 26 | cantidadResultante ≥ 0 en todos los movimientos | Ver historial | ☐ |
| 27 | Relaciones BD conservadas (material, proyecto, usuario) | Campos en historial completos | ☐ |
| 28 | Rollback completo en error → 0 registros creados | Tests 27-29 pasan | ☐ |
