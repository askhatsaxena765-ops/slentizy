/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PlayerBar } from './components/PlayerBar';
import { NowPlayingSidebar } from './components/NowPlayingSidebar';
import { QueueDrawer } from './components/QueueDrawer';
import { LyricsModal } from './components/LyricsModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { PlaylistView } from './views/PlaylistView';
import { LikedSongsView } from './views/LikedSongsView';
import { LibraryView } from './views/LibraryView';
import { Track } from './types';
import { Home, Search, Library } from 'lucide-react';

function SlentizyApp() {
  const {
    currentView,
    setCurrentView,
    activePlaylist,
    setActivePlaylist,
    currentTrack,
  } = usePlayer();

  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setIsScrolled(scrollContainerRef.current.scrollTop > 60);
    }
  };

  // Reset scroll when view or active playlist changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setIsScrolled(false);
    }
  }, [currentView, activePlaylist?.id]);

  // Compute ambient background color based on active playlist or track
  const ambientColor = activePlaylist?.color || (currentView === 'liked' ? '#5038a0' : '#1e3a8a');

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans select-none">
      {/* Upper Area: Sidebar + Main Content + NowPlaying Sidebar */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar (Desktop / Tablet) */}
        <div className="hidden md:flex h-full">
          <Sidebar
            onCreatePlaylistOpen={() => setIsCreatePlaylistOpen(true)}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#121212] m-0 md:my-2 md:mr-2 rounded-none md:rounded-lg">
          {/* Subtle Ambient Background Tint */}
          <div
            className="absolute top-0 left-0 right-0 h-80 opacity-30 pointer-events-none transition-colors duration-700"
            style={{
              background: `radial-gradient(ellipse at top, ${ambientColor} 0%, transparent 75%)`,
            }}
          />

          {/* Sticky TopBar */}
          <TopBar scrolled={isScrolled} />

          {/* Scrollable View Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto relative z-10"
          >
            {currentView === 'playlist' && activePlaylist ? (
              <PlaylistView
                playlist={activePlaylist}
                onAddToPlaylistClick={(t) => setTrackToAddToPlaylist(t)}
              />
            ) : currentView === 'liked' ? (
              <LikedSongsView
                onAddToPlaylistClick={(t) => setTrackToAddToPlaylist(t)}
              />
            ) : currentView === 'search' ? (
              <SearchView
                onAddToPlaylistClick={(t) => setTrackToAddToPlaylist(t)}
              />
            ) : currentView === 'library' ? (
              <LibraryView
                onCreatePlaylistOpen={() => setIsCreatePlaylistOpen(true)}
              />
            ) : (
              <HomeView
                onAddToPlaylistClick={(t) => setTrackToAddToPlaylist(t)}
              />
            )}
          </div>
        </main>

        {/* Right Now Playing Panel (collapsible) */}
        <NowPlayingSidebar
          onAddToPlaylistClick={() => {
            if (currentTrack) setTrackToAddToPlaylist(currentTrack);
          }}
        />
      </div>

      {/* Mobile Bottom Navigation (Visible on mobile screens) */}
      <nav className="flex md:hidden items-center justify-around bg-[#121212] border-t border-white/10 py-2 z-30">
        <button
          onClick={() => {
            setCurrentView('home');
            setActivePlaylist(null);
          }}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            currentView === 'home' && !activePlaylist ? 'text-white' : 'text-neutral-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => {
            setCurrentView('search');
            setActivePlaylist(null);
          }}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            currentView === 'search' ? 'text-white' : 'text-neutral-400'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
        <button
          onClick={() => {
            setCurrentView('library');
            setActivePlaylist(null);
          }}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            currentView === 'library' || currentView === 'liked' ? 'text-white' : 'text-neutral-400'
          }`}
        >
          <Library className="w-5 h-5" />
          <span>Library</span>
        </button>
      </nav>

      {/* Persistent Bottom Player Bar */}
      <PlayerBar />

      {/* Drawers and Overlays */}
      <QueueDrawer />
      <LyricsModal />

      {/* Dialog Modals */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />

      <AddToPlaylistModal
        track={trackToAddToPlaylist}
        isOpen={!!trackToAddToPlaylist}
        onClose={() => setTrackToAddToPlaylist(null)}
        onOpenCreateNew={() => setIsCreatePlaylistOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <SlentizyApp />
    </PlayerProvider>
  );
}
