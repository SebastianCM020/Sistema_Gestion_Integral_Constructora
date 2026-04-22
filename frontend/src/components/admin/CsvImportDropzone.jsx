import React, { useRef } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';

export function CsvImportDropzone({ fileName, onFileSelected }) {
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
        className="flex w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-[#1F4E79]/35 bg-[#DCEAF7]/30 px-6 py-8 text-center hover:bg-[#DCEAF7]/50"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-white text-[#1F4E79]">
          <Upload size={20} />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#2F3A45]">Arrastre un archivo CSV o selecciónelo manualmente</p>
        <p className="mt-2 text-sm text-gray-500">Cabecera esperada: Código, Descripción, Unidad, Precio Unitario, Cantidad Presupuestada.</p>
      </button>

      <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 text-sm text-[#2F3A45]">
        <div className="flex items-center gap-2 font-semibold">
          <FileSpreadsheet size={16} className="text-[#1F4E79]" />
          Archivo seleccionado
        </div>
        <p className="mt-2 text-gray-600">{fileName || 'Todavía no se ha seleccionado ningún archivo.'}</p>
      </div>
    </div>
  );
}