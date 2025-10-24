import React, { useState } from 'react';


interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}


const COMMON_ICONS = [
  '👤', '🏰', '🗺️', '⚔️', '🛡️', '📜', '💰', '🔮',
  '🎲', '📖', '🌟', '🔥', '💧', '🌿', '⚡', '🌙',
  '☀️', '🦅', '🐉', '🦄', '👑', '💎', '🗝️', '🏹',
  '🪓', '🔱', '🧙', '🧝', '🧛', '🧟', '👹', '👺',
];


export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);


  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 rounded-lg flex items-center justify-center text-4xl transition-colors"
      >
        {value}
      </button>


      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
         
          {/* Picker */}
          <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl z-20 w-64">
            <div className="grid grid-cols-8 gap-2">
              {COMMON_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => {
                    onChange(icon);
                    setIsOpen(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-2xl hover:bg-gray-700 rounded transition-colors"
                >
                  {icon}
                </button>
              ))}
            </div>
           
            <div className="mt-3 pt-3 border-t border-gray-700">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                placeholder="Or paste emoji..."
                maxLength={2}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
