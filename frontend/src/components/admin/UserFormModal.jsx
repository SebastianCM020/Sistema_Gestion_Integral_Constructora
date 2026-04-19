import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { defaultUserFormValues, validateUserForm } from '../../utils/adminUserHelpers.js';

export function UserFormModal({ user, users, availableRoles, onCancel, onSave }) {
  const isEditMode = Boolean(user);
  const [values, setValues] = useState(
    user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        }
      : defaultUserFormValues
  );
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setValues((previousValues) => ({ ...previousValues, [field]: value }));
    setErrors((previousErrors) => ({ ...previousErrors, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateUserForm(values, users, user?.id ?? null);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    onSave(values);
  };

  return (
    <ModalShell
      title={isEditMode ? 'Editar usuario' : 'Nuevo usuario'}
      description="Complete los datos básicos del usuario como si luego fueran enviados a un endpoint real de administración."
      onClose={onCancel}
      widthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="firstName"
            label="Nombre"
            value={values.firstName}
            error={errors.firstName}
            onChange={(value) => handleChange('firstName', value)}
          />
          <Field
            id="lastName"
            label="Apellido"
            value={values.lastName}
            error={errors.lastName}
            onChange={(value) => handleChange('lastName', value)}
          />
        </div>

        <Field
          id="email"
          label="Correo corporativo"
          value={values.email}
          error={errors.email}
          onChange={(value) => handleChange('email', value)}
          placeholder="usuario@icaro.com"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="user-role" className="block text-sm font-medium text-[#2F3A45] mb-1.5">Rol</label>
            <select
              id="user-role"
              value={values.role}
              onChange={(event) => handleChange('role', event.target.value)}
              className={`h-[44px] w-full rounded-[12px] border px-3 text-sm focus:outline-none focus:ring-1 ${errors.role ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'}`}
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {errors.role ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{errors.role}</p> : null}
          </div>

          <div>
            <label htmlFor="user-status" className="block text-sm font-medium text-[#2F3A45] mb-1.5">Estado inicial</label>
            <select
              id="user-status"
              value={String(values.isActive)}
              onChange={(event) => handleChange('isActive', event.target.value === 'true')}
              className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-gray-600">
          Esta estructura queda lista para reemplazar el mock por un POST o PUT real sin rehacer el formulario ni sus validaciones de interfaz.
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
            {isEditMode ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function Field({ id, label, value, error, onChange, placeholder = '' }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#2F3A45] mb-1.5">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[44px] w-full rounded-[12px] border px-3 text-sm focus:outline-none focus:ring-1 ${error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'}`}
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p> : null}
    </div>
  );
}