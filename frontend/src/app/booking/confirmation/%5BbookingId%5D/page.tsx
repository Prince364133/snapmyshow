"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Download, Home, Ticket, MapPin, Calendar, Clock, Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import Image from "next/image";

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}`);
        setBooking(data.data);
      } catch (err) {
        console.error("Failed to fetch booking", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleDownload = async () => {
    try {
        const response = await api.get(`/bookings/${bookingId}/download`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Ticket-${booking.showtimeId.movieId.title.replace(/\s+/g, '-')}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        console.error("Failed to download ticket", err);
    }
  };

  if (loading) return (
    <div className="bg-[#F2F5F9] min-h-screen py-20">
        <div className="container mx-auto px-4 flex flex-col items-center space-y-8 max-w-4xl">
            <Skeleton className="h-24 w-24 rounded-full bg-white shadow-sm" />
            <Skeleton className="h-10 w-64 bg-white shadow-sm" />
            <Skeleton className="h-[500px] w-full rounded-[40px] bg-white shadow-sm" />
        </div>
    </div>
  );

  if (!booking) return <div className="py-20 text-center font-black uppercase  tracking-tighter">Booking not found.</div>;

  const { showtimeId, seats, totalAmount } = booking;
  const { movieId, theaterId, screenId, startTime, date } = showtimeId;

  return (
    <div className="bg-[#F2F5F9] min-h-screen py-12 pb-32">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center space-y-6 mb-12">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-green-50 z-10 border-4 border-white shadow-xl"
            >
                <div className="bg-green-500 rounded-full p-4">
                    <Check className="h-10 w-10 text-white stroke-[4px]" />
                </div>
            </motion.div>
            <div className="space-y-2">
                <h1 className="text-4xl font-black  tracking-tighter uppercase text-[#1F2533]">Woohoo! It's Booked.</h1>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Enjoy your movie experience with BookMyShow</p>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Ticket Card */}
            <Card className="lg:col-span-2 overflow-hidden border-none shadow-[0_10px_50px_rgba(0,0,0,0.06)] bg-white rounded-[40px]">
                <div className="bg-primary px-8 py-6 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-2">
                        <Ticket className="h-5 w-5" />
                        <span className="text-[11px] font-black tracking-[0.2em] uppercase">Movie E-Ticket</span>
                    </div>
                    <Badge variant="outline" className="border-white/30 text-white font-black bg-white/10 uppercase tracking-widest text-[9px] px-3 py-1">#{booking._id.slice(-6).toUpperCase()}</Badge>
                </div>
                
                <CardContent className="p-0">
                    <div className="p-8 space-y-8">
                        <div className="flex flex-col sm:flex-row gap-8">
                            <div className="h-56 w-40 shrink-0 overflow-hidden rounded-2xl border border-gray-100 relative shadow-lg">
                                <Image src={movieId.posterUrl} alt={movieId.title} fill className="object-cover" sizes="160px" />
                            </div>
                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-[#1F2533] uppercase leading-none  tracking-tight">{movieId.title}</h2>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                            <span>8.5/10</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-gray-100 text-[10px] font-bold text-gray-500 rounded-sm">U/A</Badge>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">2D</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-2">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Date</span>
                                        <div className="flex items-center font-black text-[#1F2533] text-sm"><Calendar className="mr-1.5 h-4 w-4 text-primary" /> {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Time</span>
                                        <div className="flex items-center font-black text-[#1F2533] text-sm"><Clock className="mr-1.5 h-4 w-4 text-primary" /> {startTime}</div>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Venue</span>
                                        <div className="flex items-start font-black text-[#1F2533] text-sm">
                                            <MapPin className="mr-1.5 h-4 w-4 text-primary shrink-0 mt-0.5" /> 
                                            <span>{theaterId.name}, {theaterId.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider Line (Dashed) */}
                        <div className="relative py-4">
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-100" />
                            <div className="absolute -left-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#F2F5F9]" />
                            <div className="absolute -right-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#F2F5F9]" />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8 items-end">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none block">Seats ({seats.length})</span>
                                    <div className="flex flex-wrap gap-2 text-[#1F2533]">
                                        {seats.map((s: any) => (
                                            <span key={`${s.row}${s.col}`} className="bg-[#F2F5F9] border border-gray-100 text-xs font-black px-3 py-1 rounded-sm uppercase">
                                                {s.row}{s.col}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none block">Screen</span>
                                    <span className="text-sm font-black text-[#1F2533] uppercase ">{screenId.name}</span>
                                </div>
                            </div>
                            <div className="text-right space-y-1 p-6 bg-[#FDF2F4] rounded-3xl border border-primary/10">
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest block leading-none">Total Payment</span>
                                <div className="text-3xl font-black text-[#1F2533]">Rs. {totalAmount}</div>
                                <p className="text-[10px] font-bold text-primary ">Mode: {booking.status === 'PAID' ? 'Secured Online' : 'Pay at Theater'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Side Actions & QR Card */}
            <div className="space-y-6">
                <Card className="border-none shadow-[0_10px_50px_rgba(0,0,0,0.06)] bg-white rounded-[40px] p-8 flex flex-col items-center text-center space-y-6">
                    <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-[0_10px_35px_rgba(0,0,0,0.03)] relative h-56 w-56">
                        <Image 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(booking.qrToken)}&color=1f2533&bgcolor=ffffff`} 
                            alt="Booking QR Code" 
                            fill
                            className="p-4"
                            sizes="224px"
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Pass</p>
                        <p className="text-xl font-black text-[#1F2533]  leading-tight uppercase tracking-tight">SCAN AT COUNTER</p>
                    </div>
                    
                    <div className="flex flex-col w-full space-y-3">
                        <Button onClick={handleDownload} size="lg" className="w-full bg-primary hover:bg-rose-700 h-14 font-black tracking-widest group rounded-2xl uppercase shadow-lg shadow-rose-500/10">
                            <Download className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                            SAVE TICKET
                        </Button>
                        <Button variant="outline" className="w-full border-gray-100 hover:bg-gray-50 h-14 font-black tracking-widest rounded-2xl uppercase text-[11px]">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Ticket
                        </Button>
                    </div>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="ghost" className="bg-white border-none shadow-sm hover:bg-gray-50 py-10 flex flex-col h-auto rounded-[32px]" onClick={() => router.push('/')}>
                        <Home className="mb-2 h-6 w-6 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#1F2533]">Return Home</span>
                    </Button>
                    <Button variant="ghost" className="bg-white border-none shadow-sm hover:bg-gray-50 py-10 flex flex-col h-auto rounded-[32px]" onClick={() => router.push('/my-bookings')}>
                        <Ticket className="mb-2 h-6 w-6 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#1F2533]">My Tickets</span>
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
