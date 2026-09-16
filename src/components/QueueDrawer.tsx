import React from 'react';
import { X, Play, Trash2, ListMusic, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';

export const QueueDrawer: React.FC = () => {
  const {
    queue,
    queueIndex,
    currentTrack,
    isPlaying,
    isQueueOpen,
    setIsQueueOpen,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = usePlayer();

  if (!isQueueOpen) return null;

  const upcomingTracks = queue.slice(queueIndex + 1);

  return (
    <div
      id="slentizy-queue-drawer"
      className="fixed inset-y-0 right-0 z-40 w-80 md:w-96 bg-[#181818]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-[#1db954]" />
          <h2 className="text-lg font-bold text-white">Play Queue</h2>
        </div>
        <button
          onClick={() => setIsQueueOpen(false)}
          className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {/* Now Playing Section */}
        {currentTrack && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 border border-white/10">
              <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                <img
                  src={currentTrack.artwork}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-[#1db954] animate-pulse" />
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-[#1db954] truncate">
                  {currentTrack.title}
                </span>
                <span className="text-xs text-neutral-400 truncate">
                  {currentTrack.artist}
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {formatTime(currentTrack.duration)}
              </span>
            </div>
          </div>
        )}

        {/* Next Up Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Next Up ({upcomingTracks.length})
            </span>
            {upcomingTracks.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs text-neutral-400 hover:text-white hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear queue</span>
              </button>
            )}
          </div>

          {upcomingTracks.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              Queue is empty. Click on song options to add more!
            </div>
          ) : (
            <div className="space-y-1">
              {upcomingTracks.map((track, i) => {
                const actualIndex = queueIndex + 1 + i;
                return (
                  <div
                    key={`${track.id}-${actualIndex}`}
                    className="group flex items-center gap-3 p-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div
                      onClick={() => playTrack(track)}
                      className="relative w-10 h-10 rounded overflow-hidden shrink-0"
                    >
                      <img
                        src={track.artwork}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                    </div>

                    <div
                      onClick={() => playTrack(track)}
                      className="flex flex-col min-w-0 flex-1"
                    >
                      <span className="text-sm font-medium text-white truncate group-hover:text-[#1db954]">
                        {track.title}
                      </span>
                      <span className="text-xs text-neutral-400 truncate">
                        {track.artist}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(actualIndex);
                      }}
                      title="Remove from queue"
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-400 p-1 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
