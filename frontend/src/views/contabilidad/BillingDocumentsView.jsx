import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { BillingDocumentsHeader } from '../../components/contabilidad/BillingDocumentsHeader.jsx';
import { BillingProjectSelector } from '../../components/contabilidad/BillingProjectSelector.jsx';
import { BillingPeriodSelector } from '../../components/contabilidad/BillingPeriodSelector.jsx';
import { ClosedPeriodEligibilityBanner } from '../../components/contabilidad/ClosedPeriodEligibilityBanner.jsx';
import { BillingSummaryCards } from '../../components/contabilidad/BillingSummaryCards.jsx';
import { BillingGenerationBanner } from '../../components/contabilidad/BillingGenerationBanner.jsx';
import { BillingDocumentsTable } from '../../components/contabilidad/BillingDocumentsTable.jsx';
import { BillingDetailDrawer } from '../../components/contabilidad/BillingDetailDrawer.jsx';
import { GenerateBillingPdfModal } from '../../components/contabilidad/GenerateBillingPdfModal.jsx';
import { BillingQueuedModal } from '../../components/contabilidad/BillingQueuedModal.jsx';
import { BillingErrorModal } from '../../components/contabilidad/BillingErrorModal.jsx';
import { BillingSuccessState } from '../../components/contabilidad/BillingSuccessState.jsx';
import { EmptyBillingState } from '../../components/contabilidad/EmptyBillingState.jsx';
import { BillingLoadingState } from '../../components/contabilidad/BillingLoadingState.jsx';
import { BillingDocumentsErrorState } from '../../components/contabilidad/BillingDocumentsErrorState.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import { getAssignedProjectsForUser } from '../../data/mockAssignedProjects.js';
import { getBillingDocumentsByProjectPeriod, getBillingPeriodsByProject } from '../../data/mockBillingDocuments.js';
import { getBillingGenerationQueueByDocumentId } from '../../data/mockBillingGenerationQueue.js';
import { canDownloadBillingDocument, getBillingSummary, getDocumentStatusHeadline, getPrimaryBillingDocument } from '../../utils/billingDocumentHelpers.js';
import { createCompletedQueueItem, createProcessingBillingDocument, createQueuedBillingDocument, createQueuedQueueItem, createReadyBillingDocument, createRunningQueueItem, getBillingEligibilityMeta, getBillingQueueMeta } from '../../utils/billingGenerationHelpers.js';

function getSelectedPeriod(periods, periodId) {
  return periods.find((period) => period.id === periodId) ?? null;
}

function buildDocumentsMap(projects) {
  const entries = [];

  projects.forEach((project) => {
    const periods = getBillingPeriodsByProject(project.id);
    periods.forEach((period) => {
      entries.push([`${project.id}::${period.id}`, getBillingDocumentsByProjectPeriod(project.id, period.id)]);
    });
  });

  return Object.fromEntries(entries);
}

function buildQueueMap(documentsMap) {
  const queueEntries = [];

  Object.values(documentsMap).forEach((documents) => {
    documents.forEach((document) => {
      const queueItem = getBillingGenerationQueueByDocumentId(document.documentId);
      if (queueItem) {
        queueEntries.push([document.documentId, queueItem]);
      }
    });
  });

  return Object.fromEntries(queueEntries);
}

export function BillingDocumentsView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [projects] = useState(() => getAssignedProjectsForUser(currentUser.email));
  const [currentProjectId, setCurrentProjectId] = useState(projects[0]?.id ?? '');
  const [periodsByProject] = useState(() => Object.fromEntries(projects.map((project) => [project.id, getBillingPeriodsByProject(project.id)])));
  const [documentsByScope, setDocumentsByScope] = useState(() => buildDocumentsMap(projects));
  const [queueByDocumentId, setQueueByDocumentId] = useState(() => buildQueueMap(buildDocumentsMap(projects)));
  const [currentPeriodId, setCurrentPeriodId] = useState(() => periodsByProject[projects[0]?.id]?.[0]?.id ?? '');
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [flashSuccessDocumentId, setFlashSuccessDocumentId] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAuthorizedRole = ['Contador', 'Presidente / Gerente'].includes(currentUser.roleName);
  const canGenerate = currentUser.roleName === 'Contador';
  const currentProject = useMemo(() => projects.find((project) => project.id === currentProjectId) ?? null, [projects, currentProjectId]);
  const currentPeriods = useMemo(() => periodsByProject[currentProjectId] ?? [], [periodsByProject, currentProjectId]);
  const currentPeriod = useMemo(() => getSelectedPeriod(currentPeriods, currentPeriodId), [currentPeriods, currentPeriodId]);
  const currentScopeKey = `${currentProjectId}::${currentPeriodId}`;
  const currentDocuments = useMemo(() => documentsByScope[currentScopeKey] ?? [], [documentsByScope, currentScopeKey]);
  const primaryDocument = useMemo(() => getPrimaryBillingDocument(currentDocuments), [currentDocuments]);
  const currentQueueItem = useMemo(() => (primaryDocument ? queueByDocumentId[primaryDocument.documentId] ?? null : null), [queueByDocumentId, primaryDocument]);
  const eligibility = useMemo(() => getBillingEligibilityMeta(currentPeriod), [currentPeriod]);
  const queueMeta = useMemo(() => {
    if (!canGenerate && primaryDocument && ['not-generated', 'failed'].includes(primaryDocument.generationStatus)) {
      return {
        label: 'Consulta disponible para este rol',
        description: 'Puede revisar el estado documental y descargar archivos listos, pero no iniciar nuevas generaciones.',
        tone: 'neutral',
      };
    }

    if (!primaryDocument && currentPeriod && !eligibility.canGenerate) {
      return {
        label: 'Generación bloqueada para este periodo',
        description: eligibility.description,
        tone: 'danger',
      };
    }

    return getBillingQueueMeta(currentQueueItem, primaryDocument);
  }, [currentQueueItem, primaryDocument, currentPeriod, eligibility]);
  const summary = useMemo(() => getBillingSummary(currentDocuments), [currentDocuments]);
  const headline = useMemo(() => {
    if (!canGenerate && primaryDocument?.generationStatus === 'not-generated') {
      return 'Este rol puede consultar el periodo, pero no iniciar una generación nueva';
    }

    return getDocumentStatusHeadline(primaryDocument);
  }, [canGenerate, primaryDocument]);
  const selectedDocument = useMemo(() => (activeOverlay?.type === 'detail' ? activeOverlay.document : null), [activeOverlay]);
  const activeErrorDocument = useMemo(() => (activeOverlay?.type === 'error' ? activeOverlay.document : null), [activeOverlay]);
  const successDocument = useMemo(() => currentDocuments.find((document) => document.documentId === flashSuccessDocumentId) ?? null, [currentDocuments, flashSuccessDocumentId]);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.billingDocumentsShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.billingDocumentsShouldFail, retryCount]);

  useEffect(() => {
    const firstPeriodId = periodsByProject[currentProjectId]?.[0]?.id ?? '';
    if (firstPeriodId && !currentPeriods.some((period) => period.id === currentPeriodId)) {
      setCurrentPeriodId(firstPeriodId);
    }
  }, [currentProjectId, currentPeriodId, currentPeriods, periodsByProject]);

  const updateScopeDocuments = (updater) => {
    setDocumentsByScope((currentDocumentsMap) => ({
      ...currentDocumentsMap,
      [currentScopeKey]: updater(currentDocumentsMap[currentScopeKey] ?? []),
    }));
  };

  const handleDownloadDocument = (document) => {
    if (!canDownloadBillingDocument(document)) {
      return;
    }

    window.alert(`Descarga simulada: ${document.fileName}`);
  };

  const handleConfirmGenerate = () => {
    if (!primaryDocument || !currentProject || !currentPeriod) {
      return;
    }

    const nowIso = '2026-04-11T23:18:00.000Z';
    const shouldQueue = currentPeriod.requiresDeferredProcessing;
    const nextDocument = shouldQueue
      ? createQueuedBillingDocument(primaryDocument, currentUser.name, nowIso)
      : createProcessingBillingDocument(primaryDocument, currentUser.name, nowIso);

    updateScopeDocuments((documents) => documents.map((document) => (document.documentId === primaryDocument.documentId ? nextDocument : document)));

    setQueueByDocumentId((currentQueueMap) => ({
      ...currentQueueMap,
      [primaryDocument.documentId]: shouldQueue
        ? createQueuedQueueItem(primaryDocument.documentId, currentQueueMap[primaryDocument.documentId], nowIso)
        : createRunningQueueItem(primaryDocument.documentId, currentQueueMap[primaryDocument.documentId], nowIso),
    }));

    setActiveOverlay(shouldQueue ? { type: 'queued' } : null);

    if (!shouldQueue) {
      window.setTimeout(() => {
        const readyIso = '2026-04-11T23:21:00.000Z';

        updateScopeDocuments((documents) => documents.map((document) => {
          if (document.documentId !== primaryDocument.documentId) {
            return document;
          }

          return createReadyBillingDocument(document, currentUser.name, readyIso);
        }));

        setQueueByDocumentId((currentQueueMap) => ({
          ...currentQueueMap,
          [primaryDocument.documentId]: createCompletedQueueItem(primaryDocument.documentId, currentQueueMap[primaryDocument.documentId], readyIso),
        }));

        setFlashSuccessDocumentId(primaryDocument.documentId);
      }, 1200);
    }
  };

  const handleRefreshStatus = () => {
    if (!primaryDocument) {
      return;
    }

    const nowIso = '2026-04-11T23:23:00.000Z';

    if (primaryDocument.generationStatus === 'queued') {
      updateScopeDocuments((documents) => documents.map((document) => {
        if (document.documentId !== primaryDocument.documentId) {
          return document;
        }

        return createProcessingBillingDocument(document, document.requestedBy || currentUser.name, nowIso);
      }));

      setQueueByDocumentId((currentQueueMap) => ({
        ...currentQueueMap,
        [primaryDocument.documentId]: createRunningQueueItem(primaryDocument.documentId, currentQueueMap[primaryDocument.documentId], nowIso),
      }));

      return;
    }

    if (primaryDocument.generationStatus === 'processing') {
      updateScopeDocuments((documents) => documents.map((document) => {
        if (document.documentId !== primaryDocument.documentId) {
          return document;
        }

        return createReadyBillingDocument(document, currentUser.name, nowIso);
      }));

      setQueueByDocumentId((currentQueueMap) => ({
        ...currentQueueMap,
        [primaryDocument.documentId]: createCompletedQueueItem(primaryDocument.documentId, currentQueueMap[primaryDocument.documentId], nowIso),
      }));

      setFlashSuccessDocumentId(primaryDocument.documentId);
    }
  };

  const handleRetryGeneration = () => {
    if (!primaryDocument) {
      return;
    }

    setActiveOverlay(null);

    const nowIso = '2026-04-11T23:24:00.000Z';

    updateScopeDocuments((documents) => documents.map((document) => {
      if (document.documentId !== primaryDocument.documentId) {
        return document;
      }

      return createProcessingBillingDocument(document, currentUser.name, nowIso);
    }));

    setQueueByDocumentId((currentQueueMap) => ({
      ...currentQueueMap,
      [primaryDocument.documentId]: createRunningQueueItem(primaryDocument.documentId, currentQueueMap[primaryDocument.documentId], nowIso),
    }));

    window.setTimeout(() => {
      const readyIso = '2026-04-11T23:27:00.000Z';

      updateScopeDocuments((documents) => documents.map((document) => {
        if (document.documentId !== primaryDocument.documentId) {
          return document;
        }

        return createReadyBillingDocument(document, currentUser.name, readyIso);
      }));

      setQueueByDocumentId((currentQueueMap) => ({
        ...currentQueueMap,
        [primaryDocument.documentId]: createCompletedQueueItem(primaryDocument.documentId, currentQueueMap[primaryDocument.documentId], readyIso),
      }));

      setFlashSuccessDocumentId(primaryDocument.documentId);
    }, 1000);
  };

  if (!isAuthorizedRole || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader currentUser={currentUser} currentAreaLabel="Planillas y documentos de cobro" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation modules={modules} activeItemId="dashboard" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />
          <main>
            <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]"><ShieldAlert size={28} /></div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">No tiene acceso a esta sección</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">Las planillas y documentos de cobro están disponibles para usuarios autorizados del frente contable. Vuelva al panel principal para continuar.</p>
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
      <AppHeader currentUser={currentUser} currentAreaLabel="Planillas y documentos de cobro" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation modules={modules} activeItemId="payroll" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />

        <main className="min-w-0 space-y-6">
          <BillingDocumentsHeader currentProject={currentProject} currentPeriod={currentPeriod} headline={headline} onGoHome={onGoHome} />

          {loadStatus === 'loading' ? <BillingLoadingState /> : null}
          {loadStatus === 'error' ? <BillingDocumentsErrorState title="No fue posible cargar los documentos de cobro" description="Reintente para recuperar proyectos, periodos y trazabilidad documental del módulo." onRetry={() => setRetryCount((value) => value + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              {!projects.length ? (
                <EmptyBillingState title="No tiene proyectos habilitados para este módulo" description="No hay proyectos autorizados para consultar o generar documentos de cobro en esta sesión." actionLabel="Volver al panel" onAction={onGoHome} />
              ) : (
                <>
                  <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                    <BillingProjectSelector projects={projects} currentProjectId={currentProjectId} onChange={setCurrentProjectId} />
                    <BillingPeriodSelector periods={currentPeriods} currentPeriodId={currentPeriodId} onChange={setCurrentPeriodId} />
                  </div>

                  <ClosedPeriodEligibilityBanner eligibility={eligibility} />
                  <BillingSummaryCards summary={summary} />
                  <BillingGenerationBanner
                    primaryDocument={primaryDocument}
                    queueMeta={queueMeta}
                    canGenerate={Boolean(canGenerate && eligibility.canGenerate && primaryDocument && primaryDocument.generationStatus === 'not-generated')}
                    canDownload={Boolean(primaryDocument && canDownloadBillingDocument(primaryDocument))}
                    onGenerate={() => setActiveOverlay({ type: 'generate' })}
                    onRefresh={handleRefreshStatus}
                    onRetry={() => setActiveOverlay({ type: 'error', document: primaryDocument })}
                    onDownload={() => primaryDocument && handleDownloadDocument(primaryDocument)}
                  />

                  {successDocument ? <BillingSuccessState document={successDocument} onDownload={handleDownloadDocument} onDismiss={() => setFlashSuccessDocumentId(null)} /> : null}

                  <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                    <SectionHeader title="Documentos del periodo" description="Revise estado, trazabilidad y disponibilidad de descarga para los documentos asociados al proyecto y periodo activo." />
                    {!currentDocuments.length ? (
                      <EmptyBillingState title="No hay documentos para el periodo seleccionado" description="Cambie de periodo o espere al cierre para que aparezcan documentos de cobro disponibles." />
                    ) : (
                      <BillingDocumentsTable documents={currentDocuments} onOpenDetail={(document) => setActiveOverlay({ type: 'detail', document })} onDownload={handleDownloadDocument} />
                    )}
                  </section>

                  {!canGenerate ? (
                    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
                      <p className="text-sm font-semibold text-[#2F3A45]">Modo de consulta ejecutiva</p>
                      <p className="mt-1 text-sm text-gray-600">Este rol puede consultar y descargar documentos ya generados, pero no iniciar nuevas generaciones.</p>
                    </section>
                  ) : null}
                </>
              )}
            </>
          ) : null}
        </main>
      </div>

      {selectedDocument ? <BillingDetailDrawer document={selectedDocument} onClose={() => setActiveOverlay(null)} onDownload={handleDownloadDocument} /> : null}
      {activeOverlay?.type === 'generate' && currentProject && currentPeriod && primaryDocument ? <GenerateBillingPdfModal project={currentProject} period={currentPeriod} document={primaryDocument} onClose={() => setActiveOverlay(null)} onConfirm={handleConfirmGenerate} /> : null}
      {activeOverlay?.type === 'queued' && currentProject && currentPeriod ? <BillingQueuedModal project={currentProject} period={currentPeriod} queueItem={currentQueueItem} onClose={() => setActiveOverlay(null)} /> : null}
      {activeOverlay?.type === 'error' && activeErrorDocument ? <BillingErrorModal document={activeErrorDocument} onClose={() => setActiveOverlay(null)} onRetry={handleRetryGeneration} /> : null}
    </div>
  );
}