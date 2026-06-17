import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ShieldAlert, Download, Loader2 } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { ReportsDashboardHeader } from '../../components/reportes/ReportsDashboardHeader.jsx';
import { ReportsFiltersBar } from '../../components/reportes/ReportsFiltersBar.jsx';
import { ReportsTabsSwitcher } from '../../components/reportes/ReportsTabsSwitcher.jsx';
import { ManagerKpiCards } from '../../components/reportes/ManagerKpiCards.jsx';
import { ReportsSummaryCards } from '../../components/reportes/ReportsSummaryCards.jsx';
import { DashboardChartCard } from '../../components/reportes/DashboardChartCard.jsx';
import { ChartLegendCard } from '../../components/reportes/ChartLegendCard.jsx';
import { OperationalReportTable } from '../../components/reportes/OperationalReportTable.jsx';
import { AccountingReportTable } from '../../components/reportes/AccountingReportTable.jsx';
import { ReportInsightCard } from '../../components/reportes/ReportInsightCard.jsx';
import { MetricDetailDrawer } from '../../components/reportes/MetricDetailDrawer.jsx';
import { KpiDefinitionModal } from '../../components/reportes/KpiDefinitionModal.jsx';
import { DataCompletenessModal } from '../../components/reportes/DataCompletenessModal.jsx';
import { EmptyReportsState } from '../../components/reportes/EmptyReportsState.jsx';
import { ReportsLoadingState } from '../../components/reportes/ReportsLoadingState.jsx';
import { ReportsErrorState } from '../../components/reportes/ReportsErrorState.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import { getReportsPartialDataMeta } from '../../utils/dashboardHelpers.js';
import { buildReportFilterSummary, getAllowedReportTabs, getDefaultReportTab, reportPeriodsCatalog, reportTabsCatalog, filterReportRowsByDimension } from '../../utils/reportHelpers.js';

// Reemplazamos importaciones mock con fetch real
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export function ReportsDashboardView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  
  // Real data
  const [proyectosList, setProyectosList] = useState([]);
  const [consolidacionesList, setConsolidacionesList] = useState([]);
  const [planillasList, setPlanillasList] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [currentProjectId, setCurrentProjectId] = useState('');
  const [currentPeriodId, setCurrentPeriodId] = useState('');
  const [dimensionFilter, setDimensionFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(() => getDefaultReportTab(currentUser.roleName));
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAuthorizedRole = ['Presidente / Gerente', 'Contador', 'Administrador del Sistema', 'Residente'].includes(currentUser.roleName);
  const allowedTabIds = useMemo(() => getAllowedReportTabs(currentUser.roleName), [currentUser.roleName]);
  const availableTabs = useMemo(() => allowedTabIds.map((tabId) => reportTabsCatalog[tabId]), [allowedTabIds]);
  
  const currentProject = useMemo(() => proyectosList.find((project) => project.id === currentProjectId) ?? null, [proyectosList, currentProjectId]);
  const currentPeriod = useMemo(() => reportPeriodsCatalog.find((period) => period.id === currentPeriodId) ?? null, [currentPeriodId]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const socketUrl = API_URL.replace('/api/v1', '');
    const socket = io(socketUrl);
    
    socket.on('connect', () => {
      socket.emit('join_user', currentUser.id);
    });

    socket.on('planilla_ready', (data) => {
      setPlanillasList(prev => prev.map(p => p.id === data.planillaId ? { ...p, estadoGen: 'READY', urlArchivo: data.url } : p));
      setIsGenerating(false);
    });

    socket.on('planilla_error', (data) => {
      setPlanillasList(prev => prev.map(p => p.id === data.planillaId ? { ...p, estadoGen: 'ERROR' } : p));
      setIsGenerating(false);
    });

    return () => socket.disconnect();
  }, [currentUser]);

  // Fetch from API
  useEffect(() => {
    const fetchData = async () => {
      setLoadStatus('loading');
      try {
        const token = localStorage.getItem('icaro_token');
        const res = await axios.get(`${API_URL}/reportes/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          const projs = res.data.proyectos || [];
          setProyectosList(projs);
          setConsolidacionesList(res.data.consolidaciones || []);
          
          if (projs.length > 0 && !currentProjectId) setCurrentProjectId(projs[0].id);
          if (!currentPeriodId) setCurrentPeriodId(reportPeriodsCatalog[0].id);
          
          setLoadStatus('ready');
        } else {
          setLoadStatus('error');
        }
      } catch (err) {
        console.error('Error fetching dashboard', err);
        setLoadStatus('error');
      }
    };
    if (isAuthorizedRole && !isRestricted) fetchData();
  }, [retryCount, currentUser, isRestricted, isAuthorizedRole]);

  // Construir activeDataset dinámico según consolidaciones
  const activeDataset = useMemo(() => {
    if (!currentProjectId || !currentPeriodId) return null;
    const consol = consolidacionesList.find(c => c.idProyecto === currentProjectId && c.mesAnio === currentPeriodId);
    if (!consol) return null;

    // Fake metrics adaptadas de consolidacion
    return {
      updatedAt: consol.generadoEn,
      metrics: [
        { id: 'avance', label: 'Avance %', value: consol.porcentajeAvance + '%', diff: 0, trend: 'neutral' },
        { id: 'compras', label: 'Monto Compras', value: '$' + Number(consol.totalComprasMonto).toLocaleString(), diff: 0, trend: 'neutral' }
      ],
      charts: [],
      insights: [
        { id: '1', title: 'Avance registrado', description: `Se ha reportado ${consol.totalAvanceQty} unidades avanzadas.`, type: 'info' }
      ],
      partialData: false
    };
  }, [currentProjectId, currentPeriodId, consolidacionesList]);

  // Cargar planillas disponibles si hay dataset
  useEffect(() => {
    const fetchPlanillas = async () => {
      if (!currentProjectId || !currentPeriodId) return;
      const consol = consolidacionesList.find(c => c.idProyecto === currentProjectId && c.mesAnio === currentPeriodId);
      if (!consol) return setPlanillasList([]);
      
      try {
        const token = localStorage.getItem('icaro_token');
        const res = await axios.get(`${API_URL}/planillas/cierre/${consol.idCierre}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setPlanillasList(res.data.planillas);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlanillas();
  }, [currentProjectId, currentPeriodId, consolidacionesList]);

  const handleGeneratePdf = async () => {
    const consol = consolidacionesList.find(c => c.idProyecto === currentProjectId && c.mesAnio === currentPeriodId);
    if (!consol) return;
    try {
      setIsGenerating(true);
      const token = localStorage.getItem('icaro_token');
      await axios.post(`${API_URL}/planillas/generate/${consol.idCierre}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Generación de PDF encolada. Se notificará cuando esté listo.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al generar PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const partialDataMeta = useMemo(() => getReportsPartialDataMeta(activeDataset), [activeDataset]);
  const filterSummary = useMemo(() => buildReportFilterSummary(activeTab, currentProject, currentPeriod, dimensionFilter), [activeTab, currentProject, currentPeriod, dimensionFilter]);
  const contextLabel = `${reportTabsCatalog[activeTab]?.label ?? 'Reporte'} · ${currentProject?.name ?? 'sin proyecto'} · ${currentPeriod?.label ?? 'sin periodo'}`;

  if (!isAuthorizedRole || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader currentUser={currentUser} currentAreaLabel="Reportes y dashboards" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation modules={modules} activeItemId="dashboard" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />
          <main>
            <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]"><ShieldAlert size={28} /></div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">No tiene acceso a esta sección</h1>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const latestPlanilla = planillasList[0];

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader currentUser={currentUser} currentAreaLabel="Reportes y dashboards" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation modules={modules} activeItemId="reports" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />

        <main className="min-w-0 space-y-6">
          <ReportsDashboardHeader currentProject={currentProject} currentPeriod={currentPeriod} filterSummary={filterSummary} updatedAt={activeDataset?.updatedAt} onGoHome={onGoHome} />

          {loadStatus === 'loading' ? <ReportsLoadingState /> : null}
          {loadStatus === 'error' ? <ReportsErrorState title="No fue posible cargar los reportes" description="Reintente para recuperar métricas, tablas y visualizaciones del contexto seleccionado." onRetry={() => setRetryCount((value) => value + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              {!proyectosList.length ? (
                <EmptyReportsState title="No tiene proyectos disponibles para consulta" description="No hay proyectos autorizados para el alcance analítico de su sesión actual." actionLabel="Volver al panel" onAction={onGoHome} />
              ) : (
                <>
                  <ReportsFiltersBar
                    projects={proyectosList}
                    periods={reportPeriodsCatalog}
                    currentProjectId={currentProjectId}
                    currentPeriodId={currentPeriodId}
                    dimensionFilter={dimensionFilter}
                    onChangeProject={setCurrentProjectId}
                    onChangePeriod={setCurrentPeriodId}
                    onChangeDimension={setDimensionFilter}
                    onReset={() => {
                      setCurrentProjectId(proyectosList[0]?.id ?? '');
                      setCurrentPeriodId('2026-03');
                      setDimensionFilter('all');
                    }}
                  />

                  {/* Acciones de PDF para Planillas */}
                  <div className="flex gap-2 bg-white p-4 rounded-[12px] border border-gray-200">
                    <button 
                      onClick={handleGeneratePdf}
                      disabled={isGenerating || !activeDataset}
                      className="flex items-center gap-2 bg-[#1F4E79] text-white px-4 py-2 rounded-lg hover:bg-[#153a5c] disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <Download size={16}/>}
                      Generar PDF
                    </button>
                    {latestPlanilla && latestPlanilla.estadoGen === 'READY' && (
                      <a href={`${API_URL.replace('/api/v1','')}${latestPlanilla.urlArchivo}`} target="_blank" rel="noreferrer"
                         className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                        <Download size={16}/> Descargar PDF ({new Date(latestPlanilla.createdAt).toLocaleDateString()})
                      </a>
                    )}
                    {latestPlanilla && latestPlanilla.estadoGen === 'PENDING' && (
                      <span className="flex items-center px-4 py-2 text-sm text-gray-500">Planilla en cola...</span>
                    )}
                  </div>

                  {!activeDataset ? (
                    <EmptyReportsState title="No hay datos disponibles para los filtros seleccionados" description="Cambie el tipo de reporte, proyecto o periodo para continuar con la consulta." actionLabel="Limpiar filtros" onAction={() => {
                      setCurrentProjectId(proyectosList[0]?.id ?? '');
                      setCurrentPeriodId('2026-03');
                      setDimensionFilter('all');
                    }} />
                  ) : (
                    <>
                      <ManagerKpiCards metrics={activeDataset.metrics} />
                      <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                        <SectionHeader title="Insights y alertas" description="Identifique hallazgos útiles para la toma de decisiones con el filtro actualmente aplicado." />
                        <div className="grid gap-4 xl:grid-cols-2">
                          {activeDataset.insights.map((insight) => <ReportInsightCard key={insight.id} insight={insight} />)}
                        </div>
                      </section>
                    </>
                  )}
                </>
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}