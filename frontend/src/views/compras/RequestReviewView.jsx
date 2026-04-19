import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { ApproveRequestModal } from '../../components/compras/ApproveRequestModal.jsx';
import { EmptyPendingState } from '../../components/compras/EmptyPendingState.jsx';
import { ExitDetailConfirmModal } from '../../components/compras/ExitDetailConfirmModal.jsx';
import { PendingRequestsTable } from '../../components/compras/PendingRequestsTable.jsx';
import { RejectRequestModal } from '../../components/compras/RejectRequestModal.jsx';
import { RequestReviewDetailDrawer } from '../../components/compras/RequestReviewDetailDrawer.jsx';
import { RequestReviewErrorState } from '../../components/compras/RequestReviewErrorState.jsx';
import { RequestReviewFilters } from '../../components/compras/RequestReviewFilters.jsx';
import { RequestReviewHeader } from '../../components/compras/RequestReviewHeader.jsx';
import { RequestReviewLoadingState } from '../../components/compras/RequestReviewLoadingState.jsx';
import { RequestReviewSuccessState } from '../../components/compras/RequestReviewSuccessState.jsx';
import { RequestReviewSummaryCards } from '../../components/compras/RequestReviewSummaryCards.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import { getPendingRequestsForReviewer } from '../../data/mockPendingRequests.js';
import {
  buildApprovePayload,
  buildRejectPayload,
  defaultRequestReviewFilters,
  filterRequests,
  getNextPendingRequest,
  getProjectOptionsFromRequests,
  getReviewSummary,
  replaceRequest,
  sortRequestsByUrgency,
} from '../../utils/requestReviewHelpers.js';

export function RequestReviewView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [requests, setRequests] = useState(() => getPendingRequestsForReviewer());
  const [filters, setFilters] = useState(defaultRequestReviewFilters);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAuthorizedRole = currentUser.roleName === 'Presidente / Gerente';
  const selectedRequest = useMemo(() => requests.find((request) => request.id === selectedRequestId) ?? null, [requests, selectedRequestId]);
  const projectOptions = useMemo(() => getProjectOptionsFromRequests(requests), [requests]);
  const visibleRequests = useMemo(() => sortRequestsByUrgency(filterRequests(requests, filters)), [requests, filters]);
  const summary = useMemo(() => getReviewSummary(requests), [requests]);
  const nextPendingRequest = useMemo(() => (feedback ? getNextPendingRequest(requests, feedback.request.id) : null), [feedback, requests]);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.reviewShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.reviewShouldFail, retryCount]);

  const handleApproveRequest = () => {
    if (!selectedRequest) {
      setActiveOverlay(null);
      return;
    }

    if (currentUser.reviewActionShouldFail) {
      setSubmissionError('No fue posible registrar la aprobación. Puede reintentar sin abandonar la revisión.');
      setActiveOverlay(null);
      return;
    }

    const nextRequest = buildApprovePayload(selectedRequest, currentUser);
    const nextRequests = replaceRequest(requests, nextRequest);

    setRequests(nextRequests);
    setSelectedRequestId(null);
    setFeedback({ type: 'approved', request: nextRequest });
    setActiveOverlay(null);
    setSubmissionError(null);
  };

  const handleRejectRequest = (observation) => {
    if (!selectedRequest) {
      setActiveOverlay(null);
      return;
    }

    if (currentUser.reviewActionShouldFail) {
      setSubmissionError('No fue posible registrar el rechazo. Reintente la acción desde el detalle del requerimiento.');
      setActiveOverlay(null);
      return;
    }

    const nextRequest = buildRejectPayload(selectedRequest, currentUser, observation);
    const nextRequests = replaceRequest(requests, nextRequest);

    setRequests(nextRequests);
    setSelectedRequestId(null);
    setFeedback({ type: 'rejected', request: nextRequest });
    setActiveOverlay(null);
    setSubmissionError(null);
  };

  const handleContinueWithNext = () => {
    setFeedback(null);

    if (nextPendingRequest) {
      setSelectedRequestId(nextPendingRequest.id);
    } else {
      setSelectedRequestId(null);
    }
  };

  if (!isAuthorizedRole || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader currentUser={currentUser} currentAreaLabel="Revisión de requerimientos" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />

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
              <p className="mt-2 max-w-2xl text-sm text-gray-600">La revisión de requerimientos está disponible para el Presidente / Gerente. Vuelva al panel principal para continuar con una vista autorizada.</p>
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
      <AppHeader currentUser={currentUser} currentAreaLabel="Revisión de requerimientos" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="review"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0 space-y-6">
          <RequestReviewHeader pendingCount={summary.pending} currentUser={currentUser} onGoHome={onGoHome} />

          {loadStatus === 'loading' ? <RequestReviewLoadingState /> : null}

          {loadStatus === 'error' ? (
            <RequestReviewErrorState
              title="No fue posible cargar la bandeja de revisión"
              description="Reintente para recuperar los requerimientos pendientes y la trazabilidad de revisión."
              onRetry={() => setRetryCount((value) => value + 1)}
              onGoHome={onGoHome}
            />
          ) : null}

          {loadStatus === 'ready' ? (
            <>
              {feedback ? (
                <RequestReviewSuccessState result={feedback} nextPendingRequest={nextPendingRequest} onBackToList={() => setFeedback(null)} onContinue={handleContinueWithNext} />
              ) : null}

              {submissionError ? (
                <RequestReviewErrorState
                  title="No fue posible completar la decisión"
                  description={submissionError}
                  onDismiss={() => setSubmissionError(null)}
                />
              ) : null}

              <RequestReviewSummaryCards summary={summary} />

              <RequestReviewFilters
                filters={filters}
                projects={projectOptions}
                onChange={(field, value) => setFilters((currentFilters) => ({ ...currentFilters, [field]: value }))}
                onReset={() => setFilters(defaultRequestReviewFilters)}
              />

              <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                <SectionHeader title="Bandeja de requerimientos" description="Busque, filtre y priorice solicitudes sin perder visibilidad del estado de revisión." />

                {!requests.filter((request) => request.estado === 'in-review').length ? (
                  <EmptyPendingState
                    title="No hay requerimientos pendientes"
                    description="La bandeja ejecutiva está al día. Puede volver al panel principal o revisar solicitudes resueltas desde los filtros."
                    actionLabel="Volver al panel principal"
                    onAction={onGoHome}
                  />
                ) : !visibleRequests.length ? (
                  <EmptyPendingState
                    title="No se encontraron resultados con esos filtros"
                    description="Ajuste la búsqueda o limpie los filtros para volver a ver la bandeja completa de revisión."
                    actionLabel="Limpiar filtros"
                    onAction={() => setFilters(defaultRequestReviewFilters)}
                  />
                ) : (
                  <PendingRequestsTable
                    requests={visibleRequests}
                    onOpenDetail={(request) => {
                      setFeedback(null);
                      setSelectedRequestId(request.id);
                    }}
                  />
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>

      {selectedRequest ? (
        <RequestReviewDetailDrawer
          request={selectedRequest}
          onApprove={() => setActiveOverlay({ type: 'approve' })}
          onReject={() => setActiveOverlay({ type: 'reject' })}
          onBack={() => setActiveOverlay({ type: 'exit-detail' })}
        />
      ) : null}

      {selectedRequest && activeOverlay?.type === 'approve' ? <ApproveRequestModal request={selectedRequest} onCancel={() => setActiveOverlay(null)} onConfirm={handleApproveRequest} /> : null}

      {selectedRequest && activeOverlay?.type === 'reject' ? <RejectRequestModal request={selectedRequest} onCancel={() => setActiveOverlay(null)} onConfirm={handleRejectRequest} /> : null}

      {selectedRequest && activeOverlay?.type === 'exit-detail' ? (
        <ExitDetailConfirmModal
          onCancel={() => setActiveOverlay(null)}
          onConfirm={() => {
            setActiveOverlay(null);
            setSelectedRequestId(null);
          }}
        />
      ) : null}
    </div>
  );
}