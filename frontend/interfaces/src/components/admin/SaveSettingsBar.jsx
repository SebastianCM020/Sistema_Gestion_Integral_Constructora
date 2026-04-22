import React from 'react';
import { SettingsStatusBadge } from './SettingsStatusBadge.jsx';

export function SaveSettingsBar({ pendingChanges, activeSectionLabel, isSaving, canSave, onResetSection, onGoHome, onSave }) {
  return (
    <section className="sticky bottom-4 z-20 rounded-[12px] border border-[#D1D5DB] bg-white/95 p-4 shadow-[0_12px_30px_rgba(17,24,39,0.12)] backdrop-blur-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SettingsStatusBadge tone={pendingChanges ? 'warning' : 'success'} label={pendingChanges ? 'Tiene cambios pendientes por guardar' : 'Sin cambios pendientes'} />
          <span className="text-sm text-gray-600">Sección activa: <span className="font-medium text-[#2F3A45]">{activeSectionLabel}</span></span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Volver al panel</button>
          <button type="button" onClick={onResetSection} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Restablecer sección</button>
          <button type="button" onClick={onSave} disabled={!canSave || isSaving} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c] disabled:opacity-60">{isSaving ? 'Guardando cambios...' : 'Guardar cambios'}</button>
        </div>
      </div>
    </section>
  );
}