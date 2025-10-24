import React from 'react';
import type { FieldDefinition } from '../../../shared/types';
import { FieldTypeSelector } from './FieldTypeSelector';


interface FieldEditorProps {
  field: FieldDefinition;
  onChange: (field: FieldDefinition) => void;
  onDelete: () => void;
}


export function FieldEditor({ field, onChange, onDelete }: FieldEditorProps) {
  function updateField(updates: Partial<FieldDefinition>) {
    onChange({ ...field, ...updates });
  }


  function updateValidation(key: string, value: any) {
    onChange({
      ...field,
      validation: {
        ...field.validation,
        [key]: value,
      },
    });
  }


  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-3">
      {/* Field Label */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Field Label
        </label>
        <input
          type="text"
          defaultValue={field.label}
          onBlur={(e) => {
            const label = e.target.value;
            // Auto-generate key from label
            const key = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            updateField({ label, key });
          }}
          className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Hit Points"
        />
        <div className="text-xs text-gray-400 mt-1">
          Key: {field.key || '(auto-generated)'}
        </div>
      </div>


      {/* Field Type */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Field Type
        </label>
        <FieldTypeSelector
          value={field.type}
          onChange={(type) => updateField({ type })}
        />
      </div>


      {/* Options */}
      <div className="flex items-center gap-4 mb-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={field.validation?.required || false}
            onChange={(e) => updateValidation('required', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-300">Required</span>
        </label>


        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={field.showInPreview || false}
            onChange={(e) => updateField({ showInPreview: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-300">Show in card preview</span>
        </label>
      </div>


      {/* Type-specific options */}
      {(field.type === 'select' || field.type === 'multiselect') && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Options (comma-separated)
          </label>
          <input
            type="text"
            defaultValue={field.validation?.options?.join(', ') || ''}
            onBlur={(e) => {
              const options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              updateValidation('options', options);
            }}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Small, Medium, Large"
          />
        </div>
      )}


      {field.type === 'number' && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Min Value
            </label>
            <input
              type="number"
              value={field.validation?.min ?? ''}
              onChange={(e) => updateValidation('min', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Max Value
            </label>
            <input
              type="number"
              value={field.validation?.max ?? ''}
              onChange={(e) => updateValidation('max', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Link Field Configuration */}
      {field.type === 'link' && (
        <div className="mt-3 space-y-3 bg-gray-800 rounded p-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.linkConfig?.allowMultiple || false}
              onChange={(e) => updateField({
                linkConfig: {
                  ...field.linkConfig,
                  allowMultiple: e.target.checked,
                } as any,
              })}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-300">Allow multiple links</span>
          </label>


          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Preview fields (comma-separated keys)
            </label>
            <input
              type="text"
              value={field.linkConfig?.previewFields?.join(', ') || ''}
              onChange={(e) => {
                const fields = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                updateField({
                  linkConfig: {
                    ...field.linkConfig,
                    previewFields: fields.length > 0 ? fields : undefined,
                  } as any,
                });
              }}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
              placeholder="e.g., race, level"
            />
            <div className="text-xs text-gray-500 mt-1">
              Field keys from linked cards to show as preview
            </div>
          </div>
        </div>
      )}


      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
      >
        <span>🗑️</span>
        Delete Field
      </button>
    </div>
  );
}
