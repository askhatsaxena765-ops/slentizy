export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  audioUrl: string;
  fallbackAudioUrl?: string;
  youtubeVideoId?: string;
  youtubeFallbacks?: string[];
  duration: number; // in seconds
  genre?: string;
  releaseDate?: string;
  artistId?: number;
  lyrics?: string[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  color: string; // Hex or gradient start color for ambient lighting
  tracks: Track[];
  isCustom?: boolean;
  createdAt?: string;
}

export type ViewType = 'home' | 'search' | 'library' | 'playlist' | 'liked';

export type RepeatMode = 'off' | 'queue' | 'one';
