"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Ticket, Calendar, Clock, MapPin, ChevronRight, PlayCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function MyBookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
        try {
            const { data } = await api.get("/bookings/my");
            setBookings(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchBookings();
  }, []);

  const handleDownload = async (bookingId: string, movieTitle: string) => {
    try {
        const response = await api.get(`/bookings/${bookingId}/download`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Ticket-${movieTitle}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    } catch (err) {
        toast({ variant: "destructive", title: "Download Failed", description: "Failed to generate PDF ticket." });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'PAID':
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 font-bold tracking-tight text-[10px] px-2 py-0.5 rounded-full uppercase">Ticket Confirmed</Badge>;
        case 'PENDING_PAYMENT':
            return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-bold tracking-tight text-[10px] px-2 py-0.5 rounded-full uppercase">Pay at Theater</Badge>;
        case 'CANCELLED':
            return <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold tracking-tight text-[10px] px-2 py-0.5 rounded-full uppercase">Cancelled</Badge>;
        case 'EXPIRED':
            return <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 font-bold tracking-tight text-[10px] px-2 py-0.5 rounded-full uppercase">Expired</Badge>;
        default:
            return <Badge variant="outline" className="rounded-full">{status}</Badge>;
    }
  };

  return (
    <div className="bg-[#F2F5F9] min-h-screen">
        <div className="bg-white border-b border-gray-100 py-10">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-black text-[#1F2533] tracking-tight">Your Bookings</h1>
                    <p className="text-gray-500 text-sm font-medium">History of all your movie experiences with BookMyShow</p>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-6xl">
            {loading ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl bg-white" />)}
                </div>
            ) : bookings.length > 0 ? (
                <div className="grid gap-8 lg:grid-cols-2">
                    {bookings.map((booking) => (
                        <Card key={booking._id} className="overflow-hidden border-none shadow-[0_4px_25px_rgba(0,0,0,0.05)] bg-white group hover:shadow-[0_8px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
                            <div className="flex flex-col sm:flex-row h-full">
                                {/* Poster Section */}
                                <div className="relative w-full sm:w-48 aspect-[2/3] sm:aspect-auto shrink-0 overflow-hidden">
                                    <Image 
                                        src={booking.showtimeId.movieId.posterUrl} 
                                        alt={booking.showtimeId.movieId.title} 
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                        sizes="(max-width: 640px) 100vw, 192px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex items-center text-white space-x-1 mb-1">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-[10px] font-bold">8.5/10</span>
                                        </div>
                                        <Badge className="bg-primary/95 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">U/A</Badge>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 flex flex-col">
                                    <CardHeader className="p-6 pb-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black text-[#1F2533] leading-tight group-hover:text-primary transition-colors cursor-pointer">{booking.showtimeId.movieId.title}</h3>
                                                <div className="flex items-center text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                                                    <span>{booking.showtimeId.movieId.language}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>2D</span>
                                                </div>
                                            </div>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="p-6 py-4 flex-1">
                                        <div className="grid grid-cols-2 gap-4 border-y border-gray-50 py-4 my-2">
                                            <div className="space-y-1.5">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Showtime Info</span>
                                                <div className="flex items-center text-xs font-bold text-[#1F2533]">
                                                    <Calendar className="mr-1.5 h-3.5 w-3.5 text-primary" />
                                                    <span>{new Date(booking.showtimeId.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                                <div className="flex items-center text-xs font-bold text-[#1F2533]">
                                                    <Clock className="mr-1.5 h-3.5 w-3.5 text-primary" />
                                                    <span>{booking.showtimeId.startTime}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Theater & Screen</span>
                                                <div className="flex items-start text-xs font-bold text-[#1F2533]">
                                                    <MapPin className="mr-1.5 h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                                    <span className="truncate">{booking.showtimeId.theaterId.name}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 pl-5">{booking.showtimeId.screenId.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Seats</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {booking.seats.map((s: any) => (
                                                        <span key={`${s.row}${s.col}`} className="bg-[#F2F5F9] text-[#1F2533] text-[10px] font-black px-2 py-0.5 rounded border border-gray-100">{s.row}{s.col}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Total</span>
                                                <span className="text-lg font-black text-[#1F2533]">Rs. {booking.totalAmount}</span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-0 flex border-t border-gray-50 h-14">
                                        <Button 
                                            onClick={() => handleDownload(booking._id, booking.showtimeId.movieId.title)} 
                                            variant="ghost" 
                                            className="flex-1 rounded-none h-full text-[10px] font-black tracking-widest uppercase hover:bg-gray-50 hover:text-primary transition-all border-r border-gray-50"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            E-Ticket
                                        </Button>
                                        <Link href={`/movies/${booking.showtimeId.movieId._id}`} className="flex-1">
                                            <Button variant="ghost" className="w-full rounded-none h-full text-[10px] font-black tracking-widest uppercase hover:bg-gray-50 transition-all">
                                                Movie Info
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center max-w-sm mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-12">
                    <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Ticket className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1F2533] uppercase tracking-tighter mb-4">No Show Yet!</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">You haven't booked any movies recently. Why not explore the latest blockbusters?</p>
                    <Link href="/">
                        <Button className="bg-primary hover:bg-rose-700 text-white font-black tracking-widest h-14 w-full shadow-lg shadow-rose-500/20 rounded-2xl uppercase">
                            BOOK TICKETS NOW
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    </div>
  );
}
