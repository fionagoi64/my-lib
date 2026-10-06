"use client";

import {
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
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
  Tabs,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input
} from "@library/ui";
import { BookOpen, Check, Clock, Scale, Info, Trash2, Bell, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function AdminInboxPage() {
  const { t, i18n } = useTranslation();

  const { data: notifications } = useMyNotifications();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const unreadNotifications = notifications?.filter((n) => !n.isRead) || [];
  const unreadCount = unreadNotifications.length;

  const filteredNotifications = notifications?.filter((n) => {
    const matchesStatus = statusFilter === "ALL" || 
                          (statusFilter === "UNREAD" && !n.isRead) || 
                          (statusFilter === "READ" && n.isRead);
    const matchesType = typeFilter === "ALL" || n.type === typeFilter;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  }) || [];

  const getConfirmText = (key: string, defaultEn: string, defaultZh: string) => {
    const resolved = t(key);
    if (resolved === key) {
      return i18n.language === "zh" ? defaultZh : defaultEn;
    }
    return resolved;
  };

  return (
    <div className="space-y-6 bg-zinc-900/20 border border-zinc-900 p-8 rounded-3xl animate-fadeIn text-left">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-500 animate-pulse" /> Notification Inbox
          </h3>
          <p className="text-zinc-555 text-xs mt-0.5 font-medium">
            Read and review real-time alerts on reader loans, check-ins, and policy system updates.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead.mutate()}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer outline-none"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Modern Notification Filter Controls Panel */}
      {notifications && notifications.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full bg-zinc-950/20 p-4 rounded-2xl border border-zinc-900">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Status Switcher Tabs */}
            <Tabs
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as any)}
              className="w-auto"
            >
              <TabsList className="bg-zinc-950 border border-zinc-900 p-1 rounded-xl">
                <TabsTrigger value="ALL" className="text-xs px-4 py-1.5 rounded-lg cursor-pointer data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400">
                  {getConfirmText("notifications.statusAll", "All", "全部")}
                </TabsTrigger>
                <TabsTrigger value="UNREAD" className="text-xs px-4 py-1.5 rounded-lg cursor-pointer data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400">
                  {getConfirmText("notifications.statusUnread", "Unread", "未读")}
                  {unreadCount > 0 && (
                    <span className="ml-1.5 bg-red-500 text-zinc-950 font-bold px-1.5 py-0.5 rounded-full text-[9px]">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="READ" className="text-xs px-4 py-1.5 rounded-lg cursor-pointer data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400">
                  {getConfirmText("notifications.statusRead", "Read", "已读")}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Notification Type Selector */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-555 text-[10px] uppercase font-extrabold tracking-wider hidden md:inline">
                {getConfirmText("notifications.typeLabel", "Type:", "类型:")}
              </span>
              <Select
                value={typeFilter}
                onValueChange={(val) => setTypeFilter(val)}
              >
                <SelectTrigger className="bg-zinc-950 border border-zinc-900 text-xs text-zinc-350 px-4 py-2.5 rounded-xl outline-none cursor-pointer hover:border-zinc-800 transition-colors h-10 w-[140px]">
                  <SelectValue placeholder={getConfirmText("notifications.typeAll", "All Types", "全部类型")} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border border-zinc-800 text-zinc-350">
                  <SelectItem className="cursor-pointer" value="ALL">
                    {getConfirmText("notifications.typeAll", "All Types", "全部类型")}
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="BORROW">
                    {getConfirmText("notifications.typeBorrow", "Borrowing", "借阅记录")}
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="RETURN">
                    {getConfirmText("notifications.typeReturn", "Returns", "还书记录")}
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="EXTENSION">
                    {getConfirmText("notifications.typeExtension", "Extensions", "图书续借")}
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="RULE_UPDATE">
                    {getConfirmText("notifications.typeRules", "Rules/System", "规则更新")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search bar inside the inbox filter */}
          <div className="w-full lg:max-w-xs bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <Input
              type="text"
              placeholder={getConfirmText("notifications.searchPlaceholder", "Search notices...", "搜索通知...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-650 w-full focus:ring-0 focus:border-transparent h-5 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-zinc-500 hover:text-white transition-colors text-xs font-bold px-1 cursor-pointer bg-transparent border-none"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex gap-4 items-start ${
                n.isRead
                  ? 'bg-zinc-900/10 border-zinc-900/50 text-zinc-400'
                  : 'bg-red-500/5 border-red-500/10 text-white shadow-md'
              }`}
            >
              <div className={`p-3 rounded-xl ${
                n.type === 'BORROW' ? 'bg-indigo-500/10 text-indigo-400' :
                n.type === 'RETURN' ? 'bg-green-500/10 text-green-400' :
                n.type === 'EXTENSION' ? 'bg-amber-500/10 text-amber-400' :
                n.type === 'RULE_UPDATE' ? 'bg-purple-500/10 text-purple-400' :
                'bg-red-500/10 text-red-400'
              }`}>
                {n.type === 'BORROW' && <BookOpen className="w-5 h-5" />}
                {n.type === 'RETURN' && <Check className="w-5 h-5" />}
                {n.type === 'EXTENSION' && <Clock className="w-5 h-5" />}
                {n.type === 'RULE_UPDATE' && <Scale className="w-5 h-5" />}
                {!['BORROW', 'RETURN', 'EXTENSION', 'RULE_UPDATE'].includes(n.type) && <Info className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm tracking-tight text-white">{n.title}</h4>
                  <span className="text-[10px] text-zinc-555 font-semibold bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                    {n.type}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{n.message}</p>
                <span className="text-[10px] text-zinc-650 block pt-1">
                  {new Date(n.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!n.isRead && (
                  <button
                    onClick={() => markNotificationRead.mutate(n.id)}
                    className="p-2 bg-zinc-900/50 hover:bg-zinc-900 text-red-400 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all cursor-pointer outline-none"
                    title="Mark as Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="p-2 bg-zinc-900/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-500/20 rounded-xl transition-all cursor-pointer outline-none"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="text-left">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {getConfirmText("confirm.deleteNotificationTitle", "Delete Notification", "删除通知")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {getConfirmText(
                          "confirm.deleteNotificationDescription",
                          "Are you sure you want to delete this notification? This action cannot be undone.",
                          "您确定要删除此条通知吗？此操作无法撤销。"
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {getConfirmText("confirm.cancel", "Cancel", "取消")}
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteNotification.mutate(n.id)} className="bg-red-600 hover:bg-red-700 text-white!">
                        {getConfirmText("confirm.deleteNotificationAction", "Delete", "删除")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-650">
              <Bell className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">
                {notifications && notifications.length > 0
                  ? getConfirmText("notifications.noMatching", "No matching notifications", "未找到符合条件的通知")
                  : "All caught up!"}
              </h4>
              <p className="text-zinc-550 text-xs max-w-sm mx-auto">
                {notifications && notifications.length > 0
                  ? getConfirmText("notifications.tryAdjusting", "Try adjusting your filters or search terms.", "请尝试调整您的筛选条件或搜索关键词。")
                  : "Your administrator operations alert feed is completely quiet."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
