# Sprint 8 — Bodega, Recepción Transaccional e Inventario

> **Sistema ICARO · CONSTRUCTORES BMGM S.A.S.**
> Período: Sprint 8 · Implementado: 2026-06-02
> Tests automatizados: **25/25 ✅**

---

## Resumen de Entregables

| # | Archivo | Tipo | Acción |
|---|---------|------|--------|
| 1 | `backend/src/services/bodega.service.js` | Backend Service | ✅ Modificado |
| 2 | `backend/src/controllers/bodega.controller.js` | Backend Controller | ✅ Modificado |
| 3 | `backend/src/routes/bodega.routes.js` | Backend Routes | ✅ Modificado |
| 4 | `backend/src/routes/proyectos.routes.js` | Backend Routes | ✅ Modificado (Bodeguero accede a todos los proyectos activos) |
| 5 | `frontend/src/services/bodega.service.js` | Frontend Service | ✅ Modificado |
| 6 | `frontend/src/views/inventario/BodegaDashboardView.jsx` | React View | ✅ Creado/Modificado |
| 7 | `frontend/src/views/inventario/BodegueroInboxView.jsx` | React View | ✅ Creado (Buzón de Recepciones) |
| 8 | `frontend/src/views/admin/MaterialsCatalogView.jsx` | React View | ✅ Modificado (lectura para Bodeguero) |
| 9 | `frontend/src/data/icaroData.js` | Config | ✅ Modificado (módulo warehouse-inbox) |
| 10 | `frontend/src/pages/dashboard/ModuleRouterPage.jsx` | Router | ✅ Modificado |
| 11 | `backend/tests/sprint8_bodega_inventario.test.js` | Tests | ✅ Creado |

---

## Cambios en Base de Datos

> [!IMPORTANT]
> **No se requiere ninguna migración de base de datos.**
> El esquema existente soporta completamente todos los CAs del Sprint 8:
> - `RequerimientoCompra` ya tiene el campo `estado` con valor `'APROBADO'`
> - `MovimientoInventario` ya existe con todos los campos necesarios
> - `InventarioProyecto` ya tiene `cantidadDisponible` con `@updatedAt`
> - `AuditLog` ya existe con la estructura correcta
> - `DetalleRequerimiento` ya tiene `cantidadRecibida` con `@default(0)`

---

## HU-S8-1: Interfaz del Bodeguero

### Criterio de Aceptación
La interfaz muestra **exclusivamente** los requerimientos en estado `APROBADO` y los movimientos de inventario, ambos **filtrados estrictamente por los proyectos a los que el bodeguero tenga autorización**.

### Implementación

**Backend:**
```
GET /api/v1/bodega/proyectos/:idProyecto/requerimientos-aprobados
```
- Añadido en `bodega.routes.js` dentro de `canRead` (Bodeguero incluido)
- Middleware `requireProjectAccess` garantiza filtro por proyecto autorizado
- `bodegaService.listarRequerimientosAprobados()` filtra `estado: 'APROBADO'`

**Frontend:**
- `BodegaDashboardView.jsx`: nueva vista con selector de proyectos y lista de reqs APROBADOS
- `fetchRequerimientosAprobados()` en `bodega.service.js` frontend

---

## HU-S8-2: Recepción Transaccional

### Criterio de Aceptación
Una recepción válida debe:
1. Incrementar el stock del proyecto
2. Generar automáticamente un `MovimientoInventario` con tipo `ENTRADA`
3. Ambas acciones en la **misma transacción** (atomicidad)

### Implementación

**Endpoint nuevo:**
```
POST /api/v1/bodega/proyectos/:idProyecto/requerimientos/:idRequerimiento/recepcionar
Body: { detallesRecepcion: [{idMaterial, cantidadRecibida, observacion?}] }
```

**`bodegaService.recepcionarMateriales()`** — dentro de un único `prisma.$transaction(async tx => {...})`:
1. Verifica requerimiento existe y estado = `'APROBADO'`
2. Valida que cantidad ≤ (solicitada - ya recibida)
3. Para cada detalle: `tx.movimientoInventario.create()` + `tx.inventarioProyecto.upsert()`
4. Actualiza `cantidadRecibida` en `DetalleRequerimiento`
5. Marca requerimiento como `RECIBIDO` si todo fue cubierto
6. Crea registro en `tx.auditLog` dentro de la misma transacción

---

## HU-S8-3: Bloqueos y Alertas en Recepción

### Criterio de Aceptación
- Si el requerimiento **NO está APROBADO** → abortar con error claro
- Si la **cantidad excede** la del requerimiento → abortar con error claro
- El frontend debe mostrar el error como **alerta visible**

### Implementación

**Errores controlados (422 Unprocessable Entity):**
```json
{ "error": "No se puede recepcionar...", "codigo": "REQUERIMIENTO_NO_APROBADO" }
{ "error": "Exceso en recepción...", "codigo": "CANTIDAD_EXCEDE_REQUERIMIENTO", "detalle": {...} }
```

**Frontend `BodegaDashboardView.jsx`:**
- El hook `handleConfirmarRecepcion` captura errores 4xx y los pone en `alertaError`
- El componente `AlertaBanner` los renderiza como banner rojo visible antes del formulario

---

## HU-S8-4: Consulta de Inventario

### Criterio de Aceptación
La consulta de inventario por proyecto debe mostrar:
- Saldo correcto
- Desglose (entradas, salidas, ajustes)
- Diferencia por movimientos pendientes o última sincronización

### Implementación

**`bodegaService.obtenerInventarioProyecto()`** retorna por cada material:
```json
{
  "stockActual": 150.0,
  "desglose": {
    "totalEntradas": 200.0,
    "totalSalidas": 50.0,
    "totalAjustes": 0.0,
    "saldoCalculado": 150.0,
    "diferencia": 0.0,
    "ultimoMovimiento": "2026-06-02T..."
  }
}
```
> La `diferencia = stockActual - saldoCalculado`. Si ≠ 0, indica ajustes manuales o inconsistencias.

---

## HU-S8-5: Pruebas y Auditoría

### Criterio de Aceptación
- Pruebas verifican el **rollback**: ante error en movimiento, stock no cambia
- `audit_log` se guarda correctamente tras recepción exitosa

### Implementación — `sprint8_bodega_inventario.test.js`

| Grupo | Tests | Verifica |
|-------|-------|---------|
| 1 | 5 tests | RBAC de recepción (401, 403, 400) |
| 2 | 3 tests | Bloqueos: body vacío, cantidad negativa, req inexistente |
| 3 | 4 tests | Requerimientos APROBADOS: RBAC y estructura de respuesta |
| 4 | 5 tests | Inventario con desglose: RBAC + estructura campos requeridos |
| 5 | 3 tests | **Rollback** con mock de Prisma + verificación de audit_log |
| 6 | 5 tests | Compatibilidad Sprint 3 (movimientos libres) |

**Total: 25 tests — 25/25 ✅**

---

## Rutas Nuevas — Resumen

```
# Sprint 8 — Nuevas
GET  /api/v1/bodega/proyectos/:id/requerimientos-aprobados
POST /api/v1/bodega/proyectos/:idProy/requerimientos/:idReq/recepcionar

# Sprint 3 — Mantenidas
POST /api/v1/bodega/proyectos/:id/movimientos
GET  /api/v1/bodega/proyectos/:id/movimientos
GET  /api/v1/bodega/proyectos/:id/inventario  (mejorado con desglose)
```

---

## Notas de Arquitectura

- **Patrón respetado**: Controller → Service → Prisma (mismo que Sprint 6 y 7)
- **Transacciones**: `prisma.$transaction(async tx => {...})` con `tx` local, nunca `prisma` global
- **Audit log dentro de la transacción**: a diferencia del Sprint 3, el audit_log de recepción **forma parte del mismo `$transaction`** para garantizar consistencia
- **Offline-first**: `recepcionarMateriales` en frontend NO tiene fallback offline (requiere BD)
- **Guard de rol**: `BodegaDashboardView` verifica `currentUser.roleName === 'Bodeguero'`

---

# 🔍 Verificación Manual — Paso a paso por Actividad

> [!NOTE]
> Usuarios necesarios para las pruebas: `residente@icaro.com` (Residente), `contador@icaro.com` (Contador), `gerencia@icaro.com` (Gerente/Presidente), `bodega@icaro.com` (Bodeguero), `admin@icaro.com` (Administrador).
> Asegúrese de que el proyecto esté encendido y respondiendo en `http://localhost:5173`.

---

## PREPARACIÓN: Crear un requerimiento de prueba
*Para verificar las actividades 1, 2, 3 y 4, necesitamos un requerimiento aprobado. Siga estos pasos:*

1. **Rol: Residente (`residente@icaro.com`)**
   - Inicie sesión en el Frontend.
   - Vaya a **Requerimientos de compra** -> **Nuevo requerimiento**.
   - Seleccione el proyecto `ALT-01 — Complejo Residencial Altavista`.
   - Agregue el material **Cemento Portland** con cantidad **50 kg**.
   - Guarde y envíe el requerimiento. Cierre sesión.
2. **Rol: Contador (`contador@icaro.com`)**
   - Inicie sesión. Vaya a **Requerimientos** (bandeja contable).
   - Ubique el requerimiento en la pestaña "Pendientes".
   - Ingrese al detalle y haga clic en **"Validar Requerimiento"**. Confirme. Cierre sesión.
3. **Rol: Gerente/Presidente (`gerencia@icaro.com`)**
   - Inicie sesión. Vaya a **Bandeja Gerencial** -> "Pendientes".
   - Abra el detalle del requerimiento y haga clic en **"Aprobar"**. Confirme. Cierre sesión.

---

Actividad: Interfaz del Bodeguero y Buzón de Recepciones

CA: La interfaz debe mostrar exclusivamente requerimientos en estado APROBADO y movimientos de inventario correspondientes a los proyectos autorizados. El menú superior debe incluir un buzón que notifique requerimientos aprobados y redirija al bodeguero. Roles no autorizados deben recibir un error de acceso denegado.

Comprobacion:
1. **Rol: Bodeguero (`bodega@icaro.com`)**
   - Inicie sesión en el Frontend.
   - Localice el ícono de la campana en la barra superior. Verifique que se despliega una notificación indicando que un requerimiento en el proyecto `ALT-01` está aprobado y listo para recepción.
   - Haga clic en la notificación y confirme que es redirigido automáticamente a la vista de **Bodega** con el proyecto `ALT-01` pre-seleccionado.
   - En la sección **"Proyecto activo"**, valide que al cambiar a un proyecto que no tiene requerimientos aprobados (ej. `TOR-03`), la lista se muestra vacía con un mensaje informativo de que no hay requerimientos pendientes.
   - Valide que no se listan requerimientos en borradores o en otros estados que no sean `'APROBADO'`.
2. **Rol: Residente (`residente@icaro.com`) o Contador (`contador@icaro.com`)**
   - Intente navegar manualmente escribiendo la URL `/module/inventory` en el navegador.
   - Verifique que la pantalla muestra el mensaje de **"No tiene acceso a esta sección"** (Acceso Denegado por RBAC).

---

Actividad: Recepción Transaccional e Incremento de Stock

CA: Permite realizar recepciones de materiales. Al registrar una recepción, se debe incrementar el stock del proyecto y generar un movimiento de tipo ENTRADA en la misma transacción de forma atómica. Permite recepciones parciales hasta completar el total requerido.

Comprobacion:
1. **Rol: Bodeguero (`bodega@icaro.com`)**
   - Vaya a la sección de **Bodega y Recepciones**, seleccione el proyecto `ALT-01`.
   - Haga clic sobre el requerimiento de Cemento Portland (50 kg) en la lista de requerimientos aprobados.
   - Ingrese la cantidad **20** en el campo "Cantidad a recibir". Escriba un comentario y presione **"Confirmar recepción"**.
   - Verifique que aparece un banner verde indicando el éxito de la operación.
   - Compruebe en la lista que la cantidad pendiente del requerimiento ahora es **30**.
   - Revise la sección de "Movimientos recientes" en la misma pantalla y confirme que aparece un nuevo movimiento de tipo **ENTRADA** por `20.00 kg` para ese material.
   - Ahora, seleccione de nuevo el mismo requerimiento, ingrese la cantidad **30** (saldo restante) y presione **"Confirmar recepción"**.
   - Valide que aparece el banner verde de confirmación y el requerimiento **desaparece** de la lista (cambió a estado `'RECIBIDO'`).
   - Confirme que en la sección "Movimientos recientes" se muestra el segundo registro de tipo **ENTRADA** por `30.00 kg`.

---

Actividad: Bloqueos y Alertas en Recepción

CA: Las recepciones que no cumplan las validaciones (requerimientos no aprobados o cantidades que excedan lo solicitado/pendiente) deben ser bloqueadas inmediatamente por el sistema, mostrando una alerta visual y garantizando que no se altera la base de datos (atomicidad).

Comprobacion:
1. **Rol: Bodeguero (`bodega@icaro.com`)**
   - Asegúrese de tener un requerimiento aprobado activo (puede crear otro de 50 kg siguiendo la preparación).
   - Ingrese a la vista de **Bodega**, seleccione el requerimiento aprobado.
   - Intente recibir un valor mayor al pendiente, por ejemplo, ingrese **60** en el campo "Cantidad a recibir" y haga clic en **"Confirmar recepción"**.
   - Verifique que el formulario no se borra ni se recarga, y que aparece un **Banner de Alerta Rojo** en pantalla indicando que la cantidad excede la pendiente del requerimiento.
2. **Rol: Administrador (`admin@icaro.com`) o vía Terminal de Base de Datos**
   - Conéctese al gestor de base de datos o ejecute una consulta en `pgAdmin` para verificar los movimientos de inventario de `ALT-01`:
     ```sql
     SELECT COUNT(*) FROM "MovimientoInventario" WHERE "idProyecto" = (SELECT id FROM "Proyecto" WHERE codigo = 'ALT-01');
     ```
   - Confirme que el número de registros de movimientos no se incrementó debido al rechazo atómico de la transacción.

---

Actividad: Consulta de Inventario por Proyecto

CA: La consulta de inventario debe mostrar el saldo actual y desglosado (total de entradas, salidas y saldo calculado de los movimientos registrados), permitiendo visualizar diferencias para garantizar consistencia.

Comprobacion:
1. **Rol: Bodeguero (`bodega@icaro.com`) o Residente (`residente@icaro.com`)**
   - Ingrese a la sección de **Bodega** (si es Bodeguero) o de consulta de inventarios.
   - Seleccione el proyecto `ALT-01`.
   - Ubique el material **Cemento Portland** en la tabla de **"Inventario actual"**.
   - Verifique que los valores correspondan exactamente a lo recepcionado en las pruebas:
     * **Stock Actual:** `50.00`
     * **Entradas:** `+50.00`
     * **Salidas:** `-0.00`
     * **Diferencia:** `0.00`
   - Cambie de proyecto en el selector activo (ej. a `TOR-03`) y valide que la tabla de inventario se actualiza dinámicamente mostrando el inventario de ese proyecto únicamente, sin persistir ni mezclar datos de `ALT-01`.

---

Actividad: Integridad, Pruebas y Auditoría Transaccional

CA: La implementación debe pasar todas las pruebas de regresión y de backend, asegurando el correcto funcionamiento del rollback y el almacenamiento consistente de los logs de auditoría en la tabla `AuditLog`.

Comprobacion:
1. **Rol: Desarrollador / Administrador (vía Terminal y Base de Datos)**
   - Abra la terminal y ejecute la suite de tests del Sprint 8:
     ```bash
     npx jest tests/sprint8_bodega_inventario.test.js --verbose
     ```
   - Verifique que la salida en consola indica que pasaron exitosamente los **25 tests (25/25 ✅)**.
   - Ejecute la siguiente consulta en su cliente SQL o pgAdmin para inspeccionar el historial de auditoría:
     ```sql
     SELECT tabla, operacion, "fechaAccion", "idUsuario"
     FROM "AuditLog"
     WHERE tabla = 'movimiento_inventario'
     ORDER BY "fechaAccion" DESC
     LIMIT 5;
     ```
   - Confirme que aparecen los registros de las recepciones exitosas previas con la operación `INSERT` y asociadas al `idUsuario` del Bodeguero.
