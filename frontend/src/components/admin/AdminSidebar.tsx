"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Film, 
  Monitor, 
  Calendar, 
  QrCode, 
  Settings, 
  LogOut,
  ChevronRight,
  Building2,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Building2, label: "Venues", href: "/admin/theaters" },
  { icon: Film, label: "Movie Hub", href: "/admin/movies" },
  { icon: Monitor, label: "Screens", href: "/admin/screens" },
  { icon: Calendar, label: "Showtimes", href: "/admin/showtimes" },
  { icon: QrCode, label: "Gate Scanner", href: "/scanner" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1F2533] text-white flex flex-col h-screen sticky top-0 border-r border-white/5">
      {/* Brand Logo */}
      <div className="p-8">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <Film className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tighter uppercase">SnapMyShow</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Partner Portal</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <div className="mb-4 px-4 py-2 border-b border-white/5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Command Center</p>
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin/dashboard");
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group mb-1",
                isActive 
                  ? "bg-white/10 text-white shadow-lg shadow-black/10" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
                )} />
                <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
              </div>
              {isActive && <div className="h-1 w-1 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Profile/Footer */}
      <div className="p-6 mt-auto border-t border-white/5">
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-primary flex items-center justify-center font-black text-white italic shadow-lg shadow-rose-500/10">
              P
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-black uppercase tracking-tight truncate w-32">PVR Pebble</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Master Admin</span>
            </div>
          </div>
          <Link href="/logout" className="flex items-center space-x-2 text-gray-500 hover:text-rose-400 transition-colors group">
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sign Out Hub</span>
          </Link>
        </div>
        
        <div className="flex items-center justify-between px-2">
            <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.2em]">v2.4.0 PRO</p>
            <ShieldCheck className="h-3 w-3 text-emerald-500/50" />
        </div>
      </div>
    </aside>
  );
}

