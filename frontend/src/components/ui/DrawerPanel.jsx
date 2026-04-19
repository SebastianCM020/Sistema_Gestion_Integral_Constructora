import React from 'react';
import { X } from 'lucide-react';

export function DrawerPanel({ title, description, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#111827]/35 backdrop-blur-sm">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Cerrar detalle" />
      <aside className="relative flex h-full w-full max-w-[560px] flex-col border-l border-[#D1D5DB] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#D1D5DB] bg-gray-50/70 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-[#2F3A45]">{title}</h3>
            {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#D1D5DB] text-gray-500 hover:bg-white hover:text-[#2F3A45]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}