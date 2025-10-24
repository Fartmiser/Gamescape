"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose safe APIs to renderer
// Renderer can call: window.electron.db.getTemplates()
electron_1.contextBridge.exposeInMainWorld('electron', {
    // Campaign operations
    campaign: {
        new: () => electron_1.ipcRenderer.invoke('campaign:new'),
        open: () => electron_1.ipcRenderer.invoke('campaign:open'),
        import: () => electron_1.ipcRenderer.invoke('campaign:import'),
        close: () => electron_1.ipcRenderer.invoke('campaign:close'),
        getMeta: () => electron_1.ipcRenderer.invoke('campaign:getMeta'),
        updateMeta: (updates) => electron_1.ipcRenderer.invoke('campaign:updateMeta', updates),
    },
    // Template operations
    templates: {
        getAll: () => electron_1.ipcRenderer.invoke('templates:getAll'),
        get: (id) => electron_1.ipcRenderer.invoke('templates:get', id),
        create: (data) => electron_1.ipcRenderer.invoke('templates:create', data),
        update: (id, updates) => electron_1.ipcRenderer.invoke('templates:update', id, updates),
        delete: (id) => electron_1.ipcRenderer.invoke('templates:delete', id),
    },
    // List operations
    lists: {
        getAll: () => electron_1.ipcRenderer.invoke('lists:getAll'),
        create: (data) => electron_1.ipcRenderer.invoke('lists:create', data),
        update: (id, updates) => electron_1.ipcRenderer.invoke('lists:update', id, updates),
        delete: (id) => electron_1.ipcRenderer.invoke('lists:delete', id),
    },
    // Card operations
    cards: {
        getAll: () => electron_1.ipcRenderer.invoke('cards:getAll'),
        getByList: (listId) => electron_1.ipcRenderer.invoke('cards:getByList', listId),
        get: (id) => electron_1.ipcRenderer.invoke('cards:get', id),
        create: (data) => electron_1.ipcRenderer.invoke('cards:create', data),
        update: (id, updates) => electron_1.ipcRenderer.invoke('cards:update', id, updates),
        delete: (id) => electron_1.ipcRenderer.invoke('cards:delete', id),
        toggleFolderExpansion: (folderId) => electron_1.ipcRenderer.invoke('cards:toggleFolderExpansion', folderId),
        getFolderChildren: (folderId) => electron_1.ipcRenderer.invoke('cards:getFolderChildren', folderId),
    },
    // Link operations
    links: {
        getLinkedCards: (cardId, fieldKey) => electron_1.ipcRenderer.invoke('links:getLinkedCards', cardId, fieldKey),
        create: (sourceCardId, targetCardId, fieldKey) => electron_1.ipcRenderer.invoke('links:create', sourceCardId, targetCardId, fieldKey),
        delete: (linkId) => electron_1.ipcRenderer.invoke('links:delete', linkId),
        deleteForField: (cardId, fieldKey) => electron_1.ipcRenderer.invoke('links:deleteForField', cardId, fieldKey),
    },
    images: {
        upload: (imageData) => electron_1.ipcRenderer.invoke('images:upload', imageData),
        get: (imageId) => electron_1.ipcRenderer.invoke('images:get', imageId),
        delete: (imageId) => electron_1.ipcRenderer.invoke('images:delete', imageId),
    },
    // File operations
    files: {
        getRecent: () => electron_1.ipcRenderer.invoke('files:getRecent'),
    },
});
