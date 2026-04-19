import React from 'react';
import { AlertCircle, CheckCircle2, Dot } from 'lucide-react';

const toneMeta = {
  error: { text: 'text-[#DC2626]', icon: AlertCircle },
  success: { text: 'text-[#16A34A]', icon: CheckCircle2 },
  neutral: { text: 'text-gray-500', icon: Dot },
};

export function InlineFieldValidator({ tone, label }) {
  const meta = toneMeta[tone] ?? toneMeta.neutral;
  const Icon = meta.icon;

  return (
    <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${meta.text}`}>
      <Icon size={14} />
      <span>{label}</span>
    </div>
  );
}