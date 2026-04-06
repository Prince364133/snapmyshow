"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingClientProps {
  showtime: any;
}

export default function BookingClient({ showtime }: BookingClientProps) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Derive display values from real showtime data
  const movieTitle = showtime?.movieId?.title || "Movie";
  const theaterName = showtime?.theaterId?.name || "Theater";
  const showDate = showtime?.date
    ? new Date(showtime.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
    : "";
  const showDay = showtime?.date
    ? new Date(showtime.date).toLocaleDateString("en-IN", { weekday: "short" })
    : "";
  const showTime = showtime?.startTime || "";
  const subtitle = `${showDate}, ${showTime} at ${theaterName}`;

  const toggleSeat = (seatId: string, isOccupied: boolean) => {
    if (isOccupied) return;
    if (selectedSeats.includes(seatId)) {
        setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
        if (selectedSeats.length < 10) setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    const movieId = window.location.pathname.split('/')[2];
    router.push(`/movies/${movieId}/booking/review/${showtime._id}?seats=${selectedSeats.join(',')}`);
  };

  const ROWS = ["N", "M", "L", "K", "J", "I", "H", "G", "F"];

  return (
    <div className="bg-white min-h-screen pb-32 font-sans flex flex-col">
      {/* Top Header */}
      <div className="border-b border-gray-100 py-6 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center">
            <button onClick={() => router.back()} className="text-gray-400 absolute left-4 md:left-8 top-1/2 -translate-y-1/2 hover:text-primary hover:bg-primary/5 p-3 rounded-2xl transition-all">
                <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex-1 text-center">
                <h1 className="text-2xl font-black text-[#1F2533] uppercase tracking-tighter leading-none mb-1">{movieTitle}</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{subtitle}</p>
            </div>
        </div>
      </div>

      {/* Info Legend Area */}
      <div className="bg-gray-50/50 border-b border-gray-100 py-4">
        <div className="container mx-auto px-8 max-w-5xl flex items-center justify-center space-x-8 text-[9px] font-black uppercase tracking-widest text-gray-400">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md border-2 border-gray-100 bg-white" />
                <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-primary" />
                <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-gray-100 flex items-center justify-center">
                     <svg className="w-2 h-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <span>Sold</span>
            </div>
        </div>
      </div>

      {/* Seat Selection Area */}
      <div className="flex-1 container mx-auto px-4 max-w-4xl py-16 flex flex-col items-center select-none overflow-x-auto">
          <div className="text-[10px] font-black text-gray-400 tracking-widest mb-12 uppercase bg-gray-50 px-4 py-1 rounded-full border border-gray-100">Classic Slot : ₹250.00</div>
          
          <div className="flex flex-col gap-3 min-w-max">
             {ROWS.map(row => (
                  <div key={row} className="flex items-center justify-center gap-10 mb-1">
                      <div className="w-4 text-[11px] text-gray-400 font-black uppercase text-center shrink-0">{row}</div>
                      
                      {/* Left Block */}
                      <div className="flex gap-2 w-[160px] justify-end">
                          {['N'].includes(row) && [1,2,3,4,5,6].map(i => <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} />)}
                          {['M','L','K','J','I','H'].includes(row) && [1,2,3].map(i => <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} />)}
                          {['G'].includes(row) && []}
                          {['F'].includes(row) && [1,2,3,4,5,6,7,8,9,10].map(i => <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} />)}
                      </div>

                      {/* Center Block */}
                      <div className="flex gap-2">
                          {/* Empty gap for paths */}
                          {(['G', 'F'].includes(row)) ? null : (
                              <div className="flex gap-2 w-[310px] justify-center">
                                  {row === 'M' && [<Seat key="mx1" id="" occupied />, <Seat key="mx2" id="" occupied />, 6,7,8,9,10,11,12].map(i => typeof i === 'number' ? <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} /> : i)}
                                  {['L','K'].includes(row) && [4,5,6,7,8,9,10,11,12].map(i => <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} />)}
                                  {row === 'J' && [4,5,6, <Seat key="jx1" id="" occupied/>, <Seat key="jx2" id="" occupied/>, <Seat key="jx3" id="" occupied/>, <Seat key="jx4" id="" occupied/>, 11,12].map(i => typeof i === 'number' ? <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} /> : i)}
                                  {row === 'I' && [4,5,6,7,8,9,10,11,12, <Seat key="ix1" id="" occupied/>].map(i => typeof i === 'number' ? <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} /> : i)}
                                  {row === 'H' && [4,5,6,7,8,9,10,11,12].map(i => <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} />)}
                              </div>
                          )}
                      </div>

                      {/* Right Block */}
                      <div className="flex gap-2 w-[200px] justify-start">
                          {row === 'N' && [<Seat key="nx1" id="" occupied />, <Seat key="nx2" id="" occupied />, <Seat key="nx3" id="" occupied />, 10,11,12].map(i => typeof i === 'number' ? <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} /> : i)}
                          {['M','L','K'].includes(row) && [13,14,'path',15,16,17].map(i => i === 'path' ? <div key="p" className="w-[40px]" /> : <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} />)}
                          {['J'].includes(row) && [13,'path',14,15,16].map(i => i === 'path' ? <div key="p" className="w-[40px]" /> : <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} />)}
                          {['I','H'].includes(row) && [13,'path',14,15,16].map(i => i === 'path' ? <div key="p" className="w-[40px]" /> : <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} />)}
                          {['G'].includes(row) && [11,12,13].map(i => <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} />)}
                          {['F'].includes(row) && [11,12,13].map(i => <Seat key={`${row}${i}`} id={`${row}${i}`} onClick={toggleSeat} selected={selectedSeats.includes(`${row}${i}`)} />)}
                      </div>
                  </div>
             ))}
          </div>
          
          <div className="mt-20 mb-8 relative w-full max-w-xl flex justify-center flex-col items-center">
             <div className="w-full h-2 bg-gradient-to-t from-gray-100 to-transparent rounded-full opacity-50"></div>
             <div className="text-[10px] uppercase font-black text-gray-400 tracking-[0.3em] bg-white z-10 px-8 mt-4 border-t-2 border-gray-50 pt-2 shadow-sm">All eyes this way</div>
          </div>
      </div>
      
      {/* Floating Bottom Action Bar */}
      {selectedSeats.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-50">
             <div className="container mx-auto px-12 max-w-5xl h-24 flex items-center justify-between">
                 <div className="flex flex-col">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Selected Overview</span>
                     <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-[#1F2533] uppercase tracking-tighter">{selectedSeats.length} Seats</span>
                        <span className="text-primary font-black text-lg ml-2">₹{selectedSeats.length * 250}.00</span>
                     </div>
                 </div>
                 <button 
                  onClick={handleProceed} 
                  className="bg-primary hover:bg-rose-600 text-white px-20 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 flex items-center gap-3"
                 >
                     Check Review <ChevronLeft className="h-4 w-4 rotate-180" />
                 </button>
             </div>
          </div>
      )}
    </div>
  );
}

function Seat({ id, occupied, selected, onClick }: { id: string, occupied?: boolean, selected?: boolean, onClick?: (id: string, o: boolean) => void }) {
    if (occupied) {
        return (
            <div className="w-9 h-9 rounded-xl border-2 border-gray-100 flex items-center justify-center bg-gray-50 cursor-not-allowed">
               <svg className="w-3 h-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
        )
    }

    return (
        <div 
          onClick={() => onClick && onClick(id, false)}
          className={cn(
            "w-9 h-9 rounded-xl border-2 flex items-center justify-center text-[10px] font-black cursor-pointer transition-all hover:border-primary hover:text-primary active:scale-90",
            selected ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110 z-10" : "border-gray-100 text-gray-400 hover:bg-primary/5 bg-white"
          )}
        >
            {id && id.replace(/[A-Z]/g, '')}
        </div>
    )
}
