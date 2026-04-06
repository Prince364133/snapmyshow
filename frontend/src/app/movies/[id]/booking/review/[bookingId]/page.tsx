import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewClient from "./ReviewClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6005";

// At the review stage, [bookingId] param actually holds the showtimeId.
// The booking is created only when the user clicks "Proceed To Pay".
async function getShowtime(showtimeId: string) {
  try {
    const res = await fetch(`${API}/api/showtimes/${showtimeId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch (err) {
    console.error("Failed to fetch showtime for review", err);
    return null;
  }
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string; bookingId: string }>;
}) {
  const { bookingId } = await params; // bookingId = showtimeId at this point
  const showtime = await getShowtime(bookingId);

  return (
    <Suspense
      fallback={
        <div className="container py-20">
          <Skeleton className="h-[600px] w-full" />
        </div>
      }
    >
      <ReviewClient showtime={showtime} showtimeId={bookingId} />
    </Suspense>
  );
}
