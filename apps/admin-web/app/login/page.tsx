"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin, useProfile } from "@library/api";
import { ThemeToggle, Input } from "@library/ui";
import { ArrowUp, Eye, EyeOff, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  stockTotal: number;
  stockAvailable: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
}

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

export default function AdminLoginPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Auth Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Forgot Password Wizard states
  const [authMode, setAuthMode] = useState<"LOGIN" | "FORGOT">("LOGIN");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isForgotPending, setIsForgotPending] = useState(false);

  const loginMutation = useLogin();
  const { refetch: refetchProfile } = useProfile();

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          const role = data.user?.role;
          if (role !== "ADMIN" && role !== "LIBRARIAN") {
            setAuthError(
              i18n.language === "zh"
                ? "访问被拒绝。只有管理员和图书管理员可以登录控制中心。"
                : "Access denied. Only Admins and Librarians can log into the Control Center."
            );
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
            }
            return;
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("token", data.accessToken);
          }
          setToken(data.accessToken);
          setAuthSuccess(
            i18n.language === "zh"
              ? "控制中心登录成功！正在重定向..."
              : "Control Center logged in successfully! Redirecting..."
          );
          setTimeout(() => {
            setAuthSuccess("");
            refetchProfile();
            router.push("/dashboard");
          }, 1000);
        },
        onError: (err: unknown) => {
          const errResponse = err as { response?: { data?: { message?: string } } };
          setAuthError(errResponse.response?.data?.message || "Invalid administrator credentials");
        },
      }
    );
  };

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
          ? "重置验证码已发送至您的邮箱！请在下方输入验证码 123456 和新密码。"
          : "Secure verification passcode sent to your email! Please enter code 123456 below with your new password."
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

    if (forgotCode.trim() !== "123456") {
      setForgotError(
        i18n.language === "zh" ? "验证码无效！请输入正确的测试码 123456。" : "Invalid passcode! Please use the correct test code 123456."
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
        setForgotEmail("");
        setForgotCode("");
        setNewPassword("");
        setConfirmNewPassword("");
        setForgotStep(1);
        setAuthMode("LOGIN");
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
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center px-4 font-sans relative">
      {/* Floating Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="absolute top-[-10%] w-[500px] h-[500px] rounded-full bg-red-550/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {authMode === "LOGIN" ? (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-2">
                🔐
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">{t("admin.login.title")}</h1>
              <p className="text-zinc-550 text-xs font-semibold uppercase tracking-wider">{t("admin.login.subtitle")}</p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                ⚠️ {authError}
              </div>
            )}

            {authSuccess && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium text-center animate-pulse">
                ✨ {authSuccess}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">{t("admin.login.emailLabel")}</label>
                <Input
                  type="email"
                  required
                  placeholder="admin@library.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-855 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white h-11"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wide text-left">{t("admin.login.passwordLabel")}</label>
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-[11px] text-red-450 hover:text-red-400 transition-colors font-extrabold bg-transparent border-none cursor-pointer outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-855 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl pl-4 pr-12 py-3 text-sm outline-none transition-all text-white h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-400 transition-colors p-1 bg-transparent border-none cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 transition-all text-white font-bold rounded-xl text-sm shadow-lg shadow-red-500/10 cursor-pointer border-none outline-none"
              >
                {loginMutation.isPending ? t("admin.login.verifying") : t("admin.login.btnAuthenticate")}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-2">
                🔑
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">Recover Password</h1>
              <p className="text-zinc-550 text-xs font-semibold uppercase tracking-wider">
                {forgotStep === 1 
                  ? "Request staff verification code"
                  : "Verify security code & reset"
                }
              </p>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                ⚠️ {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium text-center">
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
                    placeholder="admin@library.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
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
                    Passcode Verification Code (Use 123456)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123456"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-855 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white font-mono tracking-widest text-center"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">New Security Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-855 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-zinc-955 border border-zinc-855 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white"
                  />
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
                onClick={() => {
                  setAuthMode("LOGIN");
                  setForgotError("");
                  setForgotSuccess("");
                }}
                className="text-xs text-zinc-400 hover:text-white transition-colors font-bold bg-transparent border-none cursor-pointer outline-none"
              >
                ← Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
}
