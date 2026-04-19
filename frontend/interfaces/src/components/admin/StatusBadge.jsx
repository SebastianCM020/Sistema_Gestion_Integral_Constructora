import React from 'react';

export function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
        isActive
          ? 'border-[#16A34A]/20 bg-[#16A34A]/10 text-[#16A34A]'
          : 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#B45309]'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[#16A34A]' : 'bg-[#F59E0B]'}`} />
      {isActive ? 'Activa' : 'Inactiva'}
    </span>
  );
}