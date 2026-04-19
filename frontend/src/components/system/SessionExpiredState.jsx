import React from 'react';
import { Clock3 } from 'lucide-react';

export function SessionExpiredState({ title, description, onRestartSession, onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#F59E0B]/20 bg-white p-8 shadow-sm">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF7ED] text-[#F59E0B]"><Clock3 size={28} /></div>
      <h1 className="text-2xl font-semibold text-[#2F3A45]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={onRestartSession} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Volver a iniciar sesion</button>
        <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Volver al panel principal</button>
      </div>
    </section>
  );
}