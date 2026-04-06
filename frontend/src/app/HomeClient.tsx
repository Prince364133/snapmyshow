"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Star, ChevronRight, ChevronLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import NearestTheatersSection from "@/components/NearestTheatersSection";

interface HomeClientProps {
  initialMovies: any[];
}

export default function HomeClient({ initialMovies }: HomeClientProps) {
  const [movies] = useState<any[]>(initialMovies);
  const [currentBanner, setCurrentBanner] = useState(0);

  // Carousel Logic
  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % Math.min(movies.length, 5));
    }, 8000); // Slower interval for readability
    return () => clearInterval(interval);
  }, [movies]);

  const activeMovie = movies[currentBanner];

  return (
    <div className="flex flex-col pb-20 bg-white">
      {/* Cinematic Hero Carousel */}
      <section className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-[#1A1A1A] group">
        <AnimatePresence mode="wait">
          {movies.length > 0 ? (
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              <Image
                src={activeMovie.bannerUrl || activeMovie.posterUrl}
                alt={activeMovie.title}
                fill
                priority={true}
                className="object-cover"
              />
              
              {/* Dynamic Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Content Overlay */}
              <div className="container mx-auto px-4 md:px-10 absolute inset-0 flex flex-col justify-center z-20">
                  <div className="max-w-2xl space-y-6">
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="flex items-center space-x-3"
                      >
                          <div className="flex items-center space-x-1 bg-primary px-2 py-1 rounded text-[10px] font-black text-white uppercase tracking-tighter">
                              <Star className="h-3 w-3 fill-white" />
                              <span>{activeMovie.rating} / 10</span>
                          </div>
                          <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{activeMovie.language?.join(' • ')}</span>
                      </motion.div>

                      <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] drop-shadow-2xl"
                      >
                          {activeMovie.title}
                      </motion.h1>

                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-white/70 text-sm md:text-lg max-w-xl line-clamp-3 font-medium leading-relaxed"
                      >
                          {activeMovie.description}
                      </motion.p>

                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="flex items-center space-x-4 pt-4"
                      >
                          <Link href={`/movies/${activeMovie._id}`}>
                            <Button size="lg" className="bg-primary hover:bg-rose-600 text-white font-black uppercase tracking-widest h-14 px-10 rounded-xl shadow-xl shadow-rose-500/20">
                                BOOK TICKETS
                            </Button>
                          </Link>
                          <Button variant="outline" size="lg" className="border-white/30 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest h-14 px-10 rounded-xl backdrop-blur-md hidden md:flex items-center space-x-2">
                              <Play className="h-4 w-4 fill-white" />
                              <span>TRAILER</span>
                          </Button>
                      </motion.div>
                  </div>
              </div>
            </motion.div>
          ) : (
            <Skeleton className="h-full w-full bg-gray-900" />
          )}
        </AnimatePresence>
        
        {/* Navigation Controlllers omitted for brevity as they are in the original file */}
      </section>

      {/* NEW: Nearest Movie Theaters (Top 5) */}
      <section className="container mx-auto px-4 md:px-10 pt-20">
          <NearestTheatersSection />
      </section>

      {/* Recommended Movies Section */}
      <section className="container mx-auto px-4 md:px-10 pt-20">
        <div className="mb-10 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                <div className="h-6 md:h-8 w-1 md:w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(248,68,100,0.3)] shrink-0" />
                <h2 className="text-xl md:text-3xl font-black tracking-tighter text-[#1F2533] uppercase leading-none truncate">Recommended Movies</h2>
            </div>
            <Link href="/movies" className="text-[10px] md:text-[11px] font-black text-primary hover:underline flex items-center tracking-widest uppercase whitespace-nowrap shrink-0">
                See All <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <motion.div 
                key={movie._id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="transition-all duration-300"
              >
                <Link href={`/movies/${movie._id}`} className="group relative block">
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-gray-100 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                      <Image
                          src={movie.posterUrl || "https://images.unsplash.com/photo-1485099667797-27c193c6681c?w=800"}
                          alt={movie.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      
                      {/* Snap Rating Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/90 backdrop-blur-md text-white px-3 flex items-center justify-between text-[10px] font-black uppercase tracking-tighter transition-all group-hover:h-10">
                          <div className="flex items-center space-x-1">
                             <Star className="h-3 w-3 fill-primary text-primary" />
                             <span>{movie.rating}/10</span>
                          </div>
                          <span className="opacity-40">{movie.genre?.[0]}</span>
                      </div>
                    </div>
                    <div className="pt-4 px-1">
                      <h3 className="font-black text-[#1F2533] text-sm uppercase tracking-tighter group-hover:text-primary transition-colors line-clamp-1">{movie.title}</h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{movie.genre?.join(' • ')}</p>
                    </div>
                </Link>
              </motion.div>
            ))
          ) : (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] w-full rounded-2xl" />)
          )}
        </div>
      </section>

      {/* Latest Releases Section (Dark Mode Style Section) */}
      <section className="mt-32 py-24 bg-[#1F2533] text-white">
          <div className="container mx-auto px-4 md:px-10">
              <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center space-x-4">
                      <div className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(248,68,100,0.5)]" />
                      <div>
                          <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">LATEST RELEASES</h2>
                          <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mt-2">Catch the newest blockbusters in theaters near you</p>
                      </div>
                  </div>
                  <Button variant="link" className="text-primary font-black uppercase tracking-widest text-xs p-0 h-auto">EXPLORE ALL</Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
                  {movies.slice(0, 5).map((movie, i) => (
                      <Link key={movie._id} href={`/movies/${movie._id}`}>
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="space-y-5 flex flex-col group cursor-pointer"
                        >
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                                 <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover group-hover:opacity-80 transition-opacity" />
                                 <div className="absolute top-4 left-0 bg-primary px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-xl">LIVE NOW</div>
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <div className="h-14 w-14 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-rose-500/40">
                                         <Play className="h-6 w-6 fill-white" />
                                     </div>
                                 </div>
                            </div>
                            <div className="text-center md:text-left">
                                <h4 className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{movie.title}</h4>
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mt-1">{movie.language?.[0]}</p>
                            </div>
                        </motion.div>
                      </Link>
                  ))}
              </div>
          </div>
      </section>
    </div>
  );
}
