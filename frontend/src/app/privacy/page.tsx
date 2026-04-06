"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Trash2, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

export default function PrivacyPolicy() {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/export`, { withCredentials: true });
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "showbook-my-data.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success("Data export started successfully.");
    } catch (err) {
      toast.error("Failed to export data. Please login again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently delete your account and all booking history. This action cannot be undone.")) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/user/account`, { withCredentials: true });
      toast.success("Account deleted successfully. Logging out...");
      setTimeout(() => window.location.href = "/", 2000);
    } catch (err) {
      toast.error("Failed to delete account. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="space-y-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-[#1F2533]">Privacy Policy</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Last Updated: April 2026</p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-[#1F2533]">
                <Eye className="text-primary h-6 w-6" /> DATA WE COLLECT
            </h2>
            <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-3xl space-y-4 text-gray-500 leading-relaxed font-medium">
                <p>We collect information that you provides directly to us, including your name, email address, and booking history. If you use Google OAuth, we collect your basic profile information from Google.</p>
                <p>We do NOT store your credit card or payment details. All transactions are handled at the physical theater venue via QR verification.</p>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-[#1F2533]">
                <Shield className="text-primary h-6 w-6" /> YOUR RIGHTS (GDPR/CCPA)
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-3xl space-y-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
                        <Download className="h-5 w-5" />
                    </div>
                    <h3 className="font-black uppercase tracking-tight text-[#1F2533]">Data Portability</h3>
                    <p className="text-sm text-gray-500 font-medium">You have the right to export all your personal data stored on our servers in a machine-readable format.</p>
                    <Button 
                        disabled={isLoading}
                        onClick={handleExport}
                        variant="outline" 
                        className="w-full border-gray-200 hover:bg-gray-50 text-[10px] uppercase font-black tracking-widest text-[#1F2533]"
                    >
                        {isLoading ? "Processing..." : "Export My Data"} <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                </div>
                <div className="bg-white border border-rose-100 shadow-sm p-8 rounded-3xl space-y-4">
                    <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mb-2">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-black uppercase tracking-tight text-[#1F2533]">Right to Erasure</h3>
                    <p className="text-sm text-gray-500 font-medium">You can request the permanent deletion of your account and anonymization of your booking records.</p>
                    <Button 
                        disabled={isLoading}
                        onClick={handleDeleteAccount}
                        variant="outline" 
                        className="w-full border-rose-200 hover:bg-rose-50 text-rose-600 text-[10px] uppercase font-black tracking-widest"
                    >
                        {isLoading ? "Processing..." : "Delete My Account"}
                    </Button>
                </div>
            </div>
        </section>

        <footer className="pt-20 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400 font-bold tracking-widest">Questions? Contact our Data Protection Officer at <span className="text-primary">privacy@showbook.com</span></p>
        </footer>
      </motion.div>
    </div>
  );
}
