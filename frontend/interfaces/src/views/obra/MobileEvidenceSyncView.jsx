import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { AdvanceSummaryCard } from '../../components/obra/AdvanceSummaryCard.jsx';
import { CameraCaptureCard } from '../../components/obra/CameraCaptureCard.jsx';
import { CaptureHelpSheet } from '../../components/obra/CaptureHelpSheet.jsx';
import { DeleteEvidenceModal } from '../../components/obra/DeleteEvidenceModal.jsx';
import { EvidenceContextHeader } from '../../components/obra/EvidenceContextHeader.jsx';
import { EvidenceGalleryList } from '../../components/obra/EvidenceGalleryList.jsx';
import { EvidenceLoadingState } from '../../components/obra/EvidenceLoadingState.jsx';
import { EvidenceMetadataCard } from '../../components/obra/EvidenceMetadataCard.jsx';
import { ImagePreviewCard } from '../../components/obra/ImagePreviewCard.jsx';
import { OfflineNoticeBanner } from '../../components/obra/OfflineNoticeBanner.jsx';
import { RetrySyncModal } from '../../components/obra/RetrySyncModal.jsx';
import { SyncQueueList } from '../../components/obra/SyncQueueList.jsx';
import { SyncResultState } from '../../components/obra/SyncResultState.jsx';
import { SyncStatusBanner } from '../../components/obra/SyncStatusBanner.jsx';
import { UnsavedChangesModal } from '../../components/obra/UnsavedChangesModal.jsx';
import { getAssignedProjectsForUser } from '../../data/mockAssignedProjects.js';
import { getAdvanceEvidenceForUser } from '../../data/mockAdvanceEvidence.js';
import { getSyncQueueForUser } from '../../data/mockSyncQueue.js';
import { getModulesForUser } from '../../data/icaroData.js';
import {
  createEvidencePayload,
  getEvidenceForAdvance,
  getEvidenceSummary,
  getSelectedEvidence,
  normalizeAdvanceContext,
  replaceEvidencePayload,
  validateEvidenceBeforeContinue,
} from '../../utils/evidenceHelpers.js';
import { getSyncBannerState, resolveSyncAttempt, upsertQueueEntry } from '../../utils/syncHelpers.js';

export function MobileEvidenceSyncView({
  currentUser,
  isRestricted = false,
  advanceRecord,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [captureState, setCaptureState] = useState({ status: 'idle', message: 'Capture la evidencia del avance o seleccione una imagen desde galería.' });
  const [evidenceItems, setEvidenceItems] = useState(() => getAdvanceEvidenceForUser(currentUser.email));
  const [queueItems, setQueueItems] = useState(() => getSyncQueueForUser(currentUser.email));
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAdvanceFinalized, setIsAdvanceFinalized] = useState(false);

  const modules = getModulesForUser(currentUser);
  const assignedProjects = useMemo(() => getAssignedProjectsForUser(currentUser.email), [currentUser.email]);
  const assignedProjectIds = useMemo(() => assignedProjects.map((project) => project.id), [assignedProjects]);
  const normalizedAdvance = useMemo(() => normalizeAdvanceContext(advanceRecord), [advanceRecord]);
  const isResident = currentUser.roleName === 'Residente' && !isRestricted;
  const hasAuthorizedAdvance = !normalizedAdvance || assignedProjectIds.includes(normalizedAdvance.projectId);
  const visibleQueueItems = useMemo(
    () => queueItems.filter((queueItem) => assignedProjectIds.includes(queueItem.projectId)).sort((leftItem, rightItem) => new Date(rightItem.lastAttemptAt || 0).getTime() - new Date(leftItem.lastAttemptAt || 0).getTime()),
    [assignedProjectIds, queueItems]
  );
  const currentAdvanceEvidence = useMemo(
    () => (normalizedAdvance ? getEvidenceForAdvance(evidenceItems, normalizedAdvance.advanceId) : []),
    [evidenceItems, normalizedAdvance]
  );
  const selectedEvidence = useMemo(
    () => getSelectedEvidence(currentAdvanceEvidence, selectedEvidenceId),
    [currentAdvanceEvidence, selectedEvidenceId]
  );
  const evidenceSummary = useMemo(() => getEvidenceSummary(currentAdvanceEvidence), [currentAdvanceEvidence]);
  const syncBannerState = useMemo(
    () => getSyncBannerState({ isOffline, currentEvidence: currentAdvanceEvidence, queueItems: visibleQueueItems }),
    [currentAdvanceEvidence, isOffline, visibleQueueItems]
  );
  const hasPendingCurrentEvidence = currentAdvanceEvidence.some((evidence) => ['pending', 'retry-pending', 'syncing'].includes(evidence.syncStatus));
  const hasFailedItems = visibleQueueItems.some((queueItem) => queueItem.syncStatus === 'failed') || currentAdvanceEvidence.some((evidence) => evidence.syncStatus === 'failed');
  const hasUnsavedChanges = Boolean(normalizedAdvance && currentAdvanceEvidence.length && !isAdvanceFinalized);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.evidenceShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.evidenceShouldFail, retryCount]);

  useEffect(() => {
    if (!currentAdvanceEvidence.length) {
      setSelectedEvidenceId('');
      return;
    }

    if (!currentAdvanceEvidence.some((evidence) => evidence.id === selectedEvidenceId)) {
      setSelectedEvidenceId(currentAdvanceEvidence[0].id);
    }
  }, [currentAdvanceEvidence, selectedEvidenceId]);

  useEffect(() => {
    setSyncResult(null);
    setIsAdvanceFinalized(false);
  }, [normalizedAdvance?.advanceId]);

  const navigateSafely = (target) => {
    if (target === 'progress') {
      onOpenModule('progress');
      return;
    }

    onGoHome();
  };

  const handleRequestExit = (target) => {
    if (hasUnsavedChanges) {
      setActiveModal({ type: 'unsaved', target });
      return;
    }

    navigateSafely(target);
  };

  const handleCapture = (captureSource) => {
    if (!normalizedAdvance) {
      return;
    }

    setCaptureState({ status: 'capturing', message: 'Procesando captura, aplicando compresión simulada y preparando guardado local.' });
    setSyncResult(null);
    setIsAdvanceFinalized(false);

    window.setTimeout(() => {
      const nextEvidence = createEvidencePayload({
        advanceContext: normalizedAdvance,
        captureSource,
        index: currentAdvanceEvidence.length + 1,
      });

      setEvidenceItems((previousEvidenceItems) => {
        const nextEvidenceItems = [nextEvidence, ...previousEvidenceItems];
        setQueueItems((previousQueueItems) => upsertQueueEntry(previousQueueItems, nextEvidenceItems, normalizedAdvance.advanceId));
        return nextEvidenceItems;
      });

      setSelectedEvidenceId(nextEvidence.id);
      setCaptureState({
        status: 'success',
        message: `La imagen fue guardada correctamente en el dispositivo y quedó asociada al avance actual desde ${captureSource === 'camera' ? 'cámara' : 'galería'}.`,
      });
    }, 520);
  };

  const handleReplaceEvidence = (evidence) => {
    setEvidenceItems((previousEvidenceItems) => {
      const nextEvidenceItems = previousEvidenceItems.map((currentEvidence) => (currentEvidence.id === evidence.id ? replaceEvidencePayload(currentEvidence) : currentEvidence));
      setQueueItems((previousQueueItems) => upsertQueueEntry(previousQueueItems, nextEvidenceItems, evidence.advanceId));
      return nextEvidenceItems;
    });
    setCaptureState({ status: 'success', message: 'La evidencia fue reemplazada y quedó nuevamente pendiente de sincronización.' });
    setSyncResult(null);
    setIsAdvanceFinalized(false);
  };

  const handleDeleteEvidence = () => {
    const evidence = activeModal?.evidence;

    if (!evidence) {
      setActiveModal(null);
      return;
    }

    setEvidenceItems((previousEvidenceItems) => {
      const nextEvidenceItems = previousEvidenceItems.filter((currentEvidence) => currentEvidence.id !== evidence.id);
      setQueueItems((previousQueueItems) => upsertQueueEntry(previousQueueItems, nextEvidenceItems, evidence.advanceId));
      return nextEvidenceItems;
    });

    setCaptureState({ status: 'success', message: 'La evidencia fue eliminada del avance actual y de la cola pendiente.' });
    setActiveModal(null);
  };

  const runSyncAttempt = ({ advanceId, targetEvidenceId = null, navigateAfter = null, silent = false }) => {
    setIsSyncing(true);

    window.setTimeout(() => {
      const result = resolveSyncAttempt({ evidenceItems, queueItems, advanceId, isOffline, targetEvidenceId });
      setEvidenceItems(result.evidenceItems);
      setQueueItems(result.queueItems);
      setIsSyncing(false);
      setActiveModal(null);

      if (!silent) {
        setSyncResult(result.result);
      }

      if (result.result.status === 'synced' || result.result.status === 'pending' || result.result.status === 'retry-pending') {
        setIsAdvanceFinalized(true);
      }

      if (navigateAfter) {
        navigateSafely(navigateAfter);
      }
    }, 760);
  };

  const handleSaveAndContinue = (options = {}) => {
    const validation = validateEvidenceBeforeContinue(normalizedAdvance, currentAdvanceEvidence);

    if (!validation.isValid) {
      setSyncResult({
        status: 'error',
        title: 'Debe completar la evidencia antes de continuar',
        description: validation.errors[0],
        syncedCount: 0,
        pendingCount: 0,
        failedCount: 0,
      });
      return;
    }

    runSyncAttempt({ advanceId: normalizedAdvance.advanceId, navigateAfter: options.navigateAfter ?? null, silent: options.silent ?? false });
  };

  const handleRetryTarget = () => {
    const target = activeModal?.target;

    if (!target) {
      setActiveModal(null);
      return;
    }

    runSyncAttempt({
      advanceId: target.advanceId,
      targetEvidenceId: target.evidenceCount ? null : target.id,
    });
  };

  if (!isResident || !hasAuthorizedAdvance) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Evidencia y sincronización"
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
              <p className="mt-2 max-w-2xl text-sm text-gray-600">La gestión móvil de evidencia está disponible para el rol Residente y solo sobre avances de proyectos asignados. Vuelva al panel principal para continuar desde una vista autorizada.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Volver al panel principal</button>
                <button onClick={onOpenProfile} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Abrir mi perfil</button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Evidencia y sincronización"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="evidence"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0">
          <div className="mx-auto flex max-w-[880px] flex-col gap-5">
            {loadStatus === 'loading' ? <EvidenceLoadingState /> : null}

            {loadStatus === 'error' ? (
              <EmptyState
                title="No fue posible cargar la evidencia de obra"
                description="Revise la conectividad o vuelva a intentarlo para recuperar el contexto y la cola pendiente."
                actionLabel="Reintentar carga"
                onAction={() => setRetryCount((value) => value + 1)}
              />
            ) : null}

            {loadStatus === 'ready' ? (
              <>
                <EvidenceContextHeader
                  subtitle={normalizedAdvance ? 'Continúe con la evidencia del avance que acaba de registrar.' : 'Revise pendientes del dispositivo o vuelva al flujo de avance para asociar nueva evidencia.'}
                  syncStatus={hasFailedItems ? 'failed' : hasPendingCurrentEvidence ? 'pending' : currentAdvanceEvidence.length ? 'synced' : 'pending'}
                  onBackToProgress={() => handleRequestExit('progress')}
                  onGoHome={() => handleRequestExit('home')}
                />

                {isOffline ? <OfflineNoticeBanner /> : null}

                {normalizedAdvance ? (
                  <>
                    <AdvanceSummaryCard
                      advanceContext={normalizedAdvance}
                      evidenceCount={evidenceSummary.total}
                      syncLabel={evidenceSummary.synced ? `${evidenceSummary.synced} sincronizada${evidenceSummary.synced === 1 ? '' : 's'}` : 'Pendiente de carga'}
                    />

                    <CameraCaptureCard
                      capturedCount={evidenceSummary.total}
                      minimumRequired={evidenceSummary.minimumRequired}
                      isBusy={captureState.status === 'capturing'}
                      feedbackMessage={captureState.message}
                      onCaptureCamera={() => handleCapture('camera')}
                      onSelectGallery={() => handleCapture('gallery')}
                    />

                    <CaptureHelpSheet />

                    {!currentAdvanceEvidence.length ? (
                      <EmptyState
                        title="No hay evidencias registradas todavía"
                        description="Capture la primera evidencia del avance actual o vuelva al formulario de avance si aún no desea asociar imágenes."
                        actionLabel="Volver al avance"
                        onAction={() => handleRequestExit('progress')}
                      />
                    ) : (
                      <>
                        <ImagePreviewCard
                          evidence={selectedEvidence}
                          onReplace={handleReplaceEvidence}
                          onDelete={(evidence) => setActiveModal({ type: 'delete', evidence })}
                          onRetry={(evidence) => setActiveModal({ type: 'retry', target: evidence })}
                        />
                        <EvidenceMetadataCard evidence={selectedEvidence} />
                        <EvidenceGalleryList
                          evidenceItems={currentAdvanceEvidence}
                          selectedEvidenceId={selectedEvidenceId}
                          onSelect={setSelectedEvidenceId}
                          onDelete={(evidence) => setActiveModal({ type: 'delete', evidence })}
                          onRetry={(evidence) => setActiveModal({ type: 'retry', target: evidence })}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No hay un avance activo para asociar evidencia"
                    description="Abra el flujo de avance de obra para registrar un avance nuevo o gestione la cola pendiente disponible en este dispositivo."
                    actionLabel="Ir a avance de obra"
                    onAction={() => onOpenModule('progress')}
                  />
                )}

                <SyncStatusBanner
                  state={syncBannerState}
                  isOffline={isOffline}
                  isSyncing={isSyncing}
                  hasPending={Boolean(normalizedAdvance && currentAdvanceEvidence.length)}
                  hasFailed={hasFailedItems}
                  onToggleConnectivity={() => setIsOffline((value) => !value)}
                  onSyncNow={() => handleSaveAndContinue()}
                  onRetryFailed={() => {
                    const failedQueue = visibleQueueItems.find((queueItem) => queueItem.syncStatus === 'failed');
                    const failedEvidence = currentAdvanceEvidence.find((evidence) => evidence.syncStatus === 'failed');
                    setActiveModal({ type: 'retry', target: failedQueue ?? failedEvidence });
                  }}
                />

                {syncResult ? (
                  <SyncResultState
                    result={syncResult}
                    onDismiss={() => setSyncResult(null)}
                    onBackToProgress={() => handleRequestExit('progress')}
                    onGoHome={() => handleRequestExit('home')}
                  />
                ) : null}

                {visibleQueueItems.length ? (
                  <SyncQueueList
                    queueItems={visibleQueueItems}
                    onPrimaryAction={(queueItem) => setActiveModal({ type: 'retry', target: queueItem })}
                  />
                ) : null}

                <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
                  <h2 className="text-base font-semibold text-[#2F3A45]">Acciones finales</h2>
                  <p className="mt-1 text-sm text-gray-600">Ninguna acción lo deja atrapado. Puede guardar, volver al avance, gestionar reintentos o finalizar en cualquier momento.</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <button type="button" onClick={() => handleSaveAndContinue()} disabled={isSyncing || !normalizedAdvance} className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c] disabled:cursor-not-allowed disabled:bg-[#94A3B8]">Guardar y continuar</button>
                    <button type="button" onClick={() => handleRequestExit('progress')} className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Volver al avance</button>
                    <button type="button" onClick={() => {
                      const retryTarget = visibleQueueItems.find((queueItem) => queueItem.syncStatus !== 'synced') ?? currentAdvanceEvidence.find((evidence) => evidence.syncStatus !== 'synced');
                      if (retryTarget) {
                        setActiveModal({ type: 'retry', target: retryTarget });
                      }
                    }} className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[#2F3A45] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Reintentar sincronización</button>
                    <button type="button" onClick={() => handleRequestExit('home')} className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Finalizar</button>
                  </div>
                </section>
              </>
            ) : null}
          </div>
        </main>
      </div>

      {activeModal?.type === 'retry' ? (
        <RetrySyncModal
          target={activeModal.target}
          isOffline={isOffline}
          onCancel={() => setActiveModal(null)}
          onConfirm={handleRetryTarget}
        />
      ) : null}

      {activeModal?.type === 'delete' ? (
        <DeleteEvidenceModal
          evidence={activeModal.evidence}
          onCancel={() => setActiveModal(null)}
          onConfirm={handleDeleteEvidence}
        />
      ) : null}

      {activeModal?.type === 'unsaved' ? (
        <UnsavedChangesModal
          onCancel={() => setActiveModal(null)}
          onLeave={() => {
            const target = activeModal.target;
            setActiveModal(null);
            navigateSafely(target);
          }}
          onSaveAndLeave={() => {
            const target = activeModal.target;
            setActiveModal(null);
            handleSaveAndContinue({ navigateAfter: target, silent: true });
          }}
        />
      ) : null}
    </div>
  );
}