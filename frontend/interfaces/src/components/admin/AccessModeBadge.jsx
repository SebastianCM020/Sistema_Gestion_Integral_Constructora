import React from 'react';
import { Eye, LockKeyhole, ShieldCheck } from 'lucide-react';
import { getAccessModeMeta } from '../../utils/projectAccessHelpers.js';

const toneClasses = {
  success: 'border-[#16A34A]/15 bg-[#16A34A]/10 text-[#166534]',
  info: 'border-[#1F4E79]/15 bg-[#DCEAF7] text-[#1F4E79]',
  danger: 'border-[#DC2626]/15 bg-[#DC2626]/10 text-[#B91C1C]',
};

const iconByMode = {
  active: ShieldCheck,
  readonly: Eye,
  revoked: LockKeyhole,
};

export function AccessModeBadge({ accessMode }) {
  const meta = getAccessModeMeta(accessMode);
  const Icon = iconByMode[accessMode] ?? ShieldCheck;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[meta.tone]}`}>
      <Icon size={14} />
      {meta.label}
    </span>
  );
}