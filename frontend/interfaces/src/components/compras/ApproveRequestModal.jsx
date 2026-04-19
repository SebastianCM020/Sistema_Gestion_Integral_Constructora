import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function ApproveRequestModal({ request, onCancel, onConfirm }) {
  return (
    <ModalShell title="¿Desea aprobar este requerimiento?" description="El requerimiento pasará al siguiente estado del proceso y quedará registrado en la trazabilidad." onClose={onCancel} widthClass="max-w-lg">
      <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
        <p><span className="font-semibold">Código:</span> {request.code}</p>
        <p className="mt-2"><span className="font-semibold">Proyecto:</span> {request.projectCode} · {request.projectName}</p>
        <p className="mt-2"><span className="font-semibold">Solicitante:</span> {request.requesterName}</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onConfirm} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#16A34A] px-4 text-sm font-medium text-white hover:bg-[#15803D]">Aprobar requerimiento</button>
      </div>
    </ModalShell>
  );
}