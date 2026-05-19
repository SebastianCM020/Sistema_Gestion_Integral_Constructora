# Análisis de Base de Datos - Sistema ICARO

## 1. Análisis de `base.sql`

Tras analizar el archivo `base.sql` (ubicado en la raíz y en `docs/init-db/`), se han identificado las siguientes discrepancias críticas con la estructura actual del proyecto:

### 1.1. Obsolescencia y Desincronización
- **Fecha de última modificación:** 14 de abril de 2026. Los diagramas de arquitectura y el esquema de Prisma actuales son de finales de abril y mayo de 2026.
- **Estructura de Schemas:** `base.sql` utiliza múltiples esquemas de PostgreSQL (`seguridad`, `catalogo`, `obra`, `compras`, `contabilidad`, `auditoria`). El proyecto actual, basado en **Prisma**, utiliza una estructura plana (esquema `public`), lo que causaría errores de conexión si el backend intenta acceder a las tablas sin los prefijos de esquema correctos.
- **Tablas Faltantes:** Faltan tablas fundamentales para la funcionalidad actual (Sprint 4 y 5), tales como:
  - `asignacion_proyecto_usuario` (Gestión de permisos por proyecto)
  - `inventario_proyecto` (Stock por obra)
  - `movimiento_inventario` (Libro de entradas y salidas)

### 1.2. Conclusión
El archivo `base.sql` **no mantiene la estructura correcta** del proyecto actual. Es una versión obsoleta que refleja un diseño modular de esquemas que fue simplificado para la implementación con Prisma.

---

## 2. Diccionario de Datos (Estructura Actual)

Este diccionario ha sido generado a partir del archivo `backend/prisma/schema.prisma`, que representa la fuente de verdad del sistema.

### Módulo: Seguridad y Acceso

#### Tabla: `roles` (Modelo: `Rol`)
| Campo | Tipo | Atributos | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Autoincrement | Identificador único del rol. |
| `nombre` | String(50) | Unique | Nombre del rol (ADMIN, RESIDENTE, etc.). |
| `descripcion` | Text | Optional | Descripción de las funciones del rol. |
| `created_at` | Timestamptz | Default(now) | Fecha de creación del registro. |

#### Tabla: `usuarios` (Modelo: `Usuario`)
| Campo | Tipo | Atributos | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid) | Identificador único del usuario. |
| `nombre` | String(100) | - | Nombre del usuario. |
| `apellido` | String(100) | - | Apellido del usuario. |
| `email` | String(150) | Unique | Correo electrónico (identificador de acceso). |
| `password_hash` | String(255) | - | Hash de la contraseña. |
| `id_rol` | Int | FK (roles.id) | Rol asignado al usuario. |
| `activo` | Boolean | Default(true) | Estado de la cuenta. |
| `created_at` | Timestamptz | Default(now) | Fecha de registro. |
| `updated_at` | Timestamptz | UpdatedAt | Última modificación del perfil. |

---

### Módulo: Proyectos y Asignaciones

#### Tabla: `proyectos` (Modelo: `Proyecto`)
| Campo | Tipo | Atributos | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid) | Identificador único del proyecto. |
| `codigo` | String(30) | Unique | Código interno del proyecto (ej. PRJ-001). |
| `nombre` | String(200) | - | Nombre de la obra. |
| `descripcion` | Text | Optional | Detalles del proyecto. |
| `entidad_contratante` | String(200) | Optional | Cliente o entidad que contrata. |
| `numero_contrato` | String(50) | Optional | Referencia contractual. |
| `presupuesto_total` | Decimal(14,2) | - | Monto total asignado a la obra. |
| `fecha_inicio` | Date | - | Fecha de inicio programada. |
| `fecha_fin_prevista` | Date | - | Fecha estimada de finalización. |
| `estado` | String(20) | Default("ACTIVO") | Estado actual (ACTIVO, FINALIZADO, etc.). |
| `id_responsable` | UUID | FK (usuarios.id) | Usuario responsable del proyecto. |
| `created_at` | Timestamptz | Default(now) | Fecha de creación en sistema. |

#### Tabla: `asignacion_proyecto_usuario` (Modelo: `AsignacionProyectoUsuario`)
| Campo | Tipo | Atributos | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid) | Identificador de la asignación. |
| `id_usuario` | UUID | FK (usuarios.id) | Usuario asignado. |
| `id_proyecto` | UUID | FK (proyectos.id) | Proyecto al que se asigna. |
| `fecha_inicio` | Date | - | Inicio de vigencia de la asignación. |
| `fecha_fin` | Date | - | Fin de vigencia de la asignación. |
| `access_mode` | String(20) | Default("READ_WRITE") | Nivel de acceso (Lectura/Escritura). |

---

### Módulo Técnico (Obra)

#### Tabla: `rubros` (Modelo: `Rubro`)
| Campo | Tipo | Atributos | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid) | Identificador del rubro. |
| `id_proyecto` | UUID | FK (proyectos.id) | Proyecto al que pertenece el rubro. |
| `codigo` | String(30) | - | Código del rubro (ej. 1.1.1). |
| `descripcion` | Text | - | Detalle de la actividad/item. |
| `unidad` | String(20) | - | Unidad de medida (m2, m3, kg, etc.). |
| `precio_unitario` | Decimal(12,4) | - | Costo por unidad. |
| `cantidad_presupuestada` | Decimal(12,4) | - | Cantidad total a ejecutar. |
| `cantidad_ejecutada` | Decimal(12,4) | Default(0) | Cantidad acumulada reportada. |
| `activo` | Boolean | Default(true) | Indica si el rubro es editable. |

#### Tabla: `avance_obra` (Modelo: `AvanceObra`)
| Campo | Tipo | Atributos | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid) | Identificador del reporte de avance. |
| `id_proyecto` | UUID | FK (proyectos.id) | Proyecto relacionado. |
| `id_rubro` | UUID | FK (rubros.id) | Rubro que se está reportando. |
| `id_residente` | UUID | FK (usuarios.id) | Usuario que registra el avance. |
| `id_superintendente` | UUID | FK (usuarios.id) | Usuario que valida el avance. |
| `cantidad_avance` | Decimal(12,4) | - | Cantidad ejecutada en este reporte. |
| `fecha_registro` | Date | - | Fecha de la actividad en obra. |
| `estado` | String(20) | Default("PENDING_SYNC") | PENDING_SYNC, SYNCED, VALIDATED, REJECTED. |
| `notas` | Text | Optional | Comentarios del residente o revisor. |

---

### Módulo Administrativo (Compras e Inventario)

#### Tabla: `materiales` (Modelo: `Material`)
| Campo | Tipo | Atributos | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid) | Identificador del material. |
| `codigo` | String(30) | Unique | Código de catálogo. |
| `nombre` | String(200) | - | Nombre descriptivo. |
| `categoria` | String(80) | - | Categoría para filtrado (Acero, Cemento, etc.). |
| `unidad` | String(20) | - | Unidad de medida. |
| `activo` | Boolean | Default(true) | Estado en el catálogo. |

#### Tabla: `inventario_proyecto` (Modelo: `InventarioProyecto`)
| Campo | Tipo | Atributos | Descripción |
| :--- | :--- | :--- | :--- |
| `id_material` | UUID | PK, FK (materiales.id) | Material en stock. |
| `id_proyecto` | PK, FK (proyectos.id) | Proyecto donde se encuentra el stock. |
| `cantidad_disponible` | Decimal(12,4) | Default(0) | Saldo actual en bodega de la obra. |
| `ultima_actualizacion` | Timestamptz | Default(now) | Fecha del último movimiento. |

#### Tabla: `movimiento_inventario` (Modelo: `MovimientoInventario`)
| Campo | Tipo | Atributos | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default(uuid) | Identificador del movimiento. |
| `id_material` | UUID | FK (materiales.id) | Material afectado. |
| `id_proyecto` | UUID | FK (proyectos.id) | Proyecto origen/destino. |
| `id_usuario` | UUID | FK (usuarios.id) | Bodeguero que registra. |
| `tipo_movimiento` | String(20) | - | ENTRADA, SALIDA, AJUSTE. |
| `cantidad` | Decimal(12,4) | - | Cantidad movida. |
| `cantidad_anterior` | Decimal(12,4) | - | Stock antes del movimiento. |
| `cantidad_resultante` | Decimal(12,4) | - | Stock después del movimiento. |

---

### Módulo de Auditoría

#### Tabla: `audit_log` (Modelo: `AuditLog`)
| Campo | Tipo | Atributos | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | PK, Autoincrement | ID inmutable de auditoría. |
| `tabla` | String(60) | - | Nombre de la tabla afectada. |
| `operacion` | String(10) | - | INSERT, UPDATE, DELETE. |
| `id_registro` | UUID | Optional | ID del registro afectado. |
| `id_usuario` | UUID | FK (usuarios.id) | Usuario que realizó la acción. |
| `datos_antes` | Json | Optional | Estado previo del registro (solo UPDATE/DELETE). |
| `datos_despues` | Json | Optional | Estado nuevo del registro (solo INSERT/UPDATE). |
| `ip_origen` | String(45) | Optional | Dirección IP del cliente. |
| `timestamp` | Timestamptz | Default(now) | Fecha y hora exacta de la acción. |
