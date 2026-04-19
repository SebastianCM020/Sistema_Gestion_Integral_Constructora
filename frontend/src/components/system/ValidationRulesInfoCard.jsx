import React from 'react';

export function ValidationRulesInfoCard({ rules }) {
  return (
    <article className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-[#2F3A45]">Reglas visibles de validacion</h3>
      <div className="mt-4 space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="rounded-[10px] border border-[#D1D5DB] bg-[#F7F9FC] p-3">
            <p className="text-sm font-semibold text-[#2F3A45]">{rule.label}</p>
            <p className="mt-1 text-sm text-gray-600">{rule.description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}