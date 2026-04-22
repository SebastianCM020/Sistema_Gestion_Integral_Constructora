import React from 'react';
import { SystemAlertBanner } from './SystemAlertBanner.jsx';

export function SystemValidationBanner({ title, description, items }) {
  return (
    <SystemAlertBanner tone="error" title={title} description={description}>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id}>• {item.label}: {item.message}</li>
        ))}
      </ul>
    </SystemAlertBanner>
  );
}