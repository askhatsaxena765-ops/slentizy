import React from 'react';
import { Play, Heart, Clock, Music, Sparkles, Flame, User } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Playlist, Track } from '../types';
import { POPULAR_ARTISTS, PopularArtist } from '../services/musicApi';

interface HomeViewProps {
  onAddToPlaylistClick: (track: Track) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onAddToPlaylistClick }) => {
  const {
    playlists,
    setActivePlaylist,
    setCurrentView,
    setSearchQuery,
    playPlaylist,
    playTrack,
    likedTracks,
    history,
    currentTrack,
    isPlaying,
  } = usePlayer();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleOpenPlaylist = (playlist: Playlist) => {
    setActivePlaylist(playlist);
    setCurrentView('playlist');
  };

  const handleArtistClick = (artist: PopularArtist) => {
    setSearchQuery(artist.searchTerm);
    setCurrentView('search');
  };

  return (
    <div className="flex flex-col gap-10 pb-20 px-6 pt-4">
      {/* 1. Ambient Hero Greeting & Quick 6-Grid */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#10b981] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Live Music Stream
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
              {getGreeting()}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-[#10b981] border border-emerald-500/20 text-xs font-semibold">
              All Spotify Songs Available
            </span>
          </div>
        </div>

        {/* 6-tile quick access grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Liked Songs Tile */}
          <div
            onClick={() => {
              setCurrentView('liked');
              setActivePlaylist(null);
            }}
            className="group relative flex items-center bg-white/[0.04] hover:bg-white/[0.08] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border border-white/5 shadow-md hover:border-white/10"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#047857] flex items-center justify-center shrink-0 shadow-inner">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="flex flex-col px-4 min-w-0 flex-1">
              <span className="font-bold text-sm text-white truncate">
                Liked Songs
              </span>
              <span className="text-xs text-neutral-400">
                {likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (likedTracks.length > 0) {
                  playTrack(likedTracks[0], likedTracks);
                }
              }}
              title="Play Liked Songs"
              className="w-10 h-10 rounded-full bg-[#10b981] text-black flex items-center justify-center mr-4 shadow-xl opacity-0 group-hover:opacity-100 hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 fill-black ml-0.5" />
            </button>
          </div>

          {/* First 5 Curated Playlists */}
          {playlists.slice(0, 5).map((playlist) => {
            const isPlayingThis = currentTrack && playlist.tracks.some(t => t.id === currentTrack.id) && isPlaying;
            return (
              <div
                key={playlist.id}
                onClick={() => handleOpenPlaylist(playlist)}
                className="group relative flex items-center bg-white/[0.04] hover:bg-white/[0.08] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border border-white/5 shadow-md hover:border-white/10"
              >
                <div className="w-16 h-16 bg-[#222] overflow-hidden shrink-0">
                  <img
                    src={playlist.coverImage}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col px-4 min-w-0 flex-1">
                  <span className="font-bold text-sm text-white truncate">
                    {playlist.name}
                  </span>
                  <span className="text-xs text-neutral-400 truncate">
                    {playlist.tracks.length} tracks
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playPlaylist(playlist);
                  }}
                  title={`Play ${playlist.name}`}
                  className={`w-10 h-10 rounded-full bg-[#10b981] text-black flex items-center justify-center mr-4 shadow-xl transition-all ${
                    isPlayingThis ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Popular Spotify Artists (Direct click to explore discography) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Popular Artists
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Listen to the most-streamed creators on Spotify right now
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('Taylor Swift');
              setCurrentView('search');
            }}
            className="text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            Show All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {POPULAR_ARTISTS.map((artist) => (
            <div
              key={artist.id}
              onClick={() => handleArtistClick(artist)}
              className="group p-4 bg-white/[0.03] hover:bg-white/[0.07] rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-3 border border-white/5 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5"
            >
              <div className="relative aspect-square w-full max-w-[140px] rounded-full overflow-hidden shadow-lg bg-[#242424] border-2 border-transparent group-hover:border-[#10b981] transition-all">
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#10b981] text-black flex items-center justify-center shadow-xl scale-75 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 fill-black ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col min-w-0 w-full">
                <span className="font-bold text-sm text-white truncate group-hover:text-[#10b981] transition-colors">
                  {artist.name}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5 truncate">
                  {artist.monthlyListeners}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Playlists Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Featured Playlists
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Hand-picked collections with global chart hits
            </p>
          </div>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            All Spotify Tracks
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => handleOpenPlaylist(playlist)}
              className="group p-3.5 bg-white/[0.03] hover:bg-white/[0.07] rounded-xl cursor-pointer transition-all duration-300 flex flex-col gap-3 border border-white/5 shadow-md hover:border-white/10"
            >
              {/* Cover with floating emerald play button */}
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#242424] shadow-lg">
                <img
                  src={playlist.coverImage}
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playPlaylist(playlist);
                  }}
                  title={`Play ${playlist.name}`}
                  className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-[#10b981] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </button>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-white truncate group-hover:text-[#10b981] transition-colors">
                  {playlist.name}
                </span>
                <span className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                  {playlist.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Recently Played Tracks (if any) */}
      {history.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#10b981]" />
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Recently Played
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {history.slice(0, 6).map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className="group p-3.5 bg-white/[0.03] hover:bg-white/[0.07] rounded-xl cursor-pointer transition-all duration-300 flex flex-col gap-3 border border-white/5 shadow-md hover:border-white/10"
              >
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#242424] shadow-lg">
                  <img
                    src={track.artwork}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(track);
                    }}
                    title={`Play ${track.title}`}
                    className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-[#10b981] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                  >
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </button>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-white truncate group-hover:text-[#10b981] transition-colors">
                    {track.title}
                  </span>
                  <span className="text-xs text-neutral-400 truncate mt-0.5">
                    {track.artist}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
