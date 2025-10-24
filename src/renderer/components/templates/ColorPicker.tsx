import React from 'react';


interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}


const PRESET_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#EAB308', // yellow
  '#84CC16', // lime
  '#22C55E', // green
  '#10B981', // emerald
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#0EA5E9', // sky
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#A855F7', // purple
  '#D946EF', // fuchsia
  '#EC4899', // pink
];


export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div>
      <div
        className="w-full h-16 rounded-lg mb-3 border-2 border-gray-600"
        style={{ backgroundColor: value }}
      />
     
      <div className="grid grid-cols-8 gap-2 mb-3">
        {PRESET_COLORS.map(color => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className="w-8 h-8 rounded border-2 border-gray-600 hover:border-white transition-colors"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
     
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm font-mono"
        placeholder="#3B82F6"
        pattern="^#[0-9A-Fa-f]{6}$"
      />
    </div>
  );
}
