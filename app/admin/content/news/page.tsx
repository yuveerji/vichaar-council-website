import { notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";
import { Shield, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function contentnewsPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) notFound();

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-citrus bg-citrus/20 px-2 py-0.5 rounded border border-citrus/30">
                03 — CONTENT & CMS
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">ENTERPRISE CONTROL</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
              News & Official Articles
            </h1>
            <p className="text-xs text-warmwhite/70 mt-1">
              Publish thought leadership articles, debate debriefs, and press communiqués.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>MODULE ARMED</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-citrus/10 text-citrus border border-citrus/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-editorial tracking-wide">
                News & Official Articles · Active Control Plane
              </h3>
              <p className="text-xs text-warmwhite/60 font-mono mt-0.5">
                Managed under VICHAAR.FOUNDERS Root Access
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-warmwhite/70 leading-relaxed font-sans max-w-3xl">
            This module is seamlessly integrated into the unified Founder Command Centre. Real-time updates, policy configurations, and administrative actions executed here directly reflect across The Vichaar Council institutional platform.
          </p>

          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-citrus hover:bg-citrus/90 text-navy text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Back to Overview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/system/health"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-warmwhite font-mono uppercase tracking-wider transition-colors"
            >
              System Pulse
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
