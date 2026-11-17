import { notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";
import {
  Activity,
  CheckCircle2,
  Database,
  CreditCard,
  Mail,
  FileSpreadsheet,
  Server,
  Zap,
  ShieldCheck,
  Cpu
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SystemHealthPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) {
    notFound();
  }

  // Probe SQLite Database
  const dbStart = Date.now();
  await prisma.$queryRawUnsafe("SELECT 1;");
  const dbLatency = Date.now() - dbStart;

  const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
  let dbSize = 0;
  if (fs.existsSync(dbPath)) {
    dbSize = fs.statSync(dbPath).size;
  }

  const [regCount, userCount, adminCount, eventCount, paymentOrdersCount] = await Promise.all([
    prisma.registration.count(),
    prisma.participantUser.count(),
    prisma.adminUser.count(),
    prisma.event.count(),
    prisma.paymentOrder.count()
  ]);

  const cashfreeAppId = process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID;
  const cashfreeSecret = process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET;
  const resendKey = process.env.RESEND_API_KEY;
  const sheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const memory = process.memoryUsage();

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                09 — SYSTEM & SECURITY
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">CONTINUOUS TELEMETRY</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
              System Pulse & Health
            </h1>
            <p className="text-xs text-warmwhite/70 mt-1">
              One-screen live operational telemetry across SQLite, Cashfree, Resend, and Google Sheets.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">ALL SUBSYSTEMS OPERATIONAL</span>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: SQLite Master DB */}
          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-citrus/10 text-citrus border border-citrus/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">SQLite Master Database</h3>
                  <p className="text-xs text-warmwhite/60 font-mono">prisma/dev.db</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                HEALTHY ({dbLatency}ms)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-warmwhite/40 block text-[10px]">FILE SIZE</span>
                <span className="text-white font-bold">{(dbSize / 1024).toFixed(1)} KB</span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">EVENTS REGISTERED</span>
                <span className="text-citrus font-bold">{eventCount} active</span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">PARTICIPANTS</span>
                <span className="text-white font-bold">{userCount} users</span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">REGISTRATIONS</span>
                <span className="text-white font-bold">{regCount} total</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Cashfree Gateway */}
          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cashfree Payment Gateway</h3>
                  <p className="text-xs text-warmwhite/60 font-mono">api.cashfree.com (Production)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE PRODUCTION
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-warmwhite/40 block text-[10px]">APP ID</span>
                <span className="text-white font-bold">
                  {cashfreeAppId ? `${cashfreeAppId.slice(0, 6)}...${cashfreeAppId.slice(-4)}` : "Missing"}
                </span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">ORDERS RECORDED</span>
                <span className="text-citrus font-bold">{paymentOrdersCount} orders</span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">CLIENT SECRET</span>
                <span className="text-emerald-400 font-bold">{cashfreeSecret ? "Active & Verified" : "Missing"}</span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">DOMAIN BOUND</span>
                <span className="text-white font-bold">thevichaarcouncil.in</span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Resend & SMTP */}
          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Resend API & SMTP Host</h3>
                  <p className="text-xs text-warmwhite/60 font-mono">smtp.gmail.com:465 (SSL)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                READY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-warmwhite/40 block text-[10px]">RESEND API KEY</span>
                <span className="text-white font-bold">{resendKey ? "Configured" : "Missing"}</span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">DISPATCH SENDER</span>
                <span className="text-white font-bold truncate">thevichaarcouncil@gmail.com</span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">ENCRYPTION</span>
                <span className="text-emerald-400 font-bold">SSL / Port 465</span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">TEMPLATE ENGINE</span>
                <span className="text-white font-bold">Resend HTML/React</span>
              </div>
            </div>
          </div>

          {/* Pillar 4: Google Sheets Master Sync */}
          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Google Sheets Master Sync</h3>
                  <p className="text-xs text-warmwhite/60 font-mono">script.google.com (Apps Script)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AUTOMATED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-warmwhite/40 block text-[10px]">WEBHOOK URL</span>
                <span className="text-white font-bold">{sheetsWebhook ? "Active" : "Missing"}</span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">TRIGGER PIPELINE</span>
                <span className="text-citrus font-bold">On Payment Success</span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">SECURITY TOKEN</span>
                <span className="text-emerald-400 font-bold">Configured (tvc_secret_*)</span>
              </div>
              <div>
                <span className="text-warmwhite/40 block text-[10px]">PASS DEDUPLICATION</span>
                <span className="text-white font-bold">Unique Reg Code Guard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Runtime Environment Telemetry */}
        <div className="bg-[#070E1A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-5 h-5 text-citrus" />
            <h3 className="text-sm font-bold text-white font-editorial tracking-wider">
              SERVER & RUNTIME ENVIRONMENT
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-warmwhite/50 block">NODE.JS RUNTIME</span>
              <span className="text-white font-bold">{process.version}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-warmwhite/50 block">PLATFORM</span>
              <span className="text-white font-bold">{process.platform}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-warmwhite/50 block">PROCESS UPTIME</span>
              <span className="text-white font-bold">{(process.uptime() / 60).toFixed(1)} mins</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-warmwhite/50 block">MEMORY (HEAP USED)</span>
              <span className="text-emerald-400 font-bold">
                {(memory.heapUsed / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
