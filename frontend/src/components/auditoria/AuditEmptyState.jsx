import React from 'react';

export function AuditEmptyState({ title, description, primaryActionLabel, onPrimaryAction, secondaryActionLabel, onSecondaryAction }) {
  return (
    <section className="rounded-[12px] border border-dashed border-[#D1D5DB] bg-white px-5 py-10 text-center shadow-sm">
      <h2 className="text-base font-semibold text-[#2F3A45]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">{description}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {primaryActionLabel && onPrimaryAction ? <button type="button" onClick={onPrimaryAction} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">{primaryActionLabel}</button> : null}
        {secondaryActionLabel && onSecondaryAction ? <button type="button" onClick={onSecondaryAction} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">{secondaryActionLabel}</button> : null}
      </div>
    </section>
  );
}