"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem("accessToken");
    
    if (accessToken) {
      // Redirect to dashboard if logged in
      router.push("/dashboard");
    } else {
      // Redirect to login if not logged in
      router.push("/login");
    }
  }, [router]);

  // Show loading while checking auth status
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-[#e5e5e5]">
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f59e0b]/20 border-t-[#f59e0b]"></div>
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-[#f59e0b]/20"></div>
        </div>
      </div>
    </div>
  );
}
