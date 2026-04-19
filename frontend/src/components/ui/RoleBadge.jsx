import React from 'react';

export function RoleBadge({ roleName }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#1F4E79]/15 bg-[#DCEAF7] px-3 py-1 text-xs font-semibold text-[#1F4E79]">
      Rol activo: {roleName}
    </span>
  );
}