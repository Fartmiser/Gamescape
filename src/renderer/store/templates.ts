import { create } from 'zustand';
import type { CardTemplate, FieldDefinition } from '../../shared/types';
import { api } from '../api';


interface TemplateState {
  // UI state
  isListModalOpen: boolean;  // NEW - shows template list
  isEditorModalOpen: boolean; // NEW - shows template editor
  selectedTemplateId: string | null;
  editingTemplate: Partial<CardTemplate> | null;
  
  // Actions
  openListModal: () => void;  // NEW
  closeListModal: () => void; // NEW
  openModal: (templateId?: string) => void;
  closeModal: () => void;
  setEditingTemplate: (template: Partial<CardTemplate>) => void;
  saveTemplate: () => Promise<void>;
  deleteTemplate: (id: string, cardCount: number) => Promise<boolean>;
}


export const useTemplateStore = create<TemplateState>((set, get) => ({
  isListModalOpen: false,
  isEditorModalOpen: false,
  selectedTemplateId: null,
  editingTemplate: null,


  openListModal: () => {
    set({ isListModalOpen: true });
    console.log("Opened list modal");
  },


  closeListModal: () => {
    set({ isListModalOpen: false });
    console.log("Closed list modal");
  },


  openModal: (templateId?: string) => {
    // Close list modal, open editor
    set({ isListModalOpen: false });
    
    if (templateId) {
      // Edit existing template
      api.templates.get(templateId).then(template => {
        set({
          isEditorModalOpen: true,
          selectedTemplateId: templateId,
          editingTemplate: template,
        });
      });
    } else {
      // Create new template
      set({
        isEditorModalOpen: true,
        selectedTemplateId: null,
        editingTemplate: {
          name: '',
          icon: '📋',
          color: '#6366F1',
          field_definitions: [
            {
              key: 'description',
              label: 'Description',
              type: 'longtext',
              validation: { required: true },
              showInPreview: false,
            },
          ],
        },
      });
    }
  },


  closeModal: () => {
    const { isEditorModalOpen } = get();
    
    if (isEditorModalOpen) {
      // If editor is open, go back to list
      set({
        isEditorModalOpen: false,
        isListModalOpen: true,
        selectedTemplateId: null,
        editingTemplate: null,
      });
    } else {
      // If list is open, close everything
      set({
        isListModalOpen: false,
        isEditorModalOpen: false,
        selectedTemplateId: null,
        editingTemplate: null,
      });
    }
  },


  setEditingTemplate: (template: Partial<CardTemplate>) => {
    set({ editingTemplate: template });
  },


  saveTemplate: async () => {
    const { selectedTemplateId, editingTemplate } = get();
    
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.field_definitions) {
      throw new Error('Invalid template data');
    }


    // Validate field keys are unique
    const keys = editingTemplate.field_definitions.map(f => f.key);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      throw new Error('Field keys must be unique');
    }


    if (selectedTemplateId) {
      // Update existing
      await api.templates.update(selectedTemplateId, editingTemplate);
    } else {
      // Create new
      await api.templates.create(editingTemplate);
    }
    
    // After saving, go back to list
    set({
      isEditorModalOpen: false,
      isListModalOpen: true,
      selectedTemplateId: null,
      editingTemplate: null,
    });
  },


  deleteTemplate: async (id: string, cardCount: number) => {
    if (cardCount > 0) {
      const confirmed = confirm(
        `Warning: Deleting this template will also delete ${cardCount} card(s). Continue?`
      );
      if (!confirmed) return false;
    }
    
    try {
      await api.templates.delete(id);
      return true;
    } catch (error: any) {
      alert('Failed to delete template: ' + error.message);
      return false;
    }
  },
}));
