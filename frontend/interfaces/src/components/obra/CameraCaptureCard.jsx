import React from 'react';
import { Camera, ImagePlus, LoaderCircle } from 'lucide-react';

export function CameraCaptureCard({ capturedCount, minimumRequired, isBusy, feedbackMessage, onCaptureCamera, onSelectGallery, disabled }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#2F3A45]">Captura de evidencia</h2>
      <p className="mt-1 text-sm text-gray-600">Capture o seleccione imágenes del frente. La compresión y el guardado local se simulan como preparación para un flujo real de dispositivo.</p>

      <div className="mt-4 rounded-[12px] border border-dashed border-[#1F4E79]/30 bg-[#DCEAF7]/35 p-4 text-sm text-[#2F3A45]">
        <p className="font-medium">Mínimo sugerido: {minimumRequired} evidencia</p>
        <p className="mt-1 text-gray-600">Actualmente tiene {capturedCount} archivo{capturedCount === 1 ? '' : 's'} asociado{capturedCount === 1 ? '' : 's'} a este avance.</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" disabled={disabled || isBusy} onClick={onCaptureCamera} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c] disabled:cursor-not-allowed disabled:bg-[#94A3B8]">
          {isBusy ? <LoaderCircle size={18} className="animate-spin" /> : <Camera size={18} />}
          Capturar evidencia
        </button>
        <button type="button" disabled={disabled || isBusy} onClick={onSelectGallery} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:text-gray-400">
          <ImagePlus size={18} />
          Seleccionar imagen
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-600">{feedbackMessage}</p>
    </section>
  );
}