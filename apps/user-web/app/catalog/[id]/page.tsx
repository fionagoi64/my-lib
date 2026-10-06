"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useProfile,
  useBook,
  useBorrowBook,
  useReturnBook,
  useExtendLoan,
  useMyLoans,
  useMyNotifications,
} from "@library/api";
import {
  ThemeToggle,
} from "@library/ui";
import {
  BookOpen,
  ArrowLeft,
  Bell,
  Languages,
  ArrowUp,
  LogIn,
  User,
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
      className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 rounded-xl transition-all flex items-center justify-center cursor-pointer outline-none"
      title="Switch Language / 切换语言"
    >
      <Languages className="w-5 h-5" />
      <span className="text-[10px] font-bold ml-1.5 uppercase tracking-wider">{currentLang}</span>
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

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all z-50 cursor-pointer border border-blue-500/20"
      title="Scroll to Top"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}

interface BookDetailsProps {
  params: Promise<{ id: string }>;
}

export default function BookDetailPage({ params }: BookDetailsProps) {
  const { t, i18n } = useTranslation();
  const resolvedParams = use(params);
  const bookId = Number(resolvedParams.id);
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  const { data: profile } = useProfile();
  const { data: bookDetails, isLoading: isBookDetailsLoading } = useBook(bookId);
  const { data: myLoans } = useMyLoans();
  const { data: notifications } = useMyNotifications();

  const borrowBookMutation = useBorrowBook();
  const returnBookMutation = useReturnBook();
  const extendLoanMutation = useExtendLoan();

  const unreadNotifications = notifications?.filter((n) => !n.isRead) || [];
  const unreadCount = unreadNotifications.length;

  const getConfirmText = (key: string, defaultEn: string, defaultZh: string) => {
    const resolved = t(key);
    if (resolved === key) {
      return i18n.language === "zh" ? defaultZh : defaultEn;
    }
    return resolved;
  };

  const handleBorrow = (id: number) => {
    if (!token) {
      alert(i18n.language === "zh" ? "请先登录您的读者账号才能借阅图书！" : "Please log in to borrow books!");
      return;
    }

    borrowBookMutation.mutate(id, {
      onSuccess: () => {
        alert(t("catalog.borrowSuccess") || (i18n.language === "zh" ? "图书借阅成功！请到前台领取。" : "Book borrowed successfully! Collect it at the front desk."));
      },
      onError: (err: unknown) => {
        const errResponse = err as { response?: { data?: { message?: string } } };
        alert(errResponse.response?.data?.message || (i18n.language === "zh" ? "无法借阅此图书。" : "Unable to borrow this book."));
      },
    });
  };

  const handleReturn = (recordId: number) => {
    returnBookMutation.mutate(recordId, {
      onSuccess: () => {
        alert(i18n.language === "zh" ? "还书成功！" : "Book returned successfully!");
      },
      onError: (err: unknown) => {
        const errResponse = err as { response?: { data?: { message?: string } } };
        alert(errResponse.response?.data?.message || (i18n.language === "zh" ? "操作失败，请重试。" : "Failed to return book."));
      }
    });
  };

  const handleExtend = (recordId: number) => {
    extendLoanMutation.mutate(recordId, {
      onSuccess: () => {
        alert(i18n.language === "zh" ? "续借成功！" : "Loan extended successfully!");
      },
      onError: (err: unknown) => {
        const errResponse = err as { response?: { data?: { message?: string } } };
        alert(errResponse.response?.data?.message || (i18n.language === "zh" ? "超出最大续借限制！" : "Failed to extend loan."));
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    router.push("/catalog");
  };

  const Breadcrumbs = () => {
    return (
      <nav className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-550 select-none pb-2 bg-transparent">
        <Link
          href="/catalog"
          className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer text-zinc-500 no-underline"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{getConfirmText("breadcrumb.home", "Home", "首页")}</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-zinc-700" />
          <Link
            href="/catalog"
            className="hover:text-zinc-300 transition-colors cursor-pointer text-zinc-500 no-underline"
          >
            {getConfirmText("breadcrumb.catalog", "Catalog Explorer", "馆藏检索")}
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-zinc-700" />
          <span className="text-zinc-300 font-extrabold">
            {bookDetails ? bookDetails.title : (t("catalog.loading") || "Loading...")}
          </span>
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Sleek Top Navigation */}
      <nav className="border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group no-underline">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h2 className="font-bold text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors m-0 text-sm md:text-base">
                {getConfirmText("common.librarySystem", "Library System", "图书管理系统")}
              </h2>
              <span className="text-zinc-550 text-[10px] uppercase font-bold tracking-widest block">
                {getConfirmText("common.readerDashboard", "READER DASHBOARD", "读者控制面板")}
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 pl-6 border-l border-zinc-900">
            <Link
              href="/catalog"
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 no-underline"
            >
              {getConfirmText("nav.browseCatalog", "Catalog", "浏览馆藏")}
            </Link>
            <Link
              href="/rules"
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 no-underline"
            >
              {getConfirmText("nav.libraryRules", "Regulations", "规章制度")}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <LanguageToggle />
            <ThemeToggle />

            {token && (
              <div className="relative">
                <button
                  onClick={() => setShowBellDropdown(!showBellDropdown)}
                  className="relative p-2.5 text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-xl transition-all outline-none cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white ring-2 ring-zinc-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showBellDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowBellDropdown(false)} />
                    <div className="absolute right-0 mt-2.5 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="font-extrabold text-sm text-white flex items-center gap-2">
                          <Bell className="w-4 h-4 text-blue-400" /> {t("notificationsPanel.title") || "Notifications"}
                        </span>
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
                                  <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5">{n.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 py-6 text-center italic">{t("notificationsPanel.empty") || "No new alerts"}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {token ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full hover:bg-zinc-850 active:scale-95 transition-all outline-none cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black uppercase">
                  {profile?.firstName?.charAt(0) || <User className="w-3 h-3" />}
                </div>
                <span className="text-xs font-extrabold text-zinc-300 hidden sm:inline">
                  {profile ? `${profile.firstName} ${profile.lastName}` : "Member"}
                </span>
              </button>

              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn text-left">
                    <Link
                      href="/my-loans"
                      className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-zinc-300 hover:bg-zinc-855 hover:text-white transition-all no-underline border-b border-zinc-850"
                    >
                      📚 {getConfirmText("nav.myLoans", "My Loans", "我的借阅")}
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-zinc-300 hover:bg-zinc-855 hover:text-white transition-all no-underline border-b border-zinc-850"
                    >
                      ⚙️ {getConfirmText("nav.myProfile", "My Profile", "个人中心")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left bg-transparent border-none cursor-pointer outline-none"
                    >
                      🚪 {getConfirmText("common.logOut", "Log Out", "退出登录")}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer no-underline border border-transparent flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{getConfirmText("landing.logIn", "Sign In", "登录")}</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 text-left">
        <div className="space-y-6">
          {/* Breadcrumbs */}
          <Breadcrumbs />

          <div className="flex justify-start">
            <Link
              href="/catalog"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-xs font-bold bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl cursor-pointer no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("catalog.backToCatalog") || "Back to Catalog"}
            </Link>
          </div>

          {isBookDetailsLoading ? (
            <div className="py-24 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">
              {t("catalog.loading") || "Loading Book Profile..."}
            </div>
          ) : !bookDetails ? (
            <div className="py-24 text-center text-zinc-500 bg-zinc-900/20 border border-zinc-900 rounded-3xl">
              Book profile not found.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-zinc-900/10 border border-zinc-900 p-6 md:p-8 rounded-3xl text-left">
              {/* Left Column: Book Cover */}
              <div className="lg:col-span-4 flex flex-col items-center justify-start pt-2">
                <div className="book-cover-premium w-full max-w-[260px] aspect-[3/4] rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group border border-zinc-800">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-50 group-hover:opacity-80 transition-all pointer-events-none filter blur-xl" />
                  
                  <div className="flex items-center justify-between z-10">
                    <span className="badge-category text-[8px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      {bookDetails.category?.name || "Premium Edition"}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  </div>

                  <div className="space-y-1.5 z-10 text-left">
                    <h3 className="text-title font-extrabold text-lg tracking-tight leading-snug drop-shadow-md text-white">
                      {bookDetails.title}
                    </h3>
                    <p className="text-author text-[11px] font-medium text-zinc-400">
                      by {bookDetails.author}
                    </p>
                  </div>

                  <div className="flex justify-between items-center z-10 border-divider border-t border-zinc-800 pt-3">
                    <span className="text-meta text-[8px] font-mono text-zinc-500">
                      ISBN: {bookDetails.isbn || "N/A"}
                    </span>
                    <span className="text-title text-[9px] font-extrabold uppercase tracking-widest text-blue-500">
                      LS
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Spec Sheets */}
              <div className="lg:col-span-8 space-y-6">
                <div>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 font-extrabold uppercase px-2.5 py-1 rounded-full border border-blue-500/20">
                    {bookDetails.category?.name || "General Catalog"}
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight mt-3">
                    {bookDetails.title}
                  </h2>
                  <p className="text-zinc-400 text-xs mt-1">
                    Author: <span className="text-white font-bold">{bookDetails.author}</span>
                  </p>
                </div>

                {/* Stock availability */}
                <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500 text-[9px] uppercase font-extrabold tracking-wider block">Availability Status</span>
                    <span className={`text-xs font-extrabold ${bookDetails.stockAvailable > 0 ? "text-green-400" : "text-red-400"}`}>
                      {bookDetails.stockAvailable > 0 ? t("catalog.inStock") || "In Stock" : t("catalog.outOfStock") || "Out of Stock"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-extrabold text-lg block">{bookDetails.stockAvailable}</span>
                    <span className="text-zinc-555 text-[8px] uppercase font-bold">Of {bookDetails.stockTotal} {t("catalog.copies") || "Copies"}</span>
                  </div>
                </div>

                {/* Overview */}
                <div className="space-y-2">
                  <h4 className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">{t("catalog.bookOverview") || "Book Overview"}</h4>
                  <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-line bg-zinc-900/10 p-5 rounded-2xl border border-zinc-900">
                    {bookDetails.description || t("catalog.noSynopsis") || "No synopsis available for this book profile."}
                  </p>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl">
                    <span className="text-zinc-555 text-[8px] uppercase font-bold block">{t("catalog.isbn") || "ISBN"}</span>
                    <span className="text-zinc-200 font-extrabold text-xs font-mono mt-1 block">{bookDetails.isbn || "Not Configured"}</span>
                  </div>
                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl">
                    <span className="text-zinc-555 text-[8px] uppercase font-bold block">{t("catalog.genre") || "Genre"}</span>
                    <span className="text-zinc-200 font-extrabold text-xs mt-1 block">{bookDetails.category?.name || "General Catalog"}</span>
                  </div>
                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl col-span-2 md:col-span-1">
                    <span className="text-zinc-555 text-[8px] uppercase font-bold block">{t("catalog.acquisitionCode") || "Acquisition Code"}</span>
                    <span className="text-zinc-200 font-extrabold text-xs font-mono mt-1 block">#BK-{String(bookDetails.id).padStart(4, '0')}</span>
                  </div>
                </div>

                {/* Action Box */}
                <div className="pt-6 border-t border-zinc-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {(() => {
                    if (!token) {
                      return (
                        <>
                          <div className="text-left">
                            <h5 className="text-yellow-500 font-bold text-xs">
                              {getConfirmText("catalog.loginRequiredTitle", "Login Required", "需要登录读者账号")}
                            </h5>
                            <p className="text-zinc-500 text-[10px] mt-0.5">
                              {getConfirmText("catalog.loginRequiredSub", "You must sign in to request physical copies or manage loans.", "您需要登录您的读者账号方可申请借阅馆藏或管理您的账目。")}
                            </p>
                          </div>
                          <Link
                            href="/login"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer no-underline border border-transparent"
                          >
                            <LogIn className="w-4 h-4" />
                            {getConfirmText("common.logIn", "Log In", "立即登录")}
                          </Link>
                        </>
                      );
                    }
                    const activeLoan = myLoans?.find((loan) => loan.bookId === bookDetails.id && loan.status === "BORROWED");
                    if (activeLoan) {
                      return (
                        <>
                          <div className="text-left">
                            <h5 className="text-indigo-400 font-bold text-xs">
                              {getConfirmText("catalog.alreadyBorrowedTitle", "Active Loan Active", "您当前正在借阅此书")}
                            </h5>
                            <p className="text-zinc-500 text-[10px] mt-0.5">
                              {getConfirmText("catalog.alreadyBorrowedSub", "Due date is tracked in your loan history panel.", "应还日期以及延期记录已在您的借阅列表中同步。")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleExtend(activeLoan.id)}
                              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 cursor-pointer border-none outline-none"
                            >
                              {getConfirmText("loans.extendAction", "Extend Loan", "申请续借")}
                            </button>
                            <button
                              onClick={() => handleReturn(activeLoan.id)}
                              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10 cursor-pointer border-none outline-none"
                            >
                              {getConfirmText("loans.returnAction", "Return Book", "办理归还")}
                            </button>
                          </div>
                        </>
                      );
                    }
                    return (
                      <>
                        <div className="text-left">
                          <h5 className="text-white font-bold text-xs">{t("catalog.readyToBorrow") || "Ready to Borrow"}</h5>
                          <p className="text-zinc-500 text-[10px] mt-0.5">{t("catalog.readyToBorrowSub") || "Request a copy instantly to pick up at the library counter"}</p>
                        </div>
                        <button
                          onClick={() => handleBorrow(bookDetails.id)}
                          disabled={bookDetails.stockAvailable <= 0}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer outline-none"
                        >
                          <BookOpen className="w-4 h-4" />
                          {t("catalog.borrowCopy") || "Borrow Book"}
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
}
