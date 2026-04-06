"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Ticket, 
  ScanLine,
  Loader2,
  MapPin,
  Clock,
  ShieldCheck,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { trackGAEvent, GAEVENTS } from "@/lib/analytics";

// Lazy-load the heavy QR Scanner library
const QRScanner = dynamic(() => import("@/components/Scanner/QRScanner"), {
  ssr: false,
  loading: () => <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 animate-pulse"><Loader2 className="h-8 w-8 animate-spin text-gray-300 mb-2" /><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Optical Unit</span></div>
});

export default function ScannerPage() {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  async function onScanSuccess(decodedText: string) {
    if (loading) return;
    setLoading(true);
    setScanning(false);
    setError(null);

    try {
        const { data } = await api.post("/scanner/validate", { token: decodedText });
        trackGAEvent(GAEVENTS.QR_SCANNED, { bookingId: data.data.id, movie: data.data.movieTitle });
        setBooking(data.data);
    } catch (err: any) {
        setError(err.response?.data?.error?.message || "Invalid QR Code or Expired Ticket.");
        toast({ variant: "destructive", title: "Authentication Error", description: "Verification sequence failed." });
    } finally {
        setLoading(false);
    }
  }

  function onScanFailure(error: any) {}

  const handleApprove = async () => {
    setApproving(true);
    try {
        await api.post("/scanner/approve", { bookingId: booking.id });
        trackGAEvent(GAEVENTS.PAYMENT_APPROVED, { bookingId: booking.id, amount: booking.totalAmount });
        toast({ title: "Authorized", description: "Pass activated and status synchronized." });
        setBooking(null);
        setScanning(true);
    } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: "Failed to authorize settlement." });
    } finally {
        setApproving(false);
    }
  };

  const resetScanner = () => {
    setBooking(null);
    setError(null);
    setScanning(true);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Universal Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-50 flex items-center justify-between">
           <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-[#1F2533] rounded-lg flex items-center justify-center shadow-lg shadow-black/10">
                    <ScanLine className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-[#1F2533] uppercase tracking-tighter leading-none">Gate Controller</h1>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">v4.0 Protocol • Secure Validation Hub</p>
                </div>
           </div>
           {!scanning && (
               <Button onClick={resetScanner} variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-[#1F2533] hover:bg-gray-100 h-10 px-4 rounded-xl border border-gray-100">
                   Restart Scanner
               </Button>
           )}
      </div>

      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
            {scanning ? (
                <motion.div 
                    key="scanner"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-10"
                >
                    <div className="relative group">
                        {/* Scanner Viewport */}
                        <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl shadow-black/5 p-4 z-10 transition-all group-hover:scale-[1.01]">
                            <QRScanner onScanSuccess={onScanSuccess} onScanFailure={onScanFailure} />
                            {/* Scanning Overlay Overlay */}
                            <div className="absolute inset-0 pointer-events-none p-12">
                                <div className="h-full w-full border-2 border-primary/40 border-dashed rounded-2xl relative flex items-center justify-center overflow-hidden">
                                     <div className="absolute top-0 inset-x-0 h-0.5 bg-primary/40 animate-scan-line-v2" />
                                     <ScanLine className="h-12 w-12 text-primary/10 opacity-20" />
                                </div>
                            </div>
                        </div>
                        {/* Shadow Glow */}
                        <div className="absolute -inset-4 bg-primary/5 blur-3xl -z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black text-[#1F2533] uppercase tracking-widest">Optical Unit Active</span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 max-w-[280px] leading-relaxed uppercase tracking-widest">
                            Position the customer Pass QR within the viewfinder for automated decryption
                        </p>
                    </div>
                </motion.div>
            ) : loading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-6">
                    <div className="h-20 w-20 relative">
                         <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <ShieldCheck className="h-8 w-8 text-primary animate-pulse" />
                         </div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black uppercase tracking-tighter text-[#1F2533]">Decrypting Token</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Querying secure cloud ledger...</p>
                    </div>
                </div>
            ) : error ? (
                <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-12 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-rose-500/5 overflow-hidden relative"
                >
                    <div className="absolute top-0 inset-x-0 h-1 bg-rose-500" />
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 mx-auto mb-6">
                        <XCircle className="h-8 w-8 text-rose-500" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[#1F2533] mb-2">Access Denied</h2>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-10">{error}</p>
                    <Button onClick={resetScanner} className="w-full bg-[#1F2533] hover:bg-black text-white font-black h-14 rounded-xl uppercase tracking-widest text-[11px] transition-all">
                        Initialize New Scan
                    </Button>
                </motion.div>
            ) : booking ? (
                <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <Card className="border-none bg-white shadow-2xl shadow-black/5 rounded-3xl overflow-hidden">
                        {/* Status Ribbon */}
                        <div className="bg-emerald-500 px-8 py-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-white">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-[10px] font-black tracking-widest uppercase">Identity Match Confirmed</span>
                            </div>
                            <div className="text-[9px] font-black text-white opacity-60 uppercase tracking-widest">Secured</div>
                        </div>
                        
                        <CardContent className="p-10">
                            {/* Movie Branding */}
                            <div className="flex gap-8 items-start mb-10 pb-10 border-b border-gray-50">
                                <div className="h-28 w-20 rounded-xl bg-gray-100 relative overflow-hidden border border-gray-100 shadow-lg shadow-black/10 shrink-0">
                                    <Image src={booking.posterUrl || `https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200`} alt="movie" fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Badge variant="outline" className="border-gray-200 text-gray-400 font-bold uppercase text-[8px] tracking-[0.2em] mb-3 px-2">Now Screening</Badge>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-[#1F2533] truncate mb-2">{booking.movieTitle}</h2>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center text-[10px] font-black text-primary uppercase tracking-widest">
                                            <Monitor className="mr-1.5 h-3.5 w-3.5" /> {booking.seats} Units
                                        </div>
                                        <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <Clock className="mr-1.5 h-3.5 w-3.5" /> {booking.startTime}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Profile */}
                            <div className="grid grid-cols-2 gap-10 mb-10">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Patron Name</Label>
                                    <div className="flex items-center font-black uppercase text-lg text-[#1F2533] tracking-tighter truncate">
                                        <User className="mr-2 h-4 w-4 text-primary" /> {booking.userName}
                                    </div>
                                </div>
                                <div className="space-y-2 text-right">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Assigned Unit(s)</Label>
                                    <div className="font-black uppercase text-lg text-[#1F2533] tracking-tighter">
                                        {booking.seats}
                                    </div>
                                </div>
                            </div>

                            {/* Billing Settlement */}
                            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between relative group overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Collectible Proceeds</p>
                                    <div className="text-5xl font-black tracking-tighter text-[#1F2533] leading-none">
                                        <span className="text-xl font-bold text-gray-300 mr-2 tracking-normal italic leading-none">INR</span>
                                        {booking.totalAmount}
                                    </div>
                                </div>
                                <div className="bg-white h-16 w-16 rounded-xl shadow-sm flex flex-col items-center justify-center p-2 relative z-10 border border-gray-50">
                                     <Ticket className="h-5 w-5 text-primary mb-1" />
                                     <span className="text-[8px] font-black uppercase text-gray-400 text-center leading-none">Settlement Point</span>
                                </div>
                                <div className="absolute right-0 bottom-0 top-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </CardContent>

                        <div className="p-10 pt-0 flex gap-4">
                            <Button onClick={resetScanner} variant="ghost" className="flex-1 h-14 font-black uppercase tracking-widest text-[10px] rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#1F2533] transition-all">
                                Reject Entry
                            </Button>
                            <Button onClick={handleApprove} disabled={approving} className="flex-[2] h-14 bg-[#1F2533] hover:bg-black text-white font-black uppercase tracking-widest text-[11px] rounded-xl shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5">
                                {approving ? (
                                    <span className="flex items-center space-x-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                                        <span>Authorizing Node...</span>
                                    </span>
                                ) : "Approve & Collect"}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            ) : null}
            </AnimatePresence>
        </div>
      </div>

      {/* Global CSS for the Custom Scan Line */}
      <style jsx global>{`
        @keyframes scan-line-v2 {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
        }
        .animate-scan-line-v2 {
            animation: scan-line-v2 4s infinite linear;
        }
      `}</style>
    </div>
  );
}

