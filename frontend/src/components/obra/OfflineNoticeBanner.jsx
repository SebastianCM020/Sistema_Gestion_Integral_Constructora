import React from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineNoticeBanner() {
  return (
    <section className="rounded-[12px] border border-[#F59E0B]/20 bg-[#FFF7ED] p-4 text-[#92400E] shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#F59E0B]/10">
          <WifiOff size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Modo sin conexión activo</h2>
          <p className="mt-1 text-sm">Puede seguir capturando evidencia. Los archivos quedarán guardados localmente y aparecerán en la cola para sincronizar más tarde.</p>
        </div>
      </div>
    </section>
  );
}