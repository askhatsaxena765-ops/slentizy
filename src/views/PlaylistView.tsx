import React, { useState } from 'react';
import {
  Play,
  Pause,
  Clock,
  Music2,
  Trash2,
  Search,
  Plus,
} from 'lucide-react';
import { Playlist, Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from '../components/TrackRow';
import { formatTime } from '../utils/formatTime';

interface PlaylistViewProps {
  playlist: Playlist;
  onAddToPlaylistClick: (track: Track) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlist,
  onAddToPlaylistClick,
}) => {
  const {
    currentTrack,
    isPlaying,
    playPlaylist,
    togglePlay,
    deletePlaylist,
    removeTrackFromPlaylist,
    setCurrentView,
  } = usePlayer();

  const [filterQuery, setFilterQuery] = useState('');

  const isCurrentPlaylistPlaying =
    isPlaying &&
    currentTrack &&
    playlist.tracks.some(t => t.id === currentTrack.id);

  const filteredTracks = playlist.tracks.filter(
    t =>
      t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.album.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const totalSeconds = playlist.tracks.reduce((acc, t) => acc + (t.duration || 210), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);

  const handlePlayToggle = () => {
    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else {
      playPlaylist(playlist, 0);
    }
  };

  return (
    <div className="flex flex-col pb-16">
      {/* 1. Dynamic Hero Header with Playlist Color Gradient */}
      <div
        className="relative px-6 pt-12 pb-8 flex flex-col md:flex-row items-end gap-6 select-none"
        style={{
          background: `linear-gradient(to bottom, ${playlist.color || '#10b981'}cc, #121212)`,
        }}
      >
        {/* Cover Art */}
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-lg shadow-2xl overflow-hidden bg-[#282828] shrink-0 border border-white/10">
          {playlist.coverImage ? (
            <img
              src={playlist.coverImage}
              alt={playlist.name}
              className="w-full h-full object-cover shadow-2xl"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: playlist.color }}
            >
              <Music2 className="w-16 h-16 text-white/80" />
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="flex flex-col gap-2 min-w-0 text-white flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">
            {playlist.isCustom ? 'Public Playlist' : 'Slentizy Curated Playlist'}
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight line-clamp-2">
            {playlist.name}
          </h1>

          <p className="text-sm text-white/80 line-clamp-2 mt-1">
            {playlist.description}
          </p>

          <div className="flex items-center gap-2 text-xs font-medium text-white/90 mt-2 flex-wrap">
            <span className="font-bold">Slentizy</span>
            <span>•</span>
            <span>{playlist.tracks.length} songs</span>
            {playlist.tracks.length > 0 && (
              <>
                <span>•</span>
                <span>about {totalMinutes} min</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Controls Action Bar */}
      <div className="px-6 py-6 bg-gradient-to-b from-[#121212]/80 to-[#121212] flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          {/* Big Emerald Play Button */}
          <button
            id="playlist-main-play-btn"
            onClick={handlePlayToggle}
            disabled={playlist.tracks.length === 0}
            title={isCurrentPlaylistPlaying ? 'Pause' : 'Play'}
            className="w-14 h-14 rounded-full bg-[#10b981] hover:bg-[#34d399] disabled:opacity-50 disabled:cursor-not-allowed text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            {isCurrentPlaylistPlaying ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black ml-1" />
            )}
          </button>

          {/* Delete if custom playlist */}
          {playlist.isCustom && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
                  deletePlaylist(playlist.id);
                }
              }}
              title="Delete playlist"
              className="text-neutral-400 hover:text-red-400 p-2 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter / Search inside playlist */}
        {playlist.tracks.length > 5 && (
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search in playlist"
              className="w-full pl-9 pr-3 py-1.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-xs rounded-full text-white placeholder:text-neutral-400 focus:outline-none transition-colors"
            />
          </div>
        )}
      </div>

      {/* 3. Table Header & Track Rows */}
      <div className="px-6 space-y-2">
        <div className="grid grid-cols-[16px_1fr_auto] md:grid-cols-[20px_4fr_3fr_auto] items-center gap-4 px-3 py-2 border-b border-white/10 text-xs font-semibold text-neutral-400 uppercase tracking-wider select-none">
          <div className="w-5 text-center">#</div>
          <div>Title</div>
          <div className="hidden md:block">Album</div>
          <div className="flex items-center justify-end gap-3 w-16">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {filteredTracks.length > 0 ? (
          <div className="space-y-1">
            {filteredTracks.map((track, i) => (
              <div key={track.id} className="relative group">
                <TrackRow
                  track={track}
                  index={i}
                  playlistContext={playlist.tracks}
                  onAddToPlaylistClick={onAddToPlaylistClick}
                />
                {playlist.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrackFromPlaylist(playlist.id, track.id);
                    }}
                    title="Remove from this playlist"
                    className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-neutral-400 space-y-3">
            <p className="text-base font-semibold text-white">This playlist is empty</p>
            <p className="text-xs text-neutral-400">
              Find songs via the public search and add them here!
            </p>
            <button
              onClick={() => setCurrentView('search')}
              className="inline-flex items-center gap-2 px-5 py-2 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition-transform"
            >
              <Search className="w-4 h-4" />
              <span>Search songs</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
