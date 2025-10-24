import React from 'react';
import type { FieldDefinition } from '../../../../shared/types';


interface BooleanFieldProps {
  field: FieldDefinition;
  value: boolean | null;
  onChange?: (value: boolean) => void;
  readOnly?: boolean;
}


export function BooleanField({ field, value, onChange, readOnly }: BooleanFieldProps) {
  const checked = value === true;


  if (readOnly) {
    return (
      <div className="text-white">
        {checked ? '✓ Yes' : '✗ No'}
      </div>
    );
  }


  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-5 h-5 rounded border-gray-600 bg-gray-700"
      />
      <span className="text-gray-300">
        {checked ? 'Yes' : 'No'}
      </span>
    </label>
  );
}
