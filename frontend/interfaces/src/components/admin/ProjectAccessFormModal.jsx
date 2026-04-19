import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { ProjectSelector } from './ProjectSelector.jsx';
import { UserSelector } from './UserSelector.jsx';
import {
  defaultProjectAccessFormValues,
  validateProjectAssignmentForm,
} from '../../utils/projectAccessHelpers.js';

export function ProjectAccessFormModal({ assignment, assignments, users, projects, onCancel, onSave }) {
  const isEditMode = Boolean(assignment);
  const [values, setValues] = useState(
    assignment
      ? {
          userId: assignment.userId,
          projectId: assignment.projectId,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          accessMode: assignment.accessMode,
        }
      : defaultProjectAccessFormValues
  );
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setValues((previousValues) => ({ ...previousValues, [field]: value }));
    setErrors((previousErrors) => ({ ...previousErrors, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateProjectAssignmentForm(values, assignments, users, projects, assignment?.id ?? null);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    onSave(values);
  };

  return (
    <ModalShell
      title={isEditMode ? 'Editar asignación' : 'Nueva asignación'}
      description="Configure usuario, proyecto, vigencia y modo de acceso como si luego fueran enviados a un endpoint real de administración."
      onClose={onCancel}
      widthClass="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <UserSelector value={values.userId} users={users} error={errors.userId} onChange={(value) => handleChange('userId', value)} />
          <ProjectSelector value={values.projectId} projects={projects} error={errors.projectId} onChange={(value) => handleChange('projectId', value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DateField id="assignment-startDate" label="Fecha de inicio" value={values.startDate} error={errors.startDate} onChange={(value) => handleChange('startDate', value)} />
          <DateField id="assignment-endDate" label="Fecha de fin" value={values.endDate} error={errors.endDate} onChange={(value) => handleChange('endDate', value)} />
          <div>
            <label htmlFor="assignment-accessMode" className="mb-1.5 block text-sm font-medium text-[#2F3A45]">
              Modo de acceso
            </label>
            <select
              id="assignment-accessMode"
              value={values.accessMode}
              onChange={(event) => handleChange('accessMode', event.target.value)}
              className={`h-[44px] w-full rounded-[12px] border px-3 text-sm focus:outline-none focus:ring-1 ${errors.accessMode ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'}`}
            >
              <option value="active">Activo</option>
              <option value="readonly">Solo lectura</option>
              <option value="revoked">Revocado</option>
            </select>
            {errors.accessMode ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{errors.accessMode}</p> : null}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-gray-600">
          La validación evita fechas inconsistentes y duplicidades simuladas para que luego el reemplazo por API REST no obligue a rehacer esta pantalla.
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
            {isEditMode ? 'Guardar cambios' : 'Crear asignación'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function DateField({ id, label, value, error, onChange }) {
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
        className={`h-[44px] w-full rounded-[12px] border px-3 text-sm focus:outline-none focus:ring-1 ${error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'}`}
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p> : null}
    </div>
  );
}