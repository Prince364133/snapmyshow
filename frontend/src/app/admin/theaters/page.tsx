"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Building2, 
  Plus, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  ChevronRight,
  MoreVertical,
  Globe,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function AdminTheaterList() {
  const { toast } = useToast();
  const [theaters, setTheaters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      const { data } = await api.get("/theaters/my");
      setTheaters(data.data);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch your venues." });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case 'PENDING': return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case 'REJECTED': return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-40 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#1F2533] uppercase tracking-tighter">Your Venues</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your cinema properties and business assets</p>
        </div>
        <Link href="/admin/theaters/new">
          <Button className="bg-primary hover:bg-rose-700 text-white font-black uppercase tracking-widest text-[11px] h-12 px-8 rounded-xl shadow-lg shadow-rose-500/20 space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add New Venue</span>
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-8 py-10 max-w-6xl">
        {loading ? (
          <div className="grid gap-6">
            {[1, 2].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
          </div>
        ) : theaters.length > 0 ? (
          <div className="grid gap-6">
            {theaters.map((theater) => (
              <motion.div 
                key={theater._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border border-gray-100 bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 rounded-2xl overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      {/* Image Section */}
                      <div className="relative w-full md:w-64 aspect-video md:aspect-auto overflow-hidden">
                        <Image 
                          src={theater.coverImageUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"} 
                          alt={theater.name} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusColor(theater.status)}`}>
                              {theater.status}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>

                          <h3 className="text-2xl font-black text-[#1F2533] uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors leading-none">
                            {theater.name}
                          </h3>
                          
                          <div className="flex flex-wrap gap-y-2 gap-x-6 mb-6">
                            <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              <MapPin className="h-3.5 w-3.5 mr-2 text-primary" /> {theater.city}
                            </div>
                            <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              <Clock className="h-3.5 w-3.5 mr-2 text-primary" /> {theater.openingTime} - {theater.closingTime}
                            </div>
                            {theater.phoneNumber && (
                              <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <Phone className="h-3.5 w-3.5 mr-2 text-primary" /> {theater.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                          <div className="flex items-center space-x-4">
                            <div className="flex -space-x-2">
                              {theater.features?.slice(0, 3).map((f: string, i: number) => (
                                <div key={i} className="h-6 px-2 bg-gray-50 border border-gray-100 rounded text-[8px] font-black uppercase flex items-center text-gray-400">
                                  {f}
                                </div>
                              ))}
                            </div>
                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Verified Venue</span>
                          </div>
                          
                          <Link href={`/admin/theaters/${theater._id}`}>
                            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-[#1F2533] hover:text-primary space-x-2 p-0 h-auto">
                              <span>Configure Venue</span>
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Business Status Side Bar */}
                      <div className="bg-gray-50/50 border-l border-gray-100 w-full md:w-56 p-8 flex flex-col justify-center items-center text-center space-y-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${theater.status === 'ACTIVE' ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                          {theater.status === 'ACTIVE' ? <ShieldCheck className="h-6 w-6 text-emerald-500" /> : <AlertCircle className="h-6 w-6 text-gray-300" />}
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Business Identity</p>
                          <p className="text-[10px] font-bold text-[#1F2533] uppercase leading-tight">
                            {theater.businessInfo?.taxId || "Pending Verification"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white border border-dashed border-gray-200 rounded-3xl flex flex-col items-center">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Building2 className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-[#1F2533] uppercase tracking-tighter mb-2">No Venues Found</h2>
            <p className="text-gray-500 text-sm font-medium mb-8 max-w-sm">You haven't added any cinema properties yet. Start your journey as a theater partner today.</p>
            <Link href="/admin/theaters/new">
              <Button size="lg" className="bg-primary hover:bg-rose-700 text-white font-black uppercase tracking-widest h-14 px-10 rounded-xl shadow-xl shadow-rose-500/20">
                Register First Venue
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
