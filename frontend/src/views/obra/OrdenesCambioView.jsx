import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, ClipboardList, CheckCircle2, XCircle, Clock, AlertCircle,
  Loader2, ChevronDown, Check, X, ShieldAlert, FileText, ArrowLeftRight
} from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import { fetchProjects } from '../../services/projects.service.js';
import { fetchRubrosByProject } from '../../services/rubros.service.js';
import {
  fetchOrdenesCambio,
  crearOrdenCambio,
  aprobarOrdenCambio,
  rechazarOrdenCambio
} from '../../services/ordenesCambio.service.js';

const ESTADOS_TABS = [
  { id: 'TODAS',     label: 'Todas',       icon: ClipboardList, color: 'blue'    },
  { id: 'PENDIENTE', label: 'Pendientes',  icon: Clock,         color: 'amber'   },
  { id: 'APROBADA',  label: 'Aprobadas',   icon: CheckCircle2,  color: 'emerald' },
  { id: 'RECHAZADA', label: 'Rechazadas',  icon: XCircle,       color: 'red'     },
];

const ESTADO_CONFIG = {
  PENDIENTE: { label: 'Pendiente', bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-200'  },
  APROBADA:  { label: 'Aprobada',  bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  RECHAZADA: { label: 'Rechazada', bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-200'    },
};

export function OrdenesCambioView({
  currentUser,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
  onOpenAdminSection,
}) {
  const modules = getModulesForUser(currentUser);
  const canCreate = ['Residente', 'Administrador del Sistema', 'Presidente / Gerente'].includes(currentUser.roleName);
  const canApprove = ['Presidente / Gerente', 'Administrador del Sistema'].includes(currentUser.roleName);

  const [searchParams] = useSearchParams();
  const queryProjectId = searchParams.get('idProyecto');
  const queryRubroId = searchParams.get('idRubro');

  // Estados UI
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [tabActiva, setTabActiva] = useState('TODAS');
  const [showForm, setShowForm] = useState(!!queryRubroId);

  // Estados Datos
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(queryProjectId || '');
  const [rubros, setRubros] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [loadStatus, setLoadStatus] = useState('ready');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Formulario nuevo
  const [form, setForm] = useState({ idRubro: queryRubroId || '', motivo: '', cantidadAdicional: '' });
  const [formErrors, setFormErrors] = useState({});

  // Aprobación / Rechazo
  const [resolviendoId, setResolviendoId] = useState(null);
  const [resolviendoAccion, setResolviendoAccion] = useState(null); // 'aprobar' | 'rechazar'
  const [comentarioResolucion, setComentarioResolucion] = useState('');

  // Cargar proyectos al montar
  useEffect(() => {
    const load = async () => {
      setLoadStatus('loading');
      try {
        const data = await fetchProjects();
        setProjects(Array.isArray(data) ? data : []);
        setLoadStatus('ready');
      } catch (err) {
        console.error('[OrdenesCambioView] Error cargando proyectos:', err);
        setLoadStatus('error');
      }
    };
    load();
  }, []);

  // Cargar órdenes y rubros al cambiar de proyecto
  const cargarDatosProyecto = useCallback(async (projId) => {
    if (!projId) {
      setOrdenes([]);
      setRubros([]);
      return;
    }
    setLoadStatus('loading');
    try {
      const [ordData, rubData] = await Promise.all([
        fetchOrdenesCambio(projId),
        fetchRubrosByProject(projId)
      ]);
      setOrdenes(Array.isArray(ordData.data) ? ordData.data : ordData || []);
      setRubros(rubData || []);
      setLoadStatus('ready');
    } catch (err) {
      console.error('[OrdenesCambioView] Error cargando datos de proyecto:', err);
      setFeedback({ tone: 'error', message: 'Error al cargar los datos del proyecto.' });
      setLoadStatus('ready');
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      cargarDatosProyecto(selectedProjectId);
    }
  }, [selectedProjectId, cargarDatosProyecto]);

  // Filtrar órdenes localmente por tab
  const ordenesFiltradas = useMemo(() => {
    if (tabActiva === 'TODAS') return ordenes;
    return ordenes.filter(o => o.estado === tabActiva);
  }, [ordenes, tabActiva]);

  // Limpiar feedbacks
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  // Validar Formulario
  const validarForm = () => {
    const errs = {};
    if (!form.idRubro) errs.idRubro = 'Seleccione un rubro.';
    if (!form.motivo || !form.motivo.trim()) errs.motivo = 'El motivo es obligatorio.';
    const qty = Number(form.cantidadAdicional);
    if (!form.cantidadAdicional || isNaN(qty) || qty <= 0) {
      errs.cantidadAdicional = 'Ingrese una cantidad adicional positiva.';
    }
    return errs;
  };

  // Crear Orden
  const handleCrearOrden = async (e) => {
    e.preventDefault();
    const errs = validarForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const result = await crearOrdenCambio(selectedProjectId, {
        idRubro: form.idRubro,
        motivo: form.motivo.trim(),
        cantidadAdicional: parseFloat(form.cantidadAdicional),
      });

      setFeedback({ tone: 'success', message: 'Orden de cambio solicitada correctamente.' });
      setForm({ idRubro: '', motivo: '', cantidadAdicional: '' });
      setFormErrors({});
      setShowForm(false);
      
      // Recargar lista
      cargarDatosProyecto(selectedProjectId);
    } catch (err) {
      setFeedback({ tone: 'error', message: err.response?.data?.error || 'Error al crear la orden de cambio.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Resolver Orden (Aprobar/Rechazar)
  const handleResolverOrden = async () => {
    if (resolviendoAccion === 'rechazar' && !comentarioResolucion.trim()) {
      setFeedback({ tone: 'error', message: 'El comentario es obligatorio para rechazar.' });
      return;
    }

    setSubmitting(true);
    try {
      if (resolviendoAccion === 'aprobar') {
        await aprobarOrdenCambio(resolviendoId, comentarioResolucion.trim() || undefined);
        setFeedback({ tone: 'success', message: 'Orden de cambio aprobada correctamente.' });
      } else {
        await rechazarOrdenCambio(resolviendoId, comentarioResolucion.trim());
        setFeedback({ tone: 'success', message: 'Orden de cambio rechazada correctamente.' });
      }

      setResolviendoId(null);
      setResolviendoAccion(null);
      setComentarioResolucion('');
      
      // Recargar lista
      cargarDatosProyecto(selectedProjectId);
    } catch (err) {
      setFeedback({ tone: 'error', message: err.response?.data?.error || 'Error al procesar la orden de cambio.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Órdenes de Cambio"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="change-orders"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0 space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">Órdenes de Cambio</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Gestione y apruebe ampliaciones de presupuesto/cantidad para rubros de obra.
              </p>
            </div>
            {canCreate && selectedProjectId && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-[10px] bg-[#1F4E79] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#153a5c]"
              >
                <Plus size={16} />
                Solicitar orden
              </button>
            )}
          </div>

          {/* Selector de Proyecto */}
          <div className="flex items-center gap-3 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <label htmlFor="select-proyecto" className="text-sm font-medium text-[#2F3A45] shrink-0">
              Proyecto:
            </label>
            <div className="relative flex-1 max-w-md">
              <select
                id="select-proyecto"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full appearance-none rounded-[8px] border border-[#D1D5DB] bg-white py-2 pl-3 pr-8 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/40"
              >
                <option value="">— Seleccione un proyecto —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} – {p.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Feedback Global */}
          {feedback && (
            <div
              className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-[12px] border px-5 py-4 text-sm font-semibold shadow-xl max-w-md ${
                feedback.tone === 'success' ? 'border-[#16A34A]/20 bg-[#15803D] text-white' : 'border-[#DC2626]/20 bg-[#B91C1C] text-white'
              }`}
            >
              <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${feedback.tone === 'success' ? 'bg-[#4ADE80]' : 'bg-[#FCA5A5]'}`} />
              <span className="min-w-0 flex-1 break-words">{feedback.message}</span>
            </div>
          )}

          {/* Formulario de Creación */}
          {showForm && (
            <section className="rounded-[16px] border border-[#D1D5DB] bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-base font-semibold text-[#2F3A45]">Solicitar Ampliación de Rubro</h2>
                <button onClick={() => { setShowForm(false); setFormErrors({}); }} className="text-sm text-gray-400 hover:text-gray-600">
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleCrearOrden} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2F3A45] mb-1">Rubro <span className="text-red-500">*</span></label>
                    <select
                      value={form.idRubro}
                      onChange={(e) => setForm({ ...form, idRubro: e.target.value })}
                      className="w-full rounded-[8px] border border-[#D1D5DB] bg-white py-2.5 px-3 text-sm text-[#111827]"
                    >
                      <option value="">— Seleccione un rubro —</option>
                      {rubros.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.codigo} – {r.descripcion} ({r.unidad})
                        </option>
                      ))}
                    </select>
                    {formErrors.idRubro && <p className="text-xs text-red-500 mt-1">{formErrors.idRubro}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2F3A45] mb-1">Cantidad Adicional <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="0.00"
                      value={form.cantidadAdicional}
                      onChange={(e) => setForm({ ...form, cantidadAdicional: e.target.value })}
                      className="w-full rounded-[8px] border border-[#D1D5DB] py-2.5 px-3 text-sm text-[#111827]"
                    />
                    {formErrors.cantidadAdicional && <p className="text-xs text-red-500 mt-1">{formErrors.cantidadAdicional}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2F3A45] mb-1">Justificación Técnica <span className="text-red-500">*</span></label>
                  <textarea
                    rows={3}
                    placeholder="Escriba los motivos del excedente de obra..."
                    value={form.motivo}
                    onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                    className="w-full rounded-[8px] border border-[#D1D5DB] py-2 px-3 text-sm text-[#111827]"
                  />
                  {formErrors.motivo && <p className="text-xs text-red-500 mt-1">{formErrors.motivo}</p>}
                </div>

                <div className="flex justify-end gap-2 border-t pt-3">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setFormErrors({}); }}
                    className="rounded-[8px] border px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-[8px] bg-[#1F4E79] px-5 py-2 text-sm font-medium text-white hover:bg-[#153a5c]"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Listado de Órdenes */}
          {selectedProjectId && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
                {ESTADOS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const activa = tabActiva === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTabActiva(tab.id)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all
                        ${activa ? 'bg-[#1F4E79] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <Icon size={13} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {loadStatus === 'loading' ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-[#1F4E79]" size={28} />
                </div>
              ) : ordenesFiltradas.length === 0 ? (
                <div className="text-center py-12 bg-white border rounded-[12px] border-dashed border-gray-300">
                  <FileText className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-sm font-medium text-gray-500">No hay órdenes de cambio registradas</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F9FAFB] border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500">Estado</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500">Rubro</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-500">Cant. Adicional</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500">Solicitante</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500">Motivo</th>
                        {canApprove && <th className="px-4 py-3 text-center font-semibold text-gray-500">Acción</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ordenesFiltradas.map((ord) => {
                        const statusCfg = ESTADO_CONFIG[ord.estado] || ESTADO_CONFIG.PENDIENTE;
                        return (
                          <React.Fragment key={ord.id}>
                            <tr className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                                  {statusCfg.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-semibold text-gray-800">{ord.rubro?.codigo || '—'}</p>
                                <p className="text-xs text-gray-500 truncate max-w-xs">{ord.rubro?.descripcion}</p>
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-[#1F4E79]">
                                +{parseFloat(ord.cantidadAdicional || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-600">
                                {ord.solicitante ? `${ord.solicitante.nombre} ${ord.solicitante.apellido}` : '—'}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate" title={ord.motivo}>
                                {ord.motivo}
                              </td>
                              {canApprove && (
                                <td className="px-4 py-3 text-center">
                                  {ord.estado === 'PENDIENTE' ? (
                                    <div className="flex justify-center gap-1">
                                      <button
                                        onClick={() => { setResolviendoId(ord.id); setResolviendoAccion('aprobar'); }}
                                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                        title="Aprobar"
                                      >
                                        <Check size={18} />
                                      </button>
                                      <button
                                        onClick={() => { setResolviendoId(ord.id); setResolviendoAccion('rechazar'); }}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        title="Rechazar"
                                      >
                                        <X size={18} />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">—</span>
                                  )}
                                </td>
                              )}
                            </tr>
                            {(ord.comentarioAprobador || (resolviendoId === ord.id && resolviendoAccion)) && (
                              <tr className="bg-gray-50 border-t-0">
                                <td colSpan={canApprove ? 6 : 5} className="px-4 py-3 text-xs text-gray-600">
                                  {resolviendoId === ord.id && resolviendoAccion ? (
                                    <div className="space-y-2 max-w-md">
                                      <p className="font-semibold text-gray-700">
                                        {resolviendoAccion === 'aprobar' ? 'Comentario de Aprobación (Opcional):' : 'Comentario de Rechazo (Obligatorio):'}
                                      </p>
                                      <textarea
                                        rows={2}
                                        value={comentarioResolucion}
                                        onChange={(e) => setComentarioResolucion(e.target.value)}
                                        placeholder="Ej: Aprobado según el informe técnico de campo..."
                                        className="w-full border rounded p-1.5 bg-white"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => { setResolviendoId(null); setResolviendoAccion(null); }}
                                          className="px-3 py-1 border rounded bg-white"
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          onClick={handleResolverOrden}
                                          disabled={submitting || (resolviendoAccion === 'rechazar' && !comentarioResolucion.trim())}
                                          className={`px-3 py-1 text-white rounded ${resolviendoAccion === 'aprobar' ? 'bg-emerald-600' : 'bg-red-600'}`}
                                        >
                                          Confirmar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p>
                                      <span className="font-semibold">{ord.estado === 'APROBADA' ? 'Comentario aprobación:' : 'Comentario rechazo:'}</span> {ord.comentarioAprobador}
                                    </p>
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!selectedProjectId && (
            <div className="text-center py-16 bg-white border border-dashed rounded-[12px] border-gray-300">
              <ArrowLeftRight className="mx-auto text-gray-300 mb-2" size={36} />
              <p className="text-sm font-semibold text-gray-500">Seleccione un proyecto</p>
              <p className="text-xs text-gray-400 mt-1">Seleccione un proyecto activo para ver y gestionar sus órdenes de cambio.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
