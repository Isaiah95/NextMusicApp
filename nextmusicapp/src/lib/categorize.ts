import { Song } from './types';

// Predefined categories for simple categorization
const predefinedCategories: { [key: string]: string[] } = {
  Rock: ['rock', 'metal', 'punk', 'alternative'],
  Pop: ['pop', 'dance', 'electronic'],
  Jazz: ['jazz', 'blues', 'swing'],
  Classical: ['classical', 'orchestral', 'symphony'],
  HipHop: ['hip hop', 'rap', 'r&b'],
  Country: ['country', 'folk', 'bluegrass'],
  Other: [],
};

// Function to categorize a song based on artist, album, or title keywords
export function categorizeSong(song: Song): string {
  const text = `${song.title} ${song.artist} ${song.album || ''}`.toLowerCase();

  for (const [category, keywords] of Object.entries(predefinedCategories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
}

// Function to get all unique categories from a list of songs
export function getCategories(songs: Song[]): string[] {
  const categories = new Set<string>();
  songs.forEach(song => {
    if (song.category) {
      categories.add(song.category);
    }
  });
  return Array.from(categories).sort();
}

// Function to filter songs by category
export function filterSongsByCategory(songs: Song[], category: string): Song[] {
  return songs.filter(song => song.category === category);
}
