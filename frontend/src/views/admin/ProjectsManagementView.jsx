import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { AdminErrorState } from '../../components/admin/AdminErrorState.jsx';
import { AdminSectionTabs } from '../../components/admin/AdminSectionTabs.jsx';
import { ProjectHeader } from '../../components/admin/ProjectHeader.jsx';
import { ProjectSummaryCards } from '../../components/admin/ProjectSummaryCards.jsx';
import { ProjectsFilters } from '../../components/admin/ProjectsFilters.jsx';
import { ProjectsTableSkeleton } from '../../components/admin/ProjectsTableSkeleton.jsx';
import { ProjectsTable } from '../../components/admin/ProjectsTable.jsx';
import { ProjectsMobileList } from '../../components/admin/ProjectsMobileList.jsx';
import { ProjectFormModal } from '../../components/admin/ProjectFormModal.jsx';
import { ProjectStatusModal } from '../../components/admin/ProjectStatusModal.jsx';
import { ProjectParametersPanel } from '../../components/admin/ProjectParametersPanel.jsx';
import { ProjectDetailDrawer } from '../../components/admin/ProjectDetailDrawer.jsx';
import { fetchProjects, createProject, updateProject } from '../../services/projects.service.js';
import { getUsers } from '../../services/usersApi.js';
import { mockProjectParameters } from '../../data/mockProjectParameters.js';
import {
  attachProjectParameters,
  createProjectPayload,
  defaultProjectFilters,
  filterProjects,
  getProjectParametersById,
  getProjectSummary,
  sortProjects,
  updateProjectParametersPayload,
  updateProjectPayload,
  updateProjectStatusPayload,
} from '../../utils/projectHelpers.js';
import { getModulesForUser } from '../../data/icaroData.js';

export function ProjectsManagementView({
  currentUser,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
  onOpenAdminSection,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [potentialResponsibles, setPotentialResponsibles] = useState([]);
  const [projectParameters, setProjectParameters] = useState(mockProjectParameters);
  const [filters, setFilters] = useState(defaultProjectFilters);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  // Usar roleId (ya normalizado por icaroData) en lugar de roleName (frágil a cambios de texto)
  const isAdmin = currentUser.roleId === 'admin';
  const managerOptions = useMemo(() => 
    potentialResponsibles.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` })), 
    [potentialResponsibles]
  );

  useEffect(() => {
    const loadData = async () => {
      setLoadStatus('loading');
      try {
        const [projectsData, usersResponse] = await Promise.all([
          fetchProjects(),
          getUsers()
        ]);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setPotentialResponsibles(Array.isArray(usersResponse?.data) ? usersResponse.data : []);
        setLoadStatus('ready');
      } catch (error) {
        console.error('Error loading projects data:', error);
        setLoadStatus('error');
      }
    };

    if (isAdmin) {
      loadData();
    } else {
      // Si no es admin, salir del estado loading para que el bloque de acceso denegado se muestre de inmediato
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

  const enrichedProjects = useMemo(() => attachProjectParameters(projects || [], projectParameters || []), [projects, projectParameters]);
  const visibleProjects = useMemo(() => sortProjects(filterProjects(enrichedProjects, filters), filters.sortBy), [enrichedProjects, filters]);
  const summary = useMemo(() => getProjectSummary(projects || []), [projects]);

  const handleFilterChange = (field, value) => {
    setFilters((previousFilters) => ({ ...previousFilters, [field]: value }));
  };

  const openOverlay = (type, project = null) => {
    setActiveOverlay({ type, project });
  };

  const closeOverlay = () => {
    setActiveOverlay(null);
  };

  const handleSaveProject = async (values) => {
    try {
      if (activeOverlay?.type === 'edit' && activeOverlay.project) {
        const updated = await updateProject(activeOverlay.project.id, values);
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setFeedback({ tone: 'success', message: 'Proyecto actualizado correctamente.' });
      } else {
        const created = await createProject(values);
        setProjects((prev) => [created, ...prev]);
        setFeedback({ tone: 'success', message: 'Proyecto creado correctamente.' });
      }
      closeOverlay();
    } catch (error) {
      setFeedback({ tone: 'error', message: error.response?.data?.error || 'Error al procesar la solicitud.' });
    }
  };

  const handleSaveStatus = async (status) => {
    const targetProject = activeOverlay?.project;
    if (!targetProject) {
      return;
    }

    try {
      // Persistir el cambio de estado en el backend
      const updated = await updateProject(targetProject.id, {
        ...targetProject,
        status: status,
      });

      setProjects((previousProjects) =>
        previousProjects.map((project) => (project.id === updated.id ? updated : project))
      );
      
      setFeedback({ tone: 'success', message: `El estado del proyecto se actualizó a "${status.toUpperCase()}".` });
      closeOverlay();
    } catch (error) {
      console.error('Error updating project status:', error);
      setFeedback({ tone: 'error', message: 'No se pudo actualizar el estado en el servidor.' });
    }
  };

  const handleSaveParameters = (values) => {
    const targetProject = activeOverlay?.project;
    if (!targetProject) {
      return;
    }

    const existingParameters = getProjectParametersById(projectParameters, targetProject.id);
    const nextParameters = updateProjectParametersPayload(existingParameters, targetProject.id, values);

    setProjectParameters((previousParameters) => {
      if (existingParameters) {
        return previousParameters.map((parameter) => parameter.projectId === targetProject.id ? nextParameters : parameter);
      }

      return [...previousParameters, nextParameters];
    });

    setFeedback({ tone: 'success', message: 'Los parámetros fueron guardados.' });
    closeOverlay();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Gestión de proyectos y parametrización"
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
                La gestión de proyectos y parametrización es exclusiva del Administrador del Sistema. Vuelva al panel principal para continuar sin perder el contexto de su sesión.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
                  Volver al panel principal
                </button>
                <button onClick={() => onOpenAdminSection('users')} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
                  Ir a administración
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const isNoResults = projects.length > 0 && visibleProjects.length === 0;
  const isTrulyEmpty = projects.length === 0;

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Gestión de proyectos y parametrización"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="projects"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0 space-y-6">
          <AdminSectionTabs activeTab="projects" onChange={onOpenAdminSection} />
          <ProjectHeader onGoHome={onGoHome} onGoAdmin={() => onOpenAdminSection('users')} onCreate={() => openOverlay('create')} />

          {feedback ? (
            <div className={`rounded-[12px] border px-4 py-3 text-sm font-medium shadow-sm ${feedback.tone === 'success' ? 'border-[#16A34A]/20 bg-[#16A34A]/10 text-[#166534]' : 'border-[#D1D5DB] bg-white text-[#2F3A45]'}`}>
              {feedback.message}
            </div>
          ) : null}

          {loadStatus === 'loading' ? <ProjectsTableSkeleton /> : null}
          {loadStatus === 'error' ? <AdminErrorState onRetry={() => setRetryCount((value) => value + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              <ProjectSummaryCards summary={summary} />
              <ProjectsFilters
                filters={filters}
                managers={managerOptions}
                onChange={handleFilterChange}
                onReset={() => setFilters(defaultProjectFilters)}
              />

              <section className="space-y-4">
                <SectionHeader
                  title="Listado de proyectos"
                  description="Visualice estado, datos administrativos y acceso a parametrización sin perder el contexto operativo de administración."
                />

                {isTrulyEmpty ? (
                  <EmptyState
                    title="No hay proyectos registrados todavía"
                    description="Cree el primer proyecto para comenzar a gestionar datos generales y parámetros operativos del sistema."
                    actionLabel="Crear proyecto"
                    onAction={() => openOverlay('create')}
                  />
                ) : isNoResults ? (
                  <EmptyState
                    title="No se encontraron proyectos con esos filtros"
                    description="Ajuste la búsqueda, cambie los filtros aplicados o vuelva al listado completo para continuar."
                    actionLabel="Limpiar filtros"
                    onAction={() => setFilters(defaultProjectFilters)}
                  />
                ) : (
                  <>
                    <ProjectsTable
                      projects={visibleProjects}
                      onView={(project) => openOverlay('detail', project)}
                      onEdit={(project) => openOverlay('edit', project)}
                      onOpenParameters={(project) => openOverlay('parameters', project)}
                      onChangeStatus={(project) => openOverlay('status', project)}
                    />
                    <ProjectsMobileList
                      projects={visibleProjects}
                      onView={(project) => openOverlay('detail', project)}
                      onEdit={(project) => openOverlay('edit', project)}
                      onOpenParameters={(project) => openOverlay('parameters', project)}
                      onChangeStatus={(project) => openOverlay('status', project)}
                    />
                  </>
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>

      {activeOverlay?.type === 'create' || activeOverlay?.type === 'edit' ? (
        <ProjectFormModal
          project={activeOverlay.project ?? null}
          projects={projects}
          responsibles={potentialResponsibles}
          onCancel={closeOverlay}
          onSave={handleSaveProject}
        />
      ) : null}

      {activeOverlay?.type === 'status' && activeOverlay.project ? (
        <ProjectStatusModal project={activeOverlay.project} onCancel={closeOverlay} onSave={handleSaveStatus} />
      ) : null}

      {activeOverlay?.type === 'parameters' && activeOverlay.project ? (
        <ProjectParametersPanel
          project={activeOverlay.project}
          parameters={getProjectParametersById(projectParameters, activeOverlay.project.id)}
          onCancel={closeOverlay}
          onSave={handleSaveParameters}
        />
      ) : null}

      {activeOverlay?.type === 'detail' && activeOverlay.project ? (
        <ProjectDetailDrawer
          project={activeOverlay.project}
          onClose={closeOverlay}
          onEdit={() => openOverlay('edit', activeOverlay.project)}
          onOpenParameters={() => openOverlay('parameters', activeOverlay.project)}
          onChangeStatus={() => openOverlay('status', activeOverlay.project)}
        />
      ) : null}
    </div>
  );
}