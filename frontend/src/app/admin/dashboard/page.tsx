"use client";

import { useEffect, useState } from "react";
import { 
  Ticket, 
  TrendingUp, 
  Plus, 
  Monitor, 
  Clock, 
  Users, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import Link from "next/link";

export default function TheaterAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [theater, setTheater] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch theater data to check status
        const theaterRes = await api.get("/theaters/my");
        if (theaterRes.data.success && theaterRes.data.data.length > 0) {
            const currentTheater = theaterRes.data.data[0];
            setTheater(currentTheater);
            
            // Only fetch stats if an ID is present
            try {
                const statsRes = await api.get(`/theaters/${currentTheater._id}/stats`);
                if (statsRes.data.success) {
                   setStats(statsRes.data.data);
                }
            } catch(e) {
                console.log("Could not fetch stats yet", e);
            }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const isPending = theater?.status === 'PENDING';

  const StatTile = ({ title, value, icon: Icon, colorClass, borderClass }: any) => (
    <Card className={`border-none shadow-sm bg-white group hover:shadow-md transition-all duration-300 rounded-3xl`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</p>
                <h3 className="text-3xl font-black text-[#1F2533] tracking-tighter uppercase">{loading ? <Skeleton className="h-9 w-20" /> : (value || 0)}</h3>
            </div>
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${colorClass}`}>
                <Icon className="h-7 w-7 text-white" />
            </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 w-full">
        {/* Status Banner */}
        {isPending && (
            <div className="mb-8 bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start space-x-4 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                    <h3 className="text-amber-800 font-black uppercase tracking-tight text-lg">Partner Account In Review</h3>
                    <p className="text-amber-700/80 font-bold text-sm mt-1 max-w-3xl leading-relaxed">
                        Your theater profile and business documents are currently being reviewed by our super administration team. 
                        You can begin setting up your screens, pricing layers, and movie layouts now, but your venue will not be visible on the public SnapMyShow platform until review is complete.
                    </p>
                </div>
            </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 space-y-6 md:space-y-0">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-[#1F2533] uppercase tracking-tighter leading-none">Venue Management</h1>
                <p className="text-gray-500 text-sm font-medium">Monitoring real-time sessions and booking revenue flow.</p>
            </div>
            <div className="flex space-x-4">
                <Button variant="outline" className="border-gray-100 bg-white hover:bg-gray-50 font-black uppercase tracking-tighter h-14 px-8 rounded-2xl shadow-sm text-xs text-[#1F2533]">
                    Daily Audit
                </Button>
                <Button className="bg-primary hover:bg-rose-700 font-black tracking-tighter h-14 px-8 rounded-2xl uppercase space-x-2 shadow-lg shadow-rose-500/20 text-xs text-white">
                    <Plus className="h-5 w-5" />
                    <span>Schedule Show</span>
                </Button>
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
            <StatTile 
                title="Total Sales" 
                value={stats?.totalBookings} 
                icon={Ticket} 
                colorClass="bg-rose-600 shadow-lg shadow-rose-500/20" 
            />
            <StatTile 
                title="Revenue" 
                value={stats?.totalRevenue ? `Rs. ${stats.totalRevenue}` : 'Rs. 0'} 
                icon={TrendingUp} 
                colorClass="bg-[#22C55E] shadow-lg shadow-emerald-500/20" 
            />
            <StatTile 
                title="Screens" 
                value="03" 
                icon={Monitor} 
                colorClass="bg-[#3B82F6] shadow-lg shadow-blue-500/20" 
            />
            <StatTile 
                title="Traffic" 
                value="1.2k" 
                icon={Users} 
                colorClass="bg-[#F59E0B] shadow-lg shadow-amber-500/20" 
            />
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
            {/* Live Management Panel */}
            <Card className="lg:col-span-2 border-none shadow-sm shadow-gray-200/50 bg-white rounded-3xl overflow-hidden">
                <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-[#1F2533] uppercase tracking-tighter">Live Sessions</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Occupancy & Playback</CardDescription>
                    </div>
                    <Button variant="ghost" className="text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-widest h-8 rounded-full">Refresh Stats</Button>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl bg-gray-50" />)
                    ) : (
                        <div className="flex flex-col space-y-6 p-12 text-center items-center bg-[#F8FAFC] rounded-3xl border border-gray-100">
                            <div className="h-16 w-16 rounded-2xl border border-gray-200 bg-white flex items-center justify-center shadow-sm">
                                <Clock className="h-8 w-8 text-gray-300" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-[#1F2533] uppercase tracking-tighter">Quiet Time</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] max-w-[280px]">
                                    No active movie sessions are currently running on your screens. 
                                </p>
                            </div>
                            <Button className="bg-primary hover:bg-rose-700 font-black tracking-widest h-12 px-10 rounded-2xl text-white uppercase text-[10px]">
                                Browse Schedule
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sidebar Navigation & Quick Config */}
            <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                    <Link href="/scanner" className="block group">
                        <Card className="border border-gray-100 shadow-sm bg-[#1F2533] rounded-3xl p-6 transition-all duration-300 hover:shadow-lg">
                            <div className="flex items-center space-x-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl tracking-tighter uppercase shadow-md transition-transform group-hover:scale-105">QR</div>
                                <div className="flex-1">
                                    <h3 className="font-black text-white uppercase tracking-tight text-sm">Gate Validation</h3>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Ticket Entry Scanner</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Card>
                    </Link>

                    <Card className="border border-gray-100 shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all">
                        <CardHeader className="p-6 border-b border-gray-50">
                            <CardTitle className="text-sm font-black uppercase tracking-tight text-[#1F2533]">Screen Inventory</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {['PVR Pebble Screen 1', 'PVR Pebble Screen 2', 'PVR Pebble Screen 3'].map((screen, idx) => (
                                <div key={screen} className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group cursor-pointer ${idx !== 2 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="space-y-0.5">
                                        <span className="text-[10px] font-black uppercase text-[#1F2533] tracking-widest">{screen}</span>
                                        <p className="text-[9px] font-bold text-emerald-500 uppercase">Operational</p>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] font-black uppercase border-gray-100 group-hover:border-primary/40 group-hover:text-primary transition-all rounded-full px-3">Manage</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}
