import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
import { DashboardView } from '../../views/DashboardView';
import { getUserFromEmail } from '../../data/icaroData';

export default function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Mapear nuestro JWT a la estructura pesada del Prototipo Visual
  // usando explícitamente user.rol que viene desde la Base de Datos.
  let mockUserContext = getUserFromEmail(user.email, user.rol);
  
  if (!mockUserContext) {
    // Si entró con isaac.castro, construimos datos default basados en su Rol Administrativo
    mockUserContext = {
      ...getUserFromEmail('admin@icaro.dev'), // Plantilla base
      name: `${user.nombre} ${user.apellido}`,
      email: user.email,
      roleName: user.rol,
      projectLabel: 'Administración Central',
    };
  }

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
