import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { MaterialStatusBadge } from './MaterialStatusBadge.jsx';

export function MaterialStatusModal({ material, onCancel, onConfirm }) {
  const isActivating = !material.isActive;

  return (
    <ModalShell
      title={isActivating ? 'Activar material' : 'Desactivar material'}
      description="Confirme el cambio de vigencia antes de actualizar el catálogo."
      onClose={onCancel}
      widthClass="max-w-lg"
    >
      <div className="space-y-5">
        <section className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{material.code}</p>
          <p className="mt-2 text-base font-semibold text-[#2F3A45]">{material.name}</p>
          <div className="mt-3"><MaterialStatusBadge isActive={material.isActive} /></div>
        </section>

        <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 text-sm text-gray-600">
          {isActivating
            ? '¿Desea reactivar este material? La referencia volverá a mostrarse como vigente en el catálogo del sistema.'
            : '¿Desea desactivar este material? La referencia dejará de mostrarse como vigente dentro del catálogo principal.'}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">Cancelar</button>
          <button type="button" onClick={onConfirm} className={`h-[44px] rounded-[12px] px-4 text-sm font-medium text-white ${isActivating ? 'bg-[#16A34A] hover:bg-[#15803d]' : 'bg-[#DC2626] hover:bg-[#b91c1c]'}`}>
            {isActivating ? 'Confirmar activación' : 'Confirmar desactivación'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}