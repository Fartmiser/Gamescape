import React from 'react';
import type { FieldDefinition } from '../../../../shared/types';


interface TextFieldProps {
  field: FieldDefinition;
  value: string | null;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}


export function TextField({ field, value, onChange, readOnly }: TextFieldProps) {
  if (readOnly) {
    return (
      <div className="text-white">
        {value || <span className="text-gray-500 italic">Not set</span>}
      </div>
    );
  }


  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={field.placeholder}
      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
