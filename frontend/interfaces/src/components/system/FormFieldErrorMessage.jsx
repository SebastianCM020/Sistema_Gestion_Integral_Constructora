import React from 'react';

export function FormFieldErrorMessage({ fieldId, message }) {
  if (!message) {
    return null;
  }

  return <p id={`${fieldId}-error`} className="mt-1.5 text-xs font-medium text-[#DC2626]">{message}</p>;
}