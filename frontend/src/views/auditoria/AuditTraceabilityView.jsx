// ─────────────────────────────────────────────────────────────────────────────
// AuditTraceabilityView.jsx — Trazabilidad y Auditoría
//
// DATOS REALES: Conectado al endpoint GET /api/v1/audit-logs del backend.
// El audit_log es inmutable y registra toda acción CUD del sistema
// (requerimientos, aprobaciones, órdenes de cambio, etc.).
//
// RBAC: Solo Administrador del Sistema.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ShieldAlert, RefreshCw, Search, Filter, X, Clock,
  CheckCircle2, XCircle, Database, AlertCircle, Loader2,
  ChevronDown, ChevronUp, User, Server,
  Download, FileText, FileSpreadsheet,
} from 'lucide-react';
import { AppHeader }         from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import { fetchAuditLogs }    from '../../services/audit.service.js';

// ── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 30;

const TABLA_LABELS = {
  requerimiento_compra:    'Requerimiento de Compra',
  usuarios:                'Usuarios',
  proyectos:               'Proyectos',
  movimiento_inventario:   'Inventario / Bodega',
  avance_obra:             'Avance de Obra',
  ordenes_cambio:          'Órdenes de Cambio',
  notificaciones_sistema:  'Notificaciones',
  cierre_mensual:          'Cierre Mensual',
  consolidacion_mensual:   'Consolidación Mensual',
  validacion_pre_cierre:   'Validación Pre-cierre',
};

const OP_CONFIG = {
  INSERT: { label: 'Creación',  bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  UPDATE: { label: 'Edición',   bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-200'   },
  DELETE: { label: 'Eliminación', bg: 'bg-red-100',   text: 'text-red-800',     border: 'border-red-200'    },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

const tablaLabel = (tabla) => TABLA_LABELS[tabla] || tabla;

// ── Sub-componentes ──────────────────────────────────────────────────────────

function OperacionBadge({ operacion }) {
  const cfg = OP_CONFIG[operacion] || OP_CONFIG.UPDATE;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

/** Fila expandible con datos antes/después */
function AuditRow({ log }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.id}</td>
        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(log.timestamp)}</td>
        <td className="px-4 py-3">
          <OperacionBadge operacion={log.operacion} />
        </td>
        <td className="px-4 py-3 text-sm text-[#374151]">{tablaLabel(log.tabla)}</td>
        <td className="px-4 py-3">
          {log.userName ? (
            <div>
              <p className="text-sm font-medium text-[#111827]">{log.userName}</p>
              <p className="text-xs text-gray-400">{log.userEmail}</p>
            </div>
          ) : (
            <span className="text-xs italic text-gray-400">Sistema</span>
          )}
        </td>
        <td className="hidden px-4 py-3 text-xs text-gray-400 lg:table-cell font-mono truncate max-w-[120px]">
          {log.ipOrigen || '—'}
        </td>
        <td className="px-4 py-3">
          <button
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title={expanded ? 'Ocultar detalle' : 'Ver detalle'}
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#F9FAFB]">
          <td colSpan="7" className="px-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Datos antes */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Estado anterior (datos_antes)
                </p>
                <pre className="overflow-auto rounded-lg bg-gray-100 p-3 text-xs text-gray-600 max-h-48">
                  {log.datosAntes
                    ? JSON.stringify(log.datosAntes, null, 2)
                    : 'null (operación de creación)'}
                </pre>
              </div>
              {/* Datos después */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Estado nuevo (datos_despues)
                </p>
                <pre className="overflow-auto rounded-lg bg-gray-100 p-3 text-xs text-gray-600 max-h-48">
                  {log.datosDespues
                    ? JSON.stringify(log.datosDespues, null, 2)
                    : 'null (operación de eliminación)'}
                </pre>
              </div>
            </div>
            {log.idRegistro && (
              <p className="mt-3 text-xs text-gray-400">
                <span className="font-semibold">UUID del registro:</span>{' '}
                <span className="font-mono">{log.idRegistro}</span>
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export function AuditTraceabilityView({
  currentUser,
  isRestricted = false,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
}) {
  const modules          = getModulesForUser(currentUser);
  const isAuthorizedRole = currentUser.roleName === 'Administrador del Sistema';

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const tableRef = useRef(null);

  // ── Filtros ─────────────────────────────────────────────────────────────
  const [busqueda,    setBusqueda]   = useState('');
  const [filtTabla,   setFiltTabla]  = useState('');
  const [filtOp,      setFiltOp]     = useState('');
  const [filtDesde,   setFiltDesde]  = useState('');
  const [filtHasta,   setFiltHasta]  = useState('');
  const [filtUsuario, setFiltUsuario] = useState(''); // Sprint 10: filtro por email/nombre

  // ── Datos ────────────────────────────────────────────────────────────────
  const [logs,       setLogs]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(0);
  const [loadStatus, setLoadStatus] = useState('loading');

  // ── Carga ────────────────────────────────────────────────────────────────

  // ── Exportación ──────────────────────────────────────────────────────
  const exportarCSV = () => {
    const headers = ['ID','Fecha y Hora','Operación','Tabla','Usuario','Email','IP Origen'];
    const rows = logsFiltrados.map((l) => [
      l.id,
      l.timestamp ? new Date(l.timestamp).toLocaleString('es-CO') : '',
      l.operacion,
      l.tabla,
      l.userName || 'Sistema',
      l.userEmail || '',
      l.ipOrigen || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `audit_log_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const rows = logsFiltrados.map((l) =>
      `<tr><td>${l.id}</td><td>${l.timestamp ? new Date(l.timestamp).toLocaleString('es-CO') : ''}</td>` +
      `<td>${l.operacion}</td><td>${l.tabla}</td><td>${l.userName || 'Sistema'}</td><td>${l.ipOrigen || ''}</td></tr>`
    ).join('');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Audit Log ICARO</title>
      <style>body{font-family:sans-serif;font-size:11px;padding:16px}h1{font-size:16px;margin-bottom:8px}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}
      th{background:#1F4E79;color:white}tr:nth-child(even){background:#f5f5f5}</style></head>
      <body><h1>Registro de Auditoría — ICARO CONSTRUCTORES</h1>
      <p>Exportado: ${new Date().toLocaleString('es-CO')} | Registros: ${logsFiltrados.length}</p>
      <table><thead><tr><th>#ID</th><th>Fecha</th><th>Operación</th><th>Tabla</th><th>Usuario</th><th>IP</th></tr></thead>
      <tbody>${rows}</tbody></table></body></html>`);
    win.document.close();
    win.print();
  };

  const cargar = useCallback(async () => {
    if (!isAuthorizedRole || isRestricted) { setLoadStatus('forbidden'); return; }
    setLoadStatus('loading');
    try {
      const result = await fetchAuditLogs({
        limit:  PAGE_SIZE,
        offset: page * PAGE_SIZE,
        tabla:      filtTabla   || undefined,
        operacion:  filtOp      || undefined,
        desde:      filtDesde   || undefined,
        hasta:      filtHasta   || undefined,
      });
      setLogs(Array.isArray(result.data) ? result.data : []);
      setTotal(result.total || 0);
      setLoadStatus('ready');
    } catch (err) {
      console.error('[AuditTraceability] Error cargando logs:', err);
      setLoadStatus('error');
    }
  }, [isAuthorizedRole, isRestricted, page, filtTabla, filtOp, filtDesde, filtHasta]);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Filtrado local por búsqueda de texto + usuario ─────────────────────────
  const logsFiltrados = useMemo(() => {
    let result = logs;
    // Filtro por usuario (nombre o email)
    if (filtUsuario.trim()) {
      const u = filtUsuario.toLowerCase();
      result = result.filter((l) =>
        l.userName?.toLowerCase().includes(u) ||
        l.userEmail?.toLowerCase().includes(u)
      );
    }
    // Filtro por búsqueda libre
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      result = result.filter((l) =>
        l.tabla?.toLowerCase().includes(q) ||
        l.userName?.toLowerCase().includes(q) ||
        l.userEmail?.toLowerCase().includes(q) ||
        l.idRegistro?.toLowerCase().includes(q) ||
        l.ipOrigen?.toLowerCase().includes(q) ||
        JSON.stringify(l.datosDespues || {}).toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, busqueda, filtUsuario]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Stats rápidas del bloque actual
  const stats = useMemo(() => ({
    insert: logs.filter((l) => l.operacion === 'INSERT').length,
    update: logs.filter((l) => l.operacion === 'UPDATE').length,
    delete: logs.filter((l) => l.operacion === 'DELETE').length,
  }), [logs]);

  // ── Acceso denegado ──────────────────────────────────────────────────────

  if (!isAuthorizedRole || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Auditoría y Trazabilidad"
          onGoHome={onGoHome}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
          onOpenNavigation={() => setMobileNavOpen(true)}
        />
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation
            modules={modules}
            activeItemId="audit"
            isOpen={mobileNavOpen}
            currentUser={currentUser}
            onClose={() => setMobileNavOpen(false)}
            onGoHome={onGoHome}
            onOpenModule={onOpenModule}
            onOpenProfile={onOpenProfile}
            onLogout={onLogout}
          />
          <main>
            <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
                <ShieldAlert size={28} />
              </div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">Acceso restringido</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                La consulta de auditoría y trazabilidad está reservada para el Administrador del Sistema.
              </p>
              <button
                onClick={onGoHome}
                className="mt-6 inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]"
              >
                Volver al panel principal
              </button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // ── Render principal ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Auditoría y Trazabilidad"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="audit"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0 space-y-5">

          {/* ── Encabezado ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-[#111827]">
                <Database size={22} className="text-[#1F4E79]" />
                Trazabilidad y Auditoría
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Registro inmutable de acciones CUD · {total.toLocaleString('es-CO')} eventos en total
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                id="btn-refrescar-audit"
                onClick={() => { setPage(0); cargar(); }}
                className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
              >
                <RefreshCw size={15} />
                Actualizar
              </button>
              {/* Sprint 10: Exportación PDF/Excel */}
              <button
                id="btn-export-csv"
                onClick={exportarCSV}
                disabled={loadStatus !== 'ready' || logsFiltrados.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                title="Exportar a Excel (CSV)"
              >
                <FileSpreadsheet size={15} /> Excel
              </button>
              <button
                id="btn-export-pdf"
                onClick={exportarPDF}
                disabled={loadStatus !== 'ready' || logsFiltrados.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-40"
                title="Exportar a PDF (imprimir)"
              >
                <FileText size={15} /> PDF
              </button>
            </div>
          </div>

          {/* ── Stats rápidas ───────────────────────────────────────────── */}
          {loadStatus === 'ready' && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Creaciones', value: stats.insert, icon: CheckCircle2, color: 'emerald' },
                { label: 'Modificaciones', value: stats.update, icon: Clock, color: 'blue' },
                { label: 'Eliminaciones', value: stats.delete, icon: XCircle, color: 'red' },
              ].map(({ label, value, icon: Icon, color }) => {
                const c = { emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700', blue: 'bg-blue-50 border-blue-200 text-blue-700', red: 'bg-red-50 border-red-200 text-red-700' };
                return (
                  <div key={label} className={`flex items-center gap-3 rounded-xl border p-4 ${c[color]}`}>
                    <Icon size={20} />
                    <div>
                      <p className="text-2xl font-bold leading-none">{value}</p>
                      <p className="mt-0.5 text-xs font-medium opacity-80">{label} (pág.)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Filtros ─────────────────────────────────────────────────── */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Filter size={12} className="mr-1 inline" /> Filtros
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

              {/* Búsqueda local */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="audit-busqueda"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar en esta página..."
                  className="w-full rounded-lg border border-[#D1D5DB] pl-9 pr-3 py-2 text-sm text-[#111827] placeholder-gray-400 focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
                />
              </div>

              {/* Filtro por tabla */}
              <select
                id="audit-filtro-tabla"
                value={filtTabla}
                onChange={(e) => { setFiltTabla(e.target.value); setPage(0); }}
                className="rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm text-[#374151] focus:border-[#1F4E79] focus:outline-none"
              >
                <option value="">Todas las tablas</option>
                {Object.entries(TABLA_LABELS).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>

              {/* Filtro por operación */}
              <select
                id="audit-filtro-operacion"
                value={filtOp}
                onChange={(e) => { setFiltOp(e.target.value); setPage(0); }}
                className="rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm text-[#374151] focus:border-[#1F4E79] focus:outline-none"
              >
                <option value="">Todas las operaciones</option>
                <option value="INSERT">Creación (INSERT)</option>
                <option value="UPDATE">Edición (UPDATE)</option>
                <option value="DELETE">Eliminación (DELETE)</option>
              </select>

              {/* Sprint 10: Filtro por usuario */}
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="audit-filtro-usuario"
                  value={filtUsuario}
                  onChange={(e) => { setFiltUsuario(e.target.value); setPage(0); }}
                  placeholder="Filtrar por usuario..."
                  className="w-full rounded-lg border border-[#D1D5DB] pl-9 pr-3 py-2 text-sm text-[#374151] placeholder-gray-400 focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
                />
              </div>

              {/* Rango de fechas */}
              <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                <input
                  id="audit-desde"
                  type="date"
                  value={filtDesde}
                  onChange={(e) => { setFiltDesde(e.target.value); setPage(0); }}
                  className="flex-1 min-w-0 rounded-lg border border-[#D1D5DB] px-2 py-2 text-xs text-[#374151] focus:border-[#1F4E79] focus:outline-none"
                  title="Desde"
                />
                <input
                  id="audit-hasta"
                  type="date"
                  value={filtHasta}
                  onChange={(e) => { setFiltHasta(e.target.value); setPage(0); }}
                  className="flex-1 min-w-0 rounded-lg border border-[#D1D5DB] px-2 py-2 text-xs text-[#374151] focus:border-[#1F4E79] focus:outline-none"
                  title="Hasta"
                />
              </div>
            </div>

            {/* Botón limpiar filtros */}
            {(filtTabla || filtOp || filtDesde || filtHasta || busqueda || filtUsuario) && (
              <button
                onClick={() => { setFiltTabla(''); setFiltOp(''); setFiltDesde(''); setFiltHasta(''); setBusqueda(''); setFiltUsuario(''); setPage(0); }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
              >
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </div>

          {/* ── Tabla de logs ─────────────────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">

            {loadStatus === 'loading' && (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-[#1F4E79]" />
              </div>
            )}

            {loadStatus === 'error' && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle size={32} className="mb-3 text-red-400" />
                <p className="font-semibold text-[#2F3A45]">Error al cargar el registro de auditoría</p>
                <p className="mt-1 text-sm text-gray-400">
                  Verifique que el backend esté activo y que la tabla <code className="font-mono">audit_log</code> exista.
                </p>
                <button
                  onClick={cargar}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <RefreshCw size={14} /> Reintentar
                </button>
              </div>
            )}

            {loadStatus === 'ready' && logsFiltrados.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Database size={36} className="mb-3 text-gray-200" />
                <p className="font-semibold text-[#2F3A45]">Sin registros de auditoría</p>
                <p className="mt-1 text-sm text-gray-400">
                  {filtTabla || filtOp || filtDesde || filtHasta
                    ? 'Ajuste los filtros para ver más resultados.'
                    : 'Aún no hay eventos registrados en la bitácora.'}
                </p>
              </div>
            )}

            {loadStatus === 'ready' && logsFiltrados.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#F3F4F6] bg-[#F9FAFB]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">#ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Fecha y hora</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Operación</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Tabla / Módulo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Usuario</th>
                        <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 lg:table-cell">IP origen</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsFiltrados.map((log) => (
                        <AuditRow key={log.id} log={log} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between border-t border-[#F3F4F6] px-4 py-3">
                  <p className="text-xs text-gray-400">
                    Mostrando {logsFiltrados.length} de {total.toLocaleString('es-CO')} eventos
                    {busqueda && ` (filtrados en página: ${logsFiltrados.length})`}
                  </p>
                  {totalPages > 1 && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                      >
                        ‹ Anterior
                      </button>
                      <span className="flex items-center px-2 text-xs text-gray-400">
                        Pág. {page + 1} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                      >
                        Siguiente ›
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Info sobre el registro ──────────────────────────────────── */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1 flex items-center gap-2">
              <Server size={14} /> ¿Dónde se almacenan estos registros?
            </p>
            <p className="text-xs leading-relaxed">
              Cada acción CUD (creación, edición, eliminación) del sistema se persiste automáticamente en la tabla{' '}
              <code className="font-mono font-semibold">audit_log</code> de PostgreSQL. Es inmutable por diseño:
              ningún rol puede modificar ni eliminar estas entradas. Los registros incluyen: tabla afectada,
              operación, ID del registro, usuario responsable, snapshot JSON del estado anterior/posterior e IP de origen.
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}