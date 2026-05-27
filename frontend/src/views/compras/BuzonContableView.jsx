// ─────────────────────────────────────────────────────────────────────────────
// BuzonContableView.jsx - Sprint 7
//
// Mejoras sobre Sprint 6:
//   - Paginación real (limit/offset) con contador total
//   - Badge de estado para todos los estados (no solo REVISION_CONTABLE)
//   - Vista de historial (validados/rechazados) desde el mismo componente
//   - Drawer lateral con detalle expandido del requerimiento
//   - Indicador de notificaciones no leídas en header
//   - UX mejorada: feedback toast, confirmación de validación, animaciones
//
// RBAC: Solo Presidente/Gerente y Administrador del Sistema.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Bell, CheckCircle2, XCircle, AlertCircle, Clock,
  Loader2, ClipboardList, ShieldAlert, RefreshCw,
  ChevronRight, X, Eye, Filter, Package, User, Building2,
  Calendar, MessageSquare, TrendingUp, CheckSquare,
} from 'lucide-react';
import { AppHeader }         from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import {
  fetchBandejaContable,
  fetchRequerimientos,
  validarContabilidadReq,
  rechazarRequerimiento,
} from '../../services/compras.service.js';

// ── Constantes ───────────────────────────────────────────────────────────────

const ROLES_PERMITIDOS  = ['Contador', 'Administrador del Sistema'];
const ESTADOS_TABS = [
  { id: 'REVISION_CONTABLE', label: 'Pendientes',  icon: Clock,        color: 'amber'  },
  { id: 'APROBADO',    label: 'Aprobados',   icon: CheckCircle2, color: 'emerald' },
  { id: 'RECHAZADO',   label: 'Rechazados',  icon: XCircle,      color: 'red'    },
];

const ESTADO_CONFIG = {
  REVISION_CONTABLE: { label: 'Revisión Contable', bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-200'  },
  EN_REVISION: { label: 'En Revisión', bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-200'  },
  APROBADO:    { label: 'Aprobado',    bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  RECHAZADO:   { label: 'Rechazado',   bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-200'    },
  RECIBIDO:    { label: 'Recibido',    bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-200'   },
};

const PAGE_SIZE = 20;

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const formatCantidad = (n) =>
  Number(n).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

// ── Sub-componentes ──────────────────────────────────────────────────────────

/**
 * Badge de estado semántico.
 */
function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.REVISION_CONTABLE;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

/**
 * Tarjeta de resumen estadístico superior.
 */
function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    amber:   'bg-amber-50 border-amber-200 text-amber-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    red:     'bg-red-50 border-red-200 text-red-700',
    blue:    'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-4 ${colors[color]}`}>
      <Icon size={22} />
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-0.5 text-xs font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
}

/**
 * Drawer lateral con el detalle completo del requerimiento.
 */
function RequerimientoDrawer({ req, onClose, onValidar, onRechazar, procesando }) {
  const [comentario, setComentario] = useState('');
  const [confirmValidar, setConfirmValidar] = useState(false);

  if (!req) return null;

  const esPendiente = req.estado === 'REVISION_CONTABLE';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header del drawer */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#F9FAFB] px-5 py-4">
          <div>
            <p className="text-xs text-gray-500">Detalle del Requerimiento</p>
            <h2 className="text-base font-semibold text-[#111827]">
              {req.proyecto?.nombre || 'Proyecto'}
            </h2>
            <p className="text-xs text-gray-400">{req.proyecto?.codigo}</p>
          </div>
          <div className="flex items-center gap-2">
            <EstadoBadge estado={req.estado} />
            <button
              id="btn-cerrar-drawer"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Cuerpo con scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Solicitante */}
          <section>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Solicitante
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <User size={16} className="shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-[#111827]">
                  {req.solicitante ? `${req.solicitante.nombre} ${req.solicitante.apellido}` : '—'}
                </p>
                {req.solicitante?.email && (
                  <p className="text-xs text-gray-500">{req.solicitante.email}</p>
                )}
              </div>
            </div>
          </section>

          {/* Fechas */}
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="mb-0.5 text-xs text-gray-400">Fecha solicitud</p>
              <p className="text-sm font-medium text-[#111827]">{formatDate(req.fechaSolicitud)}</p>
            </div>
            {req.fechaAprobacion && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="mb-0.5 text-xs text-gray-400">Fecha decisión</p>
                <p className="text-sm font-medium text-[#111827]">{formatDate(req.fechaAprobacion)}</p>
              </div>
            )}
          </section>

          {/* Justificación */}
          <section>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Justificación
            </p>
            <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-sm text-[#374151] leading-relaxed">
              {req.justificacion || 'Sin justificación registrada.'}
            </div>
          </section>

          {/* Comentario de rechazo */}
          {req.estado === 'RECHAZADO' && req.comentarioRechazo && (
            <section>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-red-400">
                Motivo de rechazo
              </p>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 leading-relaxed">
                {req.comentarioRechazo}
              </div>
            </section>
          )}

          {/* Materiales solicitados */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Materiales ({req.detalles?.length || 0} ítems)
            </p>
            {(req.detalles?.length || 0) === 0 ? (
              <p className="text-sm text-gray-400 italic">Sin detalles.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
                <table className="w-full text-xs">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500">Material</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500">Código</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-500">Cant.</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500">Unidad</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-500">Recibida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {req.detalles.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-[#111827]">{d.material?.nombre}</td>
                        <td className="px-3 py-2 text-gray-500">{d.material?.codigo}</td>
                        <td className="px-3 py-2 text-right font-semibold text-[#111827]">
                          {formatCantidad(d.cantidadSolicitada)}
                        </td>
                        <td className="px-3 py-2 text-gray-500">{d.material?.unidad}</td>
                        <td className="px-3 py-2 text-right text-gray-500">
                          {formatCantidad(d.cantidadRecibida)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Sección de acciones (solo si REVISION_CONTABLE) */}
          {esPendiente && (
            <section className="space-y-4 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Acción gerencial
              </p>

              {/* Confirmar validación */}
              {confirmValidar ? (
                <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-sm text-emerald-700 font-medium">
                    ¿Confirmar validación de este requerimiento?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmValidar(false)}
                      className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      id={`btn-confirmar-aprobacion-${req.id}`}
                      onClick={() => { setConfirmValidar(false); onValidar(req.id); }}
                      disabled={procesando === req.id}
                      className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {procesando === req.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <CheckCircle2 size={13} />}
                      Sí, Validar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  id={`btn-validar-drawer-${req.id}`}
                  onClick={() => setConfirmValidar(true)}
                  disabled={procesando === req.id}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 size={16} />
                  Validar Requerimiento
                </button>
              )}

              {/* Rechazo con comentario obligatorio */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">
                  Motivo de rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  id={`textarea-rechazo-${req.id}`}
                  rows={3}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Ej: Presupuesto insuficiente para este período, requiere reformulación..."
                  className="w-full resize-none rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] placeholder-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
                <button
                  id={`btn-rechazar-drawer-${req.id}`}
                  onClick={() => { if (comentario.trim()) onRechazar(req.id, comentario); }}
                  disabled={!comentario.trim() || procesando === req.id}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {procesando === req.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <XCircle size={16} />}
                  Rechazar con motivo
                </button>
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}

/**
 * Fila de la tabla de requerimientos.
 */
function RequerimientoRow({ req, onVerDetalle, onValidarRapido, onRechazarRapido, procesando }) {
  return (
    <tr
      className="group cursor-pointer border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
      onClick={() => onVerDetalle(req)}
    >
      <td className="px-4 py-3">
        <EstadoBadge estado={req.estado} />
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-[#111827]">{req.proyecto?.nombre || '—'}</p>
        <p className="text-xs text-gray-400">{req.proyecto?.codigo}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-[#374151]">
          {req.solicitante ? `${req.solicitante.nombre} ${req.solicitante.apellido}` : '—'}
        </p>
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <p className="max-w-xs truncate text-sm text-gray-500">
          {req.justificacion || '—'}
        </p>
      </td>
      <td className="hidden px-4 py-3 text-center lg:table-cell">
        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {req.detalles?.length || 0} ítems
        </span>
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        <p className="text-xs text-gray-400">{formatDate(req.fechaSolicitud)}</p>
      </td>
      <td className="px-4 py-3">
        {req.estado === 'REVISION_CONTABLE' ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              id={`btn-rechazar-row-${req.id}`}
              onClick={() => onRechazarRapido(req)}
              disabled={procesando === req.id}
              title="Rechazar"
              className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
            >
              <XCircle size={17} />
            </button>
            <button
              id={`btn-validar-row-${req.id}`}
              onClick={() => onVerDetalle(req)}
              disabled={procesando === req.id}
              title="Ver y Validar"
              className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40"
            >
              <CheckSquare size={17} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onVerDetalle(req)}
            className="rounded-lg p-1.5 text-gray-300 hover:text-gray-500"
            title="Ver detalle"
          >
            <Eye size={17} />
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export function BuzonContableView({
  currentUser,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
  onOpenAdminSection,
}) {
  const modules      = getModulesForUser(currentUser);
  const tieneAcceso  = ROLES_PERMITIDOS.includes(currentUser.roleName);

  // Estado de UI
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [tabActiva,     setTabActiva]     = useState('REVISION_CONTABLE');
  const [page,          setPage]          = useState(0);

  // Estado de datos
  const [requerimientos, setRequerimientos] = useState([]);
  const [total,          setTotal]          = useState(0);
  const [stats,          setStats]          = useState({ pendientes: 0, validados: 0, rechazados: 0 });
  const [loadStatus,     setLoadStatus]     = useState('loading');

  // Estado de acciones
  const [feedback,       setFeedback]       = useState(null);
  const [procesando,     setProcesando]     = useState(null);
  const [drawerReq,      setDrawerReq]      = useState(null);

  // Modal de rechazo rápido (desde la fila)
  const [rechazoRapido, setRechazoRapido]   = useState(null); // { req }
  const [comentario,    setComentario]      = useState('');

  // ── Carga de datos ─────────────────────────────────────────────────────────

  const cargarStats = useCallback(async () => {
    if (!tieneAcceso) return;
    try {
      const [rPend, rApro, rRech] = await Promise.all([
        fetchBandejaContable({ limit: 1, offset: 0, estado: 'REVISION_CONTABLE' }),
        fetchBandejaContable({ limit: 1, offset: 0, estado: 'APROBADO' }),
        fetchBandejaContable({ limit: 1, offset: 0, estado: 'RECHAZADO' }),
      ]);
      setStats({
        pendientes: rPend.total ?? 0,
        validados: rApro.total ?? 0,
        rechazados: rRech.total ?? 0,
      });
    } catch { /* silencioso */ }
  }, [tieneAcceso]);

  const cargarTab = useCallback(async () => {
    if (!tieneAcceso) { setLoadStatus('forbidden'); return; }
    setLoadStatus('loading');
    try {
      const result = await fetchBandejaContable({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        estado: tabActiva,
      });
      setRequerimientos(Array.isArray(result.data) ? result.data : []);
      setTotal(result.total || 0);
      setLoadStatus('ready');
    } catch (err) {
      console.error('[BuzonContable] Error cargando tab:', err);
      setLoadStatus('error');
      setFeedback({ tone: 'error', message: err.response?.data?.error || err.message || 'Error al cargar la bandeja' });
    }
  }, [tieneAcceso, tabActiva, page]);

  useEffect(() => { cargarTab(); }, [cargarTab]);
  useEffect(() => { cargarStats(); }, [cargarStats]);

  // Auto-limpiar feedback
  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 4500);
    return () => window.clearTimeout(t);
  }, [feedback]);

  // ── Acciones ───────────────────────────────────────────────────────────────

  const handleValidar = useCallback(async (id) => {
    setProcesando(id);
    try {
      await validarContabilidadReq(id);
      setDrawerReq(null);
      setFeedback({ tone: 'success', message: 'Requerimiento validado. Se ha notificado al gerente.' });
      // Recargar desde servidor para que las tabs reflejen datos reales
      await Promise.all([cargarTab(), cargarStats()]);
    } catch (err) {
      setFeedback({ tone: 'error', message: err.response?.data?.error || 'Error al validar el requerimiento.' });
    } finally {
      setProcesando(null);
    }
  }, [cargarTab, cargarStats]);

  const handleRechazar = useCallback(async (id, motivo) => {
    if (!motivo?.trim()) {
      setFeedback({ tone: 'error', message: 'El motivo de rechazo es obligatorio.' });
      return;
    }
    setProcesando(id);
    try {
      await rechazarRequerimiento(id, motivo);
      setDrawerReq(null);
      setRechazoRapido(null);
      setComentario('');
      setFeedback({ tone: 'success', message: 'Requerimiento rechazado. Se ha notificado al solicitante.' });
      // Recargar desde servidor para que las tabs reflejen datos reales
      await Promise.all([cargarTab(), cargarStats()]);
    } catch (err) {
      setFeedback({ tone: 'error', message: err.response?.data?.error || 'Error al rechazar el requerimiento.' });
    } finally {
      setProcesando(null);
    }
  }, [cargarTab, cargarStats]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Validación Contable"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="accounting-review"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0">

          {/* ✨ Toast de feedback global ✨ */}
          {feedback && (
            <div
              className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-[12px] border px-5 py-4 text-sm font-semibold shadow-xl max-w-md
                ${feedback.tone === 'success'
                  ? 'border-[#16A34A]/20 bg-[#15803D] text-white'
                  : 'border-[#DC2626]/20 bg-[#B91C1C] text-white'}`}
            >
              <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${feedback.tone === 'success' ? 'bg-[#4ADE80]' : 'bg-[#FCA5A5]'}`} />
              <span className="min-w-0 flex-1 break-words">{feedback.message}</span>
            </div>
          )}

          {/* ── Encabezado ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-[#111827]">
                <ClipboardList size={22} className="text-[#1F4E79]" />
                Requerimientos
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Gestión de requerimientos de compra
              </p>
            </div>
            <button
              id="btn-refrescar-bandeja"
              onClick={() => { setPage(0); cargarTab(); cargarStats(); }}
              className="inline-flex items-center gap-2 self-start rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#374151] shadow-sm hover:bg-[#F9FAFB] sm:self-auto"
            >
              <RefreshCw size={15} />
              Actualizar
            </button>
          </div>

          {/* ── Acceso denegado ───────────────────────────────────────── */}
          {!tieneAcceso && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
              <ShieldAlert size={36} className="mb-3 text-red-400" />
              <p className="font-semibold text-red-700">Acceso restringido</p>
              <p className="mt-1 text-sm text-red-500">
                Solo Contador y Administrador del Sistema pueden acceder a esta sección.
              </p>
            </div>
          )}

          {tieneAcceso && (
            <>
              {/* ── Stats cards ─────────────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                <StatCard label="Pendientes"  value={stats.pendientes}  icon={Clock}        color="amber"   />
                <StatCard label="Aprobados"   value={stats.validados}   icon={CheckCircle2} color="emerald" />
                <StatCard label="Rechazados"  value={stats.rechazados}  icon={XCircle}      color="red"     />
              </div>

              {/* ── Toast de feedback ────────────────────────────────────── */}
              {feedback && (
                <div
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm
                    ${feedback.tone === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-red-200 bg-red-50 text-red-700'}`}
                >
                  {feedback.tone === 'success'
                    ? <CheckCircle2 size={17} />
                    : <AlertCircle size={17} />}
                  {feedback.message}
                </div>
              )}

              {/* ── Tabs de estado ───────────────────────────────────────── */}
              <div className="flex gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
                {ESTADOS_TABS.map((tab) => {
                  const Icon    = tab.icon;
                  const activa  = tabActiva === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`tab-${tab.id.toLowerCase()}`}
                      onClick={() => { setTabActiva(tab.id); setPage(0); }}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all
                        ${activa
                          ? 'bg-[#1F4E79] text-white shadow-sm'
                          : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <Icon size={13} />
                      {tab.label}
                      {tab.id === 'REVISION_CONTABLE' && stats.pendientes > 0 && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
                          ${activa ? 'bg-white/20' : 'bg-amber-100 text-amber-700'}`}>
                          {stats.pendientes}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── Tabla ───────────────────────────────────────────────── */}
              <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                {loadStatus === 'loading' && (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={26} className="animate-spin text-[#1F4E79]" />
                  </div>
                )}

                {loadStatus === 'error' && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle size={32} className="mb-3 text-red-400" />
                    <p className="font-semibold text-[#2F3A45]">Error al cargar la bandeja</p>
                    <button
                      onClick={() => cargarTab()}
                      className="mt-3 rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Reintentar
                    </button>
                  </div>
                )}

                {loadStatus === 'ready' && requerimientos.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ClipboardList size={36} className="mb-3 text-gray-200" />
                    <p className="font-semibold text-[#2F3A45]">
                      {tabActiva === 'REVISION_CONTABLE'
                        ? 'Sin requerimientos pendientes'
                        : `Sin requerimientos ${tabActiva.toLowerCase()}s`}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {tabActiva === 'REVISION_CONTABLE'
                        ? 'Todos los requerimientos han sido gestionados.'
                        : 'El historial estará disponible próximamente.'}
                    </p>
                  </div>
                )}

                {loadStatus === 'ready' && requerimientos.length > 0 && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#F3F4F6] bg-[#F9FAFB]">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Proyecto</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Solicitante</th>
                            <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 md:table-cell">Justificación</th>
                            <th className="hidden px-4 py-3 text-center text-xs font-semibold text-gray-500 lg:table-cell">Ítems</th>
                            <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 lg:table-cell">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requerimientos.map((req) => (
                            <React.Fragment key={req.id}>
                              <RequerimientoRow
                                req={req}
                                procesando={procesando}
                                onVerDetalle={setDrawerReq}
                                onValidarRapido={(id) => handleValidar(id)}
                                onRechazarRapido={(r) => { setRechazoRapido(r); setComentario(''); }}
                              />
                              {req.estado === 'RECHAZADO' && req.comentarioRechazo && (
                                <tr className="bg-red-50/50 border-t-0">
                                  <td colSpan="7" className="px-4 py-2 text-xs text-red-700 pb-3 pl-12">
                                    <span className="font-semibold">Motivo de rechazo:</span> {req.comentarioRechazo}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-[#F3F4F6] px-4 py-3">
                        <p className="text-xs text-gray-400">
                          Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total}
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                          >
                            ‹ Anterior
                          </button>
                          <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                          >
                            Siguiente ›
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── Drawer de detalle ──────────────────────────────────────────── */}
      {drawerReq && (
        <RequerimientoDrawer
          req={drawerReq}
          procesando={procesando}
          onClose={() => setDrawerReq(null)}
          onValidar={handleValidar}
          onRechazar={handleRechazar}
        />
      )}

      {/* ── Modal de rechazo rápido (desde fila) ──────────────────────── */}
      {rechazoRapido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-1 text-base font-semibold text-[#2F3A45]">Rechazar Requerimiento</h2>
            <p className="mb-4 text-sm text-gray-500">
              Proyecto: <strong>{rechazoRapido.proyecto?.nombre}</strong>
              <br />Solicitante: <strong>
                {rechazoRapido.solicitante
                  ? `${rechazoRapido.solicitante.nombre} ${rechazoRapido.solicitante.apellido}`
                  : '—'}
              </strong>
            </p>
            <label className="block mb-1.5 text-xs font-medium text-gray-600">
              Motivo de rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              id="textarea-rechazo-rapido"
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Ej: Presupuesto insuficiente para este período..."
              className="w-full resize-none rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] placeholder-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setRechazoRapido(null); setComentario(''); }}
                className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#2F3A45] hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                id="btn-confirmar-rechazo-rapido"
                onClick={() => handleRechazar(rechazoRapido.id, comentario)}
                disabled={!comentario.trim() || procesando === rechazoRapido.id}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {procesando === rechazoRapido.id
                  ? <Loader2 size={14} className="animate-spin" />
                  : <XCircle size={14} />}
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
