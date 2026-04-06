"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Heart, Info, Play, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ShowtimesClientProps {
  movie: any;
  initialShowtimes: any[];
}

// Generate some mock theatres to make it look exactly like the screenshot
const MOCK_THEATRES = [
  {
      id: "t1",
      name: "Wave Cinemas, Gurugram",
      distance: "5.3 km away",
      features: "Allows cancellation",
      logo: "Wave Cinemas",
      logoImg: "/wave.png", // fallback text
      showtimes: [
          { _id: "s1", startTime: "10:30 PM", format: "LASER", availability: "AVAILABLE" }
      ]
  },
  {
      id: "t2",
      name: "Cinepolis Airia Mall, Sohna Road, Gurugram",
      distance: "6.9 km away",
      features: "Non-cancellable",
      logo: "cinépolis",
      showtimes: [
          { _id: "s2", startTime: "11:10 PM", format: "DOLBY SLS", availability: "AVAILABLE" }
      ]
  },
  {
      id: "t3",
      name: "HDFC Millennia PVR MGF, Gurugram",
      distance: "8.8 km away",
      features: "Non-cancellable",
      logo: "PVR",
      isBlackLogo: true,
      showtimes: [
          { _id: "s3", startTime: "11:00 PM", format: "CC", availability: "AVAILABLE" },
          { _id: "s4", startTime: "11:40 PM", format: "4DX-2D", availability: "AVAILABLE" }
      ]
  },
  {
      id: "t4",
      name: "Pepsi PVR Ambience, Ambience Mall, Gurugram",
      distance: "10.8 km away",
      features: "Non-cancellable",
      logo: "PVR",
      isBlackLogo: true,
      showtimes: [
          { _id: "s5", startTime: "11:15 PM", format: "IMAX 2D", availability: "FILLING FAST", subFormat: "IMAX", price: "₹1900" }
      ]
  }
];

export default function ShowtimesClient({ movie, initialShowtimes }: ShowtimesClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dates = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const monthShort = selectedDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  // For screenshot cloning, I will just render MOCK_THEATRES if there are no database showtimes,
  // or wrap DB showtimes in this format. I'll use MOCK_THEATRES primarily for perfect visual match.
  const isDemoMode = !initialShowtimes || initialShowtimes.length === 0;
  const displayTheatres = !isDemoMode
    ? Object.entries(initialShowtimes.reduce((acc: any, st: any) => {
          const tId = st.theaterId._id;
          if (!acc[tId]) {
              acc[tId] = {
                  id: tId,
                  name: st.theaterId.name,
                  distance: "5.3 km away",
                  features: "Non-cancellable",
                  logo: st.theaterId.name.substring(0, 3).toUpperCase(),
                  isBlackLogo: st.theaterId.name.toUpperCase().includes('PVR'),
                  showtimes: []
              };
          }
          acc[tId].showtimes.push({
              _id: st._id,
              startTime: st.startTime,
              format: st.format || "2D",
              availability: st.bookedSeats?.length > 50 ? "FILLING FAST" : "AVAILABLE"
          });
          return acc;
      }, {})).map(([_, t]) => t)
    : MOCK_THEATRES;

  return (
    <div className="bg-white min-h-screen">
      {/* Movie Info Sub-Header */}
      <div className="bg-white py-12 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center space-x-12">
                <div className="relative h-40 w-28 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 shrink-0">
                    <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                        <div className="h-10 w-10 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg cursor-pointer hover:scale-110 transition-transform">
                           <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                        </div>
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-5xl lg:text-7xl font-black text-[#1F2533] uppercase tracking-tighter leading-none drop-shadow-sm">{movie.title}</h1>
                        {isDemoMode && (
                            <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200 animate-pulse">Demo Mode</span>
                        )}
                    </div>
                    <div className="flex items-center space-x-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="bg-[#1F2533] text-white px-3 py-1 rounded-lg">UA13+</span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center space-x-2">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg">English</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>{Math.floor(movie.duration / 60)}H {movie.duration % 60}M</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Date Selector Layer */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center py-6">
                <div className="flex items-center gap-4 overflow-x-auto scrollbar-none pb-2">
                    {dates.map((date, i) => {
                        const isActive = date.getDate() === selectedDate.getDate();
                        return (
                            <div 
                                key={i} 
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[80px] h-[90px] transition-all cursor-pointer rounded-3xl border-2",
                                    isActive ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105" : "border-transparent text-gray-400 hover:bg-gray-50 hover:border-gray-200"
                                )}
                            >
                                <span className={cn("text-3xl font-black leading-none", isActive ? "text-white" : "text-[#1F2533]")}>
                                    {date.getDate()}
                                </span>
                                <span className={cn("text-[10px] font-black uppercase mt-2 tracking-widest", isActive ? "text-white/80" : "text-gray-400")}>
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>

      {/* Filters & Navigation */}
      <div className="bg-white py-6 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl flex items-center flex-wrap gap-4">
            <Button variant="outline" className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-gray-100 hover:bg-gray-50 text-[#1F2533] px-8 shadow-sm">
               <SlidersHorizontal className="h-4 w-4 mr-3" /> Filters
            </Button>
            {["IMAX 2D", "4DX-2D", "Recliners", "Premium"].map(filter => (
               <Button key={filter} variant="outline" className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-gray-100 hover:bg-gray-50 text-gray-400 px-8 shadow-sm">
                   {filter}
               </Button>
            ))}
            
            <div className="flex-1" />
            
            <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span className="flex items-center"><span className="h-2 w-2 bg-emerald-500 rounded-full mr-2 shadow-sm shadow-emerald-500/50" /> Available</span>
                <span className="flex items-center"><span className="h-2 w-2 bg-amber-500 rounded-full mr-2 shadow-sm shadow-amber-500/50" /> Filling Fast</span>
                <span className="flex items-center"><span className="h-2 w-2 bg-rose-500 rounded-full mr-2 shadow-sm shadow-rose-500/50" /> Full</span>
            </div>
        </div>
      </div>

      {/* Theatre List Area */}
      <main className="container mx-auto px-4 max-w-5xl pt-12 pb-32 space-y-8">
        <AnimatePresence mode="wait">
          {(displayTheatres as any[]).map((theater: any, index: number) => (
              <motion.div 
                key={theater.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
                className="bg-white rounded-[2.5rem] border border-gray-100 p-10 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] transition-all group relative overflow-hidden"
              >
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex flex-col lg:flex-row lg:items-center gap-12">
                      {/* Left: Theatre Info */}
                      <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                           <div className="flex items-center space-x-6 group cursor-pointer">
                                <div className={cn(
                                    "h-16 w-16 flex items-center justify-center rounded-3xl border-2 transition-all group-hover:scale-105",
                                    theater.isBlackLogo ? "bg-[#1F2533] border-[#1F2533]" : "border-gray-100 bg-white"
                                )}>
                                    <span className={cn(
                                        "text-xs font-black uppercase tracking-tighter",
                                        theater.isBlackLogo ? "text-primary" : "text-[#1F2533]"
                                    )}>{theater.logo}</span>
                                </div>
                                <div className="flex-1">
                                     <h3 className="font-black text-[#1F2533] text-2xl uppercase tracking-tighter group-hover:text-primary transition-colors leading-tight">{theater.name}</h3>
                                     <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2 space-x-3">
                                         <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md"><Info className="h-3 w-3 mr-1.5" /> {theater.distance}</span>
                                         <span className="text-emerald-500 font-black uppercase tracking-tighter shadow-sm bg-emerald-50 px-2 py-1 rounded-md">{theater.features}</span>
                                     </div>
                                </div>
                           </div>
                      </div>

                      {/* Right: Showtimes Row */}
                      <div className="flex-1 flex flex-wrap gap-4 items-center justify-start lg:justify-end">
                          {theater.showtimes.map((st: any) => (
                              <Link key={st._id} href={`/movies/${movie._id}/booking/${st._id}`}>
                                  <div className="relative group/btn scale-100 hover:scale-105 transition-transform active:scale-95">
                                      <div className="px-8 py-4 border-2 border-gray-100 hover:border-primary hover:bg-primary/5 transition-all rounded-3xl cursor-pointer min-w-[140px] text-center shadow-sm">
                                          <span className={cn(
                                              "text-lg font-black tracking-tighter block",
                                              st.availability === "FILLING FAST" ? "text-amber-500" : "text-[#1F2533]" 
                                          )}>{st.startTime}</span>
                                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1 block opacity-60">
                                              {st.format}
                                          </span>
                                      </div>
                                  </div>
                              </Link>
                          ))}
                          <div className="w-px h-10 bg-gray-100 mx-2 hidden lg:block" />
                          <Button variant="ghost" className="h-14 w-14 rounded-3xl text-gray-300 hover:text-primary hover:bg-primary/5 shadow-inner">
                              <Heart className="h-6 w-6" />
                          </Button>
                      </div>
                  </div>
              </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </div>
  );
}
