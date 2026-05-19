// ─────────────────────────────────────────────────────────────────────────────
// BandejaGerencialView.jsx — Sprint 6: Bandeja de Requerimientos Pendientes
//
// Solo accesible por roles: Presidente/Gerente y Administrador del Sistema.
// Muestra los requerimientos en estado EN_REVISION con posibilidad de aprobar
// o rechazar directamente desde la bandeja.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell, CheckCircle2, XCircle, AlertCircle,
  Loader2, ClipboardList, ShieldAlert, RefreshCw,
} from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import {
  fetchBandejaGerencial,
  aprobarRequerimiento,
  rechazarRequerimiento,
} from '../../services/compras.service.js';

const ROLES_PERMITIDOS = ['Presidente / Gerente', 'Administrador del Sistema'];

export function BandejaGerencialView({
  currentUser,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
  onOpenAdminSection,
}) {
  const modules  = getModulesForUser(currentUser);
  const tieneAcceso = ROLES_PERMITIDOS.includes(currentUser.roleName);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [requerimientos, setRequerimientos] = useState([]);
  const [total, setTotal]                   = useState(0);
  const [loadStatus, setLoadStatus]         = useState('loading');
  const [feedback, setFeedback]             = useState(null);
  const [procesando, setProcesando]         = useState(null); // ID del req en proceso
  const [rechazoModal, setRechazoModal]     = useState(null); // {id} del req a rechazar
  const [comentario, setComentario]         = useState('');

  // ── Carga de datos ─────────────────────────────────────────────────────────
  const cargarBandeja = useCallback(async () => {
    if (!tieneAcceso) { setLoadStatus('forbidden'); return; }
    setLoadStatus('loading');
    try {
      const result = await fetchBandejaGerencial({ limit: 50, offset: 0 });
      setRequerimientos(Array.isArray(result.data) ? result.data : []);
      setTotal(result.total || 0);
      setLoadStatus('ready');
    } catch (err) {
      console.error('[BandejaGerencial] Error:', err);
      setLoadStatus('error');
    }
  }, [tieneAcceso]);

  useEffect(() => { cargarBandeja(); }, [cargarBandeja]);

  // Auto-limpiar feedback
  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(t);
  }, [feedback]);

  // ── Aprobar ────────────────────────────────────────────────────────────────
  const handleAprobar = async (id) => {
    setProcesando(id);
    try {
      await aprobarRequerimiento(id);
      setRequerimientos((prev) => prev.filter((r) => r.id !== id));
      setTotal((t) => t - 1);
      setFeedback({ tone: 'success', message: 'Requerimiento aprobado correctamente.' });
    } catch (err) {
      setFeedback({ tone: 'error', message: err.response?.data?.error || 'Error al aprobar.' });
    } finally {
      setProcesando(null);
    }
  };

  // ── Rechazar ───────────────────────────────────────────────────────────────
  const handleRechazar = async () => {
    if (!rechazoModal) return;
    if (!comentario.trim()) {
      setFeedback({ tone: 'error', message: 'El comentario de rechazo es obligatorio.' });
      return;
    }
    setProcesando(rechazoModal);
    try {
      await rechazarRequerimiento(rechazoModal, comentario);
      setRequerimientos((prev) => prev.filter((r) => r.id !== rechazoModal));
      setTotal((t) => t - 1);
      setFeedback({ tone: 'success', message: 'Requerimiento rechazado.' });
      setRechazoModal(null);
      setComentario('');
    } catch (err) {
      setFeedback({ tone: 'error', message: err.response?.data?.error || 'Error al rechazar.' });
    } finally {
      setProcesando(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' }) : '—';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Bandeja Gerencial"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="review"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F4E79]/10 text-[#1F4E79]">
                <Bell size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#2F3A45]">Bandeja Gerencial</h1>
                <p className="text-sm text-gray-500">
                  {total} requerimiento{total !== 1 ? 's' : ''} pendiente{total !== 1 ? 's' : ''} de revisión
                </p>
              </div>
            </div>
            <button
              id="btn-refresh-bandeja"
              onClick={cargarBandeja}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#D1D5DB] px-3 py-2 text-sm font-medium text-[#2F3A45] hover:bg-gray-50"
            >
              <RefreshCw size={14} />
              Actualizar
            </button>
          </div>

          {/* Acceso denegado */}
          {loadStatus === 'forbidden' && (
            <div className="flex items-start gap-3 rounded-[12px] border border-red-200 bg-red-50 p-6">
              <ShieldAlert size={20} className="mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Acceso Denegado</p>
                <p className="mt-1 text-sm text-red-700">
                  Esta bandeja es exclusiva para roles Presidente/Gerente y Administrador del Sistema.
                </p>
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-[10px] border px-4 py-3 text-sm font-medium ${
                feedback.tone === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {feedback.tone === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {feedback.message}
            </div>
          )}

          {/* Loading */}
          {loadStatus === 'loading' && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[#1F4E79]" />
            </div>
          )}

          {/* Bandeja vacía */}
          {loadStatus === 'ready' && requerimientos.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[#D1D5DB] bg-white py-20 text-center">
              <ClipboardList size={40} className="mb-4 text-gray-200" />
              <p className="font-semibold text-[#2F3A45]">Sin requerimientos pendientes</p>
              <p className="mt-1 text-sm text-gray-500">
                No hay requerimientos en estado EN REVISIÓN en este momento.
              </p>
            </div>
          )}

          {/* Lista de requerimientos */}
          {loadStatus === 'ready' && requerimientos.length > 0 && (
            <div className="space-y-4">
              {requerimientos.map((req) => (
                <div
                  key={req.id}
                  className="overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-sm transition hover:shadow"
                >
                  {/* Cabecera del card */}
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] bg-[#F9FAFB] px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        En Revisión
                      </span>
                      <span className="text-sm font-semibold text-[#2F3A45]">
                        {req.proyecto?.nombre || '—'}
                      </span>
                      <span className="text-xs text-gray-400">({req.proyecto?.codigo})</span>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(req.fechaSolicitud)}</span>
                  </div>

                  <div className="px-5 py-4">
                    {/* Solicitante y justificación */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Solicitado por</p>
                      <p className="text-sm font-medium text-[#111827]">
                        {req.solicitante ? `${req.solicitante.nombre} ${req.solicitante.apellido}` : '—'}
                      </p>
                    </div>
                    <div className="mb-4 rounded-[8px] bg-[#F9FAFB] p-3 text-sm text-gray-700">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                        Justificación
                      </span>
                      {req.justificacion}
                    </div>

                    {/* Tabla de detalles */}
                    {req.detalles?.length > 0 && (
                      <div className="mb-4 overflow-hidden rounded-[8px] border border-[#E5E7EB]">
                        <table className="w-full text-xs">
                          <thead className="bg-[#F9FAFB]">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-[#6B7280]">Material</th>
                              <th className="px-3 py-2 text-left font-semibold text-[#6B7280]">Código</th>
                              <th className="px-3 py-2 text-right font-semibold text-[#6B7280]">Cantidad</th>
                              <th className="px-3 py-2 text-left font-semibold text-[#6B7280]">Unidad</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F3F4F6]">
                            {req.detalles.map((d) => (
                              <tr key={d.id}>
                                <td className="px-3 py-2 text-[#111827]">{d.material?.nombre}</td>
                                <td className="px-3 py-2 text-gray-500">{d.material?.codigo}</td>
                                <td className="px-3 py-2 text-right font-medium text-[#111827]">
                                  {Number(d.cantidadSolicitada).toLocaleString('es-CO')}
                                </td>
                                <td className="px-3 py-2 text-gray-500">{d.material?.unidad}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex justify-end gap-2">
                      <button
                        id={`btn-rechazar-${req.id}`}
                        onClick={() => { setRechazoModal(req.id); setComentario(''); }}
                        disabled={procesando === req.id}
                        className="inline-flex items-center gap-1.5 rounded-[8px] border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Rechazar
                      </button>
                      <button
                        id={`btn-aprobar-${req.id}`}
                        onClick={() => handleAprobar(req.id)}
                        disabled={procesando === req.id}
                        className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#16A34A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#15803d] disabled:opacity-50"
                      >
                        {procesando === req.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <CheckCircle2 size={14} />}
                        Aprobar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal de rechazo */}
      {rechazoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-base font-semibold text-[#2F3A45]">Rechazar Requerimiento</h2>
            <p className="mb-4 text-sm text-gray-500">
              Ingrese el motivo del rechazo. Este campo es obligatorio.
            </p>
            <textarea
              id="comentario-rechazo"
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Ej: Presupuesto insuficiente para este período..."
              className="w-full rounded-[10px] border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/50"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setRechazoModal(null); setComentario(''); }}
                className="rounded-[8px] border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#2F3A45] hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                id="btn-confirmar-rechazo"
                onClick={handleRechazar}
                disabled={!comentario.trim() || procesando === rechazoModal}
                className="inline-flex items-center gap-2 rounded-[8px] bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {procesando === rechazoModal ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
