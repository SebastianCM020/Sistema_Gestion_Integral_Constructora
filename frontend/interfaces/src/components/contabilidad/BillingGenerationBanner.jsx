import React from 'react';
import { Download, FileSpreadsheet, LoaderCircle, RotateCcw } from 'lucide-react';

const toneClasses = {
  success: 'border-[#16A34A]/20 bg-white',
  info: 'border-[#1F4E79]/20 bg-white',
  warning: 'border-[#F59E0B]/20 bg-white',
  danger: 'border-[#DC2626]/15 bg-white',
  neutral: 'border-[#D1D5DB] bg-white',
};

export function BillingGenerationBanner({ primaryDocument, queueMeta, canGenerate, canDownload, onGenerate, onRefresh, onRetry, onDownload }) {
  const icon = primaryDocument?.generationStatus === 'processing' ? LoaderCircle : FileSpreadsheet;
  const Icon = icon;

  return (
    <section className={`rounded-[12px] border p-5 shadow-sm ${toneClasses[queueMeta.tone] ?? toneClasses.neutral}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
            <Icon size={18} className={primaryDocument?.generationStatus === 'processing' ? 'animate-spin' : ''} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#2F3A45]">{queueMeta.label}</h2>
            <p className="mt-1 text-sm text-gray-600">{queueMeta.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {canGenerate ? <button type="button" onClick={onGenerate} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]"><FileSpreadsheet size={16} />Generar planilla PDF</button> : null}
          {primaryDocument?.generationStatus === 'failed' ? <button type="button" onClick={onRetry} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#DC2626]/20 px-4 text-sm font-medium text-[#DC2626] hover:bg-[#FEE2E2]/50"><RotateCcw size={16} />Reintentar generación</button> : null}
          {['queued', 'processing'].includes(primaryDocument?.generationStatus) ? <button type="button" onClick={onRefresh} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]"><RotateCcw size={16} />Consultar estado</button> : null}
          {canDownload ? <button type="button" onClick={onDownload} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#16A34A]/20 px-4 text-sm font-medium text-[#166534] hover:bg-[#16A34A]/5"><Download size={16} />Descargar planilla</button> : null}
        </div>
      </div>
    </section>
  );
}