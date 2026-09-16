import React, { useState, useEffect } from 'react';
import { Search, Loader2, Play, Heart, Disc, Sparkles, Filter, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { searchTracks } from '../services/musicApi';
import { GENRE_CATEGORIES, GenreCategory } from '../data/defaultPlaylists';
import { Track } from '../types';
import { TrackRow } from '../components/TrackRow';

interface SearchViewProps {
  onAddToPlaylistClick: (track: Track) => void;
}

type SearchFilterType = 'all' | 'songs' | 'artists' | 'albums';

const POPULAR_QUICK_TAGS = [
  'Taylor Swift',
  'Drake',
  'The Weeknd',
  'Billie Eilish',
  'Kendrick Lamar',
  'Sabrina Carpenter',
  'Coldplay',
  'Bruno Mars',
  'Travis Scott',
  'Dua Lipa',
  'Post Malone',
  'Eminem',
];

export const SearchView: React.FC<SearchViewProps> = ({ onAddToPlaylistClick }) => {
  const {
    searchQuery,
    setSearchQuery,
    playTrack,
    isLiked,
    toggleLike,
  } = usePlayer();

  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SearchFilterType>('all');

  // Debounced search query across all Spotify songs
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchTracks(searchQuery, 40, activeFilter);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeFilter]);

  const topResult = results[0];
  const liked = topResult ? isLiked(topResult.id) : false;

  const handleCategoryClick = (category: GenreCategory) => {
    setSearchQuery(category.searchTerm);
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  return (
    <div className="flex flex-col gap-8 pb-20 px-6 pt-2">
      {/* 1. Quick Filters & Popular Tags */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] rounded-full border border-white/5">
          {(['all', 'songs', 'artists', 'albums'] as SearchFilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-[#10b981] text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Popular searches quick pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {POPULAR_QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleQuickTagClick(tag)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors border ${
                searchQuery.toLowerCase() === tag.toLowerCase()
                  ? 'bg-white text-black border-white'
                  : 'bg-white/[0.03] text-neutral-300 border-white/5 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Search Status & Results */}
      {searchQuery.trim() ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
              <span className="text-sm font-medium">Searching all Spotify tracks...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              {/* Top Result + Songs Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Top Result Hero Card (2 cols) */}
                <div className="lg:col-span-2 space-y-3">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Top result
                  </h2>
<div
                      onClick={() => playTrack(topResult)}
                      className="group relative p-6 bg-white/[0.04] hover:bg-white/[0.08] rounded-2xl cursor-pointer transition-all duration-300 flex flex-col gap-4 shadow-xl border border-white/5 hover:border-emerald-500/30"
                    >
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-2xl bg-[#282828]">
                      <img
                        src={topResult.artwork}
                        alt={topResult.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-2xl font-black text-white leading-tight truncate">
                        {topResult.title}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] font-bold uppercase tracking-wider">
                          Official Song
                        </span>
                        <span className="text-sm text-neutral-300 truncate">
                          {topResult.artist}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400 mt-1 truncate">
                        {topResult.album}
                      </span>
                    </div>

                    {/* Floating Emerald Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(topResult);
                      }}
                      title={`Play ${topResult.title}`}
                      className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-[#10b981] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                    >
                      <Play className="w-6 h-6 fill-black ml-0.5" />
                    </button>
                  </div>
                </div>

{/* Top 4 Matching Songs (3 cols) */}
                <div className="lg:col-span-3 space-y-3">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Songs
                  </h2>
                  <div className="space-y-1">
                    {results.map((track, i) => (
                       <TrackRow
                         key={track.id}
                         track={track}
                         index={i}
                         onAddToPlaylistClick={onAddToPlaylistClick}
                         showAlbum={false}
                       />
                     ))}
                  </div>
                </div>
              </div>
            </>
           ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <Disc className="w-12 h-12 text-neutral-600 mb-1" />
              <h3 className="text-lg font-bold text-white">No results found for "{searchQuery}"</h3>
              <p className="text-sm text-neutral-400 max-w-sm">
                Try searching for popular artists like Taylor Swift, Drake, The Weeknd, or browse the genre cards below.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Browse All Category Tiles */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Browse All Genres
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Explore popular Spotify genres and mood playlists
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {GENRE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                style={{ backgroundColor: cat.color }}
                className="group relative h-44 rounded-xl p-4 overflow-hidden cursor-pointer shadow-lg hover:scale-[1.02] transition-transform duration-200"
              >
                <span className="text-xl font-black text-white leading-tight block max-w-[70%] drop-shadow">
                  {cat.name}
                </span>

                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute bottom-0 right-0 w-24 h-24 object-cover shadow-2xl rotate-[25deg] translate-x-4 translate-y-2 group-hover:scale-110 transition-transform duration-300 rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
