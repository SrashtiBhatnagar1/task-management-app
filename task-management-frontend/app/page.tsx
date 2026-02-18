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
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1e8] text-[#15120f]">
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#15120f]/20 border-t-[#15120f]"></div>
      </div>
    </div>
  );
}
