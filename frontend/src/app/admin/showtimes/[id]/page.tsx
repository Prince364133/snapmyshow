"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Monitor,
  Users,
  CheckCircle2,
  XCircle,
  Ticket,
  ChevronRight,
  Armchair
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { format } from "date-fns";

export default function SeatOccupancyMap() {
  const { id } = useParams();
  const router = useRouter();
  const [showtime, setShowtime] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/showtimes/${id}`);
        if (data.success) {
          setShowtime(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-12">
            <Skeleton className="h-[200px] w-full rounded-3xl mb-8" />
            <Skeleton className="h-[600px] w-full rounded-3xl" />
        </div>
    );
  }

  if (!showtime) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Session Not Found</h1>
        <Button onClick={() => router.back()} className="mt-6 rounded-xl">Go Back</Button>
      </div>
    );
  }

  // Build grid layout from screen configuration
  const rows = showtime.screenId?.rows || 10;
  const cols = showtime.screenId?.columns || 15;
  const layout = showtime.screenId?.seatLayout || [];
  
  // Create a map of booked seats for O(1) lookup
  const bookedSet = new Set(
    (showtime.bookedSeats || []).map((bs: any) => `${bs.row}-${bs.col}`)
  );

  const getSeatStatus = (r: string, c: number) => {
      if (bookedSet.has(`${r}-${c}`)) return "booked";
      
      // Check if seat exists in layout (some layouts might have gaps)
      const seatConf = layout.find((s: any) => s.row === r && s.col === c);
      if (seatConf && !seatConf.isActive) return "invisible";
      if (!seatConf && layout.length > 0) return "invisible";
      
      return "available";
  };

  const getSeatColor = (status: string) => {
      switch(status) {
          case 'booked': return "bg-rose-500 border-rose-600 text-white shadow-rose-500/50 shadow-sm cursor-not-allowed";
          case 'available': return "bg-white border-gray-200 text-gray-400 hover:border-primary hover:text-primary cursor-pointer hover:shadow-md";
          case 'invisible': return "invisible";
          default: return "bg-gray-100 border-gray-200";
      }
  };

  const rowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-32">
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-40 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-gray-100 shrink-0">
                    <ArrowLeft className="h-5 w-5 text-[#1F2533]" />
                </Button>
                <div className="flex items-center text-xs font-black uppercase tracking-widest text-gray-400">
                    <span className="text-[#1F2533]">Showtimes</span>
                    <ChevronRight className="h-3 w-3 mx-2" />
                    <span className="text-primary truncate max-w-[150px]">{showtime.movieId?.title}</span>
                    <ChevronRight className="h-3 w-3 mx-2" />
                    <span>Occupancy</span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-3 border-none rounded-full uppercase tracking-widest text-[9px] font-black">
                    Live Session
                </Badge>
            </div>
        </div>

        <div className="container mx-auto px-8 py-10 max-w-6xl">
            {/* Session Info Card */}
            <Card className="border-none shadow-sm shadow-gray-200/50 bg-[#1F2533] text-white rounded-3xl overflow-hidden mb-8 relative">
                <div className="absolute top-0 right-0 h-full w-1/2 opacity-20 pointer-events-none">
                    <Image src={showtime.movieId?.bannerUrl || showtime.movieId?.posterUrl} alt="Background" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1F2533] to-transparent" />
                </div>
                
                <CardContent className="p-8 relative z-10 flex items-center justify-between">
                    <div className="flex space-x-8 items-center">
                        <div className="h-24 w-16 rounded-xl overflow-hidden border-2 border-white/10 relative shadow-2xl">
                            <Image src={showtime.movieId?.posterUrl} alt="Poster" fill className="object-cover" />
                        </div>
                        <div>
                            <Badge className="bg-white/10 text-white border-none uppercase tracking-widest text-[8px] font-black mb-3 rounded-full hover:bg-white/20">
                                {showtime.format || '2D'} {showtime.language || 'ENG'}
                            </Badge>
                            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-4">{showtime.movieId?.title}</h1>
                            
                            <div className="flex items-center space-x-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <div className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-2 text-primary" /> {format(new Date(showtime.date), "dd MMM yyyy")}</div>
                                <div className="flex items-center"><Clock className="h-3.5 w-3.5 mr-2 text-primary" /> {showtime.startTime}</div>
                                <div className="flex items-center"><Monitor className="h-3.5 w-3.5 mr-2 text-primary" /> {showtime.screenId?.name}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-right border-l border-white/10 pl-8 shrink-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Total Occupancy</p>
                        <div className="flex items-baseline space-x-2 justify-end">
                            <span className="text-4xl font-black text-rose-500 tracking-tighter">{showtime.bookedSeats?.length || 0}</span>
                            <span className="text-xl font-bold text-gray-600">/ {showtime.screenId?.totalSeats}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Seat Map View */}
            <Card className="border border-gray-100 bg-white shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                            <Armchair className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-tight text-[#1F2533]">Auditorium Map</h3>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Live Seat Availability</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-md bg-white border border-gray-200" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Available</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-md bg-rose-500 shadow-sm shadow-rose-500/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Occupied</span>
                        </div>
                    </div>
                </div>

                <div className="p-12 overflow-x-auto custom-scrollbar">
                    <div className="min-w-[800px] flex flex-col items-center">
                        {/* Screen Indicator */}
                        <div className="mb-16 w-3/4 flex flex-col items-center">
                            <div className="h-2 w-full bg-gradient-to-r from-transparent via-[#1F2533] to-transparent rounded-full opacity-20" />
                            <div className="w-[105%] h-8 -mt-2 bg-gradient-to-b from-gray-100/50 to-transparent rounded-t-full" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 mt-4">Screen This Way</span>
                        </div>

                        {/* Grid */}
                        <div className="flex flex-col gap-3">
                            {rowLabels.map(row => (
                                <div key={row} className="flex items-center justify-center gap-3">
                                    <div className="w-8 text-right font-black text-xs text-gray-300 pr-2 uppercase">{row}</div>
                                    <div className="flex gap-2.5">
                                        {Array.from({ length: cols }, (_, i) => i + 1).map(col => {
                                            const status = getSeatStatus(row, col);
                                            return (
                                                <div 
                                                    key={`${row}-${col}`}
                                                    title={`${row}${col} - ${status.toUpperCase()}`}
                                                    className={`
                                                        h-8 w-8 rounded-lg flex flex-col items-center justify-center text-[8px] font-black border transition-all duration-300
                                                        ${getSeatColor(status)}
                                                    `}
                                                >
                                                    {status !== 'invisible' && <span>{col}</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="w-8 text-left font-black text-xs text-gray-300 pl-2 uppercase">{row}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
}
