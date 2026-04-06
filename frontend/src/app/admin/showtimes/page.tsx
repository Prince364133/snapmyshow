"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Trash2, 
  Film, 
  Monitor, 
  ChevronRight,
  Search,
  CheckCircle2,
  AlertCircle,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function AdminShowtimeScheduler() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    movieId: "",
    screenId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "10:00"
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const movieId = searchParams.get("movieId");
    const action = searchParams.get("action");
    if (movieId || action === "new") {
        setFormData(prev => ({ ...prev, movieId: movieId || "" }));
        setShowModal(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stRes, mvRes, scRes] = await Promise.all([
        api.get("/showtimes/theater/my"),
        api.get("/movies"),
        api.get("/screens")
      ]);
      setShowtimes(stRes.data.data);
      setMovies(mvRes.data.data);
      setScreens(scRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.movieId || !formData.screenId || !formData.date || !formData.startTime) {
        return toast({ variant: "destructive", title: "Error", description: "All fields are required." });
    }

    setSaving(true);
    try {
        await api.post("/showtimes", formData);
        toast({ title: "Scheduled", description: "Movie session added successfully." });
        setShowModal(false);
        fetchData();
    } catch (err: any) {
        toast({ variant: "destructive", title: "Schedule Conflict", description: err.response?.data?.error || "Error creating showtime." });
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this session?")) return;
    try {
        await api.delete(`/showtimes/${id}`);
        toast({ title: "Cancelled", description: "Showtime removed." });
        fetchData();
    } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete showtime." });
    }
  };

  if (loading && showtimes.length === 0) return (
    <div className="container mx-auto px-8 py-20 animate-pulse">
        <div className="h-10 w-64 bg-gray-200 rounded-lg mb-8" />
        <div className="grid gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
        </div>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-32">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-40 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black text-[#1F2533] uppercase tracking-tighter leading-none">Showtime Fleet</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Deploy cinema sessions to your auditorium hub</p>
            </div>
            <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-rose-700 font-black h-12 px-8 rounded-xl uppercase tracking-widest text-[11px] text-white shadow-lg shadow-rose-500/20 space-x-2 transition-all hover:-translate-y-0.5">
                <Plus className="h-5 w-5" />
                <span>New Session</span>
            </Button>
        </div>

      <div className="container mx-auto px-8 py-10 max-w-6xl">
        <AnimatePresence>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#1F2533]/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-lg relative"
                    >
                        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-2xl font-black tracking-tighter uppercase text-[#1F2533]">Init Session</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Configure multiplex timing and screen lock</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Feature</Label>
                                    <Select value={formData.movieId} onValueChange={(val: string) => setFormData({...formData, movieId: val})}>
                                        <SelectTrigger className="h-14 bg-gray-50 border-none font-black uppercase tracking-tight rounded-xl px-4">
                                            <SelectValue placeholder="Select Title" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                            {movies.map(m => <SelectItem key={m._id} value={m._id} className="text-[11px] font-bold uppercase py-3">{m.title}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Auditorium</Label>
                                    <Select value={formData.screenId} onValueChange={(val: string) => setFormData({...formData, screenId: val})}>
                                        <SelectTrigger className="h-14 bg-gray-50 border-none font-black uppercase tracking-tight rounded-xl px-4">
                                            <SelectValue placeholder="Select Unit" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                            {screens.map(s => <SelectItem key={s._id} value={s._id} className="text-[11px] font-bold uppercase py-3">{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Deploy Date</Label>
                                        <Input type="date" value={formData.date} onChange={(e: any) => setFormData({...formData, date: e.target.value})} className="h-14 bg-gray-50 border-none font-black rounded-xl" />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Start Time</Label>
                                        <Input type="time" value={formData.startTime} onChange={(e: any) => setFormData({...formData, startTime: e.target.value})} className="h-14 bg-gray-50 border-none font-black rounded-xl" />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1 font-black uppercase tracking-widest text-[10px] rounded-xl h-14 bg-gray-50 hover:bg-gray-100">Cancel</Button>
                                    <Button onClick={handleCreate} disabled={saving} className="flex-1 bg-[#1F2533] hover:bg-black text-white font-black uppercase tracking-widest text-[11px] shadow-xl rounded-xl h-14 transition-all">
                                        {saving ? "Scheduling..." : "Push Session"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Showtime List */}
        <div className="grid gap-6">
            {showtimes.length > 0 ? (
                showtimes.map((st) => (
                    <motion.div key={st._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border border-gray-100 shadow-sm bg-white rounded-2xl group hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row items-stretch min-h-[140px]">
                                    <div className="w-full md:w-40 bg-gray-50/50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">DEPLOYED</p>
                                        <div className="text-3xl font-black tracking-tighter text-[#1F2533] uppercase leading-none">{format(new Date(st.date), "dd")}</div>
                                        <div className="text-[10px] font-black text-primary uppercase mt-1 tracking-widest">{format(new Date(st.date), "MMM yyyy")}</div>
                                    </div>
                                    
                                    <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex items-center space-x-6 w-full md:w-auto">
                                            <div className="h-16 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 relative shrink-0 shadow-sm">
                                                <Image src={st.movieId.posterUrl} alt={st.movieId.title} fill className="object-cover" sizes="48px" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1F2533] leading-none mb-2 truncate max-w-md">{st.movieId.title}</h3>
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <Monitor className="mr-2 h-3.5 w-3.5 text-primary" /> {st.screenId.name}
                                                    </div>
                                                    <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <Clock className="mr-2 h-3.5 w-3.5 text-primary" /> {st.startTime}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full md:w-auto gap-12">
                                            <div className="hidden lg:block text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">OCCUPANCY GRID</p>
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (st.bookedSeats?.length || 0) / (st.screenId.totalSeats || 1) * 100)}%` }}
                                                            className="h-full bg-emerald-500" 
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black tracking-tighter text-[#1F2533]">{st.bookedSeats?.length || 0} / {st.screenId.totalSeats}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Link href={`/admin/showtimes/${st._id}`}>
                                                    <Button variant="ghost" className="bg-gray-50 hover:bg-gray-100 text-[#1F2533] font-black text-[10px] uppercase h-12 px-6 rounded-xl tracking-widest space-x-2 group/btn">
                                                        <span>View Seats</span>
                                                        <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                                    </Button>
                                                </Link>
                                                <Button onClick={() => handleDelete(st._id)} variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors">
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))
            ) : (
                <div className="py-32 text-center border border-dashed border-gray-200 rounded-3xl bg-white flex flex-col items-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <CalendarIcon className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1F2533]">No Active Sessions</h3>
                    <p className="text-gray-400 font-medium text-sm mt-2 max-w-xs mx-auto">
                        Your screening roster is currently empty. Start by adding a movie to your screens.
                    </p>
                    <Button onClick={() => setShowModal(true)} className="mt-8 bg-primary hover:bg-rose-700 font-black h-14 px-10 rounded-xl uppercase tracking-widest text-[11px] text-white shadow-xl shadow-rose-500/20">Init First Session</Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

