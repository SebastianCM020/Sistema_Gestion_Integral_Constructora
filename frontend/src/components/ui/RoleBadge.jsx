import React from 'react';

export function RoleBadge({ roleName }) {
  const roleConfig = {
    'Administrador del Sistema': {
      bg: 'bg-indigo-50 border-indigo-200/60 text-indigo-700',
      dot: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
    },
    'Presidente / Gerente': {
      bg: 'bg-amber-50 border-amber-200/60 text-amber-700',
      dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
    },
    'Residente': {
      bg: 'bg-emerald-50 border-emerald-200/60 text-emerald-700',
      dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
    },
    'Auxiliar de Contabilidad': {
      bg: 'bg-sky-50 border-sky-200/60 text-sky-700',
      dot: 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
    },
    'default': {
      bg: 'bg-slate-50 border-slate-200/60 text-slate-700',
      dot: 'bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]'
    }
  };

  const config = roleConfig[roleName] || roleConfig['default'];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm transition-all duration-200 ${config.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span className="opacity-75 font-normal text-[10px] uppercase tracking-wider">Rol:</span>
      <span>{roleName}</span>
    </span>
  );
}