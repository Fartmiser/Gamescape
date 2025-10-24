import React from 'react';
import type { FieldDefinition } from '../../../../shared/types';
import { NIL } from 'uuid';


interface NumberFieldProps {
  field: FieldDefinition;
  value: number | null;
  onChange?: (value: number | null) => void;
  readOnly?: boolean;
}


export function NumberField({ field, value, onChange, readOnly }: NumberFieldProps) {
  if (readOnly) {
    return (
      <div className="text-white">
        {value !== null ? value : <span className="text-gray-500 italic">Not set</span>}
      </div>
    );
  }


  let min:number=0
  let max:number=0
  if (field.validation?.min) {
    min=field.validation?.min
  }
  if (field.validation?.max) {
    max=field.validation?.max
  }

  return (
    <input
      type="number"
      value={value ?? ''}
      min={field.validation?.min}
      max={field.validation?.max}
      
      onChange={(e) => {
        let num = Number(e.target.value);
        let result:number = (min!=max && (num < min))? min : (min!=max && (num>max))? max : num
        const val = e.target.value === '' ? null : result;
        onChange?.(val);
      }}
      placeholder={field.placeholder}
      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
