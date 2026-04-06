"use client";

import { motion } from "framer-motion";
import { Sparkles, Gift, Smartphone, CreditCard, ChevronRight, Star, Heart, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GiftCardsPage() {
    const cards = [
        {
            title: "Snap Gold Card",
            val: "$50",
            desc: "The ultimate cinema gift. Valid for 1 year.",
            badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
            label: "BEST SELLER"
        },
        {
            title: "Couple's Treat",
            val: "$100",
            desc: "Ideal for romantic movie nights & combos.",
            badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
            label: "SPECIAL"
        },
        {
            title: "Family Pack",
            val: "$250",
            desc: "For the big blockbusters and group treats.",
            badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
            label: "BULK DEAL"
        }
    ];

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Header Section */}
            <header className="container mx-auto px-4 md:px-10 pt-24 pb-12 space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(248,68,100,0.5)]" />
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#1F2533] uppercase">Snap Gift Cards</h1>
                </div>
                <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest max-w-xl">
                    Share the magic of cinema. High-performance gift credits for movies, popcorn, and premium theater experiences.
                </p>
            </header>

            <div className="container mx-auto px-4 md:px-10">
                {/* Gift Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                    {cards.map((card, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group block"
                        >
                            <div className="p-8 border-b border-gray-100 bg-[#F8FAFC] flex flex-col items-center text-center relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                                <div className="absolute top-4 right-4">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${card.badgeColor}`}>{card.label}</span>
                                </div>
                                <div className="h-16 w-16 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Gift className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="text-5xl font-black text-[#1F2533] tracking-tighter mb-1">{card.val}</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Credit</p>
                            </div>
                            
                            <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                                <div className="space-y-2 text-center">
                                    <h3 className="text-base font-black text-[#1F2533] uppercase tracking-tight group-hover:text-primary transition-colors">{card.title}</h3>
                                    <p className="text-[12px] font-medium text-gray-500 leading-relaxed">{card.desc}</p>
                                </div>
                                
                                <Button className="w-full h-12 bg-primary hover:bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-rose-500/20 transition-all">
                                    BUY VOUCHER
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Features & Options */}
                <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Why Choose  */}
                    <div className="space-y-8 flex flex-col justify-center">
                        <div className="flex items-center space-x-4">
                            <div className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(248,68,100,0.5)]" />
                            <h2 className="text-3xl font-black tracking-tighter text-[#1F2533] uppercase">Why Choose Snap Cards?</h2>
                        </div>
                        <div className="space-y-6">
                            {[
                                { icon: <Heart className="h-5 w-5 text-primary" />, title: "Personal Message", desc: "Add a custom note for your loved ones." },
                                { icon: <Flame className="h-5 w-5 text-orange-500" />, title: "Instant Delivery", desc: "Digital codes delivered via email in seconds." },
                                { icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />, title: "Universal Validity", desc: "Valid across all 50+ theater locations." }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-start space-x-5 p-2 group hover:bg-gray-50 rounded-2xl transition-all">
                                    <div className="h-14 w-14 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center shrink-0 group-hover:border-gray-200">
                                        {feature.icon}
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-[#1F2533]">{feature.title}</h4>
                                        <p className="text-[12px] font-medium text-gray-500 mt-1">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Manage Card  */}
                    <div className="bg-[#1F2533] p-12 rounded-3xl text-white shadow-2xl flex flex-col justify-center">
                        <div className="space-y-6">
                            <div className="bg-white/10 border border-white/10 p-4 rounded-2xl w-fit inline-flex shadow-sm">
                                <CreditCard className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tighter uppercase text-white leading-tight">Already <br/>Have a Card?</h3>
                                <p className="text-[12px] font-medium text-white/50 leading-relaxed">Check your balance or redeem your card for credits into your account.</p>
                            </div>
                            
                            <div className="pt-6 space-y-4 border-t border-white/10">
                                <Button className="w-full h-14 bg-primary hover:bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-rose-500/20">
                                    REDEEM SNAPCARD
                                </Button>
                                <Button variant="outline" className="w-full h-14 bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-[11px]">
                                    CHECK BALANCE
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-32 text-center flex flex-col items-center space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-gray-50 px-6 py-4 rounded-full border border-gray-100">
                         <Smartphone className="h-4 w-4 text-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mobile Tickets are always included</span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">SnapMyShow Entertainment Pvt Ltd</p>
                </div>
            </div>
        </div>
    );
}

// Ensure ShieldCheck is available
function ShieldCheck(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
