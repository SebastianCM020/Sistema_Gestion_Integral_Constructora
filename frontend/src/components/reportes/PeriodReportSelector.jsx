import React from 'react';

export function PeriodReportSelector({ periods, currentPeriodId, onChange }) {
  return (
    <div>
      <label htmlFor="reports-period" className="block text-sm font-medium text-[#2F3A45]">Periodo</label>
      <select id="reports-period" value={currentPeriodId} onChange={(event) => onChange(event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
        {periods.map((period) => (
          <option key={period.id} value={period.id}>{period.label}</option>
        ))}
      </select>
    </div>
  );
}