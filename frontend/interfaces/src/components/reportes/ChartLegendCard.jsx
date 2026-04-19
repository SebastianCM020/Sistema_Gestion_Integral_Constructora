import React from 'react';

export function ChartLegendCard({ chart }) {
  return (
    <article className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#2F3A45]">Leyenda del gráfico</h3>
      <div className="mt-4 space-y-3">
        {chart.segments.map((segment) => (
          <div key={segment.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-sm text-[#2F3A45]">{segment.label}</span>
            </div>
            <span className="text-sm font-semibold text-[#2F3A45]">{segment.value}%</span>
          </div>
        ))}
      </div>
    </article>
  );
}