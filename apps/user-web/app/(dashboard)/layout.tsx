"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useProfile,
  useMyLoans,
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@library/api";
import {
  ThemeToggle,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@library/ui";
import { BookOpen, Clock, User, Scale, LogOut, Bell, Trash2, Check, Info, ArrowUp, Languages, ChevronRight, Home } from "lucide-react";
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  const getConfirmText = (key: string, defaultEn: string, defaultZh: string) => {
    const resolved = t(key);
    if (resolved === key) {
      return i18n.language === "zh" ? defaultZh : defaultEn;
    }
    return resolved;
  };

  const Breadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);

    const getSegmentName = (segment: string) => {
      const enMap: Record<string, string> = {
        catalog: "Catalog Explorer",
        "my-loans": "My Borrowings",
        profile: "Reader Profile",
        notifications: "Inbox Alerts",
        rules: "Regulations"
      };

      const zhMap: Record<string, string> = {
        catalog: "馆藏检索",
        "my-loans": "我的借阅",
        profile: "个人中心",
        notifications: "消息通知",
        rules: "规章制度"
      };

      const friendlyEn = enMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const friendlyZh = zhMap[segment] || segment;

      return getConfirmText(`breadcrumb.${segment}`, friendlyEn, friendlyZh);
    };

    return (
      <nav className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-550 select-none pb-2 bg-transparent">
        <Link
          href="/catalog"
          className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer text-zinc-500 no-underline"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{getConfirmText("breadcrumb.home", "Home", "首页")}</span>
        </Link>
        {segments.map((segment, index) => {
          const url = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          return (
            <div key={segment} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-zinc-700" />
              {isLast ? (
                <span className="text-zinc-300 font-extrabold">{getSegmentName(segment)}</span>
              ) : (
                <Link
                  href={url}
                  className="hover:text-zinc-300 transition-colors cursor-pointer text-zinc-500 no-underline"
                >
                  {getSegmentName(segment)}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    );
  };

  const isPublicPage = pathname === "/catalog" || pathname === "/rules";

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
      if (!storedToken && !isPublicPage) {
        router.push("/login");
      }
    }
  }, [router, pathname, isPublicPage]);

  const { data: profile } = useProfile();
  const { data: myLoans } = useMyLoans();
  const { data: notifications } = useMyNotifications();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const unreadNotifications = notifications?.filter((n) => !n.isRead) || [];
  const unreadCount = unreadNotifications.length;

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  if (!isMounted || (!token && !isPublicPage)) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Sleek Top Navigation */}
      <nav className="border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h2 className="font-bold text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                {getConfirmText("common.librarySystem", "Library System", "图书管理系统")}
              </h2>
              <span className="text-zinc-550 text-[10px] uppercase font-bold tracking-widest block">
                {getConfirmText("common.readerDashboard", "READER DASHBOARD", "读者控制面板")}
              </span>
            </div>
          </Link>

          {/* Left-aligned Navigation Items */}
          <div className="hidden md:flex items-center gap-1.5 pl-6 border-l border-zinc-900">
            <Link
              href="/catalog"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                isActive("/catalog")
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              {getConfirmText("nav.browseCatalog", "Catalog", "浏览馆藏")}
            </Link>
            <Link
              href="/rules"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                isActive("/rules")
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              {getConfirmText("nav.libraryRules", "Regulations", "规章制度")}
            </Link>
          </div>
        </div>

        {/* Top Navigation Right Controls */}
        <div className="flex items-center gap-5">
          {/* Toggles & Icons Group */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/rules"
              className="md:hidden p-2 text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl transition-all outline-none flex items-center gap-1 text-[10px] font-bold shadow-sm cursor-pointer"
              title={getConfirmText("nav.libraryRules", "Regulations", "规章制度")}
            >
              <Scale className="w-4 h-4" />
              <span>{getConfirmText("nav.rulesShort", "Rules", "制度")}</span>
            </Link>
            <LanguageToggle />
            <ThemeToggle />

            {/* Premium Floating Bell Icon */}
            {token && (
              <div className="relative">
                <button
                  onClick={() => setShowBellDropdown(!showBellDropdown)}
                  className="relative p-2.5 text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl transition-all outline-none cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white ring-2 ring-zinc-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Bell Dropdown Popup */}
                {showBellDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowBellDropdown(false)} />
                    <div className="absolute right-0 mt-2.5 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="font-extrabold text-sm text-white flex items-center gap-2">
                          <Bell className="w-4 h-4 text-blue-400" /> {t("notificationsPanel.title")}
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllNotificationsRead.mutate();
                              setShowBellDropdown(false);
                            }}
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors bg-transparent border-none cursor-pointer"
                          >
                            {t("notificationsPanel.markAllRead")}
                          </button>
                        )}
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {notifications && notifications.length > 0 ? (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              className={`p-2.5 rounded-xl border transition-all text-left relative group ${
                                n.isRead
                                  ? 'bg-zinc-950/20 border-zinc-950 text-zinc-400'
                                  : 'bg-blue-500/5 border-blue-500/10 text-white'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-sm mt-0.5">
                                  {n.type === 'BORROW' && '📚'}
                                  {n.type === 'RETURN' && '✅'}
                                  {n.type === 'EXTENSION' && '⏳'}
                                  {n.type === 'RULE_UPDATE' && '📢'}
                                  {!['BORROW', 'RETURN', 'EXTENSION', 'RULE_UPDATE'].includes(n.type) && '💡'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">{n.title}</p>
                                  <p className="text-[10px] text-zinc-550 line-clamp-2 mt-0.5">{n.message}</p>
                                </div>
                                {!n.isRead && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markNotificationRead.mutate(n.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-blue-400 hover:bg-zinc-800 rounded ml-1 border-none bg-transparent cursor-pointer"
                                    title="Mark as read"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-zinc-555">
                            {t("notificationsPanel.noNotifications")}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-zinc-800 text-center">
                        <Link
                          href="/notifications"
                          onClick={() => setShowBellDropdown(false)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-all cursor-pointer bg-transparent border-none block"
                        >
                          {t("notificationsPanel.viewAll")}
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Premium Vertical Divider */}
          {token && <div className="h-6 w-px bg-zinc-900 hidden md:block" />}

          {/* User Profile Pill */}
          {token ? (
            <Link
              href="/profile"
              className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-zinc-900/40 border border-transparent hover:border-zinc-900 rounded-2xl transition-all outline-none"
            >
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="font-bold text-sm text-white leading-none mb-1">
                  {profile?.firstName} {profile?.lastName}
                </span>
                <span className="text-[10px] text-blue-450 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 leading-none uppercase">
                  {profile?.role?.name || "READER"}
                </span>
              </div>

              {profile?.profile?.avatarUrl ? (
                <img src={profile.profile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-zinc-800 object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-extrabold text-blue-400 shadow-inner">
                  {(profile?.firstName?.charAt(0) || '').toUpperCase()}
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] text-white transition-all shadow-lg shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer no-underline border border-transparent"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-lg border-t border-zinc-850 py-2.5 px-6 flex items-center justify-around z-45 shadow-2xl">
        <Link
          href="/catalog"
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            isActive("/catalog") ? "text-blue-500" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>{getConfirmText("nav.catalogShort", "Catalog", "馆藏")}</span>
        </Link>
        {token ? (
          <>
            <Link
              href="/my-loans"
              className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                isActive("/my-loans") ? "text-blue-500" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>{getConfirmText("nav.loansShort", "Loans", "借阅")}</span>
            </Link>
            <Link
              href="/profile"
              className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                isActive("/profile") ? "text-blue-500" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <User className="w-5 h-5" />
              <span>{getConfirmText("nav.profileShort", "Profile", "我的")}</span>
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-200"
          >
            <User className="w-5 h-5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 pb-24 md:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 hidden lg:flex flex-col justify-between h-[calc(100vh-140px)] sticky top-[100px]">
          {token ? (
            <div className="space-y-2 text-left">
              <Link
                href="/my-loans"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer border-none ${
                  isActive("/my-loans")
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 bg-transparent"
                }`}
              >
                <Clock className="w-4 h-4" />
                {getConfirmText("nav.myLoans", "My Loans", "我的借阅")}
                {myLoans && myLoans.filter((l) => l.status === "BORROWED").length > 0 && (
                  <span className="ml-auto bg-amber-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {myLoans.filter((l) => l.status === "BORROWED").length} {getConfirmText("nav.active", "active", "在借")}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer border-none ${
                  isActive("/profile")
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 bg-transparent"
                }`}
              >
                <User className="w-4 h-4" />
                {getConfirmText("nav.myProfile", "My Profile", "个人中心")}
              </Link>
              <Link
                href="/notifications"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer border-none ${
                  isActive("/notifications")
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 bg-transparent"
                }`}
              >
                <Bell className="w-4 h-4" />
                {getConfirmText("nav.notifications", "Notifications", "消息通知")}
                {unreadCount > 0 && (
                  <span className="ml-auto bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-zinc-900/35 border border-zinc-850 text-left space-y-4 shadow-xl">
              <div className="text-xl">✨</div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">{getConfirmText("guest.title", "Member Benefits", "会员特权")}</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                {getConfirmText("guest.desc", "Sign in to easily borrow books from our library catalog, extend active borrow dates, and receive instant return notifications.", "登录后即可轻松借阅图书、在线申请延期还书并接收即时归还提醒。")}
              </p>
              <Link
                href="/login"
                className="block text-center w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/10 cursor-pointer no-underline border border-transparent"
              >
                {getConfirmText("landing.logIn", "Sign In Now", "立即登录")}
              </Link>
            </div>
          )}

          {token && (
            <div className="pt-4 border-t border-zinc-900 mt-4 lg:mt-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 active:scale-95 cursor-pointer bg-transparent border-none"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("common.logOut")}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {getConfirmText("confirm.logoutTitle", "Confirm Logout", "确认退出登录")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {getConfirmText(
                        "confirm.logoutDescription",
                        "Are you sure you want to log out? You will need to sign in again to access your reader dashboard.",
                        "您确定要退出登录吗？您需要重新登录才能访问您的读者控制面板。"
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {getConfirmText("confirm.cancel", "Cancel", "取消")}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white!">
                      {getConfirmText("confirm.logoutAction", "Log Out", "退出登录")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </aside>

        {/* Dynamic Panels */}
        <main className="lg:col-span-9 w-full space-y-4">
          <Breadcrumbs />
          {children}
        </main>
      </div>
      <ScrollToTop />
    </div>
  );
}
