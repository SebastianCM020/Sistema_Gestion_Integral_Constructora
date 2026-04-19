import React from 'react';

export function BillingPeriodSelector({ periods, currentPeriodId, onChange }) {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <label htmlFor="billing-period" className="block text-sm font-medium text-[#2F3A45]">Periodo mensual</label>
      <select id="billing-period" value={currentPeriodId} onChange={(event) => onChange(event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
        {periods.map((period) => (
          <option key={period.id} value={period.id}>{period.label}</option>
        ))}
      </select>
      <p className="mt-2 text-xs text-gray-500">Seleccione un mes cerrado o en curso para revisar elegibilidad y trazabilidad documental.</p>
    </div>
  );
}