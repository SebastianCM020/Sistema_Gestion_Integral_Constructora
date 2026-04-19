import React from 'react';
import { formatEvidenceDate, formatEvidenceSize } from '../../utils/evidenceHelpers.js';

export function EvidenceMetadataCard({ evidence }) {
  if (!evidence) {
    return null;
  }

  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-[#2F3A45]">Metadatos de la evidencia</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          <p><span className="font-semibold">ID:</span> {evidence.id}</p>
          <p className="mt-2"><span className="font-semibold">Captura:</span> {formatEvidenceDate(evidence.capturedAt)}</p>
          <p className="mt-2"><span className="font-semibold">Tipo:</span> {evidence.mimeType}</p>
        </div>
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          <p><span className="font-semibold">Tamaño:</span> {formatEvidenceSize(evidence.sizeBytes)}</p>
          <p className="mt-2"><span className="font-semibold">URI local:</span> {evidence.localUri ? 'Disponible' : 'No disponible'}</p>
          <p className="mt-2"><span className="font-semibold">Storage key:</span> {evidence.storageKey ?? 'Pendiente de sincronización'}</p>
        </div>
      </div>
    </section>
  );
}