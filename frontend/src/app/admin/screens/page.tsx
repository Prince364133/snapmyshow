"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { SEAT_TEMPLATES } from "@/lib/seatTemplates";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Plus, Monitor, Settings2, Trash2, LayoutGrid, Armchair } from "lucide-react";

export default function AdminScreenManager() {
  const { toast } = useToast();
  const [screens, setScreens] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [selectedScreen, setSelectedScreen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editor State
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(12);
  const [seatLayout, setSeatLayout] = useState<any[]>([]);
  const [selectedSeatType, setSelectedSeatType] = useState("STANDARD");
  const [price, setPrice] = useState(250);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, tRes] = await Promise.all([
          api.get("/screens"),
          api.get("/theaters/my")
      ]);
      setScreens(sRes.data.data);
      setTheaters(tRes.data.data);
      if (tRes.data.data.length > 0) {
          setSelectedTheaterId(tRes.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initLayout = (r: number, c: number) => {
    const layout = [];
    const rowChars = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < r; i++) {
        const rowLabel = rowChars[i] || `R${i}`;
        for (let j = 1; j <= c; j++) {
            layout.push({
                row: rowLabel,
                col: j,
                type: "STANDARD",
                price: 250,
                isActive: true
            });
        }
    }
    setSeatLayout(layout);
  };

  const applyTemplate = (templateId: string) => {
      const template = SEAT_TEMPLATES.find(t => t.id === templateId);
      if (!template) return;
      
      setRows(template.rows);
      setCols(template.cols);
      setSeatLayout(template.layout(template.rows, template.cols));
      toast({ title: "Template Applied", description: `Applied ${template.name} layout.` });
  };

  const handleCreateNew = () => {
    setName("");
    setRows(8);
    setCols(12);
    initLayout(8, 12);
    setEditMode(true);
    setSelectedScreen(null);
  };

  const handleEdit = (screen: any) => {
    setSelectedScreen(screen);
    setName(screen.name);
    setRows(screen.rows);
    setCols(screen.columns);
    setSeatLayout(screen.seatLayout);
    setSelectedTheaterId(screen.theaterId?._id || screen.theaterId);
    setEditMode(true);
  };

  const toggleSeat = (row: string, col: number) => {
    setSeatLayout(prev => prev.map(s => {
        if (s.row === row && s.col === col) {
            return { ...s, isActive: !s.isActive };
        }
        return s;
    }));
  };

  const updateSeatType = (row: string, col: number) => {
    setSeatLayout(prev => prev.map(s => {
        if (s.row === row && s.col === col) {
            return { ...s, type: selectedSeatType, price: price };
        }
        return s;
    }));
  };

  const handleSave = async () => {
    if (!name) return toast({ variant: "destructive", title: "Error", description: "Screen name is required." });
    if (!selectedTheaterId) return toast({ variant: "destructive", title: "Error", description: "Please select a theater." });
    
    setSaving(true);
    try {
        const payload = {
            theaterId: selectedTheaterId,
            name,
            rows,
            columns: cols,
            seatLayout,
            totalSeats: seatLayout.filter(s => s.isActive).length
        };

        if (selectedScreen) {
            await api.put(`/screens/${selectedScreen._id}`, payload);
            toast({ title: "Updated", description: "Screen configuration saved." });
        } else {
            await api.post("/screens", payload);
            toast({ title: "Created", description: "New screen added to your theater." });
        }
        setEditMode(false);
        fetchData();
    } catch (err: any) {
        toast({ variant: "destructive", title: "Failed", description: err.response?.data?.error || "Error saving screen." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Remove this screen? All associated showtimes will be affected.")) return;
      try {
          await api.delete(`/screens/${id}`);
          toast({ title: "Deleted", description: "Screen removed successfully." });
          fetchData();
      } catch (err) {
          toast({ variant: "destructive", title: "Error", description: "Failed to delete screen." });
      }
  };

  if (loading && screens.length === 0) return (
    <div className="container mx-auto px-8 py-20 max-w-7xl animate-pulse">
        <div className="h-10 w-64 bg-gray-200 rounded-lg mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
            <div className="h-64 bg-gray-100 rounded-2xl" />
            <div className="h-64 bg-gray-100 rounded-2xl" />
            <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-32">
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-40 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                {editMode && (
                    <Button variant="ghost" size="icon" onClick={() => setEditMode(false)} className="rounded-full hover:bg-gray-100 h-10 w-10 shrink-0">
                        <ChevronLeft className="h-6 w-6 text-[#1F2533]" />
                    </Button>
                )}
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-[#1F2533]">
                        {editMode ? (selectedScreen ? 'Edit Cinema Unit' : 'Infinite Canvas') : 'Auditorium Fleet'}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] mt-1">
                        {editMode ? 'Architectural seat grid and tier management' : 'Centralized control for your screen inventory'}
                    </p>
                </div>
            </div>
            {!editMode && (
                <Button onClick={handleCreateNew} className="bg-primary hover:bg-rose-700 font-black tracking-widest h-12 px-10 uppercase space-x-3 shadow-lg shadow-rose-500/20 rounded-xl text-white">
                    <Plus className="h-5 w-5" />
                    <span>New Screen</span>
                </Button>
            )}
        </div>

      <div className="container mx-auto px-8 py-10 max-w-7xl">
        <AnimatePresence mode="wait">
            {editMode ? (
                <motion.div 
                    key="editor"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="grid lg:grid-cols-12 gap-8"
                >
                    {/* Tools Panel */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="border border-gray-100 bg-white shadow-sm rounded-2xl p-6">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Target Venue</Label>
                                    <Select value={selectedTheaterId} onValueChange={setSelectedTheaterId}>
                                        <SelectTrigger className="h-12 bg-gray-50 border-none font-bold text-xs uppercase rounded-xl">
                                            <SelectValue placeholder="Select Theater" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                            {theaters.map(t => <SelectItem key={t._id} value={t._id} className="text-xs font-bold uppercase py-3">{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Unit Name</Label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AUDI-01" className="h-12 bg-gray-50 border-none font-black uppercase tracking-tight rounded-xl px-4" />
                                </div>
                                
                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quick Templates</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SEAT_TEMPLATES.map(tmp => (
                                            <button 
                                                key={tmp.id}
                                                onClick={() => applyTemplate(tmp.id)}
                                                className="p-3 text-left bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-primary/20 rounded-xl transition-all group"
                                            >
                                                <p className="text-[9px] font-black uppercase tracking-tight text-[#1F2533] leading-none mb-1 group-hover:text-primary">{tmp.name}</p>
                                                <p className="text-[8px] font-bold text-gray-400 leading-none">{tmp.rows}x{tmp.cols}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Paint Tool</Label>
                                        <Badge variant="outline" className="text-[8px] font-bold border-gray-100 px-2 uppercase">{selectedSeatType}</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        {["STANDARD", "PREMIUM", "RECLINER"].map(type => (
                                            <button 
                                                key={type}
                                                onClick={() => setSelectedSeatType(type)}
                                                className={`flex-1 h-10 rounded-lg border flex items-center justify-center transition-all ${selectedSeatType === type ? 'bg-primary text-white border-primary shadow-lg shadow-rose-500/20' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
                                            >
                                                <Armchair className="h-4 w-4" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Unit Price (Rs)</Label>
                                        <Input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value))} className="h-10 bg-gray-50 border-none rounded-lg text-xs font-black" />
                                    </div>
                                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest text-center">Tap seats in grid to apply</p>
                                </div>

                                <Button onClick={handleSave} disabled={saving} className="w-full bg-[#1F2533] hover:bg-black text-white font-black h-14 rounded-xl shadow-xl uppercase tracking-widest text-[11px]">
                                    {saving ? "Deploying Code..." : (selectedScreen ? "Push Updates" : "Deploy Screen")}
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Grid Interface */}
                    <div className="lg:col-span-9 space-y-6">
                        <Card className="border border-gray-100 bg-[#F1F5F9] shadow-inner rounded-3xl min-h-[700px] flex flex-col items-center p-16 overflow-hidden relative">
                            {/* Theatrical Wall */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-primary/20 blur-[1px]" />
                            
                            <div className="w-full max-w-3xl mb-24 flex flex-col items-center">
                                <div className="h-3 w-full bg-[#1F2533] rounded-t-[100%] shadow-2xl relative">
                                    <div className="absolute inset-0 bg-primary opacity-20 blur-xl" />
                                </div>
                                <span className="mt-4 text-[10px] font-black tracking-[0.8em] uppercase text-slate-400">Proscenium Wall / Viewport</span>
                            </div>

                            <div className="flex flex-col space-y-3 w-fit custom-scrollbar pb-10">
                                {Array.from({ length: rows }).map((_, rIdx) => {
                                    const rowChar = "ABCDEFGHJKLMNOPQRSTUVWXYZ"[rIdx] || `R${rIdx}`;
                                    return (
                                        <div key={rowChar} className="flex items-center space-x-6">
                                            <span className="w-6 text-right text-[11px] font-black text-slate-300 uppercase tracking-tighter">{rowChar}</span>
                                            <div className="flex space-x-2.5">
                                                {Array.from({ length: cols }).map((_, cIdx) => {
                                                    const colNum = cIdx + 1;
                                                    const seat = seatLayout.find(s => s.row === rowChar && s.col === colNum);
                                                    if (!seat) return <div key={colNum} className="h-8 w-8" />;
                                                    
                                                    return (
                                                        <button
                                                            key={`${rowChar}${colNum}`}
                                                            onClick={() => updateSeatType(rowChar, colNum)}
                                                            onContextMenu={(e) => { e.preventDefault(); toggleSeat(rowChar, colNum); }}
                                                            className={`
                                                                h-8 w-8 rounded-lg flex flex-col items-center justify-center text-[8px] font-black border transition-all duration-300 relative
                                                                ${!seat.isActive 
                                                                    ? 'bg-transparent border-dashed border-slate-200 text-transparent opacity-30 shadow-none'
                                                                    : seat.type === 'RECLINER'
                                                                    ? 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/20'
                                                                    : seat.type === 'PREMIUM'
                                                                    ? 'bg-primary border-rose-600 text-white shadow-md shadow-rose-500/20'
                                                                    : 'bg-white border-slate-200 text-slate-400 hover:scale-110 hover:shadow-lg hover:border-primary/30'
                                                                }
                                                            `}
                                                        >
                                                            {seat.isActive && colNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <span className="w-6 text-left text-[11px] font-black text-slate-300 uppercase tracking-tighter">{rowChar}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-auto pt-16 flex items-center space-x-10">
                                <div className="flex items-center space-x-3">
                                    <div className="h-4 w-4 bg-white border border-slate-200 rounded-md shadow-sm" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Standard</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="h-4 w-4 bg-primary border border-rose-600 rounded-md shadow-lg shadow-rose-500/10" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Premium</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="h-4 w-4 bg-amber-500 border border-amber-600 rounded-md shadow-lg shadow-amber-500/10" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recliner</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key="list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {screens.map((screen) => (
                        <Card key={screen._id} className="border-none bg-white shadow-sm shadow-gray-200/50 rounded-2xl group hover:shadow-xl hover:shadow-gray-200 transition-all duration-500 overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm transition-colors group-hover:bg-primary group-hover:border-primary">
                                        <Monitor className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <Badge variant="outline" className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 px-3">
                                        {screen.rows}R x {screen.columns}C
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl font-black tracking-tighter uppercase text-[#1F2533]">{screen.name}</CardTitle>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{screen.theaterId?.name || "Global Venue"}</p>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <div className="flex items-center justify-between mb-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                    <span>{screen.totalSeats} Active Units</span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                                    <span>Cloud Verified</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <Button onClick={() => handleEdit(screen)} className="bg-gray-50 hover:bg-gray-100 text-[#1F2533] font-black text-[10px] uppercase h-12 rounded-xl tracking-widest space-x-2 border border-gray-100 shadow-sm transition-all hover:-translate-y-0.5">
                                        <Settings2 className="h-4 w-4" />
                                        <span>Scale Unit</span>
                                    </Button>
                                    <Button onClick={() => handleDelete(screen._id)} variant="ghost" className="text-rose-500 hover:bg-rose-50 font-black text-[10px] uppercase h-12 rounded-xl tracking-widest">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                            <div className="h-1 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Card>
                    ))}

                    {screens.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-white border border-dashed border-gray-200 rounded-3xl flex flex-col items-center">
                            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <LayoutGrid className="h-10 w-10 text-gray-300" />
                            </div>
                            <h2 className="text-2xl font-black text-[#1F2533] uppercase tracking-tighter">No Units Configured</h2>
                            <p className="text-gray-400 font-medium text-sm mt-2 max-w-xs mx-auto">Digitize your physical screens into smart auditoriums using our infinite canvas tool.</p>
                            <Button onClick={handleCreateNew} className="mt-8 bg-primary hover:bg-rose-700 font-black h-14 px-10 rounded-xl uppercase tracking-widest text-[11px] text-white shadow-xl shadow-rose-500/20">Init First Screen</Button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

