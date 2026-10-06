"use client";

import { useState } from "react";
import {
  useUsers,
  useSendNotification,
} from "@library/api";
import { Megaphone, Send } from "lucide-react";

export default function AdminDispatchPage() {
  const [notifBroadcast, setNotifBroadcast] = useState(true);
  const [notifTargetUserId, setNotifTargetUserId] = useState<string>("");
  const [notifType, setNotifType] = useState("INFO");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifSendSuccess, setNotifSendSuccess] = useState("");
  const [notifSendError, setNotifSendError] = useState("");

  const { data: users } = useUsers();
  const sendNotificationMutation = useSendNotification();

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSendSuccess("");
    setNotifSendError("");

    const payload = {
      title: notifTitle,
      message: notifMessage,
      type: notifType,
      isBroadcast: notifBroadcast,
      userId: notifBroadcast ? undefined : String(notifTargetUserId),
    };

    sendNotificationMutation.mutate(payload, {
      onSuccess: () => {
        setNotifSendSuccess("Notification announcement dispatched successfully!");
        setNotifTitle("");
        setNotifMessage("");
        setNotifTargetUserId("");
        setNotifBroadcast(true);
        setTimeout(() => setNotifSendSuccess(""), 4000);
      },
      onError: (err: unknown) => {
        const errResponse = err as { response?: { data?: { message?: string } } };
        setNotifSendError(errResponse.response?.data?.message || "Failed to dispatch notification.");
      },
    });
  };

  return (
    <div className="space-y-6 bg-zinc-900/20 border border-zinc-900 p-8 rounded-3xl animate-fadeIn text-left max-w-3xl mx-auto">
      <div>
        <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-red-500" /> Broadcast Center
        </h3>
        <p className="text-zinc-500 text-xs mt-0.5 font-medium">Deliver customized notification alerts or global system-wide updates to readers.</p>
      </div>

      {notifSendSuccess && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-xl text-center">
          ✨ {notifSendSuccess}
        </div>
      )}

      {notifSendError && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-center">
          ⚠️ {notifSendError}
        </div>
      )}

      <form onSubmit={handleSendNotification} className="space-y-5">
        <div className="flex items-center justify-between p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Global Announcement</span>
            <span className="text-[10px] text-zinc-500">Deliver this notification to all library system users simultaneously</span>
          </div>
          <input
            type="checkbox"
            checked={notifBroadcast}
            onChange={(e) => setNotifBroadcast(e.target.checked)}
            className="w-4.5 h-4.5 rounded border-zinc-800 bg-zinc-950 text-red-600 focus:ring-red-500 focus:ring-offset-zinc-900 cursor-pointer"
          />
        </div>

        {!notifBroadcast && (
          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase mb-1.5">Target Reader Recipient</label>
            <div className="relative">
              <select
                required
                value={notifTargetUserId}
                onChange={(e) => setNotifTargetUserId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Choose target system user --</option>
                {users && users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName || ''} ({u.email})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                ▼
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase mb-1.5">Priority Classification</label>
            <div className="relative">
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all appearance-none cursor-pointer"
              >
                <option value="INFO">INFO (Normal Alert)</option>
                <option value="ALERT">ALERT (Important Notice)</option>
                <option value="SYSTEM">SYSTEM (Maintenance/Updates)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                ▼
              </div>
            </div>
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase mb-1.5">Dynamic Icon Banner</label>
            <div className="w-full bg-zinc-950/40 border border-zinc-900 text-zinc-350 rounded-xl px-4 py-3 text-sm font-semibold select-none flex items-center gap-2">
              {notifType === "INFO" && <span>💡 Blue Bulb</span>}
              {notifType === "ALERT" && <span>⚠️ Yellow Alert</span>}
              {notifType === "SYSTEM" && <span>🔧 Red System</span>}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 text-xs font-bold uppercase mb-1.5">Broadcast Header / Title</label>
          <input
            type="text"
            required
            placeholder="e.g., Scheduled Maintenance Downtime"
            value={notifTitle}
            onChange={(e) => setNotifTitle(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all"
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-xs font-bold uppercase mb-1.5">Broadcast Message Body</label>
          <textarea
            rows={4}
            required
            placeholder="Provide clear details regarding the system update, return notification or warning..."
            value={notifMessage}
            onChange={(e) => setNotifMessage(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-3 text-xs outline-none text-white transition-all resize-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={sendNotificationMutation.isPending}
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold rounded-xl text-sm shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 cursor-pointer border-none outline-none"
        >
          <Send className="w-4.5 h-4.5" />
          {sendNotificationMutation.isPending ? "Broadcasting message..." : "Dispatch Broadcast Announcement"}
        </button>
      </form>
    </div>
  );
}
