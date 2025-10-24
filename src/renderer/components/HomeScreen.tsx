import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { RecentFile } from '../../shared/types';


interface HomeScreenProps {
  onCampaignOpen: (filePath: string) => void;
}


export function HomeScreen({ onCampaignOpen }: HomeScreenProps) {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);


  useEffect(() => {
    loadRecentFiles();
  }, []);


  async function loadRecentFiles() {
    const files = await api.files.getRecent();
    setRecentFiles(files);
  }


  async function handleNewCampaign() {
    const filePath = await api.campaign.new();
    if (filePath) {
      onCampaignOpen(filePath);
    }
  }


  async function handleOpenCampaign() {
    const filePath = await api.campaign.open();
    if (filePath) {
      onCampaignOpen(filePath);
    }
  }


  async function handleOpenRecent(file: RecentFile) {
    // Re-open the file through the open dialog to ensure it exists
    // In a real app, we'd open it directly, but this is safer for now
    await api.campaign.close(); // Close any open campaign
    // TODO: Add direct file open API
    // For now, user must use "Open Campaign" button
    alert('Click "Open Campaign" and select: ' + file.name);
  }


  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }


  function formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);


    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }


  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="m-auto max-w-4xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            🎲 Campaign Manager
          </h1>
          <p className="text-gray-300 text-lg">
            Organize your campaigns with custom templates and linked entities
          </p>
        </div>


        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <button
            onClick={handleNewCampaign}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-3xl mb-2">+</div>
            <div className="text-lg">New Campaign</div>
          </button>


          <button
            onClick={handleOpenCampaign}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-3xl mb-2">📂</div>
            <div className="text-lg">Open Campaign</div>
          </button>
        </div>


        {/* Recent Files */}
        {recentFiles.length > 0 && (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Campaigns</h2>
            <div className="space-y-2">
              {recentFiles.map(file => (
                <button
                  key={file.path}
                  onClick={() => handleOpenRecent(file)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-left p-4 rounded-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg">{file.name}</div>
                      <div className="text-gray-400 text-sm">{file.path}</div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <div>{formatDate(file.lastOpened)}</div>
                      <div>{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}


        {recentFiles.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p>No recent campaigns. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
