import Link from "next/link";
import { Globe, Share2, Play, Users, Mail, Headphones, RotateCcw, Smartphone, Star, ChevronRight, MessageSquare, ShieldCheck, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
    return (
        <footer className="w-full bg-[#333545] text-white pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-10">
                {/* Enterprise Info Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 pb-12 border-b border-white/10">
                    <div className="flex items-center space-x-4 group cursor-pointer">
                        <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition-all duration-300 transform group-hover:scale-110">
                             <Headphones className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest leading-none mb-1">24/7 CUSTOMER CARE</h4>
                            <p className="text-[11px] opacity-40 font-bold uppercase tracking-tight">Got a query? Content us anytime</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 group cursor-pointer">
                        <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition-all duration-300 transform group-hover:scale-110">
                             <RotateCcw className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest leading-none mb-1">RESEND BOOKING</h4>
                            <p className="text-[11px] opacity-40 font-bold uppercase tracking-tight">Didn't get your ticket? Click here</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                             <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 focus-within:border-primary transition-colors">
                                 <Input 
                                    className="bg-transparent border-none focus-visible:ring-0 text-xs h-9 placeholder:text-white/20" 
                                    placeholder="SUBSCRIBE TO NEWSLETTER"
                                 />
                                 <Button size="sm" className="bg-primary hover:bg-rose-600 font-bold text-[10px] px-4 rounded-md">GO</Button>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Categories Row (Enterprise Style) */}
                <div className="mb-14 space-y-8">
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">MOVIES BY GENRE</h4>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold text-white/50 uppercase">
                            <Link href="/movies?genre=Action" className="hover:text-primary transition-colors border-r border-white/10 pr-6 last:border-r-0">Action</Link>
                            <Link href="/movies?genre=Comedy" className="hover:text-primary transition-colors border-r border-white/10 pr-6 last:border-r-0">Comedy</Link>
                            <Link href="/movies?genre=Drama" className="hover:text-primary transition-colors border-r border-white/10 pr-6 last:border-r-0">Drama</Link>
                            <Link href="/movies?genre=Horror" className="hover:text-primary transition-colors border-r border-white/10 pr-6 last:border-r-0">Horror</Link>
                            <Link href="/movies?genre=Sci-Fi" className="hover:text-primary transition-colors border-r border-white/10 pr-6 last:border-r-0">Sci-Fi</Link>
                            <Link href="/movies?genre=Romance" className="hover:text-primary transition-colors pr-6">Romance</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">MOVIES BY LANGUAGE</h4>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold text-white/50 uppercase">
                            <Link href="/movies?lang=Hindi" className="hover:text-primary transition-colors border-r border-white/10 pr-6 last:border-r-0">Hindi</Link>
                            <Link href="/movies?lang=English" className="hover:text-primary transition-colors border-r border-white/10 pr-6 last:border-r-0">English</Link>
                            <Link href="/movies?lang=Telugu" className="hover:text-primary transition-colors border-r border-white/10 pr-6 last:border-r-0">Telugu</Link>
                            <Link href="/movies?lang=Punjabi" className="hover:text-primary transition-colors border-r border-white/10 pr-6 last:border-r-0">Punjabi</Link>
                            <Link href="/movies?lang=Tamil" className="hover:text-primary transition-colors pr-6">Tamil</Link>
                        </div>
                    </div>
                </div>

                {/* Main Footer Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-12 border-t border-white/5">
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center mb-6">
                            <span className="text-2xl font-black lowercase tracking-tighter"><span className="bg-primary px-1.5 mr-0.5 rounded-sm text-white">snap</span>myshow</span>
                        </Link>
                        <div className="flex space-x-4">
                            <Link href="#" className="h-9 w-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-colors"><Globe className="h-4 w-4" /></Link>
                            <Link href="#" className="h-9 w-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-colors"><Share2 className="h-4 w-4" /></Link>
                            <Link href="#" className="h-9 w-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-colors"><Play className="h-4 w-4" /></Link>
                            <Link href="#" className="h-9 w-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-colors"><MessageSquare className="h-4 w-4" /></Link>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#F2F5F9]/30">HELP & SUPPORT</h4>
                        <ul className="text-xs font-bold text-white/40 space-y-3 uppercase tracking-tight">
                            <li><Link href="/support" className="hover:text-primary">FAQ</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="/support" className="hover:text-primary">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#F2F5F9]/30">SNAP EXCLUSIVE</h4>
                        <ul className="text-xs font-bold text-white/40 space-y-3 uppercase tracking-tight">
                            <li><Link href="/offers" className="hover:text-primary">Special Offers</Link></li>
                            <li><Link href="/gift-cards" className="hover:text-primary">Gift Cards</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#F2F5F9]/30">APP ON STORE</h4>
                        <div className="space-y-3">
                             <div className="relative group/app">
                                <Link href="/coming-soon" className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center space-x-3 cursor-pointer hover:bg-white/10 transition-colors">
                                    <Smartphone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-[8px] font-black uppercase leading-none opacity-40">Download on</p>
                                        <p className="text-[11px] font-black uppercase leading-none mt-1">App Store</p>
                                    </div>
                                </Link>
                                <span className="absolute -top-2 -right-2 bg-primary text-[7px] font-black uppercase px-2 py-0.5 rounded shadow-xl tracking-widest animate-pulse">COMING SOON</span>
                             </div>

                             <div className="relative group/app">
                                <Link href="/coming-soon" className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center space-x-3 cursor-pointer hover:bg-white/10 transition-colors">
                                    <Play className="h-5 w-5 text-gray-400 fill-gray-400" />
                                    <div>
                                        <p className="text-[8px] font-black uppercase leading-none opacity-40">Get it on</p>
                                        <p className="text-[11px] font-black uppercase leading-none mt-1">Google Play</p>
                                    </div>
                                </Link>
                                <span className="absolute -top-2 -right-2 bg-primary text-[7px] font-black uppercase px-2 py-0.5 rounded shadow-xl tracking-widest animate-pulse">COMING SOON</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Legal Section */}
                <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-8">
                    <div className="max-w-2xl">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed mb-4">
                            Copyright 2026 © SnapMyShow Entertainment Pvt. Ltd. All Rights Reserved.
                        </p>
                        <p className="text-[9px] font-medium text-white/10 leading-relaxed uppercase tracking-tight">
                            The content and images used on this site are copyright protected and copyrights vests with the respective owners. The usage of the content and images on this website is intended to promote the works and no endorsement of the artist shall be implied.
                        </p>
                    </div>
                    <div>
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10">POWERED BY SNAP TECH</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
