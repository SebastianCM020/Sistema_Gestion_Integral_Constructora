export function getSyncStatusMeta(status) {
  if (status === 'synced') {
    return {
      label: 'Sincronizada',
      description: 'Cargada correctamente en la nube operativa.',
      toneClass: 'border-[#16A34A]/20 bg-[#16A34A]/10 text-[#166534]',
    };
  }

  if (status === 'failed') {
    return {
      label: 'Sincronización fallida',
      description: 'La carga no se completó. Puede reintentarlo ahora.',
      toneClass: 'border-[#DC2626]/20 bg-[#DC2626]/10 text-[#991B1B]',
    };
  }

  if (status === 'retry-pending') {
    return {
      label: 'Reintento pendiente',
      description: 'La evidencia espera una nueva conexión para reintentarse.',
      toneClass: 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#92400E]',
    };
  }

  if (status === 'syncing') {
    return {
      label: 'Sincronizando',
      description: 'La carga está en proceso.',
      toneClass: 'border-[#1F4E79]/20 bg-[#DCEAF7] text-[#1F4E79]',
    };
  }

  return {
    label: 'Pendiente',
    description: 'Guardada localmente y pendiente por enviar.',
    toneClass: 'border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]',
  };
}

function deriveQueueStatus(evidenceItems) {
  if (evidenceItems.some((evidence) => evidence.syncStatus === 'failed')) {
    return 'failed';
  }

  if (evidenceItems.some((evidence) => evidence.syncStatus === 'retry-pending')) {
    return 'retry-pending';
  }

  if (evidenceItems.some((evidence) => ['pending', 'syncing'].includes(evidence.syncStatus))) {
    return 'pending';
  }

  return 'synced';
}

export function upsertQueueEntry(queueItems, evidenceItems, advanceId, forcedStatus, options = {}) {
  const allAdvanceEvidence = evidenceItems.filter((evidence) => evidence.advanceId === advanceId);

  if (!allAdvanceEvidence.length) {
    return queueItems.filter((item) => item.advanceId !== advanceId);
  }

  const existingEntry = queueItems.find((item) => item.advanceId === advanceId);
  const status = forcedStatus ?? deriveQueueStatus(allAdvanceEvidence);
  const referenceEvidence = allAdvanceEvidence[0];

  const nextEntry = {
    id: existingEntry?.id ?? `que-${advanceId}`,
    advanceId,
    projectId: referenceEvidence.projectId,
    projectCode: referenceEvidence.projectCode,
    projectName: referenceEvidence.projectName,
    rubroCode: referenceEvidence.rubroCode,
    rubroDescription: referenceEvidence.rubroDescription,
    evidenceCount: allAdvanceEvidence.length,
    syncStatus: status,
    lastAttemptAt: options.lastAttemptAt ?? existingEntry?.lastAttemptAt ?? null,
    retryCount:
      typeof options.retryCount === 'number'
        ? options.retryCount
        : existingEntry?.retryCount ?? 0,
    errors: options.errors ?? existingEntry?.errors ?? [],
  };

  return [nextEntry, ...queueItems.filter((item) => item.advanceId !== advanceId)];
}

export function resolveSyncAttempt({ evidenceItems, queueItems, advanceId, isOffline, targetEvidenceId = null }) {
  const scopeEvidence = evidenceItems.filter((evidence) => {
    if (targetEvidenceId) {
      return evidence.id === targetEvidenceId;
    }

    return evidence.advanceId === advanceId && evidence.syncStatus !== 'synced';
  });

  if (!scopeEvidence.length) {
    return {
      evidenceItems,
      queueItems,
      result: {
        status: 'idle',
        title: 'No hay elementos pendientes por sincronizar',
        description: 'La evidencia seleccionada ya está sincronizada o no requiere acciones adicionales.',
      },
    };
  }

  const timestamp = new Date().toISOString();

  if (isOffline) {
    const nextEvidenceItems = evidenceItems.map((evidence) => {
      if (!scopeEvidence.some((currentItem) => currentItem.id === evidence.id)) {
        return evidence;
      }

      const nextStatus = evidence.syncStatus === 'failed' ? 'retry-pending' : 'pending';

      return {
        ...evidence,
        syncStatus: nextStatus,
        lastAttemptAt: timestamp,
        retryCount: evidence.retryCount + (evidence.syncStatus === 'failed' ? 1 : 0),
      };
    });

    const nextQueueItems = upsertQueueEntry(queueItems, nextEvidenceItems, scopeEvidence[0].advanceId, undefined, {
      lastAttemptAt: timestamp,
      errors: ['Sin conexión disponible. La evidencia seguirá pendiente hasta recuperar red.'],
      retryCount: (queueItems.find((item) => item.advanceId === scopeEvidence[0].advanceId)?.retryCount ?? 0) + 1,
    });

    return {
      evidenceItems: nextEvidenceItems,
      queueItems: nextQueueItems,
      result: {
        status: scopeEvidence.some((evidence) => evidence.syncStatus === 'failed') ? 'retry-pending' : 'pending',
        title: 'Sin conexión: la evidencia quedó pendiente',
        description: 'Los archivos se conservaron localmente y se podrán sincronizar cuando vuelva la conectividad.',
        syncedCount: 0,
        pendingCount: scopeEvidence.length,
        failedCount: 0,
      },
    };
  }

  let syncedCount = 0;
  let failedCount = 0;

  const nextEvidenceItems = evidenceItems.map((evidence) => {
    if (!scopeEvidence.some((currentItem) => currentItem.id === evidence.id)) {
      return evidence;
    }

    if (evidence.simulateFailure && evidence.retryCount === 0) {
      failedCount += 1;

      return {
        ...evidence,
        syncStatus: 'failed',
        lastAttemptAt: timestamp,
        retryCount: evidence.retryCount + 1,
      };
    }

    syncedCount += 1;

    return {
      ...evidence,
      syncStatus: 'synced',
      syncTimestamp: timestamp,
      remoteUrl: evidence.remoteUrl ?? `https://storage.icaro.local/evidence/${evidence.id}.jpg`,
      storageKey: evidence.storageKey ?? `evidence/${evidence.projectId}/${evidence.id}.jpg`,
      lastAttemptAt: timestamp,
      retryCount: evidence.retryCount + (evidence.syncStatus === 'failed' || evidence.syncStatus === 'retry-pending' ? 1 : 0),
      simulateFailure: false,
    };
  });

  const nextQueueItems = upsertQueueEntry(nextQueueItemsPlaceholder(queueItems), nextEvidenceItems, scopeEvidence[0].advanceId, failedCount ? 'failed' : undefined, {
    lastAttemptAt: timestamp,
    errors: failedCount ? ['Una evidencia no pudo sincronizarse. Reintente para completar la carga.'] : [],
    retryCount: (queueItems.find((item) => item.advanceId === scopeEvidence[0].advanceId)?.retryCount ?? 0) + 1,
  });

  return {
    evidenceItems: nextEvidenceItems,
    queueItems: nextQueueItems,
    result: {
      status: failedCount ? 'failed' : 'synced',
      title: failedCount ? 'La sincronización no se completó' : 'La evidencia fue sincronizada correctamente',
      description: failedCount
        ? 'Parte de la evidencia quedó con error. Puede reintentar ahora sin perder contexto.'
        : 'Los soportes del avance ya quedaron asociados y enviados correctamente.',
      syncedCount,
      pendingCount: 0,
      failedCount,
    },
  };
}

function nextQueueItemsPlaceholder(queueItems) {
  return queueItems;
}

export function getSyncBannerState({ isOffline, currentEvidence, queueItems }) {
  const pendingCount = currentEvidence.filter((evidence) => ['pending', 'retry-pending', 'syncing'].includes(evidence.syncStatus)).length;
  const failedCount = queueItems.filter((item) => item.syncStatus === 'failed').length;
  const syncedCount = currentEvidence.filter((evidence) => evidence.syncStatus === 'synced').length;

  if (isOffline) {
    return {
      tone: 'warning',
      title: 'Sin conexión: la evidencia quedará pendiente',
      description: pendingCount
        ? `Tiene ${pendingCount} evidencia${pendingCount > 1 ? 's' : ''} guardada${pendingCount > 1 ? 's' : ''} localmente para enviar más tarde.`
        : 'Puede seguir capturando evidencia. El sistema la dejará en cola hasta recuperar conectividad.',
    };
  }

  if (failedCount) {
    return {
      tone: 'danger',
      title: 'Hay sincronizaciones con error',
      description: `${failedCount} registro${failedCount > 1 ? 's' : ''} requiere${failedCount > 1 ? 'n' : ''} reintento para completar la operación.`,
    };
  }

  if (pendingCount) {
    return {
      tone: 'info',
      title: 'Tiene evidencia lista para sincronizar',
      description: 'Puede sincronizar ahora o continuar y finalizar cuando tenga confirmación visual del estado.',
    };
  }

  if (syncedCount) {
    return {
      tone: 'success',
      title: 'La evidencia actual está al día',
      description: 'Las imágenes asociadas a este avance ya se enviaron correctamente.',
    };
  }

  return {
    tone: 'neutral',
    title: 'Capture la evidencia del avance',
    description: 'Al guardar, el sistema la asociará al avance actual y preparará la sincronización.',
  };
}