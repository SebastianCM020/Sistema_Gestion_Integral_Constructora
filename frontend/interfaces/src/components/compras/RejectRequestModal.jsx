import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';

export function RejectRequestModal({ request, onCancel, onConfirm }) {
  const [observation, setObservation] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!observation.trim()) {
      setError('Debe ingresar una observación para rechazar.');
      return;
    }

    onConfirm(observation);
  };

  return (
    <ModalShell title="Rechazar requerimiento" description="Ingrese la observación del rechazo antes de confirmar la devolución del requerimiento." onClose={onCancel} widthClass="max-w-xl">
      <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
        <p><span className="font-semibold">Código:</span> {request.code}</p>
        <p className="mt-2"><span className="font-semibold">Proyecto:</span> {request.projectCode} · {request.projectName}</p>
        <p className="mt-2"><span className="font-semibold">Solicitante:</span> {request.requesterName}</p>
      </div>

      <div className="mt-5">
        <label htmlFor="reject-observation" className="block text-sm font-medium text-[#2F3A45]">Observación obligatoria</label>
        <textarea
          id="reject-observation"
          value={observation}
          onChange={(event) => {
            setObservation(event.target.value);
            if (error) {
              setError('');
            }
          }}
          placeholder="Debe indicar el motivo antes de rechazar."
          className="mt-2 min-h-[140px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-sm text-[#2F3A45] outline-none placeholder:text-gray-400"
        />
        {error ? <p className="mt-2 text-sm text-[#DC2626]">{error}</p> : null}
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={handleConfirm} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#DC2626] px-4 text-sm font-medium text-white hover:bg-[#B91C1C]">Rechazar requerimiento</button>
      </div>
    </ModalShell>
  );
}