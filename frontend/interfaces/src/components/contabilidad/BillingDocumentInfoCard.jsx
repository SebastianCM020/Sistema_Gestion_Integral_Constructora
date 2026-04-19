import React from 'react';

export function BillingDocumentInfoCard({ title, value, helper }) {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{title}</p>
      <p className="mt-2 text-sm font-semibold text-[#2F3A45]">{value}</p>
      {helper ? <p className="mt-1 text-xs text-gray-500">{helper}</p> : null}
    </div>
  );
}