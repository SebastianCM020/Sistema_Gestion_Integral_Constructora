import React from 'react';

const toneClasses = {
  info: 'border-[#1F4E79]/20 bg-[#DCEAF7] text-[#1F4E79]',
  success: 'border-[#16A34A]/20 bg-[#16A34A]/10 text-[#166534]',
  warning: 'border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]',
  error: 'border-[#DC2626]/20 bg-[#FEE2E2]/60 text-[#991B1B]',
};

export function SettingsStatusBadge({ tone = 'info', label }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone] ?? toneClasses.info}`}>{label}</span>;
}