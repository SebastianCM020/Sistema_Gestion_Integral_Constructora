export const mockBillingGenerationQueueByDocumentId = {
  'bill-001': {
    documentId: 'bill-001',
    queueStatus: 'idle',
    attempts: 0,
    lastUpdatedAt: '2026-04-10T09:30:00.000Z',
    processor: 'billing-pdf-generator',
    estimatedCompletionLabel: '',
  },
  'bill-003': {
    documentId: 'bill-003',
    queueStatus: 'failed',
    attempts: 1,
    lastUpdatedAt: '2026-03-05T15:14:00.000Z',
    processor: 'billing-pdf-generator',
    estimatedCompletionLabel: '',
  },
  'bill-101': {
    documentId: 'bill-101',
    queueStatus: 'completed',
    attempts: 1,
    lastUpdatedAt: '2026-04-08T13:28:00.000Z',
    processor: 'billing-pdf-generator',
    estimatedCompletionLabel: '',
  },
  'bill-102': {
    documentId: 'bill-102',
    queueStatus: 'running',
    attempts: 1,
    lastUpdatedAt: '2026-04-08T13:31:00.000Z',
    processor: 'billing-pdf-generator',
    estimatedCompletionLabel: 'Aproximadamente 3 minutos',
  },
  'bill-103': {
    documentId: 'bill-103',
    queueStatus: 'completed',
    attempts: 1,
    lastUpdatedAt: '2026-02-06T10:56:00.000Z',
    processor: 'billing-pdf-generator',
    estimatedCompletionLabel: '',
  },
};

export function getBillingGenerationQueueByDocumentId(documentId) {
  const queueItem = mockBillingGenerationQueueByDocumentId[documentId];

  return queueItem ? { ...queueItem } : null;
}