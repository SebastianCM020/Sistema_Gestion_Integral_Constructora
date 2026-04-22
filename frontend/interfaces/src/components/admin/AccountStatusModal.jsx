import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { StatusBadge } from './StatusBadge.jsx';

export function AccountStatusModal({ user, onCancel, onConfirm }) {
  const nextActionLabel = user.isActive ? 'desactivar' : 'activar';

  return (
    <ModalShell
      title={user.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
      description="Confirme la acción antes de cambiar el estado del acceso para evitar bloqueos accidentales."
      onClose={onCancel}
      widthClass="max-w-lg"
    >
      <div className="space-y-5">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <p className="text-sm font-semibold text-[#2F3A45]">{user.firstName} {user.lastName}</p>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
          <div className="mt-3">
            <StatusBadge isActive={user.isActive} />
          </div>
        </div>

        <div className="rounded-[12px] border border-[#F59E0B]/20 bg-[#FFF9EB] p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[#B45309]"><AlertTriangle size={18} /></div>
            <div className="text-sm text-[#2F3A45]">
              <p className="font-semibold">¿Desea {nextActionLabel} esta cuenta?</p>
              <p className="mt-1 text-gray-600">
                {user.isActive
                  ? 'El usuario no podrá iniciar sesión mientras la cuenta permanezca inactiva.'
                  : 'El usuario podrá volver a iniciar sesión con sus permisos actuales.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-[44px] rounded-[12px] px-4 text-sm font-medium text-white ${user.isActive ? 'bg-[#DC2626] hover:bg-[#b91c1c]' : 'bg-[#16A34A] hover:bg-[#15803d]'}`}
          >
            Confirmar acción
          </button>
        </div>
      </div>
    </ModalShell>
  );
}