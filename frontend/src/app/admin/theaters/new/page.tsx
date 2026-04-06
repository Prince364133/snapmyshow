"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  FileText,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function TheaterOnboarding() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phoneNumber: "",
    email: "",
    openingTime: "09:00 AM",
    closingTime: "11:00 PM",
    description: "",
    taxId: "",
    authorizedPerson: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
          if (['taxId', 'authorizedPerson'].includes(key)) {
              // Map these to businessInfo sub-object in backend logic
              // Actually, simplified backend will handle it if we send it as specific keys or JSON
          }
          data.append(key, value);
      });
      
      // Group business info
      const businessInfo = {
          taxId: formData.taxId,
          authorizedPerson: formData.authorizedPerson
      };
      data.append('businessInfo', JSON.stringify(businessInfo));

      if (posterFile) {
          data.append("coverImage", posterFile);
      }

      await api.post("/theaters", data, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast({ title: "Registration Successful", description: "Your venue is now under super-admin review." });
      router.push("/admin/theaters");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: err.response?.data?.error || "Error creating theater." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => (step === 1 ? router.back() : prevStep())} className="rounded-full hover:bg-gray-100 shrink-0">
            <ArrowLeft className="h-5 w-5 text-[#1F2533]" />
          </Button>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-[#1F2533]">Venue Onboarding</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= i ? 'bg-primary' : 'bg-gray-100'}`} />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-10">
                <h1 className="text-4xl font-black text-[#1F2533] uppercase tracking-tighter leading-none mb-3">Gateway to Cinema</h1>
                <p className="text-gray-500 font-medium">Standardize your venue information for discovery across our network.</p>
              </div>

              <Card className="border-none shadow-sm shadow-gray-200/50 bg-white rounded-3xl overflow-hidden p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Venue Official Name</Label>
                    <Input name="name" value={formData.name} onChange={handleInputChange} className="h-16 text-xl font-black uppercase tracking-tight bg-gray-50 border-none rounded-xl px-6 focus-visible:ring-primary/20" placeholder="e.g. PVR PEBBLE DOWNTOWN" />
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Complete Landmark Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                      <Input name="address" value={formData.address} onChange={handleInputChange} className="pl-12 h-14 bg-gray-50 border-none rounded-xl text-sm font-bold focus-visible:ring-primary/20" placeholder="Street name, Area, Landmarks..." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Station / City</Label>
                    <Input name="city" value={formData.city} onChange={handleInputChange} className="h-14 bg-gray-50 border-none rounded-xl text-sm font-bold" placeholder="Select City" />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Business Phone</Label>
                    <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="h-14 bg-gray-50 border-none rounded-xl text-sm font-bold" placeholder="+91 XXXX XXX XXX" />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Opening Hours</Label>
                    <Input name="openingTime" value={formData.openingTime} onChange={handleInputChange} className="h-14 bg-gray-50 border-none rounded-xl text-sm font-bold" placeholder="09:00 AM" />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Closing Hours</Label>
                    <Input name="closingTime" value={formData.closingTime} onChange={handleInputChange} className="h-14 bg-gray-50 border-none rounded-xl text-sm font-bold" placeholder="11:00 PM" />
                  </div>
                </div>

                <div className="flex justify-end pt-10">
                  <Button onClick={nextStep} className="bg-primary hover:bg-rose-700 font-black h-14 px-10 rounded-xl uppercase tracking-[0.2em] text-[11px] text-white shadow-lg space-x-3 group">
                    <span>Continue Verification</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-10">
                <div className="flex items-center space-x-3 mb-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-3">Secure Flow</Badge>
                </div>
                <h1 className="text-4xl font-black text-[#1F2533] uppercase tracking-tighter leading-none mb-3">Compliance & Business</h1>
                <p className="text-gray-500 font-medium">Verify your corporate identity to enable ticket settlements.</p>
              </div>

              <Card className="border-none shadow-sm shadow-gray-200/50 bg-white rounded-3xl overflow-hidden p-8">
                <div className="space-y-8">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-[#1F2533]">Identity Validation</h4>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase leading-relaxed tracking-widest">Provide your primary tax identification (GSTIN/VAT) and local trade license details.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4 md:col-span-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Business Tax ID (GSTIN / VAT)</Label>
                      <Input name="taxId" value={formData.taxId} onChange={handleInputChange} className="h-16 bg-gray-50 border-none rounded-xl text-lg font-black tracking-widest focus-visible:ring-emerald-500/20" placeholder="EX: 07AABCU1234F1Z" />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Authorized Representative</Label>
                      <div className="relative">
                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                        <Input name="authorizedPerson" value={formData.authorizedPerson} onChange={handleInputChange} className="pl-12 h-14 bg-gray-50 border-none rounded-xl text-sm font-bold" placeholder="Legal Name" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Official Email Hub</Label>
                      <Input type="email" name="email" value={formData.email} onChange={handleInputChange} className="h-14 bg-gray-50 border-none rounded-xl text-sm font-bold" placeholder="support@venue.com" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-10">
                  <Button variant="ghost" onClick={prevStep} className="font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 h-14 px-8 rounded-xl text-gray-400">Back</Button>
                  <Button onClick={nextStep} className="bg-primary hover:bg-rose-700 font-black h-14 px-10 rounded-xl uppercase tracking-widest text-[11px] shadow-lg text-white space-x-3 group transition-all">
                    <span>Submit Documents</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-[#1F2533] uppercase tracking-tighter leading-none mb-3">Final Presentation</h1>
                <p className="text-gray-500 font-medium">Add a cover story or imagery to attract your first audience.</p>
              </div>

              <Card className="border-none shadow-sm shadow-gray-200/50 bg-white rounded-3xl overflow-hidden p-8">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block text-center">Main Cover Image (Hero)</Label>
                    <div className="relative aspect-video w-full max-w-xl mx-auto bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 overflow-hidden group cursor-pointer hover:border-primary/30 transition-all flex flex-col items-center justify-center p-8">
                        {posterFile ? (
                            <Image src={URL.createObjectURL(posterFile)} alt="Preview" fill className="object-cover" />
                        ) : (
                            <>
                                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-8 w-8 text-gray-200 group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-primary transition-colors text-center">Tap to upload theatrical banner<br/>(Min 1920x800 recommended)</span>
                            </>
                        )}
                        <input name="coverImage" aria-label="Upload Theater Banner" type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setPosterFile(e.target.files?.[0] || null)} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Short Introduction / Bio</Label>
                      <Badge variant="outline" className="text-[8px] font-bold text-gray-300 uppercase border-gray-100">Optional</Badge>
                    </div>
                    <Textarea name="description" value={formData.description} onChange={handleInputChange} className="min-h-[120px] bg-gray-50 border-none rounded-xl text-sm font-medium p-4 focus-visible:ring-primary/20" placeholder="Tell us what makes your cinema stand out..." />
                  </div>
                </div>

                <div className="flex justify-between pt-10">
                  <Button variant="ghost" onClick={prevStep} className="font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 h-14 px-8 rounded-xl text-gray-400">Review Compliance</Button>
                  <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 font-black h-14 px-10 rounded-xl uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20 text-white space-x-3 group transition-all">
                    {loading ? "Registering Property..." : "Complete Registration"}
                    {!loading && <CheckCircle2 className="h-4 w-4" />}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
