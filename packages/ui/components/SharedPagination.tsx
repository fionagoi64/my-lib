import * as React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "./ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface SharedPaginationProps {
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  totalItems: number;
  totalPages: number;
  showPageSizeOptions?: boolean;
}

export function SharedPagination({
  page,
  setPage,
  pageSize,
  setPageSize,
  totalItems,
  totalPages,
  showPageSizeOptions = true,
}: SharedPaginationProps) {
  const fromIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIndex = Math.min(page * pageSize, totalItems);

  // Fallback so it doesn't break if totalPages is 0
  const safeTotalPages = Math.max(1, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-zinc-900 bg-zinc-950/20 w-full text-left mt-auto">
      <div className="text-zinc-500 text-xs font-semibold">
        Showing <span className="text-zinc-350">{fromIndex}</span> to{" "}
        <span className="text-zinc-350">{toIndex}</span> of{" "}
        <span className="text-zinc-350">{totalItems}</span> entries
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {showPageSizeOptions && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-semibold hidden sm:inline">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => setPageSize(parseInt(val, 10))}
            >
              <SelectTrigger className="bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs outline-none text-zinc-350 cursor-pointer font-bold h-8 w-[70px]">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-300">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Pagination className="w-auto mx-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && setPage(page - 1)}
                className={
                  page === 1
                    ? "pointer-events-none opacity-30 cursor-not-allowed px-2 h-8"
                    : "cursor-pointer px-2 h-8"
                }
              />
            </PaginationItem>

            {Array.from({ length: safeTotalPages }, (_, idx) => idx + 1)
              .filter(
                (p) =>
                  Math.abs(p - page) <= 1 || p === 1 || p === safeTotalPages
              )
              .map((p, index, array) => {
                const showEllipsisBefore =
                  index > 0 && p - array[index - 1] > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsisBefore && (
                      <span className="text-zinc-650 text-xs font-bold px-1">
                        ...
                      </span>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setPage(p)}
                        isActive={page === p}
                        className={`cursor-pointer h-8 w-8 ${
                          page === p
                            ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-600 hover:text-white"
                            : ""
                        }`}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                );
              })}

            <PaginationItem>
              <PaginationNext
                onClick={() => page < safeTotalPages && setPage(page + 1)}
                className={
                  page === safeTotalPages
                    ? "pointer-events-none opacity-30 cursor-not-allowed px-2 h-8"
                    : "cursor-pointer px-2 h-8"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
