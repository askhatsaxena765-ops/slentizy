import React from 'react';
import { X, Heart, Plus, Radio, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface NowPlayingSidebarProps {
  onAddToPlaylistClick: () => void;
}

export const NowPlayingSidebar: React.FC<NowPlayingSidebarProps> = ({ onAddToPlaylistClick }) => {
  const {
    currentTrack,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    isLiked,
    toggleLike,
    queue,
    queueIndex,
    playTrack,
    setCurrentView,
    setSearchQuery,
  } = usePlayer();

  if (!isNowPlayingOpen || !currentTrack) return null;

  const liked = isLiked(currentTrack.id);
  const nextTrackInQueue = queue[queueIndex + 1];

  return (
    <aside
      id="slentizy-now-playing-panel"
      className="hidden xl:flex flex-col w-72 md:w-80 h-full p-2 shrink-0 select-none animate-in fade-in duration-200"
    >
      <div className="bg-[#121212] rounded-lg p-4 h-full flex flex-col gap-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white tracking-tight">
            Now playing
          </span>
          <button
            onClick={() => setIsNowPlayingOpen(false)}
            title="Close panel"
            className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Large Artwork */}
        <div className="w-full aspect-square rounded-lg overflow-hidden shadow-2xl bg-[#282828] relative group">
          <img
            src={currentTrack.artwork}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Title & Artist & Like */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <h3 className="text-lg font-bold text-white leading-tight truncate">
              {currentTrack.title}
            </h3>
            <p
              onClick={() => {
                setSearchQuery(currentTrack.artist);
                setCurrentView('search');
              }}
              className="text-sm text-neutral-400 truncate hover:text-white hover:underline cursor-pointer"
            >
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleLike(currentTrack)}
              title={liked ? 'Unlike' : 'Like'}
              className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${
                liked ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-[#1db954]' : ''}`} />
            </button>
            <button
              onClick={onAddToPlaylistClick}
              title="Add to playlist"
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* About the Artist Card */}
        <div className="bg-[#242424] rounded-lg p-3.5 flex flex-col gap-2 mt-2">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            About the artist
          </span>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow bg-black/40">
              <img
                src={currentTrack.artwork}
                alt={currentTrack.artist}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">
                {currentTrack.artist}
              </span>
              <span className="text-xs text-neutral-400">
                {currentTrack.genre || 'Top Artist'} • Global Artist
              </span>
            </div>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3 mt-1">
            Listen to {currentTrack.artist}'s top hits, live previews, and releases right from the public catalog.
          </p>
          <button
            onClick={() => {
              setSearchQuery(currentTrack.artist);
              setCurrentView('search');
            }}
            className="mt-1 self-start px-3 py-1 rounded-full border border-white/20 text-xs font-semibold text-white hover:border-white hover:scale-105 transition-all"
          >
            Explore artist catalog
          </button>
        </div>

        {/* Next in Queue snippet */}
        {nextTrackInQueue && (
          <div className="bg-[#242424] rounded-lg p-3 flex flex-col gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Next in queue
            </span>
            <div
              onClick={() => playTrack(nextTrackInQueue)}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded overflow-hidden relative shrink-0">
                <img
                  src={nextTrackInQueue.artwork}
                  alt={nextTrackInQueue.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-white truncate group-hover:text-[#1db954]">
                  {nextTrackInQueue.title}
                </span>
                <span className="text-[11px] text-neutral-400 truncate">
                  {nextTrackInQueue.artist}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
