import React from 'react';
import type { FieldDefinition } from '../../../../shared/types';


interface DiceFieldProps {
  field: FieldDefinition;
  value: string | null;
  onChange?: (value: string | null) => void;
  readOnly?: boolean;
}


export function DiceField({ field, value, onChange, readOnly }: DiceFieldProps) {
  if (readOnly) {
    if (!value) {
      return <div className="text-gray-500 italic">Not set</div>;
    }
    return <div className="text-white font-mono">🎲 {value}</div>;
  }


  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value || null)}
      placeholder="e.g., 2d6+3"
      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
