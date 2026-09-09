# Diagramas de Arquitectura - Sistema ICARO

Fecha de evaluacion: 2026-04-29

Este documento resume la arquitectura real observada en el repositorio. Se basa en `docker-compose.yml`, `backend/src/server.js`, `backend/prisma/schema.prisma`, `frontend/src/App.jsx`, los routers de frontend/backend y la configuracion PWA de Vite.

## 1. Evaluacion Arquitectonica

### Estilo principal

El proyecto implementa un **monolito modular en capas** con un cliente **SPA/PWA**:

- **Frontend:** React 18 + Vite + TailwindCSS + React Router + Axios + Dexie/IndexedDB.
- **Backend:** Node.js + Express + Prisma ORM + JWT + middlewares de seguridad, auditoria y acceso por proyecto.
- **Datos:** PostgreSQL 17, administrado en local con pgAdmin y migraciones Prisma.
- **Despliegue local:** Docker Compose con servicios `frontend`, `backend`, `db` y `pgadmin`.

### Fortalezas

- Separacion clara entre cliente, API y base de datos.
- Backend organizado por capas: rutas, controladores, servicios, middlewares y Prisma.
- Modelo relacional consistente con el dominio de construccion: proyectos, rubros, avances, compras, inventario, contabilidad y auditoria.
- Seguridad transversal con JWT, RBAC y validacion de acceso por proyecto.
- PWA con cache de API e IndexedDB para escenarios de trabajo offline en obra/bodega.
- Auditoria append-only modelada en `audit_log`, buena decision para trazabilidad contractual.

### Riesgos y observaciones

- El frontend contiene muchas vistas y datos mock; no todos los modulos visibles parecen integrados aun al backend.
- En backend estan activas las rutas de `auth`, `users`, `proyectos`, `materiales` y `bodega`; `avances`, `compras` y `reportes` aparecen previstos o representados en el modelo, pero no conectados como rutas activas en `server.js`.
- La documentacion anterior contiene caracteres rotos por codificacion; conviene normalizar a UTF-8 o mantener ASCII en documentos nuevos.
- Hay artefactos pesados dentro del arbol de trabajo (`node_modules`, `dist`, ZIPs y PDFs). Para analisis y control de versiones conviene excluirlos o confirmar que `.gitignore` los cubre.

## 2. Diagrama de Arquitectura General

```mermaid
flowchart TB
  actorUsuario["Usuarios ICARO<br/>Admin, Residente, Bodeguero,<br/>Contador, Presidente"]

  subgraph browser["Navegador / Dispositivo movil"]
    pwa["PWA React + Vite<br/>Puerto 5173"]
    sw["Service Worker<br/>vite-plugin-pwa"]
    indexeddb["IndexedDB local<br/>Dexie: icaro_local_v1"]
    pwa --> sw
    pwa <--> indexeddb
  end

  subgraph docker["Docker Compose - icaro_network"]
    frontend["frontend<br/>React/Vite dev server"]
    backend["backend<br/>Node.js + Express<br/>Puerto 3001"]
    pgadmin["pgAdmin 4<br/>Puerto 5050"]
    db[("PostgreSQL 17<br/>Icaro_System<br/>Puerto 5432")]
  end

  actorUsuario --> pwa
  pwa -->|"HTTP /api via Vite proxy"| frontend
  frontend -->|"proxy /api -> backend:3001"| backend
  backend -->|"Prisma Client / TCP 5432"| db
  pgadmin -->|"administracion visual"| db
  sw -. "NetworkFirst cache API" .-> backend
  indexeddb -. "cola offline y cache local" .-> pwa
```

## 3. Diagrama de Contenedores

```mermaid
flowchart LR
  user["Usuario final"]

  subgraph frontendContainer["Contenedor frontend"]
    react["React App<br/>Routes + Views + Components"]
    axios["Axios instance<br/>JWT interceptor"]
    dexie["Dexie services<br/>materialesLocalService<br/>movimientosLocalService"]
    react --> axios
    react --> dexie
  end

  subgraph backendContainer["Contenedor backend"]
    express["Express server"]
    middleware["Middlewares<br/>helmet, cors, morgan,<br/>audit, auth, RBAC,<br/>projectAccess"]
    routes["Routes<br/>auth, users, proyectos,<br/>materiales, bodega"]
    controllers["Controllers"]
    services["Services<br/>audit, materiales, bodega"]
    prisma["Prisma Client"]
    express --> middleware --> routes --> controllers
    controllers --> services
    controllers --> prisma
    services --> prisma
  end

  postgres[("PostgreSQL<br/>schema Prisma")]

  user --> react
  axios -->|"REST /api/v1 + Bearer JWT"| express
  prisma --> postgres
```

## 4. Diagrama de Componentes Frontend

```mermaid
flowchart TB
  app["App.jsx<br/>BrowserRouter + AuthProvider"]
  auth["AuthContext<br/>login, logout, session state"]
  private["PrivateRoute<br/>protege rutas autenticadas"]
  dashboard["DashboardPage"]
  moduleRouter["ModuleRouterPage<br/>/module/:moduleId"]
  adminRouter["AdminRouterPage<br/>/admin/:section"]

  subgraph modules["Modulos funcionales"]
    obra["Obra<br/>progress, evidence, consumption"]
    compras["Compras<br/>requirements, review"]
    inventario["Inventario / Bodega<br/>catalogo, entrada, movimientos"]
    contabilidad["Contabilidad<br/>billing documents"]
    reportes["Reportes<br/>dashboard gerencial"]
    auditoria["Auditoria<br/>traceability"]
    admin["Administracion<br/>usuarios, proyectos, rubros,<br/>materiales, accesos"]
    sistema["Sistema<br/>validaciones y errores"]
  end

  subgraph support["Soporte UI y datos"]
    ui["components/ui<br/>Header, Sidebar, Modal, Drawer"]
    services["services/*<br/>usersApi, projects,<br/>materiales, bodega, rubros"]
    localdb["db/*<br/>Dexie IndexedDB"]
    mocks["data/mock*<br/>datos de prototipo"]
    helpers["utils/*<br/>helpers de dominio + axios"]
  end

  app --> auth
  app --> private
  private --> dashboard
  private --> moduleRouter
  private --> adminRouter
  moduleRouter --> obra
  moduleRouter --> compras
  moduleRouter --> inventario
  moduleRouter --> contabilidad
  moduleRouter --> reportes
  moduleRouter --> auditoria
  moduleRouter --> sistema
  adminRouter --> admin
  modules --> ui
  modules --> services
  modules --> localdb
  modules --> mocks
  modules --> helpers
```

## 5. Diagrama de Componentes Backend

```mermaid
flowchart TB
  client["Cliente PWA / REST consumer"]
  server["server.js<br/>Express app"]

  subgraph globalMiddleware["Middlewares globales"]
    helmet["helmet"]
    cors["cors"]
    morgan["morgan"]
    json["express.json"]
    auditMw["auditMiddleware<br/>/api/v1 CUD logging"]
  end

  subgraph authLayer["Seguridad"]
    requireAuth["requireAuth<br/>JWT verify"]
    requireRole["requireRole<br/>RBAC"]
    projectAccess["requireProjectAccess<br/>asignacion + fecha"]
    jwt["utils/jwt.js"]
  end

  subgraph apiRoutes["Rutas /api/v1"]
    authRoutes["auth.routes<br/>login, me, password"]
    usersRoutes["users.routes<br/>CRUD usuarios + roles"]
    proyectosRoutes["proyectos.routes<br/>proyectos + rubros bulk"]
    materialesRoutes["materiales.routes<br/>catalogo materiales"]
    bodegaRoutes["bodega.routes<br/>inventario + movimientos"]
  end

  subgraph controllers["Controladores"]
    authController["auth.controller"]
    usersController["users.controller"]
    materialesController["materiales.controller"]
    bodegaController["bodega.controller"]
  end

  subgraph services["Servicios"]
    auditService["audit.service"]
    materialesService["materiales.service"]
    bodegaService["bodega.service"]
  end

  prisma["PrismaClient"]
  db[("PostgreSQL")]

  client --> server
  server --> helmet --> cors --> morgan --> json --> auditMw
  auditMw --> apiRoutes
  apiRoutes --> authLayer
  authLayer --> jwt
  authRoutes --> authController
  usersRoutes --> usersController
  materialesRoutes --> materialesController
  bodegaRoutes --> bodegaController
  proyectosRoutes --> prisma
  authController --> prisma
  usersController --> prisma
  materialesController --> materialesService
  bodegaController --> bodegaService
  auditMw --> auditService
  auditService --> prisma
  materialesService --> prisma
  bodegaService --> prisma
  prisma --> db
```

## 6. Diagrama de Base de Datos

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

## 7. Diagrama de Base Local Offline

```mermaid
erDiagram
  MATERIALES_LOCAL ||--o{ INVENTARIO_LOCAL : cachea
  MATERIALES_LOCAL ||--o{ MOVIMIENTOS_INVENTARIO_LOCAL : referencia
  INVENTARIO_LOCAL ||--o{ MOVIMIENTOS_INVENTARIO_LOCAL : ajusta

  MATERIALES_LOCAL {
    string id PK
    string codigo
    string categoria
    string nombre
    boolean activo
    string sync_status
    string server_updated_at
  }

  INVENTARIO_LOCAL {
    string id_material PK
    string id_proyecto PK
    string sync_status
  }

  MOVIMIENTOS_INVENTARIO_LOCAL {
    string id PK
    string id_material
    string id_proyecto
    string id_usuario
    string tipo_movimiento
    string sync_status
    string local_created_at
  }
```

## 8. Flujo de Autenticacion y Seguridad

```mermaid
sequenceDiagram
  autonumber
  participant U as Usuario
  participant F as Frontend PWA
  participant A as Axios Interceptor
  participant B as Express API
  participant M as Auth/RBAC Middleware
  participant D as PostgreSQL

  U->>F: Ingresa email/password
  F->>B: POST /api/v1/auth/login
  B->>D: Busca usuario + rol
  D-->>B: Usuario encontrado
  B->>B: bcrypt.compare + jwt.sign
  B-->>F: token + user
  F->>F: Guarda icaro_token e icaro_user
  U->>F: Abre modulo protegido
  F->>A: Solicitud REST
  A->>B: Authorization: Bearer token
  B->>M: requireAuth
  M->>M: jwt.verify
  M->>M: requireRole / requireProjectAccess
  M-->>B: next()
  B->>D: Consulta o mutacion Prisma
  D-->>B: Resultado
  B-->>F: JSON
```

## 9. Flujo de Inventario con Offline First

```mermaid
sequenceDiagram
  autonumber
  participant BOD as Bodeguero
  participant PWA as PWA React
  participant IDB as IndexedDB Dexie
  participant API as Backend /api/v1/bodega
  participant PG as PostgreSQL

  BOD->>PWA: Registra entrada/salida/ajuste
  PWA->>PWA: Valida stock y campos
  alt Hay conexion
    PWA->>API: POST /proyectos/:idProyecto/movimientos
    API->>PG: Transaccion: movimiento + inventario
    PG-->>API: Stock actualizado
    API-->>PWA: Movimiento registrado
    PWA->>IDB: Guarda copia synced
  else Sin conexion
    PWA->>IDB: Guarda movimiento pending
    PWA-->>BOD: Muestra pendiente de sincronizacion
  end
  PWA->>PWA: Detecta regreso de red
  PWA->>IDB: Lee movimientos pending
  PWA->>API: Reintenta envio
  API->>PG: Aplica movimiento
  API-->>PWA: OK
  PWA->>IDB: Marca synced o error
```

## 10. Mapa de Endpoints Activos

| Area | Endpoint base | Estado observado | Componentes principales |
|---|---|---|---|
| Autenticacion | `/api/v1/auth` | Activo | `auth.routes`, `auth.controller`, `jwt.js` |
| Usuarios y roles | `/api/v1/users` | Activo | `users.routes`, `users.controller`, RBAC Admin |
| Proyectos y rubros | `/api/v1/proyectos` | Activo | `proyectos.routes`, `requireProjectAccess`, Prisma directo |
| Catalogo materiales | `/api/v1/materiales` | Activo | `materiales.routes`, `materiales.controller`, `materiales.service` |
| Bodega / inventario | `/api/v1/bodega` | Activo | `bodega.routes`, `bodega.controller`, `bodega.service` |
| Avances de obra | `/api/v1/avances` | Previsto | Modelo Prisma y vistas frontend; ruta no montada |
| Compras | `/api/v1/compras` | Previsto | Modelo Prisma y vistas frontend; ruta no montada |
| Reportes | `/api/v1/reportes` | Previsto | Vistas frontend; ruta no montada |

## 11. Recomendaciones

1. Normalizar la codificacion de documentos y comentarios fuente a UTF-8.
2. Mantener `docs/diagramas_arquitectura.md` como fuente viva de diagramas Mermaid.
3. Crear routers backend para los modulos que ya tienen modelo y UI: avances, compras, contabilidad y reportes.
4. Reducir dependencia de datos mock conforme se conecten las vistas al API.
5. Revisar `.gitignore` para confirmar exclusion de `node_modules`, `dist`, ZIPs generados y archivos temporales de Office.
6. Considerar un `docs/adr/` para registrar decisiones como monolito modular, JWT stateless, PostgreSQL, Prisma y PWA offline.
