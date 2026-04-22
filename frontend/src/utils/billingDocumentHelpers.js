export function formatBillingDate(dateValue) {
  if (!dateValue) {
    return 'Sin registro disponible';
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

export function getBillingStatusMeta(status) {
  if (status === 'ready') {
    return { label: 'Generado', tone: 'success' };
  }

  if (status === 'processing') {
    return { label: 'Generando', tone: 'info' };
  }

  if (status === 'queued') {
    return { label: 'En cola', tone: 'warning' };
  }

  if (status === 'failed') {
    return { label: 'Falló la generación', tone: 'danger' };
  }

  return { label: 'Listo para generar', tone: 'neutral' };
}

export function canDownloadBillingDocument(document) {
  return document.generationStatus === 'ready' && Boolean(document.downloadUrl);
}

export function getPrimaryBillingDocument(documents) {
  return documents.find((document) => document.primaryDocument) ?? null;
}

export function getBillingSummary(documents) {
  return documents.reduce(
    (summary, document) => {
      summary.total += 1;

      if (document.generationStatus === 'ready') {
        summary.generated += 1;
      }

      if (['queued', 'processing'].includes(document.generationStatus)) {
        summary.inProcess += 1;
      }

      if (document.generationStatus === 'failed') {
        summary.errors += 1;
      }

      return summary;
    },
    { total: 0, generated: 0, inProcess: 0, errors: 0 }
  );
}

export function getDocumentStatusHeadline(primaryDocument) {
  if (!primaryDocument) {
    return 'No hay documento principal para este periodo';
  }

  if (primaryDocument.generationStatus === 'ready') {
    return 'La planilla del periodo está lista para descarga';
  }

  if (primaryDocument.generationStatus === 'processing') {
    return 'La planilla está siendo generada';
  }

  if (primaryDocument.generationStatus === 'queued') {
    return 'La planilla quedó en cola de procesamiento';
  }

  if (primaryDocument.generationStatus === 'failed') {
    return 'La última generación presentó un error controlado';
  }

  return 'El periodo está listo para generar la planilla PDF';
}