import { Playlist } from '../types';

export interface GenreCategory {
  id: string;
  name: string;
  color: string;
  searchTerm: string;
  image: string;
}

export const GENRE_CATEGORIES: GenreCategory[] = [
  {
    id: 'pop',
    name: 'Pop Hits',
    color: '#8c1932',
    searchTerm: 'pop hits',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop & Rap',
    color: '#ba5d07',
    searchTerm: 'hip hop',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'dance',
    name: 'Dance / Electronic',
    color: '#27856a',
    searchTerm: 'edm electronic',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'rock',
    name: 'Rock Classics',
    color: '#e91429',
    searchTerm: 'rock classics',
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'chill',
    name: 'Chill & Relax',
    color: '#477d95',
    searchTerm: 'chill acoustic',
    image: 'https://images.unsplash.com/photo-1445985543470-41fdd5c31447?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Study',
    color: '#503750',
    searchTerm: 'lofi study beats',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'indie',
    name: 'Indie & Alternative',
    color: '#608108',
    searchTerm: 'indie alternative',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'rnb',
    name: 'R&B & Soul',
    color: '#8d67ab',
    searchTerm: 'r&b soul',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'workout',
    name: 'Workout Energy',
    color: '#777777',
    searchTerm: 'workout pump',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'sleep',
    name: 'Sleep & Ambient',
    color: '#1e3264',
    searchTerm: 'ambient sleep',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
  }
];

export interface CuratedPlaylistSeed {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  color: string;
  query: string;
}

export const CURATED_PLAYLIST_SEEDS: CuratedPlaylistSeed[] = [
  {
    id: 'playlist-global-top-50',
    name: 'Global Top 50',
    description: 'The biggest tracks on Spotify worldwide right now: Taylor Swift, Billie Eilish, Kendrick Lamar, Sabrina Carpenter.',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    color: '#06b6d4',
    query: 'Taylor Swift Billie Eilish Sabrina Carpenter',
  },
  {
    id: 'playlist-tth',
    name: 'Today\'s Top Hits',
    description: 'Sabrina Carpenter is on top of the Hottest 50! Featuring global chart toppers.',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    color: '#10b981',
    query: 'top pop hits',
  },
  {
    id: 'playlist-rapcaviar',
    name: 'RapCaviar',
    description: 'New music from Kendrick Lamar, Drake, Travis Scott and the freshest hip-hop tracks.',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    color: '#d946ef',
    query: 'kendrick lamar drake rap',
  },
  {
    id: 'playlist-lofi',
    name: 'Lo-Fi Chill Beats',
    description: 'Soft and cozy beats to study, relax, program, or daydream to.',
    coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    color: '#3b82f6',
    query: 'lofi chillhop study',
  },
  {
    id: 'playlist-rock',
    name: 'Rock Classics',
    description: 'Rock legends & anthems that defined multiple generations.',
    coverImage: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    color: '#ef4444',
    query: 'queen rock hits',
  },
  {
    id: 'playlist-dance',
    name: 'Dance Club Hits',
    description: 'Turn up the bass. High energy electro, house, and club anthems.',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    color: '#10b981',
    query: 'dance edm club',
  },
  {
    id: 'playlist-acoustic',
    name: 'Acoustic Morning',
    description: 'Gentle acoustic strings, morning coffee, and warm melodies.',
    coverImage: 'https://images.unsplash.com/photo-1445985543470-41fdd5c31447?w=600&auto=format&fit=crop&q=80',
    color: '#f59e0b',
    query: 'acoustic morning guitar',
  }
];
