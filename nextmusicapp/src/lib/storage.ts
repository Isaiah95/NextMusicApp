import { Song, Playlist } from './types';

const DB_NAME = 'NextMusicApp';
const DB_VERSION = 2; // Increment version for new store
const SONGS_STORE = 'songs';
const PLAYLISTS_STORE = 'playlists';
const CURRENT_SONG_KEY = 'currentSongId';

export interface StoredSong extends Omit<Song, 'url' | 'coverArt'> {
  dataUrl: string;
  coverArtDataUrl?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SONGS_STORE)) {
        db.createObjectStore(SONGS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PLAYLISTS_STORE)) {
        db.createObjectStore(PLAYLISTS_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function saveSongs(songs: Song[]): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([SONGS_STORE], 'readwrite');
  const store = transaction.objectStore(SONGS_STORE);

  // Clear existing songs
  await new Promise<void>((resolve, reject) => {
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => resolve();
    clearRequest.onerror = () => reject(clearRequest.error);
  });

  // Save new songs
  for (const song of songs) {
    const storedSong: StoredSong = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      duration: song.duration,
      dataUrl: song.dataUrl,
      coverArtDataUrl: song.coverArtDataUrl,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.add(storedSong);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  db.close();
}

export async function loadSongs(): Promise<Song[]> {
  const db = await openDB();
  const transaction = db.transaction([SONGS_STORE], 'readonly');
  const store = transaction.objectStore(SONGS_STORE);

  return new Promise<Song[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const storedSongs: StoredSong[] = request.result;
      const songs: Song[] = storedSongs.map(storedSong => ({
        ...storedSong,
        url: storedSong.dataUrl, // Use dataUrl as url for now, will be replaced with blob URL
        coverArt: storedSong.coverArtDataUrl,
      }));
      resolve(songs);
    };
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
}

export async function saveCurrentSongId(songId: string | null): Promise<void> {
  localStorage.setItem(CURRENT_SONG_KEY, songId || '');
}

export async function loadCurrentSongId(): Promise<string | null> {
  const id = localStorage.getItem(CURRENT_SONG_KEY);
  return id || null;
}

export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([PLAYLISTS_STORE], 'readwrite');
  const store = transaction.objectStore(PLAYLISTS_STORE);

  // Clear existing playlists
  await new Promise<void>((resolve, reject) => {
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => resolve();
    clearRequest.onerror = () => reject(clearRequest.error);
  });

  // Save new playlists
  for (const playlist of playlists) {
    await new Promise<void>((resolve, reject) => {
      const request = store.add(playlist);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  db.close();
}

export async function loadPlaylists(): Promise<Playlist[]> {
  const db = await openDB();
  const transaction = db.transaction([PLAYLISTS_STORE], 'readonly');
  const store = transaction.objectStore(PLAYLISTS_STORE);

  return new Promise<Playlist[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const playlists: Playlist[] = request.result;
      resolve(playlists);
    };
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
}
