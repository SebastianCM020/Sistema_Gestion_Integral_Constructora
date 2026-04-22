import React from 'react';

export function SettingsSectionCard({ title, description, children, actionSlot }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#2F3A45]">{title}</h3>
          {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
        </div>
        {actionSlot ? <div>{actionSlot}</div> : null}
      </div>
      {children}
    </section>
  );
}