import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { CsvImportDropzone } from './CsvImportDropzone.jsx';
import { CsvImportSummary } from './CsvImportSummary.jsx';
import { CsvImportErrorsTable } from './CsvImportErrorsTable.jsx';
import {
  buildCsvImportResult,
  createImportedRubros,
  parseCsvText,
  validateCsvHeaders,
  validateCsvRows,
} from '../../utils/csvImportHelpers.js';
import { getRubroContextLabel } from '../../utils/rubroHelpers.js';

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function CsvImportModal({ currentProject, existingRubros, onCancel, onComplete }) {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [globalError, setGlobalError] = useState('');
  const [progress, setProgress] = useState(null);
  const [validRows, setValidRows] = useState([]);
  const [hasImported, setHasImported] = useState(false);

  const resetStateForFile = (nextFile) => {
    setFile(nextFile);
    setSummary(null);
    setValidationErrors([]);
    setGlobalError('');
    setProgress(null);
    setValidRows([]);
    setHasImported(false);
  };

  const handleValidate = async () => {
    if (!file) {
      setGlobalError('Seleccione un archivo CSV para continuar.');
      return;
    }

    setGlobalError('');
    setProgress(20);

    const startedAt = new Date().toISOString();
    await wait(220);

    const text = await file.text();
    const parsed = parseCsvText(text);

    if (!parsed.rows.length) {
      setProgress(null);
      setSummary({
        id: `imp-${Date.now()}`,
        projectId: currentProject.id,
        fileName: file.name,
        startedAt,
        finishedAt: new Date().toISOString(),
        totalRows: 0,
        importedRows: 0,
        failedRows: 0,
        status: 'failed',
        errors: [{ row: '-', field: 'Archivo', message: 'El archivo no contiene filas para procesar.' }],
      });
      setValidationErrors([{ row: '-', field: 'Archivo', message: 'El archivo no contiene filas para procesar.' }]);
      return;
    }

    const headerValidation = validateCsvHeaders(parsed.headers);
    if (!headerValidation.isValid) {
      const nextError = [{ row: '-', field: 'Cabecera', message: headerValidation.message }];
      setProgress(null);
      setSummary({
        id: `imp-${Date.now()}`,
        projectId: currentProject.id,
        fileName: file.name,
        startedAt,
        finishedAt: new Date().toISOString(),
        totalRows: parsed.rows.length,
        importedRows: 0,
        failedRows: parsed.rows.length,
        status: 'failed',
        errors: nextError,
      });
      setValidationErrors(nextError);
      return;
    }

    setProgress(55);
    await wait(220);

    const validation = validateCsvRows(parsed.rows, currentProject, existingRubros);
    const result = buildCsvImportResult({
      fileName: file.name,
      projectId: currentProject.id,
      totalRows: parsed.rows.length,
      validRows: validation.validRows,
      errors: validation.errors,
      startedAt,
      finishedAt: new Date().toISOString(),
    });

    setValidRows(validation.validRows);
    setValidationErrors(validation.errors);
    setSummary(result);
    setProgress(null);
    setHasImported(false);
  };

  const handleImport = async () => {
    if (!summary || !validRows.length) {
      return;
    }

    setProgress(15);
    await wait(180);
    setProgress(45);
    await wait(180);
    setProgress(80);
    await wait(180);
    setProgress(100);
    await wait(120);

    const importedRubros = createImportedRubros(validRows);
    onComplete(summary, importedRubros);
    setProgress(null);
    setHasImported(true);
  };

  const canImport = summary && summary.status !== 'failed' && validRows.length > 0;
  const hasFinishedImport = Boolean(hasImported && summary && progress == null);

  return (
    <ModalShell
      title="Importar CSV"
      description="Seleccione un archivo CSV, valide su estructura y revise el resultado antes de volver al listado."
      onClose={onCancel}
      widthClass="max-w-5xl"
    >
      <div className="space-y-5">
        <section className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          Proyecto actual: <span className="font-semibold">{getRubroContextLabel(currentProject)}</span>
        </section>

        <CsvImportDropzone fileName={file?.name ?? ''} onFileSelected={resetStateForFile} />

        <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 text-sm text-gray-600">
          Formato esperado: Código, Descripción, Unidad, Precio Unitario, Cantidad Presupuestada. Si el archivo no cumple, se mostrará un error global claro antes de importar.
        </div>

        {globalError ? <div className="rounded-[12px] border border-[#DC2626]/15 bg-[#DC2626]/10 px-4 py-3 text-sm font-medium text-[#B91C1C]">{globalError}</div> : null}

        <CsvImportSummary result={summary} progress={progress} />
        <CsvImportErrorsTable errors={validationErrors} />

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
            {hasFinishedImport ? 'Volver al listado' : 'Cancelar'}
          </button>
          {!summary ? (
            <button type="button" onClick={handleValidate} className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
              Validar archivo
            </button>
          ) : null}
          {summary && !hasFinishedImport ? null : null}
          {canImport && !hasFinishedImport ? null : null}
          {canImport && !progress && !hasImported ? (
            <button type="button" onClick={handleImport} className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
              Importar rubros válidos
            </button>
          ) : null}
        </div>
      </div>
    </ModalShell>
  );
}