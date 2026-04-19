import React from 'react';
import { AlertTriangle, CheckCircle2, FileWarning, LoaderCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/projectHelpers.js';

const toneByStatus = {
  success: { icon: CheckCircle2, className: 'border-[#16A34A]/15 bg-[#16A34A]/10 text-[#166534]' },
  partial: { icon: AlertTriangle, className: 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#9A6700]' },
  failed: { icon: FileWarning, className: 'border-[#DC2626]/15 bg-[#DC2626]/10 text-[#B91C1C]' },
  importing: { icon: LoaderCircle, className: 'border-[#1F4E79]/15 bg-[#DCEAF7] text-[#1F4E79]' },
};

export function CsvImportSummary({ result, progress }) {
  if (!result && progress == null) {
    return null;
  }

  if (progress != null && !result) {
    const meta = toneByStatus.importing;
    const Icon = meta.icon;

    return (
      <section className={`rounded-[12px] border p-4 ${meta.className}`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon size={18} className="animate-spin" />
          Procesando archivo CSV
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/60">
          <div className="h-2 rounded-full bg-current transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-sm">Avance estimado: {progress}%</p>
      </section>
    );
  }

  const meta = toneByStatus[result.status] ?? toneByStatus.failed;
  const Icon = meta.icon;

  return (
    <section className={`rounded-[12px] border p-4 ${meta.className}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon size={18} className={result.status === 'importing' ? 'animate-spin' : ''} />
        {result.status === 'success' ? 'La importación finalizó correctamente' : result.status === 'partial' ? 'Se encontraron errores en algunas filas' : 'No fue posible procesar el archivo'}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <SummaryItem label="Archivo" value={result.fileName} />
        <SummaryItem label="Total de filas" value={String(result.totalRows)} />
        <SummaryItem label="Filas importadas" value={String(result.importedRows)} />
        <SummaryItem label="Filas con error" value={String(result.failedRows)} />
      </div>
      {result.finishedAt ? <p className="mt-4 text-xs font-medium">Finalizado: {formatDateTime(result.finishedAt)}</p> : null}
    </section>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}