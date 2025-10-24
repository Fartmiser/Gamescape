import React, { useState, useEffect } from 'react';
import type { FieldDefinition, PopulatedCard } from '../../../../shared/types';
import { api } from '../../../api';
import { CardPicker } from '../CardPicker';


interface LinkFieldProps {
  field: FieldDefinition;
  cardId: string; // The card this field belongs to
  onChange?: () => void; // Called when links change
  readOnly?: boolean;
}


export function LinkField({ field, cardId, onChange, readOnly }: LinkFieldProps) {
  const [linkedCards, setLinkedCards] = useState<PopulatedCard[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    loadLinkedCards();
  }, [cardId, field.key]);


  async function loadLinkedCards() {
    setIsLoading(true);
    try {
      const cards = await api.links.getLinkedCards(cardId, field.key);
      setLinkedCards(cards);
    } catch (error) {
      console.error('Failed to load linked cards:', error);
    } finally {
      setIsLoading(false);
    }
  }


  async function handleAddLink(card: PopulatedCard) {
    try {
      await api.links.create(cardId, card.id, field.key);
      await loadLinkedCards();
      setIsPickerOpen(false);
      onChange?.();
    } catch (error) {
      console.error('Failed to create link:', error);
      alert('Failed to link card');
    }
  }


  async function handleRemoveLink(linkCardId: string) {
    try {
      // Delete all links for this field
      await api.links.deleteForField(cardId, field.key);
     
      // Re-create remaining links
      for (const c of linkedCards) {
        if (c.id !== linkCardId) {
          await api.links.create(cardId, c.id, field.key);
        }
      }
     
      await loadLinkedCards();
      onChange?.();
    } catch (error) {
      console.error('Failed to remove link:', error);
      alert('Failed to unlink card');
    }
  }


  const canAddMore = !field.linkConfig?.allowMultiple ? linkedCards.length === 0 : true;
  const previewFields = field.linkConfig?.previewFields || [];


  if (isLoading) {
    return <div className="text-gray-400">Loading...</div>;
  }


  return (
    <div>
      {/* Linked Cards */}
      {linkedCards.length > 0 && (
        <div className="space-y-2 mb-3">
          {linkedCards.map(card => (
            <div
              key={card.id}
              className="bg-gray-700 rounded-lg p-3 border-l-4"
              style={{ borderLeftColor: card.template.color }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{card.template.icon}</span>
                    <span className="font-semibold text-white">{card.name}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{card.template.name}</div>
                 
                  {/* Preview Fields */}
                  {previewFields.length > 0 && (
                    <div className="space-y-1 text-sm">
                      {previewFields.map(fieldKey => {
                        const value = card.field_values[fieldKey];
                        const fieldDef = card.template.field_definitions.find(f => f.key === fieldKey);
                        if (!fieldDef || value === null || value === undefined || value === '') return null;


                        return (
                          <div key={fieldKey} className="text-gray-300">
                            <span className="text-gray-500">{fieldDef.label}:</span>{' '}
                            <span>{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>


                {!readOnly && (
                  <button
                    onClick={() => handleRemoveLink(card.id)}
                    className="text-gray-400 hover:text-red-400 ml-2"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Add Link Button */}
      {!readOnly && canAddMore && (
        <button
          onClick={() => setIsPickerOpen(true)}
          className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors border-2 border-dashed border-gray-600"
        >
          + {linkedCards.length > 0 ? 'Add Another' : 'Add Link'}
        </button>
      )}


      {linkedCards.length === 0 && readOnly && (
        <div className="text-gray-500 italic">No links</div>
      )}


      {/* Card Picker Modal */}
      {isPickerOpen && (
        <CardPicker
          allowedTemplateId={field.linkConfig?.staticLinkType}
          excludeCardIds={[cardId, ...linkedCards.map(c => c.id)]}
          onSelect={handleAddLink}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  );
}
