import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function InsufficientStockAlertModal({ alert, onClose, onViewDetail }) {
  return (
    <ModalShell title="Se detectó stock insuficiente para este material" description="Revise el detalle del movimiento o del consumo relacionado para entender el faltante." onClose={onClose} widthClass="max-w-lg">
      <div className="rounded-[12px] border border-[#DC2626]/20 bg-[#FEE2E2]/60 p-4 text-sm text-[#991B1B]">
        <p><span className="font-semibold">Proyecto:</span> {alert.projectCode} · {alert.projectName}</p>
        <p className="mt-2"><span className="font-semibold">Material:</span> {alert.materialCode} · {alert.materialName}</p>
        <p className="mt-2">{alert.mensaje}</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar</button>
        <button type="button" onClick={onViewDetail} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Ver detalle</button>
      </div>
    </ModalShell>
  );
}