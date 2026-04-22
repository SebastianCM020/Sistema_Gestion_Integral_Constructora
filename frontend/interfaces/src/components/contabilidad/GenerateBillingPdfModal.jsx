import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function GenerateBillingPdfModal({ project, period, document, onClose, onConfirm }) {
  return (
    <ModalShell title="¿Desea generar la planilla PDF de este periodo?" description="El documento se generará con la información cerrada del proyecto y quedará trazado con usuario y fecha." onClose={onClose} widthClass="max-w-lg">
      <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
        <p><span className="font-semibold">Proyecto:</span> {project.code} · {project.name}</p>
        <p className="mt-2"><span className="font-semibold">Periodo:</span> {period.label}</p>
        <p className="mt-2"><span className="font-semibold">Documento:</span> {document.documentType}</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onConfirm} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Generar</button>
      </div>
    </ModalShell>
  );
}