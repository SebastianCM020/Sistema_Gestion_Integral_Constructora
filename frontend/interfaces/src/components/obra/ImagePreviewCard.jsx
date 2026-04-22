import React from 'react';
import { Eye, RefreshCw, Trash2 } from 'lucide-react';
import { canDeleteEvidence, canReplaceEvidence, formatEvidenceDate } from '../../utils/evidenceHelpers.js';
import { PendingSyncBadge } from './PendingSyncBadge.jsx';

export function ImagePreviewCard({ evidence, onReplace, onDelete, onRetry }) {
  if (!evidence) {
    return null;
  }

  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">Previsualización principal</h2>
          <p className="mt-1 text-sm text-gray-600">Revise la evidencia antes de guardar o sincronizar. Puede reemplazarla o eliminarla si aún no fue enviada.</p>
        </div>
        <PendingSyncBadge syncStatus={evidence.syncStatus} />
      </div>

      <div className="mt-4 overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC]">
        <img src={evidence.previewUrl || evidence.localUri} alt={`Evidencia ${evidence.id}`} className="h-[240px] w-full object-cover md:h-[320px]" />
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
        <span className="inline-flex items-center gap-2"><Eye size={16} /> Capturada {formatEvidenceDate(evidence.capturedAt)}</span>
        <span>Fuente: {evidence.captureSource === 'camera' ? 'Cámara' : 'Galería'}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => onReplace(evidence)} disabled={!canReplaceEvidence(evidence)} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#1F4E79] px-4 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40 disabled:cursor-not-allowed disabled:border-[#D1D5DB] disabled:text-gray-400">
          <RefreshCw size={16} />
          Reemplazar
        </button>
        <button type="button" onClick={() => onDelete(evidence)} disabled={!canDeleteEvidence(evidence)} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#DC2626]/30 px-4 text-sm font-medium text-[#DC2626] hover:bg-[#FEE2E2]/60 disabled:cursor-not-allowed disabled:border-[#D1D5DB] disabled:text-gray-400">
          <Trash2 size={16} />
          Eliminar
        </button>
        {evidence.syncStatus === 'failed' || evidence.syncStatus === 'retry-pending' ? (
          <button type="button" onClick={() => onRetry(evidence)} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#2F3A45] px-4 text-sm font-medium text-white hover:bg-[#1F2937]">
            <RefreshCw size={16} />
            Reintentar
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>
    </section>
  );
}