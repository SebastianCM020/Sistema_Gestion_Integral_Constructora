// ─────────────────────────────────────────────────────────────────────────────
// RequerimientosView.jsx — Sprint 6: Formulario y listado de Requerimientos
//
// Responsabilidades:
//   - Formulario de creación de requerimientos con validaciones estrictas
//   - Consulta del catálogo vigente de materiales (solo activos)
//   - Bloqueo si el proyecto está inactivo
//   - Integración con NotificationService vía API
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Trash2, ClipboardList, AlertCircle, CheckCircle2,
  ChevronDown, Loader2, Package, ShieldAlert,
} from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import { fetchMateriales } from '../../services/materiales.service.js';
import { crearRequerimiento, fetchRequerimientos } from '../../services/compras.service.js';
import { fetchProjectDetail, fetchProjects } from '../../services/projects.service.js';

// ── Estado inicial del formulario ─────────────────────────────────────────────
const DETALLE_VACIO = { idMaterial: '', cantidadSolicitada: '' };

const FORM_INICIAL = {
  idProyecto:    '',
  justificacion: '',
  detalles:      [{ ...DETALLE_VACIO }],
};

// ── Componente principal ──────────────────────────────────────────────────────
export function RequerimientosView({
  currentUser,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
  onOpenAdminSection,
  idProyecto, // Puede venir del router o props
}) {
  const modules   = getModulesForUser(currentUser);
  const [searchParams] = useSearchParams();
  const queryProjectId = searchParams.get('idProyecto');

  const [mobileNavOpen, setMobileNavOpen]     = useState(false);
  const [materiales, setMateriales]           = useState([]);
  const [projects, setProjects]               = useState([]);
  const [requerimientos, setRequerimientos]   = useState([]);
  const [proyecto, setProyecto]               = useState(null);
  const [loadStatus, setLoadStatus]           = useState('loading');
  const [submitting, setSubmitting]           = useState(false);
  const [feedback, setFeedback]               = useState(null);
  const [form, setForm]                       = useState({ ...FORM_INICIAL, idProyecto: idProyecto || queryProjectId || '' });
  const [errors, setErrors]                   = useState({});
  const [showForm, setShowForm]               = useState(false);
  const canCreateRequests = ['Residente', 'Administrador del Sistema'].includes(currentUser.roleName);

  // ── Cargar datos iniciales ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadStatus('loading');
      try {
        const [matResult, projectsResult] = await Promise.all([
          // Solo materiales activos para el selector de creación
          fetchMateriales({ soloActivos: true, isOnline: true }),
          fetchProjects(),
        ]);
        setMateriales(Array.isArray(matResult.data) ? matResult.data : []);
        
        const projectList = Array.isArray(projectsResult) ? projectsResult : [];
        setProjects(projectList);

        const activeProjId = idProyecto || queryProjectId || (projectList.length > 0 ? projectList[0].id : '');
        if (activeProjId) {
          setForm((prev) => ({ ...prev, idProyecto: activeProjId }));
          const [proyectoData, reqData] = await Promise.all([
            fetchProjectDetail(activeProjId),
            fetchRequerimientos(activeProjId),
          ]);
          setProyecto(proyectoData);
          setRequerimientos(Array.isArray(reqData.data) ? reqData.data : []);
        }

        setLoadStatus('ready');
      } catch (err) {
        console.error('[RequerimientosView] Error cargando datos:', err);
        setLoadStatus('error');
      }
    };
    load();
  }, [idProyecto, queryProjectId]);

  const handleProjectChange = async (projectId) => {
    setForm((prev) => ({ ...prev, idProyecto: projectId }));
    setErrors({});
    try {
      const [proyectoData, reqData] = await Promise.all([
        fetchProjectDetail(projectId),
        fetchRequerimientos(projectId),
      ]);
      setProyecto(proyectoData);
      setRequerimientos(Array.isArray(reqData.data) ? reqData.data : []);
    } catch (err) {
      console.error('[RequerimientosView] Error changing project:', err);
    }
  };

  // Auto-limpiar feedback
  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(t);
  }, [feedback]);

  // ── Validaciones frontend (espejando las del backend) ─────────────────────
  const validate = useCallback(() => {
    const errs = {};

    if (!form.idProyecto) {
      errs.idProyecto = 'Seleccione un proyecto.';
    }

    if (!form.justificacion.trim()) {
      errs.justificacion = 'La justificación es obligatoria y no puede estar vacía.';
    }

    if (form.detalles.length === 0) {
      errs.detalles = 'Debe incluir al menos un material en el requerimiento.';
    }

    form.detalles.forEach((d, i) => {
      if (!d.idMaterial) {
        errs[`detalle_material_${i}`] = 'Seleccione un material.';
      }
      const qty = Number(d.cantidadSolicitada);
      if (!d.cantidadSolicitada || !Number.isInteger(qty) || qty <= 0) {
        errs[`detalle_cantidad_${i}`] = 'La cantidad debe ser un entero positivo (≥ 1).';
      }
    });

    return errs;
  }, [form]);

  // ── Handlers de formulario ─────────────────────────────────────────────────
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleDetalleChange = (index, field, value) => {
    setForm((prev) => {
      const detalles = [...prev.detalles];
      detalles[index] = { ...detalles[index], [field]: value };
      return { ...prev, detalles };
    });
    setErrors((prev) => ({ ...prev, [`detalle_${field}_${index}`]: undefined }));
  };

  const addDetalle = () => {
    setForm((prev) => ({ ...prev, detalles: [...prev.detalles, { ...DETALLE_VACIO }] }));
  };

  const removeDetalle = (index) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index),
    }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación frontend primero
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setFeedback({ tone: 'error', message: 'Corrija los errores del formulario antes de enviar.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        justificacion: form.justificacion.trim(),
        detalles:      form.detalles.map((d) => ({
          idMaterial:        d.idMaterial,
          cantidadSolicitada: parseInt(d.cantidadSolicitada, 10),
        })),
      };

      const result = await crearRequerimiento(form.idProyecto, payload);

      // Actualizar lista de requerimientos
      setRequerimientos((prev) => [result.data, ...prev]);
      setForm({ ...FORM_INICIAL, idProyecto: idProyecto || '' });
      setErrors({});
      setShowForm(false);
      setFeedback({
        tone: 'success',
        message: 'Requerimiento creado en estado EN REVISIÓN. Los gerentes han sido notificados.',
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear el requerimiento.';
      setFeedback({ tone: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers de display ─────────────────────────────────────────────────────
  const statusLower = (proyecto?.status || '').toLowerCase();
  const estadoLower = (proyecto?.estado || '').toLowerCase();
  const proyectoInactivo = proyecto && 
    statusLower !== 'active' && 
    statusLower !== 'activo' && 
    estadoLower !== 'active' && 
    estadoLower !== 'activo';

  const badgeEstado = (estado) => {
    const map = {
      EN_REVISION: { label: 'En Revisión', cls: 'bg-amber-100 text-amber-800' },
      APROBADO:    { label: 'Aprobado',    cls: 'bg-green-100 text-green-800' },
      RECHAZADO:   { label: 'Rechazado',   cls: 'bg-red-100 text-red-800' },
      RECIBIDO:    { label: 'Recibido',    cls: 'bg-blue-100 text-blue-800' },
    };
    const { label, cls } = map[estado] || { label: estado, cls: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
        {label}
      </span>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Requerimientos de Compra"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="requirements"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0 space-y-6">
          {/* Header de sección */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">Requerimientos de Compra</h1>
              <p className="mt-1 text-sm text-gray-500">
                Cree y gestione solicitudes de materiales para los proyectos activos.
              </p>
            </div>
            {canCreateRequests && !proyectoInactivo && proyecto && (
              <button
                id="btn-nuevo-requerimiento"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-[10px] bg-[#1F4E79] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#153a5c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E79]/60"
              >
                <Plus size={16} />
                Nuevo requerimiento
              </button>
            )}
          </div>

          {/* Selector de Proyecto */}
          {projects.length > 0 && (
            <div className="flex items-center gap-3 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <label htmlFor="select-proyecto-req" className="text-sm font-medium text-[#2F3A45] shrink-0">
                Proyecto:
              </label>
              <div className="relative flex-1 max-w-md">
                <select
                  id="select-proyecto-req"
                  value={form.idProyecto}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full appearance-none rounded-[8px] border border-[#D1D5DB] bg-white py-2  pl-3 pr-8 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/40"
                >
                  <option value="">— Seleccione un proyecto —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code || p.codigo} – {p.name || p.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Alerta de proyecto inactivo */}
          {proyectoInactivo && (
            <div className="flex items-start gap-3 rounded-[12px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <ShieldAlert size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Proyecto inactivo</p>
                <p className="mt-0.5">
                  Este proyecto se encuentra en estado <strong>{proyecto.estado}</strong>.
                  No es posible crear nuevas transacciones. Los datos históricos son consultables.
                </p>
              </div>
            </div>
          )}

          {/* Feedback global */}
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

          {/* Formulario de creación */}
          {showForm && !proyectoInactivo && (
            <section className="rounded-[16px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F4E79]/10 text-[#1F4E79]">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#2F3A45]">Nuevo Requerimiento</h2>
                    <p className="text-xs text-gray-500">El estado inicial será <strong>EN REVISIÓN</strong></p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowForm(false); setErrors({}); }}
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>

              <form id="form-requerimiento" onSubmit={handleSubmit} className="space-y-5" noValidate>

                {/* Justificación */}
                <div>
                  <label htmlFor="justificacion" className="mb-1 block text-sm font-medium text-[#2F3A45]">
                    Justificación <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="justificacion"
                    rows={3}
                    value={form.justificacion}
                    onChange={(e) => handleFormChange('justificacion', e.target.value)}
                    placeholder="Describa por qué se necesitan estos materiales..."
                    className={`w-full rounded-[10px] border px-3 py-2 text-sm text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/50 ${
                      errors.justificacion ? 'border-red-400 bg-red-50' : 'border-[#D1D5DB] bg-white'
                    }`}
                  />
                  {errors.justificacion && (
                    <p className="mt-1 text-xs text-red-600">{errors.justificacion}</p>
                  )}
                </div>

                {/* Detalles de materiales */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-[#2F3A45]">
                      Materiales solicitados <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addDetalle}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#1F4E79] hover:underline"
                    >
                      <Plus size={13} />
                      Agregar material
                    </button>
                  </div>

                  {errors.detalles && (
                    <p className="mb-2 text-xs text-red-600">{errors.detalles}</p>
                  )}

                  <div className="space-y-3">
                    {form.detalles.map((detalle, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-[1fr_120px_36px] items-start gap-2 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] p-3"
                      >
                        {/* Selector de material */}
                        <div>
                          <div className="relative">
                            <select
                              id={`material-${idx}`}
                              value={detalle.idMaterial}
                              onChange={(e) => handleDetalleChange(idx, 'idMaterial', e.target.value)}
                              className={`w-full appearance-none rounded-[8px] border py-2 pl-3 pr-8 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/40 ${
                                errors[`detalle_material_${idx}`]
                                  ? 'border-red-400 bg-red-50'
                                  : 'border-[#D1D5DB] bg-white'
                              }`}
                            >
                              <option value="">— Seleccione un material —</option>
                              {materiales.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.codigo} – {m.nombre} ({m.unidad})
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-gray-400" />
                          </div>
                          {errors[`detalle_material_${idx}`] && (
                            <p className="mt-0.5 text-xs text-red-600">{errors[`detalle_material_${idx}`]}</p>
                          )}
                        </div>

                        {/* Cantidad */}
                        <div>
                          <input
                            id={`cantidad-${idx}`}
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Cantidad"
                            value={detalle.cantidadSolicitada}
                            onChange={(e) => handleDetalleChange(idx, 'cantidadSolicitada', e.target.value)}
                            className={`w-full rounded-[8px] border px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/40 ${
                              errors[`detalle_cantidad_${idx}`]
                                ? 'border-red-400 bg-red-50'
                                : 'border-[#D1D5DB] bg-white'
                            }`}
                          />
                          {errors[`detalle_cantidad_${idx}`] && (
                            <p className="mt-0.5 text-xs text-red-600">{errors[`detalle_cantidad_${idx}`]}</p>
                          )}
                        </div>

                        {/* Eliminar */}
                        <button
                          type="button"
                          onClick={() => removeDetalle(idx)}
                          disabled={form.detalles.length === 1}
                          className="mt-1.5 flex h-8 w-8 items-center justify-center rounded-[6px] text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Eliminar material"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acciones del formulario */}
                <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setErrors({}); }}
                    className="rounded-[8px] border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#2F3A45] hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-submit-requerimiento"
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-[8px] bg-[#1F4E79] px-5 py-2 text-sm font-medium text-white hover:bg-[#153a5c] disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <ClipboardList size={15} />}
                    {submitting ? 'Enviando...' : 'Crear requerimiento'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Listado de requerimientos */}
          {loadStatus === 'loading' && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[#1F4E79]" />
            </div>
          )}

          {loadStatus === 'ready' && requerimientos.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[#D1D5DB] bg-white py-16 text-center">
              <Package size={36} className="mb-3 text-gray-300" />
              <p className="font-medium text-[#2F3A45]">No hay requerimientos registrados</p>
              <p className="mt-1 text-sm text-gray-500">
                {proyectoInactivo
                  ? 'El proyecto está inactivo. No se pueden crear nuevos requerimientos.'
                  : 'Cree el primer requerimiento para este proyecto.'}
              </p>
            </div>
          )}

          {loadStatus === 'ready' && requerimientos.length > 0 && (
            <section className="overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-[#6B7280]">Proyecto</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#6B7280]">Solicitante</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#6B7280]">Ítems</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#6B7280]">Estado</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#6B7280]">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {requerimientos.map((req) => (
                    <tr key={req.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#111827]">
                        {req.proyecto?.nombre || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {req.solicitante ? `${req.solicitante.nombre} ${req.solicitante.apellido}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {req.detalles?.length ?? 0}
                      </td>
                      <td className="px-4 py-3">{badgeEstado(req.estado)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(req.fechaSolicitud).toLocaleDateString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
