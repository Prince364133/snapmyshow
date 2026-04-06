"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Info, Armchair, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { trackGAEvent, GAEVENTS } from "@/lib/analytics";

export default function SeatSelectionPage() {
  const { showtimeId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [showtime, setShowtime] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchShowtime = async () => {
      try {
        const { data } = await api.get(`/showtimes/${showtimeId}`);
        setShowtime(data.data);
      } catch (err) {
        console.error("Failed to fetch showtime", err);
        toast({ variant: "destructive", title: "Error", description: "Failed to load seat layout." });
      } finally {
        setLoading(false);
      }
    };
    fetchShowtime();
  }, [showtimeId, toast]);

  const seatLayout = useMemo(() => {
    if (!showtime?.screenId?.seatLayout) return [];
    
    // Group seats by row
    return showtime.screenId.seatLayout.reduce((acc: any, seat: any) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push({
        ...seat,
        isBooked: showtime.bookedSeats?.some((bs: any) => bs.row === seat.row && bs.col === seat.col)
      });
      return acc;
    }, {});
  }, [showtime]);

  const toggleSeat = (seat: any) => {
    if (seat.isBooked) return;
    
    const isSelected = selectedSeats.find(s => s.row === seat.row && s.col === seat.col);
    if (isSelected) {
        setSelectedSeats(selectedSeats.filter(s => !(s.row === seat.row && s.col === seat.col)));
    } else {
        if (selectedSeats.length >= 10) {
            toast({ variant: "destructive", title: "Limit reached", description: "You can select up to 10 seats only." });
            return;
        }
        setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;
    trackGAEvent(GAEVENTS.SEATS_SELECTED, { 
        movieId: showtime?.movieId?._id, 
        count: selectedSeats.length, 
        totalAmount 
    });
    setBookingLoading(true);
    try {
        const { data } = await api.post("/bookings", {
            showtimeId,
            seats: selectedSeats.map(s => ({ 
                row: s.row, 
                col: s.col, 
                type: s.type, 
                price: s.price 
            }))
        });
        if (data.success) {
            trackGAEvent(GAEVENTS.BOOKING_CONFIRMED, { 
                bookingId: data.data._id, 
                movieId: showtime.movieId._id, 
                amount: totalAmount,
                seatsCount: selectedSeats.length
            });
            toast({ title: "Booking Confirmed!", description: "Your ticket has been generated and sent to your email." });
            router.push(`/booking/confirmation/${data.data._id}`);
        }
    } catch (err: any) {
        toast({ 
            variant: "destructive", 
            title: "Booking Failed", 
            description: err.response?.data?.error || "Failed to process booking." 
        });
    } finally {
        setBookingLoading(false);
    }
  };

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  if (loading) return <div className="container py-20"><Skeleton className="h-[600px] w-full rounded-2xl" /></div>;
  if (!showtime) return <div className="py-20 text-center">Showtime not found</div>;

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-40">
      {/* Top Header Row */}
      <div className="bg-white border-b border-gray-200 py-3 mb-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <ChevronLeft className="h-6 w-6 cursor-pointer opacity-40 hover:opacity-100" onClick={() => router.back()} />
                <div>
                   <h1 className="text-lg font-bold text-[#333333] leading-none">{showtime.movieId.title}</h1>
                   <p className="text-[11px] text-[#333333]/60 font-medium mt-1 uppercase tracking-tight">
                        {showtime.theaterId.name} | {new Date(showtime.date).toDateString()}, {showtime.startTime}
                   </p>
                </div>
            </div>
            <div className="hidden md:flex border border-gray-200 rounded-md py-1 px-3 items-center space-x-2 text-[10px] font-bold">
                 <span>{selectedSeats.length} Tickets</span>
                 <X className="h-3 w-3 opacity-40 cursor-pointer" onClick={() => setSelectedSeats([])} />
            </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="bg-white/40 mb-10 py-2 border-b border-gray-200/50">
          <div className="container mx-auto px-4 flex justify-center space-x-8 text-[10px] font-bold uppercase tracking-widest text-[#333333]/60">
              <div className="flex items-center space-x-2"><div className="h-4 w-4 bg-white border border-gray-300 rounded-sm" /> <span>Available</span></div>
              <div className="flex items-center space-x-2"><div className="h-4 w-4 bg-[#4abd5d] border border-[#4abd5d] rounded-sm" /> <span>Selected</span></div>
              <div className="flex items-center space-x-2"><div className="h-4 w-4 bg-[#ebebeb] border border-[#ebebeb] rounded-sm" /> <span>Sold</span></div>
          </div>
      </div>

      {/* Seat Selection Main Area */}
      <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center w-full max-w-5xl overflow-x-auto min-h-[500px]">
             {/* Seat Grid */}
             <div className="flex flex-col space-y-3 pt-10">
                {Object.entries(seatLayout).map(([row, rowSeats]: [string, any]) => (
                    <div key={row} className="flex items-center space-x-4">
                        <span className="w-8 text-[11px] font-bold text-[#333333]/40 text-center">{row}</span>
                        <div className="flex space-x-1.5">
                            {rowSeats.sort((a: any, b: any) => a.col - b.col).map((seat: any) => {
                                const isSelected = selectedSeats.find(s => s.row === seat.row && s.col === seat.col);
                                return (
                                    <button
                                        key={`${seat.row}${seat.col}`}
                                        disabled={seat.isBooked}
                                        onClick={() => toggleSeat(seat)}
                                        className={`h-6 w-6 rounded-sm border text-[8px] font-bold transition-all ${
                                            seat.isBooked 
                                            ? 'bg-[#ebebeb] border-[#ebebeb] text-transparent cursor-not-allowed' 
                                            : isSelected
                                            ? 'bg-[#4abd5d] border-[#4abd5d] text-white'
                                            : 'bg-white border-[#4abd5d]/40 text-[#4abd5d]/60 hover:bg-[#4abd5d] hover:text-white hover:border-[#4abd5d]'
                                        }`}
                                    >
                                        {seat.col}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
             </div>

             {/* Screen Indicator */}
             <div className="mt-24 w-full flex flex-col items-center max-w-3xl">
                <div className="h-1 w-full bg-gray-200 rounded-full" />
                <span className="text-[10px] font-bold text-gray-400 mt-2 tracking-[0.4em] uppercase">All eyes this way</span>
             </div>
          </div>
      </div>

      {/* Pay Bar */}
      {selectedSeats.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-6 px-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <div className="container mx-auto max-w-5xl flex items-center justify-between">
                  <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#333333]">Selected Seats: {selectedSeats.map(s => `${s.row}${s.col}`).join(', ')}</span>
                      <span className="text-xl font-bold text-[#333333]">Total Amount: Rs. {totalAmount}</span>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-rose-600 px-12 h-14 rounded-lg font-bold text-lg shadow-xl shadow-rose-500/20 active:scale-95 transition-transform"
                    onClick={handleBooking}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? "Processing..." : `Pay Rs. ${totalAmount}`}
                  </Button>
              </div>
          </div>
      )}
    </div>
  );
}
