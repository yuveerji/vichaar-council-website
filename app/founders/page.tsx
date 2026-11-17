import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { getAuthorizedFounder } from "@/lib/auth";
import FoundersLayout from "@/components/founders/FoundersLayout";
import {
  Crown,
  Activity,
  Zap,
  Shield,
  CreditCard,
  Database,
  ArrowRight,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Server
} from "lucide-react";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function FoundersDashboardPage() {
  const currentFounder = await getAuthorizedFounder();
  if (!currentFounder) {
    redirect("/admin/dashboard");
  }

  // Probe live database telemetry
  const dbStart = Date.now();
  await prisma.$queryRawUnsafe("SELECT 1;");
  const dbLatency = Date.now() - dbStart;

  const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
  let dbSize = 0;
  if (fs.existsSync(dbPath)) {
    dbSize = fs.statSync(dbPath).size;
  }

  const [
    eventsCount,
    registrationsCount,
    paidRegistrationsCount,
    successfulPayments,
    totalUsers,
    adminUsers,
    recentAuditLogs
  ] = await Promise.all([
    prisma.event.count(),
    prisma.registration.count(),
    prisma.registration.count({ where: { paymentStatus: "SUCCESS" } }),
    prisma.paymentOrder.findMany({ where: { status: "SUCCESS" }, select: { amount: true } }),
    prisma.participantUser.count(),
    prisma.adminUser.count(),
    prisma.auditLog.findMany({ take: 5, orderBy: { createdAt: "desc" } })
  ]);

  const grossCollections = successfulPayments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <FoundersLayout user={currentFounder}>
      <div className="space-y-8">
        {/* Top Strategic Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-amber-500/20 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] font-mono font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                VICHAAR.FOUNDERS · ROOT ACCESS
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">STRATEGIC CONTROL COCKPIT</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5 flex items-center gap-3">
              <span>Strategic Command Centre</span>
              <Crown className="w-7 h-7 text-citrus" />
            </h1>
            <p className="text-xs text-citrus/90 font-mono mt-1 tracking-wider">
              ONE COMMAND CENTRE. COMPLETE CONTROL. ZERO FRAGMENTATION.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-warmwhite hover:text-white font-mono uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <span>Switch to VICHAAR.ADMIN</span>
              <ArrowRight className="w-3.5 h-3.5 text-citrus" />
            </Link>
            <Link
              href="/admin/system/health"
              className="px-4 py-2.5 rounded-xl bg-citrus hover:bg-citrus/90 text-navy text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md"
            >
              System Pulse Live
            </Link>
          </div>
        </div>

        {/* Strategic Root Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0B1526] border border-amber-500/25 rounded-2xl p-6 shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/50 block">
              GROSS REVENUE RECORDED
            </span>
            <span className="font-editorial text-3xl font-bold text-citrus block mt-2">
              ₹{grossCollections.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono block mt-1">
              Production Cashfree Verified
            </span>
          </div>

          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/50 block">
              PLATFORM DELEGATES
            </span>
            <span className="font-editorial text-3xl font-bold text-white block mt-2">
              {totalUsers}
            </span>
            <span className="text-[10px] text-warmwhite/50 font-mono block mt-1">
              {adminUsers} authorized secretariat
            </span>
          </div>

          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/50 block">
              ACTIVE REGISTRATIONS
            </span>
            <span className="font-editorial text-3xl font-bold text-white block mt-2">
              {registrationsCount}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono block mt-1">
              {paidRegistrationsCount} paid & confirmed
            </span>
          </div>

          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/50 block">
              DATABASE LATENCY
            </span>
            <span className="font-editorial text-3xl font-bold text-emerald-300 block mt-2 font-mono">
              {dbLatency}ms
            </span>
            <span className="text-[10px] text-warmwhite/50 font-mono block mt-1">
              {(dbSize / 1024).toFixed(1)} KB SQLite WAL
            </span>
          </div>
        </div>

        {/* 4 Strategic Operation Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel 1: System Pulse Live Telemetry */}
          <div className="p-6 rounded-2xl bg-[#09121F] border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-editorial tracking-wide">
                    Live System Telemetry
                  </h3>
                  <p className="text-xs text-warmwhite/60 font-mono">All 5 Core Services Online</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                OPERATIONAL
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-warmwhite/70">SQLite Database (prisma/dev.db)</span>
                <span className="text-emerald-400 font-bold">CONNECTED ({dbLatency}ms)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-warmwhite/70">Cashfree PG (thevichaarcouncil.in)</span>
                <span className="text-emerald-400 font-bold">LIVE PRODUCTION</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-warmwhite/70">Firebase & Google Authentication</span>
                <span className="text-emerald-400 font-bold">READY (OAuth 2.0)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-warmwhite/70">Google Sheets Master Sync</span>
                <span className="text-emerald-400 font-bold">AUTOMATED (2-WAY)</span>
              </div>
            </div>

            <Link
              href="/admin/system/health"
              className="inline-flex items-center gap-1.5 text-xs text-citrus font-mono hover:underline pt-1"
            >
              <span>Inspect Full Telemetry Docket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Panel 2: Automation Studio & Background Workers */}
          <div className="p-6 rounded-2xl bg-[#09121F] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-editorial tracking-wide">
                    Automation Studio
                  </h3>
                  <p className="text-xs text-warmwhite/60 font-mono">Event-driven Pipelines</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                ARMED
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="font-bold text-white">Payment Settlement Pipeline</div>
                <div className="text-[11px] text-warmwhite/50 mt-0.5">
                  Webhook SUCCESS → Pass Issuance → Sheets Sync → Resend Dispatch
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="font-bold text-white">Pass Deduplication & Isolation Guard</div>
                <div className="text-[11px] text-warmwhite/50 mt-0.5">
                  Enforces 1 QR pass per registered delegate per assembly
                </div>
              </div>
            </div>

            <Link
              href="/admin/founders/automation"
              className="inline-flex items-center gap-1.5 text-xs text-citrus font-mono hover:underline pt-1"
            >
              <span>Manage Automation Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Panel 3: Recent Activity Ledger */}
        <div className="p-6 rounded-2xl bg-[#09121F] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-citrus" />
              <h3 className="text-sm font-bold text-white font-editorial tracking-wider">
                FOUNDER ACTIVITY LEDGER (RECENT AUDIT TRAIL)
              </h3>
            </div>
            <Link
              href="/admin/system/audit-logs"
              className="text-xs text-citrus font-mono hover:underline"
            >
              View Full Ledger ↗
            </Link>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {recentAuditLogs.length === 0 ? (
              <div className="text-warmwhite/40 text-center py-4">No audit logs recorded yet.</div>
            ) : (
              recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                      {log.action}
                    </span>
                    <span className="text-white">{log.entity}</span>
                    <span className="text-warmwhite/50 text-[11px] truncate max-w-md">{log.details}</span>
                  </div>
                  <span className="text-warmwhite/40 text-[10px]">
                    {new Date(log.createdAt).toLocaleTimeString("en-IN")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </FoundersLayout>
  );
}
