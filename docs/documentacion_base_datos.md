# Documentación de Base de Datos — Sistema ICARO

**Proyecto:** ERP Corporativo para Constructora BMGM S.A.S.  
**Estado:** Sprint 5 (Sincronización Offline y Gestión de Bodega)  
**ORM:** Prisma v5  
**Motor:** PostgreSQL 17  

---

## 1. Diagrama Entidad-Relación (ER)

Este diagrama representa las relaciones lógicas entre las entidades principales del sistema.

```mermaid
erDiagram
  ROL ||--o{ USUARIO : asigna
  USUARIO ||--o{ ASIGNACION_PROYECTO_USUARIO : tiene
  PROYECTO ||--o{ ASIGNACION_PROYECTO_USUARIO : permite
  USUARIO ||--o{ PROYECTO : responsable

  PROYECTO ||--o{ RUBRO : contiene
  PROYECTO ||--o{ AVANCE_OBRA : registra
  RUBRO ||--o{ AVANCE_OBRA : avanza
  USUARIO ||--o{ AVANCE_OBRA : residente
  USUARIO ||--o{ AVANCE_OBRA : superintendente
  AVANCE_OBRA ||--o{ EVIDENCIA_FOTOGRAFICA : adjunta

  PROYECTO ||--o{ REQUERIMIENTO_COMPRA : solicita
  USUARIO ||--o{ REQUERIMIENTO_COMPRA : solicitante
  USUARIO ||--o{ REQUERIMIENTO_COMPRA : aprobador
  REQUERIMIENTO_COMPRA ||--o{ DETALLE_REQUERIMIENTO : incluye
  MATERIAL ||--o{ DETALLE_REQUERIMIENTO : pedido

  PROYECTO ||--o{ INVENTARIO_PROYECTO : posee
  MATERIAL ||--o{ INVENTARIO_PROYECTO : stock
  PROYECTO ||--o{ MOVIMIENTO_INVENTARIO : mueve
  MATERIAL ||--o{ MOVIMIENTO_INVENTARIO : afecta
  USUARIO ||--o{ MOVIMIENTO_INVENTARIO : registra

  PROYECTO ||--o{ CIERRE_MENSUAL : cierra
  USUARIO ||--o{ CIERRE_MENSUAL : contador
  CIERRE_MENSUAL ||--o{ PLANILLA_PDF : genera
  USUARIO ||--o{ PLANILLA_PDF : generador

  USUARIO ||--o{ AUDIT_LOG : ejecuta

  ROL {
    int id PK
    varchar nombre UK
    text descripcion
    timestamptz created_at
  }

  USUARIO {
    uuid id PK
    varchar nombre
    varchar apellido
    varchar email UK
    varchar password_hash
    int id_rol FK
    boolean activo
    timestamptz created_at
    timestamptz updated_at
  }

  PROYECTO {
    uuid id PK
    varchar codigo UK
    varchar nombre
    text descripcion
    varchar entidad_contratante
    varchar numero_contrato
    decimal presupuesto_total
    date fecha_inicio
    date fecha_fin_prevista
    varchar estado
    uuid id_responsable FK
    timestamptz created_at
  }

  ASIGNACION_PROYECTO_USUARIO {
    uuid id PK
    uuid id_usuario FK
    uuid id_proyecto FK
    date fecha_inicio
    date fecha_fin
    varchar access_mode
    timestamptz created_at
  }

  RUBRO {
    uuid id PK
    uuid id_proyecto FK
    varchar codigo
    text descripcion
    varchar unidad
    decimal precio_unitario
    decimal cantidad_presupuestada
    decimal cantidad_ejecutada
    boolean activo
    timestamptz created_at
  }

  AVANCE_OBRA {
    uuid id PK
    uuid id_proyecto FK
    uuid id_rubro FK
    uuid id_residente FK
    uuid id_superintendente FK
    decimal cantidad_avance
    date fecha_registro
    varchar estado
    timestamptz sync_timestamp
    text notas
    timestamptz created_at
  }

  EVIDENCIA_FOTOGRAFICA {
    uuid id PK
    uuid id_avance FK
    varchar url_imagen
    varchar storage_key
    int size_bytes
    varchar mime_type
    timestamptz timestamp_captura
    timestamptz created_at
  }

  MATERIAL {
    uuid id PK
    varchar codigo UK
    varchar nombre
    varchar categoria
    varchar unidad
    text descripcion
    boolean activo
    timestamptz created_at
    timestamptz updated_at
  }

  REQUERIMIENTO_COMPRA {
    uuid id PK
    uuid id_proyecto FK
    uuid id_solicitante FK
    uuid id_aprobador FK
    varchar estado
    text justificacion
    text comentario_rechazo
    timestamptz fecha_solicitud
    timestamptz fecha_aprobacion
    timestamptz created_at
  }

  DETALLE_REQUERIMIENTO {
    uuid id PK
    uuid id_requerimiento FK
    uuid id_material FK
    decimal cantidad_solicitada
    decimal cantidad_recibida
  }

  INVENTARIO_PROYECTO {
    uuid id_material PK FK
    uuid id_proyecto PK FK
    decimal cantidad_disponible
    timestamptz ultima_actualizacion
  }

  MOVIMIENTO_INVENTARIO {
    uuid id PK
    uuid id_material FK
    uuid id_proyecto FK
    uuid id_usuario FK
    varchar tipo_movimiento
    decimal cantidad
    decimal cantidad_anterior
    decimal cantidad_resultante
    text observacion
    timestamptz fecha_movimiento
    timestamptz created_at
  }

  CIERRE_MENSUAL {
    uuid id PK
    uuid id_proyecto FK
    uuid id_contador FK
    varchar mes_anio
    varchar estado_cierre
    decimal monto_total
    varchar hash_seguridad
    timestamptz fecha_cierre
    timestamptz created_at
  }

  PLANILLA_PDF {
    uuid id PK
    uuid id_cierre FK
    uuid id_generador FK
    varchar url_archivo
    varchar storage_key
    varchar estado_gen
    timestamptz created_at
  }

  AUDIT_LOG {
    bigint id PK
    varchar tabla
    varchar operacion
    uuid id_registro
    uuid id_usuario FK
    json datos_antes
    json datos_despues
    varchar ip_origen
    timestamptz timestamp
  }
```

---

## 2. Esquema Relacional

El sistema utiliza un **esquema plano (schema `public`)** para maximizar la compatibilidad con Prisma ORM y facilitar las migraciones. A continuación se detallan las tablas por módulos funcionales:

### 2.1 Módulo de Seguridad e Identidad
- **`roles`**: Almacena los perfiles de acceso (Admin, Residente, etc.).
- **`usuarios`**: Entidad central de autenticación (UUID).
- **`asignacion_proyecto_usuario`**: Tabla de ruptura que define el acceso temporal de un usuario a un proyecto específico.

### 2.2 Módulo de Proyectos y Obra
- **`proyectos`**: Información general de la obra, presupuesto y fechas.
- **`rubros`**: Items presupuestados asociados a un proyecto.
- **`avance_obra`**: Registro de ejecución diaria/semanal por rubro.
- **`evidencia_fotografica`**: Archivos adjuntos a cada reporte de avance.

### 2.3 Módulo de Suministros (Compras e Inventario)
- **`materiales`**: Catálogo maestro de insumos.
- **`requerimiento_compra`**: Solicitudes de material desde obra.
- **`detalle_requerimiento`**: Listado de items por solicitud.
- **`inventario_proyecto`**: Saldo de stock actual por obra (Primary Key compuesta: `id_material`, `id_proyecto`).
- **`movimiento_inventario`**: Libro de entradas y salidas (Trazabilidad de stock).

### 2.4 Módulo de Cierre y Auditoría
- **`cierre_mensual`**: Consolidado de costos y avances por mes.
- **`planilla_pdf`**: Documentos generados para facturación o control.
- **`audit_log`**: Registro inmutable de cada operación `INSERT`, `UPDATE` o `DELETE` realizada en el sistema.

---

## 3. Diccionario de Datos

### 3.1 Seguridad

#### Tabla: `roles`
| Columna | Tipo | Nulidad | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | Clave Primaria. |
| `nombre` | VARCHAR(50) | NO | Nombre único del rol. |
| `descripcion` | TEXT | SÍ | Detalle de permisos. |
| `created_at` | TIMESTAMPTZ | NO | Fecha de creación. |

#### Tabla: `usuarios`
| Columna | Tipo | Nulidad | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | NO | Clave Primaria. |
| `nombre` | VARCHAR(100) | NO | Nombres del usuario. |
| `apellido` | VARCHAR(100) | NO | Apellidos del usuario. |
| `email` | VARCHAR(150) | NO | Email único (Login). |
| `password_hash` | VARCHAR(255) | NO | Contraseña cifrada. |
| `id_rol` | INTEGER | NO | FK a `roles`. |
| `activo` | BOOLEAN | NO | Estado de la cuenta. |

---

### 3.2 Proyectos

#### Tabla: `proyectos`
| Columna | Tipo | Nulidad | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | NO | Clave Primaria. |
| `codigo` | VARCHAR(30) | NO | Código único del proyecto. |
| `nombre` | VARCHAR(200) | NO | Nombre de la obra. |
| `presupuesto_total` | DECIMAL(14,2) | NO | Monto total contratado. |
| `fecha_inicio` | DATE | NO | Inicio oficial. |
| `fecha_fin_prevista` | DATE | NO | Fin estimado. |
| `estado` | VARCHAR(20) | NO | ACTIVO, FINALIZADO, PAUSADO. |
| `id_responsable` | UUID | SÍ | FK a `usuarios` (Presidente/Director). |

---

### 3.3 Obra (Técnico)

#### Tabla: `rubros`
| Columna | Tipo | Nulidad | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | NO | Clave Primaria. |
| `id_proyecto` | UUID | NO | FK a `proyectos`. |
| `codigo` | VARCHAR(30) | NO | Código del rubro (ej: 1.2.1). |
| `descripcion` | TEXT | NO | Detalle de la tarea. |
| `unidad` | VARCHAR(20) | NO | m2, m3, kg, glb, etc. |
| `precio_unitario` | DECIMAL(12,4) | NO | Costo por unidad. |
| `cantidad_presupuestada` | DECIMAL(12,4) | NO | Meta total. |
| `cantidad_ejecutada` | DECIMAL(12,4) | NO | Acumulado actual. |

#### Tabla: `avance_obra`
| Columna | Tipo | Nulidad | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | NO | Clave Primaria. |
| `id_proyecto` | UUID | NO | FK a `proyectos`. |
| `id_rubro` | UUID | NO | FK a `rubros`. |
| `cantidad_avance` | DECIMAL(12,4) | NO | Cantidad reportada en el día. |
| `estado` | VARCHAR(20) | NO | PENDING_SYNC, VALIDATED, REJECTED. |
| `sync_timestamp` | TIMESTAMPTZ | SÍ | Fecha de sincronización con servidor. |

---

### 3.4 Suministros (Logística)

#### Tabla: `inventario_proyecto`
| Columna | Tipo | Nulidad | Descripción |
| :--- | :--- | :--- | :--- |
| `id_material` | UUID | NO | PK/FK a `materiales`. |
| `id_proyecto` | UUID | NO | PK/FK a `proyectos`. |
| `cantidad_disponible` | DECIMAL(12,4) | NO | Stock actual en la obra. |
| `ultima_actualizacion` | TIMESTAMPTZ | NO | Fecha del último movimiento. |

#### Tabla: `movimiento_inventario`
| Columna | Tipo | Nulidad | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | NO | Clave Primaria. |
| `id_material` | UUID | NO | FK a `materiales`. |
| `id_proyecto` | UUID | NO | FK a `proyectos`. |
| `tipo_movimiento` | VARCHAR(20) | NO | ENTRADA, SALIDA, AJUSTE. |
| `cantidad` | DECIMAL(12,4) | NO | Volumen del movimiento. |
| `cantidad_resultante` | DECIMAL(12,4) | NO | Stock después de la operación. |

---

### 3.5 Auditoría

#### Tabla: `audit_log`
| Columna | Tipo | Nulidad | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | NO | Clave Primaria inmutable. |
| `tabla` | VARCHAR(60) | NO | Entidad afectada. |
| `operacion` | VARCHAR(10) | NO | INSERT, UPDATE o DELETE. |
| `datos_antes` | JSONB | SÍ | Estado previo del registro. |
| `datos_despues` | JSONB | SÍ | Estado posterior del registro. |
| `timestamp` | TIMESTAMPTZ | NO | Momento exacto de la acción. |

---

## 4. Notas de Implementación

1. **Integridad Referencial**: Todas las relaciones cuentan con `ON DELETE RESTRICT` para proteger la integridad de los datos financieros, excepto `evidencia_fotografica` que usa `CASCADE` al eliminar un avance.
2. **Tipado de Datos**: Se utilizan `DECIMAL` para cálculos de precisión financiera y `TIMESTAMPTZ` para asegurar la trazabilidad horaria correcta en diferentes zonas.
3. **Auditoría Automática**: El sistema cuenta con un middleware en el backend que intercepta las peticiones de escritura y alimenta la tabla `audit_log` de forma transparente.
