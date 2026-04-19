import React from 'react';
import { PieChart, ShieldCheck, UserRoundCheck, UserRoundX } from 'lucide-react';

export function UserSummaryCards({ summary }) {
  const cards = [
    { id: 'total', label: 'Total de usuarios', value: summary.totalUsers, helper: 'Cuentas registradas en el sistema', icon: ShieldCheck, accent: 'bg-[#DCEAF7] text-[#1F4E79]' },
    { id: 'active', label: 'Usuarios activos', value: summary.activeUsers, helper: 'Pueden iniciar sesión actualmente', icon: UserRoundCheck, accent: 'bg-[#16A34A]/10 text-[#16A34A]' },
    { id: 'inactive', label: 'Usuarios inactivos', value: summary.inactiveUsers, helper: 'Requieren reactivación para ingresar', icon: UserRoundX, accent: 'bg-[#F59E0B]/10 text-[#B45309]' },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_1.1fr]">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-[#2F3A45]">{card.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${card.accent}`}>
                <Icon size={20} />
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">{card.helper}</p>
          </article>
        );
      })}

      <article className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#F7F9FC] text-[#2F3A45] border border-[#D1D5DB]">
            <PieChart size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2F3A45]">Distribución principal por rol</p>
            <p className="text-sm text-gray-500">Resumen útil para detectar concentración de accesos.</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {summary.topRoles.map((roleItem) => (
            <div key={roleItem.role}>
              <div className="flex items-center justify-between text-sm text-[#2F3A45]">
                <span>{roleItem.role}</span>
                <span className="font-semibold">{roleItem.total}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-[#F7F9FC]">
                <div
                  className="h-2 rounded-full bg-[#1F4E79]"
                  style={{ width: `${summary.totalUsers ? (roleItem.total / summary.totalUsers) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}