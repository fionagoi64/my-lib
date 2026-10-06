"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useProfile,
  useBooks,
  useBook,
  useCategories,
  useBorrowBook,
  useReturnBook,
  useExtendLoan,
  useMyLoans,
  useMyNotifications,
  useOpenLibrarySearch,
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
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  SharedPagination,
} from "@library/ui";
import {
  BookOpen,
  ArrowLeft,
  Bell,
  Check,
  Info,
  Languages,
  ArrowUp,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
} from "lucide-react";

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
import { useRouter } from "next/navigation";
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

export default function StandaloneCatalog() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default 10 books per page

  const getConfirmText = (key: string, defaultEn: string, defaultZh: string) => {
    const resolved = t(key);
    if (resolved === key) {
      return i18n.language === "zh" ? defaultZh : defaultEn;
    }
    return resolved;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  // Reset page to 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryId, pageSize]);

  const borrowBookMutation = useBorrowBook();
  const returnBookMutation = useReturnBook();
  const extendLoanMutation = useExtendLoan();
  const { data: myLoans } = useMyLoans();

  const { data: profile } = useProfile();
  const { data: books, isLoading: isBooksLoading } = useBooks({
    search: searchQuery,
    categoryId: selectedCategoryId,
    page: currentPage,
    limit: pageSize,
  });
  const { data: categories } = useCategories();
  const { data: bookDetails, isLoading: isBookDetailsLoading } = useBook(selectedBookId || 0);
  const { data: notifications } = useMyNotifications();
  const { data: openLibraryResults, isFetching: isOpenLibrarySearching } = useOpenLibrarySearch(searchQuery);

  const unreadNotifications = notifications?.filter((n) => !n.isRead) || [];
  const unreadCount = unreadNotifications.length;

  const handleBorrow = (bookId: number) => {
    if (!token) {
      alert(i18n.language === "zh" ? "请先登录您的读者账号才能借阅图书！" : "Please log in to borrow books!");
      return;
    }

    borrowBookMutation.mutate(bookId, {
      onSuccess: () => {
        alert(t("catalog.borrowSuccess") || (i18n.language === "zh" ? "图书借阅成功！请到前台领取。" : "Book borrowed successfully! Collect it at the front desk."));
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || (i18n.language === "zh" ? "无法借阅此图书。" : "Unable to borrow this book."));
      },
    });
  };

  const handleReturn = (recordId: number) => {
    returnBookMutation.mutate(recordId, {
      onSuccess: () => {
        alert(i18n.language === "zh" ? "还书成功！" : "Book returned successfully!");
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || (i18n.language === "zh" ? "操作失败，请重试。" : "Failed to return book."));
      }
    });
  };

  const handleExtend = (recordId: number) => {
    extendLoanMutation.mutate(recordId, {
      onSuccess: () => {
        alert(i18n.language === "zh" ? "续借成功！" : "Loan extended successfully!");
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || (i18n.language === "zh" ? "超出最大续借限制！" : "Failed to extend loan."));
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

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

          {/* Left-aligned Navigation Items (Moved beside logo) */}
          <div className="hidden md:flex items-center gap-1.5 pl-6 border-l border-zinc-900">
            <Link
              href="/catalog"
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer bg-blue-600 text-white shadow-lg shadow-blue-500/15"
            >
              {getConfirmText("nav.browseCatalog", "Catalog", "浏览馆藏")}
            </Link>
            <Link
              href="/rules"
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
            >
              {getConfirmText("nav.libraryRules", "Regulations", "规章制度")}
            </Link>
          </div>
        </div>

        {/* Top Navigation Right Controls */}
        <div className="flex items-center gap-5">
          {/* Toggles & Icons Group */}
          <div className="flex items-center gap-2.5">
            <LanguageToggle />
            <ThemeToggle />

            {/* Premium Floating Bell Icon - only shown if authenticated */}
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
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-zinc-550">
                            {t("notificationsPanel.noNotifications")}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-zinc-800 text-center">
                        <Link
                          href="/notifications"
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

          {/* User controls / Auth triggers */}
          {token ? (
            <>
              {/* Premium Vertical Divider */}
              <div className="h-6 w-px bg-zinc-900 hidden md:block" />

              {/* User Profile Pill — clicks to Profile page */}
              <button
                onClick={() => { window.location.href = "/profile"; }}
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

                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-extrabold text-blue-400 shadow-inner">
                  {(profile?.firstName?.charAt(0) || '').toUpperCase()}
                </div>
              </button>
            </>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/10 cursor-pointer border border-blue-500/20"
            >
              <LogIn className="w-4 h-4" />
              {getConfirmText("common.logIn", "Reader Login", "读者登录")}
            </Link>
          )}
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="space-y-6">
          {selectedBookId !== null ? (
            <div className="space-y-6">
              {/* Back to catalog button */}
              <div className="flex justify-start">
                <button
                  onClick={() => setSelectedBookId(null)}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-xs font-bold bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl cursor-pointer outline-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("catalog.backToCatalog")}
                </button>
              </div>

              {isBookDetailsLoading ? (
                <div className="py-24 text-center text-zinc-500">{t("catalog.loading")}</div>
              ) : !bookDetails ? (
                <div className="py-24 text-center text-zinc-500 bg-zinc-900/20 border border-zinc-900 rounded-3xl">
                  Book profile not found.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-zinc-900/10 border border-zinc-900 p-6 md:p-8 rounded-3xl text-left">
                  {/* Left Column: Book Cover */}
                  <div className="lg:col-span-4 flex flex-col items-center justify-start pt-2">
                    <div className="book-cover-premium w-full max-w-[260px] aspect-[3/4] rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group border">
                      <div className="absolute inset-0 bg-blue-500/5 opacity-50 group-hover:opacity-80 transition-all pointer-events-none filter blur-xl" />
                      
                      <div className="flex items-center justify-between z-10">
                        <span className="badge-category text-[8px] font-bold uppercase px-2 py-0.5 rounded-full">
                          {bookDetails.category?.name || "Premium Edition"}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      </div>

                      <div className="space-y-1.5 z-10 text-left">
                        <h3 className="text-title font-extrabold text-lg tracking-tight leading-snug drop-shadow-md">
                          {bookDetails.title}
                        </h3>
                        <p className="text-author text-[11px] font-medium">
                          by {bookDetails.author}
                        </p>
                      </div>

                      <div className="flex justify-between items-center z-10 border-divider border-t pt-3">
                        <span className="text-meta text-[8px] font-mono">
                          ISBN: {bookDetails.isbn || "N/A"}
                        </span>
                        <span className="text-title text-[9px] font-extrabold uppercase tracking-widest">
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
                        <span className="text-zinc-555 text-[9px] uppercase font-extrabold tracking-wider block text-zinc-500">Availability Status</span>
                        <span className={`text-xs font-extrabold ${bookDetails.stockAvailable > 0 ? "text-green-400" : "text-red-400"}`}>
                          {bookDetails.stockAvailable > 0 ? t("catalog.inStock") : t("catalog.outOfStock")}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-extrabold text-lg block">{bookDetails.stockAvailable}</span>
                        <span className="text-zinc-500 text-[8px] uppercase font-bold">Of {bookDetails.stockTotal} {t("catalog.copies")}</span>
                      </div>
                    </div>

                    {/* Overview */}
                    <div className="space-y-2">
                      <h4 className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">{t("catalog.bookOverview")}</h4>
                      <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-line bg-zinc-900/10 p-5 rounded-2xl border border-zinc-900">
                        {bookDetails.description || t("catalog.noSynopsis")}
                      </p>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                      <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl">
                        <span className="text-zinc-500 text-[8px] uppercase font-bold block">{t("catalog.isbn")}</span>
                        <span className="text-zinc-200 font-extrabold text-xs font-mono mt-1 block">{bookDetails.isbn || "Not Configured"}</span>
                      </div>
                      <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl">
                        <span className="text-zinc-500 text-[8px] uppercase font-bold block">{t("catalog.genre")}</span>
                        <span className="text-zinc-200 font-extrabold text-xs mt-1 block">{bookDetails.category?.name || "General Catalog"}</span>
                      </div>
                      <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl col-span-2 md:col-span-1">
                        <span className="text-zinc-500 text-[8px] uppercase font-bold block">{t("catalog.acquisitionCode")}</span>
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
                                <p className="text-zinc-550 text-[10px] mt-0.5">
                                  {getConfirmText("catalog.loginRequiredSub", "You must sign in to request physical copies or manage loans.", "您需要登录您的读者账号方可申请借阅馆藏或管理您的账目。")}
                                </p>
                              </div>
                              <Link
                                href="/"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer border-none"
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
                              <h5 className="text-white font-bold text-xs">{t("catalog.readyToBorrow")}</h5>
                              <p className="text-zinc-500 text-[10px] mt-0.5">{t("catalog.readyToBorrowSub")}</p>
                            </div>
                            <button
                              onClick={() => handleBorrow(bookDetails.id)}
                              disabled={bookDetails.stockAvailable <= 0}
                              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer outline-none"
                            >
                              <BookOpen className="w-4 h-4" />
                              {t("catalog.borrowCopy")}
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Header & Search block */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-900 text-left">
                <div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">{t("catalog.exploreBooks")}</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">{t("catalog.exploreBooksSub")}</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Page Size Select Dropdown */}
                  <div className="relative">
                    <Select value={String(pageSize)} onValueChange={(val) => setPageSize(parseInt(val, 10))}>
                      <SelectTrigger className="bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none text-zinc-350 cursor-pointer font-bold h-9">
                        <SelectValue placeholder={`${pageSize} ${getConfirmText("catalog.perPage", "per page", "本/页")}`} />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-300">
                        <SelectItem value="10">10 {getConfirmText("catalog.perPage", "per page", "本/页")}</SelectItem>
                        <SelectItem value="25">25 {getConfirmText("catalog.perPage", "per page", "本/页")}</SelectItem>
                        <SelectItem value="50">50 {getConfirmText("catalog.perPage", "per page", "本/页")}</SelectItem>
                        <SelectItem value="100">100 {getConfirmText("catalog.perPage", "per page", "本/页")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-64">
                    <Input
                      type="text"
                      placeholder={t("catalog.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none text-white transition-all h-9"
                    />
                    <svg className="w-4.5 h-4.5 absolute left-3.5 top-2.5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {searchQuery.trim().length >= 3 && (
                <section className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-5 text-left">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Discover more titles</h4>
                      <p className="mt-1 text-xs text-zinc-400">Open Library results are public book metadata, not books currently in this library.</p>
                    </div>
                    {isOpenLibrarySearching && <span className="text-xs font-semibold text-indigo-300">Searching…</span>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {openLibraryResults?.results.map((book) => (
                      <a
                        key={book.workId}
                        href={`https://openlibrary.org${book.workId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3 no-underline transition-colors hover:border-indigo-400/50"
                      >
                        <div className="flex gap-3">
                          <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                            {book.coverUrl ? <img src={book.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-extrabold text-white group-hover:text-indigo-300">{book.title}</p>
                            <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400">{book.authors.join(", ") || "Unknown author"}</p>
                            {book.firstPublishedYear && <p className="mt-1 text-[10px] text-zinc-500">First published {book.firstPublishedYear}</p>}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 items-center justify-start">
                <button
                  onClick={() => setSelectedCategoryId(undefined)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border outline-none cursor-pointer ${
                    selectedCategoryId === undefined
                      ? "bg-white text-zinc-950 border-white font-extrabold"
                      : "bg-zinc-900 text-zinc-400 border-zinc-850 hover:text-white"
                  }`}
                >
                  {t("catalog.allCategories")}
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border outline-none cursor-pointer ${
                      selectedCategoryId === cat.id
                        ? "bg-white text-zinc-950 border-white font-extrabold"
                        : "bg-zinc-900 text-zinc-400 border-zinc-850 hover:text-white"
                    }`}
                  >
                    {cat.name} ({cat._count?.books || 0})
                  </button>
                ))}
              </div>

              {/* Books Grid */}
              {(() => {
                const booksList = Array.isArray(books) ? books : (books?.data || []);
                const booksMeta = Array.isArray(books) ? null : books?.meta;

                if (isBooksLoading) {
                  return <div className="py-24 text-center text-zinc-500">{t("catalog.loading")}</div>;
                }

                if (booksList.length === 0) {
                  return (
                    <div className="py-24 text-center text-zinc-550 bg-zinc-900/20 border border-dashed border-zinc-850 rounded-3xl italic">
                      {t("catalog.noBooks")}
                    </div>
                  );
                }

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {booksList.map((book: Book) => (
                        <div
                          key={book.id}
                          onClick={() => router.push(`/catalog/${book.id}`)}
                          className="book-cover-premium aspect-[3/4] rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group border hover:scale-[1.03] transition-all duration-300 cursor-pointer"
                        >
                          {/* Decorative Blur Effect */}
                          <div className="absolute inset-0 bg-blue-500/5 opacity-50 group-hover:opacity-85 transition-opacity pointer-events-none filter blur-xl" />

                          {/* Top Row: Category & Availability Dot */}
                          <div className="flex items-center justify-between z-10">
                            <span className="badge-category text-[8px] font-bold uppercase px-2 py-0.5 rounded-full">
                              {book.category?.name || "Premium Edition"}
                            </span>
                            
                            <div className="badge-copies flex items-center gap-1.5 px-2 py-0.5 rounded-full border">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                book.stockAvailable > 0 ? "bg-green-400 animate-pulse" : "bg-red-400"
                              }`} />
                              <span className="text-[8px] font-bold font-mono">
                                {book.stockAvailable}/{book.stockTotal}
                              </span>
                            </div>
                          </div>

                          {/* Middle: Title & Author */}
                          <div className="space-y-1.5 z-10 text-left">
                            <h3 className="text-title font-extrabold text-lg tracking-tight leading-snug drop-shadow-md transition-colors line-clamp-2">
                              {book.title}
                            </h3>
                            <p className="text-author text-[11px] font-medium">
                              by {book.author}
                            </p>
                          </div>

                          {/* Bottom Row: ISBN & Logo */}
                          <div className="flex justify-between items-center z-10 border-divider border-t pt-3">
                            <span className="text-meta text-[8px] font-mono truncate max-w-[130px]">
                              ISBN: {book.isbn || "N/A"}
                            </span>
                            <span className="text-title text-[9px] font-extrabold uppercase tracking-widest">
                              LS
                            </span>
                          </div>

                          {/* Sliding Action Drawer on Hover */}
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-850 p-4.5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 flex gap-2.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(() => {
                              const activeLoan = myLoans?.find((loan) => loan.bookId === book.id && loan.status === "BORROWED");
                              if (activeLoan) {
                                return (
                                  <>
                                    <button
                                      onClick={() => handleExtend(activeLoan.id)}
                                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-indigo-500/10 border-none outline-none"
                                    >
                                      {getConfirmText("loans.extend", "Extend", "续借")}
                                    </button>
                                    <button
                                      onClick={() => handleReturn(activeLoan.id)}
                                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-rose-500/10 border-none outline-none"
                                    >
                                      {getConfirmText("loans.return", "Return", "归还")}
                                    </button>
                                  </>
                                );
                              }
                              return (
                                <>
                                  <button
                                    onClick={() => router.push(`/catalog/${book.id}`)}
                                    className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-[10px] border border-zinc-800 transition-all cursor-pointer text-center outline-none"
                                  >
                                    {t("catalog.viewDetails")}
                                  </button>
                                  <button
                                    onClick={() => handleBorrow(book.id)}
                                    disabled={book.stockAvailable <= 0}
                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-extrabold rounded-xl text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10 border-none outline-none"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    {t("catalog.borrow")}
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Unified Shared Pagination */}
                    {booksMeta && (
                      <SharedPagination
                        page={currentPage}
                        setPage={setCurrentPage}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        totalItems={booksMeta.total}
                        totalPages={booksMeta.totalPages}
                      />
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
}
