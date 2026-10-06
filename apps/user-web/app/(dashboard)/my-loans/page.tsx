"use client";

import { useState, useEffect } from "react";
import { useMyLoans, useExtendLoan, useReturnBook } from "@library/api";
import { useTranslation } from "react-i18next";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  SharedPagination
} from "@library/ui";

export default function MyLoansPage() {
  const { t, i18n } = useTranslation();

  const [loanSearch, setLoanSearch] = useState("");
  const [loanStatusFilter, setLoanStatusFilter] = useState<"ALL" | "BORROWED" | "RETURNED">("ALL");
  const [loanPage, setLoanPage] = useState(1);
  const [loanPageSize, setLoanPageSize] = useState(10);

  useEffect(() => {
    setLoanPage(1);
  }, [loanSearch, loanStatusFilter]);

  const { data: myLoans, isLoading: isLoansLoading, refetch: refetchLoans } = useMyLoans();
  const extendLoanMutation = useExtendLoan();
  const returnBookMutation = useReturnBook();

  const getConfirmText = (key: string, defaultEn: string, defaultZh: string) => {
    const resolved = t(key);
    if (resolved === key) {
      return i18n.language === "zh" ? defaultZh : defaultEn;
    }
    return resolved;
  };

  const handleReturn = (recordId: number) => {
    returnBookMutation.mutate(recordId, {
      onSuccess: () => {
        alert(i18n.language === "zh" ? "还书成功！感谢您的借阅。" : "Book returned successfully! Thank you.");
        refetchLoans();
      },
    });
  };

  const handleExtend = (recordId: number) => {
    extendLoanMutation.mutate(recordId, {
      onSuccess: () => {
        alert(i18n.language === "zh" ? "图书成功续借 7 天！" : "Loan extended by 7 days successfully!");
        refetchLoans();
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Unable to extend this loan.");
      },
    });
  };

  const filteredLoans = myLoans?.filter(loan => {
    const bookTitle = (loan.book?.title || '').toLowerCase();
    const author = (loan.book?.author || '').toLowerCase();
    const status = (loan.status || '').toLowerCase();
    const query = loanSearch.toLowerCase();
    
    const matchesSearch = bookTitle.includes(query) || author.includes(query) || status.includes(query);
    const matchesStatus = loanStatusFilter === "ALL" || loan.status === loanStatusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const paginatedLoans = filteredLoans.slice((loanPage - 1) * loanPageSize, loanPage * loanPageSize);
  const totalLoanPages = Math.ceil(filteredLoans.length / loanPageSize) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-extrabold text-white tracking-tight">{t("loans.title")}</h3>
        <p className="text-zinc-500 text-xs mt-0.5">{t("loans.description")}</p>
      </div>

      {/* Search and Selection Filters Row */}
      {myLoans && myLoans.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
          {/* Sleek Search Bar */}
          <div className="w-full lg:max-w-md bg-zinc-900/40 border border-zinc-900 rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder="Search loans by title, author or status..."
              value={loanSearch}
              onChange={(e) => setLoanSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full focus:ring-0 focus:border-transparent h-7 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {loanSearch && (
              <button onClick={() => setLoanSearch("")} className="text-zinc-500 hover:text-white transition-colors text-xs font-bold px-1 cursor-pointer bg-transparent border-none">
                Clear
              </button>
            )}
          </div>

          {/* Selection Dropdowns */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-[10px] uppercase font-extrabold tracking-wider hidden md:inline">
                {getConfirmText("loans.showEntries", "Show:", "显示:")}
              </span>
              <Select
                value={String(loanPageSize)}
                onValueChange={(val) => {
                  setLoanPageSize(Number(val));
                  setLoanPage(1);
                }}
              >
                <SelectTrigger className="bg-zinc-900/60 border border-zinc-900 text-xs text-zinc-200 px-4 py-2.5 rounded-2xl outline-none cursor-pointer hover:border-zinc-850 transition-colors h-10 w-24">
                  <SelectValue placeholder={String(loanPageSize)} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-300">
                  {[10, 25, 50, 100].map((size) => (
                    <SelectItem className="cursor-pointer" key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-[10px] uppercase font-extrabold tracking-wider hidden md:inline">
                {getConfirmText("loans.filterStatus", "Status Filter:", "状态筛选:")}
              </span>
              <Select
                value={loanStatusFilter}
                onValueChange={(val) => setLoanStatusFilter(val as any)}
              >
                <SelectTrigger className="bg-zinc-900/60 border border-zinc-900 text-xs text-zinc-200 px-4 py-2.5 rounded-2xl outline-none cursor-pointer hover:border-zinc-850 transition-colors h-10 min-w-[130px]">
                  <SelectValue placeholder={getConfirmText("loans.statusAll", "All Statuses", "全部状态")} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <SelectItem className="cursor-pointer" value="ALL">
                    {getConfirmText("loans.statusAll", "All Statuses", "全部状态")}
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="BORROWED">
                    {getConfirmText("loans.statusBorrowed", "Active Loans", "借阅中")}
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="RETURNED">
                    {getConfirmText("loans.statusReturned", "Returned Records", "已归还")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {isLoansLoading ? (
        <div className="py-20 text-center text-zinc-500">{t("loans.loading")}</div>
      ) : filteredLoans.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
          {loanSearch ? "No matching borrow records found." : t("loans.noLoans")}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedLoans.map((loan) => {
            const isOverdue = new Date(loan.dueDate) < new Date() && loan.status === "BORROWED";
            const isReturned = loan.status === "RETURNED";
            
            return (
              <div
                key={loan.id}
                className={`p-6 rounded-3xl bg-zinc-900/30 border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                  isReturned ? "border-zinc-900 opacity-60" : isOverdue ? "border-red-500/20 bg-red-950/5" : "border-zinc-850"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isReturned 
                        ? "bg-zinc-800 text-zinc-400 border border-zinc-700" 
                        : isOverdue 
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {loan.status === 'BORROWED' ? t("loans.activeStatus") : loan.status} {isOverdue && `• ${t("loans.overdue")}`}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{t("loans.loanId")}: #{loan.id}</span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-extrabold text-white text-base leading-tight">{loan.book?.title}</h4>
                    <p className="text-zinc-500 text-xs">by {loan.book?.author}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-left">
                    <div>
                      <span className="text-zinc-650 block text-[9px] font-bold uppercase">{t("loans.borrowDate")}</span>
                      <span className="text-zinc-400 font-medium">{new Date(loan.borrowDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-zinc-650 block text-[9px] font-bold uppercase">{t("loans.dueDate")}</span>
                      <span className={`font-bold ${isOverdue ? "text-red-400" : "text-zinc-300"}`}>
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:self-center">
                  {loan.status === "BORROWED" && (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={loan.extendedCount >= 2}
                            className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all text-zinc-200 hover:text-white font-bold rounded-xl text-xs cursor-pointer outline-none"
                            title={`Extended ${loan.extendedCount}/2 times`}
                          >
                            {t("loans.extend")} ({loan.extendedCount}/2)
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="text-left">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {getConfirmText("confirm.extendTitle", "Extend Loan", "确认续借")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {getConfirmText(
                                "confirm.extendDescription",
                                `Are you sure you want to extend the loan period for "${loan.book?.title || 'this book'}" by 7 days? You can extend up to 2 times.`,
                                `您确定要将《${loan.book?.title || '此书'}》的借阅期限延长 7 天吗？每本书最多可续借 2 次。`
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {getConfirmText("confirm.cancel", "Cancel", "取消")}
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleExtend(loan.id)} className="bg-blue-600 hover:bg-blue-700 text-white!">
                              {getConfirmText("confirm.extendAction", "Extend", "确认续借")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold rounded-xl text-xs cursor-pointer border-none outline-none"
                          >
                            {t("loans.returnBook")}
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="text-left">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {getConfirmText("confirm.returnTitle", "Return Book", "确认归还图书")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {getConfirmText(
                                "confirm.returnDescription",
                                `Are you sure you want to return "${loan.book?.title || 'this book'}" to the library?`,
                                `您确定要将《${loan.book?.title || '此书'}》归还至图书馆吗？`
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {getConfirmText("confirm.cancel", "Cancel", "取消")}
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleReturn(loan.id)} className="bg-blue-600 hover:bg-blue-700 text-white!">
                              {getConfirmText("confirm.returnAction", "Return", "确认归还")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  {loan.status === "RETURNED" && (
                    <div className="text-right text-xs">
                      <span className="text-zinc-600 block text-[9px] font-bold uppercase">{t("loans.returnedOn")}</span>
                      <span className="text-green-400 font-bold">
                        {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : "Yes"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="rounded-3xl border border-zinc-900 overflow-hidden">
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
      )}
    </div>
  );
}
