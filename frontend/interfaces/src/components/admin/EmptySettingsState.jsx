import React from 'react';
import { EmptyState } from '../ui/EmptyState.jsx';

export function EmptySettingsState({ title, description, actionLabel, onAction }) {
  return <EmptyState title={title} description={description} actionLabel={actionLabel} onAction={onAction} />;
}