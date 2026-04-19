import React from 'react';
import { AlertTriangle, CircleCheckBig, Clock3, LockKeyhole } from 'lucide-react';
import { getStatusForAssignment } from '../../utils/projectAccessHelpers.js';

const toneClasses = {
  success: 'border-[#16A34A]/15 bg-[#16A34A]/10 text-[#166534]',
  info: 'border-[#1F4E79]/15 bg-[#DCEAF7] text-[#1F4E79]',
  warning: 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#9A6700]',
  danger: 'border-[#DC2626]/15 bg-[#DC2626]/10 text-[#B91C1C]',
};

const iconByStatus = {
  active: CircleCheckBig,
  readonly: Clock3,
  expired: AlertTriangle,
  revoked: LockKeyhole,
};

export function ProjectAccessStatusBadge({ assignment }) {
  const status = getStatusForAssignment(assignment);
  const Icon = iconByStatus[status.value] ?? CircleCheckBig;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[status.tone]}`}>
      <Icon size={14} />
      {status.label}
    </span>
  );
}