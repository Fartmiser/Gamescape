import React from 'react';
import type { FieldDefinition } from '../../../../shared/types';


interface MultiSelectFieldProps {
  field: FieldDefinition;
  value: string[] | null;
  onChange?: (value: string[]) => void;
  readOnly?: boolean;
}


export function MultiSelectField({ field, value, onChange, readOnly }: MultiSelectFieldProps) {
  const options = field.validation?.options || [];
  const selected = value || [];


  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange?.(selected.filter(o => o !== option));
    } else {
      onChange?.([...selected, option]);
    }
  }


  if (readOnly) {
    if (selected.length === 0) {
      return <div className="text-gray-500 italic">None selected</div>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {selected.map(opt => (
          <span key={opt} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
            {opt}
          </span>
        ))}
      </div>
    );
  }


  return (
    <div className="space-y-2">
      {options.map(option => (
        <label key={option} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => toggleOption(option)}
            className="w-4 h-4"
          />
          <span className="text-gray-300">{option}</span>
        </label>
      ))}
    </div>
  );
}
