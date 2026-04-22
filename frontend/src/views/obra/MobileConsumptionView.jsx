import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { AvailableMaterialsList } from '../../components/obra/AvailableMaterialsList.jsx';
import { ChangeProjectConsumptionModal } from '../../components/obra/ChangeProjectConsumptionModal.jsx';
import { ConsumptionContextHeader } from '../../components/obra/ConsumptionContextHeader.jsx';
import { ConsumptionDraftPanel } from '../../components/obra/ConsumptionDraftPanel.jsx';
import { ConsumptionErrorState } from '../../components/obra/ConsumptionErrorState.jsx';
import { ConsumptionForm } from '../../components/obra/ConsumptionForm.jsx';
import { ConsumptionLoadingState } from '../../components/obra/ConsumptionLoadingState.jsx';
import { ConsumptionSuccessState } from '../../components/obra/ConsumptionSuccessState.jsx';
import { ConsumptionSummaryCard } from '../../components/obra/ConsumptionSummaryCard.jsx';
import { MaterialSearchBar } from '../../components/obra/MaterialSearchBar.jsx';
import { MaterialStockCard } from '../../components/obra/MaterialStockCard.jsx';
import { StockInsufficientModal } from '../../components/obra/StockInsufficientModal.jsx';
import { StockValidationBanner } from '../../components/obra/StockValidationBanner.jsx';
import { getAssignedProjectsForUser } from '../../data/mockAssignedProjects.js';
import { getConsumptionHistoryForUser } from '../../data/mockConsumptionHistory.js';
import { mockInventoryByProject } from '../../data/mockInventoryByProject.js';
import { getModulesForUser } from '../../data/icaroData.js';
import {
  clearConsumptionForm,
  createConsumptionPayload,
  defaultConsumptionFormValues,
  filterMaterials,
  getActiveMaterialsForProject,
  getConsumptionSummary,
  getSelectedMaterial,
  getSelectedProject,
  hasConsumptionDraft,
  validateConsumptionForm,
  updateInventoryAfterConsumption,
} from '../../utils/consumptionHelpers.js';
import { getStockValidation } from '../../utils/stockValidationHelpers.js';

export function MobileConsumptionView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [assignedProjects] = useState(() => getAssignedProjectsForUser(currentUser.email));
  const [inventoryByProject, setInventoryByProject] = useState(mockInventoryByProject);
  const [currentProjectId, setCurrentProjectId] = useState(assignedProjects[0]?.id ?? '');
  const [materialQuery, setMaterialQuery] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [values, setValues] = useState(defaultConsumptionFormValues);
  const [errors, setErrors] = useState({});
  const [consumptionRecords, setConsumptionRecords] = useState(() => getConsumptionHistoryForUser(currentUser.email));
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [lastRecord, setLastRecord] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isResident = currentUser.roleName === 'Residente' && !isRestricted;
  const currentProject = useMemo(() => getSelectedProject(assignedProjects, currentProjectId), [assignedProjects, currentProjectId]);
  const activeMaterials = useMemo(() => getActiveMaterialsForProject(inventoryByProject, currentProjectId), [inventoryByProject, currentProjectId]);
  const filteredMaterials = useMemo(() => filterMaterials(activeMaterials, materialQuery), [activeMaterials, materialQuery]);
  const selectedMaterial = useMemo(() => getSelectedMaterial(activeMaterials, selectedMaterialId), [activeMaterials, selectedMaterialId]);
  const stockValidation = useMemo(() => getStockValidation(selectedMaterial, values.quantity), [selectedMaterial, values.quantity]);
  const consumptionSummary = useMemo(() => getConsumptionSummary(assignedProjects, currentProjectId, inventoryByProject, consumptionRecords), [assignedProjects, currentProjectId, inventoryByProject, consumptionRecords]);
  const hasDraft = hasConsumptionDraft(values, selectedMaterialId);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.consumptionShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.consumptionShouldFail, retryCount]);

  useEffect(() => {
    if (!activeMaterials.length) {
      setSelectedMaterialId('');
      return;
    }

    if (activeMaterials.length === 1) {
      setSelectedMaterialId(activeMaterials[0].id);
      return;
    }

    if (!activeMaterials.some((material) => material.id === selectedMaterialId)) {
      setSelectedMaterialId('');
    }
  }, [activeMaterials, selectedMaterialId]);

  const resetDraft = () => {
    setValues(clearConsumptionForm());
    setErrors({});
    setSubmitStatus('idle');
  };

  const handleChangeValue = (field, value) => {
    setValues((previousValues) => ({ ...previousValues, [field]: value }));
    setErrors((previousErrors) => ({ ...previousErrors, [field]: undefined }));

    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
    }
  };

  const handleConfirmProject = (nextProjectId) => {
    setCurrentProjectId(nextProjectId);
    setSelectedMaterialId('');
    setMaterialQuery('');
    setValues(clearConsumptionForm());
    setErrors({});
    setSubmitStatus('idle');
    setActiveOverlay(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateConsumptionForm({
      projectId: currentProjectId,
      materialId: selectedMaterialId,
      quantity: values.quantity,
    });

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    if (stockValidation.status === 'block') {
      setActiveOverlay({ type: 'stock-insufficient' });
      return;
    }

    setSubmitStatus('submitting');

    window.setTimeout(() => {
      if (!currentProject || !selectedMaterial) {
        setSubmitStatus('error');
        return;
      }

      const nextRecord = createConsumptionPayload({
        project: currentProject,
        material: selectedMaterial,
        values,
      });

      setConsumptionRecords((previousRecords) => [nextRecord, ...previousRecords]);
      setInventoryByProject((previousInventory) => updateInventoryAfterConsumption(previousInventory, currentProjectId, selectedMaterialId, Number(values.quantity)));
      setLastRecord(nextRecord);
      setValues(clearConsumptionForm());
      setErrors({});
      setSubmitStatus('success');
    }, 650);
  };

  const handleRegisterAnother = () => {
    setSubmitStatus('idle');
    setValues(clearConsumptionForm());
    setErrors({});
  };

  if (!isResident) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Consumo en obra"
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
              <p className="mt-2 max-w-2xl text-sm text-gray-600">El registro móvil de consumo en obra está disponible para el rol Residente. Vuelva al panel principal para continuar dentro de una vista autorizada.</p>
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
        currentAreaLabel="Consumo en obra"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="consumption"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0">
          <div className="mx-auto flex max-w-[820px] flex-col gap-5">
            {loadStatus === 'loading' ? <ConsumptionLoadingState /> : null}

            {loadStatus === 'error' ? (
              <ConsumptionErrorState
                title="No fue posible cargar el consumo en obra"
                description="Revise la conexión o reintente la carga para recuperar proyectos, materiales y stock disponible."
                onRetry={() => setRetryCount((value) => value + 1)}
                onGoHome={onGoHome}
              />
            ) : null}

            {loadStatus === 'ready' ? (
              <>
                {assignedProjects.length ? (
                  <ConsumptionContextHeader
                    currentProject={currentProject}
                    hasMultipleProjects={assignedProjects.length > 1}
                    pendingSyncCount={consumptionSummary.pendingSync}
                    onGoHome={onGoHome}
                    onOpenProjectModal={() => setActiveOverlay({ type: 'change-project' })}
                  />
                ) : (
                  <EmptyState
                    title="No tiene proyectos asignados en este momento"
                    description="Aún no hay proyectos disponibles para registrar consumo. Vuelva al panel principal para continuar sin quedar atrapado."
                    actionLabel="Volver al panel principal"
                    onAction={onGoHome}
                  />
                )}

                {assignedProjects.length ? <ConsumptionSummaryCard summary={consumptionSummary} /> : null}

                {assignedProjects.length && !activeMaterials.length ? (
                  <EmptyState
                    title="No hay materiales disponibles para este proyecto"
                    description="Cambie de proyecto o vuelva al panel principal. El sistema no permitirá registrar consumo hasta tener materiales activos para el frente seleccionado."
                    actionLabel={assignedProjects.length > 1 ? 'Cambiar proyecto' : 'Volver al panel principal'}
                    onAction={assignedProjects.length > 1 ? () => setActiveOverlay({ type: 'change-project' }) : onGoHome}
                  />
                ) : null}

                {assignedProjects.length && activeMaterials.length ? (
                  <>
                    <MaterialSearchBar value={materialQuery} onChange={setMaterialQuery} />
                    <AvailableMaterialsList materials={filteredMaterials} selectedMaterialId={selectedMaterialId} onSelect={setSelectedMaterialId} query={materialQuery} />

                    {selectedMaterial ? (
                      <MaterialStockCard material={selectedMaterial} />
                    ) : (
                      <EmptyState
                        title="Seleccione un material para continuar"
                        description="El proyecto ya está definido. Elija un material disponible para revisar su stock y registrar el consumo."
                      />
                    )}

                    {hasDraft && submitStatus !== 'success' ? <ConsumptionDraftPanel selectedMaterial={selectedMaterial} values={values} onReset={resetDraft} /> : null}

                    {submitStatus === 'error' ? (
                      <ConsumptionErrorState
                        title="No fue posible registrar el consumo"
                        description="Revise los datos del formulario y reintente el envío cuando el proyecto y material estén correctamente definidos."
                        onDismiss={() => setSubmitStatus('idle')}
                      />
                    ) : null}

                    {selectedMaterial ? <StockValidationBanner validation={stockValidation} /> : null}

                    {submitStatus === 'success' && lastRecord ? (
                      <ConsumptionSuccessState record={lastRecord} onRegisterAnother={handleRegisterAnother} onGoHome={onGoHome} />
                    ) : (
                      <ConsumptionForm
                        values={values}
                        errors={errors}
                        selectedMaterial={selectedMaterial}
                        isSubmitting={submitStatus === 'submitting'}
                        onChange={handleChangeValue}
                        onSubmit={handleSubmit}
                        onReset={resetDraft}
                      />
                    )}
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </main>
      </div>

      {activeOverlay?.type === 'change-project' ? (
        <ChangeProjectConsumptionModal
          projects={assignedProjects}
          currentProjectId={currentProjectId}
          hasDraft={hasDraft}
          onCancel={() => setActiveOverlay(null)}
          onConfirm={handleConfirmProject}
        />
      ) : null}

      {activeOverlay?.type === 'stock-insufficient' && selectedMaterial ? (
        <StockInsufficientModal
          material={selectedMaterial}
          quantity={Number(values.quantity || 0)}
          validation={stockValidation}
          onClose={() => setActiveOverlay(null)}
        />
      ) : null}
    </div>
  );
}