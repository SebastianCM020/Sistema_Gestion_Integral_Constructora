import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function BillingQueuedModal({ project, period, queueItem, onClose }) {
  return (
    <ModalShell title="La planilla está siendo procesada" description="El documento ingresó a una cola de procesamiento diferido y podrá seguir consultándose desde esta misma vista." onClose={onClose} widthClass="max-w-lg">
      <div className="rounded-[12px] border border-[#F59E0B]/20 bg-[#FFF7ED] p-4 text-sm text-[#92400E]">
        <p><span className="font-semibold">Proyecto:</span> {project.code} · {project.name}</p>
        <p className="mt-2"><span className="font-semibold">Periodo:</span> {period.label}</p>
        <p className="mt-2"><span className="font-semibold">Estado de cola:</span> {queueItem?.queueStatus || 'pending'}</p>
        <p className="mt-2">{queueItem?.estimatedCompletionLabel || 'Podrá consultar aquí el avance del proceso sin salir del módulo.'}</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar</button>
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Continuar</button>
      </div>
    </ModalShell>
  );
}