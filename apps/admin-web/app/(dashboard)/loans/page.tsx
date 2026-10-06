"use client";

import { useState, useEffect } from "react";
import {
  useAllLoans,
  useReturnBook,
} from "@library/api";
import { SharedPagination } from "@library/ui";
import { useTranslation } from "react-i18next";


export default function AdminLoansPage() {
  const { t } = useTranslation();

  const [loanSearch, setLoanSearch] = useState("");
  const [loanPage, setLoanPage] = useState(1);
  const [loanPageSize, setLoanPageSize] = useState(10);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setLoanPage(1);
  }, [loanSearch]);

  const { data: allLoans, refetch: refetchLoans } = useAllLoans();
  const returnBookMutation = useReturnBook();

  const handleAdminReturn = (loanId: number) => {
    returnBookMutation.mutate(loanId, {
      onSuccess: () => {
        setFeedback({ type: "success", message: "Book checked in successfully." });
        refetchLoans();
      },
      onError: (err: any) => {
        setFeedback({ type: "error", message: err.response?.data?.message || "Failed to process check-in." });
      },
    });
  };

  const filteredLoans = allLoans?.filter(loan => {
    const readerName = `${loan.user?.firstName || ''} ${loan.user?.lastName || ''}`.toLowerCase();
    const bookTitle = (loan.book?.title || '').toLowerCase();
    const email = (loan.user?.email || '').toLowerCase();
    const status = (loan.status || '').toLowerCase();
    const query = loanSearch.toLowerCase();
    return readerName.includes(query) || bookTitle.includes(query) || email.includes(query) || status.includes(query);
  }) || [];
  
  const paginatedLoans = filteredLoans.slice((loanPage - 1) * loanPageSize, loanPage * loanPageSize);
  const totalLoanPages = Math.ceil(filteredLoans.length / loanPageSize) || 1;

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-xl font-extrabold text-white tracking-tight">System Loan Ledger</h3>
        <p className="text-zinc-500 text-xs">Full auditing report of all user books checked-out or returned globally.</p>
      </div>

      {feedback && <div role={feedback.type === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>{feedback.message}</div>}

      {/* Sleek Search Bar */}
      <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-900 rounded-2xl px-4 py-3 flex items-center gap-3">
        <svg className="w-4 h-4 text-zinc-550" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by reader, book, email or status..."
          value={loanSearch}
          onChange={(e) => setLoanSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-550 w-full"
        />
        {loanSearch && (
          <button onClick={() => setLoanSearch("")} className="text-zinc-500 hover:text-white transition-colors text-xs font-bold px-1 cursor-pointer bg-transparent border-none">
            Clear
          </button>
        )}
      </div>

      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-zinc-900/50 border-b border-zinc-850 text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Reader Member</th>
                <th className="px-6 py-4">Book Title</th>
                <th className="px-6 py-4">Loan/Due Dates</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40">
              {paginatedLoans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic bg-zinc-900/10">
                    No matching borrow record logs found in auditing system.
                  </td>
                </tr>
              ) : (
                paginatedLoans.map((loan) => {
                  const isOverdue = new Date(loan.dueDate) < new Date() && loan.status === "BORROWED";
                  
                  return (
                    <tr key={loan.id} className="hover:bg-zinc-900/10 transition-all">
                      <td className="px-6 py-4 text-left">
                        <div className="font-extrabold text-white">{loan.user?.firstName} {loan.user?.lastName}</div>
                        <div className="text-zinc-500">{loan.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="font-semibold text-zinc-300">{loan.book?.title}</div>
                        <div className="text-zinc-500 text-[10px]">ID: #{loan.bookId}</div>
                      </td>
                      <td className="px-6 py-4 space-y-0.5 text-zinc-400 text-left">
                        <div>Borrow: {new Date(loan.borrowDate).toLocaleDateString()}</div>
                        <div className={isOverdue ? "text-red-400 font-bold" : ""}>
                          Due: {new Date(loan.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          loan.status === "RETURNED" 
                            ? "bg-zinc-800 text-zinc-400 border border-zinc-750" 
                            : isOverdue 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {loan.status} {isOverdue && "• OVERDUE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {loan.status === "BORROWED" && (
                          <button
                            onClick={() => handleAdminReturn(loan.id)}
                            disabled={returnBookMutation.isPending}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold cursor-pointer border-none outline-none"
                          >
                            {returnBookMutation.isPending ? "Checking in…" : "Check In"}
                          </button>
                        )}
                        {loan.status === "RETURNED" && (
                          <span className="text-[10px] font-bold text-green-400">
                            Checked In
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <SharedPagination
          page={loanPage}
          setPage={setLoanPage}
          pageSize={loanPageSize}
          setPageSize={setLoanPageSize}
          totalItems={filteredLoans?.length || 0}
          totalPages={totalLoanPages}
        />
      </div>
    </div>
  );
}
