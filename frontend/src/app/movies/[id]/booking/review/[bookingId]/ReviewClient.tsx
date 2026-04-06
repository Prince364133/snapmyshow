"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ChevronRight, ChevronDown, CheckCircle2, TicketPercent, Coffee, CreditCard, Info, User } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface ReviewClientProps {
  showtime: any;
  showtimeId: string;
}

export default function ReviewClient({ showtime, showtimeId }: ReviewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Derive real info from showtime
  const movie = showtime?.movieId;
  const theater = showtime?.theaterId;
  const screen = showtime?.screenId;
  const movieTitle = movie?.title || "Movie";
  const theaterName = theater?.name || "Theater";
  const screenName = screen?.name || "";
  const posterUrl = movie?.posterUrl || "";
  const showDate = showtime?.date
    ? new Date(showtime.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })
    : "";
  const showTime = showtime?.startTime || "";
  const language = showtime?.language || movie?.language?.[0] || "";
  const format = showtime?.format || "2D";

  const seatsParam = searchParams.get('seats') || 'L4, M5';
  const seats = seatsParam.split(',').map(s => {
      // transform standard "L4" into object expected by backend seats
      const trimmed = s.trim();
      return {
          row: trimmed.charAt(0),
          col: parseInt(trimmed.slice(1)) || 1,
          type: "Classic",
          price: 250
      };
  });
  
  const ticketPrice = 250;
  const numTickets = seats.length;
  const orderAmount = ticketPrice * numTickets;
  const bookingFeePerTicket = 42.48; 
  const totalBookingFee = bookingFeePerTicket * numTickets;
  const grandTotal = orderAmount + totalBookingFee;

  const handleCheckout = async () => {
      if (!user) {
          router.push("/login?redirect=checkout");
          return;
      }
      
      setIsProcessing(true);
      try {
          const movieId = window.location.pathname.split('/')[2];
          
          // MOCK BOOKING for demo/placeholder showtimes
          if (showtimeId && showtimeId.startsWith('s')) {
              await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
              const mockBookingId = `mock_${Math.random().toString(36).substr(2, 9)}`;
              router.push(`/movies/${movieId}/booking/success/${mockBookingId}`);
              return;
          }

          const payload = { showtimeId, seats };
          const { data } = await api.post("/bookings", payload);
          if (data.success && data.data) {
              const newBookingId = data.data._id;
              router.push(`/movies/${movieId}/booking/success/${newBookingId}`);
          }
      } catch (err: any) {
          console.error("Checkout failed:", err);
          const msg = err?.response?.data?.error || "Failed to process booking. Seats may be locked or session expired.";
          toast.error(msg);
          setIsProcessing(false);
      }
  };

  return (
    <div className="bg-white min-h-screen font-sans pb-32">
      {/* Top Main Navigation Header */}
      <div className="bg-white py-8 border-b border-gray-100">
          <div className="container mx-auto px-4 text-center">
              <h1 className="text-2xl font-black text-[#1F2533] uppercase tracking-tighter leading-none">Review your booking</h1>
          </div>
      </div>

      {/* Timer Bar */}
      <div className="bg-primary/5 py-4 border-b border-gray-100">
          <div className="container mx-auto px-4 text-center text-[#1F2533] text-[10px] font-black uppercase tracking-widest">
              Complete your booking in <span className="text-primary mx-1 font-black">7:56</span> minutes
          </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-12">
          <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Left Column - Booking Details */}
              <div className="flex-1 space-y-10">
                  
                  {/* Movie Info Card */}
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 overflow-hidden">
                      <div className="p-10">
                          <div className="flex justify-between items-start mb-8">
                              <div>
                                  <h2 className="text-3xl font-black text-[#1F2533] uppercase tracking-tighter leading-tight mb-4">{movieTitle}</h2>
                                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                      <span className="bg-[#1F2533] text-white px-2 py-0.5 rounded-md">UA13+</span>
                                      <span>{language}</span>
                                      <span>{format}</span>
                                  </div>
                                  <div className="text-[11px] font-black uppercase tracking-widest text-primary mt-4 hover:underline cursor-pointer">{theaterName}</div>
                              </div>
                              <div className="relative w-24 h-32 rounded-2xl overflow-hidden shrink-0 shadow-lg bg-gray-50 border-4 border-white">
                                  {posterUrl && <Image src={posterUrl} alt={movieTitle} fill className="object-cover" />}
                              </div>
                          </div>
                          
                          <div className="mb-10 space-y-1">
                              <p className="text-[11px] font-black uppercase tracking-widest text-[#1F2533]">{showDate}</p>
                              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">{showTime} <span className="opacity-40">(Approx. {movie?.duration ? `${Math.floor(movie.duration/60)}H ${movie.duration%60}M` : ''})</span></p>
                          </div>

                          <div className="border-t border-gray-100 flex items-start justify-between pt-10">
                              <div className="space-y-1">
                                  <p className="text-xl font-black text-[#1F2533] uppercase tracking-tighter">{numTickets} TICKET{numTickets > 1 ? 'S' : ''}</p>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">CLASSIC - {seats.map(s => `${s.row}${s.col}`).join(', ')}</p>
                                  {screenName && <p className="text-[10px] font-black uppercase tracking-widest text-primary">{screenName}</p>}
                              </div>
                              <div className="text-2xl font-black text-[#1F2533]">₹{orderAmount.toFixed(2)}</div>
                          </div>
                      </div>
                      
                      {/* Cancellation Banner inside card */}
                      <div className="bg-emerald-50/50 px-10 py-6 flex items-center justify-between border-t border-emerald-100 cursor-pointer group">
                          <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-600">
                              <CheckCircle2 className="h-4 w-4 mr-3" />
                              Cancellation Available
                          </div>
                          <ChevronRight className="h-4 w-4 text-emerald-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                  </div>

                  {/* Offers Section */}
                  <div>
                      <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-6 px-4">Offers For You</h3>
                      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 p-6 space-y-4">
                          <div className="flex items-center justify-between bg-gray-50/50 p-6 rounded-[1.5rem] cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all border border-transparent hover:border-gray-100 group">
                             <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 bg-[#1c8ad7]/10 rounded-2xl flex items-center justify-center">
                                    <Coffee className="h-6 w-6 text-[#1c8ad7]" />
                                 </div>
                                 <div>
                                     <p className="text-[13px] font-black text-[#1F2533] uppercase tracking-tighter">Free Snack Voucher</p>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available in select outlets</p>
                                 </div>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-primary px-4 py-2 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">Apply</span>
                          </div>
                          
                          <div className="flex items-center justify-between bg-gray-50/50 p-6 rounded-[1.5rem] cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all border border-transparent hover:border-gray-100 group">
                             <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                                    <TicketPercent className="h-6 w-6 text-rose-500" />
                                 </div>
                                 <div>
                                     <p className="text-[13px] font-black text-[#1F2533] uppercase tracking-tighter">Flat ₹200 OFF</p>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Limited time promotion</p>
                                 </div>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-primary px-4 py-2 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">Apply</span>
                          </div>
                      </div>
                  </div>

              </div>

              {/* Right Column - Payment & User Info */}
              <div className="w-full lg:w-[400px] space-y-8">
                 
                 {/* Payment Summary */}
                 <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 p-10 h-fit">
                     <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-10">Payment Summary</h3>
                     
                     <div className="space-y-6">
                         <div className="flex justify-between items-center">
                             <div className="text-[11px] font-black uppercase tracking-widest text-[#1F2533] flex items-center gap-2">Order Amount <ChevronDown className="h-3.5 w-3.5 text-gray-300" /></div>
                             <div className="text-[13px] font-black text-[#1F2533]">₹{orderAmount.toFixed(2)}</div>
                         </div>
                         
                         <div className="flex justify-between items-center text-[11px] text-[#1F2533]">
                             <div className="font-black uppercase tracking-widest flex items-center gap-2">Booking Fees <ChevronDown className="h-3.5 w-3.5 text-gray-300" /></div>
                             <div className="text-[13px] font-black text-[#1F2533]">₹{totalBookingFee.toFixed(2)}</div>
                         </div>
                     </div>
                     
                     <div className="border-t-2 border-dashed border-gray-100 mt-10 pt-10 flex justify-between items-center">
                         <h4 className="text-xl font-black text-[#1F2533] uppercase tracking-tighter">Grand Total</h4>
                         <span className="text-xl font-black text-primary">₹{grandTotal.toFixed(2)}</span>
                     </div>
                 </div>

                 {/* User Details */}
                 <div className="bg-[#1F2533] rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl shadow-gray-200">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                     <div className="flex justify-between items-center mb-10 relative z-10">
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Registered User</h3>
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary underline underline-offset-4 cursor-pointer hover:text-white transition-colors">Edit Profile</span>
                     </div>
                     
                     <div className="flex items-center gap-6 relative z-10">
                          <div className="h-16 w-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/10 shadow-xl">
                              <User className="h-8 w-8 text-white/80" />
                          </div>
                          <div>
                              <p className="text-xl font-black text-white uppercase tracking-tighter mb-1 truncate max-w-[180px]">{user?.name || user?.email || 'Guest'}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 truncate max-w-[180px]">{user?.email || ''}</p>
                          </div>
                      </div>
                 </div>

                 {/* Terms and conditions */}
                 <div className="bg-white rounded-3xl border border-gray-100 p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 group">
                     <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#1F2533]">
                         <Info className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
                         Terms and conditions
                     </div>
                     <ChevronRight className="h-4 w-4 text-gray-200 group-hover:text-primary transition-colors" />
                 </div>

                 {/* Floating Proceed Button */}
                 <button 
                    onClick={handleCheckout} 
                    disabled={isProcessing}
                    className="w-full bg-primary hover:bg-rose-600 text-white h-20 rounded-[1.5rem] flex items-center justify-between px-8 transition-all group mt-6 shadow-2xl shadow-primary/30 disabled:opacity-70 active:scale-95 hover:scale-[1.02]"
                 >
                      <div className="flex flex-col items-start">
                          <span className="text-xl font-black tracking-tighter leading-none">₹{grandTotal.toFixed(2)}</span>
                          <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] mt-1">Pay Now</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                          {isProcessing ? "Processing..." : "Confirm Booking"}
                          <ChevronRight className="h-5 w-5" />
                      </div>
                 </button>

              </div>
          </div>
      </div>
    </div>

  );
}
