"use client";

import Link from "next/link";
import {
  useBooks,
  useAllLoans,
  useUsers,
  useRules,
  useCategories,
} from "@library/api";
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

export default function AdminDashboardPage() {
  const { t } = useTranslation();

  const { data: books } = useBooks({ search: "" });
  const { data: allLoans } = useAllLoans();
  const { data: users } = useUsers();
  const { data: dbRules } = useRules();
  const { data: categories } = useCategories();

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Cockpit Title */}
      <div>
        <h3 className="text-2xl font-black text-white tracking-tight">{t("admin.dashboard.title")}</h3>
        <p className="text-zinc-555 text-xs mt-0.5">{t("admin.dashboard.subtitle")}</p>
      </div>

      {/* Analytical Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between hover:border-zinc-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{t("admin.dashboard.inventory")}</span>
            <span className="text-lg">📚</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{books?.length || 0}</span>
            <span className="text-zinc-500 text-[10px] block mt-1">
              {books ? books.reduce((acc: number, b: Book) => acc + b.stockTotal, 0) : 0} {t("admin.dashboard.copies")}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between hover:border-zinc-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{t("admin.dashboard.activeLoans")}</span>
            <span className="text-lg">⏳</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">
              {allLoans?.filter(l => l.status === "BORROWED").length || 0}
            </span>
            <span className="text-zinc-500 text-[10px] block mt-1">
              {allLoans ? allLoans.filter(l => l.status === "BORROWED" && new Date(l.dueDate) < new Date()).length : 0} {t("admin.dashboard.overdue")}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between hover:border-zinc-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{t("admin.dashboard.members")}</span>
            <span className="text-lg">👥</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{users?.length || 0}</span>
            <span className="text-zinc-500 text-[10px] block mt-1">
              {allLoans && allLoans.length > 0 ? (allLoans.filter(l => l.status === "RETURNED").length / allLoans.length * 100).toFixed(0) : "100"}% {t("admin.dashboard.checkInRate")}
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between hover:border-zinc-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{t("admin.dashboard.rules")}</span>
            <span className="text-lg">📜</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{dbRules?.length || 0}</span>
            <span className="text-zinc-500 text-[10px] block mt-1">{t("admin.dashboard.guidelines")}</span>
          </div>
        </div>
      </div>

      {/* Main Cockpit Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Recent Activity Ledger & Shortcuts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Activity Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/20 border border-zinc-900 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
              <h4 className="font-bold text-white text-sm">Recent Ledger Operations</h4>
              <Link
                href="/loans"
                className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400 transition-colors"
              >
                View Full Ledger
              </Link>
            </div>

            {(!allLoans || allLoans.length === 0) ? (
              <p className="text-zinc-500 text-xs italic text-center py-6">No recent operations recorded.</p>
            ) : (
              <div className="space-y-3.5">
                {allLoans.slice(0, 4).map((loan) => {
                  const isOverdue = new Date(loan.dueDate) < new Date() && loan.status === "BORROWED";
                  return (
                    <div key={loan.id} className="flex justify-between items-center text-xs p-3 rounded-xl bg-zinc-950/40 border border-zinc-900/30">
                      <div className="flex items-center gap-3">
                        <div className="text-lg shrink-0">
                          {loan.status === "RETURNED" ? "🟢" : isOverdue ? "🔴" : "🟡"}
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-white block">
                            {loan.user?.firstName} {loan.user?.lastName}
                          </span>
                          <span className="text-zinc-500 text-[10px] block truncate max-w-[200px] sm:max-w-md">
                            Borrowed: <span className="text-zinc-350">{loan.book?.title}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-bold block ${loan.status === "RETURNED" ? "text-green-400" : isOverdue ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
                          {loan.status === "RETURNED" ? "Checked-In" : isOverdue ? "Overdue" : "On Loan"}
                        </span>
                        <span className="text-[10px] text-zinc-500 block">
                          Due: {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operational Shortcuts Panel */}
          <div className="p-6 rounded-3xl bg-zinc-900/20 border border-zinc-900 space-y-4">
            <h4 className="font-bold text-white text-sm text-left">System Operations Shortcuts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/books?add=true"
                className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-850 hover:border-red-500/25 transition-all text-left group block"
              >
                <span className="text-lg block mb-2">📚</span>
                <span className="font-bold text-xs text-white group-hover:text-red-500 transition-colors block">Add New Book</span>
                <span className="text-zinc-500 text-[10px] mt-0.5 block">Catalog new copies</span>
              </Link>

              <Link
                href="/users"
                className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-850 hover:border-red-500/25 transition-all text-left group block"
              >
                <span className="text-lg block mb-2">👥</span>
                <span className="font-bold text-xs text-white group-hover:text-red-500 transition-colors block">Create Reader</span>
                <span className="text-zinc-500 text-[10px] mt-0.5 block">Register user account</span>
              </Link>

              <Link
                href="/rules?add=true"
                className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-850 hover:border-red-500/25 transition-all text-left group block"
              >
                <span className="text-lg block mb-2">📜</span>
                <span className="font-bold text-xs text-white group-hover:text-red-500 transition-colors block">Edit Regulations</span>
                <span className="text-zinc-500 text-[10px] mt-0.5 block">Update system rules</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Category Metrics & Health Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Distribution Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/20 border border-zinc-900 space-y-4">
            <h4 className="font-bold text-white text-sm text-left">Category Stock Weight</h4>
            
            {(!categories || categories.length === 0) ? (
              <p className="text-zinc-500 text-xs italic text-center">No categories registered.</p>
            ) : (
              <div className="space-y-4">
                {categories.slice(0, 5).map((cat) => {
                  const catBookCount = cat._count?.books || 0;
                  const totalBookCount = books?.length || 1;
                  const pct = Math.round((catBookCount / totalBookCount) * 100);
                  
                  return (
                    <div key={cat.id} className="space-y-1.5 text-xs text-left">
                      <div className="flex justify-between font-semibold">
                        <span className="text-zinc-300">{cat.name}</span>
                        <span className="text-zinc-500">{catBookCount} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* System Core Health Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/20 border border-zinc-900 space-y-3">
            <h4 className="font-bold text-white text-sm text-left">System Health</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">API Gateway</span>
                <span className="font-bold text-green-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">PostgreSQL Latency</span>
                <span className="font-bold text-green-400">4ms (Optimal)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Next.js Dev Server</span>
                <span className="font-bold text-green-400">Active</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
