import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { formatAuditDate } from '../../utils/auditHelpers.js';

export function AuditTraceabilityHeader({ filterSummary, resultsLabel, dateFrom, dateTo, onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Panel principal</button>
        <span>/</span>
        <span className="font-medium text-[#1F4E79]">Auditoria y trazabilidad</span>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]"><ShieldCheck size={22} /></div>
          <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Auditoria y trazabilidad</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">Consulte la bitacora de cambios del sistema, rastree eventos sensibles y siga la secuencia cronologica por usuario, proyecto o transaccion.</p>
          <p className="mt-3 text-sm text-[#1F4E79]">Rango visible: <span className="font-semibold">{formatAuditDate(dateFrom)}</span> a <span className="font-semibold">{formatAuditDate(dateTo)}</span></p>
          <p className="mt-2 text-sm text-gray-600">{filterSummary}</p>
          <p className="mt-2 text-xs text-gray-500">{resultsLabel}</p>
        </div>

        <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
          <ArrowLeft size={16} />
          Volver al panel
        </button>
      </div>
    </section>
  );
}