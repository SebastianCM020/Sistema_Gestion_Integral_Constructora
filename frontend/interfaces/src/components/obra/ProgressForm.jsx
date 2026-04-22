import React from 'react';
import { Save, XCircle } from 'lucide-react';
import { BudgetValidationBanner } from './BudgetValidationBanner.jsx';

export function ProgressForm({ values, errors, selectedRubro, budgetValidation, isSubmitting, onChange, onSubmit, onReset }) {
  return (
    <form onSubmit={onSubmit} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-[#2F3A45]">Registrar avance físico</h2>
      <p className="mt-1 text-sm text-gray-500">Complete la cantidad ejecutada y agregue una nota si necesita dejar trazabilidad de campo.</p>

      <div className="mt-4 grid gap-4">
        <div>
          <label htmlFor="progress-quantity" className="mb-1.5 block text-sm font-medium text-[#2F3A45]">Cantidad ejecutada</label>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
            <input
              id="progress-quantity"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={values.quantity}
              onChange={(event) => onChange('quantity', event.target.value)}
              placeholder="Ingrese la cantidad"
              disabled={!selectedRubro || isSubmitting}
              className={`h-[48px] w-full rounded-[12px] border px-3 text-base focus:outline-none focus:ring-1 ${errors.quantity ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'} ${!selectedRubro ? 'bg-gray-50 text-gray-400' : ''}`}
            />
            <div className="flex h-[48px] items-center justify-center rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] text-sm font-semibold uppercase tracking-[0.08em] text-[#1F4E79]">
              {selectedRubro ? selectedRubro.unit : 'Unidad'}
            </div>
          </div>
          {errors.quantity ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{errors.quantity}</p> : null}
        </div>

        <div>
          <label htmlFor="progress-notes" className="mb-1.5 block text-sm font-medium text-[#2F3A45]">Notas del registro</label>
          <textarea
            id="progress-notes"
            rows={4}
            value={values.notes}
            onChange={(event) => onChange('notes', event.target.value)}
            placeholder="Opcional: observaciones del frente, novedad o contexto de ejecución"
            disabled={isSubmitting}
            className="w-full rounded-[12px] border border-[#D1D5DB] px-3 py-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
          />
        </div>

        <BudgetValidationBanner validation={budgetValidation} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="submit" disabled={isSubmitting} className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c] disabled:cursor-not-allowed disabled:opacity-60">
          <Save size={18} />
          {isSubmitting ? 'Registrando avance...' : 'Registrar avance'}
        </button>
        <button type="button" onClick={onReset} disabled={isSubmitting} className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-60">
          <XCircle size={18} />
          Limpiar formulario
        </button>
      </div>
    </form>
  );
}