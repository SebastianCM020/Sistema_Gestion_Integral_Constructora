import React from 'react';
import { Activity, Coins, Gauge, Ruler } from 'lucide-react';
import { formatCurrency } from '../../utils/projectHelpers.js';
import { formatQuantity, getRubroBudgetMetrics } from '../../utils/progressHelpers.js';

export function RubroInfoCard({ rubro }) {
  const metrics = getRubroBudgetMetrics(rubro);

  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{rubro.code}</p>
          <h2 className="mt-1 text-base font-semibold text-[#2F3A45]">{rubro.description}</h2>
        </div>
        <span className="rounded-full border border-[#1F4E79]/15 bg-[#DCEAF7]/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#1F4E79]">
          {rubro.unit}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricItem icon={Ruler} label="Presupuestado" value={`${formatQuantity(rubro.budgetedQuantity)} ${rubro.unit}`} />
        <MetricItem icon={Activity} label="Ejecutado" value={`${formatQuantity(rubro.executedQuantity)} ${rubro.unit}`} />
        <MetricItem icon={Gauge} label="Disponible" value={`${formatQuantity(metrics.remainingQuantity)} ${rubro.unit}`} />
        <MetricItem icon={Coins} label="Precio unitario" value={formatCurrency(rubro.unitPrice)} />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
          <span>Avance acumulado</span>
          <span>{Math.round(metrics.progressPercent)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#DCEAF7]">
          <div className="h-2 rounded-full bg-[#1F4E79]" style={{ width: `${metrics.progressPercent}%` }} />
        </div>
      </div>
    </section>
  );
}

function MetricItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-3">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
        <Icon size={14} className="text-[#1F4E79]" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-[#2F3A45]">{value}</p>
    </div>
  );
}