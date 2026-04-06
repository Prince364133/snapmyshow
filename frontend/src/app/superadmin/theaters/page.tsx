"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  CheckCircle2, 
  XCircle,
  MapPin,
  FileText,
  AlertCircle,
  Clock,
  ShieldCheck,
  Search,
  ChevronRight,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

type TheaterStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export default function SuperAdminTheatersQueue() {
  const [pendingTheaters, setPendingTheaters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingTheaters = async () => {
    try {
      const { data } = await api.get("/theaters/admin/pending");
      if (data.success) {
        setPendingTheaters(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTheaters();
  }, []);

  const handleStatusUpdate = async (id: string, status: TheaterStatus) => {
    setActionLoading(id);
    try {
      const { data } = await api.patch(`/theaters/${id}/status`, { status });
      if (data.success) {
        // Remove from pending list
        setPendingTheaters(prev => prev.filter(t => t._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Secondary Admin Navbar */}
      <div className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-[#1F2533]">Control Panel</span>
            <span className="text-gray-300 mx-2">/</span>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Venue Approvals</span>
        </div>
      </div>

      <div className="container mx-auto px-8 py-10 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 space-y-6 md:space-y-0">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-[#1F2533] uppercase tracking-tighter leading-none">Partner Onboarding</h1>
            <p className="text-gray-500 text-sm font-medium">Review and verify new venue partnership applications.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search applications..." 
              className="pl-10 h-12 bg-white border-gray-100 rounded-2xl shadow-sm focus-visible:ring-primary/20 text-xs font-bold"
            />
          </div>
        </div>

        <div className="grid gap-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)
          ) : pendingTheaters.length === 0 ? (
            <Card className="border border-dashed border-gray-200 bg-gray-50/50 shadow-none rounded-3xl p-16">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-[#1F2533] tracking-tighter">All Caught Up!</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    There are no pending venue applications at this moment.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            pendingTheaters.map(theater => (
              <Card key={theater._id} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Visual/Status Column */}
                    <div className="md:w-64 bg-[#1F2533] p-8 flex flex-col justify-between text-white relative overflow-hidden group">
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 space-y-4">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
                          <Building2 className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none uppercase font-black text-[9px] tracking-widest mb-3 rounded-full px-3">In Review</Badge>
                          <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight line-clamp-2">
                            {theater.name}
                          </h3>
                        </div>
                      </div>
                      <div className="relative z-10 flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-8">
                        <Clock className="h-3 w-3" />
                        <span>Applied {new Date(theater.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 p-8 grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" /> Location Details
                          </p>
                          <p className="text-sm font-bold text-[#1F2533]">{theater.address}</p>
                          <p className="text-xs text-gray-500 font-medium">{theater.city}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                            <FileText className="h-3 w-3 mr-1" /> Registration Data
                          </p>
                          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                            <div className="flex justify-between">
                              <span className="text-[10px] font-bold text-gray-500">Tax ID (GSTIN):</span>
                              <span className="text-[10px] font-black text-[#1F2533]">{theater.businessInfo?.taxId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[10px] font-bold text-gray-500">License No:</span>
                              <span className="text-[10px] font-black text-[#1F2533]">{theater.businessInfo?.licenseNumber || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact & Actions */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                            <Users className="h-3 w-3 mr-1" /> Applicant Contact
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-[#1F2533]">{theater.ownerId?.name || 'Owner Name'}</p>
                            <p className="text-xs text-primary font-medium">{theater.ownerId?.email || 'owner@example.com'}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-8">
                          <Button 
                            variant="outline" 
                            className="flex-1 h-12 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-black uppercase text-xs tracking-widest"
                            onClick={() => handleStatusUpdate(theater._id, 'REJECTED')}
                            disabled={actionLoading !== null}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button 
                            className="flex-1 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white font-black uppercase text-xs tracking-widest"
                            onClick={() => handleStatusUpdate(theater._id, 'ACTIVE')}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === theater._id ? (
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Approve Partner
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
