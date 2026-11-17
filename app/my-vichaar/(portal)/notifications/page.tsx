"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, CheckCircle2, Clock, Info, ShieldCheck, Loader2 } from "lucide-react";

export default function ParticipantNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/my-vichaar/notifications");
      const json = await res.json();
      if (res.ok) {
        setNotifications(json.notifications || []);
      }
    } catch (e) {
      console.error("Error loading notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/my-vichaar/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true })
      });
      loadNotifications();
    } catch {
      //
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-citrus" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-citrus font-semibold">
            COMMUNICATIONS & ALERTS
          </span>
          <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-wide mt-1">
            Notification Center
          </h1>
          <p className="text-xs text-warmwhite/60 mt-1">
            Institutional dispatches, admissions alerts, and credential updates.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-warmwhite transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5 text-citrus" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-colors flex items-start gap-4 ${
                item.isRead
                  ? "bg-[#080F1D] border-white/5 text-warmwhite/70"
                  : "bg-[#0B172A] border-citrus/30 text-white shadow-lg shadow-black/20"
              }`}
            >
              <div className="h-9 w-9 rounded-xl bg-citrus/10 border border-citrus/20 flex items-center justify-center text-citrus shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-warmwhite/50 shrink-0">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short"
                    })}
                  </span>
                </div>

                <p className="text-xs text-warmwhite/70 mt-1 leading-relaxed">
                  {item.message}
                </p>

                {item.link && (
                  <div className="mt-2.5">
                    <Link
                      href={item.link}
                      className="text-xs font-semibold text-citrus hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-12 text-center space-y-4">
          <Bell className="w-12 h-12 text-warmwhite/30 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Notifications</h3>
          <p className="text-xs text-warmwhite/60 max-w-sm mx-auto">
            You are all caught up! Important admissions notices and editorial feedback will be displayed here.
          </p>
        </div>
      )}
    </div>
  );
}
