"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Info, ChevronRight, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function TheatersPage() {
    const [theaters, setTheaters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
    const [retrying, setRetrying] = useState(false);

    const fetchTheaters = async (lat?: number, lng?: number) => {
        setLoading(true);
        try {
            const params = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
            const { data } = await api.get(`/theaters/nearest${params}`);
            if (data.success) {
                setTheaters(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch theaters:", err);
        } finally {
            setLoading(false);
            setRetrying(false);
        }
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoords({ lat: latitude, lng: longitude });
                    fetchTheaters(latitude, longitude);
                },
                (error) => {
                    console.log("GPS denied, falling back to IP detection");
                    fetchTheaters();
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            fetchTheaters();
        }
    }, []);

    const handleManualRefresh = () => {
        setRetrying(true);
        if (coords) fetchTheaters(coords.lat, coords.lng);
        else fetchTheaters();
    };

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Unified Exploration Header */}
            <header className="container mx-auto px-4 md:px-10 pt-20 pb-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(248,68,100,0.5)]" />
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-[#1F2533] uppercase leading-none">Find Movie Theaters</h1>
                            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-2">Discover premium cinema experiences near your current coordinate</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 md:px-10">
                <div className="flex flex-col gap-12">
                    {/* Premium Status Bar */}
                    <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-gray-50 cursor-default">
                        <div className="flex items-center space-x-5">
                            <div className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-gray-200/40 flex items-center justify-center text-primary border border-gray-50">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Current Scope</h3>
                                <p className="text-base font-black text-[#1F2533] uppercase tracking-tighter">
                                    {coords ? "HIGH ACCURACY GPS ENABLED" : "APPROXIMATED NETWORK LOCATION"}
                                </p>
                            </div>
                        </div>
                        <Button 
                            onClick={handleManualRefresh}
                            disabled={retrying}
                            className="bg-white hover:bg-gray-50 text-[#1F2533] border border-gray-200 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm transition-all flex items-center space-x-3 active:scale-95"
                        >
                            <Navigation className={`h-4 w-4 text-primary ${retrying ? 'animate-spin' : ''}`} />
                            <span>Refine Location</span>
                        </Button>
                    </div>

                    {/* Uniform Result List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-6">
                                    <Skeleton className="aspect-video w-full rounded-[2rem]" />
                                    <div className="space-y-3 px-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <AnimatePresence>
                                {theaters.map((theater, idx) => (
                                    <motion.div
                                        key={theater._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ y: -8 }}
                                        className="group cursor-pointer"
                                    >
                                        <Link href={`/theaters/${theater._id}`} className="block space-y-6">
                                            {/* Theater Poster Style Cover */}
                                            <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] border border-gray-100 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                                                <Image 
                                                    src={theater.coverImageUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"} 
                                                    alt={theater.name}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />
                                                
                                                {/* Meta Overlay - Bottom Bar Style like Movies */}
                                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/40 backdrop-blur-md text-white px-5 flex items-center justify-between text-[10px] font-black uppercase tracking-tighter border-t border-white/5 transition-all group-hover:h-14">
                                                    <div className="flex items-center space-x-2">
                                                        <Star className="h-3 w-3 fill-primary text-primary" />
                                                        <span>4.8 Rating</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 opacity-80">
                                                        <Clock className="h-3 w-3 text-primary" />
                                                        <span>{theater.city}</span>
                                                    </div>
                                                </div>

                                                <div className="absolute top-5 right-5 bg-white px-3 py-1.5 rounded-xl text-[9px] font-black text-primary uppercase tracking-widest shadow-xl border border-gray-50 group-hover:scale-110 transition-transform">
                                                    {theater.distance ? `${theater.distance.toFixed(1)} KM` : 'NEARBY'}
                                                </div>
                                            </div>

                                            {/* Detail Area */}
                                            <div className="px-1">
                                                <h2 className="text-xl font-black text-[#1F2533] uppercase tracking-tighter group-hover:text-primary transition-colors line-clamp-1">
                                                    {theater.name}
                                                </h2>
                                                <div className="flex items-center space-x-2 mt-2 opacity-50">
                                                    <MapPin className="h-3 w-3 text-gray-500" />
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1">
                                                        {theater.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>

                    {!loading && theaters.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-32 flex flex-col items-center justify-center text-center space-y-8 bg-gray-50/30 rounded-[3rem] border-2 border-dashed border-gray-100"
                        >
                             <div className="h-24 w-24 bg-white rounded-full shadow-2xl flex items-center justify-center">
                                 <Info className="h-10 w-10 text-primary animate-pulse" />
                             </div>
                             <div>
                                 <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1F2533]">No Cinemas Detected</h2>
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-3">Try expanding your search radius or refining your city detection.</p>
                             </div>
                             <Button 
                                onClick={handleManualRefresh}
                                className="h-14 bg-primary hover:bg-rose-600 text-white rounded-2xl uppercase font-black tracking-widest text-[10px] px-10 shadow-xl shadow-rose-500/20 active:scale-95 transition-all"
                             >
                                 Refresh Proximity Cache
                             </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
