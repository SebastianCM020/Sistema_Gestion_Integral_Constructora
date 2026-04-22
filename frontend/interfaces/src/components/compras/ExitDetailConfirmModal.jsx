import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function ExitDetailConfirmModal({ onCancel, onConfirm }) {
  return (
    <ModalShell title="Volver al listado" description="Puede cerrar el detalle y continuar con la revisión del resto de requerimientos sin perder el estado de la bandeja." onClose={onCancel} widthClass="max-w-lg">
      <p className="text-sm text-[#2F3A45]">Si vuelve ahora, el listado se mantendrá con los mismos filtros aplicados y podrá seguir revisando otros pendientes.</p>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onConfirm} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Volver al listado</button>
      </div>
    </ModalShell>
  );
}