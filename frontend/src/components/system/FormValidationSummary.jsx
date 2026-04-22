import React from 'react';

export function FormValidationSummary({ title, items }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="mb-5 rounded-[12px] border border-[#DC2626]/20 bg-[#FEE2E2]/50 p-4 text-[#991B1B]">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((item) => <li key={item.id}>• {item.label}: {item.message}</li>)}
      </ul>
    </section>
  );
}