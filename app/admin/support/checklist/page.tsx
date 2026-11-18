import { notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Activity, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function supportchecklistPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) notFound();

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                10 — SUPPORT & OPERATIONS
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">OPERATIONAL INTERFACE</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
              Operational Checklist
            </h1>
            <p className="text-xs text-warmwhite/70 mt-1">
              Pre-event readiness verification, venue equipment checklist, and coordinator briefing.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-mono self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span>OPERATIONAL ACCESS</span>
          </div>
        </div>

        {/* Operational Workspace Card */}
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white font-editorial tracking-wide">
                Operational Checklist · Department Workspace
              </h3>
              <p className="text-xs text-warmwhite/60 font-mono mt-0.5">
                Department: {currentAdmin.department || "General Operations"}
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Module Synchronized</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-warmwhite/70 leading-relaxed font-sans max-w-3xl">
            This module provides authorized Council administrators with direct operational capabilities to manage records, process incoming submissions, and execute departmental duties without accessing underlying server configurations.
          </p>

          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-citrus hover:bg-citrus/90 text-navy text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/registrations"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-warmwhite font-mono uppercase tracking-wider transition-colors"
            >
              Registrations Ledger
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
