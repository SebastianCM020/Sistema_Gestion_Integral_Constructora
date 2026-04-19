import React from 'react';
import { ArrowRight } from 'lucide-react';

export function ModuleCard({ module, onOpen }) {
  const Icon = module.icon;

  return (
    <article className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
          <Icon size={22} />
        </div>
        <span className="rounded-full bg-[#F7F9FC] px-3 py-1 text-xs font-medium text-[#2F3A45] border border-[#D1D5DB]">
          {module.statusLabel}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold text-[#2F3A45]">{module.name}</h3>
      <p className="mt-2 text-sm text-gray-600">{module.description}</p>
      <p className="mt-3 text-sm text-[#1F4E79]">{module.helperText}</p>

      <button
        type="button"
        onClick={() => onOpen(module.id)}
        className="mt-5 inline-flex h-[44px] w-full items-center justify-between rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white transition-colors hover:bg-[#153a5c]"
      >
        Abrir módulo
        <ArrowRight size={18} />
      </button>
    </article>
  );
}