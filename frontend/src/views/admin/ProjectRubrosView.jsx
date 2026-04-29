import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { AdminErrorState } from '../../components/admin/AdminErrorState.jsx';
import { AdminSectionTabs } from '../../components/admin/AdminSectionTabs.jsx';
import { RubroHeader } from '../../components/admin/RubroHeader.jsx';
import { RubroSummaryCards } from '../../components/admin/RubroSummaryCards.jsx';
import { RubrosFilters } from '../../components/admin/RubrosFilters.jsx';
import { RubrosTableSkeleton } from '../../components/admin/RubrosTableSkeleton.jsx';
import { RubrosTable } from '../../components/admin/RubrosTable.jsx';
import { RubrosMobileList } from '../../components/admin/RubrosMobileList.jsx';
import { RubroFormModal } from '../../components/admin/RubroFormModal.jsx';
import { RubroDetailDrawer } from '../../components/admin/RubroDetailDrawer.jsx';
import { CsvImportModal } from '../../components/admin/CsvImportModal.jsx';
import { bulkCreateRubros, fetchRubrosByProject } from '../../services/rubros.service.js';
import { fetchProjects } from '../../services/projects.service.js';
import { mockProjects } from '../../data/mockProjects.js';
import { mockRubros } from '../../data/mockRubros.js';
import { mockCsvImportResults } from '../../data/mockCsvImportResults.js';
import {
  createRubroPayload,
  defaultRubroFilters,
  filterRubros,
  getProjectRubros,
  getRubroSummary,
  getRubroUnits,
  sortRubros,
  updateRubroPayload,
} from '../../utils/rubroHelpers.js';
import { getModulesForUser } from '../../data/icaroData.js';

export function ProjectRubrosView({
  currentUser,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
  onOpenAdminSection,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [importResults, setImportResults] = useState(mockCsvImportResults);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [filters, setFilters] = useState(defaultRubroFilters);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAdmin = currentUser.roleId === 'admin' || currentUser.roleName === 'Administrador del Sistema';
  const currentProject = projects.find((project) => project.id === selectedProjectId) ?? null;

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadStatus('loading');
      try {
        const projectsData = await fetchProjects();
        setProjects(projectsData);
        
        if (projectsData.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectsData[0].id);
        }
        
        // Simular carga de rubros (esto debería ser una llamada a la API en el futuro)
        setRubros(mockRubros);
        setLoadStatus('ready');
      } catch (error) {
        console.error('Error loading rubros view data:', error);
        setLoadStatus('error');
      }
    };

    if (isAdmin) {
      loadInitialData();
    } else {
      setLoadStatus('ready');
    }
  }, [isAdmin, retryCount]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const currentProjectRubros = useMemo(() => getProjectRubros(rubros, selectedProjectId), [rubros, selectedProjectId]);
  const visibleRubros = useMemo(() => sortRubros(filterRubros(currentProjectRubros, filters), filters.sortBy), [currentProjectRubros, filters]);
  const units = useMemo(() => getRubroUnits(currentProjectRubros), [currentProjectRubros]);
  const latestImportResult = useMemo(
    () => importResults.filter((result) => result.projectId === selectedProjectId).sort((left, right) => new Date(right.finishedAt).getTime() - new Date(left.finishedAt).getTime())[0] ?? null,
    [importResults, selectedProjectId]
  );
  const summary = useMemo(() => getRubroSummary(currentProjectRubros, latestImportResult), [currentProjectRubros, latestImportResult]);

  const handleFilterChange = (field, value) => {
    setFilters((previousFilters) => ({ ...previousFilters, [field]: value }));
  };

  const openOverlay = (type, rubro = null) => {
    setActiveOverlay({ type, rubro });
  };

  const closeOverlay = () => {
    setActiveOverlay(null);
  };

  const handleSaveRubro = (values) => {
    if (!currentProject) {
      return;
    }

    if (activeOverlay?.type === 'edit' && activeOverlay.rubro) {
      setRubros((previousRubros) =>
        previousRubros.map((rubro) =>
          rubro.id === activeOverlay.rubro.id ? updateRubroPayload(rubro, values, currentProject) : rubro
        )
      );
      setFeedback({ tone: 'success', message: 'Rubro actualizado correctamente.' });
    } else {
      setRubros((previousRubros) => [createRubroPayload(values, currentProject), ...previousRubros]);
      setFeedback({ tone: 'success', message: 'Rubro creado correctamente.' });
    }

    closeOverlay();
  };

  const handleImportComplete = async (result, importedRubros) => {
    if (result.status === 'failed' || !importedRubros.length) {
      setFeedback({ tone: 'error', message: 'No se encontraron rubros válidos para importar.' });
      return;
    }

    try {
      setLoadStatus('loading');
      await bulkCreateRubros(selectedProjectId, importedRubros);
      
      // Recargar rubros del proyecto tras la importación
      const updatedRubros = await fetchRubrosByProject(selectedProjectId);
      setRubros(updatedRubros);
      
      setImportResults((previousResults) => [result, ...previousResults]);
      setFeedback({
        tone: result.status === 'failed' ? 'neutral' : 'success',
        message: `La importación finalizó correctamente. Se guardaron ${importedRubros.length} rubros en el proyecto.`,
      });
      setLoadStatus('ready');
    } catch (error) {
      console.error('Error in bulk import:', error);
      setFeedback({ tone: 'error', message: 'Error al guardar los rubros en la base de datos.' });
      setLoadStatus('ready');
    }
  };

  // Efecto para cargar rubros cuando cambia el proyecto seleccionado
  useEffect(() => {
    const loadProjectRubros = async () => {
      if (!selectedProjectId) return;
      try {
        const data = await fetchRubrosByProject(selectedProjectId);
        setRubros(data);
      } catch (error) {
        console.error('Error loading rubros for project:', selectedProjectId);
      }
    };
    
    if (loadStatus === 'ready') {
      loadProjectRubros();
    }
  }, [selectedProjectId, loadStatus === 'ready']);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Rubros y carga masiva"
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
                La gestión de rubros y carga masiva es exclusiva del Administrador del Sistema. Vuelva al panel principal para continuar sin perder el contexto de su sesión.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Volver al panel principal</button>
                <button onClick={() => onOpenAdminSection('users')} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">Ir a administración</button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const isNoResults = currentProjectRubros.length > 0 && visibleRubros.length === 0;
  const isTrulyEmpty = currentProjectRubros.length === 0;

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Rubros y carga masiva"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="rubros"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0 space-y-6">
          <AdminSectionTabs activeTab="rubros" onChange={onOpenAdminSection} />
          <RubroHeader
            currentProjectId={selectedProjectId}
            projects={projects}
            onChangeProject={setSelectedProjectId}
            onGoHome={onGoHome}
            onGoAdmin={() => onOpenAdminSection('users')}
            onCreate={() => openOverlay('create')}
            onImport={() => openOverlay('import')}
          />

          {feedback ? (
            <div className={`rounded-[12px] border px-4 py-3 text-sm font-medium shadow-sm ${feedback.tone === 'success' ? 'border-[#16A34A]/20 bg-[#16A34A]/10 text-[#166534]' : feedback.tone === 'neutral' ? 'border-[#D1D5DB] bg-white text-[#2F3A45]' : 'border-[#D1D5DB] bg-white text-[#2F3A45]'}`}>
              {feedback.message}
            </div>
          ) : null}

          {loadStatus === 'loading' ? <RubrosTableSkeleton /> : null}
          {loadStatus === 'error' ? <AdminErrorState onRetry={() => setRetryCount((value) => value + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              <RubroSummaryCards summary={summary} />
              <RubrosFilters filters={filters} units={units} onChange={handleFilterChange} onReset={() => setFilters(defaultRubroFilters)} />

              <section className="space-y-4">
                <SectionHeader
                  title="Listado de rubros"
                  description="Visualice rubros, estado y datos económicos del proyecto activo sin perder el contexto operativo de administración."
                />

                {isTrulyEmpty ? (
                  <EmptyState
                    title="No hay rubros registrados todavía"
                    description="Cree el primer rubro del proyecto activo o importe un archivo CSV para comenzar la carga masiva."
                    actionLabel="Nuevo rubro"
                    onAction={() => openOverlay('create')}
                  />
                ) : isNoResults ? (
                  <EmptyState
                    title="No se encontraron rubros con esos filtros"
                    description="Ajuste la búsqueda, cambie los filtros aplicados o vuelva al listado completo para continuar."
                    actionLabel="Limpiar filtros"
                    onAction={() => setFilters(defaultRubroFilters)}
                  />
                ) : (
                  <>
                    <RubrosTable rubros={visibleRubros} onView={(rubro) => openOverlay('detail', rubro)} onEdit={(rubro) => openOverlay('edit', rubro)} />
                    <RubrosMobileList rubros={visibleRubros} onView={(rubro) => openOverlay('detail', rubro)} onEdit={(rubro) => openOverlay('edit', rubro)} />
                  </>
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>

      {activeOverlay?.type === 'create' || activeOverlay?.type === 'edit' ? (
        <RubroFormModal
          rubro={activeOverlay.rubro ?? null}
          rubros={rubros}
          currentProject={currentProject}
          onCancel={closeOverlay}
          onSave={handleSaveRubro}
        />
      ) : null}

      {activeOverlay?.type === 'detail' && activeOverlay.rubro ? (
        <RubroDetailDrawer rubro={activeOverlay.rubro} onClose={closeOverlay} onEdit={() => openOverlay('edit', activeOverlay.rubro)} />
      ) : null}

      {activeOverlay?.type === 'import' && currentProject ? (
        <CsvImportModal currentProject={currentProject} existingRubros={rubros} onCancel={closeOverlay} onComplete={handleImportComplete} />
      ) : null}
    </div>
  );
}