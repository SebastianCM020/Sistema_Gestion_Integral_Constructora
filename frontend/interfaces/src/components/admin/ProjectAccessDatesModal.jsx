import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function ProjectAccessDatesModal({ assignment, onCancel, onSave }) {
  const [values, setValues] = useState({
    startDate: assignment.startDate,
    endDate: assignment.endDate,
  });
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!values.startDate || !values.endDate) {
      setError('Complete las dos fechas para continuar.');
      return;
    }

    if (values.endDate < values.startDate) {
      setError('La fecha fin no puede ser anterior a la fecha inicio.');
      return;
    }

    onSave(values);
  };

  return (
    <ModalShell
      title="Ajustar vigencia"
      description="Revise el rango actual y confirme la nueva vigencia antes de guardar."
      onClose={onCancel}
      widthClass="max-w-2xl"
    >
      <div className="space-y-5">
        <section className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-gray-600">
          <p className="font-semibold text-[#2F3A45]">{assignment.userName}</p>
          <p className="mt-1">{assignment.projectCode} · {assignment.projectName}</p>
          <p className="mt-3">Fechas actuales: {assignment.startDate} a {assignment.endDate}</p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <DateField id="project-access-start-date" label="Nueva fecha de inicio" value={values.startDate} onChange={(value) => setValues((previous) => ({ ...previous, startDate: value }))} />
          <DateField id="project-access-end-date" label="Nueva fecha de fin" value={values.endDate} onChange={(value) => setValues((previous) => ({ ...previous, endDate: value }))} />
        </div>

        {error ? <div className="rounded-[12px] border border-[#DC2626]/15 bg-[#DC2626]/10 px-4 py-3 text-sm font-medium text-[#B91C1C]">{error}</div> : null}

        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-gray-600">
          La UI previene rangos ambiguos y deja lista esta operación para una futura actualización parcial del registro desde backend.
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm} className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
            Confirmar cambios
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function DateField({ id, label, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#2F3A45]">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
      />
    </div>
  );
}