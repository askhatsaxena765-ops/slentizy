// Netlify Serverless Function: /api/resolve-track
// Ported from server.ts resolveOfficialTrack logic.
// Preserves YouTube resolution (primary) and JioSaavn direct audio (HTML5 fallback).
// Never uses iTunes previewUrl. Never uses SoundHelix as a generic fallback for real songs.

const yts = require('yt-search');
const CryptoJS = require('crypto-js');

// In-memory cache for resolved track metadata (per-function-instance)
const trackCache = new Map();

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

async function resolveOfficialTrack(rawTitle, rawArtist) {
  const cacheKey = `${rawTitle.toLowerCase().trim()}___${rawArtist.toLowerCase().trim()}`;
  if (trackCache.has(cacheKey)) {
    return trackCache.get(cacheKey);
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

  let bestVideo = null;
  const fallbacks = [];

  for (const q of searchQueries) {
    try {
      const r = await yts(q);
      const videos = (r.videos || []).filter(v => {
        const titleLower = v.title.toLowerCase();
        if (BAD_KEYWORDS.some(bw => titleLower.includes(bw))) return false;
        if (v.seconds < 60 || v.seconds > 480) return false;
        return true;
      });

      if (videos.length > 0) {
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

  if (!bestVideo) return null;

  const result = {
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
      const validSaavn = results.find(r => {
        const t = (r.title || '').toLowerCase();
        const s = (r.subtitle || r.more_info?.singers || '').toLowerCase();
        if (BAD_KEYWORDS.some(bw => t.includes(bw) || s.includes(bw))) return false;
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

exports.handler = async function (event) {
  const title = event.queryStringParameters?.title || '';
  const artist = event.queryStringParameters?.artist || '';

  if (!title) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing title parameter' }),
    };
  }

  try {
    const resolved = await resolveOfficialTrack(title, artist);
    if (resolved) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, ...resolved }),
      };
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Official track release not found' }),
    };
  } catch (error) {
    console.error('Error resolving track:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Internal server error' }),
    };
  }
};