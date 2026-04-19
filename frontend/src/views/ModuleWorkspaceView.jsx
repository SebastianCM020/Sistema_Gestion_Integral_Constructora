import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, CircleCheckBig, Construction, Lock } from 'lucide-react';
import { AppHeader } from '../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { AlertList } from '../components/ui/AlertList.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { getModulesForUser } from '../data/icaroData.js';
import { AccessDeniedState } from '../components/system/AccessDeniedState.jsx';
import { NotFoundState } from '../components/system/NotFoundState.jsx';

export function ModuleWorkspaceView({
  currentUser,
  module,
  isRestricted,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const modules = getModulesForUser(currentUser);

  if (!module) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <NotFoundState title="Recurso no disponible" description="La referencia del modulo no esta disponible. Vuelva al panel principal para continuar de forma segura." primaryActionLabel="Volver al panel principal" onPrimaryAction={onGoHome} />
        </div>
      </div>
    );
  }

  const modulePendingItems = currentUser.pendingItems.filter((item) => item.moduleId === module.id);
  const Icon = module.icon;

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel={module.name}
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId={isRestricted ? 'dashboard' : module.id}
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
            <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Panel principal</button>
            <ChevronRight size={14} />
            <span className="font-medium text-[#1F4E79]">{module.name}</span>
          </div>

          {isRestricted ? (
            <AccessDeniedState title="Acceso denegado" description={`El modulo ${module.name} no esta habilitado para su rol actual. Vuelva al panel principal o revise su perfil para continuar de forma segura.`} contextLabel={module.name} primaryActionLabel="Volver al panel principal" onPrimaryAction={onGoHome} secondaryActionLabel="Abrir mi perfil" onSecondaryAction={onOpenProfile} />
          ) : (
            <>
              <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
                      <Icon size={22} />
                    </div>
                    <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">{module.name}</h1>
                    <p className="mt-2 max-w-3xl text-sm text-gray-600">{module.description}</p>
                    <p className="mt-3 text-sm text-[#1F4E79]">{module.helperText}</p>
                  </div>

                  <div className="rounded-[12px] border border-[#16A34A]/15 bg-[#16A34A]/10 p-4 xl:w-[320px]">
                    <div className="flex items-center gap-2 text-[#16A34A] font-semibold text-sm">
                      <CircleCheckBig size={18} />
                      Transición controlada activa
                    </div>
                    <p className="mt-2 text-sm text-[#2F3A45]">
                      Este módulo ya está conectado al flujo global. Desde aquí puede volver al panel, revisar su perfil y retomar pendientes sin perder contexto.
                    </p>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                  <SectionHeader
                    title="Estado del módulo"
                    description="La vista operativa inicial está lista para integrarse con formularios, tablas y procesos específicos del módulo."
                  />
                  <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-[#1F4E79] border border-[#D1D5DB]">
                        <Construction size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2F3A45]">Próxima evolución del módulo</p>
                        <p className="mt-1 text-sm text-gray-600">Aquí se integrarán las tareas específicas, formularios y tablas operativas del flujo de {module.name.toLowerCase()}.</p>
                      </div>
                    </div>
                    <ul className="mt-5 space-y-2 text-sm text-gray-600">
                      <li>• Mantener retorno claro al panel principal.</li>
                      <li>• Respetar permisos por rol sin exponer accesos no autorizados.</li>
                      <li>• Mostrar estados vacíos, carga, error y éxito cuando el módulo evolucione.</li>
                    </ul>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
                        <ArrowLeft size={16} />
                        Volver al panel principal
                      </button>
                      <button onClick={onOpenProfile} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
                        Ir a mi perfil
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                  <SectionHeader
                    title="Pendientes relacionados"
                    description="Use esta sección para continuar donde lo dejó sin navegar a ciegas."
                  />
                  {modulePendingItems.length ? (
                    <AlertList items={modulePendingItems} onOpenItem={onOpenModule} onBackToDashboard={onGoHome} />
                  ) : (
                    <EmptyState
                      title="No hay pendientes asociados a este módulo"
                      description="Puede volver al panel principal para revisar otros módulos disponibles o abrir su perfil para continuar de forma segura."
                      actionLabel="Volver al panel principal"
                      onAction={onGoHome}
                    />
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}