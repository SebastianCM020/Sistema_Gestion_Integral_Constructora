import React from 'react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';

export function TechnicalSettingDetailDrawer({ item, onClose }) {
  if (!item) {
    return null;
  }

  const isConflict = Boolean(item.affectedKeys);

  return (
    <DrawerPanel title={isConflict ? item.title : item.settingLabel ?? item.itemLabel} description={isConflict ? 'Revise este conflicto de configuración antes de guardar.' : item.description ?? 'Detalle del elemento seleccionado.'} onClose={onClose}>
      <div className="space-y-4 text-sm text-gray-600">
        {isConflict ? <p>{item.description}</p> : null}
        {!isConflict && item.settingGroup ? <p><span className="font-semibold text-[#2F3A45]">Grupo:</span> {item.settingGroup}</p> : null}
        {!isConflict && item.currentValue !== undefined ? <p><span className="font-semibold text-[#2F3A45]">Valor actual:</span> {String(item.currentValue)}</p> : null}
        {!isConflict && item.defaultValue !== undefined ? <p><span className="font-semibold text-[#2F3A45]">Valor predeterminado:</span> {String(item.defaultValue)}</p> : null}
        {!isConflict && item.itemCode ? <p><span className="font-semibold text-[#2F3A45]">Código:</span> {item.itemCode}</p> : null}
        {!isConflict && item.impactLabel ? <p><span className="font-semibold text-[#2F3A45]">Impacto:</span> {item.impactLabel}</p> : null}
        {!isConflict && item.updatedBy ? <p><span className="font-semibold text-[#2F3A45]">Última actualización:</span> {item.updatedBy} · {item.updatedAt}</p> : null}
        {isConflict ? <p><span className="font-semibold text-[#2F3A45]">Configuraciones afectadas:</span> {item.affectedKeys.join(', ')}</p> : null}
      </div>
    </DrawerPanel>
  );
}