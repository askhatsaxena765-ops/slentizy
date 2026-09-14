import React, { useState } from 'react';
import {
  Home,
  Search,
  Library,
  Plus,
  Heart,
  Music2,
  Volume2,
  ListMusic,
  Trash2,
  Compass,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { SlentizyLogo } from './SlentizyLogo';

interface SidebarProps {
  onCreatePlaylistOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCreatePlaylistOpen }) => {
  const {
    currentView,
    setCurrentView,
    playlists,
    activePlaylist,
    setActivePlaylist,
    likedTracks,
    currentTrack,
    isPlaying,
    deletePlaylist,
  } = usePlayer();

  const [libraryFilter, setLibraryFilter] = useState<'all' | 'custom'>('all');

  const filteredPlaylists = libraryFilter === 'custom'
    ? playlists.filter(p => p.isCustom)
    : playlists;

  return (
    <aside
      id="slentizy-sidebar"
      className="w-64 md:w-72 h-full flex flex-col gap-2 p-2 select-none shrink-0"
    >
      {/* Top Nav Card */}
      <div className="bg-[#121212]/90 backdrop-blur-md rounded-xl p-4 flex flex-col gap-4 border border-white/5 shadow-xl">
        {/* Brand Logo */}
        <div
          id="slentizy-logo"
          onClick={() => {
            setCurrentView('home');
            setActivePlaylist(null);
          }}
          className="cursor-pointer px-1 py-1 group"
        >
          <SlentizyLogo size="md" />
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1">
          <button
            id="nav-home-btn"
            onClick={() => {
              setCurrentView('home');
              setActivePlaylist(null);
            }}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-semibold text-sm transition-colors ${
              currentView === 'home' && !activePlaylist
                ? 'text-white bg-[#282828]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            id="nav-search-btn"
            onClick={() => {
              setCurrentView('search');
              setActivePlaylist(null);
            }}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-semibold text-sm transition-colors ${
              currentView === 'search' && !activePlaylist
                ? 'text-white bg-[#282828]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        </nav>
      </div>

      {/* Library Card */}
      <div className="bg-[#121212] rounded-lg p-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-2 py-2">
          <button
            id="nav-library-btn"
            onClick={() => {
              setCurrentView('library');
              setActivePlaylist(null);
            }}
            className="flex items-center gap-2.5 text-neutral-400 hover:text-white font-bold text-sm transition-colors"
          >
            <Library className="w-5 h-5" />
            <span>Your Library</span>
          </button>

          <button
            id="create-playlist-btn"
            onClick={onCreatePlaylistOpen}
            title="Create playlist"
            className="text-neutral-400 hover:text-white hover:bg-[#282828] p-1.5 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 px-2 pt-2 pb-3">
          <button
            onClick={() => setLibraryFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              libraryFilter === 'all'
                ? 'bg-white text-black'
                : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setLibraryFilter('custom')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              libraryFilter === 'custom'
                ? 'bg-white text-black'
                : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            By You
          </button>
        </div>

        {/* Playlists & Liked Songs Scroll List */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {/* Liked Songs Entry */}
          <div
            id="playlist-liked-item"
            onClick={() => {
              setCurrentView('liked');
              setActivePlaylist(null);
            }}
            className={`group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
              currentView === 'liked' ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="w-12 h-12 rounded bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center shrink-0 shadow">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`text-sm font-medium truncate ${
                currentView === 'liked' ? 'text-[#1db954]' : 'text-white'
              }`}>
                Liked Songs
              </span>
              <span className="text-xs text-neutral-400 truncate flex items-center gap-1">
                Playlist • {likedTracks.length} song{likedTracks.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* User & Curated Playlists */}
          {filteredPlaylists.map((playlist) => {
            const isActive = activePlaylist?.id === playlist.id;
            const isPlayingThis =
              isPlaying &&
              currentTrack &&
              playlist.tracks.some(t => t.id === currentTrack.id);

            return (
              <div
                key={playlist.id}
                id={`sidebar-playlist-${playlist.id}`}
                onClick={() => {
                  setActivePlaylist(playlist);
                  setCurrentView('playlist');
                }}
                className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                  isActive ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded bg-[#282828] overflow-hidden shrink-0">
                    {playlist.coverImage ? (
                      <img
                        src={playlist.coverImage}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: playlist.color }}
                      >
                        <Music2 className="w-5 h-5 text-white/80" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className={`text-sm font-medium truncate ${
                        isActive || isPlayingThis ? 'text-[#1db954]' : 'text-white'
                      }`}
                    >
                      {playlist.name}
                    </span>
                    <span className="text-xs text-neutral-400 truncate">
                      {playlist.isCustom ? 'Playlist • You' : 'Slentizy Curated'}
                    </span>
                  </div>
                </div>

                {/* Right badges / controls */}
                <div className="flex items-center gap-1">
                  {isPlayingThis && (
                    <Volume2 className="w-4 h-4 text-[#1db954] animate-pulse shrink-0" />
                  )}
                  {playlist.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${playlist.name}"?`)) {
                          deletePlaylist(playlist.id);
                        }
                      }}
                      title="Delete playlist"
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-400 p-1 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
