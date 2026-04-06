import { cookies } from "next/headers";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SuccessClient from "./SuccessClient";


async function getBooking(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;
    
    // Pass cookies to internal server-side fetch
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6005'}/api/bookings/${id}`, { 
      cache: 'no-store',
      headers: {
        'Cookie': `token=${token}; refreshToken=${refreshToken}`
      }
    });
    
    if (!res.ok) {
       console.warn(`Booking fetch failed: ${res.status}`);
       return null;
    }
    const data = await res.json();
    return data.data ?? null;
  } catch (err) {
    console.error("Failed to fetch booking", err);
    return null;
  }
}

export default async function SuccessPage({ params }: { params: Promise<{ id: string, bookingId: string }> }) {
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);

  return (
    <Suspense fallback={<div className="container py-20 text-center"><Skeleton className="h-[600px] w-full max-w-3xl mx-auto" /></div>}>
      <SuccessClient booking={booking} bookingId={bookingId} />
    </Suspense>
  );
}
