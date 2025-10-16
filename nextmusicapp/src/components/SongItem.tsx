'use client';

import { useState } from 'react';
import { Song } from '@/lib/types';

interface SongItemProps {
  song: Song;
  isCurrent: boolean;
  onSelect: (song: Song) => void;
  onRemove: (songId: string) => void;
}

export default function SongItem({ song, isCurrent, onSelect, onRemove }: SongItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(song.title);
  const [editArtist, setEditArtist] = useState(song.artist);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    song.title = editTitle;
    song.artist = editArtist;
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
        isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      onClick={() => onSelect(song)}
    >
      <div className="flex items-center space-x-3 flex-1">
        {song.coverArt ? (
          <img
            src={song.coverArt}
            alt={`${song.title} cover`}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
            <span className="text-gray-400 text-xs">🎵</span>
          </div>
        )}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-1 bg-gray-600 rounded text-white text-sm"
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="text"
                value={editArtist}
                onChange={(e) => setEditArtist(e.target.value)}
                className="w-full p-1 bg-gray-600 rounded text-white text-sm"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="text-green-400 hover:text-green-300 text-xs"
                >
                  Save
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className="text-gray-400 hover:text-gray-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4 className="font-medium">{song.title}</h4>
              <p className="text-sm text-gray-400">{song.artist}</p>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">{formatTime(song.duration)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(!isEditing);
          }}
          className="text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(song.id);
          }}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
