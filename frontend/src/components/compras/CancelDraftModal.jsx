import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function CancelDraftModal({ message, onCancel, onDiscard, onSave }) {
  return (
    <ModalShell
      title="Hay cambios pendientes en este borrador"
      description="Puede seguir editando, descartar el borrador o guardarlo antes de salir o cambiar el contexto."
      onClose={onCancel}
      widthClass="max-w-lg"
    >
      <p className="text-sm text-[#2F3A45]">{message}</p>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onDiscard} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#DC2626]/25 px-4 text-sm font-medium text-[#DC2626] hover:bg-[#FEE2E2]/60">Descartar borrador</button>
        <button type="button" onClick={onSave} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Guardar borrador</button>
      </div>
    </ModalShell>
  );
}