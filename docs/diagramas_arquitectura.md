# Diagramas — Sistema ICARO CONSTRUCTORES

---

## 1. Arquitectura por Capas (HT-01)

### 1.1 Vista general de capas y dependencias

```mermaid
graph TB
    subgraph INTERFACES["🌐 CAPA INTERFACES (HTTP / API)"]
        direction TB
        R1["auth.routes.js"]
        R2["avance.routes.js"]
        R3["compras.routes.js"]
        R4["reportes.routes.js"]
        MW1["authMiddleware"]
        MW2["roleMiddleware"]
        MW3["errorHandler"]
        VAL["validators/"]
    end

    subgraph APPLICATION["⚙️ CAPA APLICACIÓN (Casos de Uso)"]
        direction TB
        UC1["LoginUseCase"]
        UC2["RefreshTokenUseCase"]
        UC3["RegistrarAvanceUseCase"]
        UC4["SincronizarOfflineUseCase"]
        UC5["CrearRequerimientoUseCase"]
        UC6["AprobarRequerimientoUseCase"]
        UC7["GenerarPlanillaPDFUseCase"]
        DTO["DTOs (AvanceDTO, UsuarioDTO)"]
    end

    subgraph DOMAIN["🏛️ CAPA DOMINIO (Núcleo de Negocio)"]
        direction TB
        subgraph ENTITIES["Entidades"]
            E1["Usuario"]
            E2["Proyecto"]
            E3["Rubro"]
            E4["AvanceObra"]
            E5["RequerimientoCompra"]
            E6["CierreMensual"]
        end
        subgraph REPOS["Interfaces / Contratos"]
            I1["IUsuarioRepository"]
            I2["IProyectoRepository"]
            I3["IAvanceObraRepository"]
            I4["IRequerimientoRepository"]
        end
        subgraph SERVICES["Servicios de Dominio"]
            S1["AvanceObraService"]
            S2["RequerimientoService"]
            S3["PlanillaService"]
        end
    end

    subgraph INFRA["🔧 CAPA INFRAESTRUCTURA"]
        direction TB
        subgraph DB["Base de Datos"]
            PG1["PgUsuarioRepository"]
            PG2["PgProyectoRepository"]
            PG3["PgAvanceObraRepository"]
            PG4["PgRequerimientoRepository"]
            POOL["connection.js (Pool PG)"]
        end
        subgraph EXTERNAL["Servicios Externos"]
            S3SVC["S3StorageService (fotos)"]
            BULL["BullPDFQueue (cola async)"]
            MAIL["NodemailerService"]
        end
    end

    CLIENT["👤 Cliente (React Web / App Móvil)"]

    CLIENT -->|"HTTP REST JSON"| INTERFACES
    INTERFACES -->|"Invoca casos de uso"| APPLICATION
    APPLICATION -->|"Opera sobre entidades"| DOMAIN
    APPLICATION -->|"Llama implementaciones"| INFRA
    DOMAIN -.->|"Define contratos"| INFRA

    style INTERFACES fill:#1e40af,color:#fff,stroke:#1e3a8a
    style APPLICATION fill:#065f46,color:#fff,stroke:#064e3b
    style DOMAIN     fill:#7c2d12,color:#fff,stroke:#6b2011
    style INFRA      fill:#374151,color:#fff,stroke:#1f2937
    style CLIENT     fill:#4c1d95,color:#fff,stroke:#3b0764
```

---

### 1.2 Flujo de una solicitud — Registrar Avance de Obra

```mermaid
sequenceDiagram
    autonumber
    actor Residente as 📱 Residente (App)
    participant Route   as avance.routes.js
    participant Auth    as authMiddleware
    participant Role    as roleMiddleware
    participant UC      as RegistrarAvanceUseCase
    participant Entity  as AvanceObra (Entidad)
    participant IRepo   as IAvanceObraRepository
    participant PgRepo  as PgAvanceObraRepository
    participant DB      as PostgreSQL

    Residente->>Route: POST /api/v1/avance\n{idProyecto, idRubro, cantidad}
    Route->>Auth: Verificar JWT
    Auth-->>Route: ✅ req.user = {sub, rol}
    Route->>Role: requireRol("RESIDENTE","SUPERINTENDENTE")
    Role-->>Route: ✅ Rol permitido
    Route->>UC: execute({idProyecto, idRubro, idResidente, cantidad})

    UC->>IRepo: rubroRepo.findById(idRubro)
    IRepo->>PgRepo: findById()
    PgRepo->>DB: SELECT * FROM rubros WHERE id=$1
    DB-->>PgRepo: {rubro}
    PgRepo-->>UC: rubro

    UC->>Entity: new AvanceObra({...})
    Note over Entity: Valida cantidad > 0\nValida no excede presupuesto

    alt Excede presupuesto
        Entity-->>UC: ❌ Error EXCESO_PRESUPUESTO
        UC-->>Route: throw Error (status 422)
        Route-->>Residente: HTTP 422\n{"error":"Requiere orden de cambio"}
    else OK
        Entity-->>UC: ✅ avance válido
        UC->>IRepo: avanceRepo.save(avance)
        IRepo->>PgRepo: save()
        PgRepo->>DB: INSERT INTO avance_obra(...)
        DB-->>PgRepo: {id}
        PgRepo-->>UC: avanceGuardado
        UC-->>Route: avanceGuardado
        Route-->>Residente: HTTP 201\n{"id","estado":"PENDING_SYNC"}
    end
```

---

### 1.3 Mapa de dependencias entre capas (regla de dependencias)

```mermaid
graph LR
    subgraph REGLA["Regla: las flechas apuntan SOLO hacia adentro"]
        direction LR
        A["🌐 Interfaces"] --> B["⚙️ Aplicación"]
        B --> C["🏛️ Dominio"]
        D["🔧 Infraestructura"] --> C
        B --> D
    end

    style A fill:#1e40af,color:#fff
    style B fill:#065f46,color:#fff
    style C fill:#7c2d12,color:#fff
    style D fill:#374151,color:#fff
```

---

## 2. Esquema Relacional PostgreSQL (HT-04)

### 2.1 Diagrama Entidad-Relación completo

```mermaid
erDiagram

    ROLES {
        int id PK
        varchar nombre UK
        text descripcion
        timestamptz created_at
    }

    USUARIOS {
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

    PROYECTOS {
        uuid id PK
        varchar codigo UK
        varchar nombre
        text descripcion
        varchar entidad_contratante
        varchar numero_contrato
        numeric presupuesto_total
        date fecha_inicio
        date fecha_fin_prevista
        varchar estado
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

    RUBROS {
        uuid id PK
        uuid id_proyecto FK
        varchar codigo
        text descripcion
        varchar unidad
        numeric precio_unitario
        numeric cantidad_presupuestada
        numeric cantidad_ejecutada
        boolean activo
        timestamptz created_at
    }

    AVANCE_OBRA {
        uuid id PK
        uuid id_proyecto FK
        uuid id_rubro FK
        uuid id_residente FK
        uuid id_superintendente FK
        numeric cantidad_avance
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

    MATERIALES {
        uuid id PK
        varchar codigo UK
        varchar nombre
        varchar unidad
        boolean activo
        timestamptz created_at
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
        numeric cantidad_solicitada
        numeric cantidad_recibida
    }

    INVENTARIO_PROYECTO {
        uuid id_material PK
        uuid id_proyecto PK
        numeric cantidad_disponible
        timestamptz ultima_actualizacion
    }

    CIERRE_MENSUAL {
        uuid id PK
        uuid id_proyecto FK
        uuid id_contador FK
        varchar mes_anio
        varchar estado_cierre
        numeric monto_total
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
        jsonb datos_antes
        jsonb datos_despues
        inet ip_origen
        timestamptz timestamp
    }

    ROLES ||--o{ USUARIOS : "tiene"
    USUARIOS ||--o{ ASIGNACION_PROYECTO_USUARIO : "es asignado a"
    PROYECTOS ||--o{ ASIGNACION_PROYECTO_USUARIO : "tiene asignados"
    PROYECTOS ||--o{ RUBROS : "contiene"
    PROYECTOS ||--o{ AVANCE_OBRA : "registra"
    PROYECTOS ||--o{ REQUERIMIENTO_COMPRA : "genera"
    PROYECTOS ||--o{ CIERRE_MENSUAL : "tiene"
    RUBROS ||--o{ AVANCE_OBRA : "es avanzado en"
    AVANCE_OBRA ||--o{ EVIDENCIA_FOTOGRAFICA : "respaldado por"
    USUARIOS ||--o{ AVANCE_OBRA : "registra (residente)"
    USUARIOS ||--o{ REQUERIMIENTO_COMPRA : "solicita"
    USUARIOS ||--o{ REQUERIMIENTO_COMPRA : "aprueba"
    REQUERIMIENTO_COMPRA ||--o{ DETALLE_REQUERIMIENTO : "contiene"
    MATERIALES ||--o{ DETALLE_REQUERIMIENTO : "referenciado en"
    MATERIALES ||--o{ INVENTARIO_PROYECTO : "stock en"
    PROYECTOS ||--o{ INVENTARIO_PROYECTO : "administra"
    CIERRE_MENSUAL ||--o{ PLANILLA_PDF : "genera"
    USUARIOS ||--o{ PLANILLA_PDF : "solicita"
    USUARIOS ||--o{ AUDIT_LOG : "audita"
```

---

### 2.2 Módulos agrupados con flujos clave

```mermaid
graph TB
    subgraph SEG["🔐 Módulo: Seguridad y Acceso"]
        ROL["roles"]
        USR["usuarios"]
        APU["asignacion_proyecto_usuario"]
        ROL -->|"1:N id_rol"| USR
        USR -->|"1:N id_usuario"| APU
    end

    subgraph OBRA["🏗️ Módulo: Gestión de Obra"]
        PRY["proyectos"]
        RUB["rubros"]
        AVA["avance_obra"]
        EVI["evidencia_fotografica"]
        PRY -->|"1:N id_proyecto"| RUB
        PRY -->|"1:N id_proyecto"| AVA
        RUB -->|"1:N id_rubro"| AVA
        AVA -->|"1:N id_avance"| EVI
    end

    subgraph COMPRAS["📦 Módulo: Compras e Inventario"]
        MAT["materiales"]
        REQ["requerimiento_compra"]
        DET["detalle_requerimiento"]
        INV["inventario_proyecto"]
        REQ -->|"1:N id_requerimiento"| DET
        MAT -->|"1:N id_material"| DET
        MAT -->|"PK compuesta"| INV
    end

    subgraph CONTABLE["💰 Módulo: Contable y Reportes"]
        CIE["cierre_mensual"]
        PDF["planilla_pdf"]
        AUD["audit_log"]
        CIE -->|"1:N id_cierre"| PDF
    end

    PRY -->|"1:N"| APU
    PRY -->|"1:N"| REQ
    PRY -->|"1:N"| CIE
    PRY -->|"PK compuesta"| INV
    USR -->|"registra"| AVA
    USR -->|"solicita/aprueba"| REQ
    USR -->|"cierra"| CIE
    USR -->|"genera"| PDF
    USR -.->|"audita"| AUD

    style SEG     fill:#1e3a8a,color:#fff,stroke:#1e40af
    style OBRA    fill:#064e3b,color:#fff,stroke:#065f46
    style COMPRAS fill:#3b0764,color:#fff,stroke:#4c1d95
    style CONTABLE fill:#7c1d12,color:#fff,stroke:#991b1b
```

---

### 2.3 Políticas de integridad referencial

```mermaid
graph LR
    subgraph POLITICAS["Políticas ON DELETE por relación"]
        direction TB
        P1["rubros → proyectos\nON DELETE CASCADE\n(eliminar proyecto borra sus rubros)"]
        P2["avance_obra → proyectos\nON DELETE RESTRICT\n(no eliminar proyectos con avances)"]
        P3["evidencia_fotografica → avance_obra\nON DELETE CASCADE\n(borra evidencias con el avance)"]
        P4["detalle_requerimiento → requerimiento_compra\nON DELETE CASCADE"]
        P5["asignacion → usuarios/proyectos\nON DELETE RESTRICT\n(protege accesos activos)"]
        P6["audit_log → usuarios\nON DELETE SET NULL\n(conserva log aunque el usuario sea eliminado)"]
    end

    style P1 fill:#065f46,color:#fff
    style P2 fill:#7c2d12,color:#fff
    style P3 fill:#065f46,color:#fff
    style P4 fill:#065f46,color:#fff
    style P5 fill:#7c2d12,color:#fff
    style P6 fill:#374151,color:#fff
```

---

### 2.4 Flujo de estados — Avance de Obra

```mermaid
stateDiagram-v2
    [*] --> PENDING_SYNC : Residente guarda en campo (offline/online)
    PENDING_SYNC --> SYNCED : App sincroniza con servidor
    SYNCED --> VALIDATED : Superintendente valida técnicamente
    SYNCED --> REJECTED : Superintendente rechaza con comentario
    REJECTED --> SYNCED : Residente corrige y reenvía
    VALIDATED --> [*] : Disponible para cierre mensual del Contador
```

---

### 2.5 Flujo de estados — Requerimiento de Compra

```mermaid
stateDiagram-v2
    [*] --> EN_REVISION : Residente / Aux. Contabilidad crea requerimiento
    EN_REVISION --> APROBADO : Presidente aprueba
    EN_REVISION --> RECHAZADO : Presidente rechaza (comentario obligatorio)
    RECHAZADO --> EN_REVISION : Solicitante corrige y reenvía
    APROBADO --> RECIBIDO : Bodeguero confirma recepción física
    RECIBIDO --> [*] : Stock actualizado en inventario_proyecto
```

---

### 2.6 Flujo de estados — Cierre Mensual

```mermaid
stateDiagram-v2
    [*] --> ABIERTO : Sistema crea periodo al inicio del mes
    ABIERTO --> ABIERTO : Registro de avances y consumos del mes
    ABIERTO --> CERRADO : Contador ejecuta cierre mensual\n(requiere 0 transacciones PENDING)
    CERRADO --> [*] : Genera hash SHA-256 e inhabilita edición\nPlanilla PDF disponible para exportar
```
