# Análisis de Deuda Técnica — Sistema ICARO
## Documento de Cambios y Aplicación de Clean Code

**Versión:** 2.0 — Cierre de Deuda Técnica  
**Fecha:** Junio 2026  
**Estado:** ✅ IMPLEMENTADO

---

## Resumen Ejecutivo

Se identificaron y resolvieron **7 deudas técnicas críticas** del sistema ICARO, priorizadas por impacto en producción. Todas las implementaciones respetaron la arquitectura existente (Routes → Controllers → Services) y aplicaron principios de Clean Code.

---

## TAREA 1: Dashboard con KPIs Reales ✅ COMPLETADO

### Problema
`reportes.routes.js` retornaba datos muy limitados. El frontend `ReportsDashboardView.jsx` operaba en aislamiento con mocks.

### Solución Implementada
**Archivo:** `backend/src/routes/reportes.routes.js` (refactorizado completo)

#### Endpoints nuevos/mejorados:
| Endpoint | Método | Descripción |
|---|---|---|
| `/api/v1/reportes/dashboard` | GET | KPIs consolidados de todos los proyectos accesibles |
| `/api/v1/reportes/kpis` | GET | KPIs detallados de un proyecto específico (drill-down) |
| `/api/v1/reportes/exportar-excel` | GET | Exportación .xlsx del dashboard |

#### KPIs calculados (datos reales de BD):
- **Avance de obra**: % de avance por proyecto (monto ejecutado / monto presupuestado)
- **Estado de compras**: requerimientos totales, aprobados, recibidos, pendientes
- **Inventario**: entradas, salidas, stock disponible total
- **Tiempo**: días restantes / vencido
- **Cierres contables**: cantidad, monto total
- **Presupuesto**: ejecutado vs disponible (%)
- **Global consolidado**: promedio de avance, presupuesto total del portafolio

#### Clean Code aplicado:
- Separación de responsabilidades: helpers de cálculo aislados (`tieneAccesoGlobal`, `resolverProyectosAccesibles`, `calcularKpisProyecto`)
- `Promise.all` para consultas paralelas a la BD (7 queries simultáneas por proyecto)
- Manejo de errores consistente con respuestas estructuradas
- Compatibilidad de formato legacy con el frontend existente (campo `consolidaciones`)

---

## TAREA 2: Exportación a Excel ✅ COMPLETADO

### Problema
No existía funcionalidad de exportación a .xlsx. Los usuarios debían hacer capturas de pantalla.

### Solución Implementada
**Módulo:** `exceljs` (instalado como dependencia de producción)  
**Endpoint:** `GET /api/v1/reportes/exportar-excel`

#### Libro Excel generado (3 hojas):
1. **"Resumen Global"**: Tabla con KPIs principales de todos los proyectos. Formato condicional en % avance (verde/amarillo/rojo).
2. **"KPIs Detallados"**: Breakdown completo con compras, inventario, cierres. Filas alternadas para legibilidad.
3. **"Información"**: Metadata del reporte (generador, fecha, versión).

#### Características:
- Filas congeladas (header siempre visible)
- Colores corporativos (azul oscuro ICARO `#1F4E79`)
- Formato de moneda `"$"#,##0.00` y porcentaje `0.00%`
- Nombre de archivo dinámico: `icaro_dashboard_YYYY-MM-DD.xlsx`
- Lazy-load de ExcelJS (no penaliza el arranque del servidor)

#### package.json actualizado:
- Agregado `exceljs: ^4.4.0` en `dependencies`
- Nuevos scripts: `test:sprint10`, `test:sprint11`, `seed:test`

---

## TAREA 3: WebSocket — Estado de Proyectos ✅ COMPLETADO

### Problema
`socket.js` tenía la estructura básica (`init`, `getIO`) pero `PATCH /proyectos/:id/estado` no emitía eventos en tiempo real.

### Solución Implementada
**Archivo modificado:** `backend/src/routes/proyectos.routes.js`

```javascript
// Después de actualizar el estado en BD:
try {
  const io = socketModule.getIO();
  io.emit('proyecto:estadoCambiado', {
    idProyecto: id, nuevoEstado, nombre, mensaje, timestamp
  });
} catch {
  // Socket no inicializado (tests) — sin impacto en respuesta HTTP
}
```

#### Clean Code aplicado:
- `try/catch` aislado: el fallo del socket nunca interrumpe la respuesta HTTP
- Payload del evento con todos los campos necesarios para actualizar la UI sin re-fetch

---

## TAREA 4: Seed Data Completo para Tests ✅ COMPLETADO

### Problema
El único seed existente (`seed.js`) creaba solo roles y 2 usuarios. No había datos de prueba para inventario, compras ni cierres.

### Solución Implementada
**Archivo:** `backend/prisma/seed-test.js`

#### Datos generados (idempotente — puede ejecutarse N veces):

| Entidad | Cantidad | Detalle |
|---|---|---|
| Roles | 6 | Todos los del sistema |
| Usuarios | 7 | Uno por cada rol (email: `xxx.test@icaro.dev`, pass: `Test1234!`) |
| Proyectos | 3 | 2 ACTIVO + 1 FINALIZADO |
| Materiales | 20 | 5 categorías: Cemento, Acero, Áridos, Instalaciones, Acabados |
| Rubros | 15 | Distribuidos en los 3 proyectos |
| Requerimientos | 3 | Estados: APROBADO, RECIBIDO, EN_REVISION |
| Movimientos | 8 | 5 entradas + 3 salidas con stock actualizado |
| Avances de obra | 3 | Estados: VALIDATED, SYNCED |
| Cierres mensuales | 3 | 2 CERRADOS + 1 ABIERTO |

#### Uso:
```bash
npm run seed:test
# o con BD específica:
DATABASE_URL=postgresql://... node prisma/seed-test.js
```

---

## TAREA 5: Tests Sprint 10 — Cierre Contable ✅ COMPLETADO

### Archivo: `backend/tests/sprint10_cierre_contable.test.js`

#### 42 tests en 7 grupos:

| Grupo | Tests | Qué valida |
|---|---|---|
| 1 — Consolidación (Act-1) | 8 | RBAC completo del endpoint GET /consolidacion |
| 2 — Validación pre-cierre (Act-2) | 7 | RBAC + estructura `{valido, errores, advertencias}` |
| 3 — Ejecución cierre (Act-3+5) | 6 | RBAC + hash SHA-256 en respuesta |
| 4 — Auditoría Hash (Act-4) | 5 | Determinismo, unicidad, orden de claves del hash |
| 5 — Listado/Detalle | 7 | GET /, GET /:id, paginación |
| 6 — Rechazo de consumos | 7 | RBAC + validaciones de body |
| 7 — Rollback TX (Act-5) | 2 | Mock de $transaction para verificar rollback |

#### Ejecución:
```bash
npm run test:sprint10
```

---

## TAREA 6: Tests Sprint 11 — Seguridad y Calidad ✅ COMPLETADO

### Archivo: `backend/tests/sprint11_seguridad_calidad.test.js`

#### 56 tests en 9 grupos:

| Grupo | Tests | Qué valida |
|---|---|---|
| 1 — JWT Avanzado | 9 | Tokens: sin Bearer, malformado, secreto incorrecto, expirado, sin rol |
| 2 — RBAC completo | 12 | Matriz de acceso por módulo y rol (Usuarios, Cierres, Compras, Bodega) |
| 3 — Helmet Headers | 4 | X-Content-Type-Options, X-Frame-Options, eliminación de X-Powered-By |
| 4 — Validación Payloads | 6 | Body vacío, email inválido, cantidad negativa, formato de fecha |
| 5 — Test fixtures | 3 | /test/401, /test/403 (endpoints de diagnóstico) |
| 6 — Audit Log | 4 | RBAC + estructura del log (tabla, operacion, timestamp) |
| 7 — Bloqueo periodo cerrado | 2 | checkCierrePeriodo middleware con mock |
| 8 — Reportes RBAC | 9 | Dashboard, KPIs, exportar-excel por rol |
| 9 — Acceso por proyecto | 7 | requireProjectAccess vs Admin irrestricto |

#### Ejecución:
```bash
npm run test:sprint11
```

---

## TAREA 7: InventoryReceptionView → Backend Real ✅ COMPLETADO

### Problema
`InventoryReceptionView.jsx` importaba 4 mocks y nunca llamaba al backend:
- `mockApprovedRequests.js`
- `mockAssignedProjects.js`  
- `mockInventoryByProject.js`
- `mockReceptionHistory.js`

### Solución Implementada
**Archivo modificado:** `frontend/src/views/inventario/InventoryReceptionView.jsx`

#### Cambios:
1. **Eliminadas** las 4 importaciones de mocks
2. **Agregados** imports de servicios reales: `fetchRequerimientosAprobados`, `apiRecepcionarMateriales`, `fetchInventario`, `fetchProyectosAsignados`
3. **`cargarDatosIniciales()`**: fetch de proyectos reales al montar el componente
4. **`cargarDatosProyecto(id)`**: `Promise.all` con requerimientos e inventario del proyecto
5. **`handleConfirmReception()`**: ahora async, llama al backend real y actualiza datos locales tras éxito
6. **`handleSelectProject()`**: carga datos del proyecto si no están en caché

#### Adaptadores de formato:
- `adaptarRequerimiento(req)`: convierte el formato de BD al formato de la UI
- `adaptarInventario(inv)`: convierte el inventario del backend al formato de la UI

#### Estrategia offline:
- Se respeta la lógica `isOnline = navigator.onLine` existente
- En errores de red, `cargarDatosProyecto` silencia el error y retorna `[]`
- La recepción de materiales requiere conexión (comportamiento correcto)

---

## Colección Postman ✅ COMPLETADO

**Archivo:** `docs/ICARO_API_v1.postman_collection.json`

#### Grupos de endpoints:
1. Auth (login + auto-guardado de token)
2. Usuarios
3. Proyectos
4. Rubros
5. Avances de Obra
6. Compras (Requerimientos)
7. Bodega e Inventario
8. Materiales
9. Cierres Contables (Sprint 10)
10. Reportes y Dashboard (Sprint 11)
11. Órdenes de Cambio
12. Audit Logs
13. Seguridad — Test Fixtures

---

## Deuda Técnica Identificada Adicional (no implementada)

> [!NOTE]
> Los siguientes ítems fueron identificados durante el análisis pero no implementados por no ser críticos o por impactar severamente la arquitectura.

| Ítem | Motivo de diferimiento |
|---|---|
| Tests E2E con Playwright | Requiere instalar Playwright + configurar entorno de prueba visual |
| Planilla PDF desde el backend | Ya existe `pdfkit` instalado; pendiente especificación del template |
| `socket.js` eventos de compras/avances | Puede implementarse incrementalmente en cada módulo |
| Migración de `icaroData.js` a BD | Es un catálogo de permisos UI, no afecta seguridad de backend |

---

## Resumen de Archivos Creados/Modificados

| Archivo | Tipo | Sprint |
|---|---|---|
| `backend/src/routes/reportes.routes.js` | REEMPLAZADO | 11 |
| `backend/src/routes/proyectos.routes.js` | MODIFICADO | 7 |
| `backend/prisma/seed-test.js` | CREADO | — |
| `backend/tests/sprint10_cierre_contable.test.js` | CREADO | 10 |
| `backend/tests/sprint11_seguridad_calidad.test.js` | CREADO | 11 |
| `frontend/src/views/inventario/InventoryReceptionView.jsx` | MODIFICADO | 8 |
| `backend/package.json` | MODIFICADO | — |
| `docs/ICARO_API_v1.postman_collection.json` | CREADO | — |

---

## Comandos Rápidos

```bash
# Backend
npm run dev                  # Iniciar servidor de desarrollo
npm run seed:test            # Poblar BD con datos de prueba
npm run test                 # Todos los tests
npm run test:sprint10        # Tests de cierre contable
npm run test:sprint11        # Tests de seguridad y calidad
npm run test:security        # Tests de seguridad anteriores

# Base de datos
npm run prisma:studio        # Explorador visual de BD

# Seed original
npx prisma db seed           # Seed de producción (solo roles y admin)
```
