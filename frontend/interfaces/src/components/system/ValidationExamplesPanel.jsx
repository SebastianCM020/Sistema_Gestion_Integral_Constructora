import React from 'react';

export function ValidationExamplesPanel({ examples, activeCode, onSelectExample, onOpenForbiddenModal, onOpenUnsavedModal, onOpenControlledErrorModal }) {
  return (
    <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold text-[#2F3A45]">Ejemplos de estados transversales</h2>
        <p className="mt-1 text-sm text-gray-600">Use estos accesos para invocar estados de acceso, sesion, recurso o reglas sin salir del modulo de referencia.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {examples.map((example) => (
          <button
            key={example.id}
            type="button"
            onClick={() => onSelectExample(example.id)}
            className={`rounded-[12px] border p-4 text-left transition-colors ${activeCode === example.id ? 'border-[#1F4E79] bg-[#DCEAF7]/40' : 'border-[#D1D5DB] bg-[#F7F9FC] hover:bg-[#DCEAF7]/20'}`}
          >
            <p className="text-sm font-semibold text-[#2F3A45]">{example.label}</p>
            <p className="mt-1 text-sm text-gray-600">{example.description}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <button type="button" onClick={onOpenForbiddenModal} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 text-left hover:bg-[#F7F9FC]">
          <p className="text-sm font-semibold text-[#2F3A45]">Abrir accion prohibida</p>
          <p className="mt-1 text-sm text-gray-600">Muestra el modal con salida segura y correccion.</p>
        </button>
        <button type="button" onClick={onOpenUnsavedModal} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 text-left hover:bg-[#F7F9FC]">
          <p className="text-sm font-semibold text-[#2F3A45]">Abrir cambios sin guardar</p>
          <p className="mt-1 text-sm text-gray-600">Representa la salida protegida ante perdida de datos.</p>
        </button>
        <button type="button" onClick={onOpenControlledErrorModal} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 text-left hover:bg-[#F7F9FC]">
          <p className="text-sm font-semibold text-[#2F3A45]">Abrir error controlado</p>
          <p className="mt-1 text-sm text-gray-600">Permite reintentar o volver a una vista segura.</p>
        </button>
      </div>
    </section>
  );
}