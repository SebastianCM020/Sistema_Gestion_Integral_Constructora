// ─────────────────────────────────────────────────────────────────────────────
// ConsolidacionMensualView.jsx — Sprint 10
// Panel de Consolidación Mensual y Ejecución de Cierre Contable
//
// Actividades cubiertas:
//   Act-1: Vista de consolidación contable-operativa por proyecto y periodo
//   Act-2: Ejecución de validación pre-cierre con feedback visual
//   Act-3: Ejecución del cierre mensual con hash SHA-256
//
// RBAC: Contador puede ejecutar cierre. Admin y Presidente pueden consultar.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3, ShieldCheck, Lock, RefreshCw, CheckCircle2, XCircle,
  AlertTriangle, Loader2, Hash, Calendar, Building2, TrendingUp,
  ShoppingCart, Package, Layers, ChevronDown, ChevronUp, ShieldAlert,
  ClipboardList, BadgeCheck, ArrowRight, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import { AppHeader }         from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import {
  fetchConsolidacion,
  postValidarPreCierre,
  postEjecutarCierre,
  fetchCierres,
  postRechazarConsumo,
  postAprobarConsumo,
} from '../../services/cierre.service.js';
import { fetchProjects } from '../../services/projects.service.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCOP = (val) => {
  if (val == null) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(Number(val));
};

const formatNum = (val, dec = 2) =>
  val != null ? Number(val).toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : '—';

const mesAnioActual = () => {
  const now = new Date();
  const m   = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${m}`;
};

// Genera opciones de mes desde la fecha de inicio del proyecto hasta el mes actual
const generarOpcionesMes = (proyecto) => {
  if (!proyecto || !proyecto.startDate) {
    const opciones = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const lbl = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
      opciones.push({ val, lbl });
    }
    return opciones;
  }

  const [sy, sm] = proyecto.startDate.split('T')[0].split('-');
  const start = new Date(Number(sy), Number(sm) - 1, 1);
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const opciones = [];
  let current = new Date(currentMonth.getTime()); // Muestra hasta el mes actual

  while (current >= start) {
    const val = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    const lbl = current.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    opciones.push({ val, lbl });
    current.setMonth(current.getMonth() - 1);
  }

  if (opciones.length === 0) {
    const val = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
    const lbl = start.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    opciones.push({ val, lbl });
  }

  return opciones;
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const palette = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    green:  'bg-emerald-50 border-emerald-200 text-emerald-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    slate:  'bg-slate-50 border-slate-200 text-slate-700',
  };
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${palette[color]}`}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-xl font-bold leading-none">{value}</p>
        {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
      </div>
    </div>
  );
}

function ErrorBloq({ errores = [], advertencias = [] }) {
  const [showAdv, setShowAdv] = useState(false);
  return (
    <div className="space-y-3">
      {errores.map((e, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700">[{e.codigo}] {e.descripcion}</p>
          </div>
        </div>
      ))}

      {advertencias.length > 0 && (
        <div>
          <button
            onClick={() => setShowAdv((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium"
          >
            {showAdv ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {advertencias.length} advertencia(s) no bloqueantes
          </button>
          {showAdv && advertencias.map((a, i) => (
            <div key={i} className="mt-2 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700">[{a.codigo}] {a.descripcion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HashCard({ hash }) {
  if (!hash) return null;
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
        <Hash size={16} /> Hash SHA-256 de integridad
      </p>
      <p className="mt-1 break-all font-mono text-xs text-emerald-700 bg-white/60 rounded-lg px-3 py-2 mt-2">
        {hash}
      </p>
      <p className="mt-2 text-xs text-emerald-600">
        Este hash garantiza la inmutabilidad del consolidado. Cualquier alteración de los datos produciría un hash diferente.
      </p>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ConsolidacionMensualView({
  currentUser,
  isRestricted = false,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
}) {
  const modules = getModulesForUser(currentUser);

  // RBAC
  const puedeEjecutar = ['Contador', 'Administrador del Sistema'].includes(currentUser.roleName);
  const puedeVer      = ['Contador', 'Administrador del Sistema', 'Presidente / Gerente',
                         'Auxiliar de Contabilidad'].includes(currentUser.roleName);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ── Selección de proyecto y periodo ───────────────────────────────────
  const [proyectos, setProyectos]     = useState([]);
  const [idProyecto, setIdProyecto]   = useState('');
  const [mesAnio,    setMesAnio]      = useState('');

  const opcionesMes = useMemo(() => {
    const p = proyectos.find(x => x.id === idProyecto);
    return generarOpcionesMes(p);
  }, [proyectos, idProyecto]);

  // Asegurar que el mes seleccionado es válido para el proyecto actual
  useEffect(() => {
    if (opcionesMes.length > 0 && !opcionesMes.find(o => o.val === mesAnio)) {
      setMesAnio(opcionesMes[0].val); // Selecciona el mes más reciente (actual o último disponible)
    }
  }, [opcionesMes, mesAnio]);

  // ── Cargar proyectos del usuario ──────────────────────────────────────
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        // Filtrar activos si se requiere, o mostrarlos todos
        const proys = data.filter(p => p.status !== 'inactive');
        setProyectos(proys);
        if (proys.length > 0 && !idProyecto) {
          setIdProyecto(proys[0].id);
        }
      } catch (err) {
        console.error('Error al cargar proyectos:', err);
      }
    };
    loadProjects();
  }, []);

  // ── Estados de las operaciones ─────────────────────────────────────────
  const [consolidacion, setConsolidacion] = useState(null);
  const [loadStatus, setLoadStatus]       = useState('idle'); // idle|loading|ready|error
  const [validacion, setValidacion]       = useState(null);   // null | { valido, errores, advertencias }
  const [loadingVal, setLoadingVal]       = useState(false);
  const [cierre, setCierre]               = useState(null);   // resultado del cierre
  const [loadingCierre, setLoadingCierre] = useState(false);
  const [rechazandoId, setRechazandoId]   = useState(null);
  const [aprobandoId,  setAprobandoId]    = useState(null);
  const [historialCierres, setHistorialCierres] = useState([]);
  const [errorMsg, setErrorMsg]           = useState('');

  // ── Carga historial de proyectos desde cierres existentes ─────────────
  useEffect(() => {
    if (!puedeVer) return;
    fetchCierres({ limit: 5 })
      .then((r) => setHistorialCierres(r.data || []))
      .catch(() => {});
  }, [puedeVer, cierre]);

  // ── Cargar consolidación ───────────────────────────────────────────────
  const cargarConsolidacion = useCallback(async (preserveCierre = false) => {
    if (!idProyecto || !mesAnio) return;
    setLoadStatus('loading');
    setConsolidacion(null);
    setValidacion(null);
    if (!preserveCierre) setCierre(null);
    setErrorMsg('');
    try {
      const data = await fetchConsolidacion(idProyecto, mesAnio);
      setConsolidacion(data);
      setLoadStatus('ready');
    } catch (err) {
      console.error('[Consolidacion] cargar:', err);
      setErrorMsg(err?.response?.data?.message || 'Error al cargar el consolidado.');
      setLoadStatus('error');
    }
  }, [idProyecto, mesAnio]);

  useEffect(() => {
    if (idProyecto && mesAnio) cargarConsolidacion();
  }, [cargarConsolidacion]);

  // ── Validar pre-cierre ─────────────────────────────────────────────────
  const handleValidar = async () => {
    setLoadingVal(true);
    setValidacion(null);
    setErrorMsg('');
    try {
      const resultado = await postValidarPreCierre(idProyecto, mesAnio);
      setValidacion(resultado);
    } catch (err) {
      // El backend devuelve 422 con datos de validación
      const data = err?.response?.data;
      if (data?.data) {
        setValidacion(data.data);
      } else {
        setErrorMsg(data?.message || 'Error durante la validación pre-cierre.');
      }
    } finally {
      setLoadingVal(false);
    }
  };

  // ── Ejecutar cierre ────────────────────────────────────────────────────
  const handleEjecutarCierre = async () => {
    if (!window.confirm(`¿Confirma el cierre del periodo ${mesAnio}? Esta acción es irreversible.`)) return;
    setLoadingCierre(true);
    setErrorMsg('');
    try {
      const resultado = await postEjecutarCierre(idProyecto, mesAnio);
      setCierre(resultado);
      // Recargar consolidación para reflejar estado cerrado sin borrar el banner de éxito
      await cargarConsolidacion(true);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errores?.length) {
        setValidacion({ valido: false, errores: data.errores, advertencias: data.advertencias || [] });
      }
      setErrorMsg(data?.message || 'Error al ejecutar el cierre. La operación fue revertida (ROLLBACK).');
    } finally {
      setLoadingCierre(false);
    }
  };

  // ── Rechazar consumo ───────────────────────────────────────────────────
  const handleRechazarConsumo = async (idMovimiento) => {
    const observacion = window.prompt('Indique el motivo del rechazo del consumo:');
    if (!observacion || !observacion.trim()) return;

    setRechazandoId(idMovimiento);
    setErrorMsg('');
    try {
      await postRechazarConsumo(idMovimiento, observacion);
      await cargarConsolidacion(true);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Error al rechazar el consumo.');
    } finally {
      setRechazandoId(null);
    }
  };

  // ── Aprobar consumo ────────────────────────────────────────────────────
  const handleAprobarConsumo = async (idMovimiento) => {
    setAprobandoId(idMovimiento);
    setErrorMsg('');
    try {
      await postAprobarConsumo(idMovimiento);
      // Recargar para remover el consumo de la lista de pendientes
      await cargarConsolidacion(true);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Error al aprobar el consumo.');
    } finally {
      setAprobandoId(null);
    }
  };

  // ── Acceso denegado ────────────────────────────────────────────────────
  if (!puedeVer || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader currentUser={currentUser} currentAreaLabel="Consolidación Mensual"
          onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout}
          onOpenNavigation={() => setMobileNavOpen(true)} />
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation modules={modules} activeItemId="payroll" isOpen={mobileNavOpen}
            currentUser={currentUser} onClose={() => setMobileNavOpen(false)}
            onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />
          <main>
            <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
                <ShieldAlert size={28} />
              </div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">Acceso restringido</h1>
              <p className="mt-2 text-sm text-gray-600">
                Este módulo está disponible para el frente contable (Contador, Administrador, Presidente).
              </p>
              <button onClick={onGoHome}
                className="mt-6 inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
                Volver al panel principal
              </button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const yaCerrado = consolidacion?.cierreExistente?.estado === 'CERRADO';

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader currentUser={currentUser} currentAreaLabel="Consolidación y Cierre Mensual"
        onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)} />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation modules={modules} activeItemId="payroll" isOpen={mobileNavOpen}
          currentUser={currentUser} onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />

        <main className="min-w-0 space-y-5">

          {/* ── Encabezado ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-[#111827]">
                <BarChart3 size={22} className="text-[#1F4E79]" />
                Consolidación y Cierre Mensual
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Sprint 10 · Resumen contable-operativo + cierre con hash SHA-256
              </p>
            </div>
          </div>

          {/* ── Selectores ───────────────────────────────────────────────── */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Selección de proyecto y período
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Select Proyecto */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  <Building2 size={12} className="mr-1 inline" /> Proyecto
                </label>
                <select
                  id="sel-proyecto"
                  value={idProyecto}
                  onChange={(e) => setIdProyecto(e.target.value)}
                  className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm text-[#374151] focus:border-[#1F4E79] focus:outline-none"
                  disabled={proyectos.length === 0}
                >
                  {proyectos.length === 0 && <option value="">Sin proyectos asignados</option>}
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id}>{p.name || p.id}</option>
                  ))}
                </select>
              </div>

              {/* Periodo */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  <Calendar size={12} className="mr-1 inline" /> Periodo (mes-año)
                </label>
                <select id="sel-mes-anio" value={mesAnio} onChange={(e) => setMesAnio(e.target.value)}
                  className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm text-[#374151] focus:border-[#1F4E79] focus:outline-none"
                  disabled={opcionesMes.length === 0}>
                  {opcionesMes.map((o) => (
                    <option key={o.val} value={o.val}>{o.lbl}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              id="btn-cargar-consolidacion"
              onClick={cargarConsolidacion}
              disabled={!idProyecto || !mesAnio || loadStatus === 'loading'}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#153a5c] disabled:opacity-50"
            >
              {loadStatus === 'loading'
                ? <Loader2 size={15} className="animate-spin" />
                : <RefreshCw size={15} />
              }
              Cargar consolidación
            </button>
          </div>

          {/* ── Mensaje de error ─────────────────────────────────────────── */}
          {errorMsg && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* ── Resultado del cierre exitoso ─────────────────────────────── */}
          {cierre && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <BadgeCheck size={22} className="text-emerald-600" />
                <h2 className="text-lg font-bold text-emerald-800">¡Cierre ejecutado con éxito!</h2>
              </div>
              <p className="text-sm text-emerald-700">
                Periodo <strong>{mesAnio}</strong> cerrado y bloqueado. Todos los registros asociados son ahora de solo lectura.
              </p>
              <HashCard hash={cierre?.cierre?.hashSeguridad} />
              {cierre.advertencias?.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-amber-700 mb-2">Advertencias registradas:</p>
                  {cierre.advertencias.map((a, i) => (
                    <div key={i} className="flex gap-2 text-xs text-amber-700">
                      <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                      {a.descripcion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Consolidación cargada ─────────────────────────────────────── */}
          {loadStatus === 'ready' && consolidacion && (
            <>
              {/* Banner periodo ya cerrado */}
              {yaCerrado && !cierre && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Lock size={18} className="shrink-0 text-slate-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Periodo cerrado</p>
                    <p className="text-xs text-slate-500">
                      Este periodo ya fue cerrado (ID: {consolidacion.cierreExistente?.id}). Los datos son de solo lectura.
                    </p>
                  </div>
                </div>
              )}

              {/* Header del proyecto */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Proyecto</p>
                    <h2 className="text-lg font-bold text-[#111827]">
                      {consolidacion.proyecto?.nombre || consolidacion.idProyecto}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Código: {consolidacion.proyecto?.codigo} · Estado: {consolidacion.proyecto?.estado}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Periodo</p>
                    <p className="text-lg font-bold text-[#1F4E79]">{mesAnio}</p>
                    <p className="text-xs text-gray-400">Generado: {new Date(consolidacion.generadoEn).toLocaleString('es-CO')}</p>
                  </div>
                </div>

                {/* Barra de avance */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Avance global del proyecto</span>
                    <span className="font-semibold text-[#1F4E79]">{consolidacion.porcentajeAvance}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#1F4E79] to-[#2D7DD2] transition-all duration-500"
                      style={{ width: `${Math.min(100, consolidacion.porcentajeAvance)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Presupuesto: {formatCOP(consolidacion.totalPresupuestado)}
                  </p>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={TrendingUp}  label="Monto Avances"     value={formatCOP(consolidacion.totalAvanceMonto)}
                  sub={`${formatNum(consolidacion.totalAvanceQty, 2)} unid · ${consolidacion.rubrosEjecutados} rubros`} color="blue" />
                <StatCard icon={ShoppingCart} label="Compras aprobadas" value={formatCOP(consolidacion.totalComprasMonto)}
                  sub={`${consolidacion.reqAprobados} aprobados de ${consolidacion.totalRequerimientos}`} color="orange" />
                <StatCard icon={Package}     label="Consumos en obra"  value={`${formatNum(consolidacion.totalConsumosQty, 2)} uds`}
                  sub={`${consolidacion.snapshotInventario?.length || 0} materiales en inventario`} color="purple" />
                <StatCard icon={Layers}      label="Recepciones"       value={consolidacion.totalRecepciones}
                  sub={`${consolidacion.cantidadAvances} registros de avance`} color="green" />
              </div>

              {/* Detalle de consumos para validación — APARECE PRIMERO */}
              {consolidacion.consumosDetalle?.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                  <div className="border-b border-[#F3F4F6] bg-[#F9FAFB] px-5 py-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#374151]">
                      <ClipboardList size={14} className="mr-1.5 inline text-[#1F4E79]" />
                      Validación de Consumos Registrados
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {consolidacion.consumosDetalle.length} consumo(s)
                      </span>
                    </p>
                    {!yaCerrado && !cierre && puedeEjecutar && (
                      <p className="text-xs text-gray-400">Revise y apruebe o rechace cada consumo antes de cerrar</p>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#F3F4F6] bg-gray-50/50">
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Fecha</th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Material</th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Responsable</th>
                          <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500">Cantidad</th>
                          {!yaCerrado && !cierre && puedeEjecutar && (
                            <th className="px-5 py-2.5 text-center text-xs font-semibold text-gray-500">Acción</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {consolidacion.consumosDetalle.map((c) => (
                          <tr key={c.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                            <td className="px-5 py-2.5 text-xs text-gray-500">{new Date(c.fecha).toLocaleDateString('es-CO')}</td>
                            <td className="px-5 py-2.5 text-sm text-[#374151]">
                              {c.nombre} <span className="text-xs text-gray-400">({c.codigo})</span>
                            </td>
                            <td className="px-5 py-2.5 text-xs text-gray-500">{c.responsable}</td>
                            <td className="px-5 py-2.5 text-right text-sm font-semibold text-[#111827]">
                              {formatNum(c.cantidad, 2)} {c.unidad}
                            </td>
                            {!yaCerrado && !cierre && puedeEjecutar && (
                              <td className="px-5 py-2.5">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Botón Aprobar */}
                                  <button
                                    onClick={() => handleAprobarConsumo(c.id)}
                                    disabled={aprobandoId === c.id || rechazandoId === c.id}
                                    title="Aprobar consumo"
                                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                                  >
                                    {aprobandoId === c.id
                                      ? <Loader2 size={12} className="animate-spin" />
                                      : <ThumbsUp size={12} />
                                    }
                                    Aprobar
                                  </button>
                                  {/* Botón Rechazar */}
                                  <button
                                    onClick={() => handleRechazarConsumo(c.id)}
                                    disabled={rechazandoId === c.id || aprobandoId === c.id}
                                    title="Rechazar consumo y reversar inventario"
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                                  >
                                    {rechazandoId === c.id
                                      ? <Loader2 size={12} className="animate-spin" />
                                      : <ThumbsDown size={12} />
                                    }
                                    Rechazar
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Snapshot inventario — APARECE DESPUÉS DE CONSUMOS */}
              {consolidacion.snapshotInventario?.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                  <div className="border-b border-[#F3F4F6] bg-[#F9FAFB] px-5 py-3">
                    <p className="text-sm font-semibold text-[#374151]">
                      <Package size={14} className="mr-1.5 inline" />
                      Inventario al cierre del periodo ({consolidacion.snapshotInventario.length} materiales)
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#F3F4F6]">
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Código</th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Material</th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Unidad</th>
                          <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consolidacion.snapshotInventario.map((inv) => (
                          <tr key={inv.idMaterial} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                            <td className="px-5 py-2.5 font-mono text-xs text-gray-400">{inv.codigo}</td>
                            <td className="px-5 py-2.5 text-sm text-[#374151]">{inv.nombre}</td>
                            <td className="px-5 py-2.5 text-xs text-gray-500">{inv.unidad}</td>
                            <td className={`px-5 py-2.5 text-right text-sm font-semibold ${inv.cantidadDisponible < 0 ? 'text-red-500' : 'text-[#111827]'}`}>
                              {formatNum(inv.cantidadDisponible, 2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}



              {/* Panel de acciones — solo si el periodo no está cerrado */}
              {!yaCerrado && !cierre && puedeEjecutar && (
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-4">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-[#111827]">
                    <ShieldCheck size={18} className="text-[#1F4E79]" />
                    Acciones de cierre
                  </h3>

                  {/* Paso 1: Validar */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      id="btn-validar-pre-cierre"
                      onClick={handleValidar}
                      disabled={loadingVal}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#1F4E79] px-4 py-2 text-sm font-medium text-[#1F4E79] hover:bg-[#1F4E79]/5 disabled:opacity-50"
                    >
                      {loadingVal
                        ? <Loader2 size={15} className="animate-spin" />
                        : <ClipboardList size={15} />
                      }
                      Ejecutar validación pre-cierre
                    </button>
                    <ArrowRight size={16} className="hidden text-gray-300 sm:block" />
                    {/* Paso 2: Cerrar */}
                    <button
                      id="btn-ejecutar-cierre"
                      onClick={handleEjecutarCierre}
                      disabled={loadingCierre || !validacion?.valido}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#153a5c] disabled:opacity-40"
                    >
                      {loadingCierre
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Lock size={15} />
                      }
                      Ejecutar cierre y generar hash
                    </button>
                  </div>

                  {/* Resultado de la validación */}
                  {validacion && (
                    <div>
                      {validacion.valido ? (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                          <CheckCircle2 size={20} className="text-emerald-600" />
                          <div>
                            <p className="text-sm font-semibold text-emerald-700">Validación aprobada</p>
                            <p className="text-xs text-emerald-600">
                              No se detectaron bloqueos. Puede proceder con el cierre.
                              {validacion.advertencias?.length > 0 && ` (${validacion.advertencias.length} advertencia(s))`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2 text-sm font-semibold text-red-700">
                            <XCircle size={14} className="mr-1 inline" />
                            Cierre bloqueado — se encontraron {validacion.errores?.length} error(es)
                          </p>
                          <ErrorBloq errores={validacion.errores} advertencias={validacion.advertencias} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── Historial de cierres recientes ─────────────────────────────── */}
          {historialCierres.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
              <div className="border-b border-[#F3F4F6] bg-[#F9FAFB] px-5 py-3">
                <p className="text-sm font-semibold text-[#374151]">
                  <Lock size={14} className="mr-1.5 inline" /> Cierres recientes
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F3F4F6]">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Periodo</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Proyecto</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Contador</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Estado</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Monto total</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialCierres.map((c) => (
                      <tr key={c.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                        <td className="px-5 py-3 font-semibold text-[#1F4E79]">{c.mesAnio}</td>
                        <td className="px-5 py-3 text-sm text-[#374151]">
                          {c.proyecto?.nombre || c.idProyecto}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500">
                          {c.contador ? `${c.contador.nombre} ${c.contador.apellido}` : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                            ${c.estadoCierre === 'CERRADO'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                            {c.estadoCierre === 'CERRADO'
                              ? <><Lock size={10} className="mr-1" /> Cerrado</>
                              : <><RefreshCw size={10} className="mr-1" /> Abierto</>
                            }
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-[#111827]">
                          {formatCOP(c.montoTotal)}
                        </td>
                        <td className="px-5 py-3">
                          {c.hashSeguridad ? (
                            <span className="inline-block max-w-[120px] truncate rounded bg-emerald-50 px-2 py-0.5 font-mono text-xs text-emerald-700" title={c.hashSeguridad}>
                              {c.hashSeguridad}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info sprint */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">¿Cómo funciona el cierre seguro?</p>
            <p className="text-xs leading-relaxed">
              El proceso ejecuta una <strong>transacción SQL atómica</strong> (BEGIN/COMMIT/ROLLBACK).
              Si ocurre cualquier error en la consolidación, validación o generación del hash,{' '}
              <strong>toda la operación se revierte</strong> sin afectar la base de datos. El hash{' '}
              <strong>SHA-256</strong> garantiza la inmutabilidad: cualquier alteración posterior
              de los datos produciría un hash diferente, detectable en auditoría.
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}
