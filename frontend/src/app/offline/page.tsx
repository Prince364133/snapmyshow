"use client";

import { WifiOff, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 shadow-sm border border-primary/20">
        <WifiOff className="h-10 w-10 text-primary" />
      </div>
      
      <h1 className="mb-4 text-4xl font-black tracking-tighter uppercase text-[#1F2533]">
        You are Offline
      </h1>
      
      <p className="mb-12 max-w-md text-gray-500 font-medium uppercase tracking-widest text-xs">
        ShowBook requires an active internet connection to synchronize movie screenings and secure your bookings. Please check your network and try again.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild className="bg-primary hover:bg-rose-700 font-black px-8 h-12 uppercase tracking-widest text-xs rounded-xl shadow-sm">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Go Home
          </Link>
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()} className="border border-gray-200 bg-white hover:bg-gray-50 h-12 px-8 font-black uppercase tracking-widest text-xs rounded-xl text-gray-600 shadow-sm">
          <RefreshCcw className="mr-2 h-4 w-4" /> Retry Connection
        </Button>
      </div>
    </div>
  );
}
