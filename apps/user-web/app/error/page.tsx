"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UserErrorPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center px-4 font-sans relative">
      <div className="absolute top-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative z-10 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-2xl mb-2 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-white">System Error</h1>
          <p className="text-zinc-400 text-sm">
            Access denied or reader system error occurred. Please verify your credentials or check with library support if this continues.
          </p>
        </div>
        <Link
          href="/login"
          className="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/10 cursor-pointer text-center no-underline border border-transparent"
        >
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
