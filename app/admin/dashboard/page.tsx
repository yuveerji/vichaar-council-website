import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Calendar,
  ClipboardList,
  CreditCard,
  Mail,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Users,
  Crown,
  FileText,
  Activity,
  Download,
  Send,
  MessageSquare,
  ShieldCheck
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) {
    notFound();
  }

  // Fetch operational metrics
  const [
    eventsCount,
    registrationsCount,
    pendingRegistrationsCount,
    paidRegistrationsCount,
    successfulPayments,
    recentRegistrations,
    recentEnquiries,
    pendingPublicationsCount,
    totalDelegatesCount
  ] = await Promise.all([
    prisma.event.count(),
    prisma.registration.count(),
    prisma.registration.count({ where: { paymentStatus: { not: "SUCCESS" } } }),
    prisma.registration.count({ where: { paymentStatus: "SUCCESS" } }),
    prisma.paymentOrder.findMany({ where: { status: "SUCCESS" }, select: { amount: true } }),
    prisma.registration.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { event: true, ticketCategory: true }
    }),
    prisma.contactEnquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" }
    }),
    prisma.publication.count({ where: { status: "DRAFT" } }),
    prisma.participantUser.count()
  ]);

  const grossCollections = successfulPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const unreadEnquiriesCount = recentEnquiries.filter((e) => e.status === "NEW").length;
  const totalWorkQueueItems = pendingRegistrationsCount + unreadEnquiriesCount + pendingPublicationsCount;

  const isFounder = currentAdmin.role === "FOUNDER" || currentAdmin.role === "ROOT";

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        {/* Founder Elevation Banner (if Founder) */}
        {isFounder && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Crown className="w-4 h-4 text-citrus shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-200">Founder Root Authority Active:</span>{" "}
                <span className="text-warmwhite/80">
                  You are currently operating in the day-to-day administration interface (VICHAAR.ADMIN).
                </span>
              </div>
            </div>
            <Link
              href="/founders"
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-navy font-bold text-xs uppercase tracking-wider font-mono shrink-0 hover:bg-amber-300 transition-colors flex items-center gap-1.5"
            >
              <span>Open VICHAAR.FOUNDERS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Operational Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                VICHAAR.ADMIN · OPERATIONAL COCKPIT
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">
                DEPT: {currentAdmin.department || "GENERAL OPERATIONS"}
              </span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
              Operational Administration Centre
            </h1>
            <p className="text-xs text-warmwhite/70 mt-1">
              Manage day-to-day operations, assemblies, delegate passes, content publishing, and participant communications.
            </p>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/events/new"
              className="px-4 py-2.5 rounded-xl bg-citrus hover:bg-citrus/90 text-navy text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md"
            >
              + Create Assembly
            </Link>
            <Link
              href="/admin/communications/email"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-warmwhite font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3 h-3 text-citrus" />
              <span>Broadcast Email</span>
            </Link>
            <Link
              href="/admin/registrations"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-warmwhite font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3 h-3 text-citrus" />
              <span>Export Ledger</span>
            </Link>
          </div>
        </div>

        {/* Capability 1: Unified Work Queue Card */}
        <div className="bg-[#0B1526] border border-blue-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-editorial tracking-wide">
                  Unified Operational Work Queue
                </h3>
                <p className="text-xs text-warmwhite/60 font-mono">
                  Consolidated pending tasks requiring administrator action across all departments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {totalWorkQueueItems} Actions Pending
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <Link
              href="/admin/registrations"
              className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-warmwhite/60">Registrations Pending Verification</span>
                <span className="text-amber-400 font-bold text-sm">{pendingRegistrationsCount}</span>
              </div>
              <div className="text-[11px] text-warmwhite/40 mt-1 group-hover:text-citrus transition-colors flex items-center gap-1">
                <span>Review delegate submissions</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link
              href="/admin/enquiries"
              className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-warmwhite/60">Unread Contact Enquiries</span>
                <span className="text-blue-400 font-bold text-sm">{unreadEnquiriesCount}</span>
              </div>
              <div className="text-[11px] text-warmwhite/40 mt-1 group-hover:text-citrus transition-colors flex items-center gap-1">
                <span>Respond to incoming dispatches</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link
              href="/admin/content/articles"
              className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-warmwhite/60">Draft Articles Awaiting Review</span>
                <span className="text-purple-400 font-bold text-sm">{pendingPublicationsCount}</span>
              </div>
              <div className="text-[11px] text-warmwhite/40 mt-1 group-hover:text-citrus transition-colors flex items-center gap-1">
                <span>Editorial review pipeline</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </div>

        {/* Operational KPI Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0A1220] border border-white/10 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/50 block">
              TOTAL REGISTRATIONS
            </span>
            <span className="font-editorial text-3xl font-bold text-white block mt-1">
              {registrationsCount}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono block mt-1">
              {paidRegistrationsCount} confirmed
            </span>
          </div>

          <div className="bg-[#0A1220] border border-white/10 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/50 block">
              ACTIVE ASSEMBLIES
            </span>
            <span className="font-editorial text-3xl font-bold text-citrus block mt-1">
              {eventsCount}
            </span>
            <span className="text-[10px] text-warmwhite/50 font-mono block mt-1">
              Flagship: SHABD & SOCH 2026
            </span>
          </div>

          <div className="bg-[#0A1220] border border-white/10 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/50 block">
              PLATFORM DELEGATES
            </span>
            <span className="font-editorial text-3xl font-bold text-white block mt-1">
              {totalDelegatesCount}
            </span>
            <span className="text-[10px] text-warmwhite/50 font-mono block mt-1">
              Classes 7th to 12th & Scholars
            </span>
          </div>

          <div className="bg-[#0A1220] border border-white/10 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/50 block">
              COLLECTIONS RECONCILED
            </span>
            <span className="font-editorial text-3xl font-bold text-emerald-300 block mt-1">
              ₹{grossCollections.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-warmwhite/50 font-mono block mt-1">
              Cashfree Verified
            </span>
          </div>
        </div>

        {/* Two-Column Activity & Inquiries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Recent Delegate Registrations */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono tracking-wider text-citrus font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Recent Delegate Registrations</span>
              </h3>
              <Link
                href="/admin/registrations"
                className="text-xs text-warmwhite/60 hover:text-citrus font-mono"
              >
                View Full Ledger ({registrationsCount}) ↗
              </Link>
            </div>

            <div className="bg-[#0A1220] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#070D18] text-warmwhite/50 uppercase tracking-wider border-b border-white/10 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Delegate Name</th>
                      <th className="py-3 px-4">Pass Code</th>
                      <th className="py-3 px-4">Assembly</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-warmwhite/40">
                          No registrations recorded yet.
                        </td>
                      </tr>
                    ) : (
                      recentRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-bold text-white">{reg.fullName}</td>
                          <td className="py-3 px-4 text-citrus">{reg.registrationNumber}</td>
                          <td className="py-3 px-4 text-warmwhite/70 truncate max-w-xs">
                            {reg.event?.title || "SHABD & SOCH 2026"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                reg.paymentStatus === "SUCCESS"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                              }`}
                            >
                              {reg.paymentStatus === "SUCCESS" ? "CONFIRMED" : "PENDING"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              href="/admin/registrations"
                              className="text-citrus hover:underline text-[11px]"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Recent Contact Enquiries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono tracking-wider text-blue-400 font-bold flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Dispatch Enquiries</span>
              </h3>
              <Link
                href="/admin/enquiries"
                className="text-xs text-warmwhite/60 hover:text-white font-mono"
              >
                Inbox ↗
              </Link>
            </div>

            <div className="bg-[#0A1220] border border-white/10 rounded-2xl p-4 divide-y divide-white/5 space-y-2">
              {recentEnquiries.length === 0 ? (
                <div className="text-warmwhite/40 text-xs py-4 text-center font-mono">
                  No incoming dispatches.
                </div>
              ) : (
                recentEnquiries.map((enq) => (
                  <div key={enq.id} className="pt-2 first:pt-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white truncate">{enq.name}</span>
                      <span className="text-[10px] font-mono text-warmwhite/40">
                        {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-citrus font-mono mt-0.5">{enq.subject}</div>
                    <div className="text-[11px] text-warmwhite/60 line-clamp-1 mt-0.5">
                      {enq.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
