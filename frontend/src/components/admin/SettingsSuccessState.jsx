import React from 'react';

export function SettingsSuccessState({ onContinueEditing, onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#16A34A]/20 bg-[#16A34A]/10 p-4 text-[#166534] shadow-sm">
      <h3 className="text-sm font-semibold">La configuración fue actualizada correctamente</h3>
      <p className="mt-1 text-sm">Los cambios visibles quedaron listos para seguir editando, revisar trazabilidad o volver al panel principal.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={onContinueEditing} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#16A34A]/20 bg-white px-3 text-sm font-medium text-[#166534] hover:bg-[#F7F9FC]">Seguir editando</button>
        <button type="button" onClick={onGoHome} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#16A34A]/20 bg-white px-3 text-sm font-medium text-[#166534] hover:bg-[#F7F9FC]">Volver al panel</button>
      </div>
    </section>
  );
}