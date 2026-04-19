import React, { useState } from 'react';
import { Building2, LogOut, Menu } from 'lucide-react';
import { RoleBadge } from './RoleBadge.jsx';
import { UserMenu } from './UserMenu.jsx';

export function AppHeader({
  currentUser,
  currentAreaLabel,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenNavigation,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[#D1D5DB] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenNavigation}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#D1D5DB] text-[#2F3A45] hover:bg-gray-50 lg:hidden"
            aria-label="Abrir navegación"
          >
            <Menu size={20} />
          </button>
          <button
            type="button"
            onClick={onGoHome}
            className="flex min-w-0 items-center gap-3 rounded-[12px] hover:bg-[#F7F9FC] px-1 py-1 text-left"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#1F4E79] text-white">
              <Building2 size={22} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#2F3A45]">ICARO Gestión Integral</p>
              <p className="truncate text-xs text-gray-500">{currentAreaLabel}</p>
            </div>
          </button>
        </div>

        <div className="hidden xl:block">
          <RoleBadge roleName={currentUser.roleName} />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onLogout({ expired: false })}
            className="hidden h-[44px] items-center gap-2 rounded-[12px] border border-[#DC2626]/20 bg-[#F7F9FC] px-4 text-sm font-medium text-[#DC2626] transition-colors hover:bg-[#DC2626]/5 md:inline-flex"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>

          <UserMenu
            currentUser={currentUser}
            isOpen={menuOpen}
            onToggle={() => setMenuOpen((previous) => !previous)}
            onGoHome={() => {
              setMenuOpen(false);
              onGoHome();
            }}
            onOpenProfile={() => {
              setMenuOpen(false);
              onOpenProfile();
            }}
            onLogout={(payload) => {
              setMenuOpen(false);
              onLogout(payload);
            }}
          />
        </div>
      </div>
    </header>
  );
}