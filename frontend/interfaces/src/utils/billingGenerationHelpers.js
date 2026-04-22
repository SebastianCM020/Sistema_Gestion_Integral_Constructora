export function getBillingEligibilityMeta(period) {
  if (!period) {
    return {
      label: 'Seleccione un periodo',
      description: 'Elija un periodo para validar elegibilidad y documentos disponibles.',
      tone: 'neutral',
      canGenerate: false,
    };
  }

  if (period.isEligible) {
    return {
      label: 'Periodo elegible',
      description: period.eligibilityMessage,
      tone: 'success',
      canGenerate: true,
    };
  }

  return {
    label: 'Periodo no elegible',
    description: period.eligibilityMessage,
    tone: 'danger',
    canGenerate: false,
  };
}

export function getBillingQueueMeta(queueItem, document) {
  if (document?.generationStatus === 'queued') {
    return {
      label: 'La planilla está en cola',
      description: queueItem?.estimatedCompletionLabel || 'El documento ingresó a procesamiento diferido y puede consultarse nuevamente desde esta misma vista.',
      tone: 'warning',
    };
  }

  if (document?.generationStatus === 'processing') {
    return {
      label: 'La planilla está siendo procesada',
      description: queueItem?.estimatedCompletionLabel || 'El sistema está consolidando la información cerrada del periodo seleccionado.',
      tone: 'info',
    };
  }

  if (document?.generationStatus === 'failed') {
    return {
      label: 'La generación requiere reintento',
      description: document.errorMessage || 'Hubo un problema controlado durante la generación del PDF.',
      tone: 'danger',
    };
  }

  if (document?.generationStatus === 'ready') {
    return {
      label: 'Documento listo para descarga',
      description: 'La planilla puede descargarse y mantenerse como soporte del periodo.',
      tone: 'success',
    };
  }

  return {
    label: 'Listo para generar',
    description: 'Puede emitir la planilla PDF para este periodo cuando lo requiera.',
    tone: 'neutral',
  };
}

export function createQueuedBillingDocument(document, userName, nowIso) {
  return {
    ...document,
    generationStatus: 'queued',
    queueStatus: 'pending',
    requestedAt: nowIso,
    requestedBy: userName,
    generatedAt: null,
    generatedBy: null,
    lastUpdatedAt: nowIso,
    errorMessage: '',
    fileName: '',
    fileSize: '',
    downloadUrl: '',
    notes: 'La planilla fue enviada a procesamiento diferido por volumen documental.',
  };
}

export function createProcessingBillingDocument(document, userName, nowIso) {
  return {
    ...document,
    generationStatus: 'processing',
    queueStatus: 'running',
    requestedAt: nowIso,
    requestedBy: userName,
    generatedAt: null,
    generatedBy: null,
    lastUpdatedAt: nowIso,
    errorMessage: '',
    fileName: '',
    fileSize: '',
    downloadUrl: '',
    notes: 'La planilla está siendo generada con la información cerrada del periodo.',
  };
}

export function createReadyBillingDocument(document, userName, nowIso) {
  return {
    ...document,
    generationStatus: 'ready',
    queueStatus: 'completed',
    requestedAt: document.requestedAt || nowIso,
    requestedBy: document.requestedBy || userName,
    generatedAt: nowIso,
    generatedBy: userName,
    lastUpdatedAt: nowIso,
    errorMessage: '',
    fileName: `${document.projectCode}_planilla_cobro_${document.periodo}.pdf`,
    fileSize: '2.2 MB',
    downloadUrl: `/downloads/${document.projectCode}_planilla_cobro_${document.periodo}.pdf`,
    notes: 'Documento generado correctamente y disponible para descarga.',
  };
}

export function createFailedQueueItem(documentId, previousItem, nowIso) {
  return {
    documentId,
    queueStatus: 'failed',
    attempts: (previousItem?.attempts ?? 0) + 1,
    lastUpdatedAt: nowIso,
    processor: previousItem?.processor ?? 'billing-pdf-generator',
    estimatedCompletionLabel: '',
  };
}

export function createQueuedQueueItem(documentId, previousItem, nowIso) {
  return {
    documentId,
    queueStatus: 'pending',
    attempts: (previousItem?.attempts ?? 0) + 1,
    lastUpdatedAt: nowIso,
    processor: previousItem?.processor ?? 'billing-pdf-generator',
    estimatedCompletionLabel: 'Aproximadamente 3 minutos',
  };
}

export function createRunningQueueItem(documentId, previousItem, nowIso) {
  return {
    documentId,
    queueStatus: 'running',
    attempts: previousItem?.attempts ?? 1,
    lastUpdatedAt: nowIso,
    processor: previousItem?.processor ?? 'billing-pdf-generator',
    estimatedCompletionLabel: 'Procesamiento en curso',
  };
}

export function createCompletedQueueItem(documentId, previousItem, nowIso) {
  return {
    documentId,
    queueStatus: 'completed',
    attempts: previousItem?.attempts ?? 1,
    lastUpdatedAt: nowIso,
    processor: previousItem?.processor ?? 'billing-pdf-generator',
    estimatedCompletionLabel: '',
  };
}