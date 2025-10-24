import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type {
  CampaignMeta,
  CardTemplate,
  List,
  Card,
  PopulatedCard,
  CardLink,
  Backlink,
  FieldDefinition,
} from '../shared/types';


export class CampaignDatabase {
  private db: Database.Database;


  constructor(filePath: string) {
    this.db = new Database(filePath);
   
    // Enable foreign keys (ensures relationships are valid)
    this.db.pragma('foreign_keys = ON');
   
    // Use Write-Ahead Logging for better performance
    this.db.pragma('journal_mode = WAL');
   
    // Initialize schema if this is a new database
    this.initSchema();
  }


  // ============================================
  // SCHEMA INITIALIZATION
  // ============================================


  private initSchema(): void {
    // Campaign metadata table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS campaign_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);


    // Check if this is a new database
    const versionRow = this.db.prepare('SELECT value FROM campaign_meta WHERE key = ?').get('version') as { value: string } | undefined;
   
    if (!versionRow) {
      // New database - set defaults
      const now = new Date().toISOString();
      this.db.prepare('INSERT INTO campaign_meta (key, value) VALUES (?, ?)').run('name', 'New Campaign');
      this.db.prepare('INSERT INTO campaign_meta (key, value) VALUES (?, ?)').run('description', '');
      this.db.prepare('INSERT INTO campaign_meta (key, value) VALUES (?, ?)').run('created_at', now);
      this.db.prepare('INSERT INTO campaign_meta (key, value) VALUES (?, ?)').run('modified_at', now);
      this.db.prepare('INSERT INTO campaign_meta (key, value) VALUES (?, ?)').run('version', '1');
    }


    // Card templates table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS card_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
        icon TEXT,
        color TEXT CHECK (color IS NULL OR color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'),
        field_definitions TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        CONSTRAINT valid_field_definitions CHECK (json_valid(field_definitions) AND json_type(field_definitions) = 'array')
      );
    `);


    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_templates_name ON card_templates(name);`);


    // Lists table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS lists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
        position INTEGER NOT NULL CHECK (position >= 0),
        collapsed INTEGER DEFAULT 0 NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(position)
      );
    `);


    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_lists_position ON lists(position);`);


    // Cards table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
        template_id TEXT NOT NULL REFERENCES card_templates(id) ON DELETE RESTRICT,
        name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 200),
        field_values TEXT NOT NULL DEFAULT '{}',
        position INTEGER NOT NULL CHECK (position >= 0),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(list_id, position),
        CONSTRAINT valid_field_values CHECK (json_valid(field_values) AND json_type(field_values) = 'object')
      );
    `);


    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_cards_list ON cards(list_id);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_cards_template ON cards(template_id);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_cards_list_position ON cards(list_id, position);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);`);


    // Card links table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS card_links (
        id TEXT PRIMARY KEY,
        source_card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        target_card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        field_key TEXT NOT NULL,
        created_at TEXT NOT NULL,
        CONSTRAINT no_self_links CHECK (source_card_id != target_card_id),
        UNIQUE(source_card_id, target_card_id, field_key)
      );
    `);
    
    try {
      this.db.exec(`ALTER TABLE cards ADD COLUMN parent_folder_id TEXT REFERENCES cards(id) ON DELETE CASCADE;`);
    } catch (e) {
      // Column already exists
    }


    try {
      this.db.exec(`ALTER TABLE cards ADD COLUMN folder_level INTEGER DEFAULT 0 NOT NULL;`);
    } catch (e) {
      // Column already exists
    }


    try {
      this.db.exec(`ALTER TABLE cards ADD COLUMN is_folder INTEGER DEFAULT 0 NOT NULL;`);
    } catch (e) {
      // Column already exists
    }


    try {
      this.db.exec(`ALTER TABLE cards ADD COLUMN is_expanded INTEGER DEFAULT 1 NOT NULL;`);
    } catch (e) {
      // Column already exists
    }



    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_cards_parent_folder ON cards(parent_folder_id);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_cards_is_folder ON cards(is_folder);`);

    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_links_source ON card_links(source_card_id);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_links_target ON card_links(target_card_id);`);

    this.db.exec(`
    CREATE TABLE IF NOT EXISTS image_blobs (
      id TEXT PRIMARY KEY,
      mime_type TEXT NOT NULL,
      data BLOB NOT NULL,
      size_bytes INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  );
  }


  // ============================================
  // CAMPAIGN METADATA
  // ============================================


  getCampaignMeta(): CampaignMeta {
    const rows = this.db.prepare('SELECT key, value FROM campaign_meta').all() as Array<{ key: string; value: string }>;
    const meta: any = {};
    rows.forEach(row => {
      meta[row.key] = row.value;
    });
    return meta as CampaignMeta;
  }


  updateCampaignMeta(updates: Partial<CampaignMeta>): void {
    const stmt = this.db.prepare('INSERT OR REPLACE INTO campaign_meta (key, value) VALUES (?, ?)');
   
    // Always update modified_at
    updates.modified_at = new Date().toISOString();
   
    Object.entries(updates).forEach(([key, value]) => {
      stmt.run(key, value);
    });
  }


  // ============================================
  // TEMPLATES
  // ============================================


  getTemplates(): CardTemplate[] {
    const rows = this.db.prepare('SELECT * FROM card_templates ORDER BY name').all() as any[];
    return rows.map(row => ({
      ...row,
      field_definitions: JSON.parse(row.field_definitions),
      collapsed: Boolean(row.collapsed),
    }));
  }


  getTemplate(id: string): CardTemplate | null {
    const row = this.db.prepare('SELECT * FROM card_templates WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      ...row,
      field_definitions: JSON.parse(row.field_definitions),
    };
  }


  createTemplate(data: { name: string; icon: string; color: string; field_definitions: FieldDefinition[] }): CardTemplate {
    const id = uuidv4();
    const now = new Date().toISOString();
   
    this.db.prepare(`
      INSERT INTO card_templates (id, name, icon, color, field_definitions, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.icon, data.color, JSON.stringify(data.field_definitions), now, now);
   
    this.updateCampaignMeta({} as any); // Update modified_at
   
    return this.getTemplate(id)!;
  }


  updateTemplate(id: string, updates: Partial<CardTemplate>): CardTemplate {
    const current = this.getTemplate(id);
    if (!current) throw new Error('Template not found');
   
    const now = new Date().toISOString();
    const updated = { ...current, ...updates, updated_at: now };
   
    this.db.prepare(`
      UPDATE card_templates
      SET name = ?, icon = ?, color = ?, field_definitions = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updated.name,
      updated.icon,
      updated.color,
      JSON.stringify(updated.field_definitions),
      now,
      id
    );
   
    this.updateCampaignMeta({} as any);
   
    return this.getTemplate(id)!;
  }


  deleteTemplate(id: string): void {
    // Check if any cards use this template
    const count = this.db.prepare('SELECT COUNT(*) as count FROM cards WHERE template_id = ?').get(id) as { count: number };
   
    if (count.count > 0) {
      throw new Error(`Cannot delete template: ${count.count} cards are using it`);
    }
   
    this.db.prepare('DELETE FROM card_templates WHERE id = ?').run(id);
    this.updateCampaignMeta({} as any);
  }


  // ============================================
  // LISTS
  // ============================================


  getLists(): List[] {
    const rows = this.db.prepare('SELECT * FROM lists ORDER BY position').all() as any[];
    return rows.map(row => ({
      ...row,
      collapsed: Boolean(row.collapsed),
    }));
  }


  createList(data: { name: string; position: number }): List {
    const id = uuidv4();
    const now = new Date().toISOString();
   
    this.db.prepare(`
      INSERT INTO lists (id, name, position, collapsed, created_at)
      VALUES (?, ?, ?, 0, ?)
    `).run(id, data.name, data.position, now);
   
    this.updateCampaignMeta({} as any);
   
    return this.db.prepare('SELECT * FROM lists WHERE id = ?').get(id) as List;
  }


  updateList(id: string, updates: Partial<List>): List {
    const setters: string[] = [];
    const values: any[] = [];
   
    if (updates.name !== undefined) {
      setters.push('name = ?');
      values.push(updates.name);
    }
    if (updates.position !== undefined) {
      setters.push('position = ?');
      values.push(updates.position);
    }
    if (updates.collapsed !== undefined) {
      setters.push('collapsed = ?');
      values.push(updates.collapsed ? 1 : 0);
    }
   
    values.push(id);
   
    this.db.prepare(`UPDATE lists SET ${setters.join(', ')} WHERE id = ?`).run(...values);
    this.updateCampaignMeta({} as any);
   
    return this.db.prepare('SELECT * FROM lists WHERE id = ?').get(id) as List;
  }


  deleteList(id: string): void {
    this.db.prepare('DELETE FROM lists WHERE id = ?').run(id);
    this.updateCampaignMeta({} as any);
  }


  // ============================================
  // CARDS
  // ============================================


  getCardsByList(listId: string): PopulatedCard[] {
    const rows = this.db.prepare(`
      SELECT
        c.*,
        t.name as template_name,
        t.icon as template_icon,
        t.color as template_color,
        t.field_definitions as template_field_definitions,
        t.created_at as template_created_at,
        t.updated_at as template_updated_at
      FROM cards c
      JOIN card_templates t ON c.template_id = t.id
      WHERE c.list_id = ?
      ORDER BY c.position
  `).all(listId) as any[];
 
  return rows.map(row => ({
    id: row.id,
    list_id: row.list_id,
    template_id: row.template_id,
    name: row.name,
    field_values: JSON.parse(row.field_values),
    position: row.position,
    created_at: row.created_at,
    updated_at: row.updated_at,
    parent_folder_id: row.parent_folder_id,
    folder_level: row.folder_level,
    is_folder: Boolean(row.is_folder),
    is_expanded: Boolean(row.is_expanded),
    template: {
      id: row.template_id,
      name: row.template_name,
      icon: row.template_icon,
      color: row.template_color,
      field_definitions: JSON.parse(row.template_field_definitions),
      created_at: row.template_created_at,
      updated_at: row.template_updated_at,
    },
  }));

  }


  getCard(id: string): PopulatedCard | null {
    const row = this.db.prepare(`
      SELECT
        c.*,
        t.name as template_name,
        t.icon as template_icon,
        t.color as template_color,
        t.field_definitions as template_field_definitions,
        t.created_at as template_created_at,
        t.updated_at as template_updated_at
      FROM cards c
      JOIN card_templates t ON c.template_id = t.id
      WHERE c.id = ?
    `).get(id) as any;
   
    if (!row) return null;
   
    return {
      id: row.id,
      list_id: row.list_id,
      template_id: row.template_id,
      name: row.name,
      field_values: JSON.parse(row.field_values),
      position: row.position,
      created_at: row.created_at,
      updated_at: row.updated_at,
      parent_folder_id: row.parent_folder_id,
      folder_level: row.folder_level,
      is_folder: Boolean(row.is_folder),
      is_expanded: Boolean(row.is_expanded),
      template: {
        id: row.template_id,
        name: row.template_name,
        icon: row.template_icon,
        color: row.template_color,
        field_definitions: JSON.parse(row.template_field_definitions),
        created_at: row.template_created_at,
        updated_at: row.template_updated_at,
      },
    };
  }


  createCard(data: {
    list_id: string;
    template_id: string;
    name: string;
    field_values: Record<string, any>;
    position: number;
    parent_folder_id?: string | null;
    folder_level?: number;
    is_folder?: boolean;
    is_expanded?: boolean;
  }): PopulatedCard {
    const id = uuidv4();
    const now = new Date().toISOString();
  
    this.db.prepare(`
      INSERT INTO cards (
        id, list_id, template_id, name, field_values, position,
        parent_folder_id, folder_level, is_folder, is_expanded,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.list_id,
      data.template_id,
      data.name,
      JSON.stringify(data.field_values),
      data.position,
      data.parent_folder_id || null,
      data.folder_level || 0,
      data.is_folder ? 1 : 0,
      data.is_expanded !== undefined ? (data.is_expanded ? 1 : 0) : 1,
      now,
      now
    );
  
    this.updateCampaignMeta({} as any);
  
    return this.getCard(id)!;
  }



  updateCard(id: string, updates: Partial<Card>): PopulatedCard {
    const setters: string[] = [];
    const values: any[] = [];
   
    if (updates.name !== undefined) {
      setters.push('name = ?');
      values.push(updates.name);
    }
    if (updates.field_values !== undefined) {
      setters.push('field_values = ?');
      values.push(JSON.stringify(updates.field_values));
    }
    if (updates.list_id !== undefined) {
      setters.push('list_id = ?');
      values.push(updates.list_id);
    }
    if (updates.position !== undefined) {
      setters.push('position = ?');
      values.push(updates.position);
    }
   
    setters.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
   
    this.db.prepare(`UPDATE cards SET ${setters.join(', ')} WHERE id = ?`).run(...values);
    this.updateCampaignMeta({} as any);
   
    return this.getCard(id)!;
  }


  toggleFolderExpansion(folderId: string): void {
    const folder = this.getCard(folderId);
    if (!folder || !folder.is_folder) return;
  
    this.db.prepare('UPDATE cards SET is_expanded = ? WHERE id = ?')
      .run(folder.is_expanded ? 0 : 1, folderId);
  
    this.updateCampaignMeta({} as any);
  }

  getFolderChildren(folderId: string): PopulatedCard[] {
    const rows = this.db.prepare(`
      SELECT
        c.*,
        t.name as template_name,
        t.icon as template_icon,
        t.color as template_color,
        t.field_definitions as template_field_definitions,
        t.created_at as template_created_at,
        t.updated_at as template_updated_at
      FROM cards c
      JOIN card_templates t ON c.template_id = t.id
      WHERE c.parent_folder_id = ?
      ORDER BY c.position
    `).all(folderId) as any[];
  
    return rows.map(row => ({
      id: row.id,
      list_id: row.list_id,
      template_id: row.template_id,
      name: row.name,
      field_values: JSON.parse(row.field_values),
      position: row.position,
      created_at: row.created_at,
      updated_at: row.updated_at,
      parent_folder_id: row.parent_folder_id,
      folder_level: row.folder_level,
      is_folder: Boolean(row.is_folder),
      is_expanded: Boolean(row.is_expanded),
      template: {
        id: row.template_id,
        name: row.template_name,
        icon: row.template_icon,
        color: row.template_color,
        field_definitions: JSON.parse(row.template_field_definitions),
        created_at: row.template_created_at,
        updated_at: row.template_updated_at,
      },
    }));
  }


  reorderCards(listId: string, cardId: string, newPosition: number): void {
    const transaction = this.db.transaction(() => {
      // Get all cards in the list
      const cards = this.db.prepare(
        'SELECT id, position FROM cards WHERE list_id = ? ORDER BY position'
      ).all(listId) as Array<{ id: string; position: number }>;


      // Remove the card being moved
      const movingCard = cards.find(c => c.id === cardId);
      if (!movingCard) return;


      const filteredCards = cards.filter(c => c.id !== cardId);


      // Insert at new position
      filteredCards.splice(newPosition, 0, movingCard);


      // Update all positions
      const stmt = this.db.prepare('UPDATE cards SET position = ? WHERE id = ?');
      filteredCards.forEach((card, index) => {
        stmt.run(index, card.id);
      });
    });


    transaction();
    this.updateCampaignMeta({} as any);
  }



  deleteCard(id: string): void {
    this.db.prepare('DELETE FROM cards WHERE id = ?').run(id);
    this.updateCampaignMeta({} as any);
  }


  // ============================================
  // CARD LINKS
  // ============================================


  getCardLinks(cardId: string, fieldKey: string): CardLink[] {
    const rows = this.db.prepare(`
      SELECT * FROM card_links
      WHERE source_card_id = ? AND field_key = ?
      ORDER BY created_at
    `).all(cardId, fieldKey) as any[];
   
    return rows;
  }


  getLinkedCards(cardId: string, fieldKey: string): PopulatedCard[] {
    const rows = this.db.prepare(`
      SELECT
        c.*,
        t.name as template_name,
        t.icon as template_icon,
        t.color as template_color,
        t.field_definitions as template_field_definitions,
        t.created_at as template_created_at,
        t.updated_at as template_updated_at
      FROM card_links cl
      JOIN cards c ON cl.target_card_id = c.id
      JOIN card_templates t ON c.template_id = t.id
      WHERE cl.source_card_id = ? AND cl.field_key = ?
      ORDER BY cl.created_at
    `).all(cardId, fieldKey) as any[];
   
    return rows.map(row => ({
      id: row.id,
      list_id: row.list_id,
      template_id: row.template_id,
      name: row.name,
      field_values: JSON.parse(row.field_values),
      position: row.position,
      created_at: row.created_at,
      updated_at: row.updated_at,
      parent_folder_id: row.parent_folder_id,
      folder_level: row.folder_level,
      is_folder: Boolean(row.is_folder),
      is_expanded: Boolean(row.is_expanded),
      template: {
        id: row.template_id,
        name: row.template_name,
        icon: row.template_icon,
        color: row.template_color,
        field_definitions: JSON.parse(row.template_field_definitions),
        created_at: row.template_created_at,
        updated_at: row.template_updated_at,
      },
    }));
  }


  createLink(sourceCardId: string, targetCardId: string, fieldKey: string): CardLink {
    const id = uuidv4();
    const now = new Date().toISOString();
   
    this.db.prepare(`
      INSERT INTO card_links (id, source_card_id, target_card_id, field_key, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, sourceCardId, targetCardId, fieldKey, now);
   
    this.updateCampaignMeta({} as any);
   
    return this.db.prepare('SELECT * FROM card_links WHERE id = ?').get(id) as CardLink;
  }


  deleteLink(id: string): void {
    this.db.prepare('DELETE FROM card_links WHERE id = ?').run(id);
    this.updateCampaignMeta({} as any);
  }


  deleteLinksForField(cardId: string, fieldKey: string): void {
    this.db.prepare('DELETE FROM card_links WHERE source_card_id = ? AND field_key = ?').run(cardId, fieldKey);
    this.updateCampaignMeta({} as any);
  }


  getAllCards(): PopulatedCard[] {
    const rows = this.db.prepare(`
      SELECT
        c.*,
        t.name as template_name,
        t.icon as template_icon,
        t.color as template_color,
        t.field_definitions as template_field_definitions,
        t.created_at as template_created_at,
        t.updated_at as template_updated_at
      FROM cards c
      JOIN card_templates t ON c.template_id = t.id
      ORDER BY c.name
    `).all() as any[];
   
    return rows.map(row => ({
      id: row.id,
      list_id: row.list_id,
      template_id: row.template_id,
      name: row.name,
      field_values: JSON.parse(row.field_values),
      position: row.position,
      created_at: row.created_at,
      updated_at: row.updated_at,
      parent_folder_id: row.parent_folder_id,
      folder_level: row.folder_level,
      is_folder: Boolean(row.is_folder),
      is_expanded: Boolean(row.is_expanded),
      template: {
        id: row.template_id,
        name: row.template_name,
        icon: row.template_icon,
        color: row.template_color,
        field_definitions: JSON.parse(row.template_field_definitions),
        created_at: row.template_created_at,
        updated_at: row.template_updated_at,
      },
    }));
  }

  // ============================================
  // IMAGES
  // ============================================


  saveImage(data: Buffer, mimeType: string): string {
    const id = uuidv4();
    const now = new Date().toISOString();
   
    this.db.prepare(`
      INSERT INTO image_blobs (id, mime_type, data, size_bytes, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, mimeType, data, data.length, now);
   
    return id;
  }


  getImage(id: string): { id: string; mime_type: string; data: Buffer; size_bytes: number; created_at: string } | null {
    const row = this.db.prepare('SELECT * FROM image_blobs WHERE id = ?').get(id) as any;
    return row || null;
  }


  deleteImage(id: string): void {
    this.db.prepare('DELETE FROM image_blobs WHERE id = ?').run(id);
  }

  
  // ============================================
  // CLEANUP
  // ============================================


  close(): void {
    this.db.close();
  }
}
