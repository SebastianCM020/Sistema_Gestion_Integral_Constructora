import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function AdminErrorState({ onRetry, onGoHome }) {
  return (
    <div className="rounded-[12px] border border-[#DC2626]/15 bg-white p-8 shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626] mb-5">
        <AlertTriangle size={28} />
      </div>
      <h2 className="text-xl font-semibold text-[#2F3A45]">No fue posible cargar los usuarios</h2>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Revise la carga nuevamente o vuelva al panel principal para continuar. La vista está preparada para reintentar sin perder el flujo.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={onRetry} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
          Reintentar carga
        </button>
        <button onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
          Volver al panel principal
        </button>
      </div>
    </div>
  );
}