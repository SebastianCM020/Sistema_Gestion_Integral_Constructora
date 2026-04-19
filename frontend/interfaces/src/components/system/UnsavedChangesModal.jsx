import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function UnsavedChangesModal({ onClose, onStay, onDiscard }) {
  return (
    <ModalShell title="Hay cambios sin guardar" description="Si sale ahora, perdera la informacion ingresada en esta validacion de ejemplo." onClose={onClose} widthClass="max-w-lg">
      <p className="text-sm text-gray-600">Puede permanecer en la vista para terminar la correccion o salir y descartar los cambios pendientes.</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onStay} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onDiscard} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#DC2626] px-4 text-sm font-medium text-white hover:bg-[#b91c1c]">Salir sin guardar</button>
      </div>
    </ModalShell>
  );
}