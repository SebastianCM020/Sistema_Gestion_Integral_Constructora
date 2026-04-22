import React from 'react';

export function AuditFieldChangesTable({ fieldChanges }) {
  if (!fieldChanges?.length) {
    return (
      <div className="rounded-[12px] border border-dashed border-[#D1D5DB] bg-[#F7F9FC] p-5 text-sm text-gray-600">
        Este evento no registro cambios campo a campo. Revise el resumen general y el contexto de la solicitud para continuar la trazabilidad.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white">
      <div className="hidden grid-cols-[220px_1fr_1fr] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:grid">
        <span>Campo</span>
        <span>Valor anterior</span>
        <span>Valor nuevo</span>
      </div>
      <div className="divide-y divide-[#D1D5DB]">
        {fieldChanges.map((change) => (
          <div key={change.field} className="grid gap-4 px-4 py-4 md:grid-cols-[220px_1fr_1fr] md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Campo</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{change.field}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Valor anterior</p>
              <p className="text-sm text-gray-600">{change.before || 'Sin valor previo'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Valor nuevo</p>
              <p className="text-sm text-gray-600">{change.after || 'Sin valor nuevo'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}