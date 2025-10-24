"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const database_1 = require("./database");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Global reference to current database
let currentDb = null;
let currentFilePath = null;
// ============================================
// UTILITY FUNCTIONS
// ============================================
function ensureDb() {
    if (!currentDb) {
        throw new Error('No campaign is currently open');
    }
    return currentDb;
}
function getRecentFilesPath() {
    return path.join(electron_1.app.getPath('userData'), 'recent_files.json');
}
function getRecentFiles() {
    const filePath = getRecentFilesPath();
    if (!fs.existsSync(filePath)) {
        return [];
    }
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        // Filter out files that no longer exist
        return data.files.filter((f) => fs.existsSync(f.path)).slice(0, 10);
    }
    catch {
        return [];
    }
}
function addToRecentFiles(filePath) {
    const recent = getRecentFiles();
    const stats = fs.statSync(filePath);
    // Remove if already exists
    const filtered = recent.filter(f => f.path !== filePath);
    // Add to front
    filtered.unshift({
        path: filePath,
        name: path.basename(filePath, '.dnd'),
        lastOpened: new Date().toISOString(),
        size: stats.size,
    });
    // Save
    const recentPath = getRecentFilesPath();
    fs.writeFileSync(recentPath, JSON.stringify({ files: filtered.slice(0, 10) }, null, 2));
}
// ============================================
// CAMPAIGN HANDLERS
// ============================================
electron_1.ipcMain.handle('campaign:new', async () => {
    const result = await electron_1.dialog.showSaveDialog({
        title: 'Create New Campaign',
        defaultPath: 'My Campaign.dnd',
        filters: [{ name: 'D&D Campaign', extensions: ['dnd'] }],
    });
    if (result.canceled || !result.filePath) {
        return null;
    }
    // Close current database if open
    if (currentDb) {
        currentDb.close();
    }
    // Create new database
    currentDb = new database_1.CampaignDatabase(result.filePath);
    currentFilePath = result.filePath;
    addToRecentFiles(result.filePath);
    return result.filePath;
});
electron_1.ipcMain.handle('campaign:open', async () => {
    const result = await electron_1.dialog.showOpenDialog({
        title: 'Open Campaign',
        filters: [{ name: 'D&D Campaign', extensions: ['dnd'] }],
        properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }
    const filePath = result.filePaths[0];
    // Close current database if open
    if (currentDb) {
        currentDb.close();
    }
    // Open database
    currentDb = new database_1.CampaignDatabase(filePath);
    currentFilePath = filePath;
    addToRecentFiles(filePath);
    return filePath;
});
electron_1.ipcMain.handle('campaign:import', async () => {
    // Same as open for now
    return electron_1.ipcMain.emit('campaign:open');
});
electron_1.ipcMain.handle('campaign:close', async () => {
    if (currentDb) {
        currentDb.close();
        currentDb = null;
        currentFilePath = null;
    }
});
electron_1.ipcMain.handle('campaign:getMeta', async () => {
    return ensureDb().getCampaignMeta();
});
electron_1.ipcMain.handle('campaign:updateMeta', async (event, updates) => {
    ensureDb().updateCampaignMeta(updates);
});
// ============================================
// TEMPLATE HANDLERS
// ============================================
electron_1.ipcMain.handle('templates:getAll', async () => {
    return ensureDb().getTemplates();
});
electron_1.ipcMain.handle('templates:get', async (event, id) => {
    return ensureDb().getTemplate(id);
});
electron_1.ipcMain.handle('templates:create', async (event, data) => {
    return ensureDb().createTemplate(data);
});
electron_1.ipcMain.handle('templates:update', async (event, id, updates) => {
    return ensureDb().updateTemplate(id, updates);
});
electron_1.ipcMain.handle('templates:delete', async (event, id) => {
    try {
        ensureDb().deleteTemplate(id);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// ============================================
// LIST HANDLERS
// ============================================
electron_1.ipcMain.handle('lists:getAll', async () => {
    return ensureDb().getLists();
});
electron_1.ipcMain.handle('lists:create', async (event, data) => {
    return ensureDb().createList(data);
});
electron_1.ipcMain.handle('lists:update', async (event, id, updates) => {
    return ensureDb().updateList(id, updates);
});
electron_1.ipcMain.handle('lists:delete', async (event, id) => {
    ensureDb().deleteList(id);
});
// ============================================
// CARD HANDLERS
// ============================================
electron_1.ipcMain.handle('cards:getByList', async (event, listId) => {
    return ensureDb().getCardsByList(listId);
});
electron_1.ipcMain.handle('cards:get', async (event, id) => {
    return ensureDb().getCard(id);
});
electron_1.ipcMain.handle('cards:create', async (event, data) => {
    return ensureDb().createCard(data);
});
electron_1.ipcMain.handle('cards:update', async (event, id, updates) => {
    return ensureDb().updateCard(id, updates);
});
electron_1.ipcMain.handle('cards:delete', async (event, id) => {
    ensureDb().deleteCard(id);
});
electron_1.ipcMain.handle('cards:toggleFolderExpansion', async (event, folderId) => {
    ensureDb().toggleFolderExpansion(folderId);
});
electron_1.ipcMain.handle('cards:getFolderChildren', async (event, folderId) => {
    return ensureDb().getFolderChildren(folderId);
});
electron_1.ipcMain.handle('cards:reorder', async (event, listId, cardId, newPosition) => {
    ensureDb().reorderCards(listId, cardId, newPosition);
});
// ============================================
// FILE HANDLERS
// ============================================
electron_1.ipcMain.handle('files:getRecent', async () => {
    return getRecentFiles();
});
// ============================================
// LINK HANDLERS
// ============================================
electron_1.ipcMain.handle('links:getLinkedCards', async (event, cardId, fieldKey) => {
    return ensureDb().getLinkedCards(cardId, fieldKey);
});
electron_1.ipcMain.handle('links:create', async (event, sourceCardId, targetCardId, fieldKey) => {
    return ensureDb().createLink(sourceCardId, targetCardId, fieldKey);
});
electron_1.ipcMain.handle('links:delete', async (event, linkId) => {
    ensureDb().deleteLink(linkId);
});
electron_1.ipcMain.handle('links:deleteForField', async (event, cardId, fieldKey) => {
    ensureDb().deleteLinksForField(cardId, fieldKey);
});
electron_1.ipcMain.handle('cards:getAll', async () => {
    return ensureDb().getAllCards();
});
// ============================================
// IMAGE HANDLERS
// ============================================
electron_1.ipcMain.handle('images:upload', async (event, imageData) => {
    // imageData is base64 encoded data URL
    const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid image data');
    }
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const db = ensureDb();
    const imageId = db.saveImage(buffer, mimeType);
    return imageId;
});
electron_1.ipcMain.handle('images:get', async (event, imageId) => {
    const db = ensureDb();
    const image = db.getImage(imageId);
    if (!image)
        return null;
    // Return as base64 data URL
    const base64 = image.data.toString('base64');
    return `data:${image.mime_type};base64,${base64}`;
});
electron_1.ipcMain.handle('images:delete', async (event, imageId) => {
    ensureDb().deleteImage(imageId);
});
