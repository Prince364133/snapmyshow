"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { ReactNode } from "react";
import { ProtectedRoute } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Only require onboarding for pages OTHER than the onboarding page itself
  const isOnboardingPage = pathname === "/admin/theaters/new";

  return (
    <ProtectedRoute 
        allowedRoles={["THEATER_ADMIN", "SUPER_ADMIN"]} 
        requireOnboarding={!isOnboardingPage}
    >
        <div className="flex min-h-screen bg-[#F8FAFC]">
          {/* Sidebar Navigation */}
          <AdminSidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-x-hidden flex flex-col">
            {/* We keep the inner content completely dynamic based on the active route */}
            <main className="flex-1 relative z-0 overflow-y-auto w-full focus:outline-none">
              {children}
            </main>
          </div>
        </div>
    </ProtectedRoute>
  );
}
