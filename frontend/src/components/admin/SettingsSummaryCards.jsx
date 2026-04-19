import React from 'react';
import { SettingsStatusBadge } from './SettingsStatusBadge.jsx';

export function SettingsSummaryCards({ items, lastUpdatedLabel }) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <article key={item.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-[#2F3A45]">{item.value}</p>
              </div>
              <SettingsStatusBadge tone={item.tone} label={item.helper} />
            </div>
          </article>
        ))}
      </div>
      <div className="rounded-[12px] border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
        Última actualización registrada: <span className="font-medium text-[#2F3A45]">{lastUpdatedLabel}</span>
      </div>
    </section>
  );
}