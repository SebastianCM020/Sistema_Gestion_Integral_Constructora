import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
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
import { getAssignedProjectsForUser } from '../../data/mockAssignedProjects.js';
import { getOperationalReportByScope } from '../../data/mockOperationalReports.js';
import { getAccountingReportByScope } from '../../data/mockAccountingReports.js';
import { getManagerDashboardByScope } from '../../data/mockManagerDashboard.js';
import { getReportsPartialDataMeta } from '../../utils/dashboardHelpers.js';
import { buildReportFilterSummary, getAllowedReportTabs, getDefaultReportTab, reportPeriodsCatalog, reportTabsCatalog, filterReportRowsByDimension } from '../../utils/reportHelpers.js';

function createProjectOptions(currentUser) {
  const assignedProjects = getAssignedProjectsForUser(currentUser.email);

  if (['Presidente / Gerente', 'Administrador del Sistema'].includes(currentUser.roleName)) {
    return [
      {
        id: 'portfolio-all',
        code: 'CORP',
        name: 'Consolidado corporativo',
        accessMode: 'reports-portfolio',
      },
      ...assignedProjects,
    ];
  }

  return assignedProjects;
}

function buildContextLabel(tabLabel, project, period) {
  return `${tabLabel} · ${project?.code ?? 'sin proyecto'} · ${period?.label ?? 'sin periodo'}`;
}

export function ReportsDashboardView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [projects] = useState(() => createProjectOptions(currentUser));
  const [currentProjectId, setCurrentProjectId] = useState(() => projects[0]?.id ?? '');
  const [currentPeriodId, setCurrentPeriodId] = useState('2026-03');
  const [dimensionFilter, setDimensionFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(() => getDefaultReportTab(currentUser.roleName));
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAuthorizedRole = ['Presidente / Gerente', 'Contador', 'Administrador del Sistema'].includes(currentUser.roleName);
  const allowedTabIds = useMemo(() => getAllowedReportTabs(currentUser.roleName), [currentUser.roleName]);
  const availableTabs = useMemo(() => allowedTabIds.map((tabId) => reportTabsCatalog[tabId]), [allowedTabIds]);
  const currentProject = useMemo(() => projects.find((project) => project.id === currentProjectId) ?? null, [projects, currentProjectId]);
  const currentPeriod = useMemo(() => reportPeriodsCatalog.find((period) => period.id === currentPeriodId) ?? null, [currentPeriodId]);
  const operationalReport = useMemo(() => getOperationalReportByScope(currentProjectId, currentPeriodId), [currentProjectId, currentPeriodId]);
  const accountingReport = useMemo(() => getAccountingReportByScope(currentProjectId, currentPeriodId), [currentProjectId, currentPeriodId]);
  const managerDashboard = useMemo(() => getManagerDashboardByScope(currentProjectId, currentPeriodId), [currentProjectId, currentPeriodId]);
  const activeDataset = activeTab === 'manager' ? managerDashboard : activeTab === 'operational' ? operationalReport : accountingReport;
  const visibleRows = useMemo(() => {
    if (activeTab === 'operational') {
      return filterReportRowsByDimension(operationalReport?.operationalRows ?? [], dimensionFilter);
    }

    if (activeTab === 'accounting') {
      return filterReportRowsByDimension(accountingReport?.accountingRows ?? [], dimensionFilter);
    }

    return [];
  }, [activeTab, operationalReport, accountingReport, dimensionFilter]);
  const partialDataMeta = useMemo(() => getReportsPartialDataMeta(activeDataset), [activeDataset]);
  const filterSummary = useMemo(() => buildReportFilterSummary(activeTab, currentProject, currentPeriod, dimensionFilter), [activeTab, currentProject, currentPeriod, dimensionFilter]);
  const selectedDetailItem = activeOverlay?.type === 'detail' ? activeOverlay.item : null;
  const selectedDefinitionItem = activeOverlay?.type === 'definition' ? activeOverlay.item : null;
  const contextLabel = buildContextLabel(reportTabsCatalog[activeTab]?.label ?? 'Reporte', currentProject, currentPeriod);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.reportsShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.reportsShouldFail, retryCount]);

  useEffect(() => {
    if (!allowedTabIds.includes(activeTab)) {
      setActiveTab(allowedTabIds[0] ?? 'manager');
    }
  }, [allowedTabIds, activeTab]);

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
              <p className="mt-2 max-w-2xl text-sm text-gray-600">Los reportes y dashboards están disponibles para perfiles autorizados de consulta ejecutiva, contable o administrativa. Vuelva al panel principal para continuar.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Volver al panel principal</button>
                <button type="button" onClick={onOpenProfile} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Abrir mi perfil</button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

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
              {!projects.length ? (
                <EmptyReportsState title="No tiene proyectos disponibles para consulta" description="No hay proyectos autorizados para el alcance analítico de su sesión actual." actionLabel="Volver al panel" onAction={onGoHome} />
              ) : (
                <>
                  <ReportsFiltersBar
                    projects={projects}
                    periods={reportPeriodsCatalog}
                    currentProjectId={currentProjectId}
                    currentPeriodId={currentPeriodId}
                    dimensionFilter={dimensionFilter}
                    onChangeProject={setCurrentProjectId}
                    onChangePeriod={setCurrentPeriodId}
                    onChangeDimension={setDimensionFilter}
                    onReset={() => {
                      setCurrentProjectId(projects[0]?.id ?? '');
                      setCurrentPeriodId('2026-03');
                      setDimensionFilter('all');
                    }}
                  />

                  <ReportsTabsSwitcher tabs={availableTabs} activeTab={activeTab} onChange={setActiveTab} />

                  <section className={`rounded-[12px] border bg-white p-4 shadow-sm ${partialDataMeta.tone === 'warning' ? 'border-[#F59E0B]/20' : 'border-[#16A34A]/20'}`}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${partialDataMeta.tone === 'warning' ? 'bg-[#FFF7ED] text-[#92400E]' : 'bg-[#16A34A]/10 text-[#16A34A]'}`}>
                          <AlertTriangle size={18} />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-[#2F3A45]">{partialDataMeta.title}</h2>
                          <p className="mt-1 text-sm text-gray-600">{partialDataMeta.description}</p>
                        </div>
                      </div>
                      {activeDataset?.partialData ? <button type="button" onClick={() => setActiveOverlay({ type: 'incomplete' })} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Ver detalle</button> : null}
                    </div>
                  </section>

                  {!activeDataset ? (
                    <EmptyReportsState title="No hay datos disponibles para los filtros seleccionados" description="Cambie el tipo de reporte, proyecto o periodo para continuar con la consulta." actionLabel="Limpiar filtros" onAction={() => {
                      setCurrentProjectId(projects[0]?.id ?? '');
                      setCurrentPeriodId('2026-03');
                      setDimensionFilter('all');
                    }} />
                  ) : (
                    <>
                      {activeTab === 'manager' ? <ManagerKpiCards metrics={activeDataset.metrics} onOpenDetail={(item) => setActiveOverlay({ type: 'detail', item: { ...item, kind: 'metric' } })} onOpenDefinition={(item) => setActiveOverlay({ type: 'definition', item })} /> : <ReportsSummaryCards metrics={activeDataset.metrics} onOpenDetail={(item) => setActiveOverlay({ type: 'detail', item: { ...item, kind: 'metric' } })} onOpenDefinition={(item) => setActiveOverlay({ type: 'definition', item })} />}

                      {activeTab === 'manager' ? (
                        <div className="grid gap-6 xl:grid-cols-2">
                          {activeDataset.charts.map((chart) => (
                            <div key={chart.id} className="space-y-4">
                              <DashboardChartCard chart={chart} onOpenDetail={(item) => setActiveOverlay({ type: 'detail', item: { ...item, kind: 'chart' } })} onOpenDefinition={(item) => setActiveOverlay({ type: 'definition', item })} />
                              <ChartLegendCard chart={chart} />
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {activeTab === 'operational' ? (
                        <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                          <SectionHeader title="Reporte operativo" description="Revise el comportamiento operativo del proyecto, sus frentes y alertas del periodo seleccionado." />
                          {!visibleRows.length ? <EmptyReportsState title="No hay registros operativos para el filtro actual" description="Cambie la dimensión o el periodo para revisar otro corte operativo." actionLabel="Mostrar todas las dimensiones" onAction={() => setDimensionFilter('all')} /> : <OperationalReportTable rows={visibleRows} onOpenDetail={(row) => setActiveOverlay({ type: 'detail', item: { ...row, kind: 'row' } })} />}
                        </section>
                      ) : null}

                      {activeTab === 'accounting' ? (
                        <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                          <SectionHeader title="Reporte contable" description="Revise el resumen contable del periodo, cartera, facturación y pendientes de conciliación." />
                          {!visibleRows.length ? <EmptyReportsState title="No hay registros contables para el filtro actual" description="Cambie la dimensión o el periodo para revisar otro corte contable." actionLabel="Mostrar todas las dimensiones" onAction={() => setDimensionFilter('all')} /> : <AccountingReportTable rows={visibleRows} onOpenDetail={(row) => setActiveOverlay({ type: 'detail', item: { ...row, kind: 'row' } })} />}
                        </section>
                      ) : null}

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

      {selectedDetailItem ? <MetricDetailDrawer item={selectedDetailItem} contextLabel={contextLabel} onClose={() => setActiveOverlay(null)} /> : null}
      {selectedDefinitionItem ? <KpiDefinitionModal item={selectedDefinitionItem} contextLabel={contextLabel} onClose={() => setActiveOverlay(null)} /> : null}
      {activeOverlay?.type === 'incomplete' ? <DataCompletenessModal meta={partialDataMeta} onClose={() => setActiveOverlay(null)} /> : null}
    </div>
  );
}