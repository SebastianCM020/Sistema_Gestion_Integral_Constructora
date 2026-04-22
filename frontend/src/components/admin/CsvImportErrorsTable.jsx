import React from 'react';

export function CsvImportErrorsTable({ errors }) {
  if (!errors?.length) {
    return null;
  }

  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm">
      <div className="border-b border-[#D1D5DB] px-5 py-4">
        <h4 className="text-sm font-semibold text-[#2F3A45]">Errores detectados</h4>
        <p className="mt-1 text-sm text-gray-500">Revise fila, campo y observación antes de intentar una nueva carga.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#D1D5DB]">
          <thead className="bg-[#F7F9FC] text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            <tr>
              <th className="px-5 py-4">Fila</th>
              <th className="px-5 py-4">Campo</th>
              <th className="px-5 py-4">Observación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D1D5DB] text-sm text-[#2F3A45]">
            {errors.map((error, index) => (
              <tr key={`${error.row}-${error.field}-${index}`}>
                <td className="px-5 py-4">{error.row}</td>
                <td className="px-5 py-4">{error.field}</td>
                <td className="px-5 py-4">{error.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}