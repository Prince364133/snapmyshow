"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    MapPin, Phone, Mail, Clock, Info, ChevronLeft, Navigation, Star, Ticket, Play,
    Wind, Zap, Car, Smartphone, Globe, ShieldCheck, HeartPulse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const LocationMap = dynamic<{ center: { lat: number; lng: number }; onMarkerDrag?: (lat: number, lng: number) => void }>(
  () => import('@/components/LocationMap'), 
  { ssr: false }
);

export default function TheaterDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [theater, setTheater] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(new Date().setHours(0,0,0,0)));

    // Generate next 4 days for the selector
    const availableDates = Array.from({ length: 4 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        d.setHours(0, 0, 0, 0);
        return d;
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await api.get(`/theaters/${id}`);
                if (data.success) {
                    setTheater(data.data);
                    setError(null);
                }
            } catch (err: any) {
                console.error(err);
                if (err.response?.status === 403) {
                    setError("This theater is currently under review and its showtimes are not yet available to the public.");
                } else {
                    setError("Unable to load theater details at this time.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    useEffect(() => {
        if (!theater?.images || theater.images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % theater.images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [theater]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 space-y-10">
                <Skeleton className="h-[400px] w-full rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="h-20 w-20 bg-rose-600/20 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="h-10 w-10 text-rose-500" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Theater In Review</h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm max-w-lg mb-8 leading-relaxed">
                    {error}
                </p>
                <Button onClick={() => router.push('/')} className="bg-primary hover:bg-rose-700 h-14 px-8 rounded-full font-black uppercase tracking-widest text-xs">
                    Return to Home
                </Button>
            </div>
        );
    }

    if (!theater) return <div className="text-center py-20 font-black uppercase text-gray-400">Theater not found</div>;

    const lat = theater.location?.coordinates[1] || 28.6139;
    const lng = theater.location?.coordinates[0] || 77.2090;

    return (
        <div className="min-h-screen bg-[#050505] pb-32 text-white">
            {/* Immersive Auto-Scrolling Hero */}
            <div className="relative h-[450px] md:h-[600px] w-full bg-[#050505] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <Image 
                            src={(theater.images && theater.images.length > 0) ? theater.images[currentImageIndex] : (theater.coverImageUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200")} 
                            alt={theater.name}
                            fill
                            priority
                            className="object-cover opacity-60"
                        />
                    </motion.div>
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                
                <div className="absolute bottom-20 container mx-auto px-4 md:px-10 z-10">
                    <motion.div 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="max-w-4xl space-y-6"
                    >
                        <Button 
                            onClick={() => router.back()}
                            variant="outline" 
                            className="border-white/20 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white hover:text-black font-black uppercase text-[10px] tracking-widest h-10 px-6 transition-all"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" /> Back to List
                        </Button>

                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="border border-white/20 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-rose-500 uppercase tracking-tighter flex items-center shadow-2xl">
                                    <Star className="h-3 w-3 fill-rose-500 mr-2" /> Premium Venue
                                </div>
                                <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]" style={{ textShadow: '0 2px 10px rgba(0,0,0,1)' }}>
                                    {theater.city} • Open {theater.openingTime || "9:00 AM"} - {theater.closingTime || "11:00 PM"}
                                </span>
                            </div>

                            <div className="relative inline-block mt-4">
                                <h1 
                                    className="text-6xl md:text-[8rem] font-black text-white uppercase tracking-tighter leading-[0.85] drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]"
                                    style={{ textShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.4)' }}
                                >
                                    {theater.name}
                                </h1>
                            </div>
                            
                            {theater.address && (
                                <div className="flex items-center text-white text-[12px] font-black uppercase tracking-[0.25em] pt-8" style={{ textShadow: '0 4px 15px rgba(0,0,0,1)' }}>
                                    <div className="h-10 w-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center mr-4 shadow-2xl">
                                        <MapPin className="h-4 w-4 text-rose-500" />
                                    </div>
                                    <span>{theater.address}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Slider Indicators */}
                {theater.images?.length > 1 && (
                    <div className="absolute bottom-10 right-10 flex space-x-2 z-10">
                        {theater.images.map((_: any, i: number) => (
                            <div 
                                key={i} 
                                className={`h-1.5 transition-all duration-500 rounded-full ${i === currentImageIndex ? 'w-8 bg-primary' : 'w-2 bg-white/30'}`} 
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="container mx-auto px-4 md:px-10 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content: Info & Movies */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Compact Info Section */}
                        <section className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl">
                            <div className="space-y-3">
                                <h1 className="text-2xl font-black uppercase text-white tracking-tighter">Venue Overview</h1>
                                <p className="text-sm font-medium text-white/50 leading-relaxed max-w-4xl">
                                    {theater.description || "Welcome to our premium cinema complex featuring cutting-edge projection and comfort."}
                                </p>
                            </div>

                            {/* Compact Features Row */}
                            <div className="flex flex-wrap gap-3">
                                {(theater.features || ["AC", "Dolby Atmos", "4K Projection", "Parking"]).map((feature: string, i: number) => {
                                    const icons: any = {
                                        "AC": Wind,
                                        "4K Laser Projection": Play,
                                        "Dolby Atmos": Zap,
                                        "Recliner Seats": HeartPulse,
                                        "Valet Parking": Car,
                                        "Parking": Car,
                                        "M-Ticket": Smartphone
                                    };
                                    const Icon = icons[feature] || ShieldCheck;
                                    return (
                                        <div key={i} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 flex items-center space-x-2 transition-all hover:bg-white/10">
                                            <Icon className="h-3.5 w-3.5 text-rose-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/80">{feature}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-10 gap-y-4 pt-6 border-t border-white/5">
                                <div className="space-y-1">
                                    <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest">Connect</h4>
                                    <p className="text-[10px] font-black text-rose-500 flex items-center">
                                        <Phone className="h-3 w-3 mr-2" /> {theater.phoneNumber || "+91 99999 00000"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest">Official Site</h4>
                                    <a href={theater.website || "#"} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-white/70 flex items-center hover:text-rose-500 transition-colors">
                                        <Globe className="h-3 w-3 mr-2 text-rose-500" /> {theater.website ? theater.website.replace('https://', '') : "snapmyshow.io"}
                                    </a>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest">Open From</h4>
                                    <p className="text-[10px] font-black text-white/70 flex items-center uppercase tracking-tighter">
                                        <Clock className="h-3 w-3 mr-2 text-rose-500" /> {theater.openingTime || "09:00 AM"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Date Selector & Movies Listing Section */}
                        <section className="space-y-10 pt-4">
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/5">
                                            <Ticket className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Now Playing</h2>
                                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Select your preferred screening plan</p>
                                        </div>
                                    </div>

                                    {/* Premium Date Selector (Dark) */}
                                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {availableDates.map((date, idx) => {
                                            const isSelected = date.getTime() === selectedDate.getTime();
                                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                            const dayDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`shrink-0 px-5 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[80px] transition-all duration-300 border ${isSelected ? 'bg-rose-500 border-rose-500 text-white shadow-2xl scale-105' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:bg-white/10'}`}
                                                >
                                                    <span className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${isSelected ? 'text-white' : 'text-white/20'}`}>{idx === 0 ? "TODAY" : dayName}</span>
                                                    <span className="text-[11px] font-black uppercase tracking-tighter">{dayDate}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-16">
                                    {(() => {
                                        const filteredShowtimes = theater.showtimes?.filter((s: any) => 
                                            new Date(s.date).setHours(0,0,0,0) === selectedDate.getTime()
                                        ) || [];

                                        // Group by Movie ID
                                        const groupedByMovie = filteredShowtimes.reduce((acc: any, show: any) => {
                                            const movieId = show.movieId?._id;
                                            if (!acc[movieId]) {
                                                acc[movieId] = { movie: show.movieId, shows: [] };
                                            }
                                            acc[movieId].shows.push(show);
                                            return acc;
                                        }, {});

                                        const movieEntries = Object.values(groupedByMovie);

                                        if (movieEntries.length === 0) {
                                            return (
                                                <div className="py-24 text-center rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center space-y-6">
                                                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center">
                                                        <Clock className="h-8 w-8 text-white/20" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black uppercase tracking-tighter text-white">No Screenings Found</h3>
                                                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-2">Try selecting another date for current listings</p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return movieEntries.map((entry: any, mIdx: number) => (
                                            <motion.div 
                                                key={entry.movie?._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: mIdx * 0.1 }}
                                                className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl hover:bg-white/[0.07] transition-all duration-500 overflow-hidden relative group"
                                            >
                                                <div className="flex flex-col md:flex-row gap-8">
                                                    {/* Poster with High Contrast Rating */}
                                                    <div className="relative w-full md:w-48 aspect-[3/4.5] shrink-0 rounded-[2rem] overflow-hidden shadow-2xl">
                                                        <Image 
                                                            src={entry.movie?.posterUrl || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800"} 
                                                            alt={entry.movie?.title} 
                                                            fill 
                                                            className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                                                        />
                                                        <div className="absolute top-4 left-0 bg-rose-500 px-3 py-1 text-[9px] font-black uppercase text-white tracking-widest shadow-2xl flex items-center">
                                                            <Star className="h-3 w-3 fill-white mr-1.5" /> {entry.movie?.rating || "8.5"}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 space-y-6">
                                                        <div className="space-y-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                {(entry.movie?.genre || ["Action", "Drama"]).map((g: string, i: number) => (
                                                                    <span key={i} className="px-3 py-0.5 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest text-white/40 border border-white/5">{g}</span>
                                                                ))}
                                                            </div>
                                                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter group-hover:text-rose-500 transition-colors leading-none">{entry.movie?.title}</h3>
                                                            <div className="flex items-center space-x-6 text-[9px] font-black text-white/30 uppercase tracking-widest">
                                                                <span className="flex items-center"><Clock className="h-3 w-3 mr-2 text-rose-500" /> {entry.movie?.duration || 145} MINS</span>
                                                                <span className="flex items-center"><Globe className="h-3 w-3 mr-2 text-rose-500" /> {entry.movie?.language?.join(' • ') || "HINDI / ENGLISH"}</span>
                                                            </div>
                                                        </div>

                                                        {/* Compact Showtimes Row */}
                                                        <div className="space-y-5 pt-2">
                                                            <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Active Screenings</h4>
                                                            <div className="flex flex-wrap gap-3">
                                                                {entry.shows.map((show: any, sIdx: number) => (
                                                                    <Link 
                                                                        key={sIdx}
                                                                        href={`/movies/${String(entry.movie?._id)}/booking/${String(show._id)}`}
                                                                        className="group/show"
                                                                    >
                                                                        <div className="bg-white/5 border border-white/5 hover:border-rose-500/50 hover:bg-rose-500/5 px-4 py-3 rounded-2xl transition-all duration-300 min-w-[100px] shadow-sm hover:shadow-lg active:scale-95 text-center">
                                                                            <span className="block text-base font-black text-white tracking-tighter group-hover/show:text-rose-500">{show.startTime}</span>
                                                                            <div className="flex items-center justify-center space-x-2 mt-1">
                                                                                <span className={`text-[7px] font-black px-1 py-0.5 rounded uppercase tracking-widest ${show.format === 'IMAX' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'bg-white/5 text-white/40'}`}>{show.format}</span>
                                                                                <span className="text-[7px] font-black uppercase text-white/20 tracking-widest">{show.language}</span>
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-white/5">
                                                            <Link href={`/movies/${String(entry.movie?._id)}`}>
                                                                <Button variant="ghost" className="p-0 h-auto font-black uppercase text-[9px] tracking-widest text-white/40 hover:text-rose-500 transition-colors flex items-center">
                                                                    View Movie Breakdown <ChevronLeft className="ml-2 h-3.5 w-3.5 rotate-180" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar: Map & Directions */}
                    <div className="space-y-10">
                        <div className="sticky top-10 space-y-8">
                            <div className="bg-white/5 rounded-3xl shadow-2xl border border-white/5 overflow-hidden p-2">
                                <div className="h-[300px] w-full rounded-2xl overflow-hidden bg-[#0A0A0A] relative">
                                    <LocationMap center={{ lat, lng }} />
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <a 
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="w-full"
                                        >
                                            <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white h-12 rounded-xl font-black uppercase tracking-widest text-[9px] space-x-3 shadow-2xl border-none">
                                                <Navigation className="h-3.5 w-3.5 fill-white" />
                                                <span>GET DIRECTIONS</span>
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-5">
                                <div className="flex items-center space-x-3">
                                    <Info className="h-4 w-4 text-rose-500" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Venue Policy</h4>
                                </div>
                                <ul className="space-y-3">
                                    {['Outside food not allowed', '3D glasses at extra cost', 'Parking available', 'M-Ticket acceptable'].map(policy => (
                                        <li key={policy} className="flex items-center text-[9px] font-black uppercase text-white/40 tracking-tight">
                                            <div className="h-1 w-1 bg-rose-500 rounded-full mr-3" />
                                            {policy}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
