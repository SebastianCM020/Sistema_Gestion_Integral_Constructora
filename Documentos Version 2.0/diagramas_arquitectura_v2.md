# Diagramas de Arquitectura - Sistema ICARO

**Versión:** 2.0 actualizada  
**Estado:** Alineado con la implementación al cierre del Sprint 11  
**Fecha de actualización:** 2026-09-09

## 1. Arquitectura general

```mermaid
flowchart TB
  user[Usuarios: Admin, Presidente/Gerente, Contador, Auxiliar, Residente y Bodeguero]

  subgraph client[Cliente web PWA]
    react[React 18 + Vite]
    auth[AuthContext y React Router]
    axios[Axios con JWT]
    offline[Dexie / IndexedDB: caché y operaciones pendientes]
    react --> auth
    react --> axios
    react <--> offline
  end

  subgraph compose[Docker Compose: icaro_network]
    frontend[frontend: Vite, puerto 5173]
    backend[backend: Express, puerto 3001]
    redis[(redis: Redis 7, puerto 6379)]
    postgres[(db: PostgreSQL 17, host 5433)]
    pgadmin[pgadmin: puerto 5050]
  end

  user --> react
  axios -->|REST /api/v1 + Bearer JWT| backend
  react <-->|Socket.io| backend
  backend -->|Prisma| postgres
  backend -->|BullMQ| redis
  pgadmin --> postgres
  frontend --> backend
```

## 2. Componentes backend

```mermaid
flowchart TB
  client[Cliente PWA o REST] --> server[server.js / Express]

  subgraph middleware[Middlewares]
    secure[helmet, cors, morgan, express.json]
    auth[requireAuth + requireRole]
    project[requireProjectAccess]
    audit[auditMiddleware]
  end

  subgraph routes[Rutas activas: /api/v1]
    routeAuth[auth]
    routeUsers[users]
    routeProjects[proyectos]
    routeOperational[materiales, bodega, avances, compras, consumo]
    routeAccounting[cierres-contables, planillas, gastos]
    routeSupport[ordenes-cambio, audit-logs, reportes, test]
  end

  subgraph domain[Controladores y servicios]
    controllers[auth, avance, bodega, compras, consumo, cierre, materiales, ordenCambio y users]
    services[audit, bodega, compras, consumo, materiales, ordenCambio, notification, queue y storage]
  end

  prisma[Prisma Client] --> database[(PostgreSQL 17)]
  queue[BullMQ: pdf-generation] --> redis[(Redis 7)]
  storage[backend/uploads]

  server --> secure --> audit --> routes
  routes --> auth
  routes --> project
  routes --> controllers --> services --> prisma
  services --> queue
  services --> storage
```

## 3. Modelo relacional vigente

```mermaid
erDiagram
  ROL ||--o{ USUARIO : asigna
  USUARIO ||--o{ ASIGNACION_PROYECTO_USUARIO : tiene
  PROYECTO ||--o{ ASIGNACION_PROYECTO_USUARIO : permite
  USUARIO ||--o{ PROYECTO : responsable
  PROYECTO ||--o{ RUBRO : contiene
  PROYECTO ||--o{ AVANCE_OBRA : registra
  RUBRO ||--o{ AVANCE_OBRA : referencia
  USUARIO ||--o{ AVANCE_OBRA : registra_valida
  AVANCE_OBRA ||--o{ EVIDENCIA_FOTOGRAFICA : adjunta
  PROYECTO ||--o{ REQUERIMIENTO_COMPRA : pertenece
  USUARIO ||--o{ REQUERIMIENTO_COMPRA : solicita_aprueba
  REQUERIMIENTO_COMPRA ||--o{ DETALLE_REQUERIMIENTO : contiene
  MATERIAL ||--o{ DETALLE_REQUERIMIENTO : detalla
  MATERIAL ||--o{ INVENTARIO_PROYECTO : tiene_stock
  PROYECTO ||--o{ INVENTARIO_PROYECTO : almacena
  MATERIAL ||--o{ MOVIMIENTO_INVENTARIO : afecta
  PROYECTO ||--o{ MOVIMIENTO_INVENTARIO : registra
  USUARIO ||--o{ MOVIMIENTO_INVENTARIO : ejecuta
  PROYECTO ||--o{ CIERRE_MENSUAL : cierra
  USUARIO ||--o{ CIERRE_MENSUAL : ejecuta
  CIERRE_MENSUAL ||--o| CONSOLIDACION_MENSUAL : resume
  CIERRE_MENSUAL ||--o{ PLANILLA_PDF : genera
  USUARIO ||--o{ PLANILLA_PDF : solicita
  PROYECTO ||--o{ VALIDACION_PRE_CIERRE : valida
  USUARIO ||--o{ VALIDACION_PRE_CIERRE : ejecuta
  PROYECTO ||--o{ ORDEN_CAMBIO : afecta
  RUBRO ||--o{ ORDEN_CAMBIO : modifica
  USUARIO ||--o{ ORDEN_CAMBIO : solicita_aprueba
  USUARIO ||--o{ NOTIFICACION_SISTEMA : recibe
  USUARIO ||--o{ AUDIT_LOG : realiza
```

## 4. Persistencia local offline

```mermaid
erDiagram
  MATERIALES_LOCAL ||--o{ INVENTARIO_LOCAL : cachea
  MATERIALES_LOCAL ||--o{ MOVIMIENTOS_INVENTARIO_LOCAL : referencia
  INVENTARIO_LOCAL ||--o{ MOVIMIENTOS_INVENTARIO_LOCAL : ajusta
  AVANCES_LOCAL {
    string id PK
    string idProyecto
    string idRubro
    string sync_status
    string local_created_at
  }
  CONSUMOS_LOCAL {
    string id PK
    string idempotencyKey UK
    string idProyecto
    string idMaterial
    string idUsuario
    string sync_status
    string local_created_at
  }
```

Las tablas locales existen en `frontend/src/db/database.js`. Sus estados son `pending`, `synced` y `error`. La integración offline debe probarse por módulo antes de declararse completamente entregada.

## 5. Flujo de cierre y planilla

```mermaid
sequenceDiagram
  participant U as Contador/Admin
  participant API as Cierres API
  participant DB as PostgreSQL
  participant Q as BullMQ/Redis
  participant W as PDF Worker
  participant S as Storage local

  U->>API: POST /cierres-contables/validar
  API->>DB: Verifica operaciones y periodo
  DB-->>API: Resultado de validación
  API-->>U: Válido o errores 422
  U->>API: POST /cierres-contables/ejecutar
  API->>DB: Transacción, consolidación, hash y cierre
  API-->>U: Cierre generado
  U->>API: POST /planillas/generate/:cierreId
  API->>DB: Crea PlanillaPdf PENDING
  API->>Q: Encola pdf-generation
  API-->>U: 202 Accepted
  Q->>W: Procesa trabajo
  W->>S: Guarda PDF
  W->>DB: Actualiza estado y URL
```

## 6. Notas de coherencia

- No se representa NGINX porque no está definido en `docker-compose.yml`.
- Redis no se usa para sesiones: JWT es stateless. Redis respalda la cola BullMQ de planillas.
- La consulta de auditoría existe como `GET /api/v1/audit-logs` y está limitada a Administrador del Sistema.
- La auditoría es append-only por convención de aplicación. Los triggers de base de datos para bloquear modificaciones siguen siendo una mejora pendiente.
- `requireProjectAccess` exige asignación vigente para Residente; los demás roles privilegiados, incluido Bodeguero, tienen acceso irrestricto en la implementación actual.