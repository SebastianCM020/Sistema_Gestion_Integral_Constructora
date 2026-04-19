const expectedHeaders = ['Codigo', 'Descripcion', 'Unidad', 'Precio Unitario', 'Cantidad Presupuestada'];

function normalizeHeader(value) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function parseCsvLine(line) {
  return line.split(',').map((fragment) => fragment.trim().replace(/^"|"$/g, ''));
}

function normalizeNumber(value) {
  return Number(String(value).replace(/\./g, '').replace(',', '.'));
}

export function getExpectedCsvHeaders() {
  return ['Código', 'Descripción', 'Unidad', 'Precio Unitario', 'Cantidad Presupuestada'];
}

export function parseCsvText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line, index) => ({
    rowNumber: index + 2,
    values: parseCsvLine(line),
  }));

  return { headers, rows };
}

export function validateCsvHeaders(headers) {
  const normalizedHeaders = headers.map(normalizeHeader);
  const normalizedExpectedHeaders = expectedHeaders.map(normalizeHeader);

  const isValid =
    normalizedHeaders.length >= normalizedExpectedHeaders.length &&
    normalizedExpectedHeaders.every((header, index) => normalizedHeaders[index] === header);

  return {
    isValid,
    message: isValid
      ? 'Archivo validado correctamente.'
      : `La cabecera esperada es: ${getExpectedCsvHeaders().join(', ')}.`,
  };
}

export function validateCsvRows(rows, project, existingRubros) {
  const errors = [];
  const validRows = [];
  const seenCodes = new Set();

  rows.forEach((row) => {
    const [code, description, unit, unitPriceRaw, budgetedQuantityRaw] = row.values;
    const unitPrice = normalizeNumber(unitPriceRaw);
    const budgetedQuantity = normalizeNumber(budgetedQuantityRaw);
    const normalizedCode = (code ?? '').trim().toUpperCase();

    if (!normalizedCode) {
      errors.push({ row: row.rowNumber, field: 'Código', message: 'El código es obligatorio.' });
    }

    if (!description?.trim()) {
      errors.push({ row: row.rowNumber, field: 'Descripción', message: 'La descripción es obligatoria.' });
    }

    if (!unit?.trim()) {
      errors.push({ row: row.rowNumber, field: 'Unidad', message: 'La unidad es obligatoria.' });
    }

    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      errors.push({ row: row.rowNumber, field: 'Precio Unitario', message: 'El precio unitario no puede ser negativo.' });
    }

    if (Number.isNaN(budgetedQuantity) || budgetedQuantity <= 0) {
      errors.push({ row: row.rowNumber, field: 'Cantidad Presupuestada', message: 'La cantidad presupuestada debe ser positiva.' });
    }

    if (normalizedCode) {
      const duplicateExisting = existingRubros.some(
        (rubro) => rubro.projectId === project.id && rubro.code.toUpperCase() === normalizedCode
      );

      if (duplicateExisting) {
        errors.push({ row: row.rowNumber, field: 'Código', message: 'El código ya existe dentro del proyecto.' });
      }

      if (seenCodes.has(normalizedCode)) {
        errors.push({ row: row.rowNumber, field: 'Código', message: 'El código se repite dentro del archivo.' });
      }
    }

    const rowErrors = errors.filter((error) => error.row === row.rowNumber);

    if (!rowErrors.length) {
      seenCodes.add(normalizedCode);
      validRows.push({
        code: normalizedCode,
        description: description.trim(),
        unit: unit.trim(),
        unitPrice,
        budgetedQuantity,
        projectId: project.id,
        projectCode: project.code,
        projectName: project.name,
      });
    }
  });

  return { validRows, errors };
}

export function createImportedRubros(validRows) {
  const timestamp = new Date().toISOString();

  return validRows.map((row, index) => ({
    id: `rbr-import-${Date.now()}-${index}`,
    projectId: row.projectId,
    projectCode: row.projectCode,
    projectName: row.projectName,
    code: row.code,
    description: row.description,
    unit: row.unit,
    unitPrice: row.unitPrice,
    budgetedQuantity: row.budgetedQuantity,
    executedQuantity: 0,
    isActive: true,
    source: 'csv',
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}

export function buildCsvImportResult({ fileName, projectId, totalRows, validRows, errors, startedAt, finishedAt }) {
  const failedRows = new Set(errors.map((error) => error.row)).size;
  const importedRows = validRows.length;
  const status = !totalRows || (!importedRows && failedRows) ? 'failed' : failedRows ? 'partial' : 'success';

  return {
    id: `imp-${Date.now()}`,
    projectId,
    fileName,
    startedAt,
    finishedAt,
    totalRows,
    importedRows,
    failedRows,
    status,
    errors,
  };
}