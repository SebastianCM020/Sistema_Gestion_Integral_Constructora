import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function ForbiddenActionModal({ title, description, reasonLabel, onClose, onGoBack, onResolve }) {
  return (
    <ModalShell title={title} description={description} onClose={onClose} widthClass="max-w-lg">
      {reasonLabel ? <div className="rounded-[12px] border border-[#DC2626]/15 bg-[#FEE2E2]/40 p-4 text-sm text-[#991B1B]">{reasonLabel}</div> : null}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar</button>
        <button type="button" onClick={onGoBack} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Volver</button>
        <button type="button" onClick={onResolve} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Corregir</button>
      </div>
    </ModalShell>
  );
}