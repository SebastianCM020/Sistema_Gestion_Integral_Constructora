# Sistema_Gestion_Integral_Constructora
Sistema de Gestión integral para la constructora ICARO CONSTRUCCIONES realizado por Isaac Castro (7319) e Ivan Pulgar (7362).


Sistema web + PWA móvil para la gestión integral en la empresa **ICARO CONSTRUCTORES BMGM S.A.S.**
Realizado por **Isaac Castro (7319)** e **Ivan Pulgar (7362)**.

El sistema comprende la informatización de los procesos **técnicos (obra)**, **administrativos (compras e inventarios)** y **contables**, consolidándolos bajo una arquitectura moderna mediante separación de capas y principios orientados al dominio.

## Stack Tecnológico 💻
1. **Frontend / Mobile**: React.js, Vite, TailwindCSS, IndexedDB, PWA (Progressive Web Application).
2. **Backend**: Node.js, Express, Prisma ORM, JSON Web Tokens.
3. **Base de Datos**: PostgreSQL 16.
4. **Despliegue y Orquestación**: Docker, Docker Compose.

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
> **Nota:** La primera vez, Docker descargará las imágenes de SO base, instalará Node.js y descargará los paquetes `npm` de ambos, frontend y backend. Esto puede demorar un par de minutos. El flag `-d` libera la consola al final.

**Tip:** Si en el futuro solo detienes el servicio y quieres volverlo a iniciar, no hace falta el tag `--build`, bastará con `docker compose up -d`.

### 2. Verificar los Servicios
Al concluir la instalación, los siguientes 4 servicios estarán corriendo de forma local. Comprueba los enlaces en tu navegador de preferencia:

| Módulo / Servicio | Herramienta | URL a Revisar |
|---|---|---|
| **PWA Frontend** | React Vite | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | Node Express | [http://localhost:3001/health](http://localhost:3001/health) |
| **BD PostgreSQL** | Postgres 16 | Puerto `5432` en localhost |
| **Admin BD Visual** | pgAdmin 4 | [http://localhost:5050](http://localhost:5050) |

*Usuario pgAdmin: `admin@icaro.dev` | Clave pgAdmin: `admin123`*

### 3. Migración de Base de Datos y Restauración
El volumen Docker detectará que es el primer levante y leerá automáticamente el volcado que se encuentra en `docs/init-db/base.sql`, configurando la BD bajo el nombre **`Icaro_System`**.

Para aplicar los modelos de ORM en la base, ejecuta la migración de **Prisma** desde dentro del contenedor del backend utilizando el siguiente comando:

```powershell
docker compose exec backend npx prisma migrate dev --name init
```

### 4. ¿Cómo detener la arquitectura?
Para parar el servidor al final del día sin perder ningún dato (ya que cuenta con volumen persistente):
```powershell
docker compose down
```

---

## 📂 Documentación del Sistema (Carpeta `docs/`)
Toda la documentación teórica previa a la construcción ha sido movida a la sub-carpeta `docs`:
* `docs/pdfs/` : Contiene las transcripciones, levantamientos y requerimientos técnicos extraídos.
* `docs/diagramas_arquitectura.md` : Contiene los diagramas relacionales (Mermaid) y arquitectura base de microservicios C4.
* `docs/Product_Backlog_ICARO.xlsx` : El Product Backlog ágil oficial de SCRUM.
* `docs/Analisis_Inconsistencias_Historias_Usuario.pdf` : Consolidación y refinamiento de Historias de Usuario priorizadas según puntos de dolor.


Repositorio documentacion modificable: https://liveespochedu-my.sharepoint.com/:f:/g/personal/ivan_pulgar_espoch_edu_ec/IgCenZ1NeEhBRLLExxGkEsEfATmXHb7xzCFyfLwW1LRF0Yw?e=Wq0Z4m

Para parar el servicio: docker compose down

