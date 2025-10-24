import { ipcMain, dialog, app } from 'electron';
import { CampaignDatabase } from './database';
import * as fs from 'fs';
import * as path from 'path';
import type { RecentFile } from '../shared/types';


// Global reference to current database
let currentDb: CampaignDatabase | null = null;
let currentFilePath: string | null = null;


// ============================================
// UTILITY FUNCTIONS
// ============================================


function ensureDb(): CampaignDatabase {
  if (!currentDb) {
    throw new Error('No campaign is currently open');
  }
  return currentDb;
}


function getRecentFilesPath(): string {
  return path.join(app.getPath('userData'), 'recent_files.json');
}


function getRecentFiles(): RecentFile[] {
  const filePath = getRecentFilesPath();
  if (!fs.existsSync(filePath)) {
    return [];
  }
 
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // Filter out files that no longer exist
    return data.files.filter((f: RecentFile) => fs.existsSync(f.path)).slice(0, 10);
  } catch {
    return [];
  }
}


function addToRecentFiles(filePath: string): void {
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


ipcMain.handle('campaign:new', async () => {
  const result = await dialog.showSaveDialog({
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
  currentDb = new CampaignDatabase(result.filePath);
  currentFilePath = result.filePath;
 
  addToRecentFiles(result.filePath);
 
  return result.filePath;
});


ipcMain.handle('campaign:open', async () => {
  const result = await dialog.showOpenDialog({
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
  currentDb = new CampaignDatabase(filePath);
  currentFilePath = filePath;
 
  addToRecentFiles(filePath);
 
  return filePath;
});


ipcMain.handle('campaign:import', async () => {
  // Same as open for now
  return ipcMain.emit('campaign:open' as any);
});


ipcMain.handle('campaign:close', async () => {
  if (currentDb) {
    currentDb.close();
    currentDb = null;
    currentFilePath = null;
  }
});


ipcMain.handle('campaign:getMeta', async () => {
  return ensureDb().getCampaignMeta();
});


ipcMain.handle('campaign:updateMeta', async (event, updates) => {
  ensureDb().updateCampaignMeta(updates);
});


// ============================================
// TEMPLATE HANDLERS
// ============================================


ipcMain.handle('templates:getAll', async () => {
  return ensureDb().getTemplates();
});


ipcMain.handle('templates:get', async (event, id: string) => {
  return ensureDb().getTemplate(id);
});


ipcMain.handle('templates:create', async (event, data) => {
  return ensureDb().createTemplate(data);
});


ipcMain.handle('templates:update', async (event, id: string, updates) => {
  return ensureDb().updateTemplate(id, updates);
});


ipcMain.handle('templates:delete', async (event, id: string) => {
  try {
    ensureDb().deleteTemplate(id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});


// ============================================
// LIST HANDLERS
// ============================================


ipcMain.handle('lists:getAll', async () => {
  return ensureDb().getLists();
});


ipcMain.handle('lists:create', async (event, data) => {
  return ensureDb().createList(data);
});


ipcMain.handle('lists:update', async (event, id: string, updates) => {
  return ensureDb().updateList(id, updates);
});


ipcMain.handle('lists:delete', async (event, id: string) => {
  ensureDb().deleteList(id);
});


// ============================================
// CARD HANDLERS
// ============================================


ipcMain.handle('cards:getByList', async (event, listId: string) => {
  return ensureDb().getCardsByList(listId);
});


ipcMain.handle('cards:get', async (event, id: string) => {
  return ensureDb().getCard(id);
});


ipcMain.handle('cards:create', async (event, data) => {
  return ensureDb().createCard(data);
});


ipcMain.handle('cards:update', async (event, id: string, updates) => {
  return ensureDb().updateCard(id, updates);
});


ipcMain.handle('cards:delete', async (event, id: string) => {
  ensureDb().deleteCard(id);
});


ipcMain.handle('cards:toggleFolderExpansion', async (event, folderId: string) => {
  ensureDb().toggleFolderExpansion(folderId);
});


ipcMain.handle('cards:getFolderChildren', async (event, folderId: string) => {
  return ensureDb().getFolderChildren(folderId);
});


ipcMain.handle('cards:reorder', async (event, listId: string, cardId: string, newPosition: number) => {
  ensureDb().reorderCards(listId, cardId, newPosition);
});


// ============================================
// FILE HANDLERS
// ============================================


ipcMain.handle('files:getRecent', async () => {
  return getRecentFiles();
});


// ============================================
// LINK HANDLERS
// ============================================


ipcMain.handle('links:getLinkedCards', async (event, cardId: string, fieldKey: string) => {
  return ensureDb().getLinkedCards(cardId, fieldKey);
});


ipcMain.handle('links:create', async (event, sourceCardId: string, targetCardId: string, fieldKey: string) => {
  return ensureDb().createLink(sourceCardId, targetCardId, fieldKey);
});


ipcMain.handle('links:delete', async (event, linkId: string) => {
  ensureDb().deleteLink(linkId);
});


ipcMain.handle('links:deleteForField', async (event, cardId: string, fieldKey: string) => {
  ensureDb().deleteLinksForField(cardId, fieldKey);
});


ipcMain.handle('cards:getAll', async () => {
  return ensureDb().getAllCards();
});


// ============================================
// IMAGE HANDLERS
// ============================================


ipcMain.handle('images:upload', async (event, imageData: string) => {
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


ipcMain.handle('images:get', async (event, imageId: string) => {
  const db = ensureDb();
  const image = db.getImage(imageId);
 
  if (!image) return null;
 
  // Return as base64 data URL
  const base64 = image.data.toString('base64');
  return `data:${image.mime_type};base64,${base64}`;
});


ipcMain.handle('images:delete', async (event, imageId: string) => {
  ensureDb().deleteImage(imageId);
});