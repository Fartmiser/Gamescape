import React from 'react';
import type { FieldDefinition } from '../../../../shared/types';


interface DateFieldProps {
  field: FieldDefinition;
  value: string | null; // ISO date string (YYYY-MM-DD)
  onChange?: (value: string | null) => void;
  readOnly?: boolean;
}


export function DateField({ field, value, onChange, readOnly }: DateFieldProps) {
  if (readOnly) {
    if (!value) {
      return <div className="text-gray-500 italic">Not set</div>;
    }
    // Format date nicely
    const date = new Date(value);
    return <div className="text-white">{date.toLocaleDateString()}</div>;
  }


  return (
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value || null)}
      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
