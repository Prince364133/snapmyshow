"use client";

import { motion } from "framer-motion";
import { Sparkles, Gift, Smartphone, CreditCard, ChevronRight, Star, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function OffersPage() {
    const offers = [
        {
            title: "Student Discount",
            desc: "Get 50% off on all movie tickets with a valid student ID.",
            tag: "MOST POPULAR",
            icon: <Star className="h-6 w-6 text-primary" />,
            bgColor: "bg-rose-50 border-rose-100"
        },
        {
            title: "First Booking Reward",
            desc: "Enjoy a free large popcorn on your first theater booking via SnapMyShow.",
            tag: "NEW USERS",
            icon: <Gift className="h-6 w-6 text-emerald-500" />,
            bgColor: "bg-emerald-50 border-emerald-100"
        },
        {
            title: "Weekend Flash Sale",
            desc: "Flash deals on all Friday and Saturday shows. Join the hold queue now!",
            tag: "LIMITED TIME",
            icon: <Flame className="h-6 w-6 text-orange-500" />,
            bgColor: "bg-orange-50 border-orange-100"
        },
        {
            title: "Bank Card Cashback",
            desc: "Up to 30% cashback when you pay with premium bank cards at theaters.",
            tag: "PARTNER OFFER",
            icon: <CreditCard className="h-6 w-6 text-blue-500" />,
            bgColor: "bg-blue-50 border-blue-100"
        }
    ];

    return (
        <div className="min-h-screen bg-white pb-32">
            <header className="container mx-auto px-4 md:px-10 pt-24 pb-8 space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(248,68,100,0.5)]" />
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#1F2533] uppercase">Exclusive Offers</h1>
                </div>
                <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest max-w-xl">
                    Catch the best deals on movies and snack combos.
                </p>
            </header>

            <div className="container mx-auto px-4 md:px-10">
                {/* Hero Promotion Widget */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full h-[350px] rounded-2xl overflow-hidden group shadow-lg border border-gray-100 mt-4"
                >
                    <Image 
                        src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600" 
                        alt="Hero Banner" 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center max-w-2xl text-white space-y-5">
                        <div className="flex items-center space-x-2 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 w-fit">
                           <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest leading-none">SNAP DEALS LIVE</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight">Mega Summer Mela</h2>
                        <p className="text-[13px] font-medium text-white/80 leading-relaxed max-w-md bg-black/20 p-2 rounded backdrop-blur-sm">
                            Use code <span className="text-primary font-black px-1">SNAPSUMMER50</span> to get instant booking holds at 50% discount
                        </p>
                        <Button className="h-12 bg-primary hover:bg-rose-600 text-white px-8 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-rose-500/20 w-fit mt-2">
                            CLAIM OFFER
                        </Button>
                    </div>
                </motion.div>

                {/* Offers Grid */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {offers.map((offer, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col space-y-6 group cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className={`h-14 w-14 rounded-2xl border ${offer.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    {offer.icon}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                                    {offer.tag}
                                </span>
                            </div>
                            <div className="space-y-2 flex-1">
                                <h3 className="text-xl font-black text-[#1F2533] uppercase tracking-tight group-hover:text-primary transition-colors">{offer.title}</h3>
                                <p className="text-[13px] text-gray-500 leading-relaxed">{offer.desc}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Smartphone className="h-4 w-4" />
                                    <span>Mobile Exclusive</span>
                                </div>
                                <Button variant="ghost" className="text-primary font-black uppercase tracking-widest text-[11px] p-0 h-auto hover:bg-transparent group-hover:text-rose-600 transition-colors">
                                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Corporate Banner */}
                <div className="mt-20 bg-[#1F2533] p-12 rounded-3xl text-center space-y-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-[-50%] right-[-10%] h-64 w-64 bg-primary/20 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-[-50%] left-[-10%] h-64 w-64 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
                    
                    <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary backdrop-blur-md border border-white/10 z-10 shadow-sm">
                        <Sparkles className="h-8 w-8" />
                    </div>
                    <div className="max-w-2xl space-y-3 z-10">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Corporate Booking Deals</h2>
                        <p className="text-[13px] text-white/50 leading-relaxed">Organizing a bulk movie trip? Get special rates, food combos, and premium seating blocks for your entire team.</p>
                    </div>
                    <Button className="h-12 bg-primary hover:bg-rose-600 text-white px-10 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-rose-500/20 z-10">
                        CONTACT SALES
                    </Button>
                </div>
            </div>
        </div>
    );
}
