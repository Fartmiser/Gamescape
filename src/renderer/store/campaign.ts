import { create } from 'zustand';
import type { CampaignMeta, CardTemplate, List, PopulatedCard } from '../../shared/types';
import { api } from '../api';


interface CampaignState {
  // Current campaign
  currentFilePath: string | null;
  campaignMeta: CampaignMeta | null;
 
  // Data
  templates: CardTemplate[];
  lists: List[];
  cardsByList: Record<string, PopulatedCard[]>;
 
  // UI state
  isLoading: boolean;
 
  // Actions
  openCampaign: (filePath: string) => Promise<void>;
  closeCampaign: () => Promise<void>;
  loadTemplates: () => Promise<void>;
  loadLists: () => Promise<void>;
  loadCardsForList: (listId: string) => Promise<void>;
}


export const useCampaignStore = create<CampaignState>((set, get) => ({
  currentFilePath: null,
  campaignMeta: null,
  templates: [],
  lists: [],
  cardsByList: {},
  isLoading: false,


  openCampaign: async (filePath: string) => {
    set({ isLoading: true });
    try {
      // Campaign is already open in main process
      // Just load the data
      const meta = await api.campaign.getMeta();
      const templates = await api.templates.getAll();
      const lists = await api.lists.getAll();
     
      set({
        currentFilePath: filePath,
        campaignMeta: meta,
        templates,
        lists,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to open campaign:', error);
      set({ isLoading: false });
    }
  },


  closeCampaign: async () => {
    await api.campaign.close();
    set({
      currentFilePath: null,
      campaignMeta: null,
      templates: [],
      lists: [],
      cardsByList: {},
    });
  },


  loadTemplates: async () => {
    const templates = await api.templates.getAll();
    set({ templates });
  },


  loadLists: async () => {
    const lists = await api.lists.getAll();
    set({ lists });
  },


  loadCardsForList: async (listId: string) => {
    const cards = await api.cards.getByList(listId);
    set(state => ({
      cardsByList: {
        ...state.cardsByList,
        [listId]: cards,
      },
    }));
  },
}));
