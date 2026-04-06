"use client";

import { useEffect, useState } from "react";
import { 
  LineChart, 
  Users, 
  Film, 
  Building2, 
  TrendingUp, 
  Plus, 
  Package, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card className="border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2 space-y-0">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">{title}</CardTitle>
        <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
            <Icon className="h-4 w-4 text-gray-600" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-4xl font-black tracking-tighter uppercase text-[#1F2533]">{loading ? <Skeleton className="h-10 w-24" /> : value}</div>
        <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 flex items-center">
            {trend && <span className="text-green-500 mr-1.5 flex items-center font-black"><TrendingUp className="h-3 w-3 mr-0.5" /> +12%</span>}
            {description}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
            <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tighter uppercase text-[#1F2533]">Platform Analytics</h1>
                <p className="text-gray-500 font-medium max-w-lg text-sm">Global overview of movies, theaters, and revenue performance.</p>
            </div>
             <div className="flex space-x-4">
                <Button className="bg-primary hover:bg-rose-700 font-black tracking-widest h-14 px-10 uppercase space-x-3 rounded-2xl text-[11px] shadow-lg shadow-rose-500/20 text-white">
                    <Plus className="h-5 w-5" />
                    <span>Add Movie</span>
                </Button>
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <StatCard 
                title="Total Revenue" 
                value={`Rs. ${stats?.totalRevenue || 0}`} 
                icon={TrendingUp} 
                description="Total collected"
                trend={true}
            />
            <StatCard 
                title="Active Users" 
                value={stats?.totalUsers || 0} 
                icon={Users} 
                description="Registered members"
                trend={true}
            />
            <StatCard 
                title="Movie Catalog" 
                value={stats?.totalMovies || 0} 
                icon={Film} 
                description="Approved releases"
            />
            <StatCard 
                title="Partner Theaters" 
                value={stats?.totalTheaters || 0} 
                icon={Building2} 
                description="Onboarded venues"
            />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
            {/* Recent Bookings / Activity */}
            <Card className="lg:col-span-2 border border-gray-100 bg-white shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-gray-50 p-8">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter text-[#1F2533]">Recent Activities</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-gray-400">Live transaction feed</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-none" />)
                        ) : (
                            <div className="p-16 text-center text-gray-400 text-sm flex flex-col items-center justify-center">
                                <LineChart className="h-12 w-12 mb-4 text-gray-200" />
                                <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">No recent activity data to display</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions / Theater Approvals */}
            <Card className="border border-gray-100 bg-white shadow-sm rounded-3xl">
                <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter text-[#1F2533]">Onboarding Queue</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-gray-400">Pending theater approvals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-8 pb-8 pt-0">
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Building2 className="h-10 w-10 text-gray-300" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase px-6 tracking-widest leading-relaxed">Queue is currently empty.<br/>No applications found.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
