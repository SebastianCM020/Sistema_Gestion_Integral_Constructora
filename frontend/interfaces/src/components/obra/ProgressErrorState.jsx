import React from 'react';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';

export function ProgressErrorState({ title, description, onRetry, onDismiss, onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DC2626]/10 text-[#DC2626]">
        <AlertTriangle size={24} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-[#2F3A45]">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {onRetry ? (
          <button type="button" onClick={onRetry} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
            <RotateCcw size={16} />
            Reintentar
          </button>
        ) : null}
        {onDismiss ? (
          <button type="button" onClick={onDismiss} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
            <ArrowLeft size={16} />
            Volver al formulario
          </button>
        ) : null}
      </div>
      {onGoHome ? (
        <button type="button" onClick={onGoHome} className="mt-3 inline-flex h-[44px] w-full items-center justify-center rounded-[12px] border border-[#1F4E79] px-4 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">
          Volver al panel principal
        </button>
      ) : null}
    </section>
  );
}