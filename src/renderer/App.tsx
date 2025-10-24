import React, { useState } from 'react';
import { useTemplateStore } from './store/templates';
import { TemplateModal } from './components/templates/TemplateModal';
import { BoardView } from './components/board/BoardView';
import type { PopulatedCard } from '../shared/types';
import { HomeScreen } from './components/HomeScreen';
import { useCampaignStore } from './store/campaign';
import { CardModal } from './components/card/CardModal';
import { SearchBar } from './components/board/SearchBar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { TemplateListModal } from './components/templates/TemplateListModal';

function App() {
  const [screen, setScreen] = useState<'home' | 'board'>('home');
  const { openCampaign, closeCampaign, campaignMeta } = useCampaignStore();
  const [selectedCard, setSelectedCard] = useState<PopulatedCard | null>(null);
  

  async function handleCampaignOpen(filePath: string) {
    await openCampaign(filePath);
    setScreen('board');
  }


  function handleCardClick(card: PopulatedCard) {
    setSelectedCard(card);
  }



  useKeyboardShortcuts([
    {
      key: 'f',
      ctrl: true,
      handler: () => {
        // Focus search bar
        if (screen === "board") {
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          searchInput?.focus();
        }
      },
    },
    {
      key: 't',
      ctrl: true,
      handler: () => {
        if (screen === "board") {
          useTemplateStore.getState().openModal();
        }
      },
    },
    {
      key: 'h',
      ctrl: true,
      handler: async () => {
        if (screen === "board") {
          await closeCampaign();
          setScreen('home');
        }
      },
    },
  ]);
  if (screen === 'home') {
    return <HomeScreen onCampaignOpen={handleCampaignOpen} />;
  }
  if (screen === 'board') {
    // Board view
    return (
      <div className="flex h-screen flex-col bg-gray-900 text-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                await closeCampaign();
                setScreen('home');
              }}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              🏠 Home
            </button>
            <div>
              <h1 className="text-xl font-bold">{campaignMeta?.name || 'Campaign'}</h1>
              {campaignMeta?.description && (
                <p className="text-sm text-gray-400">{campaignMeta.description}</p>
              )}
            </div>
          </div>
          
          {/* NEW: Search Bar */}
          <SearchBar onCardSelect={handleCardClick} />

          <button
            onClick={() => useTemplateStore.getState().openListModal()}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>⚙️</span>
            <span>Types</span>
          </button>
          {/* Template Modals */}
          <TemplateListModal />
          <TemplateModal />
        </div>
        
        {/* Board */}
        <div className="flex-1 overflow-hidden">
          <BoardView onCardClick={handleCardClick} />
        </div>

        {/* Template Modal */}
        <TemplateModal />

        {/* Card Modal */}
        {selectedCard && (
          <CardModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}

      </div>
    );
  }
}


export default App;