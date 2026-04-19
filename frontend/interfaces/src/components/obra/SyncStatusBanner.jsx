import React from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

const toneMap = {
  info: 'border-[#1F4E79]/20 bg-[#DCEAF7] text-[#1F4E79]',
  success: 'border-[#16A34A]/20 bg-[#DCFCE7] text-[#166534]',
  warning: 'border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]',
  danger: 'border-[#DC2626]/20 bg-[#FEE2E2] text-[#991B1B]',
  neutral: 'border-[#D1D5DB] bg-white text-[#2F3A45]',
};

export function SyncStatusBanner({ state, isOffline, isSyncing, hasPending, hasFailed, onToggleConnectivity, onSyncNow, onRetryFailed }) {
  return (
    <section className={`rounded-[12px] border p-5 shadow-sm ${toneMap[state.tone]}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">{state.title}</h2>
          <p className="mt-1 text-sm opacity-90">{state.description}</p>
        </div>
        <button type="button" onClick={onToggleConnectivity} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-current/20 bg-white/70 px-4 text-sm font-medium hover:bg-white">
          {isOffline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOffline ? 'Recuperar conexión' : 'Simular modo sin conexión'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={!hasPending || isSyncing} onClick={onSyncNow} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#2F3A45] px-4 text-sm font-medium text-white hover:bg-[#1F2937] disabled:cursor-not-allowed disabled:bg-[#94A3B8]">
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          Guardar y continuar
        </button>
        <button type="button" disabled={!hasFailed || isSyncing} onClick={onRetryFailed} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-current/30 px-4 text-sm font-medium hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-50">
          <RefreshCw size={16} />
          Reintentar sincronización
        </button>
      </div>
    </section>
  );
}