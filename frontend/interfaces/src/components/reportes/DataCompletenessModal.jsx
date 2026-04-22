import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function DataCompletenessModal({ meta, onClose }) {
  return (
    <ModalShell title="Algunas métricas no están disponibles para el filtro actual" description="La vista sigue siendo útil, pero parte del corte está en consolidación o requiere validación adicional." onClose={onClose} widthClass="max-w-lg">
      <div className="rounded-[12px] border border-[#F59E0B]/20 bg-[#FFF7ED] p-4 text-sm text-[#92400E]">
        <p className="font-semibold">{meta.title}</p>
        <p className="mt-2">{meta.description}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar</button>
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Continuar</button>
      </div>
    </ModalShell>
  );
}