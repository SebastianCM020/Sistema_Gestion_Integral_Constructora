import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function ExcessReceptionModal({ lines, onClose }) {
  const firstLine = lines[0];

  return (
    <ModalShell title="La cantidad recibida supera la cantidad aprobada" description="Corrija la recepción o gestione la autorización correspondiente antes de continuar." onClose={onClose} widthClass="max-w-lg">
      <div className="rounded-[12px] border border-[#DC2626]/20 bg-[#FEE2E2]/60 p-4 text-sm text-[#991B1B]">
        <p><span className="font-semibold">Material:</span> {firstLine.materialCode} · {firstLine.materialName}</p>
        <p className="mt-2"><span className="font-semibold">Cantidad aprobada:</span> {firstLine.cantidadAprobada}</p>
        <p className="mt-2"><span className="font-semibold">Cantidad recibida:</span> {firstLine.cantidadRecibida}</p>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Corregir recepción</button>
      </div>
    </ModalShell>
  );
}