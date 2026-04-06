"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { 
  Plus, 
  Film, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  Image as ImageIcon, 
  Star,
  Clock,
  Globe,
  PlusCircle,
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function SuperAdminMovieManager() {
  const { toast } = useToast();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [editMode, setEditMode] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: [] as string[],
    language: [] as string[],
    duration: 120,
    cast: [] as string[],
    trailerUrl: "",
    releaseDate: "",
    rating: 0
  });

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  // Tag Inputs
  const [genreInput, setGenreInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [castInput, setCastInput] = useState("");

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/movies");
      setMovies(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      genre: [],
      language: [],
      duration: 120,
      cast: [],
      trailerUrl: "",
      releaseDate: "",
      rating: 0
    });
    setPosterFile(null);
    setBannerFile(null);
    setSelectedMovie(null);
  };

  const handleEdit = (movie: any) => {
    setSelectedMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: movie.genre || [],
      language: movie.language || [],
      duration: movie.duration,
      cast: movie.cast || [],
      trailerUrl: movie.trailerUrl || "",
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : "",
      rating: movie.rating || 0
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!formData.title) return toast({ variant: "destructive", title: "Error", description: "Title is required." });
    
    setSaving(true);
    try {
        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                form.append(key, JSON.stringify(value));
            } else {
                form.append(key, value.toString());
            }
        });

        if (posterFile) form.append("poster", posterFile);
        if (bannerFile) form.append("banner", bannerFile);

        if (selectedMovie) {
            await api.put(`/movies/${selectedMovie._id}`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast({ title: "Updated", description: "Movie details updated successfully." });
        } else {
            await api.post("/movies", form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast({ title: "Created", description: "New movie added to catalog." });
        }
        setEditMode(false);
        fetchMovies();
        resetForm();
    } catch (err: any) {
        toast({ variant: "destructive", title: "Failed", description: err.response?.data?.error || "Error saving movie." });
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this movie?")) return;
    try {
        await api.delete(`/movies/${id}`);
        toast({ title: "Deactivated", description: "Movie is no longer active." });
        fetchMovies();
    } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete movie." });
    }
  };

  const addTag = (list: string, item: string, setter: any, inputSetter: any) => {
    if (!item.trim()) return;
    setter({ ...formData, [list]: [...(formData as any)[list], item.trim()] });
    inputSetter("");
  };

  const removeTag = (list: string, index: number, setter: any) => {
    const newList = [...(formData as any)[list]];
    newList.splice(index, 1);
    setter({ ...formData, [list]: newList });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Super Admin Top Bar */}
      <div className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4 sticky top-16 z-40">
        <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-[#1F2533]">Platform Control</span>
            <span className="text-gray-300 mx-2">/</span>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Global Catalog Manager</span>
        </div>
        <div className="flex items-center space-x-6 text-right">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#1F2533] uppercase leading-none">Super Admin Access</span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Live Environment</span>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-10 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 space-y-6 md:space-y-0">
          <div className="flex items-center space-x-4">
              {editMode && (
                  <Button variant="ghost" size="icon" onClick={() => { setEditMode(false); resetForm(); }} className="rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50">
                      <ChevronLeft className="h-6 w-6 text-primary" />
                  </Button>
              )}
              <div className="space-y-1">
                  <h1 className="text-4xl font-black text-[#1F2533] uppercase tracking-tighter leading-none">
                      {editMode ? (selectedMovie ? 'Edit Asset' : 'New Catalog Entry') : 'Global Catalog'}
                  </h1>
                  <p className="text-gray-500 text-sm font-medium">
                      {editMode ? 'Configuring global movie properties and media assets' : 'Managing the centralized database of all movies and shows.'}
                  </p>
              </div>
          </div>
          {!editMode && (
              <div className="flex space-x-4">
                  <div className="relative group hidden md:block">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <Input placeholder="Search Catalog..." className="pl-10 h-14 w-64 border-none bg-white shadow-sm rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus-visible:ring-primary/20" />
                  </div>
                  <Button onClick={() => { resetForm(); setEditMode(true); }} className="bg-primary hover:bg-rose-700 text-white font-black tracking-widest h-14 px-10 rounded-2xl uppercase space-x-3 shadow-lg shadow-rose-500/20 text-xs">
                      <Plus className="h-5 w-5" />
                      <span>Add Movie</span>
                  </Button>
              </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {editMode ? (
              <motion.div 
                  key="editor"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid lg:grid-cols-12 gap-8"
              >
                  {/* Left: Media Assets */}
                  <div className="lg:col-span-4 space-y-6">
                      <Card className="border border-gray-100 bg-white shadow-sm rounded-3xl p-8">
                          <div className="space-y-8">
                              <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Poster Content (2:3)</Label>
                                      <Badge variant="outline" className="text-[8px] font-bold border-gray-100 uppercase">Required</Badge>
                                  </div>
                                  <div className="relative aspect-[2/3] w-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors">
                                      {posterFile ? (
                                          <Image src={URL.createObjectURL(posterFile)} alt="Poster Preview" fill className="object-cover" />
                                      ) : selectedMovie?.posterUrl ? (
                                          <Image src={selectedMovie.posterUrl} alt={formData.title} fill className="object-cover" />
                                      ) : (
                                          <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
                                                  <UploadCloud className="h-6 w-6 text-gray-200" />
                                              </div>
                                              <span className="text-[10px] font-black uppercase tracking-widest">Select Image</span>
                                          </div>
                                      )}
                                      <input type="file" aria-label="Upload Poster" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setPosterFile(e.target.files?.[0] || null)} />
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hero Banner (16:9)</Label>
                                      <Badge variant="outline" className="text-[8px] font-bold border-gray-100 uppercase">Featured</Badge>
                                  </div>
                                  <div className="relative aspect-video w-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors">
                                      {bannerFile ? (
                                          <Image src={URL.createObjectURL(bannerFile)} alt="Banner Preview" fill className="object-cover" />
                                      ) : selectedMovie?.bannerUrl ? (
                                          <Image src={selectedMovie.bannerUrl} alt={`${formData.title} banner`} fill className="object-cover" />
                                      ) : (
                                          <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
                                                  <UploadCloud className="h-6 w-6 text-gray-200" />
                                              </div>
                                              <span className="text-[10px] font-black uppercase tracking-widest">Select Asset</span>
                                          </div>
                                      )}
                                      <input type="file" aria-label="Upload Banner" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
                                  </div>
                              </div>
                          </div>
                      </Card>

                      <div className="flex flex-col space-y-4">
                          <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-rose-700 text-white font-black h-16 rounded-2xl shadow-xl shadow-rose-500/20 uppercase tracking-widest text-sm leading-none">
                              {saving ? "Publishing Assets..." : (selectedMovie ? "Update Catalog Entry" : "Add to Global Catalog")}
                          </Button>
                          <Button variant="ghost" className="h-14 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 rounded-2xl" onClick={() => { setEditMode(false); resetForm(); }}>
                              Cancel Operation
                          </Button>
                      </div>
                  </div>

                  {/* Right: Metadata Form */}
                  <div className="lg:col-span-8 space-y-8">
                      <Card className="border border-gray-100 bg-white shadow-sm rounded-3xl p-8">
                          <div className="grid md:grid-cols-2 gap-8">
                              <div className="space-y-4 md:col-span-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Content Title</Label>
                                  <Input value={formData.title} onChange={(e: any) => setFormData({...formData, title: e.target.value})} className="h-16 text-2xl font-black uppercase tracking-tighter bg-gray-50 border-none focus-visible:ring-primary/20 rounded-2xl px-6" placeholder="ENTER MOVIE TITLE" />
                              </div>
                              
                              <div className="space-y-4 md:col-span-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synopsis</Label>
                                  <Textarea value={formData.description} onChange={(e: any) => setFormData({...formData, description: e.target.value})} className="min-h-[140px] bg-gray-50 border-none rounded-2xl p-6 leading-relaxed text-sm focus-visible:ring-primary/20" placeholder="Capture the heart of the story..." />
                              </div>

                              <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tags / Genres</Label>
                                      <kbd className="text-[8px] bg-gray-100 px-1 rounded font-mono">ENTER</kbd>
                                  </div>
                                  <div className="flex space-x-2">
                                      <Input value={genreInput} onChange={(e) => setGenreInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTag('genre', genreInput, setFormData, setGenreInput)} className="bg-gray-50 border-none h-12 rounded-xl text-xs font-bold uppercase" placeholder="ACTION, DRAMA..." />
                                      <Button onClick={() => addTag('genre', genreInput, setFormData, setGenreInput)} variant="secondary" className="h-12 w-12 rounded-xl bg-gray-100 hover:bg-gray-200"><PlusCircle className="h-5 w-5 text-gray-400" /></Button>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                      {formData.genre.map((tag, i) => (
                                          <Badge key={i} className="bg-primary/5 text-primary border-primary/10 px-3 py-1 text-[10px] font-black uppercase">
                                              {tag} <X className="ml-2 h-3.5 w-3.5 cursor-pointer hover:text-primary transition-colors" onClick={() => removeTag('genre', i, setFormData)} />
                                          </Badge>
                                      ))}
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available Languages</Label>
                                  <div className="flex space-x-2">
                                      <Input value={langInput} onChange={(e) => setLangInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTag('language', langInput, setFormData, setLangInput)} className="bg-gray-50 border-none h-12 rounded-xl text-xs font-bold uppercase" placeholder="ENG, HIN..." />
                                      <Button onClick={() => addTag('language', langInput, setFormData, setLangInput)} variant="secondary" className="h-12 w-12 rounded-xl bg-gray-100 hover:bg-gray-200"><PlusCircle className="h-5 w-5 text-gray-400" /></Button>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                      {formData.language.map((tag, i) => (
                                          <Badge key={i} variant="outline" className="border-gray-100 text-gray-400 px-3 py-1 text-[10px] font-black uppercase">
                                              {tag} <X className="ml-2 h-3.5 w-3.5 cursor-pointer hover:text-primary transition-colors" onClick={() => removeTag('language', i, setFormData)} />
                                          </Badge>
                                      ))}
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Duration (Minutes)</Label>
                                  <div className="relative">
                                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                      <Input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} className="pl-12 bg-gray-50 h-14 border-none rounded-2xl text-xs font-black" />
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Theatrical Release</Label>
                                  <Input type="date" value={formData.releaseDate} onChange={(e) => setFormData({...formData, releaseDate: e.target.value})} className="bg-gray-50 h-14 border-none rounded-2xl text-xs font-black uppercase" />
                              </div>

                              <div className="space-y-4 md:col-span-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Official Trailer (YouTube ID / Path)</Label>
                                  <Input value={formData.trailerUrl} onChange={(e) => setFormData({...formData, trailerUrl: e.target.value})} className="bg-gray-50 h-14 border-none rounded-2xl text-xs font-bold px-6" placeholder="https://youtube.com/watch?v=..." />
                              </div>

                              <div className="space-y-4">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cast & Crew</Label>
                                  <div className="flex space-x-2">
                                      <Input value={castInput} onChange={(e) => setCastInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTag('cast', castInput, setFormData, setCastInput)} className="bg-gray-50 border-none h-12 rounded-xl text-xs font-bold uppercase" placeholder="ACTOR NAME..." />
                                      <Button onClick={() => addTag('cast', castInput, setFormData, setCastInput)} variant="secondary" className="h-12 w-12 rounded-xl bg-gray-100 hover:bg-gray-200"><PlusCircle className="h-5 w-5 text-gray-400" /></Button>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                      {formData.cast.map((tag, i) => (
                                          <Badge key={i} className="bg-[#1F2533] text-white border-none px-3 py-1 text-[10px] font-black uppercase">
                                              {tag} <X className="ml-2 h-3.5 w-3.5 cursor-pointer hover:text-primary transition-colors" onClick={() => removeTag('cast', i, setFormData)} />
                                          </Badge>
                                      ))}
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Critic Rating (Out of 10)</Label>
                                  <div className="relative">
                                      <Star className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                                      <Input type="number" step="0.1" value={formData.rating} onChange={(e: any) => setFormData({...formData, rating: parseFloat(e.target.value)})} className="pl-12 bg-gray-50 h-14 border-none rounded-2xl text-xs font-black" />
                                  </div>
                              </div>
                          </div>
                      </Card>
                  </div>
              </motion.div>
          ) : (
              <motion.div 
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
              >
                  {loading && movies.length === 0 ? (
                      Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-3xl bg-white" />)
                  ) : movies.map((movie) => (
                      <Card key={movie._id} className="border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden flex flex-col rounded-3xl group">
                          <div className="relative aspect-[2/3] w-full overflow-hidden">
                              <Image 
                                  src={movie.posterUrl} 
                                  alt={movie.title} 
                                  fill 
                                  className="object-cover transition-transform group-hover:scale-110 duration-700" 
                                  sizes="(max-width: 640px) 100vw, 250px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#1F2533] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 space-y-3">
                                  <Button onClick={() => handleEdit(movie)} className="bg-white text-[#1F2533] hover:bg-gray-100 font-black text-[10px] h-12 uppercase tracking-widest rounded-xl transition-all hover:-translate-y-1">
                                      <Edit3 className="mr-2 h-4 w-4" /> Manage
                                  </Button>
                                  <Button onClick={() => handleDelete(movie._id)} variant="ghost" className="text-white hover:bg-white/10 font-black text-[10px] h-10 uppercase tracking-widest rounded-xl">
                                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Deactivate
                                  </Button>
                              </div>
                              <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                  <Badge className="bg-primary/95 text-white border-none font-black text-[9px] uppercase tracking-widest p-2 px-3 shadow-lg rounded-lg">LIVE</Badge>
                              </div>
                          </div>
                          <CardContent className="p-6 flex-1 flex flex-col justify-between">
                              <div className="space-y-1">
                                  <h3 className="text-sm font-black text-[#1F2533] uppercase tracking-tighter leading-none group-hover:text-primary transition-colors truncate">{movie.title}</h3>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{movie.genre?.join(' • ')}</p>
                              </div>
                              <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-4">
                                  <div className="flex items-center text-yellow-500 font-black text-[10px]">
                                      <Star className="h-3.5 w-3.5 mr-1 fill-yellow-500" /> {movie.rating}/10
                                  </div>
                                  <div className="text-gray-300 font-black text-[10px] uppercase tracking-widest">{movie.duration}m</div>
                              </div>
                          </CardContent>
                      </Card>
                  ))}
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
