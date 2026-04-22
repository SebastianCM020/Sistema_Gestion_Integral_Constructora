import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { SettingsStatusBadge } from './SettingsStatusBadge.jsx';

export function TechnicalSettingsHeader({ currentTabLabel, pendingChanges, saveStatus, onGoHome }) {
  const badgeTone = pendingChanges ? 'warning' : saveStatus === 'saved' ? 'success' : 'info';
  const badgeLabel = pendingChanges ? 'Cambios pendientes' : saveStatus === 'saved' ? 'Cambios guardados' : 'Configuración disponible';

  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Panel principal</button>
        <span>/</span>
        <span className="font-medium text-[#1F4E79]">Configuración técnica general</span>
      </div>
      <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
            <SlidersHorizontal size={22} />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Configuración técnica general</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">Administre la configuración general del sistema, parámetros globales, catálogos auxiliares y ajustes administrativos con una sola vista técnica, clara y preparada para integrarse con API REST.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <SettingsStatusBadge tone={badgeTone} label={badgeLabel} />
            <span className="text-sm text-[#1F4E79]">Sección activa: {currentTabLabel}</span>
          </div>
        </div>
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 xl:w-[320px]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Contexto del módulo</p>
          <p className="mt-2 text-sm text-[#2F3A45]">Centralice cambios de configuración, valide reglas antes de guardar y mantenga el control de trazabilidad conceptual.</p>
        </div>
      </div>
    </section>
  );
}