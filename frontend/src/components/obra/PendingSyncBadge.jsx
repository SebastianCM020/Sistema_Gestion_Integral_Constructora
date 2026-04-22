import React from 'react';
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw } from 'lucide-react';
import { getSyncStatusMeta } from '../../utils/syncHelpers.js';

const iconMap = {
  pending: Clock3,
  synced: CheckCircle2,
  failed: AlertTriangle,
  'retry-pending': RefreshCw,
  syncing: RefreshCw,
};

export function PendingSyncBadge({ syncStatus }) {
  const meta = getSyncStatusMeta(syncStatus);
  const Icon = iconMap[syncStatus] ?? Clock3;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${meta.toneClass}`}>
      <Icon size={14} />
      {meta.label}
    </span>
  );
}