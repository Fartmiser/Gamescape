import React, { useState } from 'react';
import { useTemplateStore } from '../../store/templates';
import { useCampaignStore } from '../../store/campaign';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';
import { FieldEditor } from './FieldEditor';
import type { FieldDefinition } from '../../../shared/types';


export function TemplateModal() {
  const { isEditorModalOpen, editingTemplate, selectedTemplateId, closeModal, setEditingTemplate, saveTemplate } = useTemplateStore();
  const { loadTemplates } = useCampaignStore();
  
  const [isSaving, setIsSaving] = useState(false);


  // Only render if editor modal is open
  if (!isEditorModalOpen || !editingTemplate) return null;

  async function handleSave() {
    if (!editingTemplate) return;
    if (!editingTemplate.name) {
      alert('Template name is required');
      return;
    }


    if (!editingTemplate.field_definitions || editingTemplate.field_definitions.length === 0) {
      alert('At least one field is required');
      return;
    }


    setIsSaving(true);
    try {
      await saveTemplate();
      await loadTemplates(); // Refresh template list
    } catch (error: any) {
      alert('Error saving template: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  }


  function addField() {
    if (!editingTemplate) return;
    const newField: FieldDefinition = {
      key: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      showInPreview: false,
    };

    
    setEditingTemplate({
      ...editingTemplate,
      field_definitions: [...(editingTemplate.field_definitions || []), newField],
    });
  }


  function updateField(index: number, field: FieldDefinition) {
    if (!editingTemplate) return;
    const fields = [...(editingTemplate.field_definitions || [])];
    fields[index] = field;
    setEditingTemplate({
      ...editingTemplate,
      field_definitions: fields,
    });
  }


  function deleteField(index: number) {
    if (!editingTemplate) return;
    const fields = [...(editingTemplate.field_definitions || [])];
    fields.splice(index, 1);
    setEditingTemplate({
      ...editingTemplate,
      field_definitions: fields,
    });
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {selectedTemplateId ? 'Edit Template' : 'New Template'}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>


        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Info</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icon
                </label>
                <IconPicker
                  value={editingTemplate.icon || '📋'}
                  onChange={(icon) => setEditingTemplate({ ...editingTemplate, icon })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <ColorPicker
                  value={editingTemplate.color || '#6366F1'}
                  onChange={(color) => setEditingTemplate({ ...editingTemplate, color })}
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={editingTemplate.name || ''}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Character, Location, Quest"
              />
            </div>
          </div>


          {/* Fields */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Fields</h3>
              <button
                onClick={addField}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + Add Field
              </button>
            </div>


            <div className="space-y-3">
              {editingTemplate.field_definitions?.map((field, index) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  onChange={(updated) => updateField(index, updated)}
                  onDelete={() => deleteField(index)}
                />
              ))}
            </div>


            {(!editingTemplate.field_definitions || editingTemplate.field_definitions.length === 0) && (
              <div className="text-center text-gray-400 py-8">
                No fields yet. Click "Add Field" to create one.
              </div>
            )}
          </div>
        </div>


        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={closeModal}
            className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Back to List
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
