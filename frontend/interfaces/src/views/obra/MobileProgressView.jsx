import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ProjectContextHeader } from '../../components/obra/ProjectContextHeader.jsx';
import { RubroSelector } from '../../components/obra/RubroSelector.jsx';
import { RubroInfoCard } from '../../components/obra/RubroInfoCard.jsx';
import { ProgressForm } from '../../components/obra/ProgressForm.jsx';
import { ProgressSummaryCard } from '../../components/obra/ProgressSummaryCard.jsx';
import { ProgressSuccessState } from '../../components/obra/ProgressSuccessState.jsx';
import { ProgressErrorState } from '../../components/obra/ProgressErrorState.jsx';
import { ChangeProjectModal } from '../../components/obra/ChangeProjectModal.jsx';
import { OverBudgetModal } from '../../components/obra/OverBudgetModal.jsx';
import { ProgressDraftPanel } from '../../components/obra/ProgressDraftPanel.jsx';
import { ProgressLoadingState } from '../../components/obra/ProgressLoadingState.jsx';
import { getAssignedProjectsForUser } from '../../data/mockAssignedProjects.js';
import { mockRubrosByProject } from '../../data/mockRubrosByProject.js';
import { getModulesForUser } from '../../data/icaroData.js';
import { getBudgetValidation } from '../../utils/budgetValidationHelpers.js';
import {
  clearProgressForm,
  createProgressPayload,
  defaultProgressFormValues,
  getActiveRubrosForProject,
  getProjectProgressSummary,
  getSelectedProject,
  getSelectedRubro,
  hasProgressDraft,
  updateRubrosAfterProgress,
  validateProgressForm,
} from '../../utils/progressHelpers.js';

export function MobileProgressView({
  currentUser,
  isRestricted = false,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [assignedProjects] = useState(() => getAssignedProjectsForUser(currentUser.email));
  const [rubrosByProject, setRubrosByProject] = useState(mockRubrosByProject);
  const [currentProjectId, setCurrentProjectId] = useState(assignedProjects[0]?.id ?? '');
  const [selectedRubroId, setSelectedRubroId] = useState('');
  const [values, setValues] = useState(defaultProgressFormValues);
  const [errors, setErrors] = useState({});
  const [progressRecords, setProgressRecords] = useState([]);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [lastRecord, setLastRecord] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  const canContinueEvidence = currentUser.moduleIds.includes('evidence');
  const isResident = currentUser.roleName === 'Residente' && !isRestricted;
  const currentProject = useMemo(() => getSelectedProject(assignedProjects, currentProjectId), [assignedProjects, currentProjectId]);
  const activeRubros = useMemo(() => getActiveRubrosForProject(rubrosByProject, currentProjectId), [rubrosByProject, currentProjectId]);
  const selectedRubro = useMemo(() => getSelectedRubro(activeRubros, selectedRubroId), [activeRubros, selectedRubroId]);
  const budgetValidation = useMemo(() => getBudgetValidation(selectedRubro, values.quantity), [selectedRubro, values.quantity]);
  const progressSummary = useMemo(() => getProjectProgressSummary(assignedProjects, currentProjectId, rubrosByProject, progressRecords), [assignedProjects, currentProjectId, rubrosByProject, progressRecords]);
  const hasDraft = hasProgressDraft(values, selectedRubroId);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.progressShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.progressShouldFail, retryCount]);

  useEffect(() => {
    if (!activeRubros.length) {
      setSelectedRubroId('');
      return;
    }

    if (activeRubros.length === 1) {
      setSelectedRubroId(activeRubros[0].id);
      return;
    }

    if (!activeRubros.some((rubro) => rubro.id === selectedRubroId)) {
      setSelectedRubroId('');
    }
  }, [activeRubros, selectedRubroId]);

  const resetDraft = () => {
    setValues(clearProgressForm());
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
    setSelectedRubroId('');
    setValues(clearProgressForm());
    setErrors({});
    setSubmitStatus('idle');
    setActiveOverlay(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateProgressForm({
      projectId: currentProjectId,
      rubroId: selectedRubroId,
      quantity: values.quantity,
    });

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    if (budgetValidation.status === 'block') {
      setActiveOverlay({ type: 'over-budget' });
      return;
    }

    setSubmitStatus('submitting');

    window.setTimeout(() => {
      if (!currentProject || !selectedRubro) {
        setSubmitStatus('error');
        return;
      }

      const nextRecord = createProgressPayload({
        project: currentProject,
        rubro: selectedRubro,
        values,
      });

      setProgressRecords((previousRecords) => [nextRecord, ...previousRecords]);
      setRubrosByProject((previousRubros) => updateRubrosAfterProgress(previousRubros, currentProjectId, selectedRubroId, Number(values.quantity)));
      setLastRecord(nextRecord);
      setValues(clearProgressForm());
      setErrors({});
      setSubmitStatus('success');
    }, 650);
  };

  const handleRegisterAnother = () => {
    setSubmitStatus('idle');
    setValues(clearProgressForm());
    setErrors({});
  };

  if (!isResident) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Avance de obra"
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
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                El registro móvil de avance de obra está disponible para el rol Residente. Vuelva al panel principal para continuar dentro de una vista autorizada.
              </p>
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
        currentAreaLabel="Avance de obra"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="progress"
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
            {loadStatus === 'loading' ? <ProgressLoadingState /> : null}

            {loadStatus === 'error' ? (
              <ProgressErrorState
                title="No fue posible cargar el avance de obra"
                description="Revise la conexión o reintente la carga para continuar con el registro desde campo."
                onRetry={() => setRetryCount((value) => value + 1)}
                onGoHome={onGoHome}
              />
            ) : null}

            {loadStatus === 'ready' ? (
              <>
                {assignedProjects.length ? (
                  <ProjectContextHeader
                    currentProject={currentProject}
                    hasMultipleProjects={assignedProjects.length > 1}
                    pendingSyncCount={progressSummary.pendingSync}
                    onGoHome={onGoHome}
                    onOpenProjectModal={() => setActiveOverlay({ type: 'change-project' })}
                  />
                ) : (
                  <EmptyState
                    title="No tiene proyectos asignados en este momento"
                    description="Aún no hay proyectos disponibles para registrar avance. Vuelva al panel principal para continuar sin quedar atrapado."
                    actionLabel="Volver al panel principal"
                    onAction={onGoHome}
                  />
                )}

                {assignedProjects.length ? <ProgressSummaryCard summary={progressSummary} /> : null}

                {assignedProjects.length && !activeRubros.length ? (
                  <EmptyState
                    title="No hay rubros disponibles para este proyecto"
                    description="Cambie de proyecto o vuelva al panel principal. El sistema no permitirá registrar avance hasta tener un rubro activo." 
                    actionLabel={assignedProjects.length > 1 ? 'Cambiar proyecto' : 'Volver al panel principal'}
                    onAction={assignedProjects.length > 1 ? () => setActiveOverlay({ type: 'change-project' }) : onGoHome}
                  />
                ) : null}

                {assignedProjects.length && activeRubros.length ? (
                  <>
                    <RubroSelector rubros={activeRubros} selectedRubroId={selectedRubroId} onSelect={setSelectedRubroId} />

                    {selectedRubro ? <RubroInfoCard rubro={selectedRubro} /> : (
                      <EmptyState
                        title="Seleccione un rubro para continuar"
                        description="El proyecto ya está definido. Elija un rubro activo para revisar su contexto y registrar el avance físico."
                      />
                    )}

                    {hasDraft && submitStatus !== 'success' ? (
                      <ProgressDraftPanel selectedRubro={selectedRubro} values={values} onReset={resetDraft} />
                    ) : null}

                    {submitStatus === 'error' ? (
                      <ProgressErrorState
                        title="No fue posible registrar el avance"
                        description="Revise los datos del formulario y reintente el envío cuando el contexto del proyecto y rubro esté correcto."
                        onDismiss={() => setSubmitStatus('idle')}
                      />
                    ) : null}

                    {submitStatus === 'success' && lastRecord ? (
                      <ProgressSuccessState
                        record={lastRecord}
                        onRegisterAnother={handleRegisterAnother}
                        onGoHome={onGoHome}
                        onContinueEvidence={canContinueEvidence ? () => onOpenModule('evidence', { advanceRecord: lastRecord, source: 'progress' }) : undefined}
                      />
                    ) : (
                      <ProgressForm
                        values={values}
                        errors={errors}
                        selectedRubro={selectedRubro}
                        budgetValidation={budgetValidation}
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
        <ChangeProjectModal
          projects={assignedProjects}
          currentProjectId={currentProjectId}
          hasDraft={hasDraft}
          onCancel={() => setActiveOverlay(null)}
          onConfirm={handleConfirmProject}
        />
      ) : null}

      {activeOverlay?.type === 'over-budget' && selectedRubro ? (
        <OverBudgetModal
          rubro={selectedRubro}
          quantity={Number(values.quantity || 0)}
          validation={budgetValidation}
          onClose={() => setActiveOverlay(null)}
        />
      ) : null}
    </div>
  );
}