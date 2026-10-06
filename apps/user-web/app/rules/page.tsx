"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useProfile,
  useMyNotifications,
  useRules,
  useMarkNotificationRead,
} from "@library/api";
import { ThemeToggle, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@library/ui";
import { BookOpen, LogIn, Bell, Check, Scale } from "lucide-react";
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

// Inline replica of Languages since it's only in lucide-react but we can import it or define it
import { Languages } from "lucide-react";

export default function StandaloneRulesPage() {
  const { t, i18n } = useTranslation();

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

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  const { data: profile } = useProfile();
  const { data: notifications } = useMyNotifications();
  const { data: dbRules, isLoading: isRulesLoading } = useRules();
  const markNotificationRead = useMarkNotificationRead();

  const unreadNotifications = notifications?.filter((n) => !n.isRead) || [];
  const unreadCount = unreadNotifications.length;

  const faqRules = [
    {
      question: "📚 What is my maximum borrowing quota?",
      answer: "Standard reader accounts are permitted to have up to 5 active physical book loans checked out concurrently. If you reach this limit, you must return at least one active book before checking out new titles.",
    },
    {
      question: "⏳ How long can I keep a borrowed book?",
      answer: "All book check-outs are valid for a default duration of 14 calendar days. A courtesy warning is shown under your 'My Loans' tab as the due date approaches.",
    },
    {
      question: "🔄 Can I extend/renew my loan period?",
      answer: "Yes, active loans can be extended a maximum of 2 times. Each extension adds +7 additional calendar days to your current due date. Note that extensions must be requested before the book becomes overdue.",
    },
    {
      question: "⚠️ What happens if a book is overdue?",
      answer: "If any borrowed book exceeds its due date, your borrowing privileges are temporarily suspended. You will be unable to borrow new titles or request extensions until all overdue copies are safely returned.",
    },
    {
      question: "📢 How and where do I pick up my books?",
      answer: "Once requested online, books are held at the Library Hall Main Counter for up to 48 hours. Please present your digital Reader Profile or photo ID to the librarian to collect your physical copies.",
    },
  ];

  const activeRulesList = dbRules && dbRules.length > 0 
    ? dbRules.map(r => ({ question: r.title, answer: r.content })) 
    : faqRules;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
              <span className="text-zinc-555 text-[10px] uppercase font-bold tracking-widest block">
                {getConfirmText("common.readerDashboard", "READER DASHBOARD", "读者控制面板")}
              </span>
            </div>
          </Link>

          {/* Standalone Pages Navigation */}
          <div className="hidden md:flex items-center gap-1.5 pl-6 border-l border-zinc-900">
            <Link
              href="/catalog"
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
            >
              {getConfirmText("nav.browseCatalog", "Catalog", "浏览馆藏")}
            </Link>
            <Link
              href="/rules"
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer bg-blue-600 text-white shadow-lg shadow-blue-500/15"
            >
              {getConfirmText("nav.libraryRules", "Regulations", "规章制度")}
            </Link>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <LanguageToggle />
            <ThemeToggle />

            {/* Notification Bell (Logged In only) */}
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

                {showBellDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowBellDropdown(false)} />
                    <div className="absolute right-0 mt-2.5 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="font-extrabold text-sm text-white flex items-center gap-2">
                          <Bell className="w-4 h-4 text-blue-400" /> {t("notificationsPanel.title")}
                        </span>
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-left">
                        {notifications && notifications.length > 0 ? (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              className={`p-2.5 rounded-xl border transition-all relative group ${
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

          {token ? (
            <>
              <div className="h-6 w-px bg-zinc-900 hidden md:block" />
              <button
                onClick={() => { window.location.href = "/profile"; }}
                className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-zinc-900/40 border border-transparent hover:border-zinc-900 rounded-2xl transition-all outline-none"
              >
                <div className="hidden md:flex flex-col items-end text-right">
                  <span className="font-bold text-sm text-white leading-none mb-1">
                    {profile?.firstName} {profile?.lastName}
                  </span>
                  <span className="text-[10px] text-blue-455 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 leading-none uppercase">
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8 text-left">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Scale className="w-8 h-8 text-blue-500" />
            {t("rules.title")}
          </h3>
          <p className="text-zinc-500 text-sm mt-1">{t("rules.description")}</p>
        </div>

        {isRulesLoading ? (
          <div className="py-20 text-center text-zinc-500">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            {t("rules.loading")}
          </div>
        ) : (
          <Accordion type="single" collapsible defaultValue="faq-rule-0" className="space-y-4">
            {activeRulesList.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-rule-${index}`}
                className="border-zinc-900 bg-zinc-900/30 hover:border-zinc-850 [&[data-state=open]]:border-blue-500/30 [&[data-state=open]]:bg-blue-500/5 [&[data-state=open]]:shadow-lg"
              >
                <AccordionTrigger className="text-sm font-extrabold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 text-xs leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Notice Banner */}
        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-blue-450 text-xs leading-relaxed flex gap-4">
          <span className="text-2xl mt-0.5">💡</span>
          <div>
            <span className="font-extrabold text-sm text-white block mb-1">{t("rules.bannerTitle")}</span>
            {t("rules.bannerText")}
          </div>
        </div>
      </main>
    </div>
  );
}
