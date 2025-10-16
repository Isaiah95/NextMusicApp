'use client';

import { useState, useRef } from 'react';
import { Song } from '@/lib/types';
import SongItem from './SongItem';
import { parseBlob } from 'music-metadata-browser';

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface PlaylistProps {
  songs: Song[];
  currentSong: Song | null;
  onSongSelect: (song: Song) => void;
  onSongRemove: (songId: string) => void;
  onSongsAdd: (songs: Song[]) => void; // Add this prop to handle adding multiple songs
}

export default function Playlist({ songs, currentSong, onSongSelect, onSongRemove, onSongsAdd }: PlaylistProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files);
    }
  };

  const addSongs = async () => {
    if (selectedFiles) {
      const audioFiles = Array.from(selectedFiles).filter(file => file.type.startsWith('audio/'));

      const newSongs: Song[] = [];

      for (const file of audioFiles) {
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        const duration = await new Promise<number>((resolve) => {
          audio.onloadedmetadata = () => resolve(audio.duration);
        });

        // Parse metadata
        let title = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        let artist = 'Unknown'; // Default artist
        let album: string | undefined;
        let coverArt: string | undefined;

        try {
          const metadata = await parseBlob(file);
          title = metadata.common.title || title;
          artist = metadata.common.artist || artist;
          album = metadata.common.album;

          // Extract cover art if available
          if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            const blob = new Blob([new Uint8Array(picture.data)], { type: picture.format });
            coverArt = URL.createObjectURL(blob);
          }
        } catch (error) {
          console.warn('Failed to parse metadata for', file.name, error);
        }

        const dataUrl = await fileToDataUrl(file);
        let coverArtDataUrl: string | undefined;

        if (coverArt) {
          // If coverArt is a blob URL, convert it to data URL
          const response = await fetch(coverArt);
          const blob = await response.blob();
          coverArtDataUrl = await fileToDataUrl(blob);
        }

        const newSong: Song = {
          id: Date.now().toString() + Math.random().toString(),
          title,
          artist,
          album,
          duration,
          url,
          dataUrl,
          coverArt,
          coverArtDataUrl,
        };

        newSongs.push(newSong);
      }

      // Add all songs at once
      onSongsAdd(newSongs);

      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Playlist</h2>

      <input
        type="text"
        placeholder="Search songs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-700 rounded text-white placeholder-gray-400"
      />

      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto playlist-scroll">
        {filteredSongs.map((song) => (
          <SongItem
            key={song.id}
            song={song}
            isCurrent={currentSong?.id === song.id}
            onSelect={onSongSelect}
            onRemove={onSongRemove}
          />
        ))}
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-medium mb-2">Add Songs</h3>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFilesChange}
            className="w-full p-2 bg-gray-700 rounded text-white"
          />
          {selectedFiles && <p className="text-sm text-gray-400">Selected {selectedFiles.length} files</p>}
          <button
            onClick={addSongs}
            className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Add Songs
          </button>
        </div>
      </div>
    </div>
  );
}
