import React from 'react';
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw } from 'lucide-react';

const iconMap = {
  synced: CheckCircle2,
  pending: Clock3,
  'retry-pending': RefreshCw,
  failed: AlertTriangle,
  error: AlertTriangle,
};

const toneMap = {
  synced: 'border-[#16A34A]/20 bg-[#DCFCE7] text-[#166534]',
  pending: 'border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]',
  'retry-pending': 'border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]',
  failed: 'border-[#DC2626]/20 bg-[#FEE2E2] text-[#991B1B]',
  error: 'border-[#DC2626]/20 bg-[#FEE2E2] text-[#991B1B]',
};

export function SyncResultState({ result, onDismiss, onBackToProgress, onGoHome }) {
  const Icon = iconMap[result.status] ?? Clock3;

  return (
    <section className={`rounded-[12px] border p-5 shadow-sm ${toneMap[result.status] ?? toneMap.pending}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-white/70">
          <Icon size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{result.title}</h2>
          <p className="mt-1 text-sm opacity-90">{result.description}</p>
          {(result.syncedCount || result.pendingCount || result.failedCount) ? (
            <p className="mt-2 text-sm opacity-90">Sincronizadas: {result.syncedCount ?? 0} · Pendientes: {result.pendingCount ?? 0} · Con error: {result.failedCount ?? 0}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={onDismiss} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-current/20 bg-white/70 px-4 text-sm font-medium hover:bg-white">Seguir en evidencia</button>
        <button type="button" onClick={onBackToProgress} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-current/20 bg-white/70 px-4 text-sm font-medium hover:bg-white">Volver al avance</button>
        <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#2F3A45] px-4 text-sm font-medium text-white hover:bg-[#1F2937]">Volver al panel</button>
      </div>
    </section>
  );
}