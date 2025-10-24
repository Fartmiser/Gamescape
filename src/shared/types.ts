// ============================================
// CAMPAIGN METADATA
// ============================================


export interface CampaignMeta {
  name: string;
  description: string;
  created_at: string;  // ISO timestamp
  modified_at: string; // ISO timestamp
  version: string;     // Schema version
}


// ============================================
// FIELD SYSTEM
// ============================================


// All possible field types
export type FieldType =
  | 'text'        // Single line text
  | 'longtext'    // Multi-line text (markdown)
  | 'number'      // Integer or decimal
  | 'boolean'     // Checkbox
  | 'select'      // Dropdown (single choice)
  | 'multiselect' // Dropdown (multiple choices)
  | 'link'        // Link to other cards
  | 'image'       // Image upload
  | 'date'        // Date picker
  | 'datetime'    // Date + time picker
  | 'color'       // Color picker
  | 'url'         // URL input
  | 'dice'       // Dice notation (e.g., "2d6+3")
  | 'audio (wip)'; // Audio file


// Field validation rules
export interface FieldValidation {
  required?: boolean;       // Must have a value
  min?: number;             // Min value (for numbers) or length (for text)
  max?: number;             // Max value or length
  pattern?: string;         // Regex pattern for text
  options?: string[];       // Options for select/multiselect
}


// Configuration for link fields
export interface LinkConfig {
  allowMultiple: boolean;      // Can link to multiple cards?
  staticLinkType?: string;     // Restrict to specific template ID (optional)
  previewFields?: string[];    // Which fields to show in preview (optional)
}


// Valid field values
export type FieldValue = string | number | boolean | string[] | null;


// Definition of a single field in a template
export interface FieldDefinition {
  key: string;                 // Unique identifier (e.g., "hit_points")
  label: string;               // Display name (e.g., "Hit Points")
  type: FieldType;             // Field type
  validation?: FieldValidation;
  linkConfig?: LinkConfig;     // Only for link fields
  placeholder?: string;        // Placeholder text
  helpText?: string;           // Help tooltip
  defaultValue?: FieldValue;   // Default value for new cards
  showInPreview?: boolean;     // Show this field in card preview on board
}


// ============================================
// TEMPLATES
// ============================================


export interface CardTemplate {
  id: string;                      // UUID
  name: string;                    // Template name (e.g., "Character")
  icon: string;                    // Icon emoji or identifier
  color: string;                   // Hex color (e.g., "#3B82F6")
  field_definitions: FieldDefinition[];
  created_at: string;
  updated_at: string;
}


// ============================================
// LISTS
// ============================================


export interface List {
  id: string;                      // UUID
  name: string;                    // List name (e.g., "Characters")
  position: number;                // Order on board
  collapsed: boolean;              // Is list collapsed?
  created_at: string;
}


// ============================================
// CARDS
// ============================================


export interface Card {
  id: string;                      // UUID
  list_id: string;                 // Which list this card belongs to
  template_id: string;             // Which template defines this card
  name: string;                    // Card name
  field_values: Record<string, FieldValue>; // Field key → value
  position: number;                // Order in list
  created_at: string;
  updated_at: string;
  parent_folder_id: string | null;
  folder_level: number;
  is_folder: boolean;
  is_expanded: boolean;
}


// Card with populated template data
export interface PopulatedCard extends Card {
  template: CardTemplate;
}


// ============================================
// CARD LINKS
// ============================================


export interface CardLink {
  id: string;                      // UUID
  source_card_id: string;          // Card that has the link field
  target_card_id: string;          // Card being linked to
  field_key: string;               // Which field this link belongs to
  created_at: string;
}


// Backlink info (who links to this card?)
export interface Backlink {
  id: string;
  source_card_id: string;
  source_card_name: string;
  field_key: string;
  field_label: string;
}


// ============================================
// RECENT FILES
// ============================================


export interface RecentFile {
  path: string;                    // Full file path
  name: string;                    // Campaign name
  lastOpened: string;              // ISO timestamp
  size: number;                    // File size in bytes
}
