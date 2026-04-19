import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { PendingSyncBadge } from './PendingSyncBadge.jsx';

export function EvidenceContextHeader({ subtitle, syncStatus, onBackToProgress, onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBackToProgress} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
          <ArrowLeft size={16} />
          Volver al avance
        </button>
        <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
          <Home size={16} />
          Panel principal
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2F3A45]">Evidencia y sincronización</h1>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        </div>
        <PendingSyncBadge syncStatus={syncStatus} />
      </div>
    </section>
  );
}