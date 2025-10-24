import React from 'react';
import type { FieldDefinition } from '../../../../shared/types';


interface ColorFieldProps {
  field: FieldDefinition;
  value: string | null; // Hex color
  onChange?: (value: string | null) => void;
  readOnly?: boolean;
}


export function ColorField({ field, value, onChange, readOnly }: ColorFieldProps) {
  if (readOnly) {
    if (!value) {
      return <div className="text-gray-500 italic">Not set</div>;
    }
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded border-2 border-gray-600"
          style={{ backgroundColor: value }}
        />
        <span className="text-white font-mono">{value}</span>
      </div>
    );
  }


  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-16 h-10 rounded border border-gray-600 cursor-pointer"
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value || null)}
        placeholder="#000000"
        className="flex-1 bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
