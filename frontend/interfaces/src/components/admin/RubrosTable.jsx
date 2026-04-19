import React from 'react';
import { Eye, Pencil } from 'lucide-react';
import { formatRubroMetrics } from '../../utils/rubroHelpers.js';
import { RubroStatusBadge } from './RubroStatusBadge.jsx';

export function RubrosTable({ rubros, onView, onEdit }) {
  return (
    <div className="hidden overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#D1D5DB]">
          <thead className="bg-[#F7F9FC]">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              <th className="px-5 py-4">Rubro</th>
              <th className="px-5 py-4">Unidad</th>
              <th className="px-5 py-4">Precio unitario</th>
              <th className="px-5 py-4">Cantidad presupuestada</th>
              <th className="px-5 py-4">Cantidad ejecutada</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D1D5DB] bg-white text-sm text-[#2F3A45]">
            {rubros.map((rubro) => {
              const metrics = formatRubroMetrics(rubro);

              return (
                <tr key={rubro.id} className="align-top hover:bg-[#F7F9FC]">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#2F3A45]">{rubro.code}</p>
                    <p className="mt-1 text-gray-500">{rubro.description}</p>
                  </td>
                  <td className="px-5 py-4">{rubro.unit}</td>
                  <td className="px-5 py-4">{metrics.unitPrice}</td>
                  <td className="px-5 py-4">{metrics.budgetedQuantity}</td>
                  <td className="px-5 py-4">{metrics.executedQuantity}</td>
                  <td className="px-5 py-4"><RubroStatusBadge isActive={rubro.isActive} /></td>
                  <td className="px-5 py-4">
                    <div className="grid gap-2 xl:grid-cols-[repeat(2,minmax(0,1fr))]">
                      <ActionButton icon={Eye} label="Ver detalle" onClick={() => onView(rubro)} />
                      <ActionButton icon={Pencil} label="Editar" onClick={() => onEdit(rubro)} />
                    </div>
                  </td>
                </tr>
              );
            })}
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