import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BookingClient from "./BookingClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6005";

async function getShowtime(id: string, movieId: string) {
  // Handle mock showtime IDs for demonstration/testing
  if (id && id.startsWith('s')) {
    try {
      const movieRes = await fetch(`${API}/api/movies/${movieId}`, { cache: "no-store" });
      const movieData = await movieRes.json();
      const movie = movieData.data;

      // Map mock IDs to times to match ShowtimesClient
      const mockTimes: Record<string, string> = {
        "s1": "10:30 PM",
        "s2": "11:10 PM",
        "s3": "11:00 PM",
        "s4": "11:40 PM",
        "s5": "11:15 PM"
      };

      const mockTheaters: Record<string, string> = {
        "s1": "Wave Cinemas, Gurugram",
        "s2": "Cinepolis Airia Mall",
        "s3": "HDFC Millennia PVR MGF",
        "s4": "HDFC Millennia PVR MGF",
        "s5": "Pepsi PVR Ambience"
      };

      return {
        _id: id,
        movieId: movie || { title: "Demo Movie" },
        theaterId: { name: mockTheaters[id] || "Demo Theater", city: "Gurugram" },
        startTime: mockTimes[id] || "10:00 PM",
        date: new Date(),
        format: "2D",
        bookedSeats: []
      };
    } catch (err) {
      console.error("Failed to fetch movie for mock showtime", err);
      return null;
    }
  }

  try {
    const res = await fetch(`${API}/api/showtimes/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch (err) {
    console.error("Failed to fetch showtime", err);
    return null;
  }
}

export default async function BookingPage({ params }: { params: Promise<{ id: string, showtimeId: string }> }) {
  const { id, showtimeId } = await params;
  const showtime = await getShowtime(showtimeId, id);

  if (!showtime) return <div className="py-20 text-center">Showtime not found</div>;


  return (
    <Suspense fallback={<div className="container py-20"><Skeleton className="h-[600px] w-full" /></div>}>
      <BookingClient showtime={showtime} />
    </Suspense>
  );
}
