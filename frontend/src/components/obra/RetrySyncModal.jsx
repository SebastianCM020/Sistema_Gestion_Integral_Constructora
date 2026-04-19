import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function RetrySyncModal({ target, isOffline, onCancel, onConfirm }) {
  const title = target?.evidenceCount ? 'La sincronización no se completó' : 'Reintentar sincronización';
  const evidenceCount = target?.evidenceCount ?? 1;

  return (
    <ModalShell
      title={title}
      description="Puede volver a intentarlo ahora. Si continúa sin conexión, la evidencia seguirá pendiente hasta recuperar red."
      onClose={onCancel}
      widthClass="max-w-lg"
    >
      <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
        <p><span className="font-semibold">Proyecto:</span> {target?.projectCode} · {target?.projectName}</p>
        <p className="mt-2"><span className="font-semibold">Rubro:</span> {target?.rubroCode} · {target?.rubroDescription}</p>
        <p className="mt-2"><span className="font-semibold">Evidencias a procesar:</span> {evidenceCount}</p>
      </div>

      {isOffline ? <p className="mt-4 text-sm text-[#92400E]">No hay conexión en este momento. Si confirma, el sistema dejará el reintento pendiente.</p> : null}

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onConfirm} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Reintentar ahora</button>
      </div>
    </ModalShell>
  );
}