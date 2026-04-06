"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, CheckCircle, Ticket, MapPin, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function SuccessClient({ booking: initialBooking, bookingId }: { booking: any, bookingId: string }) {
  const [booking, setBooking] = useState(initialBooking);
  const [loading, setLoading] = useState(!initialBooking);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // If we don't have booking or it's missing deep data, fetch it
    if (!booking || !booking.showtimeId?.movieId) {
      const fetchBooking = async () => {
        try {
          const { data } = await api.get(`/bookings/${bookingId}`);
          if (data.success) {
            setBooking(data.data);
          }
        } catch (err) {
          console.error("Client: Failed to fetch booking", err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    } else {
      setLoading(false);
    }
  }, [bookingId, booking]);

  const handleDownloadTicket = async () => {
    if (!booking) return;
    setDownloading(true);
    try {
      // Backend handles ticket streaming directly via Buffer
      const response = await api.get(`/bookings/${booking._id}/download`, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ticket-${booking.showtimeId?.movieId?.title?.replace(/\s+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
      // fallback fail silently or show toast
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !booking) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-black uppercase tracking-widest text-[#1F2533]">Finalizing your ticket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-16 md:py-24 px-4 overflow-hidden relative">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
            {/* Top Success Header */}
            <div className="bg-white pt-16 pb-12 px-10 text-center relative border-b border-gray-100">
                <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20 transform rotate-6 hover:rotate-0 transition-transform">
                    <CheckCircle className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-4xl font-black text-[#1F2533] uppercase tracking-tighter mb-4">Booking Confirmed</h1>
                <p className="text-[12px] font-black uppercase tracking-widest text-emerald-600/80">Your ticket is ready for scanning</p>
                
                {/* Visual Ticket Cutout Effects */}
                <div className="absolute -bottom-6 -left-6 h-12 w-12 bg-white border border-gray-100 rounded-full z-10" />
                <div className="absolute -bottom-6 -right-6 h-12 w-12 bg-white border border-gray-100 rounded-full z-10" />
            </div>

            {/* Content Body */}
            <div className="pt-12 pb-16 px-12 bg-white relative">
               
               {/* QR Code Container */}
               <div className="w-64 h-64 mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200 p-8 flex flex-col items-center justify-center border-4 border-white z-20 relative hover:scale-105 transition-transform cursor-pointer mb-12">
                  {booking.qrToken && booking.qrToken !== 'PENDING_GENERATION' ? (
                      <QRCodeSVG value={booking.qrToken} size={200} level="H" />
                  ) : (
                      <div className="h-full w-full bg-gray-50 animate-pulse rounded-3xl" />
                  )}
               </div>

               <div className="text-center mb-16">
                   <p className="text-[10px] font-black tracking-[0.3em] text-gray-300 uppercase mb-3">Verification ID</p>
                   <div className="inline-block bg-gray-50 px-8 py-3 rounded-2xl border border-gray-100">
                       <p className="text-xl font-black text-[#1F2533] tracking-[0.2em]">{booking._id.substring(0,8).toUpperCase()}</p>
                   </div>
               </div>
               
               {/* High Contrast Ticket Info */}
               <div className="bg-[#1F2533] rounded-[2.5rem] p-10 border border-white/10 shadow-2xl shadow-[#1F2533]/20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                   
                   <div className="grid grid-cols-2 gap-y-10 gap-x-8 relative z-10">
                       <div className="col-span-2 border-b border-white/10 pb-8 flex items-center justify-between">
                           <div className="flex items-center text-white">
                               <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mr-5 shadow-inner">
                                   <Ticket className="h-6 w-6 text-primary" />
                               </div>
                               <div>
                                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Movie Presentation</p>
                                   <p className="text-2xl font-black text-white uppercase tracking-tighter">{booking.showtimeId?.movieId?.title || 'Unknown Title'}</p>
                                   <p className="text-[11px] font-black text-primary uppercase tracking-widest mt-2">CLASSIC • {booking.seats?.map((s: any) => `${s.row}${s.col}`).join(', ')}</p>
                               </div>
                           </div>
                       </div>
                       
                       <div className="col-span-1">
                           <div className="flex items-center text-white">
                               <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center mr-4">
                                   <CalendarDays className="h-5 w-5 text-white/40" />
                               </div>
                               <div>
                                   <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Show Date</p>
                                   <p className="text-sm font-black text-white uppercase tracking-tighter">{new Date(booking.showtimeId?.date || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                               </div>
                           </div>
                       </div>
                       
                       <div className="col-span-1">
                           <div className="flex items-center text-white">
                               <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center mr-4">
                                   <Clock className="h-5 w-5 text-white/40" />
                               </div>
                               <div>
                                   <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Show Time</p>
                                   <p className="text-sm font-black text-white uppercase tracking-tighter">{booking.showtimeId?.startTime || '22:30 PM'}</p>
                               </div>
                           </div>
                       </div>
                       
                       <div className="col-span-2 border-t border-white/10 pt-10 mt-2 flex items-center justify-between">
                           <div className="flex items-center">
                               <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center mr-4">
                                   <MapPin className="h-5 w-5 text-white/40" />
                               </div>
                               <div>
                                   <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Cinema Venue</p>
                                   <p className="text-sm font-black text-white uppercase tracking-tighter">{booking.showtimeId?.theaterId?.name || 'Local Theater'}</p>
                               </div>
                           </div>
                           <div className="text-right">
                               <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Pay At Theatre</p>
                               <div className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Rs. {booking.totalAmount}</div>
                           </div>
                       </div>
                   </div>
               </div>
               
               <div className="text-center mt-8 opacity-20">
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-[#1F2533]">Verified by SnapMyShow Secure Systems</p>
               </div>

               <div className="mt-16 flex flex-col gap-4">
                   <button 
                    onClick={handleDownloadTicket} 
                    disabled={downloading} 
                    className="w-full bg-[#1F2533] hover:bg-black text-white h-20 rounded-[1.5rem] flex items-center justify-center font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-2xl active:scale-95 group relative overflow-hidden"
                   >
                       <div className="absolute -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:left-0 transition-all opacity-0 group-hover:opacity-100" />
                       <Download className="h-5 w-5 mr-3 group-hover:-translate-y-1 transition-transform" />
                       {downloading ? "Formatting Ticket..." : "Download Official Ticket"}
                   </button>
                   <button 
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-white text-[#1F2533] h-16 rounded-[1.5rem] flex items-center justify-center font-black uppercase tracking-widest text-[10px] transition-all border-2 border-gray-100 hover:border-primary hover:text-primary active:scale-95"
                   >
                       Return to Home
                   </button>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
