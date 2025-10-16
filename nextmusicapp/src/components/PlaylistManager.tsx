'use client';

import { useState, useEffect } from 'react';
import { Song, Playlist } from '@/lib/types';
import { getCategories, filterSongsByCategory } from '@/lib/categorize';
import { savePlaylists, loadPlaylists } from '@/lib/storage';
import SongItem from './SongItem';

interface PlaylistManagerProps {
  songs: Song[];
  onPlaylistSelect: (playlist: Playlist) => void;
}

export default function PlaylistManager({ songs, onPlaylistSelect }: PlaylistManagerProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const categories = getCategories(songs);

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedPlaylists = await loadPlaylists();
        setPlaylists(loadedPlaylists);
      } catch (error) {
        console.error('Failed to load playlists:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      savePlaylists(playlists);
    }
  }, [playlists, isLoaded]);

  const createPlaylistFromCategory = () => {
    if (!selectedCategory || !newPlaylistName.trim()) return;

    const filteredSongs = filterSongsByCategory(songs, selectedCategory);
    if (filteredSongs.length === 0) return;

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      songs: filteredSongs,
    };

    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setSelectedCategory('');
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Playlist Manager</h2>

      {/* Create Playlist Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Create Playlist from Category</h3>
        <div className="space-y-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded text-white"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
          />
          <button
            onClick={createPlaylistFromCategory}
            disabled={!selectedCategory || !newPlaylistName.trim()}
            className="w-full p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors"
          >
            Create Playlist
          </button>
        </div>
      </div>

      {/* Existing Playlists */}
      <div>
        <h3 className="text-lg font-medium mb-2">Your Playlists</h3>
        {playlists.length === 0 ? (
          <p className="text-gray-400">No playlists created yet.</p>
        ) : (
          <div className="space-y-2">
            {playlists.map(playlist => (
              <div key={playlist.id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{playlist.name}</h4>
                  <p className="text-sm text-gray-400">{playlist.songs.length} songs</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onPlaylistSelect(playlist)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                  >
                    Play
                  </button>
                  <button
                    onClick={() => deletePlaylist(playlist.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
