import React from 'react';
import { Clock3, Mail, Pencil, ShieldCheck, ToggleLeft, ToggleRight, UserRound } from 'lucide-react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { formatDateTime, getUserFullName } from '../../utils/adminUserHelpers.js';
import { PermissionBadge } from './PermissionBadge.jsx';
import { StatusBadge } from './StatusBadge.jsx';

export function UserDetailDrawer({ user, onClose, onEdit, onChangeRole, onToggleStatus }) {
  return (
    <DrawerPanel
      title="Detalle del usuario"
      description="Consulte identidad, estado y accesos visibles sin perder el contexto del listado."
      onClose={onClose}
    >
      <div className="space-y-6">
        <section className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-white text-[#1F4E79] border border-[#D1D5DB]">
              <UserRound size={22} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#2F3A45]">{getUserFullName(user)}</h4>
              <p className="mt-1 text-sm text-gray-500">{user.role}</p>
              <div className="mt-3"><StatusBadge isActive={user.isActive} /></div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <InfoCard icon={Mail} label="Correo corporativo" value={user.email} />
          <InfoCard icon={Clock3} label="Último acceso" value={formatDateTime(user.lastLogin)} />
          <InfoCard label="Fecha de creación" value={formatDateTime(user.createdAt)} />
          <InfoCard label="Proyecto o alcance" value={user.projectScope} />
        </section>

        <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5">
          <h5 className="text-sm font-semibold text-[#2F3A45]">Permisos visibles</h5>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.permissions.length ? user.permissions.map((permission) => <PermissionBadge key={permission} label={permission} />) : <PermissionBadge label="Sin permisos visibles" />}
          </div>
        </section>

        <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5">
          <h5 className="text-sm font-semibold text-[#2F3A45]">Información contextual</h5>
          <p className="mt-2 text-sm text-gray-600">{user.notes}</p>
        </section>

        <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5">
          <h5 className="text-sm font-semibold text-[#2F3A45]">Acciones rápidas</h5>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ActionButton icon={Pencil} label="Editar usuario" onClick={onEdit} />
            <ActionButton icon={ShieldCheck} label="Cambiar rol" onClick={onChangeRole} />
            <ActionButton
              icon={user.isActive ? ToggleRight : ToggleLeft}
              label={user.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
              onClick={onToggleStatus}
            />
            <ActionButton icon={UserRound} label="Cerrar detalle" onClick={onClose} />
          </div>
        </section>
      </div>
    </DrawerPanel>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</p>
      <div className="mt-2 flex items-center gap-2 text-sm text-[#2F3A45]">
        {Icon ? <Icon size={16} className="text-[#1F4E79]" /> : null}
        <span>{value}</span>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]"
    >
      <Icon size={16} />
      {label}
    </button>
  );
}