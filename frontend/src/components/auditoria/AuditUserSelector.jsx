import React from 'react';

export function AuditUserSelector({ options, value, onChange }) {
  return (
    <div>
      <label htmlFor="audit-user" className="block text-sm font-medium text-[#2F3A45]">Usuario</label>
      <select id="audit-user" value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
        {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
    </div>
  );
}