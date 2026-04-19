import React from 'react';
import { X } from 'lucide-react';

export function ModalShell({ title, description, children, onClose, widthClass = 'max-w-xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 p-4 backdrop-blur-sm">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Cerrar modal" />
      <div className={`relative w-full ${widthClass} overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.18)]`}>
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
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}