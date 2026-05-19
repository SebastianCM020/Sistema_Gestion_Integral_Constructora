require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const { auditMiddleware } = require('./middlewares/audit.middleware');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globales ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));
app.use(express.json());
// Auditoría automática de acciones CUD en todas las rutas /api/v1
app.use('/api/v1', auditMiddleware);

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status : 'ok',
    service: 'icaro-backend',
    version: '1.0.0',
    time   : new Date().toISOString(),
  });
});

// ── Rutas principales ───────────────────────────────────────────────────────
app.use('/api/v1/auth',      require('./routes/auth.routes'));
app.use('/api/v1/users',     require('./routes/users.routes'));     // Act. 8 — CRUD usuarios
app.use('/api/v1/proyectos', require('./routes/proyectos.routes')); // Act. 9 — Acceso por proyecto
app.use('/api/v1/materiales',require('./routes/materiales.routes'));// Sprint 3 — HU-02 Catálogo
app.use('/api/v1/bodega',    require('./routes/bodega.routes'));    // Sprint 3 — HU-03 Bodega
app.use('/api/v1/avances',         require('./routes/avances.routes'));
app.use('/api/v1/planillas',       require('./routes/planillas.routes'));       // Sprint 05 — HU-16, HU-18
app.use('/api/v1/cierres-contables', require('./routes/cierresContables.routes')); // Sprint 05 — HU-17
app.use('/api/v1/gastos',          require('./routes/gastos.routes'));           // Sprint 05 — HU-19
app.use('/api/v1/compras',   require('./routes/compras.routes'));    // Sprint 6 — HU-06 Requerimientos
// app.use('/api/v1/reportes',  require('./routes/reportes.routes'));

// ── Manejador de errores global ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error  : err.message || 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ── Inicio del servidor ─────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║   ICARO BACKEND  — Puerto ${PORT}                ║
    ║   Env: ${process.env.NODE_ENV}                        ║
    ╚═══════════════════════════════════════════════╝
    `);
  });
}


module.exports = app;
