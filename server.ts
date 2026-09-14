import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import CryptoJS from 'crypto-js';
import yts from 'yt-search';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

interface ResolvedTrackInfo {
  title: string;
  artist: string;
  duration: number;
  youtubeVideoId: string;
  youtubeFallbacks: string[];
  directAudioUrl?: string;
  fallbackAudioUrl?: string;
  thumbnail?: string;
}

// In-memory cache for resolved track metadata
const trackCache = new Map<string, ResolvedTrackInfo>();

// Rigorous bad keywords to completely eliminate 2x, 0.5x, nightcore, slowed, karaoke, and covers
const BAD_KEYWORDS = [
  'sped up',
  'speed up',
  'nightcore',
  'slowed',
  'reverb',
  'karaoke',
  'instrumental',
  'cover',
  'tribute',
  'super slowed',
  'mashup',
  'chipmunk',
  '8d audio',
  'bass boosted',
  'hour',
  'hours',
  'reaction',
  'parody',
  'tutorial',
  'how to play',
  'guitar lesson',
  'piano tutorial',
  'remake',
  'backing track',
];

// Helper to resolve official track
async function resolveOfficialTrack(rawTitle: string, rawArtist: string): Promise<ResolvedTrackInfo | null> {
  const cacheKey = `${rawTitle.toLowerCase().trim()}___${rawArtist.toLowerCase().trim()}`;
  if (trackCache.has(cacheKey)) {
    return trackCache.get(cacheKey)!;
  }

  // Clean title & artist for searching
  const cleanTitle = rawTitle
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/i, '')
    .replace(/ft\..*$/i, '')
    .trim();

  const cleanArtist = rawArtist
    .replace(/,.*$/, '')
    .replace(/&.*$/, '')
    .replace(/feat\..*$/i, '')
    .trim();

  const searchQueries = [
    `${cleanArtist} ${cleanTitle} official audio`,
    `${cleanArtist} ${cleanTitle} official lyric video`,
    `${cleanArtist} ${cleanTitle} audio`,
    `${cleanArtist} - ${cleanTitle}`,
    `${cleanTitle} ${cleanArtist}`,
  ];

  let bestVideo: yts.VideoSearchResult | null = null;
  const fallbacks: string[] = [];

  for (const q of searchQueries) {
    try {
      const r = await yts(q);
      const videos = (r.videos || []).filter(v => {
        const titleLower = v.title.toLowerCase();
        // Discard any nightcore, 2x, 0.5x, karaoke, or cover
        if (BAD_KEYWORDS.some(bw => titleLower.includes(bw))) return false;
        // Standard songs are between 60s and 480s (1 to 8 min)
        if (v.seconds < 60 || v.seconds > 480) return false;
        return true;
      });

      if (videos.length > 0) {
        // Score videos to pick the most authentic original release
        const artistLower = cleanArtist.toLowerCase();
        const firstWordOfArtist = artistLower.split(' ')[0] || '';

        const scored = videos.map(v => {
          const authorLower = v.author.name.toLowerCase();
          const titleLower = v.title.toLowerCase();
          let score = 0;

          if (authorLower.includes('topic')) score += 60;
          if (authorLower.includes('vevo')) score += 50;
          if (titleLower.includes('official audio')) score += 40;
          if (titleLower.includes('official lyric video') || titleLower.includes('official lyrics')) score += 35;
          if (titleLower.includes('official music video')) score += 30;
          if (firstWordOfArtist && authorLower.includes(firstWordOfArtist)) score += 25;

          return { video: v, score };
        });

        scored.sort((a, b) => b.score - a.score);
        bestVideo = scored[0].video;

        for (let i = 1; i < Math.min(scored.length, 4); i++) {
          fallbacks.push(scored[i].video.videoId);
        }
        break;
      }
    } catch (err) {
      console.warn(`Search failed for "${q}":`, err);
    }
  }

  if (bestVideo) {
    const result: ResolvedTrackInfo = {
      title: bestVideo.title || rawTitle,
      artist: bestVideo.author.name || rawArtist,
      duration: bestVideo.seconds > 0 ? bestVideo.seconds : 210,
      youtubeVideoId: bestVideo.videoId,
      youtubeFallbacks: fallbacks,
      thumbnail: bestVideo.thumbnail,
    };

    // Also check if JioSaavn has a verified genuine original (e.g. for Indian/Bollywood)
    try {
      const saavnUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=5&p=1&q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`;
      const sRes = await fetch(saavnUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.jiosaavn.com/',
        },
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        const results = Array.isArray(sData.results) ? sData.results : [];
        // Strictly filter JioSaavn result to make sure it is NOT a cover, nightcore, or sped-up
        const validSaavn = results.find((r: any) => {
          const t = (r.title || '').toLowerCase();
          const s = (r.subtitle || r.more_info?.singers || '').toLowerCase();
          if (BAD_KEYWORDS.some(bw => t.includes(bw) || s.includes(bw))) return false;
          // Must match artist
          const artistTokens = cleanArtist.toLowerCase().split(' ').filter(w => w.length > 2);
          return artistTokens.some(tok => s.includes(tok) || t.includes(tok));
        });

        if (validSaavn && validSaavn.more_info?.encrypted_media_url) {
          const key = CryptoJS.enc.Utf8.parse('38346591');
          const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(validSaavn.more_info.encrypted_media_url),
          });
          const decrypted = CryptoJS.DES.decrypt(cipherParams, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
          });
          const mediaUrl = decrypted.toString(CryptoJS.enc.Utf8);
          if (mediaUrl && mediaUrl.startsWith('http')) {
            result.directAudioUrl = mediaUrl.replace('_96.mp4', '_320.mp4');
            result.fallbackAudioUrl = mediaUrl.replace('_96.mp4', '_160.mp4');
          }
        }
      }
    } catch {
      // Non-critical if JioSaavn direct audio is unavailable
    }

    trackCache.set(cacheKey, result);
    return result;
  }

  return null;
}

// API endpoint: resolve track (handles both YouTube video ID and direct audio)
app.get('/api/resolve-track', async (req, res) => {
  const title = (req.query.title as string) || '';
  const artist = (req.query.artist as string) || '';

  if (!title) {
    return res.status(400).json({ error: 'Missing title parameter' });
  }

  try {
    const resolved = await resolveOfficialTrack(title, artist);
    if (resolved) {
      return res.json({
        success: true,
        ...resolved,
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Official track release not found',
    });
  } catch (error) {
    console.error('Error resolving track:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Legacy backward-compatible endpoint
app.get('/api/resolve-full-audio', async (req, res) => {
  const title = (req.query.title as string) || '';
  const artist = (req.query.artist as string) || '';

  if (!title) {
    return res.status(400).json({ error: 'Missing title parameter' });
  }

  try {
    const resolved = await resolveOfficialTrack(title, artist);
    if (resolved) {
      return res.json({
        success: true,
        fullAudioUrl: resolved.directAudioUrl || '',
        fallbackAudioUrl: resolved.fallbackAudioUrl || '',
        youtubeVideoId: resolved.youtubeVideoId,
        youtubeFallbacks: resolved.youtubeFallbacks,
        duration: resolved.duration,
        title: resolved.title,
        artist: resolved.artist,
      });
    }

    return res.status(404).json({ success: false, message: 'Track not found' });
  } catch (error) {
    console.error('Error resolving track audio:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// API lyrics lookup endpoint
app.get('/api/lyrics', async (req, res) => {
  const rawTitle = ((req.query.title as string) || '').trim();
  const rawArtist = ((req.query.artist as string) || '').trim();
  const duration = parseInt((req.query.duration as string) || '0', 10);

  if (!rawTitle) {
    return res.status(400).json({ found: false, error: 'Missing title parameter' });
  }

  const cleanTitle = rawTitle
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/i, '')
    .replace(/ft\..*$/i, '')
    .trim();

  const cleanArtist = rawArtist
    .replace(/,.*$/, '')
    .replace(/&.*$/, '')
    .replace(/feat\..*$/i, '')
    .trim();

  try {
    let lrclibData: any = null;

    // 1. Direct match with duration if provided
    try {
      const getUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}${duration > 0 ? `&duration=${duration}` : ''}`;
      const resp = await fetch(getUrl, {
        headers: { 'User-Agent': 'SlentizyMusic/2.0' },
      });
      if (resp.ok) {
        lrclibData = await resp.json();
      }
    } catch (e) {
      console.warn('Lrclib direct get warning:', e);
    }

    // 2. Search fallback
    if (!lrclibData || (!lrclibData.syncedLyrics && !lrclibData.plainLyrics)) {
      try {
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanArtist} ${cleanTitle}`)}`;
        const sResp = await fetch(searchUrl, {
          headers: { 'User-Agent': 'SlentizyMusic/2.0' },
        });
        if (sResp.ok) {
          const results = await sResp.json();
          if (Array.isArray(results) && results.length > 0) {
            const withSynced = results.find((r: any) => r.syncedLyrics);
            lrclibData = withSynced || results[0];
          }
        }
      } catch (e) {
        console.warn('Lrclib search warning:', e);
      }
    }

    if (!lrclibData || (!lrclibData.syncedLyrics && !lrclibData.plainLyrics)) {
      return res.json({
        found: false,
        title: rawTitle,
        artist: rawArtist,
        message: 'No official lyrics found',
      });
    }

    // Parse synchronized LRC lines
    const parsedLines: { time: number; text: string }[] = [];
    if (lrclibData.syncedLyrics) {
      const lines = lrclibData.syncedLyrics.split('\n');
      for (const line of lines) {
        const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d+)?)\](.*)$/);
        if (match) {
          const mins = parseFloat(match[1]);
          const secs = parseFloat(match[2]);
          const text = match[3].trim();
          if (text) {
            parsedLines.push({
              time: mins * 60 + secs,
              text,
            });
          }
        }
      }
    }

    // Fallback if plain lyrics only
    if (parsedLines.length === 0 && lrclibData.plainLyrics) {
      const plain = lrclibData.plainLyrics.split('\n');
      for (let i = 0; i < plain.length; i++) {
        const t = plain[i].trim();
        if (t) {
          parsedLines.push({
            time: -1, // untimed
            text: t,
          });
        }
      }
    }

    return res.json({
      found: true,
      title: lrclibData.trackName || rawTitle,
      artist: lrclibData.artistName || rawArtist,
      plainLyrics: lrclibData.plainLyrics || '',
      syncedLyrics: lrclibData.syncedLyrics || '',
      lines: parsedLines,
      instrumental: Boolean(lrclibData.instrumental),
    });
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return res.status(500).json({ found: false, error: 'Internal server error fetching lyrics' });
  }
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', cacheSize: trackCache.size });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Slentizy Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
