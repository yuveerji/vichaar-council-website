"use client";

import { useState } from "react";
import { ShieldCheck, UserPlus, Trash2, CheckCircle2, User, Mail, ShieldAlert } from "lucide-react";

interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
}

interface ParticipantAdminRecord {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

interface AdminWhitelistManagerProps {
  initialWhitelist: string[];
  initialAdminUsers: AdminUserRecord[];
  initialParticipantAdmins: ParticipantAdminRecord[];
}

export default function AdminWhitelistManager({
  initialWhitelist,
  initialAdminUsers,
  initialParticipantAdmins
}: AdminWhitelistManagerProps) {
  const [whitelist, setWhitelist] = useState<string[]>(initialWhitelist);
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>(initialAdminUsers);
  const [participantAdmins, setParticipantAdmins] = useState<ParticipantAdminRecord[]>(initialParticipantAdmins);
  const [newIdentifier, setNewIdentifier] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdentifier.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: newIdentifier.trim(), role })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add admin.");

      // Refresh list
      const clean = newIdentifier.trim().toLowerCase().replace(/^@+/, "");
      if (!whitelist.includes(clean)) {
        setWhitelist([...whitelist, clean]);
      }

      setNewIdentifier("");
      setFeedback({ type: "success", message: data.message || `Authorized ${clean} as admin.` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to add admin." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (identifier: string) => {
    if (!confirm(`Are you sure you want to revoke admin clearance for "${identifier}"?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove admin.");

      setWhitelist(whitelist.filter((item) => item !== identifier));
      setFeedback({ type: "success", message: `Removed ${identifier} from admin list.` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to remove admin." });
    }
  };

  return (
    <div className="border border-navy-border bg-navy p-6 rounded-sm space-y-6">
      <div className="border-b border-navy-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-citrus" />
            <h3 className="font-editorial text-xl font-bold text-warmwhite">
              Authorized Administrator Access List
            </h3>
          </div>
          <p className="text-xs text-mutedgrey mt-1">
            Accounts, emails, and usernames granted clearance to view and manage <code>/admin</code>.
            Anyone not on this list will receive a <strong>404 Not Found</strong> page.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xs text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
              : "bg-red-950/80 text-red-300 border border-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Add Admin Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            required
            value={newIdentifier}
            onChange={(e) => setNewIdentifier(e.target.value)}
            placeholder="Enter admin email (e.g. member@vichaar.in) or username (@chhatwani)"
            className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs placeholder:text-mutedgrey/50"
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
        >
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          <option value="SECRETARIAT">SECRETARIAT</option>
        </select>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-citrus hover:bg-citrus-hover text-[#070E1A] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors disabled:opacity-50 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isSubmitting ? "Granting..." : "Add Admin"}</span>
        </button>
      </form>

      {/* Current Whitelisted Identifiers List */}
      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-bold text-mutedgrey mb-2">
          Authorized Accounts ({whitelist.length})
        </div>

        <div className="grid gap-2">
          {whitelist.map((id) => {
            const isEmail = id.includes("@");
            const matchingAdmin = adminUsers.find((a) => a.email.toLowerCase() === id);
            const matchingParticipant = participantAdmins.find(
              (p) => p.email.toLowerCase() === id || p.username.toLowerCase() === id
            );

            return (
              <div
                key={id}
                className="flex items-center justify-between p-3 bg-navy-deep border border-white/5 rounded-xs hover:border-white/15 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-navy-surface border border-white/10 flex items-center justify-center text-citrus text-xs shrink-0">
                    {isEmail ? <Mail className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white font-bold">
                        {isEmail ? id : `@${id}`}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-citrus/20 text-citrus border border-citrus/30">
                        {matchingAdmin?.role || matchingParticipant?.role || "ADMIN"}
                      </span>
                    </div>

                    <div className="text-[10px] text-mutedgrey mt-0.5">
                      {matchingAdmin?.name || matchingParticipant?.fullName ? (
                        <span>Linked to {matchingAdmin?.name || matchingParticipant?.fullName}</span>
                      ) : (
                        <span>Whitelisted Access Credential</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  title={`Revoke access for ${id}`}
                  className="p-1.5 text-mutedgrey hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
