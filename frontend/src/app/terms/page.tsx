"use client";

import { motion } from "framer-motion";
import { Info, Gavel, Calendar, CheckCircle2 } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-12"
      >
        <div className="space-y-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-[#1F2533]">Terms of Service</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Effective: April 2026</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
            <section className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Calendar className="text-primary h-6 w-6" /> BOOKING POLICY
                </h2>
                <ul className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                    <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-primary h-4 w-4 shrink-0 mt-1" />
                        Bookings are only confirmed after physical payment at the venue.
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-primary h-4 w-4 shrink-0 mt-1" />
                        Online selections are "held" for 15 minutes before expiring.
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-primary h-4 w-4 shrink-0 mt-1" />
                        QR codes must be presented for payment verification.
                    </li>
                </ul>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-black flex items-center gap-3 border-l-4 border-primary pl-4 uppercase tracking-tighter text-[#1F2533]">
                    CANCELLATION
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                    Bookings can be cancelled or seats swapped up to **2 hours before showtime**. Once a ticket is scanned and paid at the theater, no refunds will be issued.
                </p>
            </section>
        </div>

        <section className="bg-white border border-gray-100 p-10 rounded-3xl space-y-6 shadow-sm">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-[#1F2533]">
                <Gavel className="h-6 w-6 text-primary" /> LEGAL DISCLAIMER
            </h2>
            <p className="text-gray-500 leading-relaxed font-medium">
                ShowBook acts as a reservation platform. Availability of seats and screening quality are the sole responsibility of the individual theater partners. By using this service, you agree to comply with the code of conduct of the respective cinema halls.
            </p>
        </section>

        <footer className="pt-20 border-t border-gray-100 text-center opacity-60">
            <p className="text-sm font-black uppercase tracking-widest leading-none text-[#1F2533]">ShowBook Entertainment Pvt Ltd</p>
            <p className="text-[10px] mt-2 font-bold tracking-widest uppercase text-gray-400">Kathmandu, Nepal</p>
        </footer>
      </motion.div>
    </div>
  );
}
