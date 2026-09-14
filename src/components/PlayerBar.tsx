import React, { useState } from 'react';
  import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Shuffle,
    Repeat,
    Repeat1,
    Volume2,
    VolumeX,
    Volume1,
    Heart,
    ListMusic,
    Mic2,
    Maximize2,
    Minimize2,
    Tv,
    Settings,
    Check,
    Disc,
  } from 'lucide-react';
  import { usePlayer } from '../context/PlayerContext';
  import { formatTime } from '../utils/formatTime';

  export const PlayerBar: React.FC = () => {
    const {
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isShuffle,
      repeatMode,
      togglePlay,
      nextTrack,
      previousTrack,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeatMode,
      autoplayEnabled,
      setAutoplayEnabled,
      crossfadeEnabled,
      setCrossfadeEnabled,
      isLiked,
      toggleLike,
      isLyricsOpen,
      setIsLyricsOpen,
      isQueueOpen,
      setIsQueueOpen,
      isNowPlayingOpen,
      setIsNowPlayingOpen,
      playbackRate,
      setPlaybackRate,
      isVideoMode,
      setIsVideoMode,
    } = usePlayer();

    const [isSeeking, setIsSeeking] = useState(false);
    const [seekValue, setSeekValue] = useState(0);
    const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const liked = currentTrack ? isLiked(currentTrack.id) : false;
  const progressPercent = duration > 0 ? ((isSeeking ? seekValue : currentTime) / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
    setSeekValue(currentTime);
  };

  const handleSeekMouseUp = () => {
    seek(seekValue);
    setIsSeeking(false);
  };

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 0.5) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <footer
      id="slentizy-player-bar"
      className="h-20 md:h-22 bg-[#121212]/95 backdrop-blur-2xl border-t border-white/5 px-4 flex items-center justify-between z-30 select-none shadow-2xl"
    >
      {/* 1. Left: Track Info & Quick Actions */}
      <div className="flex items-center gap-3 w-[30%] min-w-[180px]">
        {currentTrack ? (
          <>
            <div className="relative group w-14 h-14 rounded overflow-hidden shrink-0 shadow bg-[#282828]">
              <img
                src={currentTrack.artwork}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setIsNowPlayingOpen(prev => !prev)}
                title="Expand art"
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white hover:scale-110"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col min-w-0 max-w-[180px] lg:max-w-xs">
              <div className="flex items-center gap-1.5">
                <span
                  onClick={() => setIsLyricsOpen(true)}
                  className="text-sm font-semibold text-white truncate cursor-pointer hover:underline"
                >
                  {currentTrack.title}
                </span>
                {isPlaying && (
                  <span className="flex items-end gap-0.5 h-3 shrink-0">
                    <span className="w-0.5 bg-[#10b981] animate-pulse h-full" />
                    <span className="w-0.5 bg-[#10b981] animate-pulse h-2/3" />
                    <span className="w-0.5 bg-[#10b981] animate-pulse h-4/5" />
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-400 truncate hover:text-white hover:underline cursor-pointer">
                {currentTrack.artist}
              </span>
            </div>

            <button
              id="player-like-btn"
              onClick={() => toggleLike(currentTrack)}
              title={liked ? 'Remove from Your Library' : 'Save to Your Library'}
              className={`p-1.5 transition-transform active:scale-90 ${
                liked ? 'text-[#10b981]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-[#10b981]' : ''}`} />
            </button>
          </>
        ) : (
          <div className="text-xs text-neutral-500 italic">No track selected</div>
        )}
      </div>

      {/* 2. Center: Controls & Scrubber */}
      <div className="flex flex-col items-center gap-1.5 max-w-[722px] w-[40%]">
        {/* Buttons Row */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Shuffle */}
          <button
            id="player-shuffle-btn"
            onClick={toggleShuffle}
            title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
            className={`relative p-1 transition-colors ${
              isShuffle ? 'text-[#10b981]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#10b981] rounded-full" />
            )}
          </button>

          {/* Previous */}
          <button
            id="player-prev-btn"
            onClick={previousTrack}
            title="Previous"
            className="text-neutral-400 hover:text-white transition-colors active:scale-95"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause */}
          <button
            id="player-play-pause-btn"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white hover:scale-105 active:scale-95 flex items-center justify-center text-black shadow-lg transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            id="player-next-btn"
            onClick={nextTrack}
            title="Next"
            className="text-neutral-400 hover:text-white transition-colors active:scale-95"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            id="player-repeat-btn"
            onClick={cycleRepeatMode}
            title={`Repeat: ${repeatMode}`}
            className={`relative p-1 transition-colors ${
              repeatMode !== 'off' ? 'text-[#10b981]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#10b981] rounded-full" />
            )}
          </button>
        </div>

        {/* Progress Scrubber */}
        <div className="w-full flex items-center gap-2 text-[11px] font-mono text-neutral-400">
          <span className="w-10 text-right">
            {formatTime(isSeeking ? seekValue : currentTime)}
          </span>

          <div className="relative flex-1 flex items-center slider-group py-1">
            {/* Background track */}
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden relative">
              {/* Active fill */}
              <div
                className="h-full bg-white group-hover:bg-[#10b981] rounded-full transition-colors"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>

            {/* Hidden native input on top for accessible sliding */}
            <input
              type="range"
              min={0}
              max={duration || currentTrack?.duration || 180}
              step={0.1}
              value={isSeeking ? seekValue : currentTime}
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              onTouchStart={handleSeekMouseDown}
              onTouchEnd={handleSeekMouseUp}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Seek"
            />
          </div>

          <span className="w-10 text-left">{formatTime(duration || currentTrack?.duration || 0)}</span>
        </div>
      </div>

      {/* 3. Right: Secondary Controls (Lyrics, Queue, Volume, Fullscreen) */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px]">
        {/* Lyrics Button */}
        <button
          id="player-lyrics-btn"
          onClick={() => setIsLyricsOpen(prev => !prev)}
          title="Lyrics"
          className={`p-1.5 rounded-full transition-colors ${
            isLyricsOpen ? 'text-[#10b981]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Queue Drawer Button */}
        <button
          id="player-queue-btn"
          onClick={() => setIsQueueOpen(prev => !prev)}
          title="Queue"
          className={`p-1.5 rounded-full transition-colors ${
            isQueueOpen ? 'text-[#10b981]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume controls */}
        <div className="hidden sm:flex items-center gap-2 group">
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="text-neutral-400 hover:text-white p-1"
          >
            {renderVolumeIcon()}
          </button>

          <div className="relative w-20 md:w-24 flex items-center slider-group py-1">
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden">
              <div
                className="h-full bg-white group-hover:bg-[#10b981] rounded-full transition-colors"
                style={{ width: `${volumePercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Volume"
            />
          </div>
        </div>

        {/* Playback Speed Controller */}
        <div className="relative">
          <button
            id="player-speed-btn"
            onClick={() => setIsSpeedMenuOpen(prev => !prev)}
            title="Playback Speed"
            className={`px-2 py-0.5 rounded text-xs font-bold transition-all border ${
              playbackRate !== 1.0
                ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-sm'
                : 'bg-white/5 text-neutral-300 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {playbackRate}x
          </button>

          {isSpeedMenuOpen && (
            <div className="absolute bottom-10 right-0 bg-[#1e1e1e] border border-white/15 rounded-lg py-1.5 px-1 shadow-2xl z-50 flex flex-col gap-0.5 min-w-[110px]">
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Speed
              </div>
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setPlaybackRate(rate);
                    setIsSpeedMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1 text-xs rounded text-left transition-colors ${
                    playbackRate === rate
                      ? 'bg-[#10b981] text-black font-bold'
                      : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{rate}x</span>
                  {rate === 1.0 && (
                    <span className="text-[10px] opacity-80 font-normal ml-1">(Normal)</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Playback Settings (Shuffle, Repeat, Autoplay, Crossfade) */}
        <div className="relative">
          <button
            id="player-settings-btn"
            onClick={() => setIsSettingsOpen(prev => !prev)}
            title="Playback settings"
            className={`p-1.5 rounded-full transition-all ${
              isSettingsOpen
                ? 'text-[#10b981] bg-emerald-500/10 ring-1 ring-emerald-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {isSettingsOpen && (
            <div
              id="player-settings-menu"
              className="absolute bottom-12 right-0 w-64 bg-[#1e1e1e] border border-white/15 rounded-lg py-2 shadow-2xl z-50 flex flex-col"
            >
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Playback Settings
              </div>

              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className="flex items-center justify-between px-3 py-2 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Shuffle className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-white">Shuffle</span>
                </div>
                {isShuffle && <Check className="w-4 h-4 text-[#10b981]" />}
              </button>

              {/* Repeat mode */}
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Repeat
              </div>
              <button
                onClick={cycleRepeatMode}
                className="flex items-center justify-between px-3 py-2 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {repeatMode === 'one' ? (
                    <Repeat1 className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <Repeat className="w-4 h-4 text-neutral-400" />
                  )}
                  <span className="text-sm text-white capitalize">{repeatMode}</span>
                </div>
                {repeatMode !== 'off' && <Check className="w-4 h-4 text-[#10b981]" />}
              </button>

              {/* Autoplay */}
              <button
                onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                className="flex items-center justify-between px-3 py-2 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Disc className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-white">Autoplay</span>
                </div>
                {autoplayEnabled && <Check className="w-4 h-4 text-[#10b981]" />}
              </button>

              {/* Crossfade */}
              <button
                onClick={() => setCrossfadeEnabled(!crossfadeEnabled)}
                className="flex items-center justify-between px-3 py-2 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-white">Crossfade</span>
                </div>
                {crossfadeEnabled && <Check className="w-4 h-4 text-[#10b981]" />}
              </button>
            </div>
          )}
        </div>

        {/* Video Mode Toggle */}
        <button
          id="player-video-btn"
          onClick={() => setIsVideoMode(prev => !prev)}
          title={isVideoMode ? 'Hide Music Video' : 'Show Official Music Video'}
          className={`p-1.5 rounded-full transition-all ${
            isVideoMode
              ? 'text-[#10b981] bg-emerald-500/10 ring-1 ring-emerald-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* Fullscreen Player / Lyrics Toggle */}
        <button
          id="player-fullscreen-btn"
          onClick={() => setIsLyricsOpen(prev => !prev)}
          title="Fullscreen experience"
          className="text-neutral-400 hover:text-white p-1.5 transition-colors hidden md:block"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
