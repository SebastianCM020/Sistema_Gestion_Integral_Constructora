import React from 'react';
import { ArrowRight } from 'lucide-react';

export function QuickActionCard({ action, onRun }) {
  const Icon = action.icon;

  return (
    <button
      type="button"
      onClick={() => onRun(action)}
      className="flex w-full items-center justify-between gap-4 rounded-[12px] border border-[#D1D5DB] bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1F4E79]/20 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F7F9FC] text-[#1F4E79] border border-[#D1D5DB]">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2F3A45]">{action.label}</p>
          <p className="mt-1 text-sm text-gray-500">{action.description}</p>
        </div>
      </div>
      <ArrowRight size={18} className="shrink-0 text-[#1F4E79]" />
    </button>
  );
}