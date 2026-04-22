import React from 'react';
import { Eye, Pencil, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatDateTime, getUserFullName } from '../../utils/adminUserHelpers.js';
import { StatusBadge } from './StatusBadge.jsx';
import { PermissionBadge } from './PermissionBadge.jsx';

export function UserTable({ users, onView, onEdit, onChangeRole, onToggleStatus }) {
  return (
    <div className="hidden overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#D1D5DB]">
          <thead className="bg-gray-50/70">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Usuario</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Rol</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Estado</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Último acceso</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Permisos visibles</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D1D5DB]">
            {users.map((user) => (
              <tr key={user.id} className="align-top hover:bg-[#F7F9FC]/70">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-[#2F3A45]">{getUserFullName(user)}</p>
                  <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                  <p className="mt-2 text-xs text-gray-400">Creado: {formatDateTime(user.createdAt)}</p>
                </td>
                <td className="px-5 py-4 text-sm text-[#2F3A45]">{user.role}</td>
                <td className="px-5 py-4"><StatusBadge isActive={user.isActive} /></td>
                <td className="px-5 py-4 text-sm text-gray-500">{formatDateTime(user.lastLogin)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    {user.permissions.slice(0, 2).map((permission) => (
                      <PermissionBadge key={permission} label={permission} />
                    ))}
                    {user.permissions.length > 2 ? <PermissionBadge label={`+${user.permissions.length - 2} más`} /> : null}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <ActionButton icon={Eye} label="Ver detalle" onClick={() => onView(user)} />
                    <ActionButton icon={Pencil} label="Editar usuario" onClick={() => onEdit(user)} />
                    <ActionButton icon={ShieldCheck} label="Cambiar rol" onClick={() => onChangeRole(user)} />
                    <ActionButton
                      icon={user.isActive ? ToggleRight : ToggleLeft}
                      label={user.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
                      onClick={() => onToggleStatus(user)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#D1D5DB] text-[#2F3A45] hover:bg-[#F7F9FC]"
      title={label}
      aria-label={label}
    >
      <Icon size={17} />
    </button>
  );
}