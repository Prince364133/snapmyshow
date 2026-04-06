"use client";

import Link from "next/link";
import { Search, MapPin, Menu, ChevronDown, X, User, LogOut, Ticket, Settings, Bell, Heart, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [city, setCity] = useState("Detecting...");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const currentPriority = useRef(0);

    const updateCity = (newCity: string, priority: number) => {
        if (priority >= currentPriority.current) {
            setCity(newCity);
            currentPriority.current = priority;
        }
    };

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const { data } = await api.get('/theaters/location/current');
                if (data.success && data.data.city) {
                    const locationStr = data.data.city + (data.data.country ? `, ${data.data.country}` : '');
                    updateCity(locationStr, 1); // Source 1: IP Based
                } else {
                    updateCity("Madhesh Province, Nepal", 1);
                }
            } catch (err) {
                updateCity("Madhesh Province, Nepal", 1);
            }
        };

        // 1. Initial fetch (IP-based)
        fetchLocation();

        // 2. High-precision GPS Check
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const coords = { lat: latitude, lng: longitude };
                    localStorage.setItem('userCoordinates', JSON.stringify(coords));
                    
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
                        const data = await res.json();
                        if (data.address) {
                            const cityVal = data.address.city || data.address.town || data.address.village || data.address.state || "Unknown";
                            const countryVal = data.address.country || "";
                            updateCity(`${cityVal}${countryVal ? `, ${countryVal}` : ''}`, 2); // Source 2: GPS Based
                        }
                    } catch (err) {
                        console.error("Client-side geocode failed", err);
                        await fetchLocation();
                    }
                },
                (error) => console.log("GPS denied, using IP fallback"),
                { enableHighAccuracy: false, timeout: 5000 }
            );
        }

        // IP-based fallback if no user location
        fetchLocation();
    }, []);

    const handleLogout = () => {
        logout();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
        }
    };

    return (
        <nav className="w-full shadow-sm sticky top-0 z-50">
            {/* Top Row: Header */}
            <div className="bg-[#333545] py-3 text-white">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center space-x-8 flex-1">
                        {/* Logo */}
                        <Link href="/" className="flex items-center group">
                            <span className="text-2xl font-black lowercase tracking-tighter group-hover:scale-105 transition-transform"><span className="bg-primary px-1.5 mr-0.5 rounded-sm text-white">snap</span>myshow</span>
                        </Link>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative group bg-white rounded-md overflow-hidden">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Search for Movies in your city..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-black outline-none placeholder:text-muted-foreground/60"
                                    suppressHydrationWarning
                                />
                        </form>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex cursor-pointer items-center space-x-1 text-sm font-medium hover:text-white/80 transition-colors">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{city}</span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </div>

                        {user ? (
                            <div className="relative" ref={profileRef}>
                                <div 
                                    className="flex items-center space-x-3 cursor-pointer group"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-black text-primary">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden md:block text-xs font-bold uppercase tracking-widest">{user.name.split(' ')[0]}</span>
                                    <ChevronDown className={`h-3 w-3 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </div>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-[#1F2533]"
                                        >
                                            <div className="p-4 border-b border-gray-50 flex items-center space-x-3 bg-gray-50/50">
                                                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-black">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase leading-none">{user.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Gold Member</span>
                                                </div>
                                            </div>
                                            <div className="p-2">
                                                <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <span>Profile</span>
                                                </Link>
                                                <Link href="/my-bookings" onClick={() => setIsProfileOpen(false)} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest">
                                                    <Ticket className="h-4 w-4 text-gray-400" />
                                                    <span>My Bookings</span>
                                                </Link>
                                                {user.role === 'ADMIN' && (
                                                    <Link href="/admin/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest">
                                                        <Settings className="h-4 w-4 text-primary" />
                                                        <span>Admin Panel</span>
                                                    </Link>
                                                )}
                                                <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 hover:bg-rose-50 hover:text-primary rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest mt-2 border-t border-gray-50">
                                                    <LogOut className="h-4 w-4" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button size="sm" className="bg-primary hover:bg-rose-600 font-bold px-4 h-8 text-[11px] rounded-md tracking-tight uppercase">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                        <Menu className="h-6 w-6 cursor-pointer md:hidden" onClick={() => setIsMenuOpen(true)} />
                    </div>
                </div>
            </div>

            {/* Bottom Row: Navigation Links */}
            <div className="bg-[#F5F5F5] h-10 border-b border-gray-200 hidden md:block">
                <div className="container mx-auto px-4 flex items-center h-full justify-between">
                    <div className="flex items-center space-x-6 text-[12px] font-bold text-[#333333] uppercase tracking-wide">
                        <Link href="/movies" className="hover:text-primary transition-colors">Movies</Link>
                        <Link href="/theaters" className="hover:text-primary transition-colors">Theaters</Link>
                    </div>

                    <div className="flex items-center space-x-6 text-[11px] font-bold text-[#333333] uppercase">
                        <Link href="/offers" className="hover:text-primary transition-colors">Offers</Link>
                        <Link href="/gift-cards" className="hover:text-primary transition-colors">Gift Cards</Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[300px] bg-white z-[101] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-gray-100">
                                <span className="text-xl font-black lowercase tracking-tighter"><span className="bg-primary px-1.5 text-white rounded-sm">snap</span>myshow</span>
                                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="rounded-full">
                                    <X className="h-6 w-6 text-gray-400" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-300">Fast Explore</h4>
                                    <div className="flex flex-col space-y-4">
                                        <Link href="/movies" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 text-sm font-black text-[#1F2533] uppercase">
                                            <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center"><Flame className="h-4 w-4 text-primary" /></div>
                                            <span>Latest Movies</span>
                                        </Link>
                                        <Link href="/offers" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 text-sm font-black text-[#1F2533] uppercase">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Sparkles className="h-4 w-4 text-emerald-500" /></div>
                                            <span>Exclusive Offers</span>
                                        </Link>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-300">More Movies</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['Cinemas'].map(item => (
                                            <Link key={item} href="/movies" className="p-3 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                                                {item}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50">
                                {user ? (
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-black">{user.name.charAt(0)}</div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase leading-none">{user.name}</span>
                                            <button onClick={handleLogout} className="text-[9px] font-bold text-primary uppercase mt-1">Sign Out</button>
                                        </div>
                                    </div>
                                ) : (
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full bg-primary hover:bg-rose-700 h-14 font-black tracking-widest uppercase rounded-2xl shadow-lg shadow-rose-500/20">Sign In Now</Button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
