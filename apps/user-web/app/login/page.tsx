"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin, useProfile } from "@library/api";
import { ThemeToggle } from "@library/ui";
import { BookOpen, Languages, ArrowUp, Eye, EyeOff } from "lucide-react";
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
      className={`fixed bottom-6 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl border border-blue-500/30 shadow-lg shadow-blue-500/10 transition-all duration-300 outline-none flex items-center justify-center cursor-pointer ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      title="Scroll to Top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

export default function LibraryReaderPortalLoginPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const getConfirmText = (key: string, defaultEn: string, defaultZh: string) => {
    const resolved = t(key);
    if (resolved === key) {
      return i18n.language === "zh" ? defaultZh : defaultEn;
    }
    return resolved;
  };

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

  // Redirect to Dashboard if already logged in
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        router.push("/my-loans");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (typeof window !== "undefined") {
            localStorage.setItem("token", data.accessToken);
          }
          setToken(data.accessToken);
          setAuthSuccess("Logged in successfully! Redirecting...");
          setTimeout(() => {
            setAuthSuccess("");
            refetchProfile();
            router.push("/my-loans");
          }, 1000);
        },
        onError: (err: unknown) => {
          const errResponse = err as { response?: { data?: { message?: string } } };
          setAuthError(errResponse.response?.data?.message || "Invalid email or password");
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
          ? "重置验证码已发送至您的邮箱！请在下方输入验证码（可输入测试码 123456）及新密码。"
          : "Verification code sent to your email! Please enter it below with your new password (you can use test code 123456)."
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
        i18n.language === "zh" ? "重置验证码无效！请输入正确的测试码 123456。" : "Invalid code! Please use the correct test code 123456."
      );
      return;
    }

    setIsForgotPending(true);

    setTimeout(() => {
      setIsForgotPending(false);
      setForgotSuccess(
        i18n.language === "zh"
          ? "密码重置成功！正在为您重定向至登录面板..."
          : "Password reset successfully! Redirecting you to login panel..."
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
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-550 text-xs font-semibold uppercase tracking-wider">Redirecting to Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Floating Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Neon light blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        {/* Left Column: Premium Value Pitch */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            {t("landing.badge")}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            {t("landing.title")} <br />
            <span className="text-blue-500">{t("landing.titleAccent")}</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl leading-relaxed">
            {t("landing.description")}
          </p>

          {/* Micro Statistics */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-900 max-w-lg">
            <div>
              <p className="text-3xl font-extrabold text-white">12K+</p>
              <p className="text-zinc-550 text-xs font-medium uppercase tracking-wider">{t("landing.stats.catalogBooks")}</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">4.8★</p>
              <p className="text-zinc-555 text-xs font-medium uppercase tracking-wider">{t("landing.stats.readerRating")}</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">99%</p>
              <p className="text-zinc-555 text-xs font-medium uppercase tracking-wider">{t("landing.stats.returnRate")}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Auth Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative transition-all duration-300">
            
            {authMode === "LOGIN" ? (
              <>
                <div className="border-b border-zinc-800 pb-4 mb-6 text-center">
                  <h2 className="font-extrabold text-lg text-white">{t("landing.cardTitle")}</h2>
                  <p className="text-zinc-555 text-xs mt-1">{t("landing.cardSub")}</p>
                </div>

                {authError && (
                  <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                    ⚠️ {authError === "Invalid email or password" ? t("landing.invalidCredentials") : authError}
                  </div>
                )}

                {authSuccess && (
                  <div className="p-3 mb-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium text-center animate-bounce">
                    ✨ {authSuccess}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">{t("landing.emailLabel")}</label>
                    <input
                      type="email"
                      required
                      placeholder={t("landing.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wide text-left">{t("landing.passwordLabel")}</label>
                      <button
                        type="button"
                        onClick={() => router.push("/forgot-password")}
                        className="text-[11px] text-blue-450 hover:text-blue-400 transition-colors font-extrabold bg-transparent border-none cursor-pointer outline-none"
                      >
                        {getConfirmText("landing.forgotPasswordLink", "Forgot Password?", "忘记密码？")}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder={t("landing.passwordPlaceholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-4 pr-12 py-3 text-sm outline-none transition-all text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1 bg-transparent border-none cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/15 cursor-pointer border-none outline-none"
                  >
                    {loginMutation.isPending ? t("landing.signingIn") : t("landing.logIn")}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="border-b border-zinc-800 pb-4 mb-6 text-center">
                  <h2 className="font-extrabold text-lg text-white">
                    {getConfirmText("forgot.title", "Forgot Password?", "找回密码")}
                  </h2>
                  <p className="text-zinc-555 text-xs mt-1">
                    {forgotStep === 1 
                      ? getConfirmText("forgot.subStep1", "Recover your reader portal credentials", "恢复您的读者端凭证")
                      : getConfirmText("forgot.subStep2", "Confirm passcode & update credentials", "验证安全代码并更新凭据")
                    }
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                    ⚠️ {forgotError}
                  </div>
                )}

                {forgotSuccess && (
                  <div className="p-3 mb-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium text-center">
                    ✨ {forgotSuccess}
                  </div>
                )}

                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotRequest} className="space-y-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">
                        {getConfirmText("forgot.emailLabel", "Recovery Email Address", "密保验证邮箱")}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder={t("landing.emailPlaceholder")}
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-855 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isForgotPending}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/15 cursor-pointer border-none outline-none"
                    >
                      {isForgotPending 
                        ? getConfirmText("forgot.sending", "Requesting Passcode...", "正在请求重置...") 
                        : getConfirmText("forgot.sendBtn", "Send Recovery Code", "发送重置密码代码")
                      }
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">
                        {getConfirmText("forgot.codeLabel", "Verification Code (Use 123456)", "重置验证码 (请输入 123456)")}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 123456"
                        value={forgotCode}
                        onChange={(e) => setForgotCode(e.target.value)}
                        className="w-full bg-zinc-955 border border-zinc-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white font-mono tracking-widest text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">
                        {getConfirmText("forgot.newPasswordLabel", "New Secure Password", "设置新密码")}
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1.5 uppercase tracking-wide text-left">
                        {getConfirmText("forgot.confirmNewPasswordLabel", "Confirm New Password", "确认新密码")}
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isForgotPending}
                      className="w-full py-3.5 bg-green-600 hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 transition-all text-white font-bold rounded-xl text-sm shadow-lg shadow-green-500/15 cursor-pointer border-none outline-none"
                    >
                      {isForgotPending 
                        ? getConfirmText("forgot.resetting", "Updating Password...", "正在重置密码...") 
                        : getConfirmText("forgot.resetBtn", "Confirm Reset Password", "确认重置密码")
                      }
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
                    {getConfirmText("forgot.backToLogin", "← Back to Sign In", "← 返回登录界面")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
}
