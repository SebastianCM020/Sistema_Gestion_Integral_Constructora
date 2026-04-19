import React from 'react';

export function AuditDateRangePicker({ dateFrom, dateTo, onChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="audit-date-from" className="block text-sm font-medium text-[#2F3A45]">Desde</label>
        <input id="audit-date-from" type="date" value={dateFrom} onChange={(event) => onChange({ dateFrom: event.target.value })} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none" />
      </div>
      <div>
        <label htmlFor="audit-date-to" className="block text-sm font-medium text-[#2F3A45]">Hasta</label>
        <input id="audit-date-to" type="date" value={dateTo} onChange={(event) => onChange({ dateTo: event.target.value })} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none" />
      </div>
    </div>
  );
}