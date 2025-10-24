export interface ElectronAPI {
  campaign: {
    new: () => Promise<string | null>;
    open: () => Promise<string | null>;
    import: () => Promise<string | null>;
    close: () => Promise<void>;
    getMeta: () => Promise<any>;
    updateMeta: (updates: any) => Promise<void>;
  };
  templates: {
    getAll: () => Promise<any[]>;
    get: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, updates: any) => Promise<any>;
    delete: (id: string) => Promise<void>;
  };
  lists: {
    getAll: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: string, updates: any) => Promise<any>;
    delete: (id: string) => Promise<void>;
  };
  cards: {
    getAll: () => Promise<any[]>;
    getByList: (listId: string) => Promise<any[]>;
    get: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, updates: any) => Promise<any>;
    delete: (id: string) => Promise<void>;
    toggleFolderExpansion: (folderId: string) => Promise<void>;
    getFolderChildren: (folderId: string) => Promise<any[]>;
  };
  links: {
    getLinkedCards: (cardId: string, fieldKey: string) => Promise<any[]>;
    create: (sourceCardId: string, targetCardId: string, fieldKey: string) => Promise<any>;
    delete: (linkId: string) => Promise<void>;
    deleteForField: (cardId: string, fieldKey: string) => Promise<void>;
  };
  images: {
    upload: (imageData: string) => Promise<string>;
    get: (imageId: string) => Promise<string | null>;
    delete: (imageId: string) => Promise<void>;
  };
  files: {
    getRecent: () => Promise<any[]>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}