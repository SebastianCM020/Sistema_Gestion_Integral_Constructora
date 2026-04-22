import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function DeleteEvidenceModal({ evidence, onCancel, onConfirm }) {
  return (
    <ModalShell
      title="¿Desea eliminar esta evidencia?"
      description="La imagen dejará de estar asociada al avance actual y saldrá de la cola de sincronización si aún no fue enviada."
      onClose={onCancel}
      widthClass="max-w-lg"
    >
      <div className="flex items-center gap-4 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
        <img src={evidence?.previewUrl || evidence?.localUri} alt="Evidencia seleccionada" className="h-24 w-24 rounded-[12px] object-cover" />
        <div className="text-sm text-[#2F3A45]">
          <p className="font-semibold">{evidence?.projectCode} · {evidence?.projectName}</p>
          <p className="mt-1">{evidence?.rubroCode} · {evidence?.rubroDescription}</p>
          <p className="mt-1 text-gray-500">ID: {evidence?.id}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onConfirm} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#DC2626] px-4 text-sm font-medium text-white hover:bg-[#B91C1C]">Eliminar evidencia</button>
      </div>
    </ModalShell>
  );
}