require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globales ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));
app.use(express.json());

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status : 'ok',
    service: 'icaro-backend',
    version: '1.0.0',
    time   : new Date().toISOString(),
  });
});

// ── Rutas principales (se implementarán por módulo) ─────────────────────────
// app.use('/api/v1/auth',      require('./routes/auth.routes'));
// app.use('/api/v1/proyectos', require('./routes/proyectos.routes'));
// app.use('/api/v1/avances',   require('./routes/avances.routes'));
// app.use('/api/v1/compras',   require('./routes/compras.routes'));
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
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║   ICARO BACKEND  — Puerto ${PORT}                ║
  ║   Env: ${process.env.NODE_ENV}                        ║
  ╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
