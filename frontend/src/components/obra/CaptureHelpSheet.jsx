import React from 'react';

export function CaptureHelpSheet() {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-[#2F3A45]">Guía rápida de captura</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-600">
        <li>Capture el frente completo o el detalle técnico relevante del avance.</li>
        <li>Evite imágenes borrosas o muy oscuras para no generar reintentos innecesarios.</li>
        <li>Si no tiene red, continúe normalmente: la evidencia quedará guardada en cola.</li>
      </ul>
    </section>
  );
}