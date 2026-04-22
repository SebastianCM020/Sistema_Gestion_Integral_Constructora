import React from 'react';
import { RotateCcw, SendHorizonal } from 'lucide-react';

export function ConsumptionForm({ values, errors, selectedMaterial, isSubmitting, onChange, onSubmit, onReset }) {
  return (
    <form onSubmit={onSubmit} className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#2F3A45]">Registrar consumo</h2>
      <p className="mt-1 text-sm text-gray-600">Ingrese la cantidad consumida y una observación si necesita dejar trazabilidad de campo.</p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="consumption-quantity" className="block text-sm font-medium text-[#2F3A45]">Cantidad consumida</label>
          <div className="mt-2 flex items-center overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC]">
            <input
              id="consumption-quantity"
              type="number"
              min="0"
              step="0.01"
              value={values.quantity}
              onChange={(event) => onChange('quantity', event.target.value)}
              disabled={!selectedMaterial || isSubmitting}
              className="h-[48px] w-full bg-transparent px-4 text-sm text-[#2F3A45] outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
              placeholder="Ingrese la cantidad consumida"
            />
            <span className="px-4 text-sm font-semibold text-[#2F3A45]">{selectedMaterial?.unit ?? 'Unidad'}</span>
          </div>
          {errors.quantity ? <p className="mt-2 text-sm text-[#DC2626]">{errors.quantity}</p> : null}
        </div>

        <div>
          <label htmlFor="consumption-observations" className="block text-sm font-medium text-[#2F3A45]">Observaciones</label>
          <textarea
            id="consumption-observations"
            value={values.observations}
            onChange={(event) => onChange('observations', event.target.value)}
            disabled={isSubmitting}
            className="mt-2 min-h-[112px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-sm text-[#2F3A45] outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
            placeholder="Opcional: detalle del frente, responsable o justificación breve"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="submit" disabled={isSubmitting} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c] disabled:cursor-not-allowed disabled:bg-[#94A3B8]">
            <SendHorizonal size={16} />
            {isSubmitting ? 'Registrando consumo...' : 'Registrar consumo'}
          </button>
          <button type="button" onClick={onReset} disabled={isSubmitting} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:text-gray-400">
            <RotateCcw size={16} />
            Limpiar formulario
          </button>
        </div>
      </div>
    </form>
  );
}