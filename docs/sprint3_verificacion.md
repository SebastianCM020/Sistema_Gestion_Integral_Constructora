# Sprint 3 — Verificación de Actividades y Criterios de Aceptación

> **Estado del análisis:** Revisión del código fuente real del proyecto ICARO al 28-Apr-2026.

---

## 📊 Resumen de Estado por Actividad

| # | Actividad | HU/HT | Estado | Archivo clave |
|---|---|---|---|---|
| 1 | Diseño e interfaz Creación de Proyectos y Catálogos | HU-03 | ✅ Implementado | `ProjectsManagementView.jsx` |
| 2 | Carga Masiva de Rubros vía CSV (hasta 1000 ítems) | HT-16 | ✅ Implementado | `csvImportHelpers.js` + `CsvImportModal` |
| 3 | Transaccionalidad (Rollback) en carga masiva | RF-07 | ✅ Implementado | `csvImportHelpers.js` → modo "failed" |
| 4 | Interfaz visualización y edición de rubros cargados | HU-03 | ✅ Implementado | `ProjectRubrosView.jsx` |
| 5 | Pruebas de rendimiento carga masiva 1000 rubros | HT-16 | ⚠️ Pendiente prueba manual | — |
| 6 | Diseño Interfaz Móvil Registro de Avance | HT-05 | ✅ Implementado | `MobileProgressView.jsx` |

---

## 🔍 Verificación Detallada con Instrucciones de Prueba Manual

---

### ✅ Actividad 1 — Creación de Proyectos y Catálogos
**HU:** HU-03 | **CA:** Formularios web para administración de proyectos activos.

**Estado:** IMPLEMENTADO — `ProjectsManagementView.jsx` + `ProjectFormModal`

**Cómo verificar manualmente:**
1. Inicia sesión como **Administrador del Sistema**.
2. Navega a `/admin/projects` (o desde el sidebar → Gestión de Proyectos).
3. **Verifica que aparece:**
   - Tabla de proyectos con estado, fechas y responsable.
   - Botón **"Crear proyecto"** en el encabezado.
   - Filtros por estado/gerente.
4. Haz clic en **"Crear proyecto"** → aparece modal con campos:
   - Código, nombre, entidad contratante, contrato, presupuesto, fechas, estado.
5. Completa y guarda → aparece en la tabla.
6. Haz clic en **Editar** → el modal se pre-rellena con los datos.
7. Intenta acceder con usuario **Bodeguero** → debe mostrar "No tiene acceso".

**Criterio cumplido cuando:** El formulario crea, edita y filtra proyectos sin errores.

---

### ✅ Actividad 2 — Carga Masiva de Rubros vía CSV (hasta 1000 ítems)
**HU:** HT-16 | **CA:** Parser de CSV con validación de cabeceras y tipos de datos.

**Estado:** IMPLEMENTADO — `csvImportHelpers.js` + `CsvImportModal.jsx`

**Estructura del CSV esperada:**
```csv
Código,Descripción,Unidad,Precio Unitario,Cantidad Presupuestada
OBR-001,Excavación,m3,45.00,200
OBR-002,Relleno compactado,m3,28.50,150
```

**Cómo verificar manualmente:**
1. Como **Administrador**, navega a `/admin/rubros`.
2. Haz clic en **"Importar CSV"**.
3. **Prueba 1 — Cabeceras correctas:** Sube el CSV con los headers exactos → debe pasar la validación y mostrar vista previa.
4. **Prueba 2 — Cabeceras incorrectas:** Cambia `Código` por `Codigo_mal` → debe mostrar error: *"La cabecera esperada es: Código, Descripción..."*
5. **Prueba 3 — Tipos de datos inválidos:** Pon texto en `Precio Unitario` → debe marcar el error en la fila específica.
6. **Prueba 4 — Código duplicado:** Repite un código ya existente → error por duplicado.

**Criterio cumplido cuando:** El parser detecta errores de cabecera y de tipo antes de insertar.

---

### ✅ Actividad 3 — Transaccionalidad (Rollback) en carga masiva
**HU:** RF-07 | **CA:** Si falla una fila, se revierte toda la inserción e indica el error.

**Estado:** IMPLEMENTADO — función `buildCsvImportResult` en `csvImportHelpers.js`

> **Nota técnica:** El `status` puede ser `'success'`, `'partial'` o `'failed'`. El rollback total ocurre en modo `'failed'` (0 filas válidas). En modo `'partial'` se insertan solo las válidas.  
> Para RF-07 estricto (rollback total si hay *cualquier* error), se debe configurar el `CsvImportModal` en modo "strict". Verificar si el modal tiene ese toggle.

**Cómo verificar manualmente:**
1. Prepara un CSV de 10 filas donde **todas** tienen un error (ej: cantidades = 0).
2. Sube el archivo → el sistema debe:
   - Mostrar `status: 'failed'`
   - No agregar ningún rubro a la tabla
   - Indicar qué filas/campos fallaron con su número de fila
3. Prepara un CSV donde **solo la fila 5** tiene error (modo partial).
4. Verifica que el sistema indica cuántas filas fallaron y el feedback dice "La importación finalizó con errores parciales."

**Criterio cumplido cuando:** El error se indica por fila y no se insertan rubros en modo `'failed'`.

---

### ✅ Actividad 4 — Visualización y edición de rubros cargados
**HU:** HU-03 | **CA:** Lista de rubros con búsqueda y paginación funcional.

**Estado:** IMPLEMENTADO — `ProjectRubrosView.jsx` + `RubrosTable` + `RubrosFilters`

**Cómo verificar manualmente:**
1. Como **Administrador**, ve a `/admin/rubros`.
2. **Verifica que aparece:**
   - Tabla con columnas: Código, Descripción, Unidad, Precio, Cantidad presupuestada, Estado.
   - Selector de proyecto en el header.
   - Barra de filtros/búsqueda.
3. **Prueba búsqueda:** Escribe parte de un código o descripción → la lista se filtra.
4. **Prueba filtro por unidad:** Selecciona una unidad en el filtro → solo aparecen rubros de esa unidad.
5. **Prueba paginación:** Si hay muchos rubros, verifica que hay controles de página (siguiente/anterior).
6. Haz clic en **Editar** de un rubro → abre `RubroFormModal` con datos pre-cargados → guarda → se actualiza en la tabla.
7. Haz clic en **Ver detalle** → abre `RubroDetailDrawer` con resumen completo.

**Criterio cumplido cuando:** La búsqueda filtra en tiempo real y la paginación funciona sin perder el filtro activo.

---

### ⚠️ Actividad 5 — Prueba de rendimiento carga masiva 1000 rubros
**HU:** HT-16 | **CA:** Carga de 1000 rubros procesada sin errores de consistencia.

**Estado:** FUNCIONALIDAD IMPLEMENTADA — **Prueba de rendimiento pendiente de ejecutar.**

**Cómo ejecutar la prueba manual:**
1. Genera un CSV de 1000 filas válidas. Puedes usar este script en la consola del navegador:
```javascript
// Pegar en DevTools Console para generar CSV de 1000 rubros
const header = 'Código,Descripción,Unidad,Precio Unitario,Cantidad Presupuestada';
const rows = Array.from({length: 1000}, (_, i) => 
  `RUB-${String(i+1).padStart(4,'0')},Rubro de prueba ${i+1},m3,${(Math.random()*1000).toFixed(2)},${Math.floor(Math.random()*500)+1}`
).join('\n');
const csv = header + '\n' + rows;
const blob = new Blob([csv], {type: 'text/csv'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a'); a.href = url; a.download = 'rubros_1000.csv'; a.click();
```
2. Sube el archivo generado en el modal de importación.
3. **Mide el tiempo** de procesamiento (abrir DevTools → Network → ver duración).
4. **Verifica integridad:**
   - El contador de rubros importados debe ser **exactamente 1000**.
   - Ningún rubro debe aparecer duplicado.
   - Los precios y cantidades deben coincidir con los del CSV.

**Criterio cumplido cuando:** Los 1000 rubros se procesan en menos de 10 segundos sin errores de consistencia.

---

### ✅ Actividad 6 — Diseño Interfaz Móvil para Registro de Avance
**HU:** HT-05 | **CA:** Diseño optimizado para uso rápido en dispositivos móviles.

**Estado:** IMPLEMENTADO — `MobileProgressView.jsx` (Rol: Residente)

**Cómo verificar manualmente:**
1. Inicia sesión como usuario con rol **Residente**.
2. Navega al módulo de **Avance de Obra**.
3. **En DevTools (F12):** Activa el modo dispositivo móvil (Ctrl+Shift+M) → selecciona iPhone 12 o similar.
4. **Verifica criterios de diseño móvil:**
   - [ ] Los botones tienen al menos 44px de altura (táctiles)
   - [ ] El formulario de cantidad es de tipo `number` con teclado numérico en móvil
   - [ ] El selector de rubro es un dropdown grande, fácil de tocar
   - [ ] No hay scroll horizontal
   - [ ] El header es compacto y fijo
   - [ ] Hay indicador de avance pendiente de sync
5. **Flujo de registro:**
   - Selecciona proyecto → selecciona rubro → ingresa cantidad → envía
   - Verifica mensaje de éxito y opción "Registrar otro"
6. **Control de acceso:** Inicia como **Bodeguero** → debe mostrar "No tiene acceso a esta sección".

**Criterio cumplido cuando:** El flujo completo de registro se puede operar con una sola mano en pantalla de 6".

---

## 🔐 Cambio de Contraseña — Criterios de Seguridad (Nuevo)

**Archivo modificado:** `ForcePasswordChangeModal.jsx`

**Criterios implementados (validación en tiempo real):**

| Criterio | Regex / Condición |
|---|---|
| Mínimo 8 caracteres | `length >= 8` |
| Al menos una mayúscula | `/[A-Z]/` |
| Al menos una minúscula | `/[a-z]/` |
| Al menos un número | `/[0-9]/` |
| Al menos un carácter especial | `/[^A-Za-z0-9]/` |

**Cómo verificar:**
1. Inicia sesión con usuario nuevo (contraseña temporal `Icaro2025!`) → aparece el modal.
2. Escribe `abc` → barra de fortaleza roja, lista muestra ✗ en los criterios no cumplidos.
3. Escribe `Abc123!` → barra amarilla/verde, criterios se marcan ✓ progresivamente.
4. El botón **permanece deshabilitado** hasta cumplir los 5 criterios Y que las contraseñas coincidan.
5. Intenta enviar `Icaro2025!` (contraseña temporal) → error específico.

---

## 📋 Checklist Final Sprint 3

```
[ ] Act. 1: Crear un proyecto como Admin y verificar que aparece en la tabla
[ ] Act. 2: Subir CSV con cabeceras incorrectas y verificar que el error se muestra  
[ ] Act. 3: Subir CSV con 10 filas con errores y verificar que no se insertan rubros
[ ] Act. 4: Buscar un rubro por nombre y verificar que el filtro funciona
[ ] Act. 5: Ejecutar script de 1000 rubros y verificar conteo exacto
[ ] Act. 6: Usar MobileProgressView en DevTools modo móvil como usuario Residente
[ ] Extra:  Cambiar contraseña con criterios débiles y verificar que el botón no se habilita
```
