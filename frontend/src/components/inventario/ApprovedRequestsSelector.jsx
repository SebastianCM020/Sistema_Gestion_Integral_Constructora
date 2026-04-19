import React from 'react';
import { ChevronRight } from 'lucide-react';
import { InventoryStatusBadge } from './InventoryStatusBadge.jsx';
import { formatInventoryDate, getApprovedRequestMeta } from '../../utils/inventoryHelpers.js';

export function ApprovedRequestsSelector({ requests, selectedRequestId, onSelect }) {
  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const meta = getApprovedRequestMeta(request.receptionStatus);
        const isSelected = selectedRequestId === request.requestId;

        return (
          <button key={request.requestId} type="button" onClick={() => onSelect(request.requestId)} className={`w-full rounded-[12px] border p-4 text-left shadow-sm transition ${isSelected ? 'border-[#1F4E79] bg-[#DCEAF7]/40' : 'border-[#D1D5DB] bg-white hover:bg-[#F7F9FC]'}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#2F3A45]">{request.requestCode}</p>
                <p className="mt-1 text-sm text-gray-600">{request.projectCode} · {request.projectName}</p>
                <p className="mt-1 text-xs text-gray-500">Solicitante: {request.requesterName} · {formatInventoryDate(request.approvedDate)}</p>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{request.detail.length} línea{request.detail.length === 1 ? '' : 's'} aprobada{request.detail.length === 1 ? '' : 's'} para recepción.</p>
              </div>
              <div className="flex items-center gap-3">
                <InventoryStatusBadge label={meta.label} tone={meta.tone} />
                <ChevronRight size={16} className="text-[#2F3A45]" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}