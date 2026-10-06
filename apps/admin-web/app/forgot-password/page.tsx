"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@library/ui";
import { ArrowUp, Eye, EyeOff, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

function LanguageToggle() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const handleToggle = () => {
    const newLang = currentLang === "zh" ? "en" : "zh";
    i18n.changeLanguage(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLang);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl transition-all outline-none flex items-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer"
      title={currentLang === "zh" ? "Switch to English" : "切换至中文"}
    >
      <Languages className="w-4 h-4" />
      <span>{currentLang === "zh" ? "EN" : "中"}</span>
    </button>
  );
}

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 p-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-xl border border-red-500/30 shadow-lg shadow-red-500/10 transition-all duration-300 outline-none flex items-center justify-center cursor-pointer ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      title="Scroll to Top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

export default function AdminForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Forgot Password Wizard states
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isForgotPending, setIsForgotPending] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect to dashboard if logged-in admin is found
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setIsForgotPending(true);

    setTimeout(() => {
      setIsForgotPending(false);
      setForgotStep(2);
      setForgotSuccess(
        i18n.language === "zh"
          ? "如果该管理员帐号存在，重置验证码已发送至该邮箱。"
          : "If that administrator account exists, a verification code has been sent to its email address."
      );
    }, 1200);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (newPassword !== confirmNewPassword) {
      setForgotError(
        i18n.language === "zh" ? "两次输入的新密码不一致！" : "New passwords do not match!"
      );
      return;
    }

    if (!/^\d{6}$/.test(forgotCode.trim())) {
      setForgotError(
        i18n.language === "zh" ? "请输入 6 位验证码。" : "Enter the 6-digit verification code."
      );
      return;
    }

    setIsForgotPending(true);

    setTimeout(() => {
      setIsForgotPending(false);
      setForgotSuccess(
        i18n.language === "zh"
          ? "管理员密码重置成功！正在为您返回登录面板..."
          : "Administrator password reset successfully! Returning to login panel..."
      );
      setTimeout(() => {
        setForgotSuccess("");
        router.push("/login");
      }, 2000);
    }, 1500);
  };

  if (!isMounted || token) {
    return (
      <div className="min-h-screen bg-zinc-955 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-555 text-xs font-semibold uppercase tracking-wider">Redirecting to Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-955 text-white flex flex-col justify-center items-center px-4 font-sans relative">
      {/* Floating Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="absolute top-[-10%] w-[500px] h-[500px] rounded-full bg-red-550/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-2">
            🔑
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Recover Password</h1>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            {forgotStep === 1 
              ? "Request staff verification code"
              : "Verify security code & reset"
            }
          </p>
        </div>

        {forgotError && (
          <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
            ⚠️ {forgotError}
          </div>
        )}

        {forgotSuccess && (
          <div role="status" className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium text-center">
            ✨ {forgotSuccess}
          </div>
        )}

        {forgotStep === 1 ? (
          <form onSubmit={handleForgotRequest} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">Staff Recovery Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@library.com"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setForgotError("");
                }}
                className="w-full bg-zinc-950 border border-zinc-855 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isForgotPending}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 transition-all text-white font-bold rounded-xl text-sm shadow-lg shadow-red-500/15 cursor-pointer border-none outline-none"
            >
              {isForgotPending ? "Requesting Passcode..." : "Send Verification Passcode"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">
                Passcode Verification Code
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="6-digit code"
                value={forgotCode}
                onChange={(e) => setForgotCode(e.target.value)}
                className="w-full bg-zinc-955 border border-zinc-855 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white font-mono tracking-widest text-center"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">New Security Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-955 border border-zinc-855 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-400 transition-colors p-1 bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-zinc-955 border border-zinc-855 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-400 transition-colors p-1 bg-transparent border-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isForgotPending}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 transition-all text-white font-bold rounded-xl text-sm shadow-lg shadow-green-500/15 cursor-pointer border-none outline-none"
            >
              {isForgotPending ? "Updating Password..." : "Confirm Password Update"}
            </button>
          </form>
        )}

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-xs text-zinc-400 hover:text-white transition-colors font-bold bg-transparent border-none cursor-pointer outline-none"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
}
