import { contextBridge, ipcRenderer } from 'electron';


// Expose safe APIs to renderer
// Renderer can call: window.electron.db.getTemplates()
contextBridge.exposeInMainWorld('electron', {
  // Campaign operations
  campaign: {
    new: () => ipcRenderer.invoke('campaign:new'),
    open: () => ipcRenderer.invoke('campaign:open'),
    import: () => ipcRenderer.invoke('campaign:import'),
    close: () => ipcRenderer.invoke('campaign:close'),
    getMeta: () => ipcRenderer.invoke('campaign:getMeta'),
    updateMeta: (updates: any) => ipcRenderer.invoke('campaign:updateMeta', updates),
  },


  // Template operations
  templates: {
    getAll: () => ipcRenderer.invoke('templates:getAll'),
    get: (id: string) => ipcRenderer.invoke('templates:get', id),
    create: (data: any) => ipcRenderer.invoke('templates:create', data),
    update: (id: string, updates: any) => ipcRenderer.invoke('templates:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('templates:delete', id),
  },


  // List operations
  lists: {
    getAll: () => ipcRenderer.invoke('lists:getAll'),
    create: (data: any) => ipcRenderer.invoke('lists:create', data),
    update: (id: string, updates: any) => ipcRenderer.invoke('lists:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('lists:delete', id),
  },


  // Card operations
  cards: {
    getAll: () => ipcRenderer.invoke('cards:getAll'),
    getByList: (listId: string) => ipcRenderer.invoke('cards:getByList', listId),
    get: (id: string) => ipcRenderer.invoke('cards:get', id),
    create: (data: any) => ipcRenderer.invoke('cards:create', data),
    update: (id: string, updates: any) => ipcRenderer.invoke('cards:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('cards:delete', id),
    toggleFolderExpansion: (folderId: string) => ipcRenderer.invoke('cards:toggleFolderExpansion', folderId),
    getFolderChildren: (folderId: string) => ipcRenderer.invoke('cards:getFolderChildren', folderId),
  },
  

  // Link operations
  links: {
    getLinkedCards: (cardId: string, fieldKey: string) => ipcRenderer.invoke('links:getLinkedCards', cardId, fieldKey),
    create: (sourceCardId: string, targetCardId: string, fieldKey: string) => ipcRenderer.invoke('links:create', sourceCardId, targetCardId, fieldKey),
    delete: (linkId: string) => ipcRenderer.invoke('links:delete', linkId),
    deleteForField: (cardId: string, fieldKey: string) => ipcRenderer.invoke('links:deleteForField', cardId, fieldKey),
  },


  images: {
    upload: (imageData: string) => ipcRenderer.invoke('images:upload', imageData),
    get: (imageId: string) => ipcRenderer.invoke('images:get', imageId),
    delete: (imageId: string) => ipcRenderer.invoke('images:delete', imageId),
  },



  // File operations
  files: {
    getRecent: () => ipcRenderer.invoke('files:getRecent'),
  },
});


// Type definitions for TypeScript
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
    getByList: (listId: string) => Promise<any[]>;
    getAll: () => Promise<any[]>;
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
