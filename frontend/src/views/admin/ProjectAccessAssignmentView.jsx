import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, KeyRound, Plus, ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { AdminErrorState } from '../../components/admin/AdminErrorState.jsx';
import { AdminSectionTabs } from '../../components/admin/AdminSectionTabs.jsx';
import { ProjectAccessSummaryCards } from '../../components/admin/ProjectAccessSummaryCards.jsx';
import { ProjectAccessFilters } from '../../components/admin/ProjectAccessFilters.jsx';
import { ProjectAccessTableSkeleton } from '../../components/admin/ProjectAccessTableSkeleton.jsx';
import { ProjectAccessTable } from '../../components/admin/ProjectAccessTable.jsx';
import { ProjectAccessMobileList } from '../../components/admin/ProjectAccessMobileList.jsx';
import { ProjectAccessFormModal } from '../../components/admin/ProjectAccessFormModal.jsx';
import { ProjectAccessModeModal } from '../../components/admin/ProjectAccessModeModal.jsx';
import { ProjectAccessDatesModal } from '../../components/admin/ProjectAccessDatesModal.jsx';
import { ProjectAccessDetailDrawer } from '../../components/admin/ProjectAccessDetailDrawer.jsx';
import { availableProjects, mockProjectAssignments } from '../../data/mockProjectAssignments.js';
import { mockUsers } from '../../data/mockUsers.js';
import {
  createProjectAssignmentPayload,
  defaultProjectAccessFilters,
  filterProjectAssignments,
  getProjectAssignmentSummary,
  sortProjectAssignments,
  updateProjectAccessDatesPayload,
  updateProjectAccessModePayload,
  updateProjectAssignmentPayload,
} from '../../utils/projectAccessHelpers.js';
import { getModulesForUser } from '../../data/icaroData.js';

export function ProjectAccessAssignmentView({
  currentUser,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
  onOpenAdminSection,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [assignments, setAssignments] = useState(mockProjectAssignments);
  const [filters, setFilters] = useState(defaultProjectAccessFilters);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAdmin = currentUser.roleName === 'Administrador del Sistema';
  const roleOptions = useMemo(() => Array.from(new Set(mockUsers.map((user) => user.role))).sort((left, right) => left.localeCompare(right, 'es')), []);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.adminUsersShouldFail ? 'error' : 'ready');
    }, 700);

    return () => window.clearTimeout(timer);
  }, [currentUser.adminUsersShouldFail, retryCount]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const visibleAssignments = useMemo(
    () => sortProjectAssignments(filterProjectAssignments(assignments, filters), filters.sortBy),
    [assignments, filters]
  );
  const summary = useMemo(() => getProjectAssignmentSummary(assignments), [assignments]);

  const handleFilterChange = (field, value) => {
    setFilters((previousFilters) => ({ ...previousFilters, [field]: value }));
  };

  const openOverlay = (type, assignment = null) => {
    setActiveOverlay({ type, assignment });
  };

  const closeOverlay = () => {
    setActiveOverlay(null);
  };

  const handleSaveAssignment = (values) => {
    if (activeOverlay?.type === 'edit' && activeOverlay.assignment) {
      setAssignments((previousAssignments) =>
        previousAssignments.map((assignment) =>
          assignment.id === activeOverlay.assignment.id
            ? updateProjectAssignmentPayload(assignment, values, mockUsers, availableProjects)
            : assignment
        )
      );
      setFeedback({ tone: 'success', message: 'Asignación actualizada correctamente.' });
    } else {
      setAssignments((previousAssignments) => [createProjectAssignmentPayload(values, mockUsers, availableProjects), ...previousAssignments]);
      setFeedback({ tone: 'success', message: 'Asignación creada correctamente.' });
    }

    closeOverlay();
  };

  const handleSaveMode = (accessMode) => {
    const targetAssignment = activeOverlay?.assignment;
    if (!targetAssignment) {
      return;
    }

    setAssignments((previousAssignments) =>
      previousAssignments.map((assignment) =>
        assignment.id === targetAssignment.id ? updateProjectAccessModePayload(assignment, accessMode) : assignment
      )
    );
    setFeedback({ tone: 'success', message: 'Modo de acceso actualizado correctamente.' });
    closeOverlay();
  };

  const handleSaveDates = (values) => {
    const targetAssignment = activeOverlay?.assignment;
    if (!targetAssignment) {
      return;
    }

    setAssignments((previousAssignments) =>
      previousAssignments.map((assignment) =>
        assignment.id === targetAssignment.id ? updateProjectAccessDatesPayload(assignment, values) : assignment
      )
    );
    setFeedback({ tone: 'success', message: 'La vigencia fue actualizada.' });
    closeOverlay();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Asignación de acceso por proyecto"
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
                La asignación de acceso por proyecto es exclusiva del Administrador del Sistema. Vuelva al panel principal para continuar sin perder el contexto de su sesión.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
                  Volver al panel principal
                </button>
                <button onClick={() => onOpenAdminSection('users')} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
                  Ir a usuarios y permisos
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const isNoResults = assignments.length > 0 && visibleAssignments.length === 0;
  const isTrulyEmpty = assignments.length === 0;

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Asignación de acceso por proyecto"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="administration"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Inicio</button>
            <ChevronRight size={14} />
            <button type="button" onClick={() => onOpenAdminSection('users')} className="hover:text-[#1F4E79]">Administración</button>
            <ChevronRight size={14} />
            <span className="font-medium text-[#1F4E79]">Asignación de acceso por proyecto</span>
          </div>

          <AdminSectionTabs activeTab="project-access" onChange={onOpenAdminSection} />

          <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
                  <KeyRound size={22} />
                </div>
                <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Asignación de acceso por proyecto</h1>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">Gestione el acceso de usuarios a proyectos con vigencia, modo operativo y trazabilidad lista para futura integración con API REST.</p>
              </div>
              <button
                type="button"
                onClick={() => openOverlay('create')}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]"
              >
                <Plus size={18} />
                Nueva asignación
              </button>
            </div>
          </section>

          {feedback ? (
            <div className={`rounded-[12px] border px-4 py-3 text-sm font-medium shadow-sm ${feedback.tone === 'success' ? 'border-[#16A34A]/20 bg-[#16A34A]/10 text-[#166534]' : 'border-[#D1D5DB] bg-white text-[#2F3A45]'}`}>
              {feedback.message}
            </div>
          ) : null}

          {loadStatus === 'loading' ? <ProjectAccessTableSkeleton /> : null}
          {loadStatus === 'error' ? <AdminErrorState onRetry={() => setRetryCount((value) => value + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              <ProjectAccessSummaryCards summary={summary} />
              <ProjectAccessFilters
                filters={filters}
                projects={availableProjects}
                roles={roleOptions}
                onChange={handleFilterChange}
                onReset={() => setFilters(defaultProjectAccessFilters)}
              />

              <section className="space-y-4">
                <SectionHeader
                  title="Listado de asignaciones"
                  description="Visualice usuario, proyecto, vigencia y modo de acceso sin perder el contexto operativo de administración."
                />

                {isTrulyEmpty ? (
                  <EmptyState
                    title="No hay asignaciones registradas todavía"
                    description="Cree la primera asignación para comenzar a controlar el acceso de usuarios por proyecto."
                    actionLabel="Crear asignación"
                    onAction={() => openOverlay('create')}
                  />
                ) : isNoResults ? (
                  <EmptyState
                    title="No se encontraron asignaciones con esos filtros"
                    description="Ajuste la búsqueda, cambie los filtros aplicados o vuelva al listado completo para continuar."
                    actionLabel="Limpiar filtros"
                    onAction={() => setFilters(defaultProjectAccessFilters)}
                  />
                ) : (
                  <>
                    <ProjectAccessTable
                      assignments={visibleAssignments}
                      onView={(assignment) => openOverlay('detail', assignment)}
                      onEdit={(assignment) => openOverlay('edit', assignment)}
                      onChangeMode={(assignment) => openOverlay('mode', assignment)}
                      onAdjustDates={(assignment) => openOverlay('dates', assignment)}
                    />
                    <ProjectAccessMobileList
                      assignments={visibleAssignments}
                      onView={(assignment) => openOverlay('detail', assignment)}
                      onEdit={(assignment) => openOverlay('edit', assignment)}
                      onChangeMode={(assignment) => openOverlay('mode', assignment)}
                      onAdjustDates={(assignment) => openOverlay('dates', assignment)}
                    />
                  </>
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>

      {activeOverlay?.type === 'create' || activeOverlay?.type === 'edit' ? (
        <ProjectAccessFormModal
          assignment={activeOverlay.assignment ?? null}
          assignments={assignments}
          users={mockUsers.filter((user) => user.isActive)}
          projects={availableProjects}
          onCancel={closeOverlay}
          onSave={handleSaveAssignment}
        />
      ) : null}

      {activeOverlay?.type === 'mode' && activeOverlay.assignment ? (
        <ProjectAccessModeModal assignment={activeOverlay.assignment} onCancel={closeOverlay} onSave={handleSaveMode} />
      ) : null}

      {activeOverlay?.type === 'dates' && activeOverlay.assignment ? (
        <ProjectAccessDatesModal assignment={activeOverlay.assignment} onCancel={closeOverlay} onSave={handleSaveDates} />
      ) : null}

      {activeOverlay?.type === 'detail' && activeOverlay.assignment ? (
        <ProjectAccessDetailDrawer
          assignment={activeOverlay.assignment}
          onClose={closeOverlay}
          onEdit={() => openOverlay('edit', activeOverlay.assignment)}
          onChangeMode={() => openOverlay('mode', activeOverlay.assignment)}
          onAdjustDates={() => openOverlay('dates', activeOverlay.assignment)}
        />
      ) : null}
    </div>
  );
}