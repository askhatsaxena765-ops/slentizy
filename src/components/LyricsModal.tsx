import React, { useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';
import { SlentizyLogo } from './SlentizyLogo';

export const LyricsModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    isLiked,
    toggleLike,
    isLyricsOpen,
    setIsLyricsOpen,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  } = usePlayer();

  const activeLineRef = useRef<HTMLParagraphElement | null>(null);

  if (!isLyricsOpen || !currentTrack) return null;

  const lyrics = currentTrack.lyrics || [
    `♪ ${currentTrack.title} ♪`,
    `By ${currentTrack.artist}`,
    `[Instrumental intro]`,
    `Feel the rhythm and bass in your veins`,
    `Streaming live with pristine audio`,
    `Sing along with the music`,
    `[Chorus]`,
    `Lost in the melody tonight`,
    `Everything will be alright`,
    `♪ ♪ ♪`
  ];

  // Calculate current active lyric line index based on progress percent
  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const activeLineIndex = Math.min(
    Math.floor(progressRatio * lyrics.length),
    lyrics.length - 1
  );

  // Auto scroll to active lyric line
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  const liked = isLiked(currentTrack.id);

  return (
    <div
      id="slentizy-lyrics-modal"
      className="fixed inset-0 z-50 flex flex-col bg-[#121212] overflow-hidden select-none animate-in fade-in duration-300"
    >
      {/* Dynamic ambient backdrop using artwork with high blur */}
      <div
        className="absolute inset-0 opacity-40 blur-3xl scale-125 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #1db954, #121212)`,
        }}
      />
      <img
        src={currentTrack.artwork}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20 blur-3xl scale-150 pointer-events-none"
        referrerPolicy="no-referrer"
      />

      {/* Top Bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <SlentizyLogo size="sm" showText={false} />
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 font-semibold tracking-wider uppercase">
              Playing on Slentizy
            </span>
            <span className="text-sm font-bold text-white">
              {currentTrack.album}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsLyricsOpen(false)}
          title="Exit lyrics mode"
          className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors hover:scale-105"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Main Lyrics Display */}
      <main className="relative z-10 flex-1 overflow-y-auto px-6 md:px-20 py-8 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-6 text-center my-auto pb-24">
          {lyrics.map((line, idx) => {
            const isActive = idx === activeLineIndex;
            const isPassed = idx < activeLineIndex;

            return (
              <p
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => {
                  const targetTime = (idx / lyrics.length) * duration;
                  seek(targetTime);
                }}
                className={`text-2xl md:text-4xl font-extrabold cursor-pointer transition-all duration-300 py-1.5 ${
                  isActive
                    ? 'text-white scale-105 filter drop-shadow-[0_0_16px_rgba(255,255,255,0.4)]'
                    : isPassed
                    ? 'text-white/40 hover:text-white/70'
                    : 'text-white/20 hover:text-white/50'
                }`}
              >
                {line}
              </p>
            );
          })}
        </div>
      </main>

      {/* Bottom Floating Player Controls */}
      <footer className="relative z-10 bg-black/60 backdrop-blur-xl border-t border-white/10 px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Track brief */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <img
            src={currentTrack.artwork}
            alt={currentTrack.title}
            className="w-12 h-12 rounded shadow-lg object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">
              {currentTrack.title}
            </span>
            <span className="text-xs text-neutral-400 truncate">
              {currentTrack.artist}
            </span>
          </div>
          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-1.5 ml-2 ${liked ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-[#1db954]' : ''}`} />
          </button>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col items-center gap-2 w-full max-w-md">
          <div className="flex items-center gap-6">
            <button
              onClick={previousTrack}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white hover:scale-105 active:scale-95 flex items-center justify-center text-black shadow-xl transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black text-black" />
              ) : (
                <Play className="w-5 h-5 fill-black text-black ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>{formatTime(currentTime)}</span>
            <div className="relative flex-1 flex items-center h-2">
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, (currentTime / (duration || currentTrack.duration || 180)) * 100))}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || currentTrack.duration || 180}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span>{formatTime(duration || currentTrack.duration || 0)}</span>
          </div>
        </div>

        {/* Volume & Close */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleMute} className="text-neutral-400 hover:text-white">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-white cursor-pointer"
          />
        </div>
      </footer>
    </div>
  );
};
