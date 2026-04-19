import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { AuditTraceabilityHeader } from '../../components/auditoria/AuditTraceabilityHeader.jsx';
import { AuditFiltersBar } from '../../components/auditoria/AuditFiltersBar.jsx';
import { AuditAdvancedFiltersPanel } from '../../components/auditoria/AuditAdvancedFiltersPanel.jsx';
import { AuditSuccessState } from '../../components/auditoria/AuditSuccessState.jsx';
import { AuditSummaryCards } from '../../components/auditoria/AuditSummaryCards.jsx';
import { AuditEventsTable } from '../../components/auditoria/AuditEventsTable.jsx';
import { AuditTimelineList } from '../../components/auditoria/AuditTimelineList.jsx';
import { AuditEventDetailDrawer } from '../../components/auditoria/AuditEventDetailDrawer.jsx';
import { AuditEmptyState } from '../../components/auditoria/AuditEmptyState.jsx';
import { AuditLoadingState } from '../../components/auditoria/AuditLoadingState.jsx';
import { AuditErrorState } from '../../components/auditoria/AuditErrorState.jsx';
import { CriticalAuditEventModal } from '../../components/auditoria/CriticalAuditEventModal.jsx';
import { AuditNoResultsModal } from '../../components/auditoria/AuditNoResultsModal.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import { getAssignedProjectsForUser } from '../../data/mockAssignedProjects.js';
import { getAuditEvents } from '../../data/mockAuditEvents.js';
import { getAuditComparisonByEventId } from '../../data/mockAuditComparisons.js';
import { buildAuditSummaryCards, buildAuditFilterSummary, buildAuditResultsLabel, formatAuditModuleLabel, getAuditOperationMeta, getAuditSeverityMeta } from '../../utils/auditHelpers.js';
import { applyAuditFilters, buildAuditEntityTypeOptions, buildAuditModuleOptions, buildAuditOperationOptions, buildAuditProjectOptions, buildAuditSeverityOptions, buildAuditUserOptions, getDefaultAuditFilters, getFirstCriticalAuditEvent } from '../../utils/auditFilterHelpers.js';

function getOptionLabel(options, id, fallbackLabel) {
  return options.find((option) => option.id === id)?.label ?? fallbackLabel;
}

export function AuditTraceabilityView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState(() => getDefaultAuditFilters());
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [activeDetailEventId, setActiveDetailEventId] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAuthorizedRole = currentUser.roleName === 'Administrador del Sistema';
  const assignedProjects = useMemo(() => getAssignedProjectsForUser(currentUser.email), [currentUser.email]);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      if (currentUser.adminUsersShouldFail) {
        setLoadStatus('error');
        return;
      }

      setEvents(getAuditEvents());
      setLoadStatus('ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.adminUsersShouldFail, retryCount]);

  const projectOptions = useMemo(() => buildAuditProjectOptions(assignedProjects, events), [assignedProjects, events]);
  const userOptions = useMemo(() => buildAuditUserOptions(events), [events]);
  const moduleOptions = useMemo(() => buildAuditModuleOptions(events), [events]);
  const operationOptions = useMemo(() => buildAuditOperationOptions(events), [events]);
  const severityOptions = useMemo(() => buildAuditSeverityOptions(events), [events]);
  const entityTypeOptions = useMemo(() => buildAuditEntityTypeOptions(events), [events]);
  const filteredEvents = useMemo(() => applyAuditFilters(events, filters), [events, filters]);
  const summaryCards = useMemo(() => buildAuditSummaryCards(filteredEvents), [filteredEvents]);
  const criticalEvent = useMemo(() => getFirstCriticalAuditEvent(filteredEvents), [filteredEvents]);
  const selectedEvent = useMemo(() => events.find((event) => event.id === activeDetailEventId) ?? null, [events, activeDetailEventId]);
  const selectedComparison = useMemo(() => (selectedEvent ? getAuditComparisonByEventId(selectedEvent.id) : null), [selectedEvent]);
  const filterSummary = useMemo(
    () =>
      buildAuditFilterSummary(filters, {
        userLabel: getOptionLabel(userOptions, filters.userId, 'todos los usuarios'),
        projectLabel: getOptionLabel(projectOptions, filters.projectId, 'todos los proyectos'),
        moduleLabel: getOptionLabel(moduleOptions, filters.moduleId, 'todos los modulos'),
        operationLabel: getOptionLabel(operationOptions, filters.operationType, 'todas las operaciones'),
        severityLabel: getOptionLabel(severityOptions, filters.severity, 'todas las severidades'),
      }),
    [filters, moduleOptions, operationOptions, projectOptions, severityOptions, userOptions]
  );
  const resultsLabel = useMemo(() => buildAuditResultsLabel(filteredEvents.length, events.length), [filteredEvents.length, events.length]);
  const hasNoResults = loadStatus === 'ready' && events.length > 0 && filteredEvents.length === 0;
  const isEmpty = loadStatus === 'ready' && events.length === 0;

  useEffect(() => {
    if (activeDetailEventId && !filteredEvents.some((event) => event.id === activeDetailEventId)) {
      setActiveDetailEventId(null);
    }
  }, [activeDetailEventId, filteredEvents]);

  const updateFilters = (patch) => {
    setFilters((currentFilters) => ({ ...currentFilters, ...patch }));
  };

  const resetFilters = () => {
    setFilters(getDefaultAuditFilters());
  };

  if (!isAuthorizedRole || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader currentUser={currentUser} currentAreaLabel="Auditoria y trazabilidad" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation modules={modules} activeItemId="dashboard" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />
          <main>
            <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]"><ShieldAlert size={28} /></div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">No tiene acceso a esta seccion</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">La consulta de auditoria y trazabilidad esta reservada para perfiles administrativos autorizados. Vuelva al panel principal para continuar sin perder contexto.</p>
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
      <AppHeader currentUser={currentUser} currentAreaLabel="Auditoria y trazabilidad" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation modules={modules} activeItemId="audit" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />

        <main className="min-w-0 space-y-6">
          <AuditTraceabilityHeader filterSummary={filterSummary} resultsLabel={resultsLabel} dateFrom={filters.dateFrom} dateTo={filters.dateTo} onGoHome={onGoHome} />

          {loadStatus === 'loading' ? <AuditLoadingState /> : null}
          {loadStatus === 'error' ? <AuditErrorState title="No fue posible cargar la bitacora" description="Reintente para consultar eventos, trazabilidad y comparaciones de cambios del sistema." onRetry={() => setRetryCount((currentValue) => currentValue + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              <AuditFiltersBar
                filters={filters}
                userOptions={userOptions}
                projectOptions={projectOptions}
                moduleOptions={moduleOptions}
                operationOptions={operationOptions}
                onChange={updateFilters}
                onClearFilters={resetFilters}
                onToggleAdvanced={() => setIsAdvancedFiltersOpen((currentValue) => !currentValue)}
                isAdvancedOpen={isAdvancedFiltersOpen}
              />

              {isAdvancedFiltersOpen ? <AuditAdvancedFiltersPanel filters={filters} severityOptions={severityOptions} entityTypeOptions={entityTypeOptions} onChange={updateFilters} onClose={() => setIsAdvancedFiltersOpen(false)} /> : null}

              {isEmpty ? (
                <AuditEmptyState title="No hay eventos de auditoria disponibles" description="La bitacora no contiene registros para el alcance administrativo actual." primaryActionLabel="Volver al panel" onPrimaryAction={onGoHome} />
              ) : (
                <>
                  <AuditSuccessState visibleCount={filteredEvents.length} totalCount={events.length} criticalCount={filteredEvents.filter((event) => event.isCritical || event.severity === 'critical').length} onOpenCriticalEvent={criticalEvent ? () => setActiveModal('critical') : null} />

                  {hasNoResults ? (
                    <AuditEmptyState
                      title="No se encontraron eventos para los filtros aplicados"
                      description="Ajuste el rango de fechas, el usuario, el proyecto o la referencia consultada para continuar con la trazabilidad."
                      primaryActionLabel="Limpiar filtros"
                      onPrimaryAction={resetFilters}
                      secondaryActionLabel="Ver explicacion"
                      onSecondaryAction={() => setActiveModal('no-results')}
                    />
                  ) : (
                    <>
                      <AuditSummaryCards cards={summaryCards} />

                      <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                        <SectionHeader title="Eventos registrados" description="Consulte actor, proyecto, modulo, operacion, referencia y severidad sin perder el contexto activo." />
                        <AuditEventsTable events={filteredEvents} onOpenDetail={(eventId) => setActiveDetailEventId(eventId)} />
                      </section>

                      <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                        <SectionHeader title="Timeline de trazabilidad" description="Siga la secuencia cronologica de acciones por usuario, proyecto o transaccion dentro del filtro actual." />
                        <AuditTimelineList
                          events={filteredEvents.slice(0, 8)}
                          onOpenDetail={(eventId) => setActiveDetailEventId(eventId)}
                          onFilterUser={(userId) => updateFilters({ userId })}
                          onFilterProject={(projectId) => updateFilters({ projectId: projectId ?? 'system' })}
                        />
                      </section>
                    </>
                  )}
                </>
              )}
            </>
          ) : null}
        </main>
      </div>

      {selectedEvent ? (
        <AuditEventDetailDrawer
          event={selectedEvent}
          comparison={selectedComparison}
          onClose={() => setActiveDetailEventId(null)}
          onFilterUser={(userId) => {
            updateFilters({ userId });
            setActiveDetailEventId(null);
          }}
          onFilterProject={(projectId) => {
            updateFilters({ projectId: projectId ?? 'system' });
            setActiveDetailEventId(null);
          }}
        />
      ) : null}
      {activeModal === 'critical' && criticalEvent ? <CriticalAuditEventModal event={criticalEvent} onClose={() => setActiveModal(null)} onViewDetail={() => {
        setActiveModal(null);
        setActiveDetailEventId(criticalEvent.id);
      }} /> : null}
      {activeModal === 'no-results' ? <AuditNoResultsModal onClose={() => setActiveModal(null)} onClearFilters={() => {
        setActiveModal(null);
        resetFilters();
      }} /> : null}
    </div>
  );
}