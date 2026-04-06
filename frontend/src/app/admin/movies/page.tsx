"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Film, 
  Search, 
  Star, 
  Calendar, 
  Clock, 
  TrendingUp,
  Plus,
  Play,
  Info,
  ChevronRight,
  TrendingDown,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMovieHub() {
  const { toast } = useToast();
  const [movies, setMovies] = useState<any[]>([]);
  const [activeMovies, setActiveMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const [allMoviesRes, activeMoviesRes] = await Promise.all([
        api.get("/movies"),
        api.get("/showtimes/theater/my") // Get active showtimes to derive "Live" movies
      ]);
      setMovies(allMoviesRes.data.data);
      
      // Derive distinct active movies from showtimes
      const activeIds = new Set(activeMoviesRes.data.data.map((st: any) => st.movieId._id));
      const activeList = allMoviesRes.data.data.filter((m: any) => activeIds.has(m._id));
      setActiveMovies(activeList);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Failed to load movie library." });
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genre.some((g: string) => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return (
      <div className="bg-[#F8FAFC] min-h-screen p-8 space-y-8 max-w-7xl mx-auto">
          <div className="h-10 w-64 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="aspect-[2/3] w-full rounded-2xl" />)}
          </div>
      </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1F2533] uppercase tracking-tighter leading-none">Movie Hub</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Discover titles and deploy them to your screens</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Search Library..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-gray-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest focus-visible:ring-primary/20" 
                />
            </div>
            <Link href="/admin/showtimes?action=new">
                <Button className="bg-[#1F2533] hover:bg-black text-white font-black h-12 px-6 rounded-xl uppercase tracking-widest text-[10px] shadow-lg shadow-black/10 shrink-0 space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Quick Schedule</span>
                </Button>
            </Link>
        </div>
      </div>

      <div className="container mx-auto px-8 py-10 max-w-7xl">
        {/* Active Section */}
        {activeMovies.length > 0 && !searchQuery && (
            <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#1F2533]">Screening Now</h2>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {activeMovies.map(movie => (
                        <Card key={movie._id} className="border-none bg-white shadow-sm shadow-gray-200/50 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <CardContent className="p-0 flex h-48">
                                <div className="relative w-32 shrink-0 overflow-hidden">
                                    <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[8px] uppercase tracking-widest">ACTIVE</Badge>
                                            <div className="flex items-center text-amber-500">
                                                <Star className="h-3 w-3 fill-amber-500 mr-1" />
                                                <span className="text-[10px] font-black">{movie.rating || '8.5'}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black uppercase tracking-tighter text-[#1F2533] leading-tight line-clamp-1 group-hover:text-primary transition-colors">{movie.title}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{movie.genre.join(" • ")}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            {movie.language}
                                        </div>
                                        <Link href={`/admin/showtimes?movieId=${movie._id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-primary hover:bg-rose-50 font-black uppercase tracking-widest text-[9px] space-x-1">
                                                <span>Audits</span>
                                                <ChevronRight className="h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )}

        {/* Library Section */}
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <Film className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#1F2533]">Global Library</h2>
                </div>
                <Badge variant="outline" className="border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-[9px] px-3">{filteredMovies.length} Titles Available</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-12">
                {filteredMovies.map((movie) => (
                    <motion.div 
                        key={movie._id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group"
                    >
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 mb-4 bg-gray-100">
                            <Image 
                                src={movie.posterUrl} 
                                alt={movie.title} 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 space-y-3">
                                <Link href={`/admin/showtimes?movieId=${movie._id}&action=new`} className="w-full">
                                    <Button className="w-full bg-primary hover:bg-rose-700 text-white font-black uppercase tracking-widest text-[9px] h-11 rounded-xl shadow-lg space-x-2">
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Deploy Title</span>
                                    </Button>
                                </Link>
                                <Button variant="outline" className="w-full bg-white/10 hover:bg-white text-white hover:text-[#1F2533] border-white/20 font-black uppercase tracking-widest text-[9px] h-11 rounded-xl backdrop-blur-md">
                                    <Info className="h-3.5 w-3.5 mr-2" /> View Intel
                                </Button>
                            </div>

                            {/* Badge */}
                            <div className="absolute top-3 left-3">
                                <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 font-bold text-[8px] uppercase tracking-[0.2em] px-2 py-0.5">
                                    {movie.language}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-black uppercase tracking-tight text-[#1F2533] group-hover:text-primary transition-colors truncate">{movie.title}</h3>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate w-2/3">{movie.genre.slice(0, 2).join(" • ")}</p>
                                <div className="flex items-center text-amber-500 space-x-1">
                                    <Star className="h-2.5 w-2.5 fill-amber-500" />
                                    <span className="text-[9px] font-black">{movie.rating || '0.0'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredMovies.length === 0 && (
                <div className="py-32 text-center flex flex-col items-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                        <Search className="h-8 w-8 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-[#1F2533]">No Matches Found</h3>
                    <p className="text-gray-400 text-sm font-medium mt-2">We couldn't find any titles matching "{searchQuery}"</p>
                    <Button variant="ghost" onClick={() => setSearchQuery("")} className="mt-4 font-black uppercase tracking-widest text-[10px] text-primary">Clear Filters</Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
