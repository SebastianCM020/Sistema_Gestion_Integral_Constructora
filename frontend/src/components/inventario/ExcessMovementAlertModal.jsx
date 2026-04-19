import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function ExcessMovementAlertModal({ alert, onClose, onViewDetail }) {
  return (
    <ModalShell title="Se detectó un excedente relacionado" description="Revise las cantidades del movimiento relacionado antes de cerrar el seguimiento logístico." onClose={onClose} widthClass="max-w-lg">
      <div className="rounded-[12px] border border-[#F59E0B]/20 bg-[#FFF7ED] p-4 text-sm text-[#92400E]">
        <p><span className="font-semibold">Proyecto:</span> {alert.projectCode} · {alert.projectName}</p>
        <p className="mt-2"><span className="font-semibold">Material:</span> {alert.materialCode} · {alert.materialName}</p>
        <p className="mt-2"><span className="font-semibold">Referencia:</span> {alert.originRelacion.originReference}</p>
        <p className="mt-2">{alert.mensaje}</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar</button>
        <button type="button" onClick={onViewDetail} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Ver detalle</button>
      </div>
    </ModalShell>
  );
}