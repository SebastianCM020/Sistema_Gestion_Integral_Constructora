import React from 'react';

export function MovementOriginLinkCard({ title, reference, canOpen, onOpen }) {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
      <p className="text-sm font-semibold text-[#2F3A45]">{title}</p>
      <p className="mt-2 text-sm text-gray-600">Referencia: {reference}</p>
      {canOpen && onOpen ? (
        <button type="button" onClick={onOpen} className="mt-4 inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#1F4E79] px-3 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">
          Abrir origen relacionado
        </button>
      ) : (
        <p className="mt-4 text-xs text-gray-500">El origen relacionado no está disponible para esta sesión.</p>
      )}
    </div>
  );
}