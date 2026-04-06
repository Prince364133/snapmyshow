"use client";

import { useEffect, useState } from "react";
import { 
  User, 
  Lock, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  Save, 
  AlertTriangle,
  Building2,
  FileBadge,
  Phone,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [theater, setTheater] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Password Reset State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
        const [meRes, theaterRes] = await Promise.all([
            api.get("/auth/me"),
            api.get("/theaters/my")
        ]);
        setProfile(meRes.data.user);
        setTheater(theaterRes.data.data?.[0]); // Assuming 1 theater for now
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        return toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
    }
    setChangingPassword(true);
    try {
        await api.post("/user/change-password", {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
        toast({ title: "Account Secured", description: "Your password has been successfully updated." });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.response?.data?.error || "Failed to update password." });
    } finally {
        setChangingPassword(false);
    }
  };

  if (loading) return (
      <div className="bg-[#F8FAFC] min-h-screen p-8 animate-pulse">
          <div className="h-10 w-48 bg-gray-200 rounded-lg mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 h-[400px] bg-white rounded-2xl" />
              <div className="lg:col-span-2 h-[600px] bg-white rounded-2xl" />
          </div>
      </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-40">
        <h1 className="text-3xl font-black text-[#1F2533] uppercase tracking-tighter leading-none">Security & Intel</h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your administrator credentials and business metadata</p>
      </div>

      <div className="container mx-auto px-8 py-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Side Panel: Profile Recap */}
          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden relative group">
              <div className="bg-[#1F2533] h-24 p-6 flex justify-end">
                   <div className="h-16 w-16 -mb-12 rounded-xl bg-white shadow-xl flex items-center justify-center border-4 border-white">
                        <User className="h-8 w-8 text-[#1F2533]" />
                   </div>
              </div>
              <CardContent className="pt-16 pb-8 px-8 text-center">
                 <h2 className="text-xl font-black uppercase tracking-tighter text-[#1F2533] leading-none mb-1">{profile?.name}</h2>
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">{profile?.role}</p>
                 
                 <div className="mt-8 space-y-4 pt-10 border-t border-gray-50">
                    <div className="flex items-center text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                        <Mail className="h-3.5 w-3.5 text-[#1F2533] mr-3" /> {profile?.email}
                    </div>
                 </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-2xl p-8 space-y-6">
                <div className="flex items-center space-x-3 mb-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#1F2533]">Affiliated Venue</h3>
                </div>
                {theater ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Theater Complex</p>
                            <p className="text-sm font-black uppercase tracking-tight text-[#1F2533]">{theater.name}</p>
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <MapPin className="h-3 w-3 text-primary mr-2" /> {theater.location}
                        </div>
                        <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                             <span className="text-[9px] font-black uppercase text-emerald-500">Node Status</span>
                             <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[8px] uppercase tracking-widest">ACTIVE</Badge>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">No primary venue linked to this account node yet.</p>
                    </div>
                )}
            </Card>
          </div>

          {/* Main Area: Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Identity & Compliance */}
            {theater && (
                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tighter text-[#1F2533]">Business Integrity</CardTitle>
                                <CardDescription className="text-[9px] font-bold uppercase tracking-widest mt-1">Verified company registration details</CardDescription>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Authorized Personnel</Label>
                                <div className="text-sm font-black text-[#1F2533] uppercase">{theater.businessInfo?.authorizedPerson || "Not Set"}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Communication Node</Label>
                                <div className="flex items-center text-sm font-black text-[#1F2533] uppercase leading-none">
                                    <Phone className="h-3 w-3 text-primary mr-2" /> {theater.businessInfo?.phone || "N/A"}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tax ID / GST Protocol</Label>
                                <div className="text-sm font-black text-[#1F2533] uppercase">{theater.businessInfo?.taxId || "UNRESTRICTED"}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center space-x-3">
                                 <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                      <FileBadge className="h-4 w-4 text-primary" />
                                 </div>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-[#1F2533]">Merchant Verified</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Security: Password Override */}
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter text-[#1F2533]">Credentials Lockdown</CardTitle>
                    <CardDescription className="text-[9px] font-bold uppercase tracking-widest mt-1">Initialize password rotation sequence</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handlePasswordChange} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Current Key</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                    <Input 
                                        type="password" 
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        className="h-14 pl-12 bg-gray-50 border-none font-bold rounded-xl focus-visible:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="hidden md:block" />
                            
                            <div className="space-y-4">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">New Protocol Key</Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                    <Input 
                                        type="password" 
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        className="h-14 pl-12 bg-gray-50 border-none font-bold rounded-xl focus-visible:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Repeat Signature</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                    <Input 
                                        type="password" 
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        className="h-14 pl-12 bg-gray-50 border-none font-bold rounded-xl focus-visible:ring-primary/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={changingPassword} className="h-14 px-10 bg-[#1F2533] hover:bg-black text-white font-black uppercase tracking-widest text-[11px] rounded-xl shadow-lg transition-all space-x-2">
                                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                <span>Commit Changes</span>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="flex justify-end p-4">
                 <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] space-x-2">
                     <AlertTriangle className="h-3 w-3 text-amber-500" />
                     <span>Root level changes require re-authentication</span>
                 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
