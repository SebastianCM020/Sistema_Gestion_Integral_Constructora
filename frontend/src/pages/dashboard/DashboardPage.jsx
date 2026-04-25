import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
import { DashboardView } from '../../views/DashboardView';
import { getUserFromEmail } from '../../data/icaroData';

export default function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Mapear nuestro JWT a la estructura pesada del Prototipo Visual
  const mockUserContext = {
    ...getUserFromEmail(user.email, user.rol),
    name: `${user.nombre} ${user.apellido}`,
    initials: `${user.nombre[0] || ''}${user.apellido[0] || ''}`.toUpperCase(),
  };

  const handleOpenModule = (moduleId) => {
    // Redireccionamiento universal a rutas react-router
    navigate(`/module/${moduleId}`);
  };

  return (
    <DashboardView
      currentUser={mockUserContext}
      restoredSession={false}
      onOpenProfile={() => console.log('Abriendo perfil')}
      onLogout={logout}
      onOpenModule={handleOpenModule}
      onOpenAdminSection={(section) => navigate(`/admin/${section}`)}
      onGoHome={() => navigate('/dashboard')}
    />
  );
}
