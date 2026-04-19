import React, { useEffect, useState } from 'react';
import { AlertTriangle, BriefcaseBusiness, Clock3, LayoutDashboard } from 'lucide-react';
import { AppHeader } from '../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../components/ui/SidebarNavigation.jsx';
import { ModuleCard } from '../components/ui/ModuleCard.jsx';
import { QuickActionCard } from '../components/ui/QuickActionCard.jsx';
import { AlertList } from '../components/ui/AlertList.jsx';
import { ActivityList } from '../components/ui/ActivityList.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { RoleBadge } from '../components/ui/RoleBadge.jsx';
import { getModulesForUser } from '../data/icaroData.js';

function LoadingPanel() {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-[12px] border-2 border-[#1F4E79]/20 border-t-[#1F4E79] animate-spin" />
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">Cargando panel principal</h2>
          <p className="text-sm text-gray-500 mt-1">Estamos validando sus módulos, pendientes y actividad reciente.</p>
        </div>
      </div>
    </div>
  );
}

function ErrorPanel({ onRetry, onGoHome, onOpenProfile }) {
  return (
    <div className="rounded-[12px] border border-[#DC2626]/20 bg-white p-8 shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626] mb-5">
        <AlertTriangle size={28} />
      </div>
      <h2 className="text-xl font-semibold text-[#2F3A45]">No fue posible cargar el panel</h2>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Ocurrió un problema al preparar su contexto operativo. Puede reintentar o ir a su perfil para revisar su sesión antes de continuar.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={onRetry} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
          Reintentar carga
        </button>
        <button onClick={onOpenProfile} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
          Abrir mi perfil
        </button>
        <button onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#1F4E79] px-4 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">
          Volver al panel principal
        </button>
      </div>
    </div>
  );
}

export function DashboardView({
  currentUser,
  restoredSession,
  onOpenProfile,
  onLogout,
  onOpenModule,
  onOpenAdminSection,
  onGoHome,
}) {
  const [status, setStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const modules = getModulesForUser(currentUser);
  const pendingItems = currentUser.pendingItems;
  const recentActivity = currentUser.recentActivity;

  useEffect(() => {
    setStatus('loading');

    const timer = window.setTimeout(() => {
      setStatus(currentUser.dashboardShouldFail ? 'error' : 'ready');
    }, 700);

    return () => window.clearTimeout(timer);
  }, [currentUser.dashboardShouldFail, currentUser.email, retryCount]);

  const runQuickAction = (action) => {
    if (action.actionType === 'profile') {
      onOpenProfile();
      return;
    }

    if (action.actionType === 'admin-view' && action.adminSection) {
      onOpenAdminSection(action.adminSection);
      return;
    }

    if (action.actionType === 'module' && action.moduleId) {
      onOpenModule(action.moduleId);
    }
  };

  const summaryItems = [
    { id: 'summary-modules', label: 'Módulos habilitados', value: modules.length, helper: 'Accesos disponibles para su rol', icon: LayoutDashboard },
    { id: 'summary-pending', label: 'Pendientes activos', value: pendingItems.length, helper: pendingItems.length ? 'Requieren atención operativa' : 'Sin alertas por atender', icon: BriefcaseBusiness },
    { id: 'summary-activity', label: 'Actividad reciente', value: recentActivity.length, helper: recentActivity.length ? 'Eventos relevantes disponibles' : 'Aún sin actividad registrada', icon: Clock3 },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Panel principal por rol"
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

        <main className="space-y-6 min-w-0">
          <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium text-[#1F4E79]">Bienvenido, {currentUser.name}</p>
                  <RoleBadge roleName={currentUser.roleName} />
                  {restoredSession ? (
                    <span className="inline-flex items-center rounded-full border border-[#16A34A]/15 bg-[#16A34A]/10 px-3 py-1 text-xs font-semibold text-[#16A34A]">
                      Sesión restaurada correctamente
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-3 text-2xl font-semibold text-[#2F3A45]">Panel principal por rol</h1>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">{currentUser.roleOrientation}</p>
                <p className="mt-3 text-sm text-[#1F4E79]">Proyecto o frente actual: {currentUser.projectLabel}</p>
              </div>

              <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 xl:w-[320px]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Orientación operativa</p>
                <p className="mt-2 text-sm text-[#2F3A45]">Identifique sus módulos habilitados, revise pendientes y entre a sus acciones frecuentes sin perder contexto.</p>
              </div>
            </div>
          </section>

          {status === 'loading' ? <LoadingPanel /> : null}
          {status === 'error' ? <ErrorPanel onRetry={() => setRetryCount((value) => value + 1)} onGoHome={onGoHome} onOpenProfile={onOpenProfile} /> : null}

          {status === 'ready' ? (
            <>
              <section className="grid gap-4 md:grid-cols-3">
                {summaryItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article key={item.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-gray-500">{item.label}</p>
                          <p className="mt-2 text-3xl font-semibold text-[#2F3A45]">{item.value}</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
                          <Icon size={20} />
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-500">{item.helper}</p>
                    </article>
                  );
                })}
              </section>

              <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                <SectionHeader
                  title="Acciones frecuentes"
                  description="Use accesos directos para retomar tareas críticas sin navegar de más."
                />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {currentUser.quickActions.map((action) => (
                    <QuickActionCard key={action.id} action={action} onRun={runQuickAction} />
                  ))}
                </div>
              </section>

              <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                <SectionHeader
                  title="Módulos disponibles para su rol"
                  description="Solo se muestran accesos autorizados para mantener navegación segura y sin rutas rotas."
                />
                {modules.length ? (
                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {modules.map((module) => (
                      <ModuleCard key={module.id} module={module} onOpen={onOpenModule} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No tiene módulos habilitados"
                    description="Su sesión está activa, pero aún no hay módulos disponibles para este rol. Abra su perfil o contacte al administrador para continuar."
                    actionLabel="Abrir mi perfil"
                    onAction={onOpenProfile}
                  />
                )}
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                  <SectionHeader
                    title="Pendientes y alertas"
                    description="Priorice tareas con impacto operativo antes de cerrar su jornada."
                  />
                  <AlertList items={pendingItems} onOpenItem={onOpenModule} onBackToDashboard={onGoHome} />
                </div>

                <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                  <SectionHeader
                    title="Actividad reciente"
                    description="Retome rápidamente sus últimas acciones o cambios relevantes."
                  />
                  <ActivityList items={recentActivity} onOpenItem={onOpenModule} onBackToDashboard={onGoHome} />
                </div>
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}