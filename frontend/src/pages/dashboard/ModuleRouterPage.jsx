import React, { useContext } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
import { getUserFromEmail, getModuleById } from '../../data/icaroData';

// Modulos
import { MobileProgressView } from '../../views/obra/MobileProgressView';
import { MobileEvidenceSyncView } from '../../views/obra/MobileEvidenceSyncView';
import { MobileConsumptionView } from '../../views/obra/MobileConsumptionView';
import { PurchaseRequestsView } from '../../views/compras/PurchaseRequestsView';
import { RequestReviewView } from '../../views/compras/RequestReviewView';
import { InventoryReceptionView } from '../../views/inventario/InventoryReceptionView';
import { InventoryMovementsView } from '../../views/inventario/InventoryMovementsView';
import { BillingDocumentsView } from '../../views/contabilidad/BillingDocumentsView';
import { ReportsDashboardView } from '../../views/reportes/ReportsDashboardView';
import { AuditTraceabilityView } from '../../views/auditoria/AuditTraceabilityView';
import { ValidationAccessControlView } from '../../views/system/ValidationAccessControlView';
import { TechnicalSettingsView } from '../../views/admin/TechnicalSettingsView';
import { ModuleWorkspaceView } from '../../views/ModuleWorkspaceView';
import { ProfileView } from '../../views/ProfileView';

export default function ModuleRouterPage() {
  const { moduleId } = useParams();
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
  const openAdmin = (section) => navigate(`/admin/${section}`);

  const commonProps = {
    currentUser,
    onGoHome: goHome,
    onOpenProfile: openProfile,
    onLogout: logout,
    onOpenModule: openModule,
    onOpenAdminSection: openAdmin,
    isRestricted: !currentUser.moduleIds.includes(moduleId) && moduleId !== 'profile'
  };

  if (moduleId === 'profile') return <ProfileView {...commonProps} />;
  if (moduleId === 'progress') return <MobileProgressView {...commonProps} />;
  if (moduleId === 'evidence') return <MobileEvidenceSyncView {...commonProps} />;
  if (moduleId === 'consumption') return <MobileConsumptionView {...commonProps} />;
  if (moduleId === 'requirements') return <PurchaseRequestsView {...commonProps} />;
  if (moduleId === 'review') return <RequestReviewView {...commonProps} />;
  if (moduleId === 'inventory') return <InventoryReceptionView {...commonProps} />;
  if (moduleId === 'inventory-movements') return <InventoryMovementsView {...commonProps} />;
  if (moduleId === 'payroll') return <BillingDocumentsView {...commonProps} />;
  if (moduleId === 'reports') return <ReportsDashboardView {...commonProps} />;
  if (moduleId === 'audit') return <AuditTraceabilityView {...commonProps} />;
  if (moduleId === 'system-validations') return <ValidationAccessControlView {...commonProps} />;
  if (moduleId === 'technical-settings') return <TechnicalSettingsView {...commonProps} />;

  // Si hay mapeos de redirect
  if (moduleId === 'administration') return <Navigate to="/admin/users" replace />;
  if (moduleId === 'projects') return <Navigate to="/admin/projects" replace />;
  if (moduleId === 'rubros') return <Navigate to="/admin/rubros" replace />;
  if (moduleId === 'catalog') return <Navigate to="/admin/materials" replace />;

  const moduleData = getModuleById(moduleId);

  return (
    <ModuleWorkspaceView 
      {...commonProps} 
      module={moduleData} 
      isRestricted={!moduleData || commonProps.isRestricted}
    />
  );
}
