import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function RoleAssignmentModal({ user, availableRoles, onCancel, onSave }) {
  const [nextRole, setNextRole] = useState(user.role);
  const hasChanged = nextRole !== user.role;

  return (
    <ModalShell
      title="Cambiar rol del usuario"
      description="Actualice el nivel de acceso asegurando claridad sobre el rol actual y el nuevo rol asignado."
      onClose={onCancel}
      widthClass="max-w-lg"
    >
      <div className="space-y-5">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <p className="text-sm font-semibold text-[#2F3A45]">{user.firstName} {user.lastName}</p>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] sm:items-end">
          <div>
            <label className="block text-sm font-medium text-[#2F3A45] mb-1.5">Rol actual</label>
            <div className="h-[44px] rounded-[12px] border border-[#D1D5DB] bg-gray-50 px-3 flex items-center text-sm text-gray-600">
              {user.role}
            </div>
          </div>
          <div className="flex h-[44px] items-center justify-center text-[#1F4E79]">
            <ArrowRightLeft size={18} />
          </div>
          <div>
            <label htmlFor="new-role" className="block text-sm font-medium text-[#2F3A45] mb-1.5">Nuevo rol</label>
            <select
              id="new-role"
              value={nextRole}
              onChange={(event) => setNextRole(event.target.value)}
              className="w-full h-[44px] rounded-[12px] border border-[#D1D5DB] bg-white px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-gray-600">
          Confirme el nuevo rol solo si corresponde al alcance operativo del usuario. El cambio afectará los módulos visibles en su próxima sesión.
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!hasChanged}
            onClick={() => onSave(nextRole)}
            className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </ModalShell>
  );
}