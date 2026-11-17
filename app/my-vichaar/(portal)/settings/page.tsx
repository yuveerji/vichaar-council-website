"use client";

import { useState } from "react";
import { Lock, ShieldCheck, KeyRound, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ParticipantSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword.length < 8) {
      setStatusMessage({ type: "error", text: "New password must be at least 8 characters in length." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/my-vichaar/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      const json = await res.json();
      if (res.ok) {
        setStatusMessage({ type: "success", text: "Your password was updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setStatusMessage({ type: "error", text: json.error || "Failed to update password." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network error occurred. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <span className="text-[11px] uppercase tracking-[0.2em] text-citrus font-semibold">
          SECURITY & PREFERENCES
        </span>
        <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-wide mt-1">
          Account Settings
        </h1>
        <p className="text-xs text-warmwhite/60 mt-1">
          Manage your participant credentials, security passphrase, and privacy preferences.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/70 border-red-500/40 text-red-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Password Change Card */}
      <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
          <div className="h-9 w-9 rounded-xl bg-citrus/10 flex items-center justify-center text-citrus">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Change Password</h2>
            <p className="text-xs text-warmwhite/60">Update your passphrase to maintain high account security.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-warmwhite/70 font-medium mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3.5 py-2.5 bg-[#080E1A] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-citrus"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-warmwhite/70 font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3.5 py-2.5 bg-[#080E1A] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-citrus"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-warmwhite/70 font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3.5 py-2.5 bg-[#080E1A] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-citrus"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-3 px-6 rounded-xl bg-citrus hover:bg-[#FFA62B]/90 text-[#070E1A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Model Clarification Notice */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-warmwhite/60 space-y-2">
        <div className="text-white font-semibold uppercase tracking-wider">
          One Account. One Dashboard. Every Participation.
        </div>
        <p className="leading-relaxed">
          MY VICHAAR is free of charge for all delegates and scholars. There are no paid membership tiers, recurring subscription charges, or renewal penalties.
        </p>
      </div>
    </div>
  );
}
