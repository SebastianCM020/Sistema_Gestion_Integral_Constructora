import React from 'react';
import { AlertTriangle, CircleCheckBig, FolderLock } from 'lucide-react';
import { getProjectStatusMeta } from '../../utils/projectHelpers.js';

const toneClasses = {
  success: 'border-[#16A34A]/15 bg-[#16A34A]/10 text-[#166534]',
  warning: 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#9A6700]',
  danger: 'border-[#DC2626]/15 bg-[#DC2626]/10 text-[#B91C1C]',
};

const iconByStatus = {
  active: CircleCheckBig,
  suspended: AlertTriangle,
  closed: FolderLock,
};

export function ProjectStatusBadge({ status }) {
  const meta = getProjectStatusMeta(status);
  const Icon = iconByStatus[meta.value] ?? CircleCheckBig;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[meta.tone]}`}>
      <Icon size={14} />
      {meta.label}
    </span>
  );
}