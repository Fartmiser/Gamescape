import React from 'react';
import type { FieldDefinition } from '../../../../shared/types';


interface SelectFieldProps {
  field: FieldDefinition;
  value: string | null;
  onChange?: (value: string | null) => void;
  readOnly?: boolean;
}


export function SelectField({ field, value, onChange, readOnly }: SelectFieldProps) {
  const options = field.validation?.options || [];


  if (readOnly) {
    return (
      <div className="text-white">
        {value || <span className="text-gray-500 italic">Not selected</span>}
      </div>
    );
  }


  return (
    <select
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value || null)}
      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">-- Select --</option>
      {options.map(opt => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
