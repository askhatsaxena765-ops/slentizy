import React from 'react';
import { ChevronLeft, ChevronRight, Search, X, User, Radio, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface TopBarProps {
  scrolled: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ scrolled }) => {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    activePlaylist,
  } = usePlayer();

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <header
      id="slentizy-topbar"
      className={`sticky top-0 z-20 h-16 px-6 flex items-center justify-between transition-colors duration-300 ${
        scrolled
          ? 'bg-[#121212]/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      {/* Left controls: Back / Forward & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activePlaylist) {
                // Return to home or previous
                window.history.back();
              }
            }}
            title="Go back"
            className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => window.history.forward()}
            title="Go forward"
            className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Search Bar (shown when on Search view, or allows instant jump to Search) */}
        {currentView === 'search' ? (
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="slentizy-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search full songs, artists, or genres on Slentizy..."
              autoFocus
              className="w-full pl-9 pr-9 py-2 bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-white text-sm rounded-full placeholder:text-neutral-400 border border-transparent focus:border-neutral-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setCurrentView('search')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#242424]/80 hover:bg-[#2a2a2a] text-xs text-neutral-300 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span>Search full-length songs & artists...</span>
          </button>
        )}
      </div>

      {/* Right controls: Public API indicator & Profile */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#10b981] text-xs font-bold tracking-tight shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Slentizy • All Spotify Tracks</span>
        </div>

        {/* User profile pill */}
        <div
          id="user-profile-pill"
          className="flex items-center gap-2 p-1 pr-3 bg-white/[0.05] hover:bg-white/[0.1] rounded-full cursor-pointer transition-colors border border-white/5"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#10b981] to-[#06b6d4] flex items-center justify-center text-black font-extrabold text-xs">
            <User className="w-4 h-4 text-black" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">Music Fan</span>
        </div>
      </div>
    </header>
  );
};
