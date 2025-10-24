import React, { useState, useEffect } from 'react';
import type { PopulatedCard } from '../../../shared/types';
import { api } from '../../api';


interface CardPickerProps {
  allowedTemplateId?: string; // Restrict to specific template type
  excludeCardIds: string[];    // Cards to exclude from selection
  onSelect: (card: PopulatedCard) => void;
  onClose: () => void;
}


export function CardPicker({ allowedTemplateId, excludeCardIds, onSelect, onClose }: CardPickerProps) {
  const [allCards, setAllCards] = useState<PopulatedCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    loadCards();
  }, []);


  async function loadCards() {
    setIsLoading(true);
    try {
      const cards = await api.cards.getAll();
      setAllCards(cards);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setIsLoading(false);
    }
  }


  // Filter cards
  const filteredCards = allCards.filter(card => {
    // Exclude already selected cards
    if (excludeCardIds.includes(card.id)) return false;
   
    // Filter by template if specified
    if (allowedTemplateId && card.template_id !== allowedTemplateId) return false;
   
    // Filter by search query
    if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
   
    return true;
  });


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Select Card</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>


        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards..."
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>


        {/* Card List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">Loading cards...</div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              {searchQuery ? 'No cards match your search' : 'No cards available'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => onSelect(card)}
                  className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{card.template.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{card.name}</div>
                      <div className="text-sm text-gray-400">{card.template.name}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
