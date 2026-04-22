import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function DeleteRequestLineModal({ line, onCancel, onConfirm }) {
  return (
    <ModalShell
      title="¿Desea eliminar este material del requerimiento?"
      description="La línea dejará de formar parte del detalle actual si confirma la acción."
      onClose={onCancel}
      widthClass="max-w-lg"
    >
      <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
        <p><span className="font-semibold">Material:</span> {line.materialCode} · {line.materialName}</p>
        <p className="mt-2"><span className="font-semibold">Cantidad:</span> {line.requestedQuantity} {line.unit}</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onConfirm} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#DC2626] px-4 text-sm font-medium text-white hover:bg-[#B91C1C]">Eliminar línea</button>
      </div>
    </ModalShell>
  );
}