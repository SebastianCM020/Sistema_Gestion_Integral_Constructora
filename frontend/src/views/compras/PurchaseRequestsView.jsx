import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { CancelDraftModal } from '../../components/compras/CancelDraftModal.jsx';
import { DeleteRequestLineModal } from '../../components/compras/DeleteRequestLineModal.jsx';
import { EmptyRequestState } from '../../components/compras/EmptyRequestState.jsx';
import { PurchaseRequestDetailDrawer } from '../../components/compras/PurchaseRequestDetailDrawer.jsx';
import { PurchaseRequestErrorState } from '../../components/compras/PurchaseRequestErrorState.jsx';
import { PurchaseRequestFilters } from '../../components/compras/PurchaseRequestFilters.jsx';
import { PurchaseRequestForm } from '../../components/compras/PurchaseRequestForm.jsx';
import { PurchaseRequestHeader } from '../../components/compras/PurchaseRequestHeader.jsx';
import { PurchaseRequestLoadingState } from '../../components/compras/PurchaseRequestLoadingState.jsx';
import { PurchaseRequestsTable } from '../../components/compras/PurchaseRequestsTable.jsx';
import { PurchaseRequestSuccessState } from '../../components/compras/PurchaseRequestSuccessState.jsx';
import { RequestDetailTable } from '../../components/compras/RequestDetailTable.jsx';
import { RequestLineFormModal } from '../../components/compras/RequestLineFormModal.jsx';
import { RequestSummaryCards } from '../../components/compras/RequestSummaryCards.jsx';
import { getAssignedProjectsForUser } from '../../data/mockAssignedProjects.js';
import { mockCatalogMaterials } from '../../data/mockCatalogMaterials.js';
import { getPurchaseRequestsForUser } from '../../data/mockPurchaseRequests.js';
import { getModulesForUser } from '../../data/icaroData.js';
import {
  clearPurchaseRequestDraft,
  createPurchaseRequestPayload,
  createRequestLinePayload,
  defaultPurchaseRequestDraft,
  defaultPurchaseRequestFilters,
  filterPurchaseRequests,
  getAvailableCatalogMaterials,
  getDraftSummary,
  getPurchaseRequestSummary,
  getSelectedProject,
  hasDraftChanges,
  removeRequestLine,
  sortPurchaseRequests,
  upsertRequestLine,
  validatePurchaseRequestDraft,
} from '../../utils/purchaseRequestHelpers.js';

export function PurchaseRequestsView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [projects] = useState(() => getAssignedProjectsForUser(currentUser.email));
  const [currentProjectId, setCurrentProjectId] = useState(projects[0]?.id ?? '');
  const [draft, setDraft] = useState(() => ({ ...defaultPurchaseRequestDraft, projectId: projects[0]?.id ?? '', detail: [] }));
  const [filters, setFilters] = useState(defaultPurchaseRequestFilters);
  const [requests, setRequests] = useState(() => getPurchaseRequestsForUser(currentUser, getAssignedProjectsForUser(currentUser.email).map((project) => project.id)));
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  const accessibleProjectIds = useMemo(() => projects.map((project) => project.id), [projects]);
  const currentProject = useMemo(() => getSelectedProject(projects, currentProjectId), [projects, currentProjectId]);
  const isAuthorizedRole = ['Residente', 'Auxiliar de Contabilidad'].includes(currentUser.roleName);
  const availableCatalog = useMemo(() => getAvailableCatalogMaterials(mockCatalogMaterials, currentProjectId), [currentProjectId]);
  const visibleRequests = useMemo(() => sortPurchaseRequests(filterPurchaseRequests(requests.filter((request) => accessibleProjectIds.includes(request.projectId)), filters), filters.sortBy), [accessibleProjectIds, filters, requests]);
  const requestSummary = useMemo(() => getPurchaseRequestSummary(requests.filter((request) => accessibleProjectIds.includes(request.projectId))), [accessibleProjectIds, requests]);
  const draftSummary = useMemo(() => getDraftSummary(draft.detail), [draft.detail]);
  const hasDraft = hasDraftChanges(draft);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.requirementsShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.requirementsShouldFail, retryCount]);

  useEffect(() => {
    if (!draft.projectId && currentProjectId) {
      setDraft((currentDraft) => ({ ...currentDraft, projectId: currentProjectId }));
    }
  }, [currentProjectId, draft.projectId]);

  const resetDraft = (nextProjectId = currentProjectId) => {
    setDraft(clearPurchaseRequestDraft(nextProjectId));
    setErrors({});
    setFeedback(null);
  };

  const handleProjectChange = (nextProjectId) => {
    if (nextProjectId === currentProjectId) {
      return;
    }

    if (hasDraft) {
      setActiveOverlay({ type: 'cancel-draft', nextProjectId });
      return;
    }

    setCurrentProjectId(nextProjectId);
    resetDraft(nextProjectId);
  };

  const handleSaveRequest = () => {
    const validationErrors = validatePurchaseRequestDraft(draft);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    if (!currentProject) {
      setErrors({ projectId: 'Seleccione el proyecto para continuar.' });
      return;
    }

    const nextRequest = createPurchaseRequestPayload({
      draft,
      project: currentProject,
      currentUser,
    });

    setRequests((currentRequests) => [nextRequest, ...currentRequests]);
    setFeedback({ type: 'success', request: nextRequest });
    resetDraft(currentProjectId);
  };

  const handleSaveLine = (material, quantity) => {
    const linePayload = createRequestLinePayload(material, quantity);

    setDraft((currentDraft) => ({
      ...currentDraft,
      projectId: currentProjectId,
      detail: upsertRequestLine(currentDraft.detail, linePayload, activeOverlay?.line?.id ?? null),
    }));
    setErrors((currentErrors) => ({ ...currentErrors, detail: undefined }));
    setActiveOverlay(null);
  };

  const handleDeleteLine = () => {
    if (!activeOverlay?.line) {
      setActiveOverlay(null);
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      detail: removeRequestLine(currentDraft.detail, activeOverlay.line.id),
    }));
    setActiveOverlay(null);
  };

  if (!isAuthorizedRole || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Requerimientos de compra"
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
              <p className="mt-2 max-w-2xl text-sm text-gray-600">Los requerimientos de compra están disponibles para el Residente y el Auxiliar de Contabilidad. Vuelva al panel principal para continuar dentro de una vista autorizada.</p>
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

  const noProjects = !projects.length;
  const noCatalogForProject = !availableCatalog.length;

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Requerimientos de compra"
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
          <PurchaseRequestHeader currentProject={currentProject} hasMultipleProjects={projects.length > 1} onGoHome={onGoHome} onCreateNew={() => resetDraft(currentProjectId)} />

          {loadStatus === 'loading' ? <PurchaseRequestLoadingState /> : null}

          {loadStatus === 'error' ? (
            <PurchaseRequestErrorState
              title="No fue posible cargar los requerimientos"
              description="Revise la conexión o reintente para recuperar proyectos, catálogo y estados de solicitud."
              onRetry={() => setRetryCount((currentValue) => currentValue + 1)}
              onGoHome={onGoHome}
            />
          ) : null}

          {loadStatus === 'ready' ? (
            <>
              {feedback?.type === 'success' ? (
                <PurchaseRequestSuccessState request={feedback.request} onCreateAnother={() => setFeedback(null)} onViewList={() => setFeedback(null)} />
              ) : null}

              {noProjects ? (
                <EmptyRequestState
                  title="No tiene proyectos disponibles en este momento"
                  description="Aún no hay proyectos accesibles para crear requerimientos. Vuelva al panel principal para continuar sin quedar atrapado."
                  actionLabel="Volver al panel principal"
                  onAction={onGoHome}
                />
              ) : (
                <>
                  <RequestSummaryCards summary={requestSummary} />

                  <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-5">
                      <PurchaseRequestForm
                        projects={projects}
                        currentProjectId={currentProjectId}
                        draft={draft}
                        errors={errors}
                        detailSummary={draftSummary}
                        hasMultipleProjects={projects.length > 1}
                        onProjectChange={handleProjectChange}
                        onJustificationChange={(justification) => {
                          setDraft((currentDraft) => ({ ...currentDraft, justification }));
                          setErrors((currentErrors) => ({ ...currentErrors, justification: undefined }));
                        }}
                        onOpenLineModal={() => setActiveOverlay({ type: 'line-form' })}
                        onSubmit={handleSaveRequest}
                        onCancelDraft={() => setActiveOverlay({ type: 'cancel-draft', nextProjectId: null })}
                      />

                      {noCatalogForProject ? (
                        <EmptyRequestState
                          title="No hay materiales disponibles en el catálogo"
                          description="Cambie de proyecto o vuelva al panel principal. El sistema no permitirá agregar líneas hasta tener materiales activos para el proyecto seleccionado."
                          actionLabel={projects.length > 1 ? 'Cambiar proyecto' : 'Volver al panel principal'}
                          onAction={projects.length > 1 ? () => setActiveOverlay({ type: 'cancel-draft', nextProjectId: projects.find((project) => project.id !== currentProjectId)?.id ?? null }) : onGoHome}
                        />
                      ) : null}

                      {draft.detail.length ? (
                        <section className="space-y-3">
                          <SectionHeader title="Detalle del requerimiento" description="Revise materiales, cantidades y acciones antes de guardar el requerimiento." />
                          <RequestDetailTable
                            lines={draft.detail}
                            editable
                            onEdit={(line) => setActiveOverlay({ type: 'line-form', line })}
                            onDelete={(line) => setActiveOverlay({ type: 'delete-line', line })}
                          />
                        </section>
                      ) : (
                        <EmptyRequestState
                          title="El requerimiento aún no tiene líneas de detalle"
                          description="Agregue al menos un material desde el catálogo para completar el requerimiento actual."
                          actionLabel={noCatalogForProject ? undefined : 'Agregar material'}
                          onAction={noCatalogForProject ? undefined : () => setActiveOverlay({ type: 'line-form' })}
                        />
                      )}
                    </div>

                    <div className="space-y-5">
                      <PurchaseRequestFilters
                        filters={filters}
                        onChange={(field, value) => setFilters((currentFilters) => ({ ...currentFilters, [field]: value }))}
                        onReset={() => setFilters(defaultPurchaseRequestFilters)}
                      />

                      <section className="space-y-3">
                        <SectionHeader title="Requerimientos recientes" description="Consulte solicitudes del proyecto actual o del usuario autorizado sin perder el contexto del formulario." />
                        {visibleRequests.length ? (
                          <PurchaseRequestsTable requests={visibleRequests} onOpenDetail={(request) => setActiveOverlay({ type: 'detail', request })} />
                        ) : (
                          <EmptyRequestState
                            title="No hay requerimientos para los filtros actuales"
                            description="Ajuste los filtros o cree un requerimiento nuevo para comenzar el flujo de compras."
                            actionLabel="Nuevo requerimiento"
                            onAction={() => resetDraft(currentProjectId)}
                          />
                        )}
                      </section>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : null}
        </main>
      </div>

      {activeOverlay?.type === 'line-form' ? (
        <RequestLineFormModal
          materials={availableCatalog}
          initialLine={activeOverlay.line ?? null}
          onCancel={() => setActiveOverlay(null)}
          onSave={handleSaveLine}
        />
      ) : null}

      {activeOverlay?.type === 'delete-line' ? (
        <DeleteRequestLineModal line={activeOverlay.line} onCancel={() => setActiveOverlay(null)} onConfirm={handleDeleteLine} />
      ) : null}

      {activeOverlay?.type === 'cancel-draft' ? (
        <CancelDraftModal
          message={activeOverlay.nextProjectId ? 'Si cambia de proyecto, el detalle actual y la justificación del borrador se descartarán para evitar inconsistencias.' : 'Si sale ahora, perderá la justificación y las líneas agregadas en el borrador actual.'}
          onCancel={() => setActiveOverlay(null)}
          onDiscard={() => {
            const nextProjectId = activeOverlay.nextProjectId ?? currentProjectId;
            setCurrentProjectId(nextProjectId);
            resetDraft(nextProjectId);
            setActiveOverlay(null);
          }}
          onSave={() => {
            setActiveOverlay(null);
            handleSaveRequest();
          }}
        />
      ) : null}

      {activeOverlay?.type === 'detail' ? (
        <PurchaseRequestDetailDrawer request={activeOverlay.request} onClose={() => setActiveOverlay(null)} />
      ) : null}
    </div>
  );
}