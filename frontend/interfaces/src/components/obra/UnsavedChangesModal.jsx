import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function UnsavedChangesModal({ onCancel, onLeave, onSaveAndLeave }) {
  return (
    <ModalShell
      title="Hay cambios pendientes en esta evidencia"
      description="Puede permanecer en la vista, salir sin conservar el contexto actual o guardar la evidencia pendiente antes de salir."
      onClose={onCancel}
      widthClass="max-w-lg"
    >
      <p className="text-sm text-[#2F3A45]">Si sale ahora, puede perder la continuidad del flujo actual. Guardar y salir dejará la evidencia lista o pendiente según la conectividad disponible.</p>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onLeave} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#DC2626]/25 px-4 text-sm font-medium text-[#DC2626] hover:bg-[#FEE2E2]/60">Salir sin guardar</button>
        <button type="button" onClick={onSaveAndLeave} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Guardar y salir</button>
      </div>
    </ModalShell>
  );
}