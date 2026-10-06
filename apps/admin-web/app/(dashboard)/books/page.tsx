"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  useBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  useCategories,
  useSendNotification,
} from "@library/api";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  SharedPagination,
} from "@library/ui";
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

export default function AdminBooksPage() {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();

  const getConfirmText = (key: string, defaultEn: string, defaultZh: string) => {
    const resolved = t(key);
    if (resolved === key) {
      return i18n.language === "zh" ? defaultZh : defaultEn;
    }
    return resolved;
  };

  const [bookSearch, setBookSearch] = useState("");
  const [bookPage, setBookPage] = useState(1);
  const [bookPageSize, setBookPageSize] = useState(10);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setBookPage(1);
  }, [bookSearch]);

  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [bookDesc, setBookDesc] = useState("");
  const [bookStock, setBookStock] = useState(5);
  const [bookCategoryId, setBookCategoryId] = useState<number | "">("");

  // Check URL query parameters to open new book form
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setShowAddBook(true);
    }
  }, [searchParams]);

  const createBookMutation = useCreateBook();
  const sendNotificationMutation = useSendNotification();
  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();

  const { data: books, refetch: refetchBooks } = useBooks({ search: bookSearch });
  const { data: categories } = useCategories();

  const resetBookForm = () => {
    setShowAddBook(false);
    setEditingBookId(null);
    setBookTitle("");
    setBookAuthor("");
    setBookIsbn("");
    setBookDesc("");
    setBookStock(5);
    setBookCategoryId("");
  };

  const handleStartEditBook = (book: Book) => {
    setEditingBookId(book.id);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookIsbn(book.isbn || "");
    setBookDesc(book.description || "");
    setBookStock(book.stockTotal);
    setBookCategoryId(book.categoryId);
    setShowAddBook(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteBook = (id: number) => {
    deleteBookMutation.mutate(id, {
      onSuccess: () => {
        setFeedback({ type: "success", message: "Book removed from the active catalogue." });
        refetchBooks();
      },
      onError: (err: any) => {
        setFeedback({ type: "error", message: err.response?.data?.message || "Could not delete this book." });
      },
    });
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookCategoryId) {
      setFeedback({ type: "error", message: "Please select a category." });
      return;
    }

    const payload = {
      title: bookTitle,
      author: bookAuthor,
      isbn: bookIsbn || undefined,
      description: bookDesc || undefined,
      stockTotal: Number(bookStock),
      categoryId: Number(bookCategoryId),
    };

    if (editingBookId) {
      updateBookMutation.mutate(
        { id: editingBookId, payload },
        {
          onSuccess: () => {
            setFeedback({ type: "success", message: "Book details updated successfully." });
            resetBookForm();
            refetchBooks();
          },
          onError: (err: any) => {
            setFeedback({ type: "error", message: err.response?.data?.message || "Could not update book details." });
          },
        }
      );
    } else {
      createBookMutation.mutate(
        payload,
        {
          onSuccess: () => {
            setFeedback({ type: "success", message: "Book added to the catalogue." });
            
            // Dispatch system-wide notification of new book arrival
            sendNotificationMutation.mutate({
              title: i18n.language === "zh" ? "📚 新书速递！" : "📚 New Book Arrival!",
              message: i18n.language === "zh"
                ? `新书《${bookTitle}》（作者：${bookAuthor}）已入库，欢迎广大读者前往馆藏检索借阅！`
                : `New book "${bookTitle}" by ${bookAuthor} has arrived in the library! Explore the catalog and borrow it now.`,
              type: "INFO",
              broadcast: true,
              userId: undefined
            });

            resetBookForm();
            refetchBooks();
          },
          onError: (err: any) => {
            setFeedback({ type: "error", message: err.response?.data?.message || "Could not add this book." });
          },
        }
      );
    }
  };

  const filteredBooks = books?.filter((book: Book) => 
    book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
    (book.isbn && book.isbn.toLowerCase().includes(bookSearch.toLowerCase())) ||
    (book.category?.name && book.category.name.toLowerCase().includes(bookSearch.toLowerCase()))
  ) || [];
  
  const paginatedBooks = filteredBooks.slice((bookPage - 1) * bookPageSize, bookPage * bookPageSize);
  const totalBookPages = Math.ceil(filteredBooks.length / bookPageSize) || 1;

  return (
    <div className="space-y-6 text-left">
      {/* Header and trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-900">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">Catalog Inventory</h3>
          <p className="text-zinc-500 text-xs">Manage book items in the library catalog system.</p>
        </div>
        <button
          onClick={() => {
            if (showAddBook) {
              resetBookForm();
            } else {
              setShowAddBook(true);
            }
          }}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all font-bold text-xs rounded-xl self-start sm:self-center cursor-pointer border-none outline-none"
        >
          {showAddBook ? "Close Panel" : "Catalog New Book"}
        </button>
      </div>

      {feedback && (
        <div role={feedback.type === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
          {feedback.message}
        </div>
      )}

      {/* Add / Edit Book Form Panel */}
      {showAddBook && (
        <form onSubmit={handleSaveBook} className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-850 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white">
              {editingBookId ? `🛠️ Edit Book Specifications (ID: #${editingBookId})` : "📚 Catalog Book Properties"}
            </h4>
            {editingBookId && (
              <button
                type="button"
                onClick={resetBookForm}
                className="text-xs text-zinc-500 hover:text-white cursor-pointer bg-transparent border-none outline-none font-bold"
              >
                Cancel Editing
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Book Title</label>
              <input
                type="text"
                required
                placeholder="The Great Gatsby"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Author Name</label>
              <input
                type="text"
                required
                placeholder="F. Scott Fitzgerald"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">ISBN Number</label>
              <input
                type="text"
                placeholder="978-0743273565"
                value={bookIsbn}
                onChange={(e) => setBookIsbn(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Total Copies</label>
              <input
                type="number"
                min="1"
                required
                value={bookStock}
                onChange={(e) => setBookStock(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Category Classification</label>
              <select
                required
                value={bookCategoryId}
                onChange={(e) => setBookCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs outline-none text-zinc-400 focus:text-white transition-all cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Summary Description</label>
            <textarea
              rows={3}
              placeholder="Enter book summary..."
              value={bookDesc}
              onChange={(e) => setBookDesc(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white transition-all resize-none"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createBookMutation.isPending || updateBookMutation.isPending}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold rounded-xl text-xs cursor-pointer border-none outline-none"
            >
              {editingBookId ? "Save Specifications" : "Catalog Entry"}
            </button>
          </div>
        </form>
      )}

      {/* Sleek Search Bar */}
      <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-900 rounded-2xl px-4 py-3 flex items-center gap-3">
        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by title, author, ISBN or category..."
          value={bookSearch}
          onChange={(e) => setBookSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-550 w-full"
        />
        {bookSearch && (
          <button onClick={() => setBookSearch("")} className="text-zinc-500 hover:text-white transition-colors text-xs font-bold px-1 cursor-pointer bg-transparent border-none">
            Clear
          </button>
        )}
      </div>

      {/* Book List table */}
      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-zinc-900/50 border-b border-zinc-850 text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Title & Author</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">ISBN</th>
                <th className="px-6 py-4 text-center">Stock (Avail/Total)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40">
              {paginatedBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic bg-zinc-900/10">
                    No matching catalog entries found in the catalog system.
                  </td>
                </tr>
              ) : (
                paginatedBooks.map((book: Book) => (
                  <tr key={book.id} className="hover:bg-zinc-900/10 transition-all">
                    <td className="px-6 py-4 text-left">
                      <div className="font-extrabold text-white">{book.title}</div>
                      <div className="text-zinc-500">{book.author}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-left">{book.category?.name || "N/A"}</td>
                    <td className="px-6 py-4 font-mono text-zinc-500 text-left">{book.isbn || "N/A"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        book.stockAvailable > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {book.stockAvailable} / {book.stockTotal}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleStartEditBook(book)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all rounded-lg font-bold cursor-pointer border-none outline-none"
                      >
                        Edit
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all rounded-lg font-bold cursor-pointer border-none outline-none"
                          >
                            Delete
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="text-left">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {getConfirmText("confirm.deleteBookTitle", "Remove Book", "删除图书")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {getConfirmText(
                                "confirm.deleteBookDescription",
                                "Are you sure you want to permanently remove this book from the catalog? This action cannot be undone.",
                                "您确定要从馆藏中永久移除此图书吗？该操作无法撤销。"
                              )} <br />
                              <span className="text-zinc-300 font-extrabold mt-1 block">Title: {book.title}</span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {getConfirmText("confirm.cancel", "Cancel", "取消")}
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBook(book.id)} className="bg-red-600 hover:bg-red-700 text-white!">
                              {getConfirmText("confirm.deleteBookAction", "Remove Book", "移除图书")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Custom pagination footer */}
        <SharedPagination
          page={bookPage}
          setPage={setBookPage}
          pageSize={bookPageSize}
          setPageSize={setBookPageSize}
          totalItems={filteredBooks.length}
          totalPages={totalBookPages}
        />
      </div>
    </div>
  );
}
