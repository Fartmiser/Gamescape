// This wraps window.electron with type-safe functions
// Components will import from here instead of using window.electron directly


export const api = {
  campaign: {
    async new() {
      return window.electron.campaign.new();
    },
    async open() {
      return window.electron.campaign.open();
    },
    async import() {
      return window.electron.campaign.import();
    },
    async close() {
      return window.electron.campaign.close();
    },
    async getMeta() {
      return window.electron.campaign.getMeta();
    },
    async updateMeta(updates: any) {
      return window.electron.campaign.updateMeta(updates);
    },
  },


  templates: {
    async getAll() {
      return window.electron.templates.getAll();
    },
    async get(id: string) {
      return window.electron.templates.get(id);
    },
    async create(data: any) {
      return window.electron.templates.create(data);
    },
    async update(id: string, updates: any) {
      return window.electron.templates.update(id, updates);
    },
    async delete(id: string) {
      return window.electron.templates.delete(id);
    },
  },


  lists: {
    async getAll() {
      return window.electron.lists.getAll();
    },
    async create(data: any) {
      return window.electron.lists.create(data);
    },
    async update(id: string, updates: any) {
      return window.electron.lists.update(id, updates);
    },
    async delete(id: string) {
      return window.electron.lists.delete(id);
    },
  },


  cards: {
    async getByList(listId: string) {
      return window.electron.cards.getByList(listId);
    },
    async get(id: string) {
      return window.electron.cards.get(id);
    },
    async getAll() {
      return window.electron.cards.getAll();
    },
    async create(data: any) {
      return window.electron.cards.create(data);
    },
    async update(id: string, updates: any) {
      return window.electron.cards.update(id, updates);
    },
    async delete(id: string) {
      return window.electron.cards.delete(id);
    },
    async toggleFolderExpansion(folderId: string) {
      return window.electron.cards.toggleFolderExpansion(folderId);
    },
    async getFolderChildren(folderId: string) {
      return window.electron.cards.getFolderChildren(folderId);
    },
  },


  links: {
    async getLinkedCards(cardId: string, fieldKey: string) {
      return window.electron.links.getLinkedCards(cardId, fieldKey);
    },
    async create(sourceCardId: string, targetCardId: string, fieldKey: string) {
      return window.electron.links.create(sourceCardId, targetCardId, fieldKey);
    },
    async delete(linkId: string) {
      return window.electron.links.delete(linkId);
    },
    async deleteForField(cardId: string, fieldKey: string) {
      return window.electron.links.deleteForField(cardId, fieldKey);
    },
  },


  images: {
    async upload(imageData: string) {
      return window.electron.images.upload(imageData);
    },
    async get(imageId: string) {
      return window.electron.images.get(imageId);
    },
    async delete(imageId: string) {
      return window.electron.images.delete(imageId);
    },
  },


  files: {
    async getRecent() {
      return window.electron.files.getRecent();
    },
  },
};
