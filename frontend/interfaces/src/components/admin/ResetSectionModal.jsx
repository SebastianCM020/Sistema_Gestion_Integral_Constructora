import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function ResetSectionModal({ sectionLabel, onClose, onConfirm }) {
  return (
    <ModalShell title="¿Desea restablecer esta sección?" description={`Los cambios no guardados de ${sectionLabel.toLowerCase()} se perderán y volverán al último estado guardado.`} onClose={onClose} widthClass="max-w-lg">
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onConfirm} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#DC2626] px-4 text-sm font-medium text-white hover:bg-[#b91c1c]">Restablecer sección</button>
      </div>
    </ModalShell>
  );
}