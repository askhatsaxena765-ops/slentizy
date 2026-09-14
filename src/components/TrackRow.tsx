import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Heart, MoreHorizontal, ListPlus, FolderPlus, Radio, Check } from 'lucide-react';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';

interface TrackRowProps {
  track: Track;
  index: number;
  playlistContext?: Track[];
  onAddToPlaylistClick?: (track: Track) => void;
  showAlbum?: boolean;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  playlistContext,
  onAddToPlaylistClick,
  showAlbum = true,
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLiked,
    toggleLike,
    addToQueue,
    setCurrentView,
    setSearchQuery,
  } = usePlayer();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCurrent = currentTrack?.id === track.id;
  const liked = isLiked(track.id);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, playlistContext);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${track.title} - ${track.artist}`);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsMenuOpen(false);
    }, 1200);
  };

  const handleSearchArtist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setSearchQuery(track.artist);
    setCurrentView('search');
  };

  return (
    <div
      id={`track-row-${track.id}`}
      onClick={handleRowClick}
      className={`group grid grid-cols-[16px_1fr_auto] md:grid-cols-[20px_4fr_3fr_auto] items-center gap-4 px-3 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-sm select-none ${
        isCurrent ? 'bg-white/10' : ''
      }`}
    >
      {/* 1. Track Number or Play/Pause Button / Equalizer */}
      <div className="flex items-center justify-center text-neutral-400 w-5">
        {isCurrent && isPlaying ? (
          <div className="flex items-end justify-center gap-0.5 h-3.5 w-3.5 group-hover:hidden">
            <span className="w-0.5 bg-[#10b981] h-full animate-[bounce_0.8s_infinite]" />
            <span className="w-0.5 bg-[#10b981] h-2/3 animate-[bounce_1.1s_infinite]" />
            <span className="w-0.5 bg-[#10b981] h-4/5 animate-[bounce_0.9s_infinite]" />
          </div>
        ) : (
          <span className={`text-xs ${isCurrent ? 'text-[#10b981] font-bold' : ''} group-hover:hidden`}>
            {index + 1}
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick();
          }}
          className="hidden group-hover:flex items-center justify-center text-white"
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 fill-white text-white" />
          ) : (
            <Play className="w-4 h-4 fill-white text-white" />
          )}
        </button>
      </div>

      {/* 2. Title & Artist Info */}
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={track.artwork}
          alt={track.title}
          className="w-10 h-10 rounded object-cover shrink-0 shadow bg-[#282828]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col min-w-0">
          <span
            className={`font-medium truncate ${
              isCurrent ? 'text-[#10b981]' : 'text-white group-hover:text-white'
            }`}
          >
            {track.title}
          </span>
          <span className="text-xs text-neutral-400 truncate hover:underline hover:text-white">
            {track.artist}
          </span>
        </div>
      </div>

      {/* 3. Album Column (Tablet/Desktop) */}
      {showAlbum && (
        <div className="hidden md:block min-w-0">
          <span className="text-xs text-neutral-400 truncate block hover:text-white">
            {track.album}
          </span>
        </div>
      )}

      {/* 4. Action Buttons & Duration */}
      <div className="flex items-center gap-3 justify-end text-neutral-400">
        {/* Heart / Like button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track);
          }}
          title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
          className={`p-1 hover:text-white transition-colors ${
            liked ? 'text-[#10b981]' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-[#10b981]' : ''}`} />
        </button>

        {/* Track Duration */}
        <span className="text-xs font-mono w-10 text-right">
          {formatTime(track.duration)}
        </span>

        {/* More Options Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(prev => !prev);
            }}
            title="More options"
            className="p-1 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 w-48 bg-[#282828] border border-white/10 rounded-md shadow-2xl py-1.5 z-50 text-xs text-neutral-200"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToQueue(track);
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <ListPlus className="w-4 h-4 text-neutral-400" />
                <span>Add to queue</span>
              </button>

              {onAddToPlaylistClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPlaylistClick(track);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <FolderPlus className="w-4 h-4 text-neutral-400" />
                  <span>Add to playlist</span>
                </button>
              )}

              <button
                onClick={handleSearchArtist}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Radio className="w-4 h-4 text-neutral-400" />
                <span>Go to artist</span>
              </button>

              <div className="my-1 border-t border-white/10" />

              <button
                onClick={handleCopy}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#1db954]" />
                    <span className="text-[#1db954]">Copied!</span>
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 text-center">📋</span>
                    <span>Copy song info</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
