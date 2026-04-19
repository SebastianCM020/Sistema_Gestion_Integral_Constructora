import React from 'react';

const toneClasses = {
  success: 'border-[#16A34A]/20 bg-white',
  warning: 'border-[#F59E0B]/20 bg-white',
  danger: 'border-[#DC2626]/15 bg-white',
  info: 'border-[#1F4E79]/20 bg-white',
};

export function ReportInsightCard({ insight }) {
  return (
    <article className={`rounded-[12px] border p-4 shadow-sm ${toneClasses[insight.tone] ?? toneClasses.info}`}>
      <h3 className="text-sm font-semibold text-[#2F3A45]">{insight.title}</h3>
      <p className="mt-2 text-sm text-gray-600">{insight.description}</p>
    </article>
  );
}