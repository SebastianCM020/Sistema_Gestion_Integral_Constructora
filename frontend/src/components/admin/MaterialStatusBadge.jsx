import React from 'react';
import { AlertTriangle, CircleCheckBig } from 'lucide-react';
import { getMaterialStatusMeta } from '../../utils/materialHelpers.js';

const toneClasses = {
  success: 'border-[#16A34A]/15 bg-[#16A34A]/10 text-[#166534]',
  warning: 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#9A6700]',
};

export function MaterialStatusBadge({ isActive }) {
  const meta = getMaterialStatusMeta(isActive);
  const Icon = isActive ? CircleCheckBig : AlertTriangle;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[meta.tone]}`}>
      <Icon size={14} />
      {meta.label}
    </span>
  );
}