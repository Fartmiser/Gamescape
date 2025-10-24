import React, { useState } from 'react';
import type { PopulatedCard } from '../../../shared/types';
import { api } from '../../api';


interface SearchBarProps {
  onCardSelect: (card: PopulatedCard) => void;
}


export function SearchBar({ onCardSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PopulatedCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);


  async function handleSearch(searchQuery: string) {
    setQuery(searchQuery);
   
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }


    setIsSearching(true);
    setIsOpen(true);
   
    try {
      const allCards = await api.cards.getAll();
      const filtered = allCards.filter(card =>
        card.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }


  function handleSelect(card: PopulatedCard) {
    onCardSelect(card);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }


  return (
    <div className="relative w-64">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="🔍 Search entities..."
        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />


      {/* Results Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setQuery('');
              setResults([]);
            }}
          />
         
          {/* Results */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-400">Searching...</div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No results found</div>
            ) : (
              <div className="py-2">
                {results.map(card => (
                  <button
                    key={card.id}
                    onClick={() => handleSelect(card)}
                    className="w-full px-4 py-3 hover:bg-gray-700 text-left transition-colors"
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
        </>
      )}
    </div>
  );
}
