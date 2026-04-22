import React from 'react';
import { LayoutDashboard, LogOut, User, X } from 'lucide-react';

export function SidebarNavigation({
  modules,
  activeItemId,
  isOpen,
  currentUser,
  onClose,
  onGoHome,
  onOpenModule,
  onOpenProfile,
  onLogout,
}) {
  const content = (
    <div className="flex h-full flex-col rounded-r-[20px] border-r border-[#D1D5DB] bg-white lg:rounded-r-none lg:border lg:rounded-[12px]">
      <div className="flex items-center justify-between border-b border-[#D1D5DB] px-5 py-4 lg:hidden">
        <div>
          <p className="text-sm font-semibold text-[#2F3A45]">Navegación principal</p>
          <p className="text-xs text-gray-500">Módulos habilitados para su rol</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#D1D5DB] text-[#2F3A45]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-4 py-5 border-b border-[#D1D5DB]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Sesión actual</p>
        <p className="mt-2 text-sm font-semibold text-[#2F3A45]">{currentUser.name}</p>
        <p className="text-xs text-gray-500">{currentUser.roleName}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <button
          type="button"
          onClick={() => {
            onGoHome();
            onClose();
          }}
          className={`flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-sm font-medium transition-colors ${
            activeItemId === 'dashboard'
              ? 'bg-[#1F4E79] text-white shadow-sm'
              : 'text-[#2F3A45] hover:bg-[#F7F9FC]'
          }`}
        >
          <LayoutDashboard size={18} />
          Panel principal
        </button>

        <div className="mt-6">
          <p className="px-4 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Módulos disponibles</p>
          <div className="mt-3 space-y-2">
            {modules.map((moduleItem) => {
              const Icon = moduleItem.icon;
              const isActive = activeItemId === moduleItem.id;

              return (
                <button
                  key={moduleItem.id}
                  type="button"
                  onClick={() => {
                    onOpenModule(moduleItem.id);
                    onClose();
                  }}
                  className={`flex w-full items-start gap-3 rounded-[12px] px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'border border-[#1F4E79]/10 bg-[#DCEAF7]/80 text-[#1F4E79]'
                      : 'text-[#2F3A45] hover:bg-[#F7F9FC]'
                  }`}
                >
                  <Icon size={18} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">{moduleItem.name}</span>
                    <span className="mt-1 block text-xs text-gray-500">{moduleItem.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="border-t border-[#D1D5DB] p-3 space-y-2">
        <button
          type="button"
          onClick={() => {
            onOpenProfile();
            onClose();
          }}
          className="flex h-[44px] w-full items-center gap-3 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50"
        >
          <User size={18} className="text-[#1F4E79]" />
          Mi perfil operativo
        </button>
        <button
          type="button"
          onClick={() => onLogout({ expired: false })}
          className="flex h-[44px] w-full items-center gap-3 rounded-[12px] bg-[#F7F9FC] px-4 text-sm font-medium text-[#DC2626] hover:bg-[#DC2626]/5"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)]">{content}</aside>

      {isOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#111827]/45"
            onClick={onClose}
            aria-label="Cerrar navegación"
          />
          <div className="relative h-full max-w-[340px]">{content}</div>
        </div>
      ) : null}
    </>
  );
}