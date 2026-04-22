import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function BillingErrorModal({ document, onClose, onRetry }) {
  return (
    <ModalShell title="No fue posible generar la planilla" description="Puede intentar nuevamente cuando el estado del periodo sea válido y los soportes estén consolidados." onClose={onClose} widthClass="max-w-lg">
      <div className="rounded-[12px] border border-[#DC2626]/15 bg-[#FEE2E2]/60 p-4 text-sm text-[#991B1B]">
        <p><span className="font-semibold">Documento:</span> {document.documentType}</p>
        <p className="mt-2"><span className="font-semibold">Periodo:</span> {document.periodLabel}</p>
        <p className="mt-2">{document.errorMessage || 'La generación presentó una incidencia controlada.'}</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar</button>
        <button type="button" onClick={onRetry} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Reintentar</button>
      </div>
    </ModalShell>
  );
}