"use client";

import { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
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
} from "@library/ui";
import { useTranslation } from "react-i18next";

export default function AdminCategoriesPage() {
  const { t, i18n } = useTranslation();

  const getConfirmText = (key: string, defaultEn: string, defaultZh: string) => {
    const resolved = t(key);
    if (resolved === key) {
      return i18n.language === "zh" ? defaultZh : defaultEn;
    }
    return resolved;
  };

  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  const { data: categories, refetch: refetchCategories } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate(
      { name: catName, description: catDesc || undefined },
      {
        onSuccess: () => {
          alert("Category registered!");
          setCatName("");
          setCatDesc("");
          refetchCategories();
        },
        onError: (err: any) => {
          alert(err.response?.data?.message || "Error adding category");
        },
      }
    );
  };

  const handleDeleteCategory = (id: number) => {
    deleteCategoryMutation.mutate(id, {
      onSuccess: () => {
        alert("Category deleted successfully.");
        refetchCategories();
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Cannot delete category containing books.");
      },
    });
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-xl font-extrabold text-white tracking-tight">Book Categories</h3>
        <p className="text-zinc-500 text-xs">Manage book classification genres in the library catalog.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="md:col-span-2 p-6 rounded-3xl bg-zinc-900/30 border border-zinc-850 space-y-4 self-start">
          <h4 className="font-bold text-sm text-white">Create New Category</h4>
          <div>
            <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Category Name</label>
            <input
              type="text"
              required
              placeholder="Science Fiction"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Futuristic and fantasy literature..."
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold rounded-xl text-xs cursor-pointer border-none outline-none"
          >
            Add Category
          </button>
        </form>

        {/* Categories Table List */}
        <div className="md:col-span-3 bg-zinc-900/20 border border-zinc-900 rounded-3xl overflow-hidden self-start">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[400px]">
              <thead className="bg-zinc-900/50 border-b border-zinc-850 text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name & Description</th>
                  <th className="px-6 py-4 text-center">Books</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40">
                {categories?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 italic bg-zinc-900/10">
                      No categories registered yet.
                    </td>
                  </tr>
                ) : (
                  categories?.map((cat) => (
                    <tr key={cat.id} className="hover:bg-zinc-900/10 transition-all">
                      <td className="px-6 py-4 text-left">
                        <div className="font-extrabold text-white">{cat.name}</div>
                        <div className="text-zinc-500 text-[11px] mt-0.5">{cat.description || "No description"}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-zinc-400">{cat._count?.books || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg font-bold cursor-pointer border-none outline-none"
                            >
                              Delete
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="text-left">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {getConfirmText("confirm.deleteCategoryTitle", "Remove Category", "删除图书分类")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {getConfirmText(
                                  "confirm.deleteCategoryDescription",
                                  "Are you sure you want to permanently remove this book category? This action cannot be undone.",
                                  "您确定要永久移除此图书分类吗？该操作无法撤销。"
                                )} <br />
                                <span className="text-zinc-300 font-extrabold mt-1 block">Category: {cat.name}</span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {getConfirmText("confirm.cancel", "Cancel", "取消")}
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)} className="bg-red-600 hover:bg-red-700 text-white!">
                                {getConfirmText("confirm.deleteCategoryAction", "Remove Category", "移除分类")}
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
        </div>
      </div>
    </div>
  );
}
