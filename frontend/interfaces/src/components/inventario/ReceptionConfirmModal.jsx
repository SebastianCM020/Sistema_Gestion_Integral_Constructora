import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function ReceptionConfirmModal({ request, lines, onCancel, onConfirm }) {
  return (
    <ModalShell title="¿Desea registrar esta recepción?" description="El stock del proyecto se actualizará con las cantidades recibidas y la operación quedará registrada." onClose={onCancel} widthClass="max-w-2xl">
      <div className="space-y-4">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          <p><span className="font-semibold">Requerimiento:</span> {request.requestCode}</p>
          <p className="mt-2"><span className="font-semibold">Proyecto:</span> {request.projectCode} · {request.projectName}</p>
          <p className="mt-2"><span className="font-semibold">Solicitante:</span> {request.requesterName}</p>
        </div>

        <div className="rounded-[12px] border border-[#D1D5DB] bg-white">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            <span>Material</span>
            <span>Aprobado</span>
            <span>Recibido</span>
          </div>
          <div className="divide-y divide-[#D1D5DB]">
            {lines.map((line) => (
              <div key={line.materialId} className="grid grid-cols-[1.2fr_1fr_1fr] gap-4 px-4 py-3 text-sm text-[#2F3A45]">
                <span>{line.materialName}</span>
                <span>{line.cantidadAprobada} {line.unidad}</span>
                <span>{line.cantidadRecibida} {line.unidad}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onCancel} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
          <button type="button" onClick={onConfirm} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Confirmar recepción</button>
        </div>
      </div>
    </ModalShell>
  );
}