"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import LocationSelector from "@/components/LocationSelector";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [locationData, setLocationData] = useState<{lat: number, lng: number, address: string} | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
        const { data } = await api.post("/auth/register", {
            name: values.name,
            email: values.email,
            password: values.password,
            lat: locationData?.lat,
            lng: locationData?.lng
        });
        if (data.success) {
            localStorage.setItem("accessToken", data.accessToken);
            toast({ title: "Account Created", description: `Welcome to BookMyShow, ${data.user.name}!` });
            router.push("/");
        }
    } catch (err: any) {
        toast({ 
            variant: "destructive", 
            title: "Registration Failed", 
            description: err.response?.data?.error || "Something went wrong. Please try again." 
        });
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100vh-160px)] flex items-center justify-center p-4 py-20">
      <Card className="w-full max-w-[540px] border-none shadow-xl bg-white rounded-xl overflow-hidden pt-4">
        <CardHeader className="space-y-4 flex flex-col items-center pb-8 text-center px-10">
            <Link href="/" className="flex items-center">
                <span className="text-4xl font-black lowercase tracking-tighter text-[#333545]"><span className="bg-primary px-1.5 mr-0.5 rounded-sm text-white">snap</span>myshow</span>
            </Link>
            <div>
                <CardTitle className="text-2xl font-bold text-[#333333]">Create Account</CardTitle>
                <p className="text-sm text-gray-500 font-medium">Join the community to book tickets seamlessly</p>
            </div>
        </CardHeader>
        <CardContent className="grid gap-6 px-10 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-gray-400 tracking-widest">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="bg-gray-50 border-gray-200 h-12 focus-visible:ring-primary rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-gray-400 tracking-widest">Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} className="bg-gray-50 border-gray-200 h-12 focus-visible:ring-primary rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-gray-400 tracking-widest">Password</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-gray-50 border-gray-200 h-12 focus-visible:ring-primary rounded-xl" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-gray-400 tracking-widest">Confirm</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-gray-50 border-gray-200 h-12 focus-visible:ring-primary rounded-xl" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

              {/* Location Selector Area */}
              <div className="py-2">
                 <FormLabel className="text-xs font-bold uppercase text-gray-400 tracking-widest block mb-3">Your Location</FormLabel>
                 <LocationSelector 
                    onLocationSelect={(loc) => setLocationData(loc)} 
                 />
              </div>

              <Button disabled={loading} type="submit" className="w-full bg-primary hover:bg-rose-600 h-12 font-black text-lg shadow-lg shadow-rose-500/20 mt-4 rounded-xl">
                {loading ? "CREATING ACCOUNT..." : "JOIN SNAPMYSHOW"}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span className="bg-white px-4">OR</span>
            </div>
          </div>
          <Button variant="outline" className="w-full h-12 border-gray-200 font-bold hover:bg-gray-50" onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
          }}>
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col bg-gray-50/80 py-6 border-t border-gray-100">
          <div className="text-sm text-center text-gray-600 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold text-xs uppercase tracking-tight">
              Sign In to Snap
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
