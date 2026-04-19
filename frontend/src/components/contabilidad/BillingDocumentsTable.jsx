import React from 'react';
import { ChevronRight, Download } from 'lucide-react';
import { canDownloadBillingDocument, formatBillingDate } from '../../utils/billingDocumentHelpers.js';
import { BillingStatusBadge } from './BillingStatusBadge.jsx';

export function BillingDocumentsTable({ documents, onOpenDetail, onDownload }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm">
      <div className="hidden grid-cols-[150px_150px_1.6fr_140px_150px_140px_150px] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 lg:grid">
        <span>Proyecto</span>
        <span>Periodo</span>
        <span>Documento</span>
        <span>Estado</span>
        <span>Última actualización</span>
        <span>Solicitado por</span>
        <span></span>
      </div>
      <div className="divide-y divide-[#D1D5DB]">
        {documents.map((document) => (
          <div key={document.documentId} className="grid gap-4 px-4 py-4 lg:grid-cols-[150px_150px_1.6fr_140px_150px_140px_150px] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 lg:hidden">Proyecto</p>
              <p className="text-sm font-medium text-[#2F3A45]">{document.projectCode}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 lg:hidden">Periodo</p>
              <p className="text-sm text-[#2F3A45]">{document.periodLabel}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 lg:hidden">Documento</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{document.documentType}</p>
              <p className="mt-1 text-xs text-gray-500">Ref. {document.documentReference}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 lg:hidden">Estado</p>
              <BillingStatusBadge status={document.generationStatus} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 lg:hidden">Última actualización</p>
              <p className="text-sm text-[#2F3A45]">{formatBillingDate(document.lastUpdatedAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 lg:hidden">Solicitado por</p>
              <p className="text-sm text-[#2F3A45]">{document.requestedBy || 'Sin solicitud registrada'}</p>
            </div>
            <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
              <button type="button" onClick={() => onOpenDetail(document)} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
                Ver detalle
                <ChevronRight size={14} />
              </button>
              <button type="button" onClick={() => onDownload(document)} disabled={!canDownloadBillingDocument(document)} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:border-[#D1D5DB] disabled:text-gray-400 enabled:border-[#16A34A]/20 enabled:text-[#166534] enabled:hover:bg-[#16A34A]/5">
                <Download size={14} />
                Descargar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}