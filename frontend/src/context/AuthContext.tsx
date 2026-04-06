"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Set default header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const { data } = await api.get("/auth/me");
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        throw new Error("Invalid session");
      }
    } catch (err) {
      console.error("Auth check failed", err);
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem("accessToken", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (e) {
      console.error("Logout failed", e);
    }
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ 
  children, 
  allowedRoles,
  requireOnboarding = false
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[],
  requireOnboarding?: boolean 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        // Check Role
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          router.push("/");
        } 
        // Check Onboarding
        else if (requireOnboarding && !user.onboardingCompleted) {
          router.push("/admin/theaters/new");
        }
      }
    }
  }, [user, loading, router, allowedRoles, requireOnboarding]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Authenticating Node</span>
      </div>
    </div>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  if (requireOnboarding && !user.onboardingCompleted) {
    return null;
  }

  return <>{children}</>;
};
