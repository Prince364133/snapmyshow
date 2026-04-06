"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { MapPin, Phone, User, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    city: "",
  });

  useEffect(() => {
    if (user && user.onboardingCompleted) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile
      const { data } = await api.put("/auth/profile/complete", formData);
      if (data.success) {
        toast.success("Profile completed!");
        // Update user context implicitly or explicitly
        login(localStorage.getItem("accessToken") || "", data.user);
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
        >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 mb-6">
                <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-black text-[#1F2533] uppercase tracking-tighter leading-none mb-4">Complete your Profile</h1>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Just a few more details to get you started</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl shadow-gray-100/50 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                        <Input
                            required
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-white border-white h-16 pl-14 pr-8 rounded-2xl shadow-sm focus:ring-primary focus:border-primary text-sm font-bold text-[#1F2533]"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Phone Number</label>
                    <div className="relative group">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                        <Input
                            required
                            type="tel"
                            placeholder="Enter your mobile number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="bg-white border-white h-16 pl-14 pr-8 rounded-2xl shadow-sm focus:ring-primary focus:border-primary text-sm font-bold text-[#1F2533]"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Primary City</label>
                    <div className="relative group">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                        <Input
                            required
                            placeholder="e.g. Kathmandu, Delhi, etc."
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="bg-white border-white h-16 pl-14 pr-8 rounded-2xl shadow-sm focus:ring-primary focus:border-primary text-sm font-bold text-[#1F2533]"
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-20 rounded-[1.5rem] bg-primary hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between px-10 group"
            >
                {loading ? "Updating Profile..." : (
                    <>
                        <span>Finish Sign Up</span>
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </Button>
        </form>
      </div>
    </div>
  );
}
