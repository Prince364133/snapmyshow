"use client";

import { useState, useCallback, useEffect } from 'react';
import { MapPin, Search, Navigation, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';


// Dynamically import Map component to avoid SSR issues with Leaflet
const LocationMap = dynamic<{ center: { lat: number; lng: number }; onMarkerDrag: (lat: number, lng: number) => void }>(
  () => import('./LocationMap'), 
  { 
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Interactive Map...</div>
  }
);

interface LocationSelectorProps {
    onLocationSelect: (location: { lat: number, lng: number, address: string }) => void;
    initialLocation?: { lat: number, lng: number, address: string };
}

export default function LocationSelector({ onLocationSelect, initialLocation }: LocationSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [currentPos, setCurrentPos] = useState<{lat: number, lng: number} | null>(
        initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null
    );
    const [address, setAddress] = useState(initialLocation?.address || '');

    // Debounced suggestion fetching
    useEffect(() => {
        if (searchQuery.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (searchQuery === address) {
            return; // Don't fetch suggestions if we just selected/detected this exact address
        }

        const timer = setTimeout(async () => {
            try {
                // We add addressdetails=1 to get more structured data if needed, but display_name is usually enough
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`);
                const data = await res.json();
                setSuggestions(data);
                setShowSuggestions(data.length > 0);
            } catch (err) {
                console.error("Suggestion fetch failed", err);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery, address]);

    // Reverse Geocoding using Nominatim (OpenStreetMap)
    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();
            const addr = data.display_name || 'Selected Location';
            setAddress(addr);
            setSearchQuery(addr);
            onLocationSelect({ lat, lng, address: addr });
        } catch (err) {
            console.error("Reverse geocoding failed", err);
            onLocationSelect({ lat, lng, address: "Custom Location" });
        }
    };

    const handleAutoDetect = () => {
        setLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPos({ lat: latitude, lng: longitude });
                    await reverseGeocode(latitude, longitude);
                    setLoading(false);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    toast.error("Please enable location permissions or search manually.");
                    setLoading(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            toast.error("Geolocation is not supported by your browser.");
            setLoading(false);
        }
    };

    const handleSelectSuggestion = (suggestion: any) => {
        const latitude = parseFloat(suggestion.lat);
        const longitude = parseFloat(suggestion.lon);
        const displayName = suggestion.display_name;
        
        setCurrentPos({ lat: latitude, lng: longitude });
        setAddress(displayName);
        setSearchQuery(displayName);
        setSuggestions([]);
        setShowSuggestions(false);
        onLocationSelect({ lat: latitude, lng: longitude, address: displayName });
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        // If we already have suggestions, just select the first one on enter
        if (suggestions.length > 0) {
            handleSelectSuggestion(suggestions[0]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await res.json();
            if (data.length > 0) {
                handleSelectSuggestion(data[0]);
            } else {
                toast.error("Location not found. Try something else.");
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerDrag = useCallback(async (lat: number, lng: number) => {
        setCurrentPos({ lat, lng });
        await reverseGeocode(lat, lng);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 relative">
                <div className="flex-1 relative group z-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Search for your area, city, or theater..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch(e as any);
                                }
                            }}
                            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary rounded-xl transition-all"
                        />
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                    className="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-start space-x-3 transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight line-clamp-2">
                                        {suggestion.display_name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <Button 
                    type="button"
                    onClick={handleAutoDetect} 
                    disabled={loading}
                    variant="outline" 
                    className="h-12 px-6 border-gray-200 hover:bg-primary/5 hover:text-primary hover:border-primary/30 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center space-x-2 shrink-0"
                >
                    <Navigation className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'Detecting...' : 'Auto Detect'}</span>
                </Button>
            </div>

            {address && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-start space-x-3 animate-in fade-in duration-500">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs font-bold text-gray-700 leading-relaxed uppercase tracking-tight">{address}</p>
                </div>
            )}

            <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-100/50">
                <LocationMap 
                    center={currentPos || { lat: 28.6139, lng: 77.2090 }} 
                    onMarkerDrag={handleMarkerDrag} 
                />
            </div>
            
            <div className="flex items-center space-x-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest px-2">
                <Info className="h-3 w-3" />
                <span>Drag the pin to refine your exact location</span>
            </div>

            {/* Click outside backdrop for suggestions */}
            {showSuggestions && (
                <div 
                    className="fixed inset-0 z-40 bg-black/0" 
                    onClick={() => setShowSuggestions(false)}
                />
            )}
        </div>
    );
}
