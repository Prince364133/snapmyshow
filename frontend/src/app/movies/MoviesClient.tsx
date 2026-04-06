"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, ChevronDown, ChevronUp, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import Image from "next/image";

const ALL_LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Punjabi", "Malayalam", "Kannada"];
const ALL_GENRES = ["Action", "Drama", "Comedy", "Thriller", "Horror", "Sci-Fi", "Romance", "Crime", "Animation", "Adventure", "Epic", "Mystery"];
const ALL_FORMATS = ["2D", "3D", "IMAX 2D", "IMAX 3D", "4DX"];

export default function MoviesClient() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  // Collapsible sidebar sections
  const [showLanguages, setShowLanguages] = useState(true);
  const [showGenres, setShowGenres] = useState(true);
  const [showFormats, setShowFormats] = useState(true);

  // Initialize filters from URL params
  useEffect(() => {
    const genre = searchParams.get("genre");
    const lang = searchParams.get("lang");
    if (genre) setSelectedGenres([genre]);
    if (lang) setSelectedLanguages([lang]);
  }, [searchParams]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data } = await api.get("/movies");
        setMovies(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Toggle helpers
  const toggleFilter = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setArr(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  // Filtered movies
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      if (selectedLanguages.length > 0 && !movie.language?.some((l: string) => selectedLanguages.includes(l))) return false;
      if (selectedGenres.length > 0 && !movie.genre?.some((g: string) => selectedGenres.includes(g))) return false;
      return true;
    });
  }, [movies, selectedLanguages, selectedGenres]);

  const activeFilterCount = selectedLanguages.length + selectedGenres.length + selectedFormats.length;

  const clearAllFilters = () => {
    setSelectedLanguages([]);
    setSelectedGenres([]);
    setSelectedFormats([]);
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl py-6">
          <h1 className="text-2xl font-bold text-[#333333] tracking-tight">Movies In Nepal</h1>
        </div>
      </div>

      {/* Language Pills Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {ALL_LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => toggleFilter(selectedLanguages, setSelectedLanguages, lang)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${
                  selectedLanguages.includes(lang)
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Grid */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex gap-8">

          {/* Left Sidebar - Filters */}
          <aside className="hidden md:block w-[260px] flex-shrink-0">
            <div className="sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-primary">Filters</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearAllFilters} className="text-xs text-primary font-medium hover:underline">
                    Clear All
                  </button>
                )}
              </div>

              {/* Languages Filter */}
              <div className="mb-6">
                <button
                  onClick={() => setShowLanguages(!showLanguages)}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <span className="text-sm font-semibold text-primary">Languages</span>
                  <div className="flex items-center gap-2">
                    {selectedLanguages.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedLanguages([]); }}
                        className="text-[11px] text-gray-400 hover:text-primary"
                      >
                        Clear
                      </button>
                    )}
                    {showLanguages ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </button>
                {showLanguages && (
                  <div className="flex flex-wrap gap-2">
                    {ALL_LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        onClick={() => toggleFilter(selectedLanguages, setSelectedLanguages, lang)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                          selectedLanguages.includes(lang)
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Genres Filter */}
              <div className="mb-6">
                <button
                  onClick={() => setShowGenres(!showGenres)}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <span className="text-sm font-semibold text-gray-700">Genres</span>
                  <div className="flex items-center gap-2">
                    {selectedGenres.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedGenres([]); }}
                        className="text-[11px] text-gray-400 hover:text-primary"
                      >
                        Clear
                      </button>
                    )}
                    {showGenres ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </button>
                {showGenres && (
                  <div className="flex flex-wrap gap-2">
                    {ALL_GENRES.map(genre => (
                      <button
                        key={genre}
                        onClick={() => toggleFilter(selectedGenres, setSelectedGenres, genre)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                          selectedGenres.includes(genre)
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Format Filter */}
              <div className="mb-8">
                <button
                  onClick={() => setShowFormats(!showFormats)}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <span className="text-sm font-semibold text-gray-700">Format</span>
                  <div className="flex items-center gap-2">
                    {selectedFormats.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedFormats([]); }}
                        className="text-[11px] text-gray-400 hover:text-primary"
                      >
                        Clear
                      </button>
                    )}
                    {showFormats ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </button>
                {showFormats && (
                  <div className="flex flex-wrap gap-2">
                    {ALL_FORMATS.map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => toggleFilter(selectedFormats, setSelectedFormats, fmt)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                          selectedFormats.includes(fmt)
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Browse by Cinemas */}
              <button className="w-full py-3 rounded-lg border-2 border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors">
                Browse by Cinemas
              </button>
            </div>
          </aside>

          {/* Right Content - Movie Grid */}
          <main className="flex-1 min-w-0">
            {/* Active filters summary */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <span className="text-xs text-gray-400 font-medium">Active:</span>
                {selectedLanguages.map(l => (
                  <span key={l} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                    {l}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter(selectedLanguages, setSelectedLanguages, l)} />
                  </span>
                ))}
                {selectedGenres.map(g => (
                  <span key={g} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                    {g}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter(selectedGenres, setSelectedGenres, g)} />
                  </span>
                ))}
                {selectedFormats.map(f => (
                  <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                    {f}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter(selectedFormats, setSelectedFormats, f)} />
                  </span>
                ))}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg bg-white" />)}
              </div>
            ) : filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {filteredMovies.map(movie => (
                  <Link key={movie._id} href={`/movies/${movie._id}`} className="group">
                    {/* Poster */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg mb-3 shadow-md group-hover:shadow-xl transition-shadow duration-300">
                      <Image
                        src={movie.posterUrl || "https://images.unsplash.com/photo-1485099667797-27c193c6681c?w=800"}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {/* Rating badge */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-2 px-3">
                        <div className="flex items-center space-x-1 text-white">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          <span className="text-sm font-bold">{movie.rating}/10</span>
                          <span className="text-[10px] text-white/50 ml-1">Votes</span>
                        </div>
                      </div>
                    </div>
                    {/* Title & Meta */}
                    <h3 className="text-sm font-bold text-[#333333] group-hover:text-primary transition-colors line-clamp-1 mb-0.5">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{movie.genre?.join("/")}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center flex flex-col items-center justify-center bg-white rounded-xl">
                <Search className="h-12 w-12 text-gray-200 mb-4" />
                <h2 className="text-xl font-black text-[#333333] uppercase tracking-tight mb-2">No Movies Found</h2>
                <p className="text-gray-400 text-sm mb-6">We couldn&apos;t find any results matching your filters.<br />Try adjusting your criteria.</p>
                <Button onClick={clearAllFilters} className="bg-primary hover:bg-rose-600 text-white font-bold uppercase tracking-widest text-xs px-8 h-12 rounded-lg">
                  Explore Popular Movies
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
