import SuperAdminSidebar from "@/components/admin/SuperAdminSidebar";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  // In a real application, you would verify the user's role here
  // and redirect if they are not a SUPER_ADMIN.
  
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <SuperAdminSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden flex flex-col">
        {/* We keep the inner content completely dynamic based on the active route */}
        <main className="flex-1 relative z-0 overflow-y-auto w-full focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
