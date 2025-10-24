import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PopulatedCard } from '../../../shared/types';


interface CardPreviewProps {
  card: PopulatedCard;
  onClick: () => void;
  isOver?: boolean;
}


export function CardPreview({ card, onClick, isOver }: CardPreviewProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });


  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };


  // Get preview fields
  const previewFields = card.template.field_definitions.filter(f => f.showInPreview);


  return (
    <div className="relative">
      {/* Drop indicator - shows when dragging over */}
      {isOver && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 z-10">
          <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      )}


      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={onClick}
        className={`bg-gray-700 hover:bg-gray-600 rounded-lg p-3 cursor-pointer transition-colors border-l-4 ${
          isOver ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          ...style,
          borderLeftColor: card.template.color,
        }}
      >
        {/* Card Name */}
        <div className="flex items-start gap-2 mb-2">
          <span className="text-lg">{card.template.icon}</span>
          <div className="flex-1">
            <div className="font-semibold text-white">{card.name}</div>
            <div className="text-xs text-gray-400">{card.template.name}</div>
          </div>
        </div>


        {/* Preview Fields */}
        {previewFields.length > 0 && (
          <div className="space-y-1 text-sm">
            {previewFields.map(field => {
              const value = card.field_values[field.key];
              if (value === null || value === undefined || value === '') return null;


              return (
                <div key={field.key} className="text-gray-300">
                  <span className="text-gray-500">{field.label}:</span>{' '}
                  <span>{String(value)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {/* Deadzone - Area below card for dropping between items */}
      <div className="h-2" />
    </div>
  );
}

