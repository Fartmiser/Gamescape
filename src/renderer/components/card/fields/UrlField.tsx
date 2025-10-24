import React from 'react';
import type { FieldDefinition } from '../../../../shared/types';


interface UrlFieldProps {
  field: FieldDefinition;
  value: string | null;
  onChange?: (value: string | null) => void;
  readOnly?: boolean;
}


export function UrlField({ field, value, onChange, readOnly }: UrlFieldProps) {
  if (readOnly) {
    if (!value) {
      return <div className="text-gray-500 italic">Not set</div>;
    }
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        {value}
      </a>
    );
  }


  return (
    <input
      type="url"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value || null)}
      placeholder="https://example.com"
      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
