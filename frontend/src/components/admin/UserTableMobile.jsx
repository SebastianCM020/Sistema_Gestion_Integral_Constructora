import React from 'react';
import { Eye, Pencil, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatDateTime, getUserFullName } from '../../utils/adminUserHelpers.js';
import { StatusBadge } from './StatusBadge.jsx';

export function UserTableMobile({ users, onView, onEdit, onChangeRole, onToggleStatus }) {
  return (
    <div className="space-y-4 lg:hidden">
      {users.map((user) => (
        <article key={user.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#2F3A45]">{getUserFullName(user)}</p>
              <p className="mt-1 text-sm text-gray-500">{user.email}</p>
            </div>
            <StatusBadge isActive={user.isActive} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <InfoItem label="Rol" value={user.role} />
            <InfoItem label="Último acceso" value={formatDateTime(user.lastLogin)} />
            <InfoItem label="Creación" value={formatDateTime(user.createdAt)} />
            <InfoItem label="Proyecto" value={user.projectScope} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <ActionButton icon={Eye} label="Ver detalle" onClick={() => onView(user)} />
            <ActionButton icon={Pencil} label="Editar usuario" onClick={() => onEdit(user)} />
            <ActionButton icon={ShieldCheck} label="Cambiar rol" onClick={() => onChangeRole(user)} />
            <ActionButton
              icon={user.isActive ? ToggleRight : ToggleLeft}
              label={user.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
              onClick={() => onToggleStatus(user)}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-[#2F3A45]">{value}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]"
    >
      <Icon size={16} />
      {label}
    </button>
  );
}