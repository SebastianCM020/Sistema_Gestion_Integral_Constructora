import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function ControlledSystemErrorModal({ title, description, onClose, onRetry, onGoHome }) {
  return (
    <ModalShell title={title} description={description} onClose={onClose} widthClass="max-w-lg">
      <p className="text-sm text-gray-600">Puede cerrar este mensaje, reintentar la operacion o volver a una vista segura sin perder el control del flujo.</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar</button>
        <button type="button" onClick={onRetry} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#1F4E79]/20 px-4 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">Reintentar</button>
        <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Volver al panel</button>
      </div>
    </ModalShell>
  );
}