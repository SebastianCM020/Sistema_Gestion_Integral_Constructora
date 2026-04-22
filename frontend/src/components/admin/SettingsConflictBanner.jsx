import React from 'react';

export function SettingsConflictBanner({ conflicts, onOpenDetail }) {
  if (!conflicts.length) {
    return null;
  }

  return (
    <section className="rounded-[12px] border border-[#F59E0B]/20 bg-[#FFF7ED] p-4 text-[#92400E] shadow-sm">
      <h3 className="text-sm font-semibold">Revise los conflictos antes de guardar</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {conflicts.map((conflict) => (
          <li key={conflict.id}>
            <button type="button" onClick={() => onOpenDetail(conflict)} className="text-left hover:underline">
              {conflict.title}
            </button>
            <p className="mt-1 opacity-90">{conflict.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}