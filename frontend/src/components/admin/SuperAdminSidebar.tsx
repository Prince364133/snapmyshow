"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  Film, 
  Settings, 
  LogOut,
  Users,
  LayoutDashboard,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Platform Overview", href: "/superadmin" },
  { icon: Building2, label: "Venue Partners", href: "/superadmin/theaters" },
  { icon: Film, label: "Global Movies", href: "/superadmin/movies" },
  { icon: Users, label: "User Accounts", href: "/superadmin/users" },
  { icon: Settings, label: "Platform Settings", href: "/superadmin/settings" },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1F2533] text-white flex flex-col h-screen sticky top-0 border-r border-white/5">
      {/* Brand Logo */}
      <div className="p-8">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tighter uppercase">SnapMyShow</span>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Global Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <div className="mb-4 px-4 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Command Center</p>
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/superadmin");
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                isActive 
                  ? "bg-white/10 text-white shadow-xl shadow-black/5" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
                )} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </div>
              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Profile/Footer */}
      <div className="p-6 mt-auto border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center font-black text-white italic shadow-lg shadow-indigo-500/20">
              SA
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-tight truncate w-32">Master Admin</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Root Controller</span>
            </div>
          </div>
          <Link href="/logout" className="flex items-center space-x-2 text-gray-400 hover:text-rose-400 transition-colors group">
            <LogOut className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Disconnect</span>
          </Link>
        </div>
        
        <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
          BMS-OS v2.4.0
        </p>
      </div>
    </aside>
  );
}

// Add ShieldCheck icon locally as it was missed in lucide-react list above
import { ShieldCheck } from "lucide-react";
