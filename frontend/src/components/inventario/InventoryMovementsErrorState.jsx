import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export function InventoryMovementsErrorState({ title, description, onRetry, onDismiss, onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DC2626]/10 text-[#DC2626]">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">{title}</h2>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {onRetry ? <button type="button" onClick={onRetry} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]"><RotateCcw size={16} />Reintentar</button> : null}
        {onDismiss ? <button type="button" onClick={onDismiss} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar mensaje</button> : null}
        {onGoHome ? <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Volver al panel</button> : null}
      </div>
    </section>
  );
}