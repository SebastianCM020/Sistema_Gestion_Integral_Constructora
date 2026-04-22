import React from 'react';
import { getDashboardStatusMeta } from '../../utils/reportHelpers.js';

const toneClasses = {
  success: 'border-[#16A34A]/20 bg-[#16A34A]/10 text-[#166534]',
  info: 'border-[#1F4E79]/20 bg-[#DCEAF7] text-[#1F4E79]',
  warning: 'border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]',
  danger: 'border-[#DC2626]/20 bg-[#FEE2E2]/70 text-[#991B1B]',
  neutral: 'border-[#D1D5DB] bg-[#F7F9FC] text-[#2F3A45]',
};

export function DashboardStatusBadge({ status }) {
  const meta = getDashboardStatusMeta(status);

  return <span className={`inline-flex min-h-[28px] items-center rounded-full border px-3 text-xs font-semibold ${toneClasses[meta.tone]}`}>{meta.label}</span>;
}