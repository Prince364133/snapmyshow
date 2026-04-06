"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ChevronRight, Navigation, Star, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function NearestTheatersSection() {
    const [theaters, setTheaters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

    const fetchNearest = async (lat?: number, lng?: number) => {
        try {
            const params = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
            const { data } = await api.get(`/theaters/nearest${params}`);
            if (data.success) {
                // Take only top 5 as requested
                setTheaters(data.data.slice(0, 5));
            }
        } catch (err) {
            console.error("Home: Nearest theaters fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
                    fetchNearest(position.coords.latitude, position.coords.longitude);
                },
                () => fetchNearest() // Fallback to IP
            );
        } else {
            fetchNearest();
        }
    }, []);

    const hasTheaters = theaters.length > 0;
    if (!loading && !hasTheaters) return null;

    return (
        <div className="space-y-10 py-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(248,68,100,0.3)]" />
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter text-[#1F2533] uppercase leading-none">Nearest Movie Theaters</h2>
                        <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mt-1">
                           {coords ? "Based on your live location" : "Based on your network area"}
                        </p>
                    </div>
                </div>
                <Link href="/theaters" className="text-[11px] font-black text-primary hover:underline flex items-center tracking-widest uppercase">
                    View All <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {loading ? (
                    [...Array(5)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-3xl" />)
                ) : (
                    <>
                        <AnimatePresence>
                            {theaters.map((theater, idx) => (
                                <Link href={`/theaters/${theater._id}`} key={theater._id} className="block group">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col h-full"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <Image 
                                                src={theater.coverImageUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400"} 
                                                alt={theater.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                            <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
                                                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                                                <span className="text-[9px] font-black text-white">4.8</span>
                                            </div>
                                            <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-white">
                                                <MapPin className="h-3 w-3 text-primary shrink-0" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                    {theater.distance ? `${theater.distance.toFixed(1)} KM` : 'NEARBY'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-sm font-black text-[#1F2533] uppercase tracking-tighter line-clamp-1 group-hover:text-primary transition-colors">
                                                    {theater.name}
                                                </h3>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 line-clamp-1">
                                                    {theater.city}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}
