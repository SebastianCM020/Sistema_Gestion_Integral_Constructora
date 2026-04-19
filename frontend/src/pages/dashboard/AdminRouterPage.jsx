import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
import { getUserFromEmail } from '../../data/icaroData';

import { AdminUsersPermissionsView } from '../../views/admin/AdminUsersPermissionsView';
import { ProjectAccessAssignmentView } from '../../views/admin/ProjectAccessAssignmentView';
import { ProjectsManagementView } from '../../views/admin/ProjectsManagementView';
import { ProjectRubrosView } from '../../views/admin/ProjectRubrosView';
import { MaterialsCatalogView } from '../../views/admin/MaterialsCatalogView';

export default function AdminRouterPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  let currentUser = getUserFromEmail(user.email);
  if (!currentUser) {
    currentUser = {
      ...getUserFromEmail('admin@icaro.dev'),
      name: `${user.nombre} ${user.apellido}`,
      email: user.email,
      roleName: user.rol,
      projectLabel: 'Administración Central',
    };
  }

  const goHome = () => navigate('/dashboard');
  const openProfile = () => navigate('/module/profile');
  const openModule = (id) => navigate(`/module/${id}`);
  const openAdmin = (sec) => navigate(`/admin/${sec}`);

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
