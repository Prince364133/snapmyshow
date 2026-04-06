"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, Search, Star, Play, ChevronRight, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import Image from "next/image";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);

  const genres = ["Action", "Drama", "Comedy", "Thriller", "Horror", "Sci-Fi", "Romance"];
  const languages = ["English", "Hindi", "Tamil", "Telugu", "Malayalam", "Kannada"];

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/movies", {
          params: {
            search: query,
            genre: selectedGenres.length > 0 ? selectedGenres[0] : undefined, // API currently takes single
            language: selectedLangs.length > 0 ? selectedLangs[0] : undefined
          }
        });
        setMovies(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [query, selectedGenres, selectedLangs]);

  const toggleFilter = (list: string[], item: string, setter: any) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([item]); // Keeping it single for now as per current API implementation
    }
  };

  return (
    <div className="bg-[#F2F5F9] min-h-screen">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#1F2533] uppercase tracking-tighter">
                Search Results {query ? `for "${query}"` : ""}
              </h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Found {movies.length} movies matching your criteria
              </p>
            </div>
            <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-white border-gray-100 text-[#1F2533] font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest">Filters Applied: {selectedGenres.length + selectedLangs.length}</Badge>
                {(selectedGenres.length > 0 || selectedLangs.length > 0) && (
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedGenres([]); setSelectedLangs([]); }} className="text-primary hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-full">
                        Clear All
                    </Button>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-10">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 space-y-8 sticky top-32">
                <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                    <h3 className="text-sm font-black text-[#1F2533] uppercase tracking-tighter">Filters</h3>
                    <SlidersHorizontal className="h-4 w-4 text-gray-300" />
                </div>

                {/* Genre Filter */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                        {genres.map(genre => (
                            <button 
                                key={genre}
                                onClick={() => toggleFilter(selectedGenres, genre, setSelectedGenres)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedGenres.includes(genre) ? 'bg-primary text-white border-primary shadow-lg shadow-rose-500/20' : 'bg-white text-gray-500 border-gray-100 hover:border-primary/30'}`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language Filter */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                        {languages.map(lang => (
                            <button 
                                key={lang}
                                onClick={() => toggleFilter(selectedLangs, lang, setSelectedLangs)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedLangs.includes(lang) ? 'bg-primary text-white border-primary shadow-lg shadow-rose-500/20' : 'bg-white text-gray-500 border-gray-100 hover:border-primary/30'}`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <Button className="w-full bg-[#1F2533] hover:bg-black text-white font-black text-[10px] uppercase tracking-widest h-12 rounded-xl">
                        Apply Filters
                    </Button>
                </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {loading ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[2/3] w-full rounded-2xl bg-white" />)}
                </div>
            ) : movies.length > 0 ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                    {movies.map(movie => (
                        <Link key={movie._id} href={`/movies/${movie._id}`} className="group">
                            <Card className="border-none bg-transparent shadow-none">
                                <div className="relative aspect-[2/3] rounded-3xl overflow-hidden mb-4 shadow-xl shadow-black/5 group-hover:shadow-rose-500/10 transition-all duration-500">
                                    <Image 
                                        src={movie.posterUrl} 
                                        alt={movie.title} 
                                        fill 
                                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                                        sizes="(max-width: 640px) 100vw, 250px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                        <div className="flex items-center space-x-2 text-white mb-2">
                                            <Play className="h-4 w-4 fill-primary text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Book Now</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-[#1F2533]/80 backdrop-blur-md text-white border-none text-[9px] font-black uppercase px-2 py-0.5 rounded-sm">2D</Badge>
                                    </div>
                                </div>
                                <CardContent className="p-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-black text-[#1F2533] uppercase tracking-tighter text-sm leading-tight group-hover:text-primary transition-colors truncate">{movie.title}</h3>
                                        <div className="flex items-center text-yellow-500 text-[10px] font-black ml-2">
                                            <Star className="h-3.5 w-3.5 mr-1 fill-yellow-500" />
                                            {movie.rating}/10
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{movie.genre.join(' • ')}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[40px] p-20 text-center flex flex-col items-center justify-center space-y-6 shadow-sm border border-gray-50 mt-10">
                    <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                        <Search className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-[#1F2533] uppercase tracking-tighter">No Movies Found</h2>
                        <p className="text-gray-400 text-sm font-medium max-w-sm mx-auto">We couldn't find any results matching your search or filters. Try adjusting your criteria.</p>
                    </div>
                    <Button onClick={() => { setSelectedGenres([]); setSelectedLangs([]); window.location.href='/'; }} className="bg-primary hover:bg-rose-700 text-white font-black h-14 px-10 rounded-2xl shadow-lg shadow-rose-500/20 text-xs uppercase tracking-widest mt-4">
                        Explore Popular Movies
                    </Button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container py-20 px-4"><Skeleton className="h-[600px] w-full rounded-[40px] bg-white" /></div>}>
            <SearchContent />
        </Suspense>
    );
}
