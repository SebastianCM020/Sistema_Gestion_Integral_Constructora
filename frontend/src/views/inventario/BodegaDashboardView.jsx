// ─────────────────────────────────────────────────────────────────────────────
// BodegaDashboardView.jsx — Sprint 8 HU-S8-1: Interfaz del Bodeguero
//
// CA HU-S8-1: Muestra exclusivamente:
//   1. Requerimientos en estado APROBADO (para recepcionar).
//   2. Movimientos de inventario del proyecto.
//   Ambos filtrados de forma estricta por proyectos autorizados del bodeguero.
//
// CA HU-S8-3: Las alertas de error (requerimiento no aprobado / exceso) se
//             muestran como banners visibles antes del formulario de recepción.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Loader2,
  Package,
  PackageCheck,
  RefreshCw,
  ShieldAlert,
  X,
} from 'lucide-react';
import { AppHeader }         from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader }     from '../../components/ui/SectionHeader.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import {
  fetchRequerimientosAprobados,
  fetchMovimientos,
  fetchInventario,
  recepcionarMateriales,
} from '../../services/bodega.service.js';
import { fetchProjects } from '../../services/projects.service.js';

// ─── Subcomponentes locales ───────────────────────────────────────────────────

function AlertaBanner({ tipo = 'error', mensaje, onDismiss }) {
  const esError    = tipo === 'error';
  const esExceso   = tipo === 'exceso';
  const esExito    = tipo === 'exito';
  const colorBg    = esExito ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]';
  const colorBorde = esExito ? 'border-[#16A34A]/20' : 'border-[#DC2626]/20';
  const colorText  = esExito ? 'text-[#15803D]' : 'text-[#DC2626]';
  const Icono      = esExito ? CheckCircle2 : esExceso ? AlertTriangle : AlertCircle;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-[10px] border ${colorBg} ${colorBorde} p-4`}
    >
      <Icono size={20} className={`mt-0.5 shrink-0 ${colorText}`} />
      <p className={`flex-1 text-sm font-medium ${colorText}`}>{mensaje}</p>
      {onDismiss ? (
        <button
          onClick={onDismiss}
          aria-label="Cerrar alerta"
          className={`shrink-0 ${colorText} hover:opacity-70`}
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}

function BadgeEstado({ estado }) {
  const mapa = {
    APROBADO:  { label: 'Aprobado',  cls: 'bg-[#DCFCE7] text-[#15803D]' },
    RECIBIDO:  { label: 'Recibido',  cls: 'bg-[#DBEAFE] text-[#1D4ED8]' },
    EN_REVISION: { label: 'En revisión', cls: 'bg-[#FEF9C3] text-[#854D0E]' },
    RECHAZADO: { label: 'Rechazado', cls: 'bg-[#FEE2E2] text-[#B91C1C]' },
  };
  const { label, cls } = mapa[estado] ?? { label: estado, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function TarjetaResumen({ icono: Icono, label, valor, colorIcono = 'text-[#1F4E79]', bgIcono = 'bg-[#DCEAF7]' }) {
  return (
    <article className="flex items-center gap-4 rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] ${bgIcono} ${colorIcono}`}>
        <Icono size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-[#2F3A45]">{valor}</p>
      </div>
    </article>
  );
}

function FormularioRecepcion({ requerimiento, onConfirm, onCancel, isLoading, errorAlerta }) {
  const [cantidades, setCantidades] = useState(() =>
    Object.fromEntries(
      (requerimiento?.detalles ?? []).map((d) => [d.idMaterial, ''])
    )
  );
  const [observacion, setObservacion] = useState('');

  const pendientes = useMemo(() => {
    if (!requerimiento) return [];
    return requerimiento.detalles.filter(
      (d) => parseFloat(d.cantidadRecibida ?? 0) < parseFloat(d.cantidadSolicitada)
    );
  }, [requerimiento]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const detallesRecepcion = pendientes
      .map((d) => ({
        idMaterial:      d.idMaterial,
        cantidadRecibida: parseFloat(cantidades[d.idMaterial] || '0'),
        observacion:     observacion || undefined,
      }))
      .filter((d) => d.cantidadRecibida > 0);

    if (detallesRecepcion.length === 0) return;
    onConfirm(detallesRecepcion);
  };

  if (!requerimiento) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm"
    >
      <SectionHeader
        title={`Recepcionar: ${requerimiento.proyecto?.codigo ?? ''}`}
        description="Ingrese las cantidades recibidas por cada material. Solo se procesan los materiales con cantidad mayor a 0."
      />

      {/* CA HU-S8-3: Alerta de error visible antes del formulario */}
      {errorAlerta ? <AlertaBanner tipo="error" mensaje={errorAlerta} /> : null}

      <div className="space-y-3">
        {pendientes.map((detalle) => {
          const pendienteNum =
            parseFloat(detalle.cantidadSolicitada) -
            parseFloat(detalle.cantidadRecibida ?? 0);
          return (
            <div
              key={detalle.idMaterial}
              className="flex flex-col gap-2 rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#2F3A45]">
                  {detalle.material?.nombre ?? detalle.idMaterial}
                </p>
                <p className="text-xs text-gray-500">
                  Pendiente: <strong>{pendienteNum}</strong> {detalle.material?.unidad}
                </p>
              </div>
              <input
                type="number"
                min="0"
                max={pendienteNum}
                step="0.01"
                value={cantidades[detalle.idMaterial]}
                onChange={(e) =>
                  setCantidades((prev) => ({
                    ...prev,
                    [detalle.idMaterial]: e.target.value,
                  }))
                }
                placeholder="0"
                className="w-28 shrink-0 rounded-[8px] border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-right focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
                aria-label={`Cantidad recibida de ${detalle.material?.nombre}`}
              />
            </div>
          );
        })}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="obs-recepcion">
          Observación (opcional)
        </label>
        <textarea
          id="obs-recepcion"
          rows={2}
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          placeholder="Ej: Materiales recibidos completos, sin daños"
          className="w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#2F3A45] placeholder:text-gray-400 focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-[42px] items-center gap-2 rounded-[10px] bg-[#1F4E79] px-5 text-sm font-medium text-white hover:bg-[#153a5c] disabled:opacity-60"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
          {isLoading ? 'Procesando…' : 'Confirmar recepción'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="inline-flex h-[42px] items-center gap-2 rounded-[10px] border border-[#D1D5DB] px-5 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC] disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export function BodegaDashboardView({
  currentUser,
  isRestricted = false,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
}) {
  const [mobileNavOpen,   setMobileNavOpen]   = useState(false);
  const [proyectos,        setProyectos]       = useState([]);
  const [proyectoActualId, setProyectoActualId] = useState('');
  const [requerimientos,   setRequerimientos]  = useState([]);
  const [movimientos,      setMovimientos]     = useState([]);
  const [inventario,       setInventario]      = useState([]);
  const [loadStatus,       setLoadStatus]      = useState('loading');
  const [procesando,       setProcesando]      = useState(false);
  const [reqSeleccionado,  setReqSeleccionado] = useState(null);
  const [alertaError,      setAlertaError]     = useState(null);  // CA HU-S8-3
  const [alertaExito,      setAlertaExito]     = useState(null);
  const [retryCount,       setRetryCount]      = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const queryProjectId = searchParams.get('idProyecto');
  const queryTimestamp = searchParams.get('t');
  const prevQueryProjectIdRef = React.useRef(queryProjectId);

  const modules = getModulesForUser(currentUser);
  const isAuthorized = currentUser.roleName === 'Bodeguero';

  const proyectoActual = useMemo(
    () => proyectos.find((p) => p.id === proyectoActualId) ?? null,
    [proyectos, proyectoActualId]
  );

  // ── Carga inicial: proyectos del usuario ──────────────────────────────────
  useEffect(() => {
    if (!isAuthorized) return;

    const cargar = async () => {
      setLoadStatus('loading');
      try {
        const data = await fetchProjects();
        setProyectos(data ?? []);

        // Si hay un query parameter idProyecto y existe en los proyectos, seleccionarlo.
        if (queryProjectId && data?.some((p) => p.id === queryProjectId)) {
          setProyectoActualId(queryProjectId);
        } else if (data?.length) {
          setProyectoActualId(data[0].id);
        }

        setLoadStatus('ready');
      } catch {
        setLoadStatus('error');
      }
    };

    cargar();
  }, [isAuthorized, retryCount]);

  // Sincronizar el estado local cuando cambia el parámetro de búsqueda en la URL
  useEffect(() => {
    if (queryProjectId !== prevQueryProjectIdRef.current) {
      prevQueryProjectIdRef.current = queryProjectId;
      if (queryProjectId && proyectos.length > 0 && queryProjectId !== proyectoActualId) {
        if (proyectos.some((p) => p.id === queryProjectId)) {
          setProyectoActualId(queryProjectId);
        }
      }
    }
  }, [queryProjectId, proyectos, proyectoActualId]);

  // Sincronizar el query param cuando el usuario cambia el proyecto manualmente
  useEffect(() => {
    if (proyectoActualId && proyectoActualId !== queryProjectId) {
      setSearchParams({ idProyecto: proyectoActualId }, { replace: true });
      prevQueryProjectIdRef.current = proyectoActualId;
    }
  }, [proyectoActualId, queryProjectId, setSearchParams]);

  // ── Carga de datos por proyecto ───────────────────────────────────────────
  useEffect(() => {
    if (!proyectoActualId || loadStatus !== 'ready') return;

    const cargarDatosProyecto = async () => {
      const [resReqs, resMov, resInv] = await Promise.allSettled([
        fetchRequerimientosAprobados(proyectoActualId, navigator.onLine),
        fetchMovimientos(proyectoActualId, { limit: 50, isOnline: navigator.onLine }),
        fetchInventario(proyectoActualId, navigator.onLine),
      ]);

      if (resReqs.status === 'fulfilled')  setRequerimientos(resReqs.value.data ?? []);
      if (resMov.status  === 'fulfilled')  setMovimientos(resMov.value.data   ?? []);
      if (resInv.status  === 'fulfilled')  setInventario(resInv.value.data    ?? []);
    };

    cargarDatosProyecto();
  }, [proyectoActualId, loadStatus, queryTimestamp]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSeleccionarReq = (req) => {
    setReqSeleccionado(req);
    setAlertaError(null);
    setAlertaExito(null);
  };

  /**
   * Envía la recepción al servidor.
   * CA HU-S8-3: Muestra alerta clara si hay error de negocio (422).
   */
  const handleConfirmarRecepcion = async (detallesRecepcion) => {
    if (!reqSeleccionado || !proyectoActualId) return;

    setProcesando(true);
    setAlertaError(null);

    try {
      const resultado = await recepcionarMateriales({
        idProyecto:       proyectoActualId,
        idRequerimiento:  reqSeleccionado.id,
        detallesRecepcion,
        isOnline:         navigator.onLine,
      });

      // Actualizar la lista de requerimientos y movimientos
      const [resReqs, resMov, resInv] = await Promise.allSettled([
        fetchRequerimientosAprobados(proyectoActualId, navigator.onLine),
        fetchMovimientos(proyectoActualId, { limit: 50, isOnline: navigator.onLine }),
        fetchInventario(proyectoActualId, navigator.onLine),
      ]);
      if (resReqs.status === 'fulfilled') setRequerimientos(resReqs.value.data ?? []);
      if (resMov.status  === 'fulfilled') setMovimientos(resMov.value.data    ?? []);
      if (resInv.status  === 'fulfilled') setInventario(resInv.value.data     ?? []);

      setAlertaExito(resultado.message ?? 'Recepción registrada correctamente.');
      setReqSeleccionado(null);
    } catch (error) {
      // CA HU-S8-3: Error de negocio → alerta visible
      const mensajeError =
        error.response?.data?.error ??
        error.message ??
        'No fue posible registrar la recepción. Reintente.';
      setAlertaError(mensajeError);
    } finally {
      setProcesando(false);
    }
  };

  // ── Guard: rol no autorizado ──────────────────────────────────────────────
  if (!isAuthorized || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Bodega e Inventario"
          onGoHome={onGoHome}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
          onOpenNavigation={() => setMobileNavOpen(true)}
        />
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation
            modules={modules}
            activeItemId="dashboard"
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
              <h1 className="text-2xl font-semibold text-[#2F3A45]">No tiene acceso a esta sección</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                El módulo de bodega e inventario está disponible exclusivamente para el rol Bodeguero.
                Vuelva al panel principal para continuar con una vista autorizada.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={onGoHome}
                  className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]"
                >
                  Volver al panel principal
                </button>
                <button
                  onClick={onOpenProfile}
                  className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]"
                >
                  Abrir mi perfil
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Bodega e Inventario"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="inventory"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0 space-y-6">

          {/* Encabezado del módulo */}
          <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1F4E79]">
                  Módulo · Bodega
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-[#2F3A45]">
                  Gestión de Bodega e Inventario
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Recepcione materiales de requerimientos aprobados y consulte el inventario del proyecto activo.
                </p>
              </div>
              <button
                onClick={() => setRetryCount((v) => v + 1)}
                className="inline-flex h-[38px] shrink-0 items-center gap-2 rounded-[10px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]"
                aria-label="Actualizar datos"
              >
                <RefreshCw size={14} />
                Actualizar
              </button>
            </div>
          </section>

          {/* Estado de carga */}
          {loadStatus === 'loading' ? (
            <div className="flex items-center justify-center rounded-[12px] border border-[#D1D5DB] bg-white p-12 shadow-sm">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 size={32} className="animate-spin text-[#1F4E79]" />
                <p className="text-sm font-medium text-[#2F3A45]">Cargando datos de bodega…</p>
              </div>
            </div>
          ) : null}

          {loadStatus === 'error' ? (
            <div className="rounded-[12px] border border-[#DC2626]/20 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-lg font-semibold text-[#2F3A45]">
                No fue posible cargar los datos de bodega
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Verifique su conexión e intente nuevamente.
              </p>
              <button
                onClick={() => setRetryCount((v) => v + 1)}
                className="mt-4 inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]"
              >
                <RefreshCw size={14} />
                Reintentar
              </button>
            </div>
          ) : null}

          {loadStatus === 'ready' ? (
            <>
              {/* Selector de proyecto (Siempre visible para clarificar contexto) */}
              <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
                <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Proyecto activo
                </label>
                <div className="relative">
                  <select
                    value={proyectoActualId}
                    disabled={proyectos.length <= 1}
                    onChange={(e) => {
                      setProyectoActualId(e.target.value);
                      setReqSeleccionado(null);
                      setAlertaError(null);
                      setAlertaExito(null);
                    }}
                    className="w-full appearance-none rounded-[10px] border border-[#D1D5DB] bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-[#2F3A45] focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 disabled:bg-gray-50 disabled:opacity-80"
                  >
                    {proyectos.length === 0 ? (
                      <option value="">Sin proyectos asignados</option>
                    ) : (
                      proyectos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.codigo} — {p.nombre}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </section>

              {/* Tarjetas resumen */}
              <section className="grid gap-4 sm:grid-cols-3">
                <TarjetaResumen
                  icono={ClipboardList}
                  label="Requerimientos aprobados"
                  valor={requerimientos.length}
                />
                <TarjetaResumen
                  icono={Package}
                  label="Materiales en inventario"
                  valor={inventario.length}
                  colorIcono="text-[#15803D]"
                  bgIcono="bg-[#DCFCE7]"
                />
                <TarjetaResumen
                  icono={ArrowRight}
                  label="Movimientos recientes"
                  valor={movimientos.length}
                  colorIcono="text-[#9333EA]"
                  bgIcono="bg-[#F3E8FF]"
                />
              </section>

              {/* Alertas de éxito/error globales */}
              {alertaExito ? (
                <AlertaBanner
                  tipo="exito"
                  mensaje={alertaExito}
                  onDismiss={() => setAlertaExito(null)}
                />
              ) : null}

              {/* Layout principal: requerimientos + formulario */}
              <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">

                {/* ── Panel izquierdo: Requerimientos APROBADOS ── */}
                <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                  <SectionHeader
                    title="Requerimientos aprobados"
                    description={`Proyecto: ${proyectoActual?.nombre ?? '—'}. Seleccione uno para recepcionar materiales.`}
                  />

                  {requerimientos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-gray-400">
                      <PackageCheck size={36} />
                      <p className="text-sm">No hay requerimientos aprobados pendientes de recepción para este proyecto.</p>
                      <p className="text-xs text-gray-500 max-w-[250px]">
                        Si busca un requerimiento aprobado en otro proyecto, cambie el "Proyecto activo" en el selector superior.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2" role="list">
                      {requerimientos.map((req) => {
                        const isSelected = reqSeleccionado?.id === req.id;
                        return (
                          <li key={req.id}>
                            <button
                              type="button"
                              onClick={() => handleSeleccionarReq(req)}
                              className={`w-full rounded-[10px] border p-4 text-left transition-colors ${
                                isSelected
                                  ? 'border-[#1F4E79] bg-[#DCEAF7]/50'
                                  : 'border-[#E5E7EB] bg-[#F9FAFB] hover:border-[#1F4E79]/40 hover:bg-[#F7F9FC]'
                              }`}
                              aria-pressed={isSelected}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-[#2F3A45]">
                                    {req.proyecto?.codigo ?? ''}
                                  </p>
                                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                                    {req.justificacion}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-400">
                                    {req.detalles?.length ?? 0} material(es) ·{' '}
                                    Aprobado por {req.aprobador?.nombre ?? '—'}
                                  </p>
                                </div>
                                <BadgeEstado estado={req.estado} />
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                {/* ── Panel derecho: Formulario de recepción ── */}
                <div className="space-y-4">
                  {reqSeleccionado ? (
                    <FormularioRecepcion
                      requerimiento={reqSeleccionado}
                      onConfirm={handleConfirmarRecepcion}
                      onCancel={() => {
                        setReqSeleccionado(null);
                        setAlertaError(null);
                      }}
                      isLoading={procesando}
                      errorAlerta={alertaError}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-[12px] border border-[#D1D5DB] bg-white py-16 text-center text-gray-400 shadow-sm">
                      <ClipboardList size={36} />
                      <p className="text-sm">
                        Seleccione un requerimiento aprobado para iniciar la recepción.
                      </p>
                    </div>
                  )}

                  {/* ── Inventario actual ── */}
                  <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                    <SectionHeader
                      title="Inventario actual"
                      description="Saldo disponible por material en el proyecto activo."
                    />

                    {inventario.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-400">
                        <p>No hay materiales con stock físico en este proyecto.</p>
                        <p className="mt-1 text-xs text-gray-500">
                          (Para ver todos los materiales disponibles en el sistema, vaya al Maestro de Materiales).
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full min-w-[420px] text-sm">
                          <thead>
                            <tr className="border-b border-[#E5E7EB]">
                              <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Material
                              </th>
                              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Stock actual
                              </th>
                              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Entradas
                              </th>
                              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Salidas
                              </th>
                              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Diferencia
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventario.map((item) => {
                              const dif = item.desglose?.diferencia ?? 0;
                              const difColor =
                                dif === 0
                                  ? 'text-gray-400'
                                  : dif > 0
                                  ? 'text-[#15803D]'
                                  : 'text-[#DC2626]';

                              return (
                                <tr
                                  key={item.idMaterial}
                                  className="border-b border-[#F3F4F6] last:border-0"
                                >
                                  <td className="py-3 pr-4">
                                    <p className="font-medium text-[#2F3A45]">
                                      {item.material?.nombre}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {item.material?.codigo} · {item.material?.unidad}
                                    </p>
                                  </td>
                                  <td className="py-3 text-right font-semibold text-[#2F3A45]">
                                    {parseFloat(item.stockActual ?? 0).toFixed(2)}
                                  </td>
                                  <td className="py-3 text-right text-[#15803D]">
                                    +{parseFloat(item.desglose?.totalEntradas ?? 0).toFixed(2)}
                                  </td>
                                  <td className="py-3 text-right text-[#DC2626]">
                                    -{parseFloat(item.desglose?.totalSalidas ?? 0).toFixed(2)}
                                  </td>
                                  <td className={`py-3 text-right font-medium ${difColor}`}>
                                    {dif > 0 ? '+' : ''}{parseFloat(dif).toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </div>
              </div>

              {/* ── Movimientos recientes ── */}
              <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                <SectionHeader
                  title="Movimientos recientes"
                  description="Historial de entradas, salidas y ajustes en el proyecto activo."
                />

                {movimientos.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400">
                    Sin movimientos registrados para este proyecto.
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[500px] text-sm">
                      <thead>
                        <tr className="border-b border-[#E5E7EB]">
                          <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Fecha</th>
                          <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Material</th>
                          <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tipo</th>
                          <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Cantidad</th>
                          <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Stock resultante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movimientos.slice(0, 20).map((mov) => {
                          const tipoColor =
                            mov.tipoMovimiento === 'ENTRADA'
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : mov.tipoMovimiento === 'SALIDA'
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : 'bg-[#FEF9C3] text-[#854D0E]';

                          return (
                            <tr key={mov.id} className="border-b border-[#F3F4F6] last:border-0">
                              <td className="py-3 pr-4 text-xs text-gray-500">
                                {mov.fechaMovimiento
                                  ? new Date(mov.fechaMovimiento).toLocaleDateString('es-CO', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })
                                  : '—'}
                              </td>
                              <td className="py-3 pr-4">
                                <p className="font-medium text-[#2F3A45]">
                                  {mov.material?.nombre ?? '—'}
                                </p>
                                <p className="text-xs text-gray-400">{mov.material?.codigo}</p>
                              </td>
                              <td className="py-3 pr-4">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tipoColor}`}
                                >
                                  {mov.tipoMovimiento}
                                </span>
                              </td>
                              <td className="py-3 text-right font-medium text-[#2F3A45]">
                                {parseFloat(mov.cantidad ?? 0).toFixed(2)}
                              </td>
                              <td className="py-3 text-right text-gray-600">
                                {parseFloat(mov.cantidadResultante ?? 0).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {movimientos.length > 20 ? (
                      <p className="mt-3 text-center text-xs text-gray-400">
                        Mostrando 20 de {movimientos.length} movimientos.
                      </p>
                    ) : null}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
