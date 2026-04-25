import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
import { getUserFromEmail } from '../../data/icaroData';
import { AppHeader } from '../../components/ui/AppHeader';

import { AdminErrorState } from '../../components/admin/AdminErrorState';
import { AdminUsersPermissionsView } from '../../views/admin/AdminUsersPermissionsView';
import { ProjectAccessAssignmentView } from '../../views/admin/ProjectAccessAssignmentView';
import { ProjectsManagementView } from '../../views/admin/ProjectsManagementView';
import { ProjectRubrosView } from '../../views/admin/ProjectRubrosView';
import { MaterialsCatalogView } from '../../views/admin/MaterialsCatalogView';

export default function AdminRouterPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const currentUser = {
    ...getUserFromEmail(user.email, user.rol),
    name: `${user.nombre} ${user.apellido}`,
    initials: `${user.nombre[0] || ''}${user.apellido[0] || ''}`.toUpperCase(),
  };

  const goHome = () => navigate('/dashboard');
  const openProfile = () => navigate('/module/profile');
  const openModule = (id) => navigate(`/module/${id}`);
  const openAdmin = (sec) => navigate(`/admin/${sec}`);

  if (currentUser.roleId !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Panel de Administración"
          onGoHome={goHome}
          onOpenProfile={openProfile}
          onLogout={logout}
          onOpenNavigation={() => {}}
        />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <AdminErrorState
            title="Acceso Restringido (Error 403)"
            message="Esta sección está reservada para el Administrador del Sistema. Su rol actual no cuenta con los permisos necesarios para visualizar o modificar esta configuración."
            onAction={goHome}
            actionLabel="Volver al panel"
          />
        </main>
      </div>
    );
  }

  const commonProps = {
    currentUser,
    onGoHome: goHome,
    onOpenProfile: openProfile,
    onLogout: logout,
    onOpenModule: openModule,
    onOpenAdminSection: openAdmin,
  };

  if (section === 'project-access') return <ProjectAccessAssignmentView {...commonProps} />;
  if (section === 'projects') return <ProjectsManagementView {...commonProps} />;
  if (section === 'rubros') return <ProjectRubrosView {...commonProps} />;
  if (section === 'materials') return <MaterialsCatalogView {...commonProps} />;
  
  // Default de admin es usuarios
  return <AdminUsersPermissionsView {...commonProps} />;
}
