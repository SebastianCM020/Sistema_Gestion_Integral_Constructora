import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { LoginView } from './src/views/LoginView.jsx';
import { RecoveryView } from './src/views/RecoveryView.jsx';
import { ProfileView } from './src/views/ProfileView.jsx';
import { DashboardView } from './src/views/DashboardView.jsx';
import { ModuleWorkspaceView } from './src/views/ModuleWorkspaceView.jsx';
import { MobileProgressView } from './src/views/obra/MobileProgressView.jsx';
import { MobileEvidenceSyncView } from './src/views/obra/MobileEvidenceSyncView.jsx';
import { MobileConsumptionView } from './src/views/obra/MobileConsumptionView.jsx';
import { PurchaseRequestsView } from './src/views/compras/PurchaseRequestsView.jsx';
import { RequestReviewView } from './src/views/compras/RequestReviewView.jsx';
import { InventoryReceptionView } from './src/views/inventario/InventoryReceptionView.jsx';
import { InventoryMovementsView } from './src/views/inventario/InventoryMovementsView.jsx';
import { BillingDocumentsView } from './src/views/contabilidad/BillingDocumentsView.jsx';
import { ReportsDashboardView } from './src/views/reportes/ReportsDashboardView.jsx';
import { AuditTraceabilityView } from './src/views/auditoria/AuditTraceabilityView.jsx';
import { ValidationAccessControlView } from './src/views/system/ValidationAccessControlView.jsx';
import { AdminUsersPermissionsView } from './src/views/admin/AdminUsersPermissionsView.jsx';
import { ProjectAccessAssignmentView } from './src/views/admin/ProjectAccessAssignmentView.jsx';
import { ProjectsManagementView } from './src/views/admin/ProjectsManagementView.jsx';
import { ProjectRubrosView } from './src/views/admin/ProjectRubrosView.jsx';
import { MaterialsCatalogView } from './src/views/admin/MaterialsCatalogView.jsx';
import { TechnicalSettingsView } from './src/views/admin/TechnicalSettingsView.jsx';
import { getModuleById, getUserFromEmail } from './src/data/icaroData.js';

const SESSION_KEY = 'icaro.active-user';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-[12px] border border-[#D1D5DB] shadow-sm p-8 text-center">
        <div className="w-14 h-14 rounded-[12px] bg-[#1F4E79] text-white flex items-center justify-center mx-auto mb-5">
          <Building2 size={28} />
        </div>
        <h1 className="text-xl font-semibold text-[#2F3A45] mb-2">ICARO Gestión Integral</h1>
        <p className="text-sm text-gray-500 mb-6">Validando sesión y preparando su entorno operativo.</p>
        <div className="w-8 h-8 border-2 border-[#1F4E79]/20 border-t-[#1F4E79] rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState({ name: 'login' });
  const [currentUser, setCurrentUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const savedSession = window.sessionStorage.getItem(SESSION_KEY);

    if (!savedSession) {
      setIsBootstrapping(false);
      return;
    }

    try {
      const parsedSession = JSON.parse(savedSession);
      const restoredUser = getUserFromEmail(parsedSession.email);

      if (restoredUser) {
        setCurrentUser(restoredUser);
        setRoute({ name: 'dashboard', restoredSession: true });
      }
    } catch {
      window.sessionStorage.removeItem(SESSION_KEY);
    }

    setIsBootstrapping(false);
  }, []);

  const persistSession = (user) => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email }));
  };

  const handleLoginSuccess = (email) => {
    const nextUser = getUserFromEmail(email);
    setCurrentUser(nextUser);
    persistSession(nextUser);
    setRoute({ name: 'dashboard' });
  };

  const goToDashboard = (options = {}) => {
    setRoute({ name: 'dashboard', ...options });
  };

  const openProfile = () => {
    setRoute({ name: 'profile' });
  };

  const openAdminSection = (section = 'users') => {
    if (section === 'technical-settings') {
      setRoute({
        name: 'technical-settings',
        restricted:
          !currentUser?.moduleIds.includes('technical-settings') ||
          currentUser?.roleName !== 'Administrador del Sistema',
      });
      return;
    }

    setRoute({ name: 'admin', section });
  };

  const handleLogout = ({ expired = false } = {}) => {
    window.sessionStorage.removeItem(SESSION_KEY);

    if (expired) {
      window.sessionStorage.setItem('sessionExpired', 'true');
    }

    setCurrentUser(null);
    setRoute({ name: 'login' });
  };

  const openModule = (moduleId, options = {}) => {
    if (!currentUser) {
      setRoute({ name: 'login' });
      return;
    }

    if (moduleId === 'progress') {
      setRoute({ name: 'progress', restricted: !currentUser.moduleIds.includes(moduleId) });
      return;
    }

    if (moduleId === 'evidence') {
      setRoute({
        name: 'evidence',
        restricted: !currentUser.moduleIds.includes(moduleId),
        advanceRecord: options.advanceRecord ?? null,
        source: options.source ?? 'module',
      });
      return;
    }

    if (moduleId === 'consumption') {
      setRoute({
        name: 'consumption',
        restricted: !currentUser.moduleIds.includes(moduleId) || currentUser.roleName !== 'Residente',
      });
      return;
    }

    if (moduleId === 'requirements') {
      setRoute({
        name: 'requirements',
        restricted:
          !currentUser.moduleIds.includes(moduleId) ||
          !['Residente', 'Auxiliar de Contabilidad'].includes(currentUser.roleName),
      });
      return;
    }

    if (moduleId === 'review') {
      setRoute({
        name: 'review',
        restricted:
          !currentUser.moduleIds.includes(moduleId) ||
          currentUser.roleName !== 'Presidente / Gerente',
      });
      return;
    }

    if (moduleId === 'inventory') {
      setRoute({
        name: 'inventory',
        restricted:
          !currentUser.moduleIds.includes(moduleId) ||
          currentUser.roleName !== 'Bodeguero',
      });
      return;
    }

    if (moduleId === 'inventory-movements') {
      setRoute({
        name: 'inventory-movements',
        restricted:
          !currentUser.moduleIds.includes(moduleId) ||
          currentUser.roleName !== 'Bodeguero',
      });
      return;
    }

    if (moduleId === 'payroll') {
      setRoute({
        name: 'payroll',
        restricted:
          !currentUser.moduleIds.includes(moduleId) ||
          !['Contador', 'Presidente / Gerente'].includes(currentUser.roleName),
      });
      return;
    }

    if (moduleId === 'reports') {
      setRoute({
        name: 'reports',
        restricted:
          !currentUser.moduleIds.includes(moduleId) ||
          !['Presidente / Gerente', 'Contador', 'Administrador del Sistema'].includes(currentUser.roleName),
      });
      return;
    }

    if (moduleId === 'audit') {
      setRoute({
        name: 'audit',
        restricted:
          !currentUser.moduleIds.includes(moduleId) ||
          currentUser.roleName !== 'Administrador del Sistema',
      });
      return;
    }

    if (moduleId === 'system-validations') {
      setRoute({
        name: 'system-validations',
        restricted:
          !currentUser.moduleIds.includes(moduleId) ||
          currentUser.roleName !== 'Administrador del Sistema',
      });
      return;
    }

    if (moduleId === 'technical-settings') {
      setRoute({
        name: 'technical-settings',
        restricted:
          !currentUser.moduleIds.includes(moduleId) ||
          currentUser.roleName !== 'Administrador del Sistema',
      });
      return;
    }

    if (!currentUser.moduleIds.includes(moduleId)) {
      setRoute({ name: 'restricted', moduleId });
      return;
    }

    if (moduleId === 'administration') {
      openAdminSection('users');
      return;
    }

    if (moduleId === 'projects') {
      openAdminSection('projects');
      return;
    }

    if (moduleId === 'rubros') {
      openAdminSection('rubros');
      return;
    }

    if (moduleId === 'catalog') {
      openAdminSection('materials');
      return;
    }

    setRoute({ name: 'module', moduleId });
  };

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  if (route.name === 'login') {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onOpenRecovery={() => setRoute({ name: 'recovery' })}
      />
    );
  }

  if (route.name === 'recovery') {
    return <RecoveryView onBackToLogin={() => setRoute({ name: 'login' })} />;
  }

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onOpenRecovery={() => setRoute({ name: 'recovery' })}
      />
    );
  }

  if (route.name === 'profile') {
    return (
      <ProfileView
        currentUser={currentUser}
        onBackToDashboard={goToDashboard}
        onLogout={handleLogout}
      />
    );
  }

  if (route.name === 'admin') {
    if (route.section === 'project-access') {
      return (
        <ProjectAccessAssignmentView
          currentUser={currentUser}
          onGoHome={() => goToDashboard()}
          onOpenProfile={openProfile}
          onLogout={handleLogout}
          onOpenModule={openModule}
          onOpenAdminSection={openAdminSection}
        />
      );
    }

    if (route.section === 'projects') {
      return (
        <ProjectsManagementView
          currentUser={currentUser}
          onGoHome={() => goToDashboard()}
          onOpenProfile={openProfile}
          onLogout={handleLogout}
          onOpenModule={openModule}
          onOpenAdminSection={openAdminSection}
        />
      );
    }

    if (route.section === 'rubros') {
      return (
        <ProjectRubrosView
          currentUser={currentUser}
          onGoHome={() => goToDashboard()}
          onOpenProfile={openProfile}
          onLogout={handleLogout}
          onOpenModule={openModule}
          onOpenAdminSection={openAdminSection}
        />
      );
    }

    if (route.section === 'materials') {
      return (
        <MaterialsCatalogView
          currentUser={currentUser}
          onGoHome={() => goToDashboard()}
          onOpenProfile={openProfile}
          onLogout={handleLogout}
          onOpenModule={openModule}
          onOpenAdminSection={openAdminSection}
        />
      );
    }

    return (
      <AdminUsersPermissionsView
        currentUser={currentUser}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
        onOpenAdminSection={openAdminSection}
      />
    );
  }

  if (route.name === 'progress') {
    return (
      <MobileProgressView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'evidence') {
    return (
      <MobileEvidenceSyncView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        advanceRecord={route.advanceRecord ?? null}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'consumption') {
    return (
      <MobileConsumptionView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'requirements') {
    return (
      <PurchaseRequestsView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'review') {
    return (
      <RequestReviewView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'inventory') {
    return (
      <InventoryReceptionView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'inventory-movements') {
    return (
      <InventoryMovementsView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'payroll') {
    return (
      <BillingDocumentsView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'reports') {
    return (
      <ReportsDashboardView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'audit') {
    return (
      <AuditTraceabilityView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'system-validations') {
    return (
      <ValidationAccessControlView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'technical-settings') {
    return (
      <TechnicalSettingsView
        currentUser={currentUser}
        isRestricted={Boolean(route.restricted)}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  if (route.name === 'module' || route.name === 'restricted') {
    return (
      <ModuleWorkspaceView
        currentUser={currentUser}
        module={getModuleById(route.moduleId)}
        isRestricted={route.name === 'restricted'}
        onGoHome={() => goToDashboard()}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
        onOpenModule={openModule}
      />
    );
  }

  return (
    <DashboardView
      currentUser={currentUser}
      restoredSession={Boolean(route.restoredSession)}
      onOpenProfile={openProfile}
      onLogout={handleLogout}
      onOpenModule={openModule}
      onOpenAdminSection={openAdminSection}
      onGoHome={() => goToDashboard()}
    />
  );
}