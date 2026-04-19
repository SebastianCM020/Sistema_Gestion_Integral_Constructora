import React from 'react';

export function UnitBadge({ unit }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#1F4E79]/12 bg-[#DCEAF7]/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#1F4E79]">
      {unit}
    </span>
  );
}