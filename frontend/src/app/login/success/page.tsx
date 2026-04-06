"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function LoginSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Validate token and get user
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.get("/auth/me")
        .then(({ data }) => {
          if (data.success && data.user) {
            login(token, data.user);
            
            // Check if onboarding is needed
            if (!data.user.onboardingCompleted) {
              router.push("/onboarding");
            } else {
              router.push("/");
            }
          } else {
            router.push("/login?error=InvalidToken");
          }
        })
        .catch(() => {
          router.push("/login?error=ServerValidationFailed");
        });
    } else {
      router.push("/login");
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl font-medium text-gray-700">Authenticating...</div>
    </div>
  );
}
