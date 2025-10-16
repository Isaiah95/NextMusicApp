'use client';

import { useState, useRef, useEffect } from 'react';
import { Song } from '@/lib/types';

interface AudioPlayerProps {
  currentSong: Song | null;
  songs: Song[];
  setCurrentSong: (song: Song) => void;
}

export default function AudioPlayer({ currentSong, songs, setCurrentSong }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [loopMode, setLoopMode] = useState<'single' | 'playlist'>('playlist');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const firstSongSet = useRef(false);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.url;
      audioRef.current.load();
      if (autoPlay && firstSongSet.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
        firstSongSet.current = true;
      }
      setCurrentTime(0);
      setDuration(currentSong.duration);
    }
  }, [currentSong, autoPlay]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolume(vol);
      if (vol > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = previousVolume;
        setVolume(previousVolume);
        setIsMuted(false);
      } else {
        setPreviousVolume(volume);
        audioRef.current.volume = 0;
        setVolume(0);
        setIsMuted(true);
      }
    }
  };

  const handleNext = () => {
    if (currentSong) {
      if (shuffleMode) {
        // Pick a random song different from current
        const availableSongs = songs.filter(song => song.id !== currentSong.id);
        if (availableSongs.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableSongs.length);
          setCurrentSong(availableSongs[randomIndex]);
        }
      } else {
        const currentIndex = songs.findIndex(song => song.id === currentSong.id);
        const nextIndex = loopMode === 'playlist' ? (currentIndex + 1) % songs.length : Math.min(currentIndex + 1, songs.length - 1);
        if (nextIndex !== currentIndex) {
          setCurrentSong(songs[nextIndex]);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentSong) {
      const currentIndex = songs.findIndex(song => song.id === currentSong.id);
      const prevIndex = loopMode === 'playlist' ? (currentIndex === 0 ? songs.length - 1 : currentIndex - 1) : Math.max(currentIndex - 1, 0);
      setCurrentSong(songs[prevIndex]);
    }
  };

  const handleSongEnd = () => {
    if (loopMode === 'single') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg text-white">
        <p>No song selected</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <div className="mb-4 flex items-center space-x-4">
        {currentSong.coverArt ? (
          <img
            src={currentSong.coverArt}
            alt={`${currentSong.title} cover`}
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-600 rounded flex items-center justify-center">
            <span className="text-gray-400 text-2xl">🎵</span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold">{currentSong.title}</h3>
          <p className="text-gray-400">{currentSong.artist}</p>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleSongEnd}
      />

      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={handlePrevious}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          ⏮️
        </button>
        <button
          onClick={togglePlayPause}
          className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          ⏭️
        </button>
        <button
          onClick={() => setLoopMode(loopMode === 'single' ? 'playlist' : 'single')}
          className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${loopMode === 'single' ? 'bg-green-600' : 'bg-blue-600'}`}
        >
          {loopMode === 'single' ? '🔄' : '🔁'}
        </button>
        <button
          onClick={() => setShuffleMode(!shuffleMode)}
          className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${shuffleMode ? 'bg-purple-600' : 'bg-blue-600'}`}
        >
          🔀
        </button>
      </div>

      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={toggleMute}
          className="text-sm hover:bg-gray-700 p-1 rounded transition-colors"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
