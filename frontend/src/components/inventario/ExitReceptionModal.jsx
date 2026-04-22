import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function ExitReceptionModal({ onCancel, onConfirm }) {
  return (
    <ModalShell title="Hay datos ingresados sin confirmar" description="Si sale ahora, las cantidades registradas en esta recepción se descartarán." onClose={onCancel} widthClass="max-w-lg">
      <p className="text-sm text-[#2F3A45]">Puede continuar editando o volver al listado del proyecto para seleccionar otro requerimiento.</p>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Continuar editando</button>
        <button type="button" onClick={onConfirm} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Salir sin guardar</button>
      </div>
    </ModalShell>
  );
}