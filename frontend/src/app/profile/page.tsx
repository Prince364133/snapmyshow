"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Mail, Shield, Download, Trash2, CheckCircle2, ChevronRight, Lock, Key, Ticket, Star, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import LocationSelector from "@/components/LocationSelector";
import ConfirmModal from "@/components/ConfirmModal";


export default function UserProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationData, setLocationData] = useState<{lat: number, lng: number, address: string} | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    gender: "Rather not say",
    dob: "",
    bio: "",
    profilePic: ""
  });


  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await api.get("/user/export");
        setProfile(data.data.profile);
        setBookings(data.data.bookings);
        const p = data.data.profile;
        setFormData({ 
            name: p.name, 
            email: p.email,
            phone: p.phone || "",
            city: p.city || "",
            gender: p.gender || "Rather not say",
            dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : "",
            bio: p.bio || "",
            profilePic: p.profilePic || ""
        });
        if (p.location) {
            setLocationData({
                lat: p.location.coordinates[1],
                lng: p.location.coordinates[0],
                address: p.city || "Saved Location"
            });
        }

      } catch (err) {
        console.error(err);
      }
      try {
        const { data: revData } = await api.get("/reviews/me");
        if (revData.success) setReviews(revData.data);
      } catch (err) {
        console.error("Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
        const { data } = await api.patch("/user/profile", {
            ...formData,
            lat: locationData?.lat,
            lng: locationData?.lng
        });
        if (data.success) {
            toast.success("Profile Updated");
            setProfile((prev: any) => ({ ...prev, ...data.data }));
        }

    } catch (err) {
        toast.error("Failed to update profile.");
    } finally {
        setSaving(false);
    }
  };


  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const confirmDeleteAccount = async () => {
    try {
        const { data } = await api.delete("/user/account");
        if (data.success) {
            localStorage.removeItem("accessToken");
            toast.success("Account Deleted");
            window.location.href = "/";
        }
    } catch (err) {
        toast.error("Could not delete account.");
    }
  };


  const handleExport = async () => {
    try {
        const { data } = await api.get("/user/export");
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${formData.name.replace(/\s+/g, '-')}-Data.json`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        toast.success("Data Exported");
    } catch (err) {
        toast.error("Export Failed");
    }
  };


  if (loading) return <div className="container py-20"><Skeleton className="h-[500px] w-full rounded-3xl bg-white shadow-sm" /></div>;

  return (
    <div className="bg-[#F2F5F9] min-h-screen">
      <div className="bg-white border-b border-gray-100 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                    {formData.profilePic ? (
                        <img src={formData.profilePic} alt={formData.name} className="h-full w-full object-cover" />
                    ) : (
                        <User className="h-10 w-10 text-primary" />
                    )}
                </div>
                <button 
                  title="Edit Profile Picture"
                  aria-label="Edit Profile Picture"
                  className="absolute -bottom-1 -right-1 h-8 w-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-primary hover:bg-gray-50 transition-colors"
                >
                    <Edit className="h-4 w-4" />
                </button>

            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#1F2533] uppercase tracking-tighter leading-none inline-flex items-center">
                {formData.name}
                <CheckCircle2 className="ml-2 h-5 w-5 text-blue-500 fill-blue-500/10" />
              </h1>

              <div className="flex items-center space-x-3 text-gray-400">
                <span className="text-[10px] font-black uppercase tracking-widest">{profile?.role || "USER"}</span>
                <span className="h-1 w-1 rounded-full bg-gray-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Active since {new Date(profile?.createdAt || Date.now()).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Navigation */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col space-y-1">
                {['Account Settings', 'My Bookings', 'Data & Privacy'].map((item, idx) => (
                    <button key={item} className={`flex items-center justify-between w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${idx === 0 ? 'bg-primary/5 text-primary' : 'text-gray-400 hover:bg-gray-50 hover:text-[#1F2533]'}`}>
                        {item}
                        <ChevronRight className={`h-4 w-4 ${idx === 0 ? 'text-primary' : 'text-gray-200'}`} />
                    </button>
                ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="md:col-span-2 space-y-8">
            <Card className="border border-gray-100 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl font-black text-[#1F2533] uppercase tracking-tighter">Profile Details</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-gray-400 pt-1">Manage your public information and identity</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-14 pl-12 bg-gray-50 border-none rounded-2xl font-bold text-[#1F2533] focus-visible:ring-primary/20" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                            <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-14 pl-12 bg-gray-50 border-none rounded-2xl font-bold text-[#1F2533] focus-visible:ring-primary/20" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</Label>
                            <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="e.g. +91 9876543210" className="h-14 bg-gray-50 border-none rounded-2xl font-bold text-[#1F2533] focus-visible:ring-primary/20" />
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date of Birth</Label>
                            <Input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="h-14 bg-gray-50 border-none rounded-2xl font-bold text-[#1F2533] focus-visible:ring-primary/20" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gender</Label>
                        <select 
                            value={formData.gender} 
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            title="Select Gender"
                            aria-label="Select Gender"
                            className="w-full h-14 px-4 bg-gray-50 border-none rounded-2xl font-bold text-[#1F2533] focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                        >

                            <option value="Rather not say">Rather not say</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bio</Label>
                        <textarea 
                            value={formData.bio} 
                            onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                            placeholder="Tell us a bit about yourself..."
                            className="w-full h-32 p-4 bg-gray-50 border-none rounded-2xl font-bold text-[#1F2533] focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                            maxLength={200}
                        />
                        <div className="text-[9px] text-gray-400 font-bold uppercase text-right">{formData.bio.length}/200</div>
                    </div>


                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block pb-2">Home Location</Label>
                        <LocationSelector 
                            onLocationSelect={(loc) => setLocationData(loc)} 
                            initialLocation={locationData || undefined}
                        />
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleUpdate} disabled={saving} className="w-full md:w-auto bg-primary hover:bg-rose-700 text-white font-black h-14 px-10 rounded-2xl shadow-lg shadow-rose-500/20 uppercase tracking-widest text-[11px]">
                            {saving ? 'Saving...' : 'Update Profile'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center space-x-2 mb-2">
                        <Ticket className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl font-black text-[#1F2533] uppercase tracking-tighter">Your Bookings</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">Total History: {bookings.length} Tickets</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    {bookings.length > 0 ? (
                        <div className="space-y-4">
                            {bookings.slice(0, 3).map((booking: any) => (
                                <div key={booking._id} className="p-5 bg-gray-50 rounded-2xl flex items-center justify-between group">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-primary font-black shadow-sm">B</div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-tight text-[#1F2533]">{booking.showtimeId?.movieId?.title || "Movie Booking"}</h4>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">₹{booking.totalAmount} • {booking.status}</p>
                                        </div>
                                    </div>
                                    <Link href={`/movies/${booking.showtimeId?.movieId || '#'}/booking/success/${booking._id}`}>
                                        <Button variant="ghost" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">View Ticket</Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-300 font-black uppercase tracking-widest text-xs border-2 border-dashed border-gray-100 rounded-3xl">No Bookings Yet</div>
                    )}
                </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center space-x-2 mb-2">
                        <Star className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl font-black text-[#1F2533] uppercase tracking-tighter">Your Reviews</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">Total History: {reviews.length} Ratings</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review: any) => (
                                <div key={review._id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[14px] font-bold text-[#1F2533] leading-none">{review.movieId?.title || "Movie Rating"}</h4>
                                        <div className="flex items-center space-x-1">
                                            <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                                            <span className="text-[12px] font-black">{review.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-[12px] font-medium text-gray-500 line-clamp-2">"{review.comment || 'No comment provided'}"</p>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pt-1">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-300 font-black uppercase tracking-widest text-xs border-2 border-dashed border-gray-100 rounded-3xl">No Reviews Yet</div>
                    )}
                </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center space-x-2 mb-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-xl font-black text-[#1F2533] uppercase tracking-tighter">Security & Privacy</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-gray-400">Control your digital footprint and data rights</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="p-6 bg-gray-50 rounded-3xl flex items-center justify-between border border-gray-100 group hover:border-emerald-200 transition-colors cursor-pointer" onClick={handleExport}>
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                    <Download className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11px] font-black uppercase tracking-tight text-[#1F2533]">Export Data</h4>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Download account activity JSON</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="text-emerald-500 font-black text-[10px] uppercase h-8 rounded-full pr-0">Download <Download className="ml-1 h-3.5 w-3.5" /></Button>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-3xl flex items-center justify-between border border-gray-100 group hover:border-red-200 transition-colors cursor-pointer opacity-80 hover:opacity-100" onClick={() => setIsDeleteModalOpen(true)}>

                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                    <Trash2 className="h-6 w-6 text-red-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11px] font-black uppercase tracking-tight text-red-600">Delete Account</h4>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Permanently erase your identity</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="Are you absolutely sure? This will permanently delete your account and all bookings. This action cannot be undone."
        type="danger"
        confirmText="Delete Permanently"
      />
    </div>
  );
}
