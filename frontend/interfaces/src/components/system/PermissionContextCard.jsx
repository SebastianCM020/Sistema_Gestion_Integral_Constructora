import React from 'react';

export function PermissionContextCard({ context }) {
  return (
    <article className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-[#2F3A45]">{context.title}</h3>
      <p className="mt-2 text-sm text-gray-600">{context.description}</p>
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p><span className="font-semibold text-[#2F3A45]">Rol actual:</span> {context.currentRole}</p>
        <p><span className="font-semibold text-[#2F3A45]">Politica:</span> {context.roleLabel}</p>
        <p><span className="font-semibold text-[#2F3A45]">Alcance:</span> {context.scopeLabel}</p>
        <p><span className="font-semibold text-[#2F3A45]">Vigencia:</span> {context.validityLabel}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {context.allowedActions.map((action) => <span key={action} className="inline-flex rounded-full border border-[#D1D5DB] bg-[#F7F9FC] px-3 py-1 text-xs font-medium text-[#2F3A45]">{action}</span>)}
      </div>
    </article>
  );
}