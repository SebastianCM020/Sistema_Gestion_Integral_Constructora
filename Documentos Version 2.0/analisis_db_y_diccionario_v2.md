# Análisis y Diccionario de Datos - Sistema ICARO

**Versión:** 2.0 actualizada  
**Estado:** Alineado con `backend/prisma/schema.prisma` al cierre del Sprint 11  
**Fecha de actualización:** 2026-09-09

## 1. Fuente de verdad y estado de `base.sql`

La fuente de verdad del modelo implementado es `backend/prisma/schema.prisma`, respaldada por sus migraciones. El archivo `base.sql` raíz y sus copias históricas no deben usarse para reconstruir el entorno ni para deducir la estructura vigente: usan esquemas PostgreSQL separados (`seguridad`, `catalogo`, `obra`, `compras`, `contabilidad`, `auditoria`), mientras que Prisma mapea las tablas del sistema al esquema `public`.

Usar el SQL histórico como inicialización puede producir tablas ausentes, nombres incompatibles y relaciones desactualizadas. La corrección operativa es ejecutar las migraciones Prisma y usar los scripts de seed correspondientes; cualquier nueva modificación de datos debe empezar por actualizar `schema.prisma` y generar una migración versionada.

## 2. Resumen del esquema

El esquema actual contiene 19 modelos, agrupados así:

| Módulo | Tablas |
|---|---|
| Seguridad | `roles`, `usuarios`, `asignacion_proyecto_usuario` |
| Proyectos y obra | `proyectos`, `rubros`, `avance_obra`, `evidencia_fotografica` |
| Compras e inventario | `materiales`, `requerimiento_compra`, `detalle_requerimiento`, `inventario_proyecto`, `movimiento_inventario` |
| Contabilidad | `cierre_mensual`, `planilla_pdf`, `consolidacion_mensual`, `validacion_pre_cierre` |
| Transversales | `audit_log`, `ordenes_cambio`, `notificaciones_sistema` |

## 3. Diccionario de datos

### Seguridad y acceso

#### `roles`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | Int | PK, autoincrement | Identificador del rol. |
| `nombre` | String(50) | Unique | Nombre canónico del rol. |
| `descripcion` | Text | Nullable | Descripción funcional. |
| `created_at` | Timestamptz | Default now | Fecha de creación. |

#### `usuarios`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador del usuario. |
| `nombre`, `apellido` | String(100) | Required | Identidad mostrada. |
| `email` | String(150) | Unique | Credencial de acceso. |
| `password_hash` | String(255) | Required | Hash de contraseña. |
| `id_rol` | Int | FK `roles.id` | Rol asignado. |
| `activo` | Boolean | Default true | Habilitación de la cuenta. |
| `created_at`, `updated_at` | Timestamptz | Default/UpdatedAt | Fechas de control. |

#### `asignacion_proyecto_usuario`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador de asignación. |
| `id_usuario` | UUID | FK `usuarios.id` | Usuario asignado. |
| `id_proyecto` | UUID | FK `proyectos.id` | Proyecto autorizado. |
| `fecha_inicio`, `fecha_fin` | Date | Required | Periodo de vigencia. |
| `access_mode` | String(20) | Default `READ_WRITE` | Modo de acceso registrado. |
| `created_at` | Timestamptz | Default now | Fecha de creación. |

### Proyectos y obra

#### `proyectos`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador de obra. |
| `codigo` | String(30) | Unique | Código interno. |
| `nombre`, `descripcion` | String(200), Text | Descripción nullable | Identificación de la obra. |
| `entidad_contratante`, `numero_contrato` | String | Nullable | Información contractual. |
| `presupuesto_total` | Decimal(14,2) | Required | Presupuesto aprobado. |
| `fecha_inicio`, `fecha_fin_prevista` | Date | Required | Fechas de planificación. |
| `estado` | String(20) | Default `ACTIVO` | Estado operativo. |
| `id_responsable` | UUID | FK nullable `usuarios.id` | Responsable del proyecto. |
| `created_at` | Timestamptz | Default now | Alta del proyecto. |

#### `rubros`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador del rubro. |
| `id_proyecto` | UUID | FK `proyectos.id` | Proyecto propietario. |
| `codigo`, `unidad` | String | Required | Código y unidad de medida. |
| `descripcion` | Text | Required | Actividad presupuestada. |
| `precio_unitario` | Decimal(12,4) | Required | Costo unitario. |
| `cantidad_presupuestada`, `cantidad_ejecutada` | Decimal(12,4) | Ejecutada default 0 | Cantidades de control. |
| `activo` | Boolean | Default true | Disponibilidad para operación. |
| `created_at` | Timestamptz | Default now | Fecha de registro. |

#### `avance_obra`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador del avance. |
| `id_proyecto`, `id_rubro`, `id_residente` | UUID | FK | Referencias obligatorias. |
| `id_superintendente` | UUID | FK nullable | Usuario validador. |
| `cantidad_avance` | Decimal(12,4) | Required | Cantidad ejecutada. |
| `fecha_registro` | Date | Required | Fecha operativa. |
| `estado` | String(20) | Default `PENDING_SYNC` | `PENDING_SYNC`, `SYNCED`, `VALIDATED` o `REJECTED`. |
| `sync_timestamp` | Timestamptz | Nullable | Marca de sincronización. |
| `notas` | Text | Nullable | Observaciones. |
| `created_at` | Timestamptz | Default now | Fecha de alta. |

#### `evidencia_fotografica`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador de evidencia. |
| `id_avance` | UUID | FK, cascade | Avance asociado. |
| `url_imagen`, `storage_key` | String | Required | Ubicación pública y clave de almacenamiento. |
| `size_bytes`, `mime_type` | Int, String(50) | Nullable | Metadatos validados del archivo. |
| `timestamp_captura`, `created_at` | Timestamptz | Nullable/default | Fechas de captura y registro. |

### Compras e inventario

#### `materiales`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador de catálogo. |
| `codigo` | String(30) | Unique | Código normalizado. |
| `nombre`, `categoria`, `unidad` | String | Required | Información del material. |
| `descripcion` | Text | Nullable | Detalle opcional. |
| `activo` | Boolean | Default true | Disponible para nuevas operaciones. |
| `created_at`, `updated_at` | Timestamptz | Default/UpdatedAt | Control de cambios. |

#### `requerimiento_compra` y `detalle_requerimiento`
| Tabla | Campos principales | Relaciones y estado |
|---|---|---|
| `requerimiento_compra` | `id`, `id_proyecto`, `id_solicitante`, `id_aprobador`, `estado`, `justificacion`, `comentario_rechazo`, `fecha_solicitud`, `fecha_aprobacion` | Proyecto y usuarios relacionados. Estados: `EN_REVISION`, `APROBADO`, `RECHAZADO`, `RECIBIDO`. |
| `detalle_requerimiento` | `id`, `id_requerimiento`, `id_material`, `cantidad_solicitada`, `cantidad_recibida` | FK a requerimiento con cascade y a material; `cantidad_recibida` inicia en 0. |

#### `inventario_proyecto` y `movimiento_inventario`
| Tabla | Campos principales | Relaciones y estado |
|---|---|---|
| `inventario_proyecto` | `id_material`, `id_proyecto`, `cantidad_disponible`, `ultima_actualizacion` | PK compuesta material-proyecto; guarda el saldo actual. |
| `movimiento_inventario` | `id`, `id_material`, `id_proyecto`, `id_usuario`, `tipo_movimiento`, `cantidad`, `cantidad_anterior`, `cantidad_resultante`, `observacion`, `fecha_movimiento` | Libro de movimientos. Tipos: `ENTRADA`, `SALIDA`, `AJUSTE`. |

### Contabilidad

#### `cierre_mensual`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador de cierre. |
| `id_proyecto`, `id_contador` | UUID | FK | Proyecto y ejecutor. |
| `mes_anio` | String(7) | Required | Periodo `YYYY-MM`. |
| `estado_cierre` | String(10) | Default `ABIERTO` | `ABIERTO` o `CERRADO`. |
| `monto_total` | Decimal(14,2) | Default 0 | Total del periodo. |
| `hash_seguridad` | String(64) | Nullable | Hash de integridad. |
| `fecha_cierre`, `created_at` | Timestamptz | Nullable/default | Trazabilidad temporal. |

#### `planilla_pdf`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador de la planilla. |
| `id_cierre`, `id_generador` | UUID | FK | Cierre y solicitante. |
| `url_archivo`, `storage_key` | String | Nullable | Referencia al PDF generado. |
| `estado_gen` | String(15) | Default `PENDING` | `PENDING`, `GENERATING`, `READY` o `ERROR`. |
| `created_at` | Timestamptz | Default now | Fecha de solicitud. |

#### `consolidacion_mensual` y `validacion_pre_cierre`
| Tabla | Campos principales | Relaciones y estado |
|---|---|---|
| `consolidacion_mensual` | `id_cierre` unique, `id_proyecto`, `mes_anio`, totales de avance/compras/consumos, `snapshot_inventario`, `porcentaje_avance`, `hash_payload` | Snapshot 1:1 del cierre y consolidación del periodo. |
| `validacion_pre_cierre` | `id`, `id_proyecto`, `mes_anio`, `estado`, `errores`, `ejecutado_por`, `ejecutado_en` | Estados: `OK`, `BLOQUEADO`, `PENDIENTE`; conserva cada intento validación. |

### Transversales

#### `ordenes_cambio`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador de orden. |
| `id_proyecto`, `id_rubro` | UUID | FK | Proyecto y rubro afectados. |
| `id_solicitante`, `id_aprobador` | UUID | FK / nullable | Usuarios del flujo. |
| `estado` | String(20) | Default `PENDIENTE` | `PENDIENTE`, `APROBADA`, `RECHAZADA`. |
| `motivo`, `cantidad_adicional`, `comentario_aprobador` | Text, Decimal, Text | Cambio solicitado y decisión. |
| `fecha_solicitud`, `fecha_resolucion`, `created_at` | Timestamptz | Trazabilidad temporal. |

#### `notificaciones_sistema`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador de alerta. |
| `id_usuario_dest` | UUID | FK `usuarios.id` | Usuario destinatario. |
| `tipo`, `titulo`, `mensaje` | String, String, Text | Contenido de la notificación. |
| `id_referencia`, `tabla_referencia` | UUID, String | Relación lógica con la entidad de origen. |
| `leida`, `created_at` | Boolean, Timestamptz | Estado y creación. |

#### `audit_log`
| Campo | Tipo | Atributos | Descripción |
|---|---|---|---|
| `id` | BigInt | PK, autoincrement | Identificador secuencial. |
| `tabla`, `operacion`, `id_registro` | String, String, UUID | Recurso y operación `INSERT`, `UPDATE` o `DELETE`. |
| `id_usuario` | UUID | FK nullable | Autor de la operación. |
| `datos_antes`, `datos_despues` | Json | Nullable | Evidencia de cambio. |
| `ip_origen`, `timestamp` | String(45), Timestamptz | Origen y momento del evento. |

## 4. Integridad y pendientes técnicos

1. Las transacciones de recepción, consumo y cierre deben conservar su cobertura de pruebas porque modifican inventario y estados relacionados.
2. `audit_log` es append-only por diseño de aplicación. Para garantizarlo ante accesos directos a PostgreSQL falta una migración con triggers que rechace `UPDATE` y `DELETE`.
3. El esquema de Prisma y las migraciones deben actualizarse en el mismo cambio. Evitar editar `base.sql` como mecanismo de evolución.
4. Los documentos de arquitectura y diagramas deben actualizarse cada vez que se cree, elimine o modifique un modelo de Prisma.