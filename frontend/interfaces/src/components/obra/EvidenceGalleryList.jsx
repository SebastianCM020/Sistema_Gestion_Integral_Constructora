import React from 'react';
import { Image as ImageIcon, RefreshCw, Trash2 } from 'lucide-react';
import { formatEvidenceDate } from '../../utils/evidenceHelpers.js';
import { PendingSyncBadge } from './PendingSyncBadge.jsx';

export function EvidenceGalleryList({ evidenceItems, selectedEvidenceId, onSelect, onDelete, onRetry }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">Galería de evidencias</h2>
          <p className="mt-1 text-sm text-gray-600">Seleccione una evidencia para verla en grande y operar sobre ella sin perder el contexto del avance.</p>
        </div>
        <span className="text-sm font-medium text-gray-500">{evidenceItems.length} archivo{evidenceItems.length === 1 ? '' : 's'}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {evidenceItems.map((evidence, index) => (
          <article key={evidence.id} className={`rounded-[12px] border p-3 transition-colors ${selectedEvidenceId === evidence.id ? 'border-[#1F4E79] bg-[#DCEAF7]/30' : 'border-[#D1D5DB] bg-[#F7F9FC]'}`}>
            <button type="button" onClick={() => onSelect(evidence.id)} className="w-full text-left">
              <div className="flex items-center gap-3">
                <img src={evidence.previewUrl || evidence.localUri} alt={`Miniatura ${index + 1}`} className="h-20 w-20 rounded-[12px] object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#2F3A45]">Evidencia {String(index + 1).padStart(2, '0')}</p>
                  <p className="mt-1 text-xs text-gray-500">{formatEvidenceDate(evidence.capturedAt)}</p>
                  <div className="mt-2"><PendingSyncBadge syncStatus={evidence.syncStatus} /></div>
                </div>
                <ImageIcon size={18} className="text-gray-400" />
              </div>
            </button>

            <div className="mt-3 flex flex-wrap gap-2">
              {(evidence.syncStatus === 'failed' || evidence.syncStatus === 'retry-pending') ? (
                <button type="button" onClick={() => onRetry(evidence)} className="inline-flex h-[36px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-xs font-medium text-[#2F3A45] hover:bg-white">
                  <RefreshCw size={14} />
                  Reintentar
                </button>
              ) : null}
              {evidence.syncStatus !== 'synced' ? (
                <button type="button" onClick={() => onDelete(evidence)} className="inline-flex h-[36px] items-center justify-center gap-2 rounded-[10px] border border-[#DC2626]/20 px-3 text-xs font-medium text-[#DC2626] hover:bg-[#FEE2E2]/50">
                  <Trash2 size={14} />
                  Eliminar
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}