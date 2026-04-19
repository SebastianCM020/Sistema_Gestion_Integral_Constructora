import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { formatConsumptionQuantity } from '../../utils/consumptionHelpers.js';

export function StockInsufficientModal({ material, quantity, validation, onClose }) {
  return (
    <ModalShell
      title="La cantidad ingresada supera el stock disponible"
      description="No es posible registrar este consumo con los datos actuales. Revise la cantidad para continuar."
      onClose={onClose}
      widthClass="max-w-lg"
    >
      <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
        <p><span className="font-semibold">Material:</span> {material.code} · {material.name}</p>
        <p className="mt-2"><span className="font-semibold">Cantidad ingresada:</span> {formatConsumptionQuantity(quantity)} {material.unit}</p>
        <p className="mt-2"><span className="font-semibold">Stock disponible:</span> {formatConsumptionQuantity(validation.availableQuantity)} {material.unit}</p>
        <p className="mt-2"><span className="font-semibold">Diferencia:</span> {formatConsumptionQuantity(validation.shortageQuantity)} {material.unit}</p>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Corregir cantidad</button>
      </div>
    </ModalShell>
  );
}