import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { formatQuantity } from '../../utils/progressHelpers.js';

export function OverBudgetModal({ rubro, quantity, validation, onClose }) {
  return (
    <ModalShell
      title="Límite presupuestario excedido"
      description="No es posible registrar este avance con los datos actuales."
      onClose={onClose}
      widthClass="max-w-lg"
    >
      <div className="space-y-5">
        <section className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{rubro.code}</p>
          <p className="mt-2 font-semibold">{rubro.description}</p>
          <p className="mt-3">Cantidad ingresada: <span className="font-semibold">{formatQuantity(quantity)} {rubro.unit}</span></p>
          <p className="mt-2">Saldo disponible: <span className="font-semibold">{formatQuantity(validation.remainingQuantity)} {rubro.unit}</span></p>
          <p className="mt-2">Exceso detectado: <span className="font-semibold">{formatQuantity(validation.overrunQuantity)} {rubro.unit}</span></p>
        </section>

        <div className="rounded-[12px] border border-[#DC2626]/15 bg-[#DC2626]/10 px-4 py-3 text-sm text-[#B91C1C]">
          El avance ingresado supera el límite permitido. Revise la cantidad o gestione la autorización correspondiente antes de continuar.
        </div>

        <div className="flex justify-end border-t border-[#D1D5DB] pt-5">
          <button type="button" onClick={onClose} className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Corregir cantidad</button>
        </div>
      </div>
    </ModalShell>
  );
}