import React from 'react';
import { Download } from 'lucide-react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { BillingStatusBadge } from './BillingStatusBadge.jsx';
import { BillingDocumentInfoCard } from './BillingDocumentInfoCard.jsx';
import { canDownloadBillingDocument, formatBillingDate } from '../../utils/billingDocumentHelpers.js';

export function BillingDetailDrawer({ document, onClose, onDownload }) {
  return (
    <DrawerPanel title="Detalle del documento" description="Revise trazabilidad, estado de generación y disponibilidad de descarga sin perder el listado activo." onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <BillingStatusBadge status={document.generationStatus} />
          </div>
          <p className="mt-3 text-sm font-semibold text-[#2F3A45]">{document.documentType}</p>
          <p className="mt-1 text-sm text-gray-600">{document.projectCode} · {document.projectName}</p>
          <p className="mt-1 text-sm text-gray-600">Periodo: {document.periodLabel}</p>
          <p className="mt-3 text-sm text-gray-600">{document.notes || 'Sin observaciones registradas.'}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <BillingDocumentInfoCard title="Referencia documental" value={document.documentReference} helper={`Traza ${document.traceId}`} />
          <BillingDocumentInfoCard title="Última actualización" value={formatBillingDate(document.lastUpdatedAt)} helper="Fecha visible para auditoría del proceso" />
          <BillingDocumentInfoCard title="Solicitud registrada" value={document.requestedBy || 'Sin solicitud'} helper={formatBillingDate(document.requestedAt)} />
          <BillingDocumentInfoCard title="Generación" value={document.generatedBy || 'Pendiente'} helper={formatBillingDate(document.generatedAt)} />
          <BillingDocumentInfoCard title="Archivo" value={document.fileName || 'Aún no disponible'} helper={document.fileSize || 'Sin tamaño registrado'} />
          <BillingDocumentInfoCard title="Estado de cola" value={document.queueStatus || 'Sin cola'} helper="Preparado para futura integración con procesamiento diferido" />
        </div>

        {document.errorMessage ? (
          <div className="rounded-[12px] border border-[#DC2626]/15 bg-[#FEE2E2]/60 p-4 text-sm text-[#991B1B]">
            <p className="font-semibold">Observación de generación</p>
            <p className="mt-2">{document.errorMessage}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar detalle</button>
          <button type="button" onClick={() => onDownload(document)} disabled={!canDownloadBillingDocument(document)} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:border-[#D1D5DB] disabled:text-gray-400 enabled:border-[#16A34A]/20 enabled:text-[#166534] enabled:hover:bg-[#16A34A]/5">
            <Download size={16} />
            Descargar documento
          </button>
        </div>
      </div>
    </DrawerPanel>
  );
}