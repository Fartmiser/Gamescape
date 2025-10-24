import React, { useState } from 'react';
import type { PopulatedCard } from '../../../shared/types';
import { api } from '../../api';
import { IconPicker } from '../templates/IconPicker';
import { ColorPicker } from '../templates/ColorPicker';


interface FolderSettingsMenuProps {
  folder: PopulatedCard;
  onClose: () => void;
  onUpdate: () => void;
}


export function FolderSettingsMenu({ folder, onClose, onUpdate }: FolderSettingsMenuProps) {
  const [name, setName] = useState(folder.name);
  const [icon, setIcon] = useState(folder.field_values.icon || '');
  const [color, setColor] = useState(folder.field_values.color || folder.template.color);


  async function handleSave() {
    await api.cards.update(folder.id, {
      name,
      field_values: {
        ...folder.field_values,
        icon,
        color,
      },
    });
    onUpdate();
    onClose();
  }


  async function handleDelete() {
    const confirmed = confirm(`Delete folder "${folder.name}"? All cards inside will remain in the list.`);
    if (!confirmed) return;


    // Move all children out of folder
    const children = await api.cards.getFolderChildren(folder.id);
    for (const child of children) {
      await api.cards.update(child.id, {
        parent_folder_id: null,
        folder_level: 0,
      });
    }


    // Delete folder
    await api.cards.delete(folder.id);
    onUpdate();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-96">
        <h2 className="text-xl font-bold text-white mb-4">Folder Settings</h2>


        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
          />
        </div>


        {/* Icon */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Icon (optional)</label>
          <IconPicker value={icon} onChange={setIcon} />
        </div>


        {/* Color */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>


        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            🗑️ Delete Folder
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
