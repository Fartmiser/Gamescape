import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { List, PopulatedCard } from '../../../shared/types';
import { CardPreview } from './CardPreview';
import { FolderCard } from './FolderCard';
import { FolderSettingsMenu } from './FolderSettingsMenu';
import { api } from '../../api';
import { useCampaignStore } from '../../store/campaign';


interface ListColumnProps {
  list: List;
  isOver?: boolean;
  overId?: string | null;
  onCardClick: (card: PopulatedCard) => void;
}


export function ListColumn({ list, onCardClick, overId }: ListColumnProps) {
  const { cardsByList, loadCardsForList, templates } = useCampaignStore();
  const allCards = cardsByList[list.id] || [];
 
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [settingsFolder, setSettingsFolder] = useState<PopulatedCard | null>(null);
 
  const { setNodeRef } = useDroppable({ id: list.id });


  useEffect(() => {
    loadCardsForList(list.id);
  }, [list.id]);


  // Filter to only root-level cards/folders
  const rootItems = allCards.filter(c => !c.parent_folder_id);


  async function handleAddCard() {
    if (!newCardName || !selectedTemplateId) {
      alert('Please enter a card name and select a type');
      return;
    }


    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;


    const field_values: Record<string, any> = {};
    template.field_definitions.forEach(field => {
      if (field.defaultValue !== undefined) {
        field_values[field.key] = field.defaultValue;
      }
    });


    await api.cards.create({
      list_id: list.id,
      template_id: selectedTemplateId,
      name: newCardName,
      field_values,
      position: allCards.length,
      is_folder: false,
    });


    setNewCardName('');
    setSelectedTemplateId('');
    setIsAddingCard(false);
    loadCardsForList(list.id);
  }


  async function handleAddFolder() {
    if (!newCardName) {
      alert('Please enter a folder name');
      return;
    }


    // Find or create a "Folder" template
    let folderTemplate = templates.find(t => t.name === 'Folder');
    if (!folderTemplate) {
      folderTemplate = await api.templates.create({
        name: 'Folder',
        icon: '📁',
        color: '#6B7280',
        field_definitions: [
          {
            key: 'icon',
            label: 'Icon',
            type: 'text',
            showInPreview: false,
          },
          {
            key: 'color',
            label: 'Color',
            type: 'color',
            showInPreview: false,
          },
        ],
      });
    }


    await api.cards.create({
      list_id: list.id,
      template_id: folderTemplate.id,
      name: newCardName,
      field_values: { icon: '', color: '#6B7280' },
      position: allCards.length,
      is_folder: true,
      is_expanded: true,
    });


    setNewCardName('');
    setIsAddingFolder(false);
    loadCardsForList(list.id);
  }


  async function handleToggleFolder(folderId: string) {
    await api.cards.toggleFolderExpansion(folderId);
    loadCardsForList(list.id);
  }


  // Recursive function to render cards and folders
  function renderItem(item: PopulatedCard, depth: number = 0): React.ReactNode {
    const isOver = overId === item.id;
   
    if (item.is_folder) {
      const children = allCards.filter(c => c.parent_folder_id === item.id);
     
      return (
        <React.Fragment key={item.id}>
          <FolderCard
            folder={item}
            onToggle={() => handleToggleFolder(item.id)}
            onSettingsClick={() => setSettingsFolder(item)}
            indentLevel={depth}
            isOver={isOver} // NEW
          />
          {item.is_expanded && children.map(child => renderItem(child, depth + 1))}
        </React.Fragment>
      );
    } else {
      return (
        <div
          key={item.id}
          style={{
            marginLeft: `${depth * 3}%`,
            width: `${100 - depth * 3}%`,
          }}
        >
          <CardPreview
            card={item}
            onClick={() => onCardClick(item)}
            isOver={isOver} // NEW
          />
        </div>
      );
    }
  }



  return (
    <div className="flex-shrink-0 w-80 bg-gray-800 rounded-lg flex flex-col max-h-full">
      {/* List Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-lg">{list.name}</h3>
          <span className="text-sm text-gray-400">{allCards.length}</span>
        </div>
      </div>


      {/* Cards and Folders */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3">
        <SortableContext items={rootItems.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {rootItems.map(item => renderItem(item))}
        </SortableContext>


        {allCards.length === 0 && !isAddingCard && !isAddingFolder && (
          <div className="text-center text-gray-500 py-8 text-sm">
            No cards yet
          </div>
        )}
      </div>


      {/* Add Card/Folder Form */}
      {isAddingCard ? (
        <div className="p-3 bg-gray-700 border-t border-gray-600">
          <input
            type="text"
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
            placeholder="Card name..."
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCard();
              if (e.key === 'Escape') setIsAddingCard(false);
            }}
          />
         
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type...</option>
            {templates.filter(t => t.name !== 'Folder').map(template => (
              <option key={template.id} value={template.id}>
                {template.icon} {template.name}
              </option>
            ))}
          </select>


          <div className="flex gap-2">
            <button
              onClick={handleAddCard}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Add Card
            </button>
            <button
              onClick={() => setIsAddingCard(false)}
              className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : isAddingFolder ? (
        <div className="p-3 bg-gray-700 border-t border-gray-600">
          <input
            type="text"
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
            placeholder="Folder name..."
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddFolder();
              if (e.key === 'Escape') setIsAddingFolder(false);
            }}
          />


          <div className="flex gap-2">
            <button
              onClick={handleAddFolder}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Add Folder
            </button>
            <button
              onClick={() => setIsAddingFolder(false)}
              className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="m-3 space-y-2">
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            + Add Card
          </button>
          <button
            onClick={() => setIsAddingFolder(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            📁 Add Folder
          </button>
        </div>
      )}


      {/* Folder Settings Modal */}
      {settingsFolder && (
        <FolderSettingsMenu
          folder={settingsFolder}
          onClose={() => setSettingsFolder(null)}
          onUpdate={() => {
            loadCardsForList(list.id);
            setSettingsFolder(null);
          }}
        />
      )}
    </div>
  );
}
