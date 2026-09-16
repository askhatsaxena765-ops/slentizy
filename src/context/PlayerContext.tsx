import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, Playlist, RepeatMode, ViewType } from '../types';
import { CURATED_PLAYLIST_SEEDS } from '../data/defaultPlaylists';
import { fetchTracksByTerm, FALLBACK_TRACKS, sanitizeTrackAudioUrls, sanitizePlaylistAudioUrls } from '../services/musicApi';
import { getRecommendationsByTrack } from '../services/recommendations';

interface PlayerContextType {
  // Playback state
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  queueIndex: number;
  history: Track[];
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  isVideoMode: boolean;
  setIsVideoMode: (open: boolean | ((prev: boolean) => boolean)) => void;
  playbackEngine: 'youtube' | 'html5';

  // Premium playback settings
  autoplayEnabled: boolean;
  setAutoplayEnabled: (enabled: boolean) => void;
  autoplayLoading: boolean;
  crossfadeEnabled: boolean;
  setCrossfadeEnabled: (enabled: boolean) => void;
  playbackContext: { type: 'playlist' | 'liked' | 'search' | 'queue'; id?: string; tracks: Track[] } | null;
  setPlaybackContext: (ctx: PlayerContextType['playbackContext']) => void;
  shuffleQueue: () => void;

  // User Library
  likedTracks: Track[];
  isLiked: (trackId: string) => boolean;
  toggleLike: (track: Track) => void;
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;

  // Navigation and UI states
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  activePlaylist: Playlist | null;
  setActivePlaylist: (playlist: Playlist | null) => void;
  isNowPlayingOpen: boolean;
  setIsNowPlayingOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isLyricsOpen: boolean;
  setIsLyricsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  playPlaylist: (playlist: Playlist, startIndex?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  isLoading: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

  const LIKED_STORAGE_KEY = 'slentizy_liked_tracks';
  const PLAYLISTS_STORAGE_KEY = 'slentizy_user_playlists';
  const VOLUME_STORAGE_KEY = 'slentizy_player_volume';
  const SHUFFLE_STORAGE_KEY = 'slentizy_shuffle';
  const REPEAT_STORAGE_KEY = 'slentizy_repeat_mode';
  const AUTOPLAY_STORAGE_KEY = 'slentizy_autoplay';
  const CROSSFADE_STORAGE_KEY = 'slentizy_crossfade';
  const PLAYBACK_CONTEXT_STORAGE_KEY = 'slentizy_playback_context';
const MUTE_STORAGE_KEY = 'slentizy_mute';

function isPreviewUrl(url?: string): boolean {
  if (!url) return false;
  return /\/preview\//i.test(url) || /preview\//i.test(url);
}

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Playback state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem(VOLUME_STORAGE_KEY) || localStorage.getItem('spotify_player_volume');
    return saved !== null ? parseFloat(saved) : 0.75;
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(MUTE_STORAGE_KEY);
    return saved === 'true';
  });
  const [isShuffle, setIsShuffle] = useState<boolean>(() => {
    const saved = localStorage.getItem(SHUFFLE_STORAGE_KEY);
    return saved === 'true';
  });
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(() => {
    const saved = localStorage.getItem(REPEAT_STORAGE_KEY) as RepeatMode | null;
    return saved === 'queue' || saved === 'one' ? saved : 'off';
  });
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [history, setHistory] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  const [isVideoMode, setIsVideoMode] = useState<boolean>(false);
  const [playbackEngine, setPlaybackEngine] = useState<'youtube' | 'html5'>('youtube');
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(() => {
    // Default ON for continuous Spotify-style listening. User can disable.
    const saved = localStorage.getItem(AUTOPLAY_STORAGE_KEY);
    return saved !== 'false';
  });
  const [crossfadeEnabled, setCrossfadeEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(CROSSFADE_STORAGE_KEY);
    return saved === 'true';
  });
  const [autoplayLoading, setAutoplayLoading] = useState<boolean>(false);
  const [playbackContext, setPlaybackContext] = useState<{ type: 'playlist' | 'liked' | 'search' | 'queue'; id?: string; tracks: Track[] } | null>(() => {
    try {
      const saved = localStorage.getItem(PLAYBACK_CONTEXT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const ytPlayerRef = useRef<any>(null);
  const [isYtReady, setIsYtReady] = useState<boolean>(false);
  const currentFallbacksRef = useRef<string[]>([]);
  const currentTrackRef = useRef<Track | null>(null);
  const handleTrackEndedRef = useRef<() => void>(() => {});
  // Timeout ID for scheduled track-end detection (fallback for background tabs)
  const trackEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Monotonically increasing ID to identify the current loadAndPlay call.
  // Any async work from a previous call will have a stale loadId and be ignored.
  const loadIdRef = useRef<number>(0);

  const recentlyRecommendedIdsRef = useRef<string[]>([]);
  const MAX_RECENT_RECOMMENDATIONS = 20;

  // Manual playback-time tracker.
  // The YouTube IFrame player is kept off-screen (1x1 at -9999px) when the
  // user is not viewing the video. In that minimized state the embedded player
  // often reports getCurrentTime() === 0 even while audio is playing, which
  // froze the progress bar at 0:00. These refs track elapsed time on the
  // wall clock so progress keeps moving regardless of what YouTube reports.
  const playStartedAtRef = useRef<number | null>(null);
  const accumulatedElapsedRef = useRef<number>(0);
  const getManualElapsed = (): number => {
    if (playStartedAtRef.current === null) return accumulatedElapsedRef.current;
    return accumulatedElapsedRef.current + (Date.now() / 1000 - playStartedAtRef.current);
  };

  // Schedule a timeout to call handleTrackEnded when the current track should end.
  // This is a fallback for background tabs where YouTube onStateChange / HTML5 ended
  // events may not fire reliably due to browser timer throttling.
  const scheduleTrackEndTimeout = (trackDuration: number, trackId?: string) => {
    // Clear any existing timeout
    if (trackEndTimeoutRef.current) {
      clearTimeout(trackEndTimeoutRef.current);
      trackEndTimeoutRef.current = null;
    }
    if (!trackDuration || trackDuration <= 0) return;

    // Schedule timeout for track duration (in ms) + small buffer
    const timeoutMs = trackDuration * 1000 + 500; // 500ms buffer
    trackEndTimeoutRef.current = setTimeout(() => {
      // Only trigger if still playing AND the track hasn't changed
      // (the event handlers would have cleared this if track ended normally)
      if (isPlayingRef.current && handleTrackEndedRef.current) {
        // Verify the track is still the same one we scheduled for
        if (!trackId || currentTrackRef.current?.id === trackId) {
          console.log('[Background fallback] Track end timeout fired, calling handleTrackEnded');
          handleTrackEndedRef.current();
        } else {
          console.log('[Background fallback] Track changed, ignoring stale timeout');
        }
      }
      trackEndTimeoutRef.current = null;
    }, timeoutMs);
  };

  const clearTrackEndTimeout = () => {
    if (trackEndTimeoutRef.current) {
      clearTimeout(trackEndTimeoutRef.current);
      trackEndTimeoutRef.current = null;
    }
  };

  // Refs used to decouple the progress-polling interval from React state
  // updates. Without these, every setCurrentTime call would tear down and
  // recreate the interval, causing getCurrentTime() to frequently return 0
  // and freezing the elapsed-time counter at 0:00.
  const isPlayingRef = useRef<boolean>(false);
  const playbackEngineRef = useRef<'youtube' | 'html5'>('youtube');
  const ytPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // View state
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState<boolean>(true);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

  // User Library (Liked & Playlists)
  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(LIKED_STORAGE_KEY) || localStorage.getItem('spotify_liked_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.map(sanitizeTrackAudioUrls) : [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem(PLAYLISTS_STORAGE_KEY) || localStorage.getItem('spotify_user_playlists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizePlaylistAudioUrls);
        }
      }
    } catch {
      // ignore
    }
    // Initialize with default curated playlist shells
    return CURATED_PLAYLIST_SEEDS.map(seed => ({
      id: seed.id,
      name: seed.name,
      description: seed.description,
      coverImage: seed.coverImage,
      color: seed.color,
      tracks: [],
    }));
  });

  // Pre-populate curated playlists in background
  useEffect(() => {
    async function populateInitialPlaylists() {
      const updatedPlaylists = await Promise.all(
        CURATED_PLAYLIST_SEEDS.map(async (seed) => {
          try {
            const tracks = await fetchTracksByTerm(seed.query, 15);
            return {
              id: seed.id,
              name: seed.name,
              description: seed.description,
              coverImage: seed.coverImage,
              color: seed.color,
              tracks: tracks.length > 0 ? tracks : FALLBACK_TRACKS,
            };
          } catch (e) {
            return {
              id: seed.id,
              name: seed.name,
              description: seed.description,
              coverImage: seed.coverImage,
              color: seed.color,
              tracks: FALLBACK_TRACKS,
            };
          }
        })
      );

      setPlaylists(prev => {
        // Keep any user-created playlists
        const customOnes = prev.filter(p => p.isCustom);
        return [...updatedPlaylists, ...customOnes];
      });

      // Default initial track if none set
      if (!currentTrack && updatedPlaylists[0]?.tracks[0]) {
        const firstTrack = updatedPlaylists[0].tracks[0];
        setCurrentTrack(firstTrack);
        setQueue(updatedPlaylists[0].tracks);
        setQueueIndex(0);
      }
    }

    populateInitialPlaylists();
  }, []);

  // Save liked tracks
  useEffect(() => {
    try {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(likedTracks));
    } catch (e) {
      console.error(e);
    }
  }, [likedTracks]);

  // Save custom playlists
  useEffect(() => {
    try {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    } catch (e) {
      console.error(e);
    }
  }, [playlists]);

  // Persist shuffle / repeat / autoplay / crossfade settings
  useEffect(() => {
    localStorage.setItem(SHUFFLE_STORAGE_KEY, String(isShuffle));
  }, [isShuffle]);

  useEffect(() => {
    localStorage.setItem(REPEAT_STORAGE_KEY, repeatMode);
  }, [repeatMode]);

  useEffect(() => {
    localStorage.setItem(AUTOPLAY_STORAGE_KEY, String(autoplayEnabled));
  }, [autoplayEnabled]);

  useEffect(() => {
    localStorage.setItem(CROSSFADE_STORAGE_KEY, String(crossfadeEnabled));
  }, [crossfadeEnabled]);

  useEffect(() => {
    localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
  }, [isMuted]);

  useEffect(() => {
    try {
      if (playbackContext) {
        localStorage.setItem(PLAYBACK_CONTEXT_STORAGE_KEY, JSON.stringify(playbackContext));
      } else {
        localStorage.removeItem(PLAYBACK_CONTEXT_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [playbackContext]);

  // Audio element setup and listener binding
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = isMuted ? 0 : volume;

    const handleTimeUpdate = () => {
      if (Number.isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(Math.round(audio.duration));
      }
    };

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(Math.round(audio.duration));
      }
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      handleTrackEndedRef.current();
    };

    const handleError = () => {
      console.warn('Audio playback error encountered on:', audio.src);
      // Auto recovery: try fallback audio stream if available
      if (currentTrack?.fallbackAudioUrl && audio.src !== currentTrack.fallbackAudioUrl) {
        console.log('Switching to secondary fallback audio stream...');
        audio.src = currentTrack.fallbackAudioUrl;
        audio.load();
        audio.play().catch(e => console.warn('Fallback audio playback failed:', e));
        return;
      }
      clearTrackEndTimeout();
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Initialize YouTube Iframe Player
    let ytInstance: any = null;
    const initYT = () => {
      if ((window as any).YT && (window as any).YT.Player && !ytPlayerRef.current) {
        try {
          ytInstance = new (window as any).YT.Player('slentizy-yt-player', {
            height: '100%',
            width: '100%',
            playerVars: {
              autoplay: 1,
              controls: 1,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                ytPlayerRef.current = event.target;
                setIsYtReady(true);
                try {
                  event.target.setVolume(isMuted ? 0 : Math.round(volume * 100));
                  event.target.setPlaybackRate(playbackRate);
                } catch {}
              },
              onStateChange: (event: any) => {
                // Only process state changes if there's a current track
                // (prevents stale events from previous videos)
                if (!currentTrackRef.current) return;

                if (event.data === 1) {
                  // PLAYING
                  setIsPlaying(true);
                  setIsLoading(false);
                  // Start / resume the wall-clock elapsed tracker so the
                  // progress bar keeps moving even when YouTube reports 0.
                  if (playStartedAtRef.current === null) {
                    playStartedAtRef.current = Date.now() / 1000;
                  } else {
                    accumulatedElapsedRef.current = getManualElapsed();
                    playStartedAtRef.current = Date.now() / 1000;
                  }
                  try {
                    const cur = event.target.getCurrentTime();
                    if (typeof cur === 'number' && !isNaN(cur) && cur > 0) {
                      setCurrentTime(cur);
                      accumulatedElapsedRef.current = cur;
                      playStartedAtRef.current = null;
                    }
                    const dur = event.target.getDuration();
                    if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
                      setDuration(Math.round(dur));
                    }
                  } catch {}
                } else if (event.data === 2) {
                  // PAUSED
                  setIsPlaying(false);
                  // Freeze the accumulated elapsed time at the pause point.
                  if (playStartedAtRef.current !== null) {
                    accumulatedElapsedRef.current = getManualElapsed();
                    playStartedAtRef.current = null;
                  }
                } else if (event.data === 0) {
                  // ENDED
                  // Verify this is still the current track before handling end
                  // (prevents stale ended events from previous videos)
                  if (currentTrackRef.current) {
                    setIsPlaying(false);
                    if (playStartedAtRef.current !== null) {
                      accumulatedElapsedRef.current = getManualElapsed();
                      playStartedAtRef.current = null;
                    }
                    handleTrackEndedRef.current();
                  }
                } else if (event.data === 3) {
                  // BUFFERING
                  setIsLoading(true);
                }
              },
              onError: (event: any) => {
                console.warn('YouTube Player Event Error Code:', event.data);
                // If current stream is restricted or fails, try alternate YouTube video ID
                if (currentFallbacksRef.current.length > 0) {
                  const nextId = currentFallbacksRef.current.shift()!;
                  console.log('Switching to verified YouTube fallback:', nextId);
                  event.target.loadVideoById({ videoId: nextId, startSeconds: 0 });
                  event.target.playVideo();
                } else if (currentTrackRef.current && audioRef.current) {
                  // Fallback seamlessly to direct audio stream
                  console.log('Switching to HTML5 fallback stream');
                  clearTrackEndTimeout();
                  setPlaybackEngine('html5');
                  audioRef.current.src = currentTrackRef.current.fallbackAudioUrl || currentTrackRef.current.audioUrl;
                  audioRef.current.playbackRate = playbackRate;
                  audioRef.current.load();
                  audioRef.current.play().catch(console.warn);
                }
              },
            },
          });
        } catch (e) {
          console.warn('YouTube player initialization warning:', e);
        }
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initYT();
    } else {
      (window as any).onYouTubeIframeAPIReady = () => {
        initYT();
      };
    }

    const checkInterval = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player && !ytPlayerRef.current) {
        initYT();
        clearInterval(checkInterval);
      }
    }, 300);

    // Visibility change handler: when tab becomes visible again, check if the
    // current track should have ended while we were in the background.
    // This catches cases where YouTube onStateChange / HTML5 ended events
    // didn't fire due to browser throttling in background tabs.
    const handleVisibilityChange = () => {
      if (!document.hidden && isPlayingRef.current && currentTrackRef.current) {
        const elapsed = getManualElapsed();
        const trackDuration = currentTrackRef.current.duration || 0;
        if (trackDuration > 0 && elapsed >= trackDuration - 1) {
          // Track should have ended while tab was hidden
          // Verify this is still the track we care about
          if (currentTrackRef.current) {
            console.log('[Visibility] Tab became visible, track should have ended, calling handleTrackEnded');
            handleTrackEndedRef.current();
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(checkInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
          ytPlayerRef.current.destroy();
        }
      } catch {}
    };
  }, []);

  // Keep refs in sync with state so the polling interval does not need to be
  // recreated on every state change (which previously caused the elapsed-time
  // counter to freeze at 0:00).
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackEngineRef.current = playbackEngine;
  }, [playbackEngine]);

  // Poll current time from YouTube Player during active playback.
  // This interval is started once on mount and reads from refs so it is NOT
  // torn down and recreated on every React state update.
  useEffect(() => {
    ytPollIntervalRef.current = setInterval(() => {
      const engine = playbackEngineRef.current;
      if (!isPlayingRef.current) return;

      if (engine === 'youtube' && ytPlayerRef.current) {
        try {
          const cur = ytPlayerRef.current.getCurrentTime();
          // YouTube IFrame frequently returns 0 when the player is minimized
          // off-screen. Fall back to the wall-clock elapsed tracker so the
          // progress bar keeps moving instead of freezing at 0:00.
          const manualCur = getManualElapsed();
          if (typeof cur === 'number' && Number.isFinite(cur) && cur > 0) {
            setCurrentTime(cur);
            accumulatedElapsedRef.current = cur;
          } else if (manualCur > 0) {
            setCurrentTime(manualCur);
          }
          const dur = ytPlayerRef.current.getDuration();
          if (typeof dur === 'number' && Number.isFinite(dur) && dur > 0) {
            setDuration(Math.round(dur));
          }
        } catch {}
      } else if (engine === 'html5' && audioRef.current) {
        // HTML5 audio fires its own `timeupdate` event, but we also poll here
        // as a belt-and-suspenders to keep the counter smooth.
        const audio = audioRef.current;
        if (Number.isFinite(audio.currentTime)) {
          setCurrentTime(audio.currentTime);
          accumulatedElapsedRef.current = audio.currentTime;
        }
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setDuration(Math.round(audio.duration));
        }
      }
    }, 250);

    return () => {
      if (ytPollIntervalRef.current) {
        clearInterval(ytPollIntervalRef.current);
        ytPollIntervalRef.current = null;
      }
    };
  }, []);

// Handler for track end
    // SINGLE source of truth for what happens when a track finishes.
    // NOTE: queueIndex MUST be advanced before/while starting the next
    // track. Previously getNextTrack() returned queue[queueIndex + 1]
    // without moving queueIndex, so the index never advanced and the
    // same track replayed on every song end (even with Repeat Off).
    const handleTrackEnded = () => {
      // Repeat One: replay the exact same track immediately.
      // This is the ONLY path allowed to replay the current track.
      if (repeatMode === 'one') {
        if (playbackEngine === 'youtube' && ytPlayerRef.current) {
          ytPlayerRef.current.seekTo(0, true);
          ytPlayerRef.current.playVideo();
          if (currentTrack?.duration) {
            scheduleTrackEndTimeout(currentTrack.duration, currentTrack.id);
          }
          return;
        }
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
          if (currentTrack?.duration) {
            scheduleTrackEndTimeout(currentTrack.duration, currentTrack.id);
          }
        }
        return;
      }

      // Determine the next track to play (advancing queueIndex as needed)
      const next = getNextTrack();

      if (next) {
        loadAndPlay(next);
        return;
      }

      // No next track available in the queue/context.
      // Repeat Queue: restart the whole queue from the beginning.
      if (repeatMode === 'queue' && queue.length > 0) {
        setQueueIndex(0);
        loadAndPlay(queue[0]);
        return;
      }

      // Autoplay: if enabled, fetch a NEW recommendation.
      // The current track is explicitly excluded so it can never replay.
      if (autoplayEnabled) {
        setAutoplayLoading(true);
        fetchAutoplayTrack().then(track => {
          if (track) {
            // Append autoplay track to queue and advance queueIndex
            setQueue(prev => [...prev, track]);
            setQueueIndex(prev => prev + 1);
            loadAndPlay(track);
            return;
          }
          setIsPlaying(false);
          setAutoplayLoading(false);
        });
        return;
      }

      // Nothing to play next. Stop normally.
      setIsPlaying(false);
    };

handleTrackEndedRef.current = handleTrackEnded;

// Autoplay: fetch a new track using the existing music API when the queue
  // is exhausted and Autoplay is enabled. Never uses iTunes previewUrl or
  // SoundHelix as a generic fallback for real songs.
  const fetchAutoplayTrack = async (): Promise<Track | null> => {
    try {
      if (currentTrack) {
        const excludedIds = [
          currentTrack.id,
          ...queue.map(t => t.id),
          ...history.map(t => t.id),
          ...recentlyRecommendedIdsRef.current,
        ];
        const recs = await getRecommendationsByTrack(currentTrack, {
          limit: 12,
          excludeTrackIds: excludedIds,
        });
        if (recs && recs.length > 0) {
          const filtered = recs.filter(
            t =>
              t.id !== currentTrack.id &&
              (t.title !== currentTrack.title || t.artist !== currentTrack.artist)
          );
          const pool = filtered.length > 0 ? filtered : recs;
          const next = pool[Math.floor(Math.random() * pool.length)];
          if (next && next.id) {
            recentlyRecommendedIdsRef.current.push(next.id);
            if (recentlyRecommendedIdsRef.current.length > MAX_RECENT_RECOMMENDATIONS) {
              recentlyRecommendedIdsRef.current = recentlyRecommendedIdsRef.current.slice(
                recentlyRecommendedIdsRef.current.length - MAX_RECENT_RECOMMENDATIONS
              );
            }
          }
          return next;
        }
      }

      const seeds = CURATED_PLAYLIST_SEEDS.map(s => s.query);
      const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
      const tracks = await fetchTracksByTerm(randomSeed, 10);
      if (!tracks || tracks.length === 0) return null;

      const filtered = currentTrack
        ? tracks.filter(t => t.id !== currentTrack.id && (t.title !== currentTrack.title || t.artist !== currentTrack.artist))
        : tracks;
      const pool = filtered.length > 0 ? filtered : tracks;
      return pool[Math.floor(Math.random() * pool.length)];
    } catch (e) {
      console.warn('Autoplay track fetch failed:', e);
      return null;
    }
  };

// Returns the next track based on queue, shuffle, and playback context.
    // IMPORTANT: this function ADVANCES queueIndex when returning a track from
    // the queue. Without this advancement the index would stay put and the
    // same track would replay on every song end (even with Repeat Off).
    // Returns null when there is no valid next track to play.
    const getNextTrack = (): Track | null => {
      const currentId = currentTrack?.id;

      // Defensive: if queueIndex is out of sync with currentTrack (e.g. after
      // manual playTrack call or queue mutation), resync it so we don't
      // incorrectly compute the next track from a stale index.
      if (queue.length > 0 && currentId) {
        const actualIdx = queue.findIndex(t => t.id === currentId);
        if (actualIdx !== -1 && actualIdx !== queueIndex) {
          setQueueIndex(actualIdx);
        }
      }

      // If we have a queue, use it as the primary sequence
      if (queue.length > 0) {
        if (isShuffle) {
          // Avoid immediately repeating the same track when possible.
          // If the queue only contains the current track, repeating is the
          // only option and Repeat One would normally handle that — here we
          // still return it so the caller can decide (Repeat Queue / Off).
          if (queue.length === 1) {
            return queue[0];
          }
          let attempts = 0;
          while (attempts < 50) {
            const randomIndex = Math.floor(Math.random() * queue.length);
            if (queue[randomIndex].id !== currentId) {
              setQueueIndex(randomIndex);
              return queue[randomIndex];
            }
            attempts++;
          }
          // Fallback: pick any track that is not the current one
          const other = queue.find(t => t.id !== currentId);
          if (other) {
            setQueueIndex(queue.findIndex(t => t.id === other.id));
            return other;
          }
          return queue[0];
        }

        // Sequential: advance past the current track
        const nextIdx = queueIndex + 1;
        if (nextIdx < queue.length) {
          setQueueIndex(nextIdx);
          return queue[nextIdx];
        }

        // Reached the end of the queue
        return null;
      }

      // No queue: fall back to playback context if available
      if (playbackContext && playbackContext.tracks && playbackContext.tracks.length > 0) {
        const tracks = playbackContext.tracks;
        const currentIndex = tracks.findIndex(t => t.id === currentId);
        const nextIdx = currentIndex >= 0 ? currentIndex + 1 : -1;

        if (nextIdx >= 0 && nextIdx < tracks.length) {
          setQueue(tracks);
          setQueueIndex(nextIdx);
          return tracks[nextIdx];
        }

        if (isShuffle && tracks.length > 0) {
          if (tracks.length === 1) {
            return tracks[0];
          }
          let attempts = 0;
          while (attempts < 50) {
            const randomIndex = Math.floor(Math.random() * tracks.length);
            if (tracks[randomIndex].id !== currentId) {
              setQueue(tracks);
              setQueueIndex(randomIndex);
              return tracks[randomIndex];
            }
            attempts++;
          }
          const other = tracks.find(t => t.id !== currentId);
          if (other) {
            setQueue(tracks);
            setQueueIndex(tracks.findIndex(t => t.id === other.id));
            return other;
          }
          return tracks[0];
        }
      }

      return null;
    };

   // Returns the previous track based on queue and shuffle state.
   // Updates queueIndex to point to the returned track.
   const getPreviousTrack = (): Track | null => {
     if (queue.length > 0) {
       if (queueIndex > 0) {
         const prevIdx = queueIndex - 1;
         setQueueIndex(prevIdx);
         return queue[prevIdx];
       }
       return null;
     }

     if (playbackContext && playbackContext.tracks && playbackContext.tracks.length > 0) {
       const tracks = playbackContext.tracks;
       const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
       const prevIdx = currentIndex - 1;
       if (prevIdx >= 0) {
         setQueue(tracks);
         setQueueIndex(prevIdx);
         return tracks[prevIdx];
       }
     }

     return null;
   };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
      try {
        ytPlayerRef.current.setPlaybackRate(rate);
      } catch (e) {
        console.warn('Failed to set YouTube playback rate:', e);
      }
    }
  };

  const loadAndPlay = async (track: Track) => {
    // Increment loadId to mark this as the current load operation.
    // Any async work from previous calls will see a stale loadId and bail out.
    const thisLoadId = ++loadIdRef.current;

    // Clear any pending track-end timeout from previous track
    clearTrackEndTimeout();

    // Sanitize any stale iTunes preview URLs that may have been saved to
    // localStorage in older versions of the app. We never play previews.
    track = sanitizeTrackAudioUrls(track);

    setIsLoading(true);
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setCurrentTime(0);
    accumulatedElapsedRef.current = 0;
    playStartedAtRef.current = null;

    // Immediately display full track duration
    if (track.duration && track.duration > 0) {
      setDuration(track.duration);
    }

    // Add to history
    setHistory(prev => [track, ...prev.filter(t => t.id !== track.id)].slice(0, 30));

    let resolvedVideoId = track.youtubeVideoId;
    let resolvedAudioUrl = track.audioUrl;
    let resolvedFallbackAudioUrl = track.fallbackAudioUrl;
    let resolvedDuration = track.duration;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Call our robust official track resolver
      const res = await fetch(
        `/api/resolve-track?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      // Bail out if a newer loadAndPlay call has superseded this one
      if (loadIdRef.current !== thisLoadId) return;

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.youtubeVideoId) {
            resolvedVideoId = data.youtubeVideoId;
            track.youtubeVideoId = data.youtubeVideoId;
          }
          if (data.youtubeFallbacks && Array.isArray(data.youtubeFallbacks)) {
            track.youtubeFallbacks = data.youtubeFallbacks;
            currentFallbacksRef.current = [...data.youtubeFallbacks];
          }
          // Only accept direct audio URLs that are NOT iTunes previews
          if (data.directAudioUrl && !isPreviewUrl(data.directAudioUrl)) {
            resolvedAudioUrl = data.directAudioUrl;
            track.audioUrl = data.directAudioUrl;
          }
          if (data.fallbackAudioUrl && !isPreviewUrl(data.fallbackAudioUrl)) {
            resolvedFallbackAudioUrl = data.fallbackAudioUrl;
            track.fallbackAudioUrl = data.fallbackAudioUrl;
          }
          if (data.duration && data.duration > 0) {
            resolvedDuration = data.duration;
            track.duration = data.duration;
            setDuration(data.duration);
          }
        }
      }
    } catch (err) {
      // Bail out if a newer loadAndPlay call has superseded this one
      if (loadIdRef.current !== thisLoadId) return;
      console.warn('Track resolution timed out or encountered error, attempting direct playback:', err);
    }

    // Bail out if a newer loadAndPlay call has superseded this one
    if (loadIdRef.current !== thisLoadId) return;

    // Play using YouTube Player if a video ID is available.
    // If the YouTube player is not yet ready, wait briefly for it instead of
    // falling back to a 30-second preview.
    if (resolvedVideoId) {
      if (ytPlayerRef.current && isYtReady) {
        setPlaybackEngine('youtube');
        if (audioRef.current) {
          audioRef.current.pause();
        }
        try {
          ytPlayerRef.current.loadVideoById({
            videoId: resolvedVideoId,
            startSeconds: 0,
          });
          ytPlayerRef.current.setPlaybackRate(playbackRate);
          ytPlayerRef.current.setVolume(isMuted ? 0 : Math.round(volume * 100));
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
          setIsLoading(false);
          scheduleTrackEndTimeout(resolvedDuration, track.id);
          return;
        } catch (e) {
          console.warn('YouTube loadVideoById failed, trying HTML5 fallback:', e);
        }
      } else if (ytPlayerRef.current && !isYtReady) {
        // Player exists but not ready yet - wait for onReady
        const waitForReady = () => {
          if (loadIdRef.current !== thisLoadId) return; // stale load
          if (isYtReady) {
            setPlaybackEngine('youtube');
            if (audioRef.current) {
              audioRef.current.pause();
            }
            try {
              ytPlayerRef.current!.loadVideoById({
                videoId: resolvedVideoId,
                startSeconds: 0,
              });
              ytPlayerRef.current!.setPlaybackRate(playbackRate);
              ytPlayerRef.current!.setVolume(isMuted ? 0 : Math.round(volume * 100));
              ytPlayerRef.current!.playVideo();
              setIsPlaying(true);
              setIsLoading(false);
              scheduleTrackEndTimeout(resolvedDuration, track.id);
            } catch (e) {
              console.warn('YouTube playback failed after ready, trying HTML5:', e);
              playHtml5Fallback(thisLoadId);
            }
          } else {
            // Check again in 100ms, but give up after ~2 seconds
            setTimeout(waitForReady, 100);
          }
        };
        waitForReady();
        return;
      } else {
        // YouTube player not ready yet. Wait briefly for it to initialize
        // instead of immediately falling back to a preview URL.
        let attempts = 0;
        const maxAttempts = 20; // up to ~2 seconds
        const waitInterval = setInterval(() => {
          attempts++;
          if (loadIdRef.current !== thisLoadId) {
            clearInterval(waitInterval);
            return;
          }
          if (ytPlayerRef.current) {
            clearInterval(waitInterval);
            if (!isYtReady) {
              // Player created but not ready - wait for ready
              const waitForReady = () => {
                if (loadIdRef.current !== thisLoadId) return;
                if (isYtReady) {
                  setPlaybackEngine('youtube');
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                  try {
                    ytPlayerRef.current!.loadVideoById({
                      videoId: resolvedVideoId,
                      startSeconds: 0,
                    });
                    ytPlayerRef.current!.setPlaybackRate(playbackRate);
                    ytPlayerRef.current!.setVolume(isMuted ? 0 : Math.round(volume * 100));
                    ytPlayerRef.current!.playVideo();
                    setIsPlaying(true);
                    setIsLoading(false);
                    scheduleTrackEndTimeout(resolvedDuration, track.id);
                  } catch (e) {
                    console.warn('YouTube playback failed after ready, trying HTML5:', e);
                    playHtml5Fallback(thisLoadId);
                  }
                } else {
                  setTimeout(waitForReady, 100);
                }
              };
              waitForReady();
            } else {
              setPlaybackEngine('youtube');
              if (audioRef.current) {
                audioRef.current.pause();
              }
              try {
                ytPlayerRef.current.loadVideoById({
                  videoId: resolvedVideoId,
                  startSeconds: 0,
                });
                ytPlayerRef.current.setPlaybackRate(playbackRate);
                ytPlayerRef.current.setVolume(isMuted ? 0 : Math.round(volume * 100));
                ytPlayerRef.current.playVideo();
                setIsPlaying(true);
                setIsLoading(false);
                scheduleTrackEndTimeout(resolvedDuration, track.id);
              } catch (e) {
                console.warn('YouTube playback failed after wait, trying HTML5:', e);
                playHtml5Fallback(thisLoadId);
              }
            }
            return;
          }
          if (attempts >= maxAttempts) {
            clearInterval(waitInterval);
            console.warn('YouTube player did not initialize in time, trying HTML5 fallback');
            playHtml5Fallback(thisLoadId);
          }
        }, 100);
        return;
      }
    }

    // Otherwise, play using HTML5 audio engine with JioSaavn direct audio
    // (only if it is a real full-length track, never an iTunes preview).
    playHtml5Fallback(thisLoadId);

    function playHtml5Fallback(loadId: number) {
      // Bail out if a newer loadAndPlay call has superseded this one
      if (loadIdRef.current !== loadId) return;

      if (!audioRef.current) {
        setIsLoading(false);
        return;
      }

      const candidateUrl = resolvedAudioUrl || track.audioUrl;
      const candidateFallback = resolvedFallbackAudioUrl || track.fallbackAudioUrl;

      // Reject any iTunes preview URLs
      if (isPreviewUrl(candidateUrl)) {
        console.warn('Refusing to play iTunes preview URL:', candidateUrl);
        setIsLoading(false);
        setIsPlaying(false);
        return;
      }

      setPlaybackEngine('html5');
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.pauseVideo(); } catch {}
      }

      // Only play if we have a valid, non-preview audio URL
      if (candidateUrl) {
        audioRef.current.src = candidateUrl;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.load();
        audioRef.current
          .play()
          .then(() => {
            // Bail out if a newer loadAndPlay call has superseded this one
            if (loadIdRef.current !== loadId) return;
            setIsPlaying(true);
            setIsLoading(false);
            scheduleTrackEndTimeout(resolvedDuration, track.id);
          })
          .catch(err => {
            if (loadIdRef.current !== loadId) return;
            console.warn('Primary stream autoplay or play error:', err);
            if (candidateFallback && !isPreviewUrl(candidateFallback) && audioRef.current && audioRef.current.src !== candidateFallback) {
              audioRef.current.src = candidateFallback;
              audioRef.current.playbackRate = playbackRate;
              audioRef.current.load();
              audioRef.current.play().then(() => {
                if (loadIdRef.current !== loadId) return;
                setIsPlaying(true);
                setIsLoading(false);
                scheduleTrackEndTimeout(resolvedDuration, track.id);
              }).catch(e => {
                if (loadIdRef.current !== loadId) return;
                console.warn('Fallback stream error:', e);
                setIsLoading(false);
                setIsPlaying(false);
              });
            } else {
              setIsLoading(false);
              setIsPlaying(false);
            }
          });
      } else {
        // No valid full-length audio source available. Do not play a preview.
        console.warn('No valid full-length audio source available for track:', track.title);
        setIsLoading(false);
        setIsPlaying(false);
      }
    }
  };

const playTrack = (track: Track, newQueue?: Track[]) => {
     // Guard against starting a new load while one is already in progress
     if (isLoading) return;
     
     if (newQueue && newQueue.length > 0) {
       setQueue(newQueue);
       const idx = newQueue.findIndex(t => t.id === track.id);
       setQueueIndex(idx !== -1 ? idx : 0);
       setPlaybackContext({ type: 'queue', tracks: newQueue });
     } else if (!queue.some(t => t.id === track.id)) {
       setQueue(prev => [track, ...prev]);
       setQueueIndex(0);
       setPlaybackContext({ type: 'queue', tracks: [track, ...queue] });
     } else {
       const idx = queue.findIndex(t => t.id === track.id);
       setQueueIndex(idx);
     }
     loadAndPlay(track);
   };

   const playPlaylist = (playlist: Playlist, startIndex: number = 0) => {
     if (!playlist.tracks || playlist.tracks.length === 0) return;
     const tracksToPlay = [...playlist.tracks];
     const initialIndex = Math.max(0, Math.min(startIndex, tracksToPlay.length - 1));
     setQueue(tracksToPlay);
     setQueueIndex(initialIndex);
     setPlaybackContext({ type: 'playlist', id: playlist.id, tracks: tracksToPlay });
     loadAndPlay(tracksToPlay[initialIndex]);
   };

const togglePlay = () => {
      if (!currentTrack && queue.length > 0) {
        playTrack(queue[0]);
        return;
      }

      if (playbackEngine === 'youtube' && ytPlayerRef.current && isYtReady) {
        if (isPlaying) {
          clearTrackEndTimeout();
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
          if (playStartedAtRef.current !== null) {
            accumulatedElapsedRef.current = getManualElapsed();
            playStartedAtRef.current = null;
          }
        } else {
          // Guard against starting playback while loading
          if (isLoading) return;
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
          if (playStartedAtRef.current === null) {
            playStartedAtRef.current = Date.now() / 1000;
          }
          // Schedule track-end timeout for resumed playback
          if (currentTrack?.duration) {
            scheduleTrackEndTimeout(currentTrack.duration, currentTrack.id);
          }
        }
        return;
      }

      if (!audioRef.current) return;
      if (isPlaying) {
        clearTrackEndTimeout();
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Guard against starting playback while loading
        if (isLoading) return;
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
        if (currentTrack?.duration) {
          scheduleTrackEndTimeout(currentTrack.duration, currentTrack.id);
        }
      }
    };

    const pause = () => {
      clearTrackEndTimeout();
      if (playbackEngine === 'youtube' && ytPlayerRef.current && isYtReady) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (playStartedAtRef.current !== null) {
        accumulatedElapsedRef.current = getManualElapsed();
        playStartedAtRef.current = null;
      }
    };

    const resume = () => {
      if (playbackEngine === 'youtube' && ytPlayerRef.current && isYtReady) {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
        if (playStartedAtRef.current === null) {
          playStartedAtRef.current = Date.now() / 1000;
        }
        if (currentTrack?.duration) {
          scheduleTrackEndTimeout(currentTrack.duration, currentTrack.id);
        }
      } else if (audioRef.current) {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
        if (currentTrack?.duration) {
          scheduleTrackEndTimeout(currentTrack.duration, currentTrack.id);
        }
      }
    };

const nextTrack = () => {
      // Guard against starting a new load while one is already in progress
      if (isLoading) return;
      
      // Repeat One: restart the current track
      if (repeatMode === 'one' && currentTrack) {
        loadAndPlay(currentTrack);
        return;
      }

     const next = getNextTrack();
     if (next) {
       loadAndPlay(next);
       return;
     }

     // If we reached the end of the queue and repeat is queue, loop back
     if (repeatMode === 'queue' && queue.length > 0) {
       setQueueIndex(0);
       loadAndPlay(queue[0]);
       return;
     }

     // No next track available
     setIsPlaying(false);
   };

const previousTrack = () => {
      // Guard against starting a new load while one is already in progress
      if (isLoading) return;
      
      // If we are more than 3 seconds into the track, seek to the beginning
      if (currentTime > 3) {
       seek(0);
       return;
     }

     const prev = getPreviousTrack();
     if (prev) {
       loadAndPlay(prev);
       return;
     }

     // No previous track available
     seek(0);
   };

  const seek = (seconds: number) => {
    setCurrentTime(seconds);
    accumulatedElapsedRef.current = seconds;
    if (playbackEngine === 'youtube' && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(seconds, true);
      } catch (e) {
        console.warn('YouTube seek error:', e);
      }
      return;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (isMuted && clamped > 0) setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(Math.round(clamped * 100));
      } catch (e) {
        console.warn('YouTube volume error:', e);
      }
    }
    localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume;
      if (ytPlayerRef.current) ytPlayerRef.current.setVolume(Math.round(volume * 100));
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
      if (ytPlayerRef.current) ytPlayerRef.current.setVolume(0);
    }
  };

const cycleRepeatMode = () => {
     setRepeatMode(prev => {
       if (prev === 'off') return 'queue';
       if (prev === 'queue') return 'one';
       return 'off';
     });
   };

   const toggleShuffle = () => {
     setIsShuffle(prev => !prev);
   };

   // Shuffles the current queue while keeping the current track in place.
   const shuffleQueue = () => {
     if (queue.length <= 1) return;
     const current = queue[queueIndex];
     const rest = queue.filter((_, i) => i !== queueIndex);
     for (let i = rest.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [rest[i], rest[j]] = [rest[j], rest[i]];
     }
     const newQueue = current ? [current, ...rest] : rest;
     setQueue(newQueue);
     setQueueIndex(0);
   };

  const isLiked = (trackId: string) => likedTracks.some(t => t.id === trackId);

  const toggleLike = (track: Track) => {
    setLikedTracks(prev => {
      const exists = prev.some(t => t.id === track.id);
      if (exists) {
        return prev.filter(t => t.id !== track.id);
      } else {
        return [track, ...prev];
      }
    });
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < queueIndex) {
      setQueueIndex(prev => prev - 1);
    }
  };

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(-1);
    }
  };

  // Custom Playlists management
  const createPlaylist = (name: string, description: string = '') => {
    const colors = ['#1db954', '#8b5cf6', '#ec4899', '#f97316', '#3b82f6', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newPlaylist: Playlist = {
      id: `custom-${Date.now()}`,
      name: name || `My Playlist #${playlists.filter(p => p.isCustom).length + 1}`,
      description: description || 'Created by you on Slentizy',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      color: randomColor,
      tracks: [],
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (activePlaylist?.id === playlistId) {
      setActivePlaylist(null);
      setCurrentView('library');
    }
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId) {
          // Avoid duplicate add
          if (p.tracks.some(t => t.id === track.id)) return p;
          return {
            ...p,
            tracks: [track, ...p.tracks],
          };
        }
        return p;
      })
    );
    if (activePlaylist?.id === playlistId) {
      setActivePlaylist(prev => prev ? {
        ...prev,
        tracks: prev.tracks.some(t => t.id === track.id) ? prev.tracks : [track, ...prev.tracks]
      } : null);
    }
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId) {
          return {
            ...p,
            tracks: p.tracks.filter(t => t.id !== trackId),
          };
        }
        return p;
      })
    );
    if (activePlaylist?.id === playlistId) {
      setActivePlaylist(prev => prev ? {
        ...prev,
        tracks: prev.tracks.filter(t => t.id !== trackId)
      } : null);
    }
  };

return (
     <PlayerContext.Provider
       value={{
         currentTrack,
         isPlaying,
         currentTime,
         duration,
         volume,
         isMuted,
         isShuffle,
         repeatMode,
         queue,
         queueIndex,
         history,
         likedTracks,
         isLiked,
         toggleLike,
         playlists,
         createPlaylist,
         deletePlaylist,
         addTrackToPlaylist,
         removeTrackFromPlaylist,
         currentView,
         setCurrentView,
         activePlaylist,
         setActivePlaylist,
         isNowPlayingOpen,
         setIsNowPlayingOpen,
         isLyricsOpen,
         setIsLyricsOpen,
         isQueueOpen,
         setIsQueueOpen,
         searchQuery,
         setSearchQuery,
         playTrack,
         playPlaylist,
         togglePlay,
         pause,
         resume,
         nextTrack,
         previousTrack,
         seek,
         setVolume,
         toggleMute,
         toggleShuffle,
         cycleRepeatMode,
         shuffleQueue,
         addToQueue,
         removeFromQueue,
         clearQueue,
         isLoading,
         playbackRate,
         setPlaybackRate,
         isVideoMode,
         setIsVideoMode,
         playbackEngine,
autoplayEnabled,
          setAutoplayEnabled,
          autoplayLoading,
          crossfadeEnabled,
          setCrossfadeEnabled,
          playbackContext,
          setPlaybackContext,
       }}
     >
      {children}
      {/* YouTube IFrame Player Canvas (Visible when isVideoMode is active, otherwise off-screen audio) */}
      <div
        id="slentizy-yt-container"
        className={`fixed transition-all duration-300 z-50 overflow-hidden shadow-2xl rounded-xl border border-white/15 bg-black ${
          isVideoMode && currentTrack?.youtubeVideoId
            ? 'bottom-24 right-4 w-84 h-52 ring-1 ring-emerald-500/30'
            : 'pointer-events-none opacity-0 -bottom-[9999px] -left-[9999px] w-1 h-1'
        }`}
      >
        {isVideoMode && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md rounded-full px-2.5 py-1 text-xs text-white shadow-lg border border-white/10">
            <span className="font-medium text-emerald-400">Official Video</span>
            <button
              onClick={() => setIsVideoMode(false)}
              className="hover:text-red-400 font-bold ml-1 transition-colors"
              title="Close video view"
            >
              ✕
            </button>
          </div>
        )}
        <div id="slentizy-yt-player" className="w-full h-full" />
      </div>
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
