import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { ApprovedRequestsSelector } from '../../components/inventario/ApprovedRequestsSelector.jsx';
import { EmptyInventoryState } from '../../components/inventario/EmptyInventoryState.jsx';
import { ExcessReceptionModal } from '../../components/inventario/ExcessReceptionModal.jsx';
import { ExitReceptionModal } from '../../components/inventario/ExitReceptionModal.jsx';
import { InventoryByProjectTable } from '../../components/inventario/InventoryByProjectTable.jsx';
import { InventoryDetailDrawer } from '../../components/inventario/InventoryDetailDrawer.jsx';
import { InventoryReceptionErrorState } from '../../components/inventario/InventoryReceptionErrorState.jsx';
import { InventoryReceptionFilters } from '../../components/inventario/InventoryReceptionFilters.jsx';
import { InventoryReceptionHeader } from '../../components/inventario/InventoryReceptionHeader.jsx';
import { InventoryReceptionLoadingState } from '../../components/inventario/InventoryReceptionLoadingState.jsx';
import { InventorySummaryCards } from '../../components/inventario/InventorySummaryCards.jsx';
import { ProjectInventorySelector } from '../../components/inventario/ProjectInventorySelector.jsx';
import { ReceptionConfirmModal } from '../../components/inventario/ReceptionConfirmModal.jsx';
import { ReceptionForm } from '../../components/inventario/ReceptionForm.jsx';
import { ReceptionSuccessState } from '../../components/inventario/ReceptionSuccessState.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import { getApprovedRequestsByProject } from '../../data/mockApprovedRequests.js';
import { getAssignedProjectsForUser } from '../../data/mockAssignedProjects.js';
import { mockInventoryByProject } from '../../data/mockInventoryByProject.js';
import { getReceptionHistoryByProject } from '../../data/mockReceptionHistory.js';
import {
  applyReceptionToInventory,
  buildReceptionDraftFromRequest,
  defaultInventoryFilters,
  emptyReceptionDraft,
  filterApprovedRequests,
  filterInventoryItems,
  formatInventoryDate,
  getProjectInventorySummary,
  getReceptionDeltaSummary,
  hasReceptionChanges,
  markRequestAsReceived,
} from '../../utils/inventoryHelpers.js';
import { validateReceptionDraft } from '../../utils/receptionValidationHelpers.js';

export function InventoryReceptionView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [projects] = useState(() => getAssignedProjectsForUser(currentUser.email));
  const [currentProjectId, setCurrentProjectId] = useState(projects[0]?.id ?? '');
  const [requestsByProject, setRequestsByProject] = useState(() => Object.fromEntries(projects.map((project) => [project.id, getApprovedRequestsByProject(project.id)])));
  const [inventoryByProject, setInventoryByProject] = useState(() => Object.fromEntries(projects.map((project) => [project.id, (mockInventoryByProject[project.id] ?? []).map((item) => ({ ...item }))])));
  const [receptionHistoryByProject, setReceptionHistoryByProject] = useState(() => Object.fromEntries(projects.map((project) => [project.id, getReceptionHistoryByProject(project.id)])));
  const [filters, setFilters] = useState(defaultInventoryFilters);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [receptionDraft, setReceptionDraft] = useState(emptyReceptionDraft);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAuthorizedRole = currentUser.roleName === 'Bodeguero';
  const currentProject = useMemo(() => projects.find((project) => project.id === currentProjectId) ?? null, [projects, currentProjectId]);
  const currentRequests = useMemo(() => requestsByProject[currentProjectId] ?? [], [requestsByProject, currentProjectId]);
  const currentInventory = useMemo(() => inventoryByProject[currentProjectId] ?? [], [inventoryByProject, currentProjectId]);
  const currentReceptionHistory = useMemo(() => receptionHistoryByProject[currentProjectId] ?? [], [receptionHistoryByProject, currentProjectId]);
  const pendingRequests = useMemo(() => currentRequests.filter((request) => request.receptionStatus === 'available'), [currentRequests]);
  const visibleRequests = useMemo(() => filterApprovedRequests(pendingRequests, filters.requestQuery), [pendingRequests, filters.requestQuery]);
  const visibleInventory = useMemo(() => filterInventoryItems(currentInventory, filters.inventoryQuery), [currentInventory, filters.inventoryQuery]);
  const selectedRequest = useMemo(() => currentRequests.find((request) => request.requestId === selectedRequestId) ?? null, [currentRequests, selectedRequestId]);
  const selectedInventoryItem = activeOverlay?.type === 'inventory-detail' ? activeOverlay.item : null;
  const currentSummary = useMemo(() => getProjectInventorySummary(currentInventory, currentRequests, currentReceptionHistory), [currentInventory, currentRequests, currentReceptionHistory]);
  const receptionSummary = useMemo(() => getReceptionDeltaSummary(receptionDraft.lines), [receptionDraft.lines]);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.inventoryShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.inventoryShouldFail, retryCount]);

  const clearReceptionState = () => {
    setSelectedRequestId(null);
    setReceptionDraft(emptyReceptionDraft);
    setErrors({});
    setActiveOverlay(null);
    setSubmissionError(null);
  };

  const handleSelectProject = (projectId) => {
    if (projectId === currentProjectId) {
      return;
    }

    if (hasReceptionChanges(receptionDraft)) {
      setActiveOverlay({ type: 'exit-reception', nextProjectId: projectId });
      return;
    }

    setCurrentProjectId(projectId);
    clearReceptionState();
  };

  const handleSelectRequest = (requestId) => {
    const request = currentRequests.find((item) => item.requestId === requestId);

    if (!request) {
      return;
    }

    setSelectedRequestId(requestId);
    setReceptionDraft(buildReceptionDraftFromRequest(request));
    setErrors({});
    setFeedback(null);
    setSubmissionError(null);
  };

  const handleChangeQuantity = (materialId, value) => {
    setReceptionDraft((currentDraft) => ({
      ...currentDraft,
      lines: currentDraft.lines.map((line) => (line.materialId === materialId ? { ...line, cantidadRecibida: value } : line)),
    }));

    setErrors((currentErrors) => {
      if (!currentErrors.lineErrors?.[materialId]) {
        return currentErrors;
      }

      const nextLineErrors = { ...currentErrors.lineErrors };
      delete nextLineErrors[materialId];

      return { ...currentErrors, lineErrors: nextLineErrors };
    });
  };

  const handleSubmitReception = () => {
    const validation = validateReceptionDraft(receptionDraft);

    if (Object.keys(validation.errors).length) {
      setErrors(validation.errors);
      return;
    }

    if (validation.excessLines.length) {
      setActiveOverlay({ type: 'excess', lines: validation.excessLines });
      return;
    }

    setErrors({});
    setActiveOverlay({ type: 'confirm-reception' });
  };

  const handleConfirmReception = () => {
    if (!selectedRequest) {
      setActiveOverlay(null);
      return;
    }

    if (currentUser.receptionShouldFail) {
      setSubmissionError('No fue posible registrar la recepción. Reintente sin salir de la pantalla actual.');
      setActiveOverlay(null);
      return;
    }

    const { updatedInventory, receptionRecord } = applyReceptionToInventory(currentInventory, receptionDraft.lines, selectedRequest.requestId, currentUser);
    const completedRecord = {
      ...receptionRecord,
      requestCode: selectedRequest.requestCode,
      projectId: selectedRequest.projectId,
      projectCode: selectedRequest.projectCode,
      projectName: selectedRequest.projectName,
    };

    setInventoryByProject((currentMap) => ({ ...currentMap, [currentProjectId]: updatedInventory }));
    setReceptionHistoryByProject((currentMap) => ({ ...currentMap, [currentProjectId]: [completedRecord, ...(currentMap[currentProjectId] ?? [])] }));
    setRequestsByProject((currentMap) => ({
      ...currentMap,
      [currentProjectId]: markRequestAsReceived(currentMap[currentProjectId] ?? [], selectedRequest.requestId, receptionDraft.lines),
    }));
    setFeedback({ requestCode: selectedRequest.requestCode, receptionRecord: completedRecord });
    clearReceptionState();
  };

  if (!isAuthorizedRole || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader currentUser={currentUser} currentAreaLabel="Recepción e inventario" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />

        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation modules={modules} activeItemId="dashboard" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />
          <main>
            <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]"><ShieldAlert size={28} /></div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">No tiene acceso a esta sección</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">La recepción e inventario está disponible para el Bodeguero. Vuelva al panel principal para continuar con una vista autorizada.</p>
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
      <AppHeader currentUser={currentUser} currentAreaLabel="Recepción e inventario" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation modules={modules} activeItemId="inventory" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />

        <main className="min-w-0 space-y-6">
          <InventoryReceptionHeader currentProject={currentProject} summary={currentSummary} onGoHome={onGoHome} />

          {loadStatus === 'loading' ? <InventoryReceptionLoadingState /> : null}

          {loadStatus === 'error' ? <InventoryReceptionErrorState title="No fue posible cargar la operación de inventario" description="Reintente para recuperar proyectos, requerimientos aprobados e inventario del proyecto." onRetry={() => setRetryCount((currentValue) => currentValue + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              {feedback ? <ReceptionSuccessState receptionRecord={feedback.receptionRecord} requestCode={feedback.requestCode} onBackToList={() => setFeedback(null)} onReviewInventory={() => setFeedback(null)} /> : null}

              {submissionError ? <InventoryReceptionErrorState title="No fue posible registrar la recepción" description={submissionError} onDismiss={() => setSubmissionError(null)} /> : null}

              {!projects.length ? (
                <EmptyInventoryState title="No tiene proyectos disponibles" description="No hay proyectos autorizados para operar recepción e inventario en esta sesión." actionLabel="Volver al panel principal" onAction={onGoHome} />
              ) : (
                <>
                  <InventorySummaryCards summary={currentSummary} />
                  <ProjectInventorySelector projects={projects} currentProjectId={currentProjectId} onChange={handleSelectProject} />
                  <InventoryReceptionFilters filters={filters} onChange={(field, value) => setFilters((currentFilters) => ({ ...currentFilters, [field]: value }))} onReset={() => setFilters(defaultInventoryFilters)} />

                  <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                      <SectionHeader title="Requerimientos aprobados" description="Seleccione un requerimiento aprobado para registrar la recepción del proyecto activo." />
                      {!pendingRequests.length ? (
                        <EmptyInventoryState title="No hay requerimientos aprobados pendientes" description="Este proyecto no tiene recepciones disponibles en este momento. Puede revisar el inventario actualizado o cambiar de proyecto." actionLabel={projects.length > 1 ? 'Cambiar proyecto' : 'Volver al panel principal'} onAction={projects.length > 1 ? () => handleSelectProject(projects.find((project) => project.id !== currentProjectId)?.id ?? currentProjectId) : onGoHome} />
                      ) : !visibleRequests.length ? (
                        <EmptyInventoryState title="No se encontraron requerimientos con ese filtro" description="Ajuste la búsqueda para volver a ver los requerimientos aprobados del proyecto." actionLabel="Limpiar filtros" onAction={() => setFilters(defaultInventoryFilters)} />
                      ) : (
                        <ApprovedRequestsSelector requests={visibleRequests} selectedRequestId={selectedRequestId} onSelect={handleSelectRequest} />
                      )}
                    </section>

                    <div className="space-y-6">
                      {selectedRequest ? (
                        <ReceptionForm request={selectedRequest} draft={receptionDraft} errors={errors} summary={receptionSummary} onChangeQuantity={handleChangeQuantity} onCancel={() => setActiveOverlay({ type: 'exit-reception' })} onSubmit={handleSubmitReception} />
                      ) : (
                        <EmptyInventoryState title="Seleccione un requerimiento aprobado" description="Abra una solicitud aprobada para ingresar cantidades recibidas y actualizar el stock del proyecto." />
                      )}

                      <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                        <SectionHeader title="Inventario por proyecto" description={`Consulte el inventario actual de ${currentProject?.name ?? 'este proyecto'} y revise disponibilidad, ubicación y actualización.`} />
                        {!currentInventory.length ? (
                          <EmptyInventoryState title="No hay materiales registrados en el inventario" description="Aún no existen materiales cargados para este proyecto. Registre una recepción o cambie de proyecto para continuar." actionLabel={projects.length > 1 ? 'Cambiar proyecto' : undefined} onAction={projects.length > 1 ? () => handleSelectProject(projects.find((project) => project.id !== currentProjectId)?.id ?? currentProjectId) : undefined} />
                        ) : !visibleInventory.length ? (
                          <EmptyInventoryState title="No se encontraron materiales con ese filtro" description="Ajuste la búsqueda para volver a consultar el inventario del proyecto activo." actionLabel="Limpiar filtros" onAction={() => setFilters(defaultInventoryFilters)} />
                        ) : (
                          <InventoryByProjectTable items={visibleInventory} onOpenDetail={(item) => setActiveOverlay({ type: 'inventory-detail', item })} />
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

      {selectedInventoryItem ? <InventoryDetailDrawer item={selectedInventoryItem} onClose={() => setActiveOverlay(null)} /> : null}

      {selectedRequest && activeOverlay?.type === 'confirm-reception' ? <ReceptionConfirmModal request={selectedRequest} lines={receptionDraft.lines} onCancel={() => setActiveOverlay(null)} onConfirm={handleConfirmReception} /> : null}

      {activeOverlay?.type === 'excess' ? <ExcessReceptionModal lines={activeOverlay.lines} onClose={() => setActiveOverlay(null)} /> : null}

      {activeOverlay?.type === 'exit-reception' ? (
        <ExitReceptionModal
          onCancel={() => setActiveOverlay(null)}
          onConfirm={() => {
            const nextProjectId = activeOverlay.nextProjectId ?? currentProjectId;

            setActiveOverlay(null);
            setCurrentProjectId(nextProjectId);
            clearReceptionState();
          }}
        />
      ) : null}
    </div>
  );
}