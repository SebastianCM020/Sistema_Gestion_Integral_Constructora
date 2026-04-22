import React from 'react';
import { getRequestStatusMeta } from '../../utils/purchaseRequestHelpers.js';

const toneMap = {
  success: 'border-[#16A34A]/20 bg-[#DCFCE7] text-[#166534]',
  warning: 'border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]',
  danger: 'border-[#DC2626]/20 bg-[#FEE2E2] text-[#991B1B]',
  info: 'border-[#1F4E79]/20 bg-[#DCEAF7] text-[#1F4E79]',
};

export function RequestStatusBadge({ status }) {
  const meta = getRequestStatusMeta(status);

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[meta.tone]}`}>{meta.label}</span>;
}