import React from 'react';

export function RetryActionCard({ title, description, actionLabel, onAction }) {
  return (
    <article className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-[#2F3A45]">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <button type="button" onClick={onAction} className="mt-4 inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#1F4E79]/20 px-3 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">{actionLabel}</button>
    </article>
  );
}