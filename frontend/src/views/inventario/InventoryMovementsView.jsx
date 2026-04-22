import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { ProjectInventorySelector } from '../../components/inventario/ProjectInventorySelector.jsx';
import { InventoryMovementsHeader } from '../../components/inventario/InventoryMovementsHeader.jsx';
import { InventoryMovementSummaryCards } from '../../components/inventario/InventoryMovementSummaryCards.jsx';
import { InventoryMovementsFilters } from '../../components/inventario/InventoryMovementsFilters.jsx';
import { InventoryAlertBanner } from '../../components/inventario/InventoryAlertBanner.jsx';
import { InventoryAlertsPanel } from '../../components/inventario/InventoryAlertsPanel.jsx';
import { InventoryMovementsTable } from '../../components/inventario/InventoryMovementsTable.jsx';
import { InventoryMovementDetailDrawer } from '../../components/inventario/InventoryMovementDetailDrawer.jsx';
import { InsufficientStockAlertModal } from '../../components/inventario/InsufficientStockAlertModal.jsx';
import { ExcessMovementAlertModal } from '../../components/inventario/ExcessMovementAlertModal.jsx';
import { EmptyMovementsState } from '../../components/inventario/EmptyMovementsState.jsx';
import { InventoryMovementsLoadingState } from '../../components/inventario/InventoryMovementsLoadingState.jsx';
import { InventoryMovementsErrorState } from '../../components/inventario/InventoryMovementsErrorState.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import { getAssignedProjectsForUser } from '../../data/mockAssignedProjects.js';
import { getInventoryMovementsByProject } from '../../data/mockInventoryMovements.js';
import { getInventoryAlertsByProject } from '../../data/mockInventoryAlerts.js';
import { defaultInventoryMovementFilters, filterInventoryMovements, getInventoryMovementSummary, getMaterialOptionsFromMovements, getMovementOriginMeta, sortInventoryMovements } from '../../utils/inventoryMovementHelpers.js';
import { sortInventoryAlerts } from '../../utils/inventoryAlertHelpers.js';

function canOpenMovementOriginForUser(currentUser, movement) {
  if (movement.originType === 'reception') {
    return currentUser.roleName === 'Bodeguero';
  }

  if (movement.originType === 'consumption') {
    return currentUser.roleName === 'Residente';
  }

  if (movement.originType === 'review') {
    return currentUser.roleName === 'Presidente / Gerente';
  }

  return false;
}

export function InventoryMovementsView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [projects] = useState(() => getAssignedProjectsForUser(currentUser.email));
  const [currentProjectId, setCurrentProjectId] = useState(projects[0]?.id ?? '');
  const [filters, setFilters] = useState(defaultInventoryMovementFilters);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [movementsByProject] = useState(() => Object.fromEntries(projects.map((project) => [project.id, getInventoryMovementsByProject(project.id)])));
  const [alertsByProject] = useState(() => Object.fromEntries(projects.map((project) => [project.id, getInventoryAlertsByProject(project.id)])));

  const modules = getModulesForUser(currentUser);
  const isAuthorizedRole = currentUser.roleName === 'Bodeguero';
  const currentProject = useMemo(() => projects.find((project) => project.id === currentProjectId) ?? null, [projects, currentProjectId]);
  const currentMovements = useMemo(() => movementsByProject[currentProjectId] ?? [], [movementsByProject, currentProjectId]);
  const currentAlerts = useMemo(() => sortInventoryAlerts(alertsByProject[currentProjectId] ?? []), [alertsByProject, currentProjectId]);
  const materialOptions = useMemo(() => getMaterialOptionsFromMovements(currentMovements), [currentMovements]);
  const visibleMovements = useMemo(() => sortInventoryMovements(filterInventoryMovements(currentMovements, filters)), [currentMovements, filters]);
  const summary = useMemo(() => getInventoryMovementSummary(currentMovements, currentAlerts), [currentMovements, currentAlerts]);
  const selectedMovement = useMemo(() => (activeOverlay?.type === 'movement-detail' ? activeOverlay.movement : null), [activeOverlay]);
  const activeAlert = useMemo(() => (activeOverlay?.type === 'alert-insufficient' || activeOverlay?.type === 'alert-excess' ? activeOverlay.alert : null), [activeOverlay]);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.inventoryMovementsShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.inventoryMovementsShouldFail, retryCount]);

  const openMovementById = (movementId) => {
    const movement = currentMovements.find((item) => item.id === movementId);

    if (!movement) {
      return;
    }

    setActiveOverlay({ type: 'movement-detail', movement });
  };

  const openAlertModal = (alert) => {
    setActiveOverlay({ type: alert.tipoAlerta === 'insufficient-stock' ? 'alert-insufficient' : 'alert-excess', alert });
  };

  if (!isAuthorizedRole || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader currentUser={currentUser} currentAreaLabel="Control de movimientos de inventario" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />

        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation modules={modules} activeItemId="dashboard" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />
          <main>
            <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]"><ShieldAlert size={28} /></div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">No tiene acceso a esta sección</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">El control de movimientos de inventario está disponible para usuarios autorizados de bodega. Vuelva al panel principal para continuar.</p>
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
      <AppHeader currentUser={currentUser} currentAreaLabel="Control de movimientos de inventario" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation modules={modules} activeItemId="inventory-movements" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />

        <main className="min-w-0 space-y-6">
          <InventoryMovementsHeader currentProject={currentProject} summary={summary} onGoHome={onGoHome} />

          {loadStatus === 'loading' ? <InventoryMovementsLoadingState /> : null}
          {loadStatus === 'error' ? <InventoryMovementsErrorState title="No fue posible cargar los movimientos" description="Reintente para recuperar movimientos, alertas y stock visible del proyecto." onRetry={() => setRetryCount((value) => value + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              {!projects.length ? (
                <EmptyMovementsState title="No tiene proyectos disponibles" description="No hay proyectos autorizados para consultar movimientos de inventario en esta sesión." actionLabel="Volver al panel principal" onAction={onGoHome} />
              ) : (
                <>
                  <InventoryMovementSummaryCards summary={summary} />
                  <ProjectInventorySelector projects={projects} currentProjectId={currentProjectId} onChange={setCurrentProjectId} />
                  <InventoryAlertBanner activeAlertsCount={currentAlerts.length} />
                  <InventoryMovementsFilters filters={filters} materials={materialOptions} onChange={(field, value) => setFilters((currentFilters) => ({ ...currentFilters, [field]: value }))} onReset={() => setFilters(defaultInventoryMovementFilters)} />

                  <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                      <div>
                        <h2 className="text-lg font-semibold text-[#2F3A45]">Movimientos del inventario</h2>
                        <p className="mt-1 text-sm text-gray-600">Consulte entradas y salidas del proyecto activo, con su stock resultante y alertas asociadas.</p>
                      </div>
                      {!currentMovements.length ? (
                        <EmptyMovementsState title="No hay movimientos registrados" description="Este proyecto aún no tiene entradas ni salidas visibles para el periodo consultado." />
                      ) : !visibleMovements.length ? (
                        <EmptyMovementsState title="No se encontraron resultados con esos filtros" description="Ajuste la búsqueda o limpie los filtros para volver a consultar el historial de movimientos." actionLabel="Limpiar filtros" onAction={() => setFilters(defaultInventoryMovementFilters)} />
                      ) : (
                        <InventoryMovementsTable movements={visibleMovements} onOpenDetail={(movement) => setActiveOverlay({ type: 'movement-detail', movement })} />
                      )}
                    </section>

                    <InventoryAlertsPanel alerts={currentAlerts} onOpenAlert={openAlertModal} onOpenMovement={openMovementById} />
                  </div>
                </>
              )}
            </>
          ) : null}
        </main>
      </div>

      {selectedMovement ? (
        <InventoryMovementDetailDrawer
          movement={selectedMovement}
          canOpenOrigin={canOpenMovementOriginForUser(currentUser, selectedMovement)}
          onOpenOrigin={() => {
            const originMeta = getMovementOriginMeta(selectedMovement.originType);
            if (originMeta.moduleId && canOpenMovementOriginForUser(currentUser, selectedMovement)) {
              onOpenModule(originMeta.moduleId);
            }
          }}
          onClose={() => setActiveOverlay(null)}
        />
      ) : null}

      {activeOverlay?.type === 'alert-insufficient' && activeAlert ? <InsufficientStockAlertModal alert={activeAlert} onClose={() => setActiveOverlay(null)} onViewDetail={() => openMovementById(activeAlert.movementId)} /> : null}
      {activeOverlay?.type === 'alert-excess' && activeAlert ? <ExcessMovementAlertModal alert={activeAlert} onClose={() => setActiveOverlay(null)} onViewDetail={() => openMovementById(activeAlert.movementId)} /> : null}
    </div>
  );
}