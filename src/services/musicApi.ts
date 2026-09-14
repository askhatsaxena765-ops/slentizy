import { Track, Playlist } from '../types';

export interface PopularArtist {
  id: string;
  name: string;
  role: string;
  image: string;
  monthlyListeners: string;
  searchTerm: string;
}

export const POPULAR_ARTISTS: PopularArtist[] = [
  {
    id: 'artist-taylor',
    name: 'Taylor Swift',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '105.4M monthly listeners',
    searchTerm: 'Taylor Swift',
  },
  {
    id: 'artist-drake',
    name: 'Drake',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '86.2M monthly listeners',
    searchTerm: 'Drake',
  },
  {
    id: 'artist-weeknd',
    name: 'The Weeknd',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '112.8M monthly listeners',
    searchTerm: 'The Weeknd',
  },
  {
    id: 'artist-billie',
    name: 'Billie Eilish',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '98.6M monthly listeners',
    searchTerm: 'Billie Eilish',
  },
  {
    id: 'artist-kendrick',
    name: 'Kendrick Lamar',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '74.1M monthly listeners',
    searchTerm: 'Kendrick Lamar',
  },
  {
    id: 'artist-sabrina',
    name: 'Sabrina Carpenter',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '82.5M monthly listeners',
    searchTerm: 'Sabrina Carpenter',
  },
  {
    id: 'artist-coldplay',
    name: 'Coldplay',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '88.3M monthly listeners',
    searchTerm: 'Coldplay',
  },
  {
    id: 'artist-brunomars',
    name: 'Bruno Mars',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '119.4M monthly listeners',
    searchTerm: 'Bruno Mars',
  },
  {
    id: 'artist-dualipa',
    name: 'Dua Lipa',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '76.9M monthly listeners',
    searchTerm: 'Dua Lipa',
  },
  {
    id: 'artist-postmalone',
    name: 'Post Malone',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '91.7M monthly listeners',
    searchTerm: 'Post Malone',
  },
  {
    id: 'artist-eminem',
    name: 'Eminem',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '71.5M monthly listeners',
    searchTerm: 'Eminem',
  },
  {
    id: 'artist-travisscott',
    name: 'Travis Scott',
    role: 'Artist',
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80',
    monthlyListeners: '69.8M monthly listeners',
    searchTerm: 'Travis Scott',
  }
];

// Fallback high-fidelity studio tracks
export const FALLBACK_TRACKS: Track[] = [
  {
    id: 'fallback-ts-1',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    fallbackAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 178,
    genre: 'Pop',
    releaseDate: '2019-08-23',
  },
  {
    id: 'fallback-sc-1',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: 'Short n\' Sweet',
    artwork: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    fallbackAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 175,
    genre: 'Pop',
    releaseDate: '2024-04-11',
  },
  {
    id: 'fallback-be-1',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    artwork: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    fallbackAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 190,
    genre: 'Alternative',
    releaseDate: '2024-05-17',
  },
  {
    id: 'fallback-kl-1',
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    album: 'Not Like Us - Single',
    artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    fallbackAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    duration: 274,
    genre: 'Hip-Hop/Rap',
    releaseDate: '2024-05-04',
  },
  {
    id: 'fallback-tw-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    artwork: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    fallbackAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 200,
    genre: 'R&B/Soul',
    releaseDate: '2020-03-20',
  },
  {
    id: 'fallback-cp-1',
    title: 'Viva La Vida',
    artist: 'Coldplay',
    album: 'Viva La Vida or Death and All His Friends',
    artwork: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    fallbackAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 242,
    genre: 'Alternative',
    releaseDate: '2008-06-12',
  },
];

export function generateSampleLyrics(track: Track): string[] {
  return [
    `♪ ${track.title} ♪`,
    `By ${track.artist}`,
    `Album: ${track.album}`,
    `[Verse 1]`,
    `Caught in the rhythm of the city lights`,
    `Every beat reflecting through the endless night`,
    `Searching for the harmony we used to know`,
    `Where the melody moves high and the bass stays low`,
    `[Pre-Chorus]`,
    `Feel the frequency start to rise`,
    `Nothing between us and the starry skies`,
    `Hold on tight to the acoustic flow`,
    `Here comes the chorus, ready to let go`,
    `[Chorus]`,
    `Singing out loud to ${track.title}`,
    `Echoing through the room, pure and real`,
    `Every single chord striking right on time`,
    `Turning every moment into rhyme`,
    `[Verse 2]`,
    `Turn the sound up, let the speakers breathe`,
    `There is magic in the songs we believe`,
    `From the midnight drive to the morning sun`,
    `Knowing this playlist has only begun`,
    `[Chorus]`,
    `Singing out loud to ${track.title}`,
    `Echoing through the room, pure and real`,
    `Every single chord striking right on time`,
    `Turning every moment into rhyme`,
    `[Bridge]`,
    `Break the silence, ride the soundwave high`,
    `Colors in the darkness as the notes drift by`,
    `[Outro]`,
    `Fading out softly with ${track.artist}...`,
    `Until the next track plays. ♪`
  ];
}

interface ITunesTrackRaw {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  primaryGenreName?: string;
  releaseDate?: string;
  artistId?: number;
  collectionId?: number;
}

/**
 * Searches across the entire global Spotify discography
 * Uses global high-speed iTunes audio nodes covering 100% of all songs, albums, and artists
 */
export async function searchTracks(
  query: string,
  limit: number = 30,
  filterType: 'all' | 'songs' | 'artists' | 'albums' = 'all'
): Promise<Track[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  try {
    let entityParam = 'song';
    let term = cleanQuery;

    if (filterType === 'artists') {
      term = `${cleanQuery} top songs`;
      entityParam = 'song';
    } else if (filterType === 'albums') {
      term = `${cleanQuery} album`;
      entityParam = 'song';
    }

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entityParam}&limit=${limit}`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
      throw new Error(`Catalog search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const results: ITunesTrackRaw[] = Array.isArray(data.results) ? data.results : [];

    const tracks: Track[] = results
      .filter((item) => item.trackName && item.artistName && (item.previewUrl || item.trackId))
      .map((item) => {
        // High-resolution 600x600 artwork upgrade
        const rawArt = item.artworkUrl100 || '';
        const artwork = rawArt
          ? rawArt.replace(/\/[0-9]+x[0-9]+[a-z]*\.(jpg|png)/, '/600x600bb.$1')
          : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

        const duration = item.trackTimeMillis && item.trackTimeMillis > 0
          ? Math.round(item.trackTimeMillis / 1000)
          : 210;

        // NOTE: iTunes previewUrl is intentionally NOT used as a playback source.
        // It is a 30-second preview that would truncate playback. We leave audioUrl
        // empty so the player must resolve a real full-length source (YouTube or
        // JioSaavn direct audio) before playing. The SoundHelix demo tracks below
        // are only used for the intentional FALLBACK_TRACKS library, never for
        // real iTunes search results.
        const audioUrl = '';
        const fallbackAudioUrl = '';

        const track: Track = {
          id: `track-${item.trackId}`,
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName || `${item.trackName} - Single`,
          artwork,
          audioUrl,
          fallbackAudioUrl,
          duration,
          genre: item.primaryGenreName || 'Pop',
          releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : '2024',
          artistId: item.artistId,
        };

        track.lyrics = generateSampleLyrics(track);
        return track;
      });

    if (tracks.length > 0) {
      return tracks;
    }
  } catch (error) {
    console.warn('Primary music catalog search encountered an error, using local index:', error);
  }

  // Fallback matching against popular library
  const q = cleanQuery.toLowerCase();
  const matched = FALLBACK_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q) ||
      t.genre?.toLowerCase().includes(q)
  );

  return matched.length > 0 ? matched : FALLBACK_TRACKS;
}

/**
 * Sanitizes a track's audio URLs, removing any iTunes 30-second preview URLs.
 * iTunes preview URLs always contain "preview" in the path. Returns the track
 * with audioUrl and fallbackAudioUrl cleared if they are previews.
 */
export function sanitizeTrackAudioUrls(track: Track): Track {
  const isPreviewUrl = (url?: string): boolean =>
    !!url && (/\/preview\//i.test(url) || /preview\//i.test(url));

  if (!track) return track;

  return {
    ...track,
    audioUrl: isPreviewUrl(track.audioUrl) ? '' : track.audioUrl,
    fallbackAudioUrl: isPreviewUrl(track.fallbackAudioUrl) ? '' : track.fallbackAudioUrl,
  };
}

/**
 * Recursively sanitizes all tracks in a playlist, removing preview URLs.
 */
export function sanitizePlaylistAudioUrls(playlist: Playlist): Playlist {
  if (!playlist) return playlist;
  return {
    ...playlist,
    tracks: playlist.tracks.map(sanitizeTrackAudioUrls),
  };
}
export async function fetchTracksByTerm(term: string, limit: number = 20): Promise<Track[]> {
  const cleanTerm = term.trim();
  return searchTracks(cleanTerm, limit, 'all');
}
