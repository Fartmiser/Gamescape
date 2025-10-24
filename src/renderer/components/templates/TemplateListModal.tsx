import React from 'react';
import { useCampaignStore } from '../../store/campaign';
import { useTemplateStore } from '../../store/templates';
import { NIL } from 'uuid';


export function TemplateListModal() {
  const { templates } = useCampaignStore();
  const { isListModalOpen, openModal, closeModal } = useTemplateStore();

  if (!isListModalOpen) return null;

  function handleSelectTemplate(templateId: string) {
    openModal(templateId);
  }


  function handleNewTemplate() {
    openModal(); // No ID = new template
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Card Types</h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>


        {/* Content - Grid of Templates */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4">
            {/* New Type Button - Always First */}
            <button
              onClick={handleNewTemplate}
              className="aspect-square bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center transition-colors group"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">+</div>
                <div className="text-lg font-semibold text-white">New Type</div>
              </div>
            </button>


            {/* Existing Templates */}
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 border-2 border-gray-700 hover:border-gray-500"
                style={{ backgroundColor: template.color + '20' }} // 20 = 12.5% opacity
              >
                <div className="text-5xl mb-3">{template.icon}</div>
                <div className="text-xl font-semibold text-white mb-1">{template.name}</div>
                <div className="text-sm text-gray-400">
                  {template.field_definitions.length} field{template.field_definitions.length !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>


          {templates.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              <p>No card types yet. Click "+ New Type" to create one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
