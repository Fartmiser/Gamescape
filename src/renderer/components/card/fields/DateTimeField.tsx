import React from 'react';
import type { FieldDefinition } from '../../../../shared/types';


interface DateTimeFieldProps {
  field: FieldDefinition;
  value: string | null; // ISO datetime string
  onChange?: (value: string | null) => void;
  readOnly?: boolean;
}


export function DateTimeField({ field, value, onChange, readOnly }: DateTimeFieldProps) {
  if (readOnly) {
    if (!value) {
      return <div className="text-gray-500 italic">Not set</div>;
    }
    // Format datetime nicely
    const date = new Date(value);
    return <div className="text-white">{date.toLocaleString()}</div>;
  }


  return (
    <input
      type="datetime-local"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value || null)}
      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
