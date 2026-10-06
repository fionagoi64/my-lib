"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-sans">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Signing you out securely...</p>
      </div>
    </div>
  );
}
