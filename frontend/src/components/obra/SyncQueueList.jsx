import React from 'react';
import { RefreshCw } from 'lucide-react';
import { formatEvidenceDate } from '../../utils/evidenceHelpers.js';
import { PendingSyncBadge } from './PendingSyncBadge.jsx';

export function SyncQueueList({ queueItems, onPrimaryAction }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-[#2F3A45]">Cola de sincronización</h2>
        <p className="mt-1 text-sm text-gray-600">Revise los pendientes del dispositivo. Cada elemento representa un avance con evidencia asociada.</p>
      </div>

      <div className="mt-4 space-y-3">
        {queueItems.map((queueItem) => (
          <article key={queueItem.id} className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#2F3A45]">{queueItem.projectCode} · {queueItem.projectName}</p>
                <p className="mt-1 text-sm text-gray-600">{queueItem.rubroCode} · {queueItem.rubroDescription}</p>
                <p className="mt-2 text-xs text-gray-500">{queueItem.evidenceCount} evidencia{queueItem.evidenceCount === 1 ? '' : 's'} · Último intento: {formatEvidenceDate(queueItem.lastAttemptAt)}</p>
                {queueItem.errors?.length ? <p className="mt-2 text-xs text-[#991B1B]">{queueItem.errors[0]}</p> : null}
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <PendingSyncBadge syncStatus={queueItem.syncStatus} />
                {queueItem.syncStatus !== 'synced' ? (
                  <button type="button" onClick={() => onPrimaryAction(queueItem)} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-white">
                    <RefreshCw size={14} />
                    {queueItem.syncStatus === 'failed' ? 'Reintentar' : 'Sincronizar'}
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}