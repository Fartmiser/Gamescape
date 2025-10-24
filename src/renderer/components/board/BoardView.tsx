import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
} from '@dnd-kit/core';
import { useCampaignStore } from '../../store/campaign';
import { ListColumn } from './ListColumn';
import { CardPreview } from './CardPreview';
import type { PopulatedCard } from '../../../shared/types';
import { api } from '../../api';


interface BoardViewProps {
  onCardClick: (card: PopulatedCard) => void;
}


export function BoardView({ onCardClick }: BoardViewProps) {
  const { lists, loadLists, cardsByList, loadCardsForList } = useCampaignStore();
  const [activeCard, setActiveCard] = useState<PopulatedCard | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [overId, setOverId] = useState<string | null>(null);


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    })
  );


  useEffect(() => {
    loadLists();
  }, []);


  function handleDragStart(event: DragStartEvent) {
    const cardId = event.active.id as string;
    // Find the card across all lists
    for (const listId in cardsByList) {
      const card = cardsByList[listId].find(c => c.id === cardId);
      if (card) {
        setActiveCard(card);
        break;
      }
    }
  }


  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    setOverId(over ? (over.id as string) : null);
  }


  async function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    setOverId(null);
   
    const { active, over } = event;
    if (!over) return;


    const draggedId = active.id as string;
    const overId = over.id as string;


    // Find the dragged card
    let draggedCard: PopulatedCard | null = null;
    let sourceListId: string | null = null;


    for (const listId in cardsByList) {
      const card = cardsByList[listId].find(c => c.id === draggedId);
      if (card) {
        draggedCard = card;
        sourceListId = listId;
        break;
      }
    }


    if (!draggedCard || !sourceListId) return;


    // Check if dragging onto the same card (no-op)
    if (draggedId === overId) return;


    // Find what we're dropping onto
    let targetCard: PopulatedCard | null = null;
    let targetListId: string | null = null;


    for (const listId in cardsByList) {
      const card = cardsByList[listId].find(c => c.id === overId);
      if (card) {
        targetCard = card;
        targetListId = listId;
        break;
      }
    }


    // Check if dropping on a list (not a card)
    const targetList = lists.find(l => l.id === overId);


    if (targetList) {
      // Dropped on an empty list or list droppable area
      await api.cards.update(draggedId, {
        list_id: targetList.id,
        parent_folder_id: null,
        folder_level: 0,
        position: cardsByList[targetList.id]?.length || 0,
      });


      await loadCardsForList(sourceListId);
      if (targetList.id !== sourceListId) {
        await loadCardsForList(targetList.id);
      }
    } else if (targetCard) {
      // Dropped on a card or folder
      if (targetCard.is_folder) {
        // Dropped on a folder - add to folder
        if (targetCard.folder_level >= 4) {
          alert('Maximum folder nesting depth reached (5 levels)');
          return;
        }


        await api.cards.update(draggedId, {
          parent_folder_id: targetCard.id,
          folder_level: targetCard.folder_level + 1,
          list_id: targetCard.list_id,
          position: 0, // Add at top of folder
        });


        await loadCardsForList(sourceListId);
        if (targetCard.list_id !== sourceListId) {
          await loadCardsForList(targetCard.list_id);
        }
      } else {
        // Dropped on a regular card - reorder
        const targetListCards = cardsByList[targetListId!] || [];
        const targetIndex = targetListCards.findIndex(c => c.id === overId);


        if (targetListId === sourceListId) {
          // Same list - reorder
          const sourceIndex = targetListCards.findIndex(c => c.id === draggedId);
         
          if (sourceIndex === targetIndex) return;


          // Calculate new position
          let newPosition: number;
          if (targetIndex === 0) {
            newPosition = 0;
          } else if (targetIndex === targetListCards.length - 1) {
            newPosition = targetListCards.length;
          } else {
            newPosition = targetIndex;
          }


          await api.cards.update(draggedId, {
            position: newPosition,
          });


          await loadCardsForList(sourceListId);
        } else {
          // Different list - move and reorder
          await api.cards.update(draggedId, {
            list_id: targetListId!,
            parent_folder_id: targetCard.parent_folder_id,
            folder_level: targetCard.folder_level,
            position: targetIndex,
          });


          await loadCardsForList(sourceListId);
          await loadCardsForList(targetListId!);
        }
      }
    }
  }


  async function handleAddList() {
    if (!newListName.trim()) {
      alert('Please enter a list name');
      return;
    }


    await api.lists.create({
      name: newListName,
      position: lists.length,
    });


    setNewListName('');
    setIsAddingList(false);
    loadLists();
  }


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin} // Better collision for deadzones
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto p-6">
        {/* Lists */}
        {lists.map(list => (
          <ListColumn
            key={list.id}
            list={list}
            onCardClick={onCardClick}
            overId={overId}
          />
        ))}


        {/* Add List */}
        {isAddingList ? (
          <div className="flex-shrink-0 w-80 bg-gray-800 rounded-lg p-4">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name..."
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddList();
                if (e.key === 'Escape') setIsAddingList(false);
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddList}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                Add List
              </button>
              <button
                onClick={() => setIsAddingList(false)}
                className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingList(true)}
            className="flex-shrink-0 w-80 h-fit bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-gray-400 hover:text-white transition-colors"
          >
            + Add List
          </button>
        )}
      </div>


      {/* Drag Overlay */}
      <DragOverlay>
        {activeCard ? (
          <div className="opacity-90 rotate-3 scale-105">
            <CardPreview card={activeCard} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
