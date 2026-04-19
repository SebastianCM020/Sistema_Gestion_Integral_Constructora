import React from 'react';
import { ChevronDown, LayoutDashboard, LogOut, User } from 'lucide-react';

export function UserMenu({ currentUser, isOpen, onToggle, onGoHome, onOpenProfile, onLogout }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-[44px] items-center gap-3 rounded-[12px] border border-[#D1D5DB] bg-white px-3 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-[#2F3A45] leading-tight">{currentUser.name}</p>
          <p className="text-xs text-gray-500 leading-tight">{currentUser.roleName}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1F4E79]/15 bg-[#DCEAF7] text-sm font-bold text-[#1F4E79]">
          {currentUser.initials}
        </div>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-[0_12px_32px_rgba(17,24,39,0.12)] z-40">
          <div className="border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F3A45]">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{currentUser.email}</p>
          </div>
          <div className="p-2">
            <button
              type="button"
              onClick={onGoHome}
              className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]"
            >
              <LayoutDashboard size={18} className="text-[#1F4E79]" />
              Panel principal
            </button>
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]"
            >
              <User size={18} className="text-[#1F4E79]" />
              Mi perfil operativo
            </button>
            <button
              type="button"
              onClick={() => onLogout({ expired: false })}
              className="mt-1 flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#DC2626] hover:bg-[#DC2626]/5"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}