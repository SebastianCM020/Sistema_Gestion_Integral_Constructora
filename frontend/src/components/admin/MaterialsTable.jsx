import React from 'react';
import { Eye, PauseCircle, Pencil, PlayCircle } from 'lucide-react';
import { formatMaterialDate } from '../../utils/materialHelpers.js';
import { MaterialStatusBadge } from './MaterialStatusBadge.jsx';
import { UnitBadge } from './UnitBadge.jsx';

export function MaterialsTable({ materials, onView, onEdit, onToggleStatus }) {
  return (
    <div className="hidden overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#D1D5DB]">
          <thead className="bg-[#F7F9FC]">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              <th className="px-5 py-4">Código</th>
              <th className="px-5 py-4">Material</th>
              <th className="px-5 py-4">Unidad</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Actualización</th>
              <th className="px-5 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D1D5DB] bg-white text-sm text-[#2F3A45]">
            {materials.map((material) => (
              <tr key={material.id} className="align-top hover:bg-[#F7F9FC]">
                <td className="px-5 py-4 font-semibold">{material.code}</td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#2F3A45]">{material.name}</p>
                  <p className="mt-1 text-gray-500 line-clamp-2">{material.observations || 'Sin observaciones registradas.'}</p>
                </td>
                <td className="px-5 py-4"><UnitBadge unit={material.unit} /></td>
                <td className="px-5 py-4"><MaterialStatusBadge isActive={material.isActive} /></td>
                <td className="px-5 py-4">{formatMaterialDate(material.updatedAt)}</td>
                <td className="px-5 py-4">
                  <div className="grid gap-2 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
                    <ActionButton icon={Eye} label="Ver detalle" onClick={() => onView(material)} />
                    <ActionButton icon={Pencil} label="Editar" onClick={() => onEdit(material)} />
                    <ActionButton icon={material.isActive ? PauseCircle : PlayCircle} label={material.isActive ? 'Desactivar' : 'Activar'} onClick={() => onToggleStatus(material)} />
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
      className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-xs font-semibold text-[#2F3A45] hover:bg-white"
    >
      <Icon size={14} />
      {label}
    </button>
  );
}