import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function AuditNoResultsModal({ onClose, onClearFilters }) {
  return (
    <ModalShell title="No se encontraron eventos para los filtros aplicados" description="Ajuste el rango de fechas o el filtro de usuario para continuar con la consulta de auditoria." onClose={onClose} widthClass="max-w-lg">
      <p className="text-sm text-gray-600">La bitacora sigue disponible, pero la combinacion actual de filtros no devuelve registros. Puede cerrar este mensaje o limpiar filtros para volver a un estado util de consulta.</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar</button>
        <button type="button" onClick={onClearFilters} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Limpiar filtros</button>
      </div>
    </ModalShell>
  );
}