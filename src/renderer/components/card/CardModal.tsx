import React, { useState, useEffect } from 'react';
import type { PopulatedCard, FieldValue } from '../../../shared/types';
import { FieldRenderer } from './fields/FieldRenderer';
import { api } from '../../api';
import { useCampaignStore } from '../../store/campaign';


interface CardModalProps {
  card: PopulatedCard;
  onClose: () => void;
}


export function CardModal({ card, onClose }: CardModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(card.name);
  const [editedValues, setEditedValues] = useState<Record<string, FieldValue>>(card.field_values);
  const [isSaving, setIsSaving] = useState(false);
 
  const { loadCardsForList } = useCampaignStore();


  function updateFieldValue(key: string, value: FieldValue) {
    setEditedValues(prev => ({
      ...prev,
      [key]: value,
    }));
  }


  async function handleSave() {
    setIsSaving(true);
    try {
      await api.cards.update(card.id, {
        name: editedName,
        field_values: editedValues,
      });
     
      // Reload cards in this list
      await loadCardsForList(card.list_id);
     
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save card:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }


  function handleCancel() {
    setEditedName(card.name);
    setEditedValues(card.field_values);
    setIsEditing(false);
  }


  async function handleDelete() {
    const confirmed = confirm(`Delete "${card.name}"?`);
    if (!confirmed) return;


    try {
      await api.cards.delete(card.id);
      await loadCardsForList(card.list_id);
      onClose();
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert('Failed to delete card');
    }
  }


  // Close on Escape key (only when not editing)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isEditing) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, onClose]);


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isEditing) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{card.template.icon}</span>
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white">{card.name}</h2>
                <div className="text-sm text-gray-400">{card.template.name}</div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl ml-4"
          >
            ×
          </button>
        </div>


        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {card.template.field_definitions.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {field.label}
                  {field.validation?.required && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </label>
                <FieldRenderer
                  field={field}
                  value={isEditing ? editedValues[field.key] : card.field_values[field.key]}
                  cardId={card.id}
                  onChange={isEditing ? (value) => updateFieldValue(field.key, value) : undefined}
                  readOnly={!isEditing}
                />
                {field.helpText && (
                  <div className="text-xs text-gray-500 mt-1">{field.helpText}</div>
                )}
              </div>
            ))}
          </div>
        </div>


        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div>
            {!isEditing && (
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                🗑️ Delete Card
              </button>
            )}
          </div>
         
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                ✏️ Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
