import React from 'react';
import { CheckCircle2, CornerUpLeft, FileWarning } from 'lucide-react';

export function ReviewerActionBar({ canReview, onApprove, onReject, onBack }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <button type="button" onClick={onApprove} disabled={!canReview} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#16A34A] px-4 text-sm font-medium text-white hover:bg-[#15803D] disabled:cursor-not-allowed disabled:bg-[#16A34A]/50">
        <CheckCircle2 size={16} />
        Aprobar
      </button>
      <button type="button" onClick={onReject} disabled={!canReview} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#DC2626] px-4 text-sm font-medium text-white hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:bg-[#DC2626]/50">
        <FileWarning size={16} />
        Rechazar
      </button>
      <button type="button" onClick={onBack} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
        <CornerUpLeft size={16} />
        Volver al listado
      </button>
    </div>
  );
}