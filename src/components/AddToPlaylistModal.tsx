import React, { useState } from 'react';
import { X, Check, Plus, Music2 } from 'lucide-react';
import { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface AddToPlaylistModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateNew: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  track,
  isOpen,
  onClose,
  onOpenCreateNew,
}) => {
  const { playlists, addTrackToPlaylist } = usePlayer();
  const [successId, setSuccessId] = useState<string | null>(null);

  if (!isOpen || !track) return null;

  const handleSelectPlaylist = (playlistId: string) => {
    addTrackToPlaylist(playlistId, track);
    setSuccessId(playlistId);
    setTimeout(() => {
      setSuccessId(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#282828] rounded-xl shadow-2xl p-5 flex flex-col gap-4 border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-white">Add to playlist</h2>
            <p className="text-xs text-neutral-400 truncate max-w-[240px]">
              {track.title} • {track.artist}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Playlist Action */}
        <button
          onClick={() => {
            onClose();
            onOpenCreateNew();
          }}
          className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
        >
          <div className="w-9 h-9 rounded bg-[#1db954] text-black flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span>New playlist</span>
        </button>

        {/* Playlists List */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {playlists.map((playlist) => {
            const isAdded = playlist.tracks.some(t => t.id === track.id);
            const isSuccess = successId === playlist.id;

            return (
              <button
                key={playlist.id}
                onClick={() => handleSelectPlaylist(playlist.id)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 text-left transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded overflow-hidden bg-black/30 shrink-0 flex items-center justify-center">
                    {playlist.coverImage ? (
                      <img
                        src={playlist.coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Music2 className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-white truncate">
                      {playlist.name}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {playlist.tracks.length} songs
                    </span>
                  </div>
                </div>

                {isSuccess || isAdded ? (
                  <Check className="w-5 h-5 text-[#1db954]" />
                ) : (
                  <Plus className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
