"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  useRules,
  useCreateRule,
  useUpdateRule,
  useDeleteRule,
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
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@library/ui";
import { useTranslation } from "react-i18next";

export default function AdminRulesPage() {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();

  const getConfirmText = (key: string, defaultEn: string, defaultZh: string) => {
    const resolved = t(key);
    if (resolved === key) {
      return i18n.language === "zh" ? defaultZh : defaultEn;
    }
    return resolved;
  };

  const [showAddRule, setShowAddRule] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleContent, setRuleContent] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { data: dbRules, refetch: refetchRules } = useRules();
  const createRuleMutation = useCreateRule();
  const updateRuleMutation = useUpdateRule();
  const deleteRuleMutation = useDeleteRule();

  // Check URL query parameters to open new regulation form
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setShowAddRule(true);
    }
  }, [searchParams]);

  const resetRuleForm = () => {
    setShowAddRule(false);
    setEditingRuleId(null);
    setRuleTitle("");
    setRuleContent("");
  };

  const handleStartEditRule = (rule: any) => {
    setEditingRuleId(rule.id);
    setRuleTitle(rule.title);
    setRuleContent(rule.content);
    setShowAddRule(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRule = (id: number) => {
    deleteRuleMutation.mutate(id, {
      onSuccess: () => {
        setFeedback({ type: "success", message: "Regulation deleted." });
        refetchRules();
      },
      onError: (err: any) => {
        setFeedback({ type: "error", message: err.response?.data?.message || "Could not delete regulation." });
      },
    });
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRuleId) {
      updateRuleMutation.mutate(
        {
          id: editingRuleId,
          payload: { title: ruleTitle.trim(), content: ruleContent.trim() },
        },
        {
          onSuccess: () => {
            setFeedback({ type: "success", message: "Regulation updated successfully." });
            resetRuleForm();
            refetchRules();
          },
          onError: (err: any) => {
            setFeedback({ type: "error", message: err.response?.data?.message || "Could not update regulation." });
          },
        }
      );
    } else {
      createRuleMutation.mutate(
        { title: ruleTitle.trim(), content: ruleContent.trim() },
        {
          onSuccess: () => {
            setFeedback({ type: "success", message: "Regulation created successfully." });
            resetRuleForm();
            refetchRules();
          },
          onError: (err: any) => {
            setFeedback({ type: "error", message: err.response?.data?.message || "Could not create regulation." });
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header and trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-900">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">Library Regulations</h3>
          <p className="text-zinc-555 text-xs">Manage active policy guidelines and FAQ drawers displayed to Reader users.</p>
        </div>
        <button
          onClick={() => {
            if (showAddRule) {
              resetRuleForm();
            } else {
              setShowAddRule(true);
            }
          }}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all font-bold text-xs rounded-xl self-start sm:self-center cursor-pointer border-none outline-none"
        >
          {showAddRule ? "Close Panel" : "Create Regulation"}
        </button>
      </div>

      {feedback && <div role={feedback.type === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>{feedback.message}</div>}

      {/* Add / Edit Rule Form Panel */}
      {showAddRule && (
        <form onSubmit={handleSaveRule} className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white">
              {editingRuleId ? `🛠️ Edit Regulation Specs (ID: #${editingRuleId})` : "📜 Register New Regulation"}
            </h4>
            {editingRuleId && (
              <button
                type="button"
                onClick={resetRuleForm}
                className="text-xs text-zinc-500 hover:text-white cursor-pointer bg-transparent border-none outline-none font-bold"
              >
                Cancel Editing
              </button>
            )}
          </div>
          
          <div>
            <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Regulation / FAQ Title</label>
            <input
              type="text"
              required
              placeholder="e.g., 📚 Borrowing Limit"
              value={ruleTitle}
              onChange={(e) => setRuleTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Regulation Content Details</label>
            <textarea
              rows={4}
              required
              placeholder="Enter detailed regulation guidelines..."
              value={ruleContent}
              onChange={(e) => setRuleContent(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white transition-all resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createRuleMutation.isPending || updateRuleMutation.isPending}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold rounded-xl text-xs cursor-pointer border-none outline-none"
            >
              {editingRuleId ? "Save Regulation Specs" : "Register Regulation"}
            </button>
          </div>
        </form>
      )}

      {/* Rules List Table */}
      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-4 uppercase text-[9px] tracking-wider text-left">Title & Details</TableHead>
              <TableHead className="px-6 py-4 uppercase text-[9px] tracking-wider text-left">Last Updated</TableHead>
              <TableHead className="px-6 py-4 uppercase text-[9px] tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!dbRules || dbRules.length === 0) ? (
              <TableRow>
                <TableCell colSpan={3} className="px-6 py-12 text-center text-zinc-500 italic bg-zinc-900/10">
                  No custom database regulations configured. The Reader Portal is using premium default mock rules.
                </TableCell>
              </TableRow>
            ) : (
              dbRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="px-6 py-4 max-w-md text-left">
                    <div className="font-extrabold text-white text-sm">{rule.title}</div>
                    <div className="text-zinc-500 text-xs mt-1 leading-relaxed whitespace-pre-wrap">{rule.content}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-zinc-400 text-left">
                    {new Date(rule.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleStartEditRule(rule)}
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
                            {getConfirmText("confirm.deleteRuleTitle", "Delete Regulation", "删除规章制度")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {getConfirmText(
                              "confirm.deleteRuleDescription",
                              "Are you sure you want to permanently delete this regulation rule? This action cannot be undone.",
                              "您确定要永久删除此规章制度吗？该操作无法撤销。"
                            )} <br />
                            <span className="text-zinc-300 font-extrabold mt-1 block">Rule: {rule.title}</span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {getConfirmText("confirm.cancel", "Cancel", "取消")}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteRule(rule.id)} className="bg-red-600 hover:bg-red-700 text-white!">
                            {getConfirmText("confirm.deleteRuleAction", "Delete", "删除")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
