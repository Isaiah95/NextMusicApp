'use client';

import { useState, useEffect } from 'react';
import AudioPlayer from '@/components/AudioPlayer';
import Playlist from '@/components/Playlist';
import PlaylistManager from '@/components/PlaylistManager';
import { Song, Playlist as PlaylistType } from '@/lib/types';
import { loadSongs, saveSongs, loadCurrentSongId, saveCurrentSongId } from '@/lib/storage';
import { categorizeSong } from '@/lib/categorize';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song);
  };

  const handleSongRemove = (songId: string) => {
    const newSongs = songs.filter(song => song.id !== songId);
    setSongs(newSongs);
    if (currentSong?.id === songId) {
      const remainingSongs = newSongs;
      setCurrentSong(remainingSongs.length > 0 ? remainingSongs[0] : null);
    }
  };

  const handleSongsAdd = (newSongs: Song[]) => {
    // Categorize new songs if they don't have a category
    const categorizedSongs = newSongs.map(song => ({
      ...song,
      category: song.category || categorizeSong(song),
    }));

    const updatedSongs = [...songs, ...categorizedSongs];
    setSongs(updatedSongs);
    if (!currentSong && categorizedSongs.length > 0) {
      setCurrentSong(categorizedSongs[0]);
    }
  };

  // Load songs and current song on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedSongs = await loadSongs();
        const currentSongId = await loadCurrentSongId();

        // Convert data URLs back to blob URLs for loaded songs
        const songsWithBlobUrls = loadedSongs.map(song => ({
          ...song,
          url: song.dataUrl, // Use dataUrl as url initially
          coverArt: song.coverArtDataUrl,
          category: song.category || categorizeSong(song), // Ensure categorization
        }));

        setSongs(songsWithBlobUrls);

        if (currentSongId) {
          const current = songsWithBlobUrls.find(song => song.id === currentSongId);
          if (current) {
            setCurrentSong(current);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save songs whenever songs change
  useEffect(() => {
    if (isLoaded) {
      saveSongs(songs);
    }
  }, [songs, isLoaded]);

  // Save current song whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveCurrentSongId(currentSong?.id || null);
    }
  }, [currentSong, isLoaded]);



  const handlePlaylistSelect = (playlist: PlaylistType) => {
    // Set the playlist songs as the current songs list
    setSongs(playlist.songs);
    setCurrentSong(playlist.songs[0] || null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Next Music App</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <AudioPlayer
              currentSong={currentSong}
              songs={songs}
              setCurrentSong={setCurrentSong}
            />
          </div>

          <div>
            <Playlist
              songs={songs}
              currentSong={currentSong}
              onSongSelect={handleSongSelect}
              onSongRemove={handleSongRemove}
              onSongsAdd={handleSongsAdd}
            />
          </div>

          <div>
            <PlaylistManager
              songs={songs}
              onPlaylistSelect={handlePlaylistSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
