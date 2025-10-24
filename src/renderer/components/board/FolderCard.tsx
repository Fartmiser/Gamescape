import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PopulatedCard } from '../../../shared/types';


interface FolderCardProps {
  folder: PopulatedCard;
  onToggle: () => void;
  onSettingsClick: () => void;
  indentLevel: number;
  isOver?: boolean; // NEW
}


export function FolderCard({ folder, onToggle, onSettingsClick, indentLevel, isOver }: FolderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id });


  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };


  // Calculate indent (3% per level)
  const indentPercent = indentLevel * 3;
  const widthPercent = 100 - indentPercent;


  return (
    <div className="relative">
      {/* Drop indicator */}
      {isOver && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 z-10">
          <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      )}


      <div
        ref={setNodeRef}
        style={{
          ...style,
          marginLeft: `${indentPercent}%`,
          width: `${widthPercent}%`,
          borderLeftColor: folder.field_values.color || folder.template.color,
        }}
        {...attributes}
        {...listeners}
        className={`bg-gray-750 hover:bg-gray-700 rounded-lg p-2 cursor-pointer transition-colors border-l-4 ${
          isOver ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Left side: expand/collapse + icon + name */}
          <div className="flex items-center gap-2 flex-1" onClick={onToggle}>
            <span className="text-gray-400">
              {folder.is_expanded ? '▼' : '▶'}
            </span>
            {folder.field_values.icon && (
              <span className="text-lg">{folder.field_values.icon}</span>
            )}
            <span className="font-medium text-white text-sm">{folder.name}</span>
          </div>


          {/* Right side: settings button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSettingsClick();
            }}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-600 transition-colors"
          >
            ⚙️
          </button>
        </div>
      </div>


      {/* Deadzone */}
      <div className="h-2" />
    </div>
  );
}
