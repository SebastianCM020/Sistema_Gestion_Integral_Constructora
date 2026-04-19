import React from 'react';
import { CheckCircle2, Download } from 'lucide-react';

export function BillingSuccessState({ document, onDownload, onDismiss }) {
  if (!document) {
    return null;
  }

  return (
    <section className="rounded-[12px] border border-[#16A34A]/20 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#16A34A]/10 text-[#16A34A]">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#2F3A45]">La planilla fue generada correctamente</h2>
            <p className="mt-1 text-sm text-gray-600">{document.fileName} está lista para descarga y quedó asociada al periodo seleccionado.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => onDownload(document)} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]"><Download size={16} />Descargar</button>
          <button type="button" onClick={onDismiss} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Volver al listado</button>
        </div>
      </div>
    </section>
  );
}