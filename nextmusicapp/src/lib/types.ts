export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  category?: string; // e.g., genre like 'Rock', 'Pop', 'Jazz'
  duration: number; // in seconds
  url: string; // URL to the audio file (object URL for local files)
  dataUrl: string; // Base64 data URL for the audio file
  coverArt?: string; // URL to the cover art image (blob URL for local files)
  coverArtDataUrl?: string; // Base64 data URL for cover art
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}
