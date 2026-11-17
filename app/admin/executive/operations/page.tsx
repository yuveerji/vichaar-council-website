import { notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import prisma from "@/lib/db";
import { Activity, Clock, Users, MapPin, Radio, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LiveOperationsPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) notFound();

  const [activeSessions, totalDelegates, upcomingEvents] = await Promise.all([
    prisma.participantSession.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.participantUser.count(),
    prisma.event.findMany({ where: { startDate: { gte: new Date() } } })
  ]);

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-citrus bg-citrus/20 px-2 py-0.5 rounded border border-citrus/30">
              01 — EXECUTIVE
            </span>
            <span className="text-xs text-warmwhite/50 font-mono">REAL-TIME COMMAND</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
            Live Operations Control
          </h1>
          <p className="text-xs text-warmwhite/70 mt-1">
            Real-time delegate access, assembly check-ins, and active portal sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6">
            <span className="text-[10px] font-mono uppercase text-warmwhite/40 block">ACTIVE PORTAL SESSIONS</span>
            <span className="font-editorial text-3xl font-bold text-emerald-400 block mt-2">{activeSessions}</span>
            <span className="text-[10px] font-mono text-warmwhite/50 block mt-1">Authenticated delegates</span>
          </div>
          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6">
            <span className="text-[10px] font-mono uppercase text-warmwhite/40 block">REGISTERED DELEGATES</span>
            <span className="font-editorial text-3xl font-bold text-citrus block mt-2">{totalDelegates}</span>
            <span className="text-[10px] font-mono text-warmwhite/50 block mt-1">Platform-wide profiles</span>
          </div>
          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6">
            <span className="text-[10px] font-mono uppercase text-warmwhite/40 block">UPCOMING ASSEMBLIES</span>
            <span className="font-editorial text-3xl font-bold text-white block mt-2">{upcomingEvents.length}</span>
            <span className="text-[10px] font-mono text-warmwhite/50 block mt-1">Active event dockets</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B1526] border border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-white font-editorial tracking-wider">
            UPCOMING FLAGSHIP ASSEMBLY: SHABD & SOCH 2026
          </h3>
          <p className="text-xs text-warmwhite/70 leading-relaxed font-sans">
            Scheduled for 20 December 2026 in Udaipur. Venue accreditation protocol is armed. Digital pass verification scanners will activate at 08:30 AM IST on assembly day.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
