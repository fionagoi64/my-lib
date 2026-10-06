"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useProfile,
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
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
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  ClipboardList,
  Users,
  Scale,
  User,
  LogOut,
  Bell,
  Check,
  Languages,
  Megaphone,
  ArrowUp,
  Sliders,
  ChevronRight,
  Home,
} from "lucide-react";
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
      className="fixed bottom-6 right-6 z-50 p-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-xl border border-red-500/30 shadow-lg shadow-red-500/10 transition-all duration-300 outline-none flex items-center justify-center cursor-pointer"
      title="Scroll to Top"
      style={{ display: isVisible ? "flex" : "none" }}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
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
        dashboard: "Dashboard",
        books: "Books Inventory",
        categories: "Categories",
        loans: "Loans & Borrowing",
        users: "Reader Directory",
        rules: "Regulations Editor",
        inbox: "Notification Inbox",
        dispatch: "Broadcast Center",
        profile: "Admin Profile"
      };

      const zhMap: Record<string, string> = {
        dashboard: "管理看板",
        books: "图书档案",
        categories: "类目管理",
        loans: "借还事务",
        users: "读者名录",
        rules: "规章规制",
        inbox: "工作收件箱",
        dispatch: "消息播发",
        profile: "账号设置"
      };

      const friendlyEn = enMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const friendlyZh = zhMap[segment] || segment;

      return getConfirmText(`breadcrumb.${segment}`, friendlyEn, friendlyZh);
    };

    return (
      <nav className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-550 select-none pb-2 bg-transparent">
        <Link
          href="/dashboard"
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

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        router.push("/");
      } else {
        setToken(storedToken);
      }
    }
  }, [router]);

  const { data: profile } = useProfile();
  const { data: notifications } = useMyNotifications();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();

  const unreadNotifications = notifications?.filter((n) => !n.isRead) || [];
  const unreadCount = unreadNotifications.length;

  // Protect route by ensuring role is ADMIN or LIBRARIAN
  useEffect(() => {
    if (profile) {
      const roleName = profile.role?.name;
      if (roleName !== "ADMIN" && roleName !== "LIBRARIAN") {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        router.push("/");
      }
    }
  }, [profile, router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  if (!isMounted || !token || (profile && profile.role?.name !== "ADMIN" && profile.role?.name !== "LIBRARIAN")) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-550 text-xs font-semibold uppercase tracking-wider">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  const avatarUrl = profile?.profile?.avatarUrl;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-105 transition-transform duration-300">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-tight leading-tight group-hover:text-red-400 transition-colors">
                {t("admin.nav.controlCenter")}
              </h2>
              <span className="text-red-500 text-[10px] uppercase font-bold tracking-widest block">
                {t("admin.nav.subtitle")}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-5">
          {/* Toggles & Icons Group */}
          <div className="flex items-center gap-2.5">
            <LanguageToggle />
            <ThemeToggle />

            {/* Premium Floating Bell Icon */}
            <div className="relative">
              <button
                onClick={() => setShowBellDropdown(!showBellDropdown)}
                className="relative p-2 text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl transition-all outline-none cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-zinc-950 animate-pulse">
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
                        <Bell className="w-4 h-4 text-red-500" /> Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            markAllNotificationsRead.mutate();
                            setShowBellDropdown(false);
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 font-bold transition-colors bg-transparent border-none cursor-pointer"
                        >
                          Mark all read
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
                                : 'bg-red-500/5 border-red-500/10 text-white'
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
                                <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5">{n.message}</p>
                              </div>
                              {!n.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markNotificationRead.mutate(n.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-red-400 hover:bg-zinc-800 rounded ml-1 border-none bg-transparent cursor-pointer"
                                  title="Mark as read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs text-zinc-500">
                          No notifications yet.
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-800 text-center">
                      <Link
                        href="/inbox"
                        onClick={() => setShowBellDropdown(false)}
                        className="text-xs text-red-400 hover:text-red-300 font-bold transition-all cursor-pointer bg-transparent border-none block"
                      >
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Premium Vertical Divider */}
          <div className="h-6 w-px bg-zinc-900 hidden md:block" />

          {/* User Profile Card (Grouped Name, Badge, Avatar) */}
          <Link
            href="/profile"
            className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-zinc-900/40 border border-transparent hover:border-zinc-900 rounded-2xl transition-all outline-none"
          >
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="font-bold text-sm text-white leading-none mb-1">
                {profile?.firstName} {profile?.lastName}
              </span>
              <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/25 leading-none uppercase">
                {profile?.role?.name || "ADMIN"}
              </span>
            </div>

            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-zinc-800 object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 shadow-inner">
                {(profile?.firstName?.charAt(0) || '').toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </nav>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 flex flex-col justify-between lg:h-[calc(100vh-140px)] sticky top-[100px] pb-6 md:pb-0">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer ${
                isActive("/dashboard") ? "bg-red-600 text-white shadow-lg shadow-red-500/10" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t("admin.nav.dashboard")}
            </Link>
            <Link
              href="/books"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer ${
                isActive("/books") ? "bg-red-600 text-white shadow-lg shadow-red-500/10" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {t("admin.nav.books")}
            </Link>
            <Link
              href="/categories"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer ${
                isActive("/categories") ? "bg-red-600 text-white shadow-lg shadow-red-500/10" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              {t("admin.nav.categories")}
            </Link>
            <Link
              href="/loans"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer ${
                isActive("/loans") ? "bg-red-600 text-white shadow-lg shadow-red-500/10" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              {t("admin.nav.loans")}
            </Link>
            <Link
              href="/users"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer ${
                isActive("/users") ? "bg-red-600 text-white shadow-lg shadow-red-500/10" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              {t("admin.nav.users")}
            </Link>
            <Link
              href="/rules"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer ${
                isActive("/rules") ? "bg-red-600 text-white shadow-lg shadow-red-500/10" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              }`}
            >
              <Scale className="w-4 h-4" />
              {t("admin.nav.rules")}
            </Link>
            <Link
              href="/profile"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer ${
                isActive("/profile") ? "bg-red-600 text-white shadow-lg shadow-red-500/10" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              {t("admin.nav.profile")}
            </Link>
            <Link
              href="/inbox"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer ${
                isActive("/inbox") ? "bg-red-600 text-white shadow-lg shadow-red-500/10" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              }`}
            >
              <Bell className="w-4 h-4" />
              {t("admin.nav.inbox")}
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/dispatch"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all outline-none text-left cursor-pointer ${
                isActive("/dispatch") ? "bg-red-600 text-white shadow-lg shadow-red-500/10" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              {t("admin.nav.dispatch")}
            </Link>
          </div>

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
                      "Are you sure you want to log out of the Control Center?",
                      "您确定要退出控制中心登录吗？"
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
