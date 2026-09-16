import React, { useState } from 'react';
import { Heart, Play, Pause, Clock, Search, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from '../components/TrackRow';
import { Track } from '../types';

interface LikedSongsViewProps {
  onAddToPlaylistClick: (track: Track) => void;
}

export const LikedSongsView: React.FC<LikedSongsViewProps> = ({ onAddToPlaylistClick }) => {
  const {
    likedTracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    setCurrentView,
  } = usePlayer();

  const [filterQuery, setFilterQuery] = useState('');

  const isPlayingLiked =
    isPlaying &&
    currentTrack &&
    likedTracks.some(t => t.id === currentTrack.id);

  const filteredTracks = likedTracks.filter(
    t =>
      t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.album.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const totalSeconds = likedTracks.reduce((acc, t) => acc + (t.duration || 210), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);

  const handlePlayToggle = () => {
    if (likedTracks.length === 0) return;
    if (isPlayingLiked) {
      togglePlay();
    } else {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  return (
    <div className="flex flex-col pb-16">
      {/* 1. Purple Gradient Hero Header */}
      <div className="relative px-6 pt-12 pb-8 flex flex-col md:flex-row items-end gap-6 bg-gradient-to-b from-[#5038a0] to-[#121212] select-none">
        {/* Cover Icon */}
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-lg shadow-2xl bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center shrink-0 border border-white/10">
          <Heart className="w-24 h-24 text-white fill-white shadow" />
        </div>

        {/* Info Column */}
        <div className="flex flex-col gap-2 min-w-0 text-white flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">
            Playlist
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            Liked Songs
          </h1>

          <div className="flex items-center gap-2 text-xs font-medium text-white/90 mt-2 flex-wrap">
            <span className="font-bold">Music Fan</span>
            <span>•</span>
            <span>{likedTracks.length} song{likedTracks.length === 1 ? '' : 's'}</span>
            {likedTracks.length > 0 && (
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
          <button
            id="liked-songs-play-btn"
            onClick={handlePlayToggle}
            disabled={likedTracks.length === 0}
            title={isPlayingLiked ? 'Pause' : 'Play'}
            className="w-14 h-14 rounded-full bg-[#10b981] hover:bg-[#34d399] disabled:opacity-50 disabled:cursor-not-allowed text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            {isPlayingLiked ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black ml-1" />
            )}
          </button>
        </div>

        {/* Search within liked songs */}
        {likedTracks.length > 3 && (
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search in liked songs"
              className="w-full pl-9 pr-3 py-1.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-xs rounded-full text-white placeholder:text-neutral-400 focus:outline-none transition-colors"
            />
          </div>
        )}
      </div>

      {/* 3. Table of Liked Tracks */}
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
              <TrackRow
                key={track.id}
                track={track}
                index={i}
                playlistContext={likedTracks}
                onAddToPlaylistClick={onAddToPlaylistClick}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-neutral-400 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-neutral-400">
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">Songs you like will appear here</p>
              <p className="text-xs text-neutral-400">
                Save songs by tapping the heart icon in search or player bar.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('search')}
              className="px-6 py-2.5 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition-transform"
            >
              Find songs & artists
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
