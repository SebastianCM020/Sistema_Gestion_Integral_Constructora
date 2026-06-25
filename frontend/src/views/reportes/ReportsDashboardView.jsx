// ─────────────────────────────────────────────────────────────────────────────
// ReportsDashboardView.jsx — Dashboard Gerencial con KPIs reales
//
// Bugs corregidos:
//   ✔ metric.key  → metric.id  (ManagerKpiCards itera con key={metric.key})
//   ✔ metric.status → campo derivado del valor  (getDashboardStatusMeta espera status)
//   ✔ metric.unit   → campo explícito           (formatReportMetricValue espera unit)
//   ✔ onOpenDetail / onOpenDefinition nunca pasados → conectados al activeOverlay
//   ✔ PDF con idCierre=null → exportar Excel como alternativa real
//   ✔ insight.tone vs insight.type → ReportInsightCard usa 'tone', no 'type'
//   ✔ Gráficas reales de pastel y barras con Recharts
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ShieldAlert, Download, Loader2, BarChart2,
  TrendingUp, Package, ShoppingCart, Clock, CheckCircle2,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';

import { AppHeader }         from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { ManagerKpiCards }   from '../../components/reportes/ManagerKpiCards.jsx';
import { ReportInsightCard } from '../../components/reportes/ReportInsightCard.jsx';
import { ReportsFiltersBar } from '../../components/reportes/ReportsFiltersBar.jsx';
import { MetricDetailDrawer } from '../../components/reportes/MetricDetailDrawer.jsx';
import { KpiDefinitionModal } from '../../components/reportes/KpiDefinitionModal.jsx';
import { EmptyReportsState }  from '../../components/reportes/EmptyReportsState.jsx';
import { ReportsLoadingState } from '../../components/reportes/ReportsLoadingState.jsx';
import { ReportsErrorState }  from '../../components/reportes/ReportsErrorState.jsx';

import { getModulesForUser } from '../../data/icaroData.js';
import {
  getAllowedReportTabs,
  getDefaultReportTab,
  generateProjectPeriods,
  reportTabsCatalog,
} from '../../utils/reportHelpers.js';
import api from '../../utils/axios.js';

// ── Constantes de diseño ────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const CHART_COLORS = {
  blue:   '#1F4E79',
  green:  '#16A34A',
  amber:  '#D97706',
  red:    '#DC2626',
  purple: '#7C3AED',
  slate:  '#64748B',
};

const PIE_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.amber,
  CHART_COLORS.red,
  CHART_COLORS.purple,
];

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Deriva el status semántico de una métrica basado en su valor numérico.
 * Necesario porque getDashboardStatusMeta() espera el campo `status`.
 */
const deriveMetricStatus = (id, rawValue) => {
  const n = Number(rawValue ?? 0);
  if (id === 'avance') {
    if (n >= 75) return 'success';
    if (n >= 40) return 'warning';
    return 'danger';
  }
  if (id === 'pendientes') {
    if (n === 0) return 'success';
    if (n <= 3)  return 'warning';
    return 'danger';
  }
  if (id === 'dias') {
    if (n > 30) return 'success';
    if (n > 0)  return 'warning';
    return 'danger';
  }
  return 'info';
};

/**
 * Formatea un número como moneda COP para tooltips de Recharts.
 */
const formatCOP = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

// ── Sub-componente: Gráfica de pastel de estado de requerimientos ──────────

function ChartRequisitosPie({ reqAprobados, reqRecibidos, reqPendientes, totalReq }) {
  if (totalReq === 0) return null;

  const data = [
    { name: 'Aprobados',  value: reqAprobados,  color: CHART_COLORS.green },
    { name: 'Recibidos',  value: reqRecibidos,  color: CHART_COLORS.blue  },
    { name: 'Pendientes', value: reqPendientes, color: CHART_COLORS.amber },
  ].filter(d => d.value > 0);

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#2F3A45]">
        <ShoppingCart size={15} className="text-[#1F4E79]" />
        Estado de requerimientos de compra
      </p>
      <p className="mb-4 text-xs text-gray-400">{totalReq} requerimiento(s) en total</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <ReTooltip
            formatter={(value, name) => [`${value} req.`, name]}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Sub-componente: Gráfica de barras de avance por proyecto ─────────────

function ChartAvanceBarras({ proyectosKpis }) {
  if (!proyectosKpis?.length) return null;

  const data = proyectosKpis.map(k => ({
    name: k.proyecto.nombre.length > 18 ? k.proyecto.nombre.slice(0, 18) + '…' : k.proyecto.nombre,
    avance: parseFloat((k.kpis.porcentajeAvance ?? 0).toFixed(1)),
    ejecutado: k.kpis.montoEjecutado ?? 0,
  }));

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm flex flex-col h-full">
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#2F3A45]">
        <BarChart2 size={15} className="text-[#1F4E79]" />
        % Avance por proyecto
      </p>
      <p className="mb-4 text-xs text-gray-400">Basado en avances confirmados vs. presupuesto de rubros</p>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#6B7280' }} domain={[0, 100]} />
            <ReTooltip
              formatter={(v) => [`${v}%`, 'Avance']}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="avance" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Sub-componente: Gráfica de barras de presupuesto global ──────────────

function ChartPresupuestoBarras({ proyectosKpis }) {
  if (!proyectosKpis?.length) return null;

  const data = proyectosKpis.map(k => ({
    name: k.proyecto.nombre.length > 18 ? k.proyecto.nombre.slice(0, 18) + '…' : k.proyecto.nombre,
    presupuesto: Number(k.proyecto.presupuestoTotal ?? 0),
    ejecutado: Number(k.kpis.montoEjecutado ?? 0),
  }));

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm flex flex-col h-full">
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#2F3A45]">
        <BarChart2 size={15} className="text-[#1F4E79]" />
        Presupuesto vs Ejecutado por Proyecto
      </p>
      <p className="mb-4 text-xs text-gray-400">Comparación monetaria global</p>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
            <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#6B7280' }} />
            <ReTooltip
              formatter={(v) => [formatCOP(v), 'Monto']}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            <Bar name="Presupuesto" dataKey="presupuesto" fill={CHART_COLORS.slate} radius={[2, 2, 0, 0]} maxBarSize={48} />
            <Bar name="Ejecutado" dataKey="ejecutado" fill={CHART_COLORS.green} radius={[2, 2, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Sub-componente: Gráfica de pastel de presupuesto por proyecto ──────────

function ChartPresupuestoPie({ presupuestoTotal, montoEjecutado }) {
  if (!presupuestoTotal) return null;
  const restante = Math.max(0, presupuestoTotal - montoEjecutado);

  const data = [
    { name: 'Ejecutado', value: montoEjecutado, color: CHART_COLORS.green },
    { name: 'Restante', value: restante, color: CHART_COLORS.slate },
  ].filter(d => d.value > 0);

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#2F3A45]">
        <BarChart2 size={15} className="text-[#1F4E79]" />
        Ejecución de Presupuesto
      </p>
      <p className="mb-4 text-xs text-gray-400">Total: {formatCOP(presupuestoTotal)}</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <ReTooltip
            formatter={(value, name) => [formatCOP(value), name]}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


// ── Sub-componente: Tarjeta KPI global ──────────────────────────────────────

function GlobalKpiCard({ icon: Icon, label, value, color = 'blue', sub }) {
  const palette = {
    blue:   { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700'    },
    green:  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    amber:  { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700'   },
    red:    { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700'     },
  };
  const c = palette[color] || palette.blue;
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${c.bg} ${c.border}`}>
      <Icon size={20} className={`mt-0.5 shrink-0 ${c.text}`} />
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide opacity-70 ${c.text}`}>{label}</p>
        <p className={`mt-0.5 text-xl font-bold leading-none ${c.text}`}>{value}</p>
        {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export function ReportsDashboardView({
  currentUser,
  isRestricted = false,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
}) {
  const modules        = getModulesForUser(currentUser);
  const allowedTabIds  = useMemo(() => getAllowedReportTabs(currentUser.roleName), [currentUser.roleName]);
  const isAuthorizedRole = allowedTabIds.length > 0;

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus,    setLoadStatus]    = useState('loading');
  const [retryCount,    setRetryCount]    = useState(0);
  const [isExporting,   setIsExporting]   = useState(false);

  // Datos del backend
  const [proyectosList,      setProyectosList]      = useState([]);
  const [proyectosKpisList,  setProyectosKpisList]  = useState([]);   // kpisValidos del backend
  const [kpisGlobales,       setKpisGlobales]        = useState(null);
  const [consolidacionesList, setConsolidacionesList] = useState([]);

  // Filtros
  const [currentProjectId, setCurrentProjectId] = useState('');
  const [currentPeriodId,  setCurrentPeriodId]  = useState('');
  const [dimensionFilter,  setDimensionFilter]  = useState('all');
  const [activeTab] = useState(() => getDefaultReportTab(currentUser.roleName));

  // Overlay: { type: 'detail'|'definition', item: object }
  const [activeOverlay, setActiveOverlay] = useState(null);

  // ── Derivados ─────────────────────────────────────────────────────────────
  const currentProject = useMemo(
    () => proyectosList.find(p => p.id === currentProjectId) ?? null,
    [proyectosList, currentProjectId],
  );

  const validPeriods = useMemo(
    () => generateProjectPeriods(currentProject),
    [currentProject],
  );

  const currentPeriod = useMemo(
    () => validPeriods.find(p => p.id === currentPeriodId) ?? null,
    [validPeriods, currentPeriodId],
  );

  // Sincronizar periodo cuando cambia proyecto
  useEffect(() => {
    if (validPeriods.length > 0 && !validPeriods.some(p => p.id === currentPeriodId)) {
      setCurrentPeriodId(validPeriods[0].id);
    }
  }, [validPeriods, currentPeriodId]);

  // ── Fetch inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthorizedRole || isRestricted) return;

    const fetchData = async () => {
      setLoadStatus('loading');
      try {
        const res = await api.get('/reportes/dashboard');

        if (res.data.success) {
          const projs = res.data.proyectos || [];
          setProyectosList(projs);
          setConsolidacionesList(res.data.consolidaciones || []);
          setProyectosKpisList(res.data.proyectosKpis   || []);
          setKpisGlobales(res.data.kpisGlobales          || null);

          if (projs.length > 0 && !currentProjectId) {
            setCurrentProjectId(projs[0].id);
          }
          setLoadStatus('ready');
        } else {
          setLoadStatus('error');
        }
      } catch (err) {
        console.error('[Dashboard] fetchData:', err);
        setLoadStatus('error');
      }
    };

    fetchData();
  }, [retryCount, isAuthorizedRole, isRestricted]);

  // ── KPIs del proyecto seleccionado ───────────────────────────────────────
  const currentKpisData = useMemo(
    () => proyectosKpisList.find(k => k.proyecto?.id === currentProjectId) ?? null,
    [proyectosKpisList, currentProjectId],
  );
  const currentKpis = currentKpisData?.kpis ?? null;
  const currentProyectoData = currentKpisData?.proyecto ?? null;

  // ── Dataset del dashboard: contrato correcto para ManagerKpiCards ────────
  //
  // ManagerKpiCards requiere que cada métrica tenga:
  //   - key      : string  → React key
  //   - label    : string  → título
  //   - value    : string  → valor YA FORMATEADO para mostrar
  //   - unit     : string  → 'currency' | '%' | 'items' | '' (para formatReportMetricValue)
  //   - status   : string  → para getDashboardStatusMeta()
  //   - trend    : string  → 'up' | 'down' | 'neutral'
  //   - contextNote : string  → subtítulo de la card
  //   - definition  : string  → texto del modal "Definición"
  //   - rawValue    : number  → valor numérico sin formato (para comparaciones)
  //
  const activeDataset = useMemo(() => {
    if (!currentProjectId || !currentKpis) return null;

    const {
      porcentajeAvance = 0,
      montoEjecutado = 0,
      montoPresupuestado = 0,
      totalRequerimientos = 0,
      reqAprobados = 0,
      reqRecibidos = 0,
      reqPendientes = 0,
      montoComprasTotal = 0,
      stockTotalDisponible = 0,
      diasRestantes = 0,
      estaVencido = false,
      cierresCerrados = 0,
    } = currentKpis;

    const presupuestoReal = currentProyectoData?.presupuestoTotal ?? 0;

    // ── Métricas (contrato completo) ────────────────────────────────────────
    const metrics = [
      {
        kind:        'metric',
        key:         'avance',
        id:          'avance',
        label:       'Avance del proyecto',
        rawValue:    porcentajeAvance,
        value:       porcentajeAvance,
        unit:        '%',
        status:      deriveMetricStatus('avance', porcentajeAvance),
        trend:       porcentajeAvance >= 50 ? 'up' : 'down',
        contextNote: `${formatCOP(montoEjecutado)} ejecutado de ${formatCOP(presupuestoReal)}`,
        definition:  'Relación porcentual entre el monto ejecutado (avances confirmados × precio unitario) y el presupuesto oficial total del proyecto.',
      },
      {
        kind:        'metric',
        key:         'compras',
        id:          'compras',
        label:       'Monto compras totales',
        rawValue:    montoComprasTotal,
        value:       montoComprasTotal,
        unit:        'currency',
        status:      reqPendientes > 0 ? 'warning' : 'success',
        trend:       reqAprobados >= reqPendientes ? 'up' : 'down',
        contextNote: `${reqAprobados} aprobados · ${reqPendientes} pendientes · ${reqRecibidos} recibidos`,
        definition:  'Suma de cantidades solicitadas en todos los requerimientos de compra del proyecto, sin importar su estado.',
      },
      {
        kind:        'metric',
        key:         'inventario',
        id:          'inventario',
        label:       'Stock disponible',
        rawValue:    stockTotalDisponible,
        value:       stockTotalDisponible,
        unit:        'items',
        status:      stockTotalDisponible > 0 ? 'info' : 'warning',
        trend:       stockTotalDisponible > 0 ? 'up' : 'down',
        contextNote: `${cierresCerrados} periodo(s) cerrado(s) registrado(s)`,
        definition:  'Suma de cantidades disponibles en todos los materiales del proyecto, según la tabla inventario_proyecto.',
      },
      {
        kind:        'metric',
        key:         'tiempo',
        id:          'dias',
        label:       estaVencido ? 'Días de vencimiento' : 'Días restantes',
        rawValue:    diasRestantes,
        value:       Math.abs(diasRestantes),
        unit:        'items',
        status:      deriveMetricStatus('dias', diasRestantes),
        trend:       estaVencido ? 'down' : 'up',
        contextNote: estaVencido ? '⚠️ El proyecto ha superado la fecha fin prevista' : 'Para la fecha fin prevista del proyecto',
        definition:  'Diferencia en días entre la fecha actual y la fecha fin prevista del proyecto. Un valor negativo indica que el proyecto está vencido.',
      },
    ];

    // ── Insights con campo 'tone' (contrato de ReportInsightCard) ──────────
    const insights = [];

    if (porcentajeAvance >= 90) {
      insights.push({ id: 'avance-alto', title: '🎯 Proyecto próximo a completarse', description: `El avance alcanza el ${porcentajeAvance.toFixed(1)}%. Coordine el cierre operativo y contable del proyecto.`, tone: 'warning' });
    } else if (porcentajeAvance > 0) {
      insights.push({ id: 'avance', title: 'Avance registrado en el proyecto', description: `Se ha ejecutado el ${porcentajeAvance.toFixed(1)}% del presupuesto (${formatCOP(montoEjecutado)} de ${formatCOP(montoPresupuestado)}).`, tone: 'info' });
    } else {
      insights.push({ id: 'avance-cero', title: 'Sin avances confirmados', description: 'No se encontraron avances en estado SYNCED o VALIDATED. Sincronice los datos del equipo de obra.', tone: 'warning' });
    }

    if (reqPendientes > 0) {
      insights.push({ id: 'req-pendientes', title: `${reqPendientes} requerimiento(s) pendiente(s) de aprobación`, description: `Existen requerimientos de compra EN_REVISION que bloquean el cierre del periodo. Apruebe o rechace antes de cerrar.`, tone: 'danger' });
    } else if (totalRequerimientos > 0) {
      insights.push({ id: 'req-ok', title: 'Requerimientos de compra al día', description: `${reqAprobados} aprobados y ${reqRecibidos} recibidos. No hay requerimientos pendientes de revisión.`, tone: 'success' });
    }

    if (estaVencido) {
      insights.push({ id: 'vencido', title: `⛔ Proyecto con ${Math.abs(diasRestantes)} días de retraso`, description: 'La fecha fin prevista fue superada. Actualice el cronograma o ejecute el cierre del proyecto.', tone: 'danger' });
    } else if (diasRestantes <= 30 && diasRestantes > 0) {
      insights.push({ id: 'pronto-vencer', title: `⚠️ El proyecto vence en ${diasRestantes} días`, description: 'Quedan menos de 30 días para la fecha fin prevista. Valide el avance y coordine el cierre.', tone: 'warning' });
    }

    if (stockTotalDisponible <= 0 && totalRequerimientos > 0) {
      insights.push({ id: 'sin-stock', title: 'Stock de materiales agotado', description: 'El stock total disponible es cero o negativo. Verifique las recepciones de bodega antes del próximo consumo.', tone: 'warning' });
    }

    return { metrics, insights };
  }, [currentProjectId, currentKpis, currentProyectoData]);

  // ── Datos de gráficas del proyecto seleccionado ──────────────────────────
  const chartDataRequisitos = useMemo(() => {
    if (!currentKpis) return null;
    return {
      reqAprobados:  currentKpis.reqAprobados  ?? 0,
      reqRecibidos:  currentKpis.reqRecibidos  ?? 0,
      reqPendientes: currentKpis.reqPendientes ?? 0,
      totalReq:      currentKpis.totalRequerimientos ?? 0,
    };
  }, [currentKpis]);

  // ── Handlers de overlay ─────────────────────────────────────────────────
  const handleOpenDetail     = useCallback((item) => setActiveOverlay({ type: 'detail',     item }), []);
  const handleOpenDefinition = useCallback((item) => setActiveOverlay({ type: 'definition', item }), []);
  const handleCloseOverlay   = useCallback(() => setActiveOverlay(null), []);

  // ── Exportar Excel (el PDF requiere cierre real — ver nota de flujo) ─────
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('icaro_token');
      const params = currentProjectId ? `?idProyecto=${currentProjectId}` : '';
      const url = `${API_BASE}/reportes/exportar-excel${params}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }

      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `icaro_dashboard_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('[Dashboard] exportar-excel:', err);
      alert(err.message || 'Error al exportar el reporte Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Vista de acceso denegado ──────────────────────────────────────────────
  if (!isAuthorizedRole || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader currentUser={currentUser} currentAreaLabel="Reportes y dashboards"
          onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout}
          onOpenNavigation={() => setMobileNavOpen(true)} />
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation modules={modules} activeItemId="dashboard" isOpen={mobileNavOpen}
            currentUser={currentUser} onClose={() => setMobileNavOpen(false)}
            onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />
          <main>
            <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
                <ShieldAlert size={28} />
              </div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">No tiene acceso a esta sección</h1>
              <p className="mt-2 text-sm text-gray-500">Este módulo está disponible para Presidencia, Administración y el frente contable.</p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const contextLabel = `${reportTabsCatalog[activeTab]?.label ?? 'Reporte'} · ${currentProject?.name ?? 'sin proyecto'} · ${currentPeriod?.label ?? 'sin periodo'}`;

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader currentUser={currentUser} currentAreaLabel="Reportes y dashboards"
        onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)} />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation modules={modules} activeItemId="reports" isOpen={mobileNavOpen}
          currentUser={currentUser} onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />

        <main className="min-w-0 space-y-6">

          {/* ── Encabezado ──────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-[#111827]">
                <BarChart2 size={22} className="text-[#1F4E79]" />
                Dashboard Gerencial
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                KPIs operativos y contables calculados en tiempo real desde la base de datos
              </p>
            </div>

            {/* Exportar Excel */}
            <button
              onClick={handleExportExcel}
              disabled={isExporting || loadStatus !== 'ready' || !proyectosList.length}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#153a5c] disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              Exportar Excel
            </button>
          </div>

          {/* ── Estados de carga y error ─────────────────────────────── */}
          {loadStatus === 'loading' && <ReportsLoadingState />}
          {loadStatus === 'error'   && (
            <ReportsErrorState
              title="No fue posible cargar los reportes"
              description="Verifique su conexión y reintente."
              onRetry={() => setRetryCount(v => v + 1)}
              onGoHome={onGoHome}
            />
          )}

          {loadStatus === 'ready' && (
            <>
              {!proyectosList.length ? (
                <EmptyReportsState
                  title="Sin proyectos disponibles"
                  description="No hay proyectos autorizados para su sesión."
                  actionLabel="Volver al panel"
                  onAction={onGoHome}
                />
              ) : (
                <>
                  {/* ── Filtros ────────────────────────────────────────── */}
                  <ReportsFiltersBar
                    projects={proyectosList}
                    periods={validPeriods}
                    currentProjectId={currentProjectId}
                    currentPeriodId={currentPeriodId}
                    dimensionFilter={dimensionFilter}
                    onChangeProject={setCurrentProjectId}
                    onChangePeriod={setCurrentPeriodId}
                    onChangeDimension={setDimensionFilter}
                    onReset={() => {
                      setCurrentProjectId(proyectosList[0]?.id ?? '');
                      setCurrentPeriodId(validPeriods[0]?.id ?? '');
                      setDimensionFilter('all');
                    }}
                  />

                  {/* ── KPIs globales del sistema ──────────────────────── */}
                  {kpisGlobales && (
                    <div className="space-y-5 border-b border-[#E5E7EB] pb-8 mb-8">
                      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Resumen global del sistema
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <GlobalKpiCard
                            icon={TrendingUp}
                            label="Avance promedio"
                            value={`${(kpisGlobales.porcentajeAvancePromedio ?? 0).toFixed(1)}%`}
                            sub={`${kpisGlobales.proyectosActivos} proyecto(s) activo(s)`}
                            color="blue"
                          />
                          <GlobalKpiCard
                            icon={ShoppingCart}
                            label="Total requerimientos"
                            value={kpisGlobales.totalRequerimientos ?? 0}
                            sub="Todas las compras del sistema"
                            color="amber"
                          />
                          <GlobalKpiCard
                            icon={Package}
                            label="Stock total sistema"
                            value={`${(kpisGlobales.stockTotalSistema ?? 0).toLocaleString('es-CO')} uds`}
                            sub="Inventario consolidado"
                            color="green"
                          />
                          <GlobalKpiCard
                            icon={Clock}
                            label="Proyectos vencidos"
                            value={kpisGlobales.proyectosVencidos ?? 0}
                            sub={`de ${kpisGlobales.totalProyectos} en total`}
                            color={kpisGlobales.proyectosVencidos > 0 ? 'red' : 'green'}
                          />
                        </div>
                      </div>
                      <div className="grid gap-5 lg:grid-cols-2">
                        <ChartAvanceBarras proyectosKpis={proyectosKpisList} />
                        <ChartPresupuestoBarras proyectosKpis={proyectosKpisList} />
                      </div>
                    </div>
                  )}

                  {/* ── Sin datos para el filtro actual ───────────────── */}
                  {!activeDataset ? (
                    <EmptyReportsState
                      title="Sin datos para el proyecto y periodo seleccionados"
                      description="Seleccione otro proyecto o periodo, o verifique que el proyecto tenga avances y requerimientos registrados."
                      actionLabel="Limpiar filtros"
                      onAction={() => {
                        setCurrentProjectId(proyectosList[0]?.id ?? '');
                        setCurrentPeriodId(validPeriods[0]?.id ?? '');
                      }}
                    />
                  ) : (
                    <>
                      {/* ── KPI Cards del proyecto seleccionado ─────────── */}
                      <ManagerKpiCards
                        metrics={activeDataset.metrics}
                        onOpenDetail={handleOpenDetail}
                        onOpenDefinition={handleOpenDefinition}
                      />

                      {/* ── Gráficas del Proyecto ─────────────────────────── */}
                      <div className="grid gap-5 lg:grid-cols-2">
                        <ChartRequisitosPie {...(chartDataRequisitos ?? {})} />
                        <ChartPresupuestoPie
                          presupuestoTotal={currentProyectoData?.presupuestoTotal ?? 0}
                          montoEjecutado={currentKpis?.montoEjecutado ?? 0}
                        />
                      </div>

                      {/* ── Insights ──────────────────────────────────────── */}
                      <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                        <div className="mb-4">
                          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111827]">
                            <CheckCircle2 size={17} className="text-[#1F4E79]" />
                            Insights y alertas
                          </h2>
                          <p className="mt-0.5 text-xs text-gray-400">
                            Hallazgos automáticos basados en los datos del proyecto seleccionado
                          </p>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                          {activeDataset.insights.map(insight => (
                            <ReportInsightCard key={insight.id} insight={insight} />
                          ))}
                        </div>
                      </section>

                      {/* ── Nota sobre el flujo de datos ─────────────────── */}
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                        <p className="font-semibold mb-1">Flujo de datos del dashboard</p>
                        <p className="text-xs leading-relaxed text-blue-700">
                          Los KPIs se calculan en tiempo real desde la BD:
                          <strong> Avances de obra</strong> (SYNCED/VALIDATED) →
                          <strong> Requerimientos de compra</strong> →
                          <strong> Movimientos de inventario</strong>.
                          Para exportar a PDF de un periodo cerrado, vaya al módulo{' '}
                          <em>Consolidación y Cierre Mensual</em>, ejecute el cierre y luego use el botón de planilla.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Overlays ──────────────────────────────────────────────────────── */}
      {activeOverlay?.type === 'detail' && (
        <MetricDetailDrawer
          item={activeOverlay.item}
          contextLabel={contextLabel}
          onClose={handleCloseOverlay}
        />
      )}
      {activeOverlay?.type === 'definition' && (
        <KpiDefinitionModal
          item={activeOverlay.item}
          contextLabel={contextLabel}
          onClose={handleCloseOverlay}
        />
      )}
    </div>
  );
}