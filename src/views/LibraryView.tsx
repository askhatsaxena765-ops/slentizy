import React, { useState } from 'react';
import { Plus, Heart, Music2, FolderPlus, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Playlist } from '../types';

interface LibraryViewProps {
  onCreatePlaylistOpen: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onCreatePlaylistOpen }) => {
  const {
    playlists,
    likedTracks,
    setActivePlaylist,
    setCurrentView,
    playPlaylist,
    playTrack,
  } = usePlayer();

  const [filter, setFilter] = useState<'all' | 'custom' | 'curated'>('all');

  const filteredPlaylists = playlists.filter((p) => {
    if (filter === 'custom') return p.isCustom;
    if (filter === 'curated') return !p.isCustom;
    return true;
  });

  const handleOpenPlaylist = (playlist: Playlist) => {
    setActivePlaylist(playlist);
    setCurrentView('playlist');
  };

  return (
    <div className="flex flex-col gap-6 pb-16 px-6 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Your Library
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Playlists and liked songs saved to your session
          </p>
        </div>

        <button
          onClick={onCreatePlaylistOpen}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-full transition-transform hover:scale-105 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Create playlist</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-white text-black'
              : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
          }`}
        >
          All ({playlists.length + 1})
        </button>
        <button
          onClick={() => setFilter('custom')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            filter === 'custom'
              ? 'bg-white text-black'
              : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
          }`}
        >
          Created by you ({playlists.filter(p => p.isCustom).length})
        </button>
        <button
          onClick={() => setFilter('curated')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            filter === 'curated'
              ? 'bg-white text-black'
              : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
          }`}
        >
          Slentizy Curated ({playlists.filter(p => !p.isCustom).length})
        </button>
      </div>

      {/* Grid of Playlists */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {/* Liked Songs card (only if filter includes it) */}
        {(filter === 'all' || filter === 'custom') && (
          <div
            onClick={() => {
              setCurrentView('liked');
              setActivePlaylist(null);
            }}
            className="group p-3.5 bg-gradient-to-br from-[#450af5]/30 to-[#181818] hover:bg-[#282828] border border-[#450af5]/20 rounded-lg cursor-pointer transition-all duration-300 flex flex-col gap-3 shadow-md"
          >
            <div className="relative aspect-square w-full rounded-md overflow-hidden bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center shadow-lg">
              <Heart className="w-12 h-12 text-white fill-white" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (likedTracks.length > 0) {
                    playTrack(likedTracks[0], likedTracks);
                  }
                }}
                className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
              >
                <Play className="w-5 h-5 fill-black ml-0.5" />
              </button>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-white truncate">
                Liked Songs
              </span>
              <span className="text-xs text-neutral-400 truncate mt-0.5">
                {likedTracks.length} song{likedTracks.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        )}

        {/* User and Curated Playlists */}
        {filteredPlaylists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => handleOpenPlaylist(playlist)}
            className="group p-3.5 bg-[#181818] hover:bg-[#282828] rounded-lg cursor-pointer transition-all duration-300 flex flex-col gap-3 shadow-md border border-white/5"
          >
            <div className="relative aspect-square w-full rounded-md overflow-hidden bg-[#242424] shadow-lg">
              {playlist.coverImage ? (
                <img
                  src={playlist.coverImage}
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: playlist.color }}
                >
                  <Music2 className="w-10 h-10 text-white/80" />
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playPlaylist(playlist);
                }}
                title={`Play ${playlist.name}`}
                className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
              >
                <Play className="w-5 h-5 fill-black ml-0.5" />
              </button>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-white truncate group-hover:underline">
                {playlist.name}
              </span>
              <span className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                {playlist.isCustom ? 'By You' : 'Slentizy'} • {playlist.tracks.length} songs
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
