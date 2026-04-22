import React from 'react';
import { ShieldAlert } from 'lucide-react';

export function AccessDeniedState({ title, description, contextLabel, primaryActionLabel, onPrimaryAction, secondaryActionLabel, onSecondaryAction }) {
  return (
    <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-8 shadow-sm">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]"><ShieldAlert size={28} /></div>
      <h1 className="text-2xl font-semibold text-[#2F3A45]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">{description}</p>
      {contextLabel ? <p className="mt-3 text-sm text-[#1F4E79]">Contexto afectado: <span className="font-semibold">{contextLabel}</span></p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {primaryActionLabel && onPrimaryAction ? <button type="button" onClick={onPrimaryAction} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">{primaryActionLabel}</button> : null}
        {secondaryActionLabel && onSecondaryAction ? <button type="button" onClick={onSecondaryAction} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">{secondaryActionLabel}</button> : null}
      </div>
    </section>
  );
}