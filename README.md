# Sistema_Gestion_Integral_Constructora
Sistema de Gestión integral para la constructora ICARO CONSTRUCCIONES realizado por Isaac Castro (7319) e Ivan Pulgar (7362).


Sistema web + PWA móvil para la gestión integral en la empresa **ICARO CONSTRUCTORES BMGM S.A.S.**
Realizado por **Isaac Castro (7319)** e **Ivan Pulgar (7362)**.

El sistema comprende la informatización de los procesos **técnicos (obra)**, **administrativos (compras e inventarios)** y **contables**, consolidándolos bajo una arquitectura moderna mediante separación de capas y principios orientados al dominio.

## Stack Tecnológico 💻
1. **Frontend / Mobile**: React.js, Vite, TailwindCSS, IndexedDB, PWA (Progressive Web Application).
2. **Backend**: Node.js, Express, Prisma ORM, JSON Web Tokens.
3. **Base de Datos**: PostgreSQL **17** (imagen `postgres:17-alpine`).
4. **Despliegue y Orquestación**: Docker, Docker Compose.

> **Decisión técnica**: Se usa PostgreSQL 17 (última versión estable LTS al momento del desarrollo).
> La inicialización de BD se realiza con `pg_restore` sobre un dump binario (`base.dump`), no con un archivo SQL plano.

---

## 🚀 Guía de Inicialización Paso a Paso (Para Desarrolladores)

El proyecto está dockerizado para que el despliegue local sea idéntico en cualquier máquina de desarrollo, evitando tener que instalar gestores de bases de datos o versiones específicas de Node manualmente.

### Prerequisitos
- Instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- Tener `git` integrado en tu terminal.

### 1. Levantar la Arquitectura
Abre una consola o PowerShell en la ruta principal del proyecto y ejecuta:

```powershell
docker compose up --build -d
```
> **Nota:** La primera vez, Docker descargará las imágenes de SO base, instalará Node.js y descargará los paquetes `npm` de ambos, frontend y backend. Además generará el cliente Prisma automáticamente. Esto puede demorar un par de minutos. El flag `-d` libera la consola al final.

> **Nota sobre Windows / CRLF:** El proyecto incluye `.gitattributes` y un `Dockerfile` personalizado para el servicio `db` que convierte automáticamente los scripts shell de CRLF a LF. No se requiere acción manual.

**Tip:** Si en el futuro solo detienes el servicio y quieres volverlo a iniciar, no hace falta el tag `--build`, bastará con `docker compose up -d`.

### 2. Verificar los Servicios
Al concluir la instalación, los siguientes 4 servicios estarán corriendo de forma local. Comprueba los enlaces en tu navegador de preferencia:

| Módulo / Servicio | Herramienta | URL a Revisar |
|---|---|---|
| **PWA Frontend** | React Vite | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | Node Express | [http://localhost:3001/health](http://localhost:3001/health) |
| **BD PostgreSQL** | Postgres 17 | Puerto `5432` en localhost |
| **Admin BD Visual** | pgAdmin 4 | [http://localhost:5050](http://localhost:5050) |

*Usuario pgAdmin: `admin@icaro.dev` | Clave pgAdmin: `admin123`*

### 3. Inicialización de Base de Datos
La base de datos se inicializa **automáticamente** al primer arranque del contenedor `db`.

- El script `docs/init-db/01_restore.sh` ejecuta `pg_restore` sobre `docs/init-db/base.dump`.
- El cliente Prisma se genera automáticamente durante el build del backend (`RUN npx prisma generate` en el `Dockerfile`).
- No es necesario ejecutar `prisma migrate` manualmente en el primer arranque si el dump ya contiene el esquema.

Si necesitas aplicar migraciones adicionales de Prisma en desarrollo:

```powershell
docker compose exec backend npx prisma migrate dev --name <nombre_migracion>
```

Si necesitas resetear la base de datos desde cero (borra el volumen persistente):

```powershell
docker compose down -v
docker compose up --build -d
```

### 4. Navegación del Sistema
Una vez en http://localhost:5173, las rutas disponibles son:

| Ruta | Descripción |
|---|---|
| `/login` | Autenticación JWT |
| `/dashboard` | Panel principal con acceso a módulos |
| `/module/progress` | Módulo Técnico — Avance de Obra |
| `/module/evidence` | Módulo Técnico — Evidencia y Sync |
| `/module/consumption` | Módulo Técnico — Consumo de materiales |
| `/module/requirements` | Módulo Compras — Requerimientos |
| `/module/review` | Módulo Compras — Revisión de solicitudes |
| `/module/inventory` | Módulo Inventario — Recepción |
| `/module/inventory-movements` | Módulo Inventario — Movimientos |
| `/module/payroll` | Módulo Contabilidad — Documentos |
| `/module/reports` | Módulo Reportes — Dashboard |
| `/module/audit` | Módulo Auditoría — Trazabilidad |
| `/admin/users` | Admin — Usuarios y Permisos |
| `/admin/projects` | Admin — Gestión de Proyectos |
| `/admin/rubros` | Admin — Rubros por Proyecto |
| `/admin/materials` | Admin — Catálogo de Materiales |

### 5. ¿Cómo detener la arquitectura?
Para parar el servidor al final del día sin perder ningún dato (ya que cuenta con volumen persistente):
```powershell
docker compose down
```

---

## 📂 Documentación del Sistema (Carpeta `docs/`)
Toda la documentación teórica previa a la construcción ha sido movida a la sub-carpeta `docs`:
* `docs/pdfs/` : Contiene las transcripciones, levantamientos y requerimientos técnicos extraídos.
* `docs/arquitectura_sistema_icaro.md` : Contiene los diagramas relacionales (Mermaid) y arquitectura base de microservicios C4.
* `docs/init-db/base.dump` : Dump binario PostgreSQL con el esquema inicial del sistema.
* `docs/init-db/01_restore.sh` : Script de restauración ejecutado automáticamente al primer inicio del contenedor db.

Repositorio documentacion modificable: https://liveespochedu-my.sharepoint.com/:f:/g/personal/ivan_pulgar_espoch_edu_ec/IgCenZ1NeEhBRLLExxGkEsEfATmXHb7xzCFyfLwW1LRF0Yw?e=Wq0Z4m

Para parar el servicio: docker compose down

