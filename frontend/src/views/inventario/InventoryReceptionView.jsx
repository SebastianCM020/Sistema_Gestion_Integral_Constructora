import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
// ── Servicios reales (reemplaza mocks) ─────────────────────────────────────
import {
  fetchRequerimientosAprobados,
  recepcionarMateriales as apiRecepcionarMateriales,
  fetchInventario,
} from '../../services/bodega.service.js';
import { fetchProyectosAsignados } from '../../services/projects.service.js';
import {
  buildReceptionDraftFromRequest,
  defaultInventoryFilters,
  emptyReceptionDraft,
  filterApprovedRequests,
  filterInventoryItems,
  getProjectInventorySummary,
  getReceptionDeltaSummary,
  hasReceptionChanges,
} from '../../utils/inventoryHelpers.js';
import { validateReceptionDraft } from '../../utils/receptionValidationHelpers.js';

/**
 * Adapta un requerimiento del backend al formato que espera la UI.
 * Mantiene compatibilidad con los helpers de inventoryHelpers.js.
 */
const adaptarRequerimiento = (req) => ({
  requestId: req.id,
  requestCode: req.id.slice(0, 8).toUpperCase(),
  projectId: req.idProyecto,
  projectCode: req.proyecto?.codigo ?? '',
  projectName: req.proyecto?.nombre ?? '',
  receptionStatus: 'available',
  lines: (req.detalles ?? []).map((d) => ({
    materialId: d.idMaterial,
    materialName: d.material?.nombre ?? d.idMaterial,
    materialCode: d.material?.codigo ?? '',
    unit: d.material?.unidad ?? 'u',
    quantityRequested: parseFloat(d.cantidadSolicitada),
    quantityReceived: parseFloat(d.cantidadRecibida ?? 0),
    cantidadRecibida: parseFloat(d.cantidadSolicitada) - parseFloat(d.cantidadRecibida ?? 0),
  })),
});

/**
 * Adapta un item de inventario del backend al formato de la UI.
 */
const adaptarInventario = (inv) => ({
  materialId: inv.idMaterial,
  materialCode: inv.material?.codigo ?? '',
  materialName: inv.material?.nombre ?? inv.idMaterial,
  category: inv.material?.categoria ?? '',
  unit: inv.material?.unidad ?? 'u',
  stockCurrent: parseFloat(inv.stockActual ?? inv.cantidadDisponible ?? 0),
  lastUpdated: inv.ultimaActualizacion ?? new Date().toISOString(),
  totalEntradas: parseFloat(inv.desglose?.totalEntradas ?? 0),
  totalSalidas: parseFloat(inv.desglose?.totalSalidas ?? 0),
});

export function InventoryReceptionView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  // Datos reales desde el backend
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState('');
  const [requestsByProject, setRequestsByProject] = useState({});
  const [inventoryByProject, setInventoryByProject] = useState({});
  const [receptionHistoryByProject] = useState({});
  const [filters, setFilters] = useState(defaultInventoryFilters);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [receptionDraft, setReceptionDraft] = useState(emptyReceptionDraft);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAuthorizedRole = currentUser.roleName === 'Bodeguero';
  const isOnline = navigator.onLine;

  const currentProject = useMemo(
    () => projects.find((p) => p.id === currentProjectId) ?? null,
    [projects, currentProjectId]
  );
  const currentRequests = useMemo(
    () => requestsByProject[currentProjectId] ?? [],
    [requestsByProject, currentProjectId]
  );
  const currentInventory = useMemo(
    () => inventoryByProject[currentProjectId] ?? [],
    [inventoryByProject, currentProjectId]
  );
  const currentReceptionHistory = useMemo(
    () => receptionHistoryByProject[currentProjectId] ?? [],
    [receptionHistoryByProject, currentProjectId]
  );
  const pendingRequests = useMemo(
    () => currentRequests.filter((r) => r.receptionStatus === 'available'),
    [currentRequests]
  );
  const visibleRequests = useMemo(
    () => filterApprovedRequests(pendingRequests, filters.requestQuery),
    [pendingRequests, filters.requestQuery]
  );
  const visibleInventory = useMemo(
    () => filterInventoryItems(currentInventory, filters.inventoryQuery),
    [currentInventory, filters.inventoryQuery]
  );
  const selectedRequest = useMemo(
    () => currentRequests.find((r) => r.requestId === selectedRequestId) ?? null,
    [currentRequests, selectedRequestId]
  );
  const selectedInventoryItem = activeOverlay?.type === 'inventory-detail' ? activeOverlay.item : null;
  const currentSummary = useMemo(
    () => getProjectInventorySummary(currentInventory, currentRequests, currentReceptionHistory),
    [currentInventory, currentRequests, currentReceptionHistory]
  );
  const receptionSummary = useMemo(
    () => getReceptionDeltaSummary(receptionDraft.lines),
    [receptionDraft.lines]
  );

  /**
   * Carga proyectos asignados y datos iniciales de bodega desde el backend real.
   */
  const cargarDatosIniciales = useCallback(async () => {
    setLoadStatus('loading');
    try {
      const proyectosRes = await fetchProyectosAsignados();
      const proyectosData = proyectosRes?.data ?? proyectosRes ?? [];

      if (!proyectosData.length) {
        setProjects([]);
        setLoadStatus('ready');
        return;
      }

      // Adaptar formato del backend al formato de la UI
      const proyectosAdaptados = proyectosData.map((p) => ({
        id: p.id,
        code: p.codigo,
        name: p.nombre,
        estado: p.estado,
      }));

      setProjects(proyectosAdaptados);
      const primerProyecto = proyectosAdaptados[0];
      setCurrentProjectId((prev) => prev || primerProyecto.id);

      // Cargar requerimientos e inventario del primer proyecto en paralelo
      await cargarDatosProyecto(primerProyecto.id);
      setLoadStatus('ready');
    } catch (error) {
      console.error('[InventoryReceptionView] Error cargando datos:', error);
      setLoadStatus('error');
    }
  }, [retryCount]);

  /**
   * Carga requerimientos aprobados e inventario de un proyecto específico.
   */
  const cargarDatosProyecto = useCallback(async (idProyecto) => {
    try {
      const [reqRes, invRes] = await Promise.all([
        fetchRequerimientosAprobados(idProyecto, isOnline).catch(() => ({ data: [] })),
        fetchInventario(idProyecto, isOnline).catch(() => ({ data: [] })),
      ]);

      const requerimientos = (reqRes.data ?? []).map(adaptarRequerimiento);
      const inventario = (invRes.data ?? []).map(adaptarInventario);

      setRequestsByProject((prev) => ({ ...prev, [idProyecto]: requerimientos }));
      setInventoryByProject((prev) => ({ ...prev, [idProyecto]: inventario }));
    } catch (error) {
      console.error('[InventoryReceptionView] Error cargando proyecto:', idProyecto, error);
    }
  }, [isOnline]);

  // Carga inicial de datos reales
  useEffect(() => {
    if (isAuthorizedRole && !isRestricted) {
      cargarDatosIniciales();
    } else {
      setLoadStatus('ready');
    }
  }, [retryCount, isAuthorizedRole, isRestricted]);

  const clearReceptionState = () => {
    setSelectedRequestId(null);
    setReceptionDraft(emptyReceptionDraft);
    setErrors({});
    setActiveOverlay(null);
    setSubmissionError(null);
  };

  const handleSelectProject = useCallback((projectId) => {
    if (projectId === currentProjectId) return;

    if (hasReceptionChanges(receptionDraft)) {
      setActiveOverlay({ type: 'exit-reception', nextProjectId: projectId });
      return;
    }

    setCurrentProjectId(projectId);
    clearReceptionState();
    // Cargar datos del nuevo proyecto si no están en caché
    if (!requestsByProject[projectId]) {
      cargarDatosProyecto(projectId);
    }
  }, [currentProjectId, receptionDraft, requestsByProject, cargarDatosProyecto]);

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

  /**
   * Confirma la recepción enviando los datos al backend real.
   * CA HU-S8-1/S8-2: Recepción transaccional con validaciones de backend.
   */
  const handleConfirmReception = useCallback(async () => {
    if (!selectedRequest) {
      setActiveOverlay(null);
      return;
    }

    try {
      // Mapear líneas del draft al formato que espera el backend
      const detallesRecepcion = receptionDraft.lines
        .filter((line) => parseFloat(line.cantidadRecibida) > 0)
        .map((line) => ({
          idMaterial: line.materialId,
          cantidadRecibida: parseFloat(line.cantidadRecibida),
          observacion: `Recepción bodega — ${new Date().toLocaleDateString('es-EC')}`,
        }));

      await apiRecepcionarMateriales({
        idProyecto: currentProjectId,
        idRequerimiento: selectedRequest.requestId,
        detallesRecepcion,
        isOnline,
      });

      // Actualizar datos locales desde el backend para mantener consistencia
      await cargarDatosProyecto(currentProjectId);

      const receptionRecord = {
        id: `rec-${Date.now()}`,
        requestCode: selectedRequest.requestCode,
        projectId: selectedRequest.projectId,
        projectCode: selectedRequest.projectCode,
        projectName: selectedRequest.projectName,
        receivedAt: new Date().toISOString(),
        lines: receptionDraft.lines,
      };

      setFeedback({ requestCode: selectedRequest.requestCode, receptionRecord });
      clearReceptionState();
    } catch (error) {
      const mensaje =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'No fue posible registrar la recepción. Reintente sin salir de la pantalla actual.';
      setSubmissionError(mensaje);
      setActiveOverlay(null);
    }
  }, [selectedRequest, receptionDraft, currentProjectId, isOnline, cargarDatosProyecto]);

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