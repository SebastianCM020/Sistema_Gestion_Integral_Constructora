import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Plus, ShieldAlert, Users } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { AdminErrorState } from '../../components/admin/AdminErrorState.jsx';
import { AdminSectionTabs } from '../../components/admin/AdminSectionTabs.jsx';
import { UserTableSkeleton } from '../../components/admin/UserTableSkeleton.jsx';
import { UserSummaryCards } from '../../components/admin/UserSummaryCards.jsx';
import { UserFilters } from '../../components/admin/UserFilters.jsx';
import { UserTable } from '../../components/admin/UserTable.jsx';
import { UserTableMobile } from '../../components/admin/UserTableMobile.jsx';
import { UserFormModal } from '../../components/admin/UserFormModal.jsx';
import { RoleAssignmentModal } from '../../components/admin/RoleAssignmentModal.jsx';
import { AccountStatusModal } from '../../components/admin/AccountStatusModal.jsx';
import { UserDetailDrawer } from '../../components/admin/UserDetailDrawer.jsx';
import { availableRoles, mockUsers } from '../../data/mockUsers.js';
import {
  createUserPayload,
  defaultUserFilters,
  filterUsers,
  getUserSummary,
  sortUsers,
  updateUserPayload,
} from '../../utils/adminUserHelpers.js';
import { getModulesForUser } from '../../data/icaroData.js';

export function AdminUsersPermissionsView({ currentUser, onGoHome, onOpenProfile, onLogout, onOpenModule, onOpenAdminSection }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [users, setUsers] = useState(mockUsers);
  const [filters, setFilters] = useState(defaultUserFilters);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAdmin = currentUser.roleName === 'Administrador del Sistema';

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.adminUsersShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.adminUsersShouldFail, retryCount]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const visibleUsers = useMemo(() => sortUsers(filterUsers(users, filters), filters.sortBy), [users, filters]);
  const summary = useMemo(() => getUserSummary(users), [users]);

  const handleFilterChange = (field, value) => {
    setFilters((previousFilters) => ({ ...previousFilters, [field]: value }));
  };

  const openOverlay = (type, user = null) => {
    setActiveOverlay({ type, user });
  };

  const closeOverlay = () => {
    setActiveOverlay(null);
  };

  const handleSaveUser = (formValues) => {
    if (activeOverlay?.type === 'edit' && activeOverlay.user) {
      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === activeOverlay.user.id ? updateUserPayload(user, formValues) : user
        )
      );
      setFeedback({ tone: 'success', message: 'Usuario actualizado correctamente.' });
    } else {
      setUsers((previousUsers) => [createUserPayload(formValues), ...previousUsers]);
      setFeedback({ tone: 'success', message: 'Usuario creado correctamente.' });
    }

    closeOverlay();
  };

  const handleRoleChange = (newRole) => {
    const targetUser = activeOverlay?.user;
    if (!targetUser) {
      return;
    }

    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === targetUser.id
          ? { ...user, role: newRole, updatedAt: new Date().toISOString() }
          : user
      )
    );
    setFeedback({ tone: 'success', message: 'Rol actualizado correctamente.' });
    closeOverlay();
  };

  const handleToggleStatus = () => {
    const targetUser = activeOverlay?.user;
    if (!targetUser) {
      return;
    }

    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === targetUser.id
          ? { ...user, isActive: !user.isActive, updatedAt: new Date().toISOString() }
          : user
      )
    );
    setFeedback({
      tone: 'success',
      message: targetUser.isActive ? 'La cuenta fue desactivada.' : 'La cuenta fue activada.',
    });
    closeOverlay();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Administración de usuarios y permisos"
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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626] mb-5">
                <ShieldAlert size={28} />
              </div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">No tiene acceso a esta sección</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                La administración de usuarios y permisos es exclusiva del Administrador del Sistema. Vuelva al panel principal para continuar sin perder el contexto de su sesión.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
                  Volver al panel principal
                </button>
                <button onClick={onOpenProfile} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
                  Abrir mi perfil
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const isNoResults = users.length > 0 && visibleUsers.length === 0;
  const isTrulyEmpty = users.length === 0;

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Administración de usuarios y permisos"
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

        <main className="space-y-6 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Inicio</button>
            <ChevronRight size={14} />
            <button type="button" onClick={() => onOpenAdminSection('users')} className="hover:text-[#1F4E79]">Administración</button>
            <ChevronRight size={14} />
            <span className="font-medium text-[#1F4E79]">Usuarios y permisos</span>
          </div>

          <AdminSectionTabs activeTab="users" onChange={onOpenAdminSection} />

          <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
                  <Users size={22} />
                </div>
                <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Administración de usuarios y permisos</h1>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">Gestione usuarios y niveles de acceso del sistema con una operación clara, segura y preparada para futura integración con API REST.</p>
              </div>
              <button
                type="button"
                onClick={() => openOverlay('create')}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]"
              >
                <Plus size={18} />
                Nuevo usuario
              </button>
            </div>
          </section>

          {feedback ? (
            <div className={`rounded-[12px] border px-4 py-3 text-sm font-medium shadow-sm ${feedback.tone === 'success' ? 'border-[#16A34A]/20 bg-[#16A34A]/10 text-[#166534]' : 'border-[#D1D5DB] bg-white text-[#2F3A45]'}`}>
              {feedback.message}
            </div>
          ) : null}

          {loadStatus === 'loading' ? <UserTableSkeleton /> : null}
          {loadStatus === 'error' ? <AdminErrorState onRetry={() => setRetryCount((value) => value + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              <UserSummaryCards summary={summary} />
              <UserFilters
                filters={filters}
                availableRoles={availableRoles}
                onChange={handleFilterChange}
                onReset={() => setFilters(defaultUserFilters)}
              />

              <section className="space-y-4">
                <SectionHeader
                  title="Listado de usuarios"
                  description="Visualice estado, rol y acciones seguras por cuenta sin perder contexto de administración."
                />

                {isTrulyEmpty ? (
                  <EmptyState
                    title="No hay usuarios registrados todavía"
                    description="Cree el primer usuario para comenzar a gestionar accesos y permisos del sistema."
                    actionLabel="Crear primer usuario"
                    onAction={() => openOverlay('create')}
                  />
                ) : isNoResults ? (
                  <EmptyState
                    title="No se encontraron usuarios con esos filtros"
                    description="Ajuste la búsqueda, cambie los filtros aplicados o vuelva al listado completo para continuar."
                    actionLabel="Limpiar filtros"
                    onAction={() => setFilters(defaultUserFilters)}
                  />
                ) : (
                  <>
                    <UserTable
                      users={visibleUsers}
                      onView={(user) => openOverlay('detail', user)}
                      onEdit={(user) => openOverlay('edit', user)}
                      onChangeRole={(user) => openOverlay('role', user)}
                      onToggleStatus={(user) => openOverlay('status', user)}
                    />
                    <UserTableMobile
                      users={visibleUsers}
                      onView={(user) => openOverlay('detail', user)}
                      onEdit={(user) => openOverlay('edit', user)}
                      onChangeRole={(user) => openOverlay('role', user)}
                      onToggleStatus={(user) => openOverlay('status', user)}
                    />
                  </>
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>

      {activeOverlay?.type === 'create' || activeOverlay?.type === 'edit' ? (
        <UserFormModal
          user={activeOverlay.user ?? null}
          users={users}
          availableRoles={availableRoles}
          onCancel={closeOverlay}
          onSave={handleSaveUser}
        />
      ) : null}

      {activeOverlay?.type === 'role' && activeOverlay.user ? (
        <RoleAssignmentModal
          user={activeOverlay.user}
          availableRoles={availableRoles}
          onCancel={closeOverlay}
          onSave={handleRoleChange}
        />
      ) : null}

      {activeOverlay?.type === 'status' && activeOverlay.user ? (
        <AccountStatusModal
          user={activeOverlay.user}
          onCancel={closeOverlay}
          onConfirm={handleToggleStatus}
        />
      ) : null}

      {activeOverlay?.type === 'detail' && activeOverlay.user ? (
        <UserDetailDrawer
          user={activeOverlay.user}
          onClose={closeOverlay}
          onEdit={() => openOverlay('edit', activeOverlay.user)}
          onChangeRole={() => openOverlay('role', activeOverlay.user)}
          onToggleStatus={() => openOverlay('status', activeOverlay.user)}
        />
      ) : null}
    </div>
  );
}