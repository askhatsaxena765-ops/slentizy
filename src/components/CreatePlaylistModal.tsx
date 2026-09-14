import React, { useState } from 'react';
import { X, Music2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createPlaylist, setActivePlaylist, setCurrentView } = usePlayer();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlaylist = createPlaylist(name.trim(), description.trim());
    setActivePlaylist(newPlaylist);
    setCurrentView('playlist');
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="create-playlist-dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#282828] rounded-xl shadow-2xl p-6 flex flex-col gap-5 border border-white/10"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create playlist</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-24 h-24 rounded-lg bg-[#3e3e3e] flex items-center justify-center text-neutral-400 shadow shrink-0">
              <Music2 className="w-10 h-10" />
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Playlist name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My playlist #1"
                  autoFocus
                  required
                  className="w-full px-3 py-2 bg-[#3e3e3e] border border-transparent focus:border-white/40 rounded text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Give your playlist a description"
                  className="w-full px-3 py-2 bg-[#3e3e3e] border border-transparent focus:border-white/40 rounded text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-white hover:scale-105 transition-transform"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2 text-sm font-bold text-black bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow hover:scale-105 transition-all"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
