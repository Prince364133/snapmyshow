"use client";

import { motion } from "framer-motion";
import { HelpCircle, Mail, Phone, MessageSquare, ChevronRight, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SupportPage() {
    const faqs = [
        {
            q: "How do I book a movie ticket?",
            a: "Simply browse our homepage, select your preferred movie, choose a theater and showtime, select your seats, and click 'Join'. Bookings are held for 15 minutes."
        },
        {
            q: "How do I pay for my tickets?",
            a: "We currently support 'Pay at Theater'. Bring your booking QR code to the cinema counter to complete your payment and receive your physical ticket."
        },
        {
            q: "Can I cancel my booking?",
            a: "Yes! You can cancel or change your seats up to 2 hours before the showtime directly from your 'My Bookings' dashboard."
        },
        {
            q: "What are 'Hold' bookings?",
            a: "A 'Hold' booking reservations your seat for 15 minutes. If you don't arrive at the theater to pay within that time (or prior to showtime), the seats are released."
        }
    ];

    return (
        <div className="min-h-screen bg-white pb-32">
            <header className="bg-[#1F2533] text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
                <div className="container mx-auto px-4 md:px-10 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto space-y-6"
                    >
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Support Hub</h1>
                        <p className="text-white/60 text-sm font-bold uppercase tracking-[0.3em]">We're here to help you get the best cinema experience</p>
                        
                        <div className="relative max-w-xl mx-auto pt-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                            <Input 
                                className="h-16 bg-white/5 border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus-visible:ring-primary focus:bg-white/10 transition-all uppercase font-black text-xs tracking-widest"
                                placeholder="Search for help topics..."
                            />
                        </div>
                    </motion.div>
                </div>
            </header>

            <div className="container mx-auto px-4 md:px-10 -mt-12 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                         { icon: <Mail className="h-6 w-6" />, title: "Email Support", desc: "support@snapmyshow.com", color: "bg-blue-500" },
                         { icon: <Phone className="h-6 w-6" />, title: "Call Hub", desc: "+1 (800) SNAP-SHOW", color: "bg-emerald-500" },
                         { icon: <MessageSquare className="h-6 w-6" />, title: "Live Chat", desc: "Average response: 2 mins", color: "bg-primary" }
                    ].map((item, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center group cursor-pointer hover:border-primary/50 transition-all"
                        >
                            <div className={`h-16 w-16 rounded-2xl ${item.color} flex items-center justify-center text-white mb-6 shadow-xl`}>
                                {item.icon}
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#1F2533] mb-2">{item.title}</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-32 max-w-4xl mx-auto">
                    <div className="flex items-center space-x-4 mb-12">
                        <div className="h-8 w-1.5 bg-primary rounded-full" />
                        <h2 className="text-3xl font-black tracking-tighter text-[#1F2533] uppercase">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-6">
                        {faqs.map((faq, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="group p-8 bg-gray-50/50 hover:bg-white rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-black text-[#1F2533] uppercase tracking-tight group-hover:text-primary transition-colors">{faq.q}</h4>
                                        <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-2xl">{faq.a}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-32 pt-20 border-t border-gray-100 flex flex-col items-center text-center space-y-8">
                     <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                         <ShieldCheck className="h-8 w-8" />
                     </div>
                     <div className="space-y-2">
                         <h2 className="text-2xl font-black uppercase tracking-tighter text-[#1F2533]">Need More Assistance?</h2>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Our dedicated theater agents are active 24/7</p>
                     </div>
                     <Button className="h-14 bg-[#1F2533] hover:bg-black text-white px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl">
                         Open Support Ticket
                     </Button>
                </div>
            </div>
        </div>
    );
}
