import React from 'react';

export function TechnicalSettingsErrorState({ onRetry, onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#DC2626]/20 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-[#2F3A45]">No fue posible cargar la configuración técnica</h2>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">Ocurrió un problema al preparar parámetros, catálogos o ajustes administrativos. Puede reintentar o volver al panel principal sin perder su sesión.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={onRetry} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Reintentar carga</button>
        <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Volver al panel principal</button>
      </div>
    </section>
  );
}