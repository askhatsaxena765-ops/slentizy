import { Track, Playlist } from '../types';
import {
  searchTracks,
  FALLBACK_TRACKS,
  POPULAR_ARTISTS,
  PopularArtist,
} from './musicApi';

export { POPULAR_ARTISTS, FALLBACK_TRACKS };
export type { PopularArtist };

export interface RecommendationOptions {
  limit?: number;
  excludeTrackIds?: string[];
  excludeArtists?: string[];
}

export interface RecommendationSeed {
  id: string;
  name: string;
  description: string;
  query: string;
  coverImage: string;
  color: string;
}

export const RECOMMENDATION_SEEDS: RecommendationSeed[] = [
  {
    id: 'rec-pop-rising',
    name: 'Pop Rising',
    description: 'Today\'s biggest pop tracks and emerging pop stars.',
    query: 'pop hits 2024',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    color: '#10b981',
  },
  {
    id: 'rec-chill-vibes',
    name: 'Chill Vibes',
    description: 'Relaxing acoustic and lo-fi grooves for any mood.',
    query: 'chill acoustic lo-fi',
    coverImage: 'https://images.unsplash.com/photo-1445985543470-41fdd5c31447?w=600&auto=format&fit=crop&q=80',
    color: '#3b82f6',
  },
  {
    id: 'rec-fresh-rap',
    name: 'Fresh Rap',
    description: 'The freshest hip-hop and rap tracks from across the culture.',
    query: 'hip hop rap 2024',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    color: '#d946ef',
  },
  {
    id: 'rec-dance-floor',
    name: 'Dance Floor',
    description: 'High-energy electro, house, and club anthems.',
    query: 'dance edm club',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    color: '#06b6d4',
  },
  {
    id: 'rec-rock-legends',
    name: 'Rock Legends',
    description: 'Classic rock anthems and legendary guitar heroes.',
    query: 'rock classics',
    coverImage: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    color: '#ef4444',
  },
  {
    id: 'rec-sleep-ambient',
    name: 'Sleep & Ambient',
    description: 'Atmospheric ambient and cinematic soundscapes to unwind.',
    query: 'ambient sleep cinematic',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    color: '#1e3264',
  },
];

const DEFAULT_LIMIT = 20;
const CACHE_TTL_MS = 1000 * 60 * 5;

interface CacheEntry {
  tracks: Track[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function getDefaultLimit(opts?: RecommendationOptions): number {
  if (opts && typeof opts.limit === 'number' && opts.limit > 0) {
    return opts.limit;
  }
  return DEFAULT_LIMIT;
}

function normalizeName(value: string | undefined): string {
  return (value || '').trim().toLowerCase();
}

function applyOptions(tracks: Track[], opts?: RecommendationOptions): Track[] {
  const excludeIds = new Set(opts?.excludeTrackIds);
  const excludeArtists = (opts?.excludeArtists ?? []).map(normalizeName);
  if (excludeIds.size === 0 && excludeArtists.length === 0) {
    return tracks;
  }
  return tracks.filter((t) => {
    if (excludeIds.has(t.id)) return false;
    if (excludeArtists.length > 0 && excludeArtists.includes(normalizeName(t.artist))) {
      return false;
    }
    return true;
  });
}

const VARIANT_TITLE_REGEX =
  /\b(slowed|sped.?up|speed.?up|nightcore|karaoke|instrumental|remix|radio.?edit|extended|acoustic|live|live.?version|cover|edit|8d|bass.?boosted|chipmunk|helium|uptempo|pillule|le.?purple|vip|piano.?version|version|studio.?version|alt|alternate)\b/i;

function stripToBaseTitle(title: string): string {
  if (!title) return '';
  let cleaned = title.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ');
  cleaned = cleaned.replace(/\s+feat\.?\s+.*/i, ' ').replace(/\s+ft\.?\s+.*/i, ' ');
  cleaned = cleaned.replace(VARIANT_TITLE_REGEX, ' ');
  return cleaned.replace(/\s+/g, ' ').trim().toLowerCase();
}

function hasVariantToken(title: string): boolean {
  return VARIANT_TITLE_REGEX.test(title || '');
}

export function isSameSongVariant(seed: Track, candidate: Track): boolean {
  const seedTitle = normalizeName(seed.title);
  const candTitle = normalizeName(candidate.title);
  if (!seedTitle || !candTitle) return false;
  if (candidate.id === seed.id) return true;

  const seedBase = stripToBaseTitle(seed.title);
  const candBase = stripToBaseTitle(candidate.title);
  if (seedBase.length < 3 || candBase !== seedBase) return false;

  const sameArtist = normalizeName(seed.artist) === normalizeName(candidate.artist);
  return sameArtist || hasVariantToken(candidate.title) || hasVariantToken(seed.title);
}

function sortByKey<T>(items: T[], key: (item: T) => number): T[] {
  return [...items].sort((a, b) => key(a) - key(b));
}

export function rankRecommendations(seed: Track, tracks: Track[]): Track[] {
  const seedArtistKey = normalizeName(seed.artist);
  const seedDuration = seed.duration > 0 ? seed.duration : 0;
  return sortByKey(tracks, (t) => {
    const sameArtist = normalizeName(t.artist) === seedArtistKey ? 1 : 0;
    const durationDiff = seedDuration > 0 ? Math.abs((t.duration || 0) - seedDuration) : 9999;
    return sameArtist * 1000 + Math.round(durationDiff);
  });
}

function dedupeTracks(tracks: Track[]): Track[] {
  const seen = new Set<string>();
  const result: Track[] = [];
  for (const t of tracks) {
    const key = `${normalizeName(t.title)}:::${normalizeName(t.artist)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(t);
  }
  return result;
}

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function fillWithFallbacks(tracks: Track[], limit: number): Track[] {
  if (tracks.length >= limit) return tracks.slice(0, limit);
  const usedKeys = new Set(tracks.map((t) => `${normalizeName(t.title)}:::${normalizeName(t.artist)}`));
  const pool = FALLBACK_TRACKS.filter(
    (t) => !usedKeys.has(`${normalizeName(t.title)}:::${normalizeName(t.artist)}`)
  );
  const result = [...tracks];
  for (let i = 0; result.length < limit && i < pool.length; i++) {
    result.push(pool[i]);
  }
  return result.slice(0, limit);
}

function getCached(key: string): Track[] | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.tracks;
}

function setCached(key: string, tracks: Track[]): void {
  cache.set(key, { tracks, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function fetchPage(
  query: string,
  count: number,
  opts?: RecommendationOptions
): Promise<Track[]> {
  return searchRecommendations(query, {
    ...(opts?.excludeTrackIds ? { excludeTrackIds: opts.excludeTrackIds } : {}),
    ...(opts?.excludeArtists ? { excludeArtists: opts.excludeArtists } : {}),
    limit: count,
  });
}

export async function searchRecommendations(
  query: string,
  opts?: RecommendationOptions
): Promise<Track[]> {
  const limit = getDefaultLimit(opts);
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) return [];

  const cacheKey = `q::${cleanQuery}::${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return applyOptions(cached, opts);

  const tracks = await searchTracks(cleanQuery, limit, 'songs');
  setCached(cacheKey, tracks);
  return applyOptions(tracks, opts);
}

export async function getRecommendationsByTrack(
  seed: Track,
  opts?: RecommendationOptions
): Promise<Track[]> {
  const limit = getDefaultLimit(opts);
  const queries: string[] = [];

  if (seed.artist) {
    queries.push(seed.artist);
  }
  if (seed.genre) {
    queries.push(seed.genre);
  }
  if (seed.artist && seed.title) {
    const bareTitle = seed.title.replace(/\s*\([^)]*\)\s*/g, '').trim();
    if (bareTitle) {
      queries.push(`${seed.artist} ${bareTitle}`);
    }
  }

  if (queries.length === 0) {
    return fillWithFallbacks([], limit);
  }

  const baseOpts: RecommendationOptions = {
    ...opts,
    excludeTrackIds: [...new Set([...(opts?.excludeTrackIds ?? []), seed.id])],
  };

  const perQuery = Math.max(2, Math.ceil(limit / queries.length) + 3);
  const results: Track[] = [];

  for (const q of queries) {
    if (results.length >= limit) break;
    const found = await fetchPage(q, perQuery, baseOpts);
    results.push(...found);
  }

  if (seed.genre && results.length < limit) {
    const found = await fetchPage(seed.genre, Math.max(2, Math.ceil(limit / 2) + 3), baseOpts);
    results.push(...found);
  }

  let ranked = dedupeTracks(results).filter((t) => !isSameSongVariant(seed, t));

  ranked = rankRecommendations(seed, ranked);

  return ranked.slice(0, limit);
}

export async function getRecommendationsByGenre(
  genre: string,
  opts?: RecommendationOptions
): Promise<Track[]> {
  const limit = getDefaultLimit(opts);
  const cleanGenre = (genre || '').trim();
  if (!cleanGenre) return getFeaturedRecommendations(limit, opts);
  return searchRecommendations(cleanGenre, opts);
}

export async function getRecommendationsForArtist(
  artist: string,
  opts?: RecommendationOptions
): Promise<Track[]> {
  const cleanArtist = (artist || '').trim();
  if (!cleanArtist) return [];
  return searchRecommendations(cleanArtist, opts);
}

export async function getBecauseYouListened(
  history: Track[],
  opts?: RecommendationOptions
): Promise<Track[]> {
  const limit = getDefaultLimit(opts);
  if (!history || history.length === 0) return [];

  const recent = history.slice(-4).reverse();
  const artistCounts = new Map<string, number>();
  const genreCounts = new Map<string, number>();

  for (const t of recent) {
    if (t.artist) {
      const key = normalizeName(t.artist);
      artistCounts.set(key, (artistCounts.get(key) ?? 0) + 1);
    }
    if (t.genre) {
      const key = normalizeName(t.genre);
      genreCounts.set(key, (genreCounts.get(key) ?? 0) + 1);
    }
  }

  const topArtists = [...artistCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name);

  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1)
    .map(([name]) => name);

  const excludeTrackIds = [
    ...new Set([...history.map((h) => h.id), ...(opts?.excludeTrackIds ?? [])]),
  ];
  const excludeArtists = [...new Set([...topArtists, ...(opts?.excludeArtists ?? [])])];
  const baseOpts: RecommendationOptions = {
    ...opts,
    excludeTrackIds,
    excludeArtists,
  };

  const perSource = Math.min(limit, 10);
  const results: Track[] = [];

  if (topArtists.length > 0) {
    const found = await fetchPage(topArtists.join(' '), perSource, baseOpts);
    results.push(...found);
  }

  if (results.length < limit && topGenres.length > 0) {
    const found = await fetchPage(
      topGenres[0],
      Math.min(limit - results.length, perSource),
      baseOpts
    );
    results.push(...found);
  }

  return fillWithFallbacks(dedupeTracks(results), limit);
}

export async function getDiscoverWeekly(
  likedTracks: Track[] = [],
  history: Track[] = [],
  opts?: RecommendationOptions
): Promise<Track[]> {
  const limit = getDefaultLimit(opts);
  const seedArtists: string[] = [];

  const recentLiked = (likedTracks ?? []).slice(-8).reverse();
  for (const t of recentLiked) {
    if (t.artist && seedArtists.length < 4) {
      const key = normalizeName(t.artist);
      if (!seedArtists.includes(key)) seedArtists.push(key);
    }
  }

  const seedGenres: string[] = [];
  const genreSource = [
    ...recentLiked,
    ...(history ?? []).slice(-6).reverse(),
  ];
  for (const t of genreSource) {
    if (t.genre) {
      const key = normalizeName(t.genre);
      if (!seedGenres.includes(key)) seedGenres.push(key);
    }
  }
  if (seedGenres.length === 0) {
    seedGenres.push('pop', 'r&b');
  }

  const excludeTrackIds = [
    ...new Set([
      ...(likedTracks ?? []).map((t) => t.id),
      ...(history ?? []).map((t) => t.id),
      ...(opts?.excludeTrackIds ?? []),
    ]),
  ];
  const baseOpts: RecommendationOptions = {
    ...opts,
    excludeTrackIds,
  };

  const results: Track[] = [];

  const artistQuery = seedArtists.slice(0, 3).join(' ');
  if (artistQuery) {
    const found = await fetchPage(artistQuery, Math.min(limit, 10), baseOpts);
    results.push(...found);
  }

  if (results.length < limit) {
    const genreQuery = seedGenres.slice(0, 2).join(' ');
    const found = await fetchPage(
      genreQuery,
      Math.min(limit - results.length, 10),
      baseOpts
    );
    results.push(...found);
  }

  if (results.length < limit) {
    for (const seed of RECOMMENDATION_SEEDS) {
      if (results.length >= limit) break;
      const found = await fetchPage(
        seed.query,
        Math.min(limit - results.length, 8),
        baseOpts
      );
      results.push(...found);
    }
  }

  return fillWithFallbacks(dedupeTracks(results), limit);
}

export async function getFeaturedRecommendations(
  limit = 10,
  opts?: RecommendationOptions
): Promise<Track[]> {
  const perSeed = Math.max(2, Math.ceil(limit / RECOMMENDATION_SEEDS.length));
  const results: Track[] = [];

  for (const seed of RECOMMENDATION_SEEDS) {
    if (results.length >= limit) break;
    const found = await fetchPage(
      seed.query,
      Math.min(limit - results.length, perSeed),
      opts
    );
    results.push(...found);
  }

  return fillWithFallbacks(dedupeTracks(results), limit);
}

export interface RecommendedPlaylist {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  color: string;
  tracks: Track[];
}

export async function getRecommendedPlaylists(
  limit = 6,
  existingIds: string[] = []
): Promise<RecommendedPlaylist[]> {
  const pool = RECOMMENDATION_SEEDS.filter((s) => !existingIds.includes(s.id));
  const picks = shuffle(pool).slice(0, limit);
  const result: RecommendedPlaylist[] = [];

  await Promise.all(
    picks.map(async (seed) => {
      const tracks = await fetchPage(seed.query, 12);
      result.push({
        id: seed.id,
        name: seed.name,
        description: seed.description,
        coverImage: seed.coverImage,
        color: seed.color,
        tracks: tracks.length > 0 ? tracks : FALLBACK_TRACKS,
      });
    })
  );

  return result;
}

export async function getRecommendedPlaylistsFromHistory(
  history: Track[],
  limit = 6
): Promise<RecommendedPlaylist[]> {
  const playlists = await getRecommendedPlaylists(limit);

  if (history && history.length > 0) {
    const recentGenres = [
      ...new Set(
        history
          .slice(-10)
          .reverse()
          .map((t) => t.genre)
          .filter(Boolean)
      ),
    ] as string[];

    if (recentGenres.length > 0) {
      const genreQuery = recentGenres.slice(0, 2).join(' ');
      const tracks = await fetchPage(genreQuery, 12);
      if (tracks.length > 0) {
        playlists.unshift({
          id: 'rec-because-you',
          name: 'Because You Listened',
          description: 'Tracks inspired by what you\'ve recently played.',
          coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
          color: '#10b981',
          tracks,
        });
      }
    }
  }

  return playlists.slice(0, limit);
}

export function clearRecommendationCache(): void {
  cache.clear();
}

export function getRecommendationSeeds(): RecommendationSeed[] {
  return RECOMMENDATION_SEEDS;
}

export default {
  searchRecommendations,
  getRecommendationsByTrack,
  getRecommendationsByGenre,
  getRecommendationsForArtist,
  getBecauseYouListened,
  getDiscoverWeekly,
  getFeaturedRecommendations,
  getRecommendedPlaylists,
  getRecommendedPlaylistsFromHistory,
  clearRecommendationCache,
  getRecommendationSeeds,
};
