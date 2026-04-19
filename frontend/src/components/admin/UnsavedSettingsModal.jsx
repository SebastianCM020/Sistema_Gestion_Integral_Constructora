import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function UnsavedSettingsModal({ onClose, onStay, onDiscard, onSave }) {
  return (
    <ModalShell title="Hay cambios sin guardar" description="Puede seguir editando, guardar ahora o salir y descartar los cambios pendientes." onClose={onClose} widthClass="max-w-lg">
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onStay} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onDiscard} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Salir sin guardar</button>
        <button type="button" onClick={onSave} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Guardar cambios</button>
      </div>
    </ModalShell>
  );
}