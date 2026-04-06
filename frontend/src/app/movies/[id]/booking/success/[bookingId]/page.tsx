import { cookies } from "next/headers";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SuccessClient from "./SuccessClient";


export const dynamic = 'force-dynamic';

async function getBooking(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    // Add timeout to prevent hang
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6005'}/api/bookings/${id}`, { 
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) return null;
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
