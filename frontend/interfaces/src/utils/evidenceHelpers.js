import { formatDateTime } from './projectHelpers.js';

export function buildEvidencePreview({ label, accent = '#1F4E79', background = '#DCEAF7' }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <rect width="1200" height="900" rx="36" fill="${background}" />
      <rect x="72" y="72" width="1056" height="756" rx="28" fill="#ffffff" opacity="0.88" />
      <rect x="144" y="164" width="912" height="460" rx="28" fill="${accent}" opacity="0.12" />
      <circle cx="924" cy="244" r="56" fill="${accent}" opacity="0.2" />
      <path d="M212 560L426 354L598 526L718 420L950 650H212Z" fill="${accent}" opacity="0.34" />
      <text x="160" y="730" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="700" fill="#2F3A45">${label}</text>
      <text x="160" y="792" font-family="Inter, Arial, sans-serif" font-size="30" fill="#4B5563">Evidencia operativa lista para sincronización</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function normalizeAdvanceContext(record) {
  if (!record) {
    return null;
  }

  return {
    advanceId: record.id,
    projectId: record.projectId,
    projectCode: record.projectCode,
    projectName: record.projectName,
    rubroId: record.rubroId,
    rubroCode: record.rubroCode,
    rubroDescription: record.rubroDescription,
    quantityAdvance: record.quantityAdvance,
    unit: record.unit,
    notes: record.notes ?? '',
    registeredAt: record.registeredAt,
    advanceStatus: record.status ?? 'registered',
    requiresEvidence: true,
  };
}

export function createEvidencePayload({ advanceContext, captureSource = 'camera', index = 1, simulateFailure = false }) {
  const timestamp = new Date().toISOString();
  const sourceLabel = captureSource === 'camera' ? 'CAM' : 'GAL';
  const previewLabel = `${sourceLabel} ${String(index).padStart(2, '0')}`;

  return {
    id: `evd-${Date.now()}-${index}`,
    advanceId: advanceContext.advanceId,
    projectId: advanceContext.projectId,
    projectCode: advanceContext.projectCode,
    projectName: advanceContext.projectName,
    rubroId: advanceContext.rubroId,
    rubroCode: advanceContext.rubroCode,
    rubroDescription: advanceContext.rubroDescription,
    quantityAdvance: advanceContext.quantityAdvance,
    unit: advanceContext.unit,
    localUri: buildEvidencePreview({
      label: previewLabel,
      accent: captureSource === 'camera' ? '#1F4E79' : '#0F766E',
      background: captureSource === 'camera' ? '#DCEAF7' : '#DCFCE7',
    }),
    previewUrl: buildEvidencePreview({
      label: previewLabel,
      accent: captureSource === 'camera' ? '#1F4E79' : '#0F766E',
      background: captureSource === 'camera' ? '#DCEAF7' : '#DCFCE7',
    }),
    remoteUrl: null,
    mimeType: 'image/jpeg',
    sizeBytes: captureSource === 'camera' ? 1840000 : 2260000,
    capturedAt: timestamp,
    syncStatus: 'pending',
    syncTimestamp: null,
    storageKey: null,
    captureSource,
    retryCount: 0,
    simulateFailure,
    isRequired: true,
    compressionStatus: 'compressed',
  };
}

export function replaceEvidencePayload(evidence) {
  const timestamp = new Date().toISOString();

  return {
    ...evidence,
    localUri: buildEvidencePreview({ label: 'REP 01', accent: '#1F4E79', background: '#E0F2FE' }),
    previewUrl: buildEvidencePreview({ label: 'REP 01', accent: '#1F4E79', background: '#E0F2FE' }),
    remoteUrl: null,
    sizeBytes: 1910000,
    capturedAt: timestamp,
    syncStatus: 'pending',
    syncTimestamp: null,
    storageKey: null,
    retryCount: 0,
    simulateFailure: false,
    compressionStatus: 'compressed',
  };
}

export function getEvidenceForAdvance(evidenceItems, advanceId) {
  return evidenceItems
    .filter((evidence) => evidence.advanceId === advanceId)
    .sort((leftEvidence, rightEvidence) => new Date(rightEvidence.capturedAt).getTime() - new Date(leftEvidence.capturedAt).getTime());
}

export function getSelectedEvidence(evidenceItems, selectedEvidenceId) {
  return evidenceItems.find((evidence) => evidence.id === selectedEvidenceId) ?? evidenceItems[0] ?? null;
}

export function getEvidenceSummary(evidenceItems) {
  return evidenceItems.reduce(
    (summary, evidence) => {
      summary.total += 1;

      if (evidence.syncStatus === 'synced') {
        summary.synced += 1;
      }

      if (evidence.syncStatus === 'failed') {
        summary.failed += 1;
      }

      if (evidence.syncStatus === 'retry-pending') {
        summary.retryPending += 1;
      }

      if (['pending', 'retry-pending', 'syncing'].includes(evidence.syncStatus)) {
        summary.pending += 1;
      }

      return summary;
    },
    { total: 0, pending: 0, synced: 0, failed: 0, retryPending: 0, minimumRequired: 1 }
  );
}

export function formatEvidenceSize(sizeBytes) {
  if (!sizeBytes) {
    return 'Sin tamaño';
  }

  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.ceil(sizeBytes / 1024)} KB`;
}

export function formatEvidenceDate(dateValue) {
  return formatDateTime(dateValue);
}

export function canDeleteEvidence(evidence) {
  return Boolean(evidence) && evidence.syncStatus !== 'syncing' && evidence.syncStatus !== 'synced';
}

export function canReplaceEvidence(evidence) {
  return Boolean(evidence) && evidence.syncStatus !== 'syncing';
}

export function validateEvidenceBeforeContinue(advanceContext, evidenceItems) {
  const errors = [];

  if (!advanceContext) {
    errors.push('No hay un avance activo para asociar evidencia en este momento.');
  }

  if (advanceContext && !evidenceItems.length) {
    errors.push('Capture al menos una evidencia antes de guardar o continuar.');
  }

  return {
    isValid: !errors.length,
    errors,
  };
}

export function getAdvanceReference(advanceContext) {
  if (!advanceContext?.advanceId) {
    return 'Sin avance activo';
  }

  return advanceContext.advanceId.toUpperCase();
}