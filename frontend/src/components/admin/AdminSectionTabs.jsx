import React from 'react';
import { Boxes, Building2, FolderCog, KeyRound, SlidersHorizontal, Users } from 'lucide-react';

const tabs = [
  {
    id: 'users',
    label: 'Usuarios y permisos',
    description: 'Gestione cuentas, roles y estado de acceso del sistema.',
    icon: Users,
  },
  {
    id: 'project-access',
    label: 'Acceso por proyecto',
    description: 'Controle vigencia y modo de acceso de usuarios por proyecto.',
    icon: KeyRound,
  },
  {
    id: 'projects',
    label: 'Gestión de proyectos',
    description: 'Administre proyectos y parametrización operativa del sistema.',
    icon: FolderCog,
  },
  {
    id: 'rubros',
    label: 'Rubros y carga masiva',
    description: 'Gestione rubros por proyecto y valide cargas masivas por CSV.',
    icon: Building2,
  },
  {
    id: 'materials',
    label: 'Catálogo y materiales',
    description: 'Administre referencias, unidades y vigencia del catálogo base.',
    icon: Boxes,
  },
  {
    id: 'technical-settings',
    label: 'Configuración técnica',
    description: 'Administre parámetros globales, catálogos auxiliares y ajustes administrativos.',
    icon: SlidersHorizontal,
  },
];

export function AdminSectionTabs({ activeTab, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-[12px] border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 ${isActive ? 'border-[#1F4E79] bg-[#DCEAF7]/60 shadow-sm' : 'border-[#D1D5DB] bg-white hover:border-[#1F4E79]/40 hover:bg-[#F7F9FC]'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${isActive ? 'bg-white text-[#1F4E79]' : 'bg-[#F7F9FC] text-[#2F3A45]'}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2F3A45]">{tab.label}</p>
                <p className="mt-1 text-sm text-gray-500">{tab.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}