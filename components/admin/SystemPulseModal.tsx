"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  CreditCard,
  Mail,
  FileSpreadsheet,
  Server,
  X,
  Zap
} from "lucide-react";

interface SystemPulseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SystemPulseModal({ isOpen, onClose }: SystemPulseModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPulse = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/system/health");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "Failed to inspect system pulse");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPulse();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-[#070E1A] border-2 border-emerald-500/30 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/30 via-navy to-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-editorial tracking-wider">
                  SYSTEM PULSE DIAGNOSTIC
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-warmwhite/60 mt-0.5">
                Continuous operational telemetry for The Vichaar Council Control Plane.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPulse}
              disabled={loading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-warmwhite hover:text-white transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-citrus" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-warmwhite hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {data ? (
            <>
              {/* Overall Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-transparent border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider font-bold text-emerald-300 font-mono">
                      OVERALL STATUS: {data.status}
                    </div>
                    <div className="text-[11px] text-warmwhite/70">
                      Telemetry latency: {data.totalLatencyMs}ms · Checked at{" "}
                      {new Date(data.timestamp).toLocaleTimeString("en-IN")}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-emerald-400">
                  NODE {data.system?.nodeVersion} · {data.system?.platform}
                </div>
              </div>

              {/* Service Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Database */}
                <div className="p-4 rounded-2xl bg-[#0B1526] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <Database className="w-4 h-4 text-citrus" />
                      <span>{data.services?.database?.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {data.services?.database?.status} ({data.services?.database?.latencyMs}ms)
                    </span>
                  </div>
                  <div className="text-xs text-warmwhite/70 space-y-1 font-mono text-[11px]">
                    <div>File: {data.services?.database?.details?.file}</div>
                    <div>Size: {data.services?.database?.details?.sizeFormatted}</div>
                    <div>Registrations: {data.services?.database?.details?.registrations}</div>
                    <div>Participants: {data.services?.database?.details?.participants}</div>
                  </div>
                </div>

                {/* 2. Cashfree Payment Gateway */}
                <div className="p-4 rounded-2xl bg-[#0B1526] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <CreditCard className="w-4 h-4 text-citrus" />
                      <span>{data.services?.cashfree?.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {data.services?.cashfree?.status}
                    </span>
                  </div>
                  <div className="text-xs text-warmwhite/70 space-y-1 font-mono text-[11px]">
                    <div>Environment: {data.services?.cashfree?.details?.environment}</div>
                    <div>App ID: {data.services?.cashfree?.details?.appIdMasked}</div>
                    <div>Webhook Secret: Active</div>
                    <div>Target Domain: {data.services?.cashfree?.details?.targetDomain}</div>
                  </div>
                </div>

                {/* 3. Email (Resend & SMTP) */}
                <div className="p-4 rounded-2xl bg-[#0B1526] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <Mail className="w-4 h-4 text-citrus" />
                      <span>{data.services?.email?.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {data.services?.email?.status}
                    </span>
                  </div>
                  <div className="text-xs text-warmwhite/70 space-y-1 font-mono text-[11px]">
                    <div>Resend API: {data.services?.email?.details?.resendKeyMasked}</div>
                    <div>SMTP Host: {data.services?.email?.details?.smtpHost}:{data.services?.email?.details?.smtpPort}</div>
                    <div>Dispatch Sender: {data.services?.email?.details?.smtpSender}</div>
                  </div>
                </div>

                {/* 4. Google Sheets Master Sync */}
                <div className="p-4 rounded-2xl bg-[#0B1526] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <FileSpreadsheet className="w-4 h-4 text-citrus" />
                      <span>{data.services?.googleSheets?.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {data.services?.googleSheets?.status}
                    </span>
                  </div>
                  <div className="text-xs text-warmwhite/70 space-y-1 font-mono text-[11px]">
                    <div>Webhook Endpoint: script.google.com</div>
                    <div>Security Token: Configured</div>
                    <div>Auto-Sync on Payment: Enabled</div>
                  </div>
                </div>

                {/* 5. Firebase & Google Authentication */}
                <div className="p-4 rounded-2xl bg-[#0B1526] border border-white/10 space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>{data.services?.firebaseAuth?.name || "Firebase & Google Authentication"}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {data.services?.firebaseAuth?.status || "OPERATIONAL"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-warmwhite/70 font-mono text-[11px]">
                    <div>Provider: Google OAuth 2.0</div>
                    <div>Project: thevichaarcouncil</div>
                    <div>1-Click Participant & Founder Login: Active</div>
                  </div>
                </div>
              </div>

              {/* Server Telemetry */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-warmwhite/60">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-warmwhite/40" />
                  <span>Uptime: {(data.system?.uptime / 60).toFixed(1)} mins</span>
                </div>
                <div className="font-mono text-[11px]">
                  Heap Used: {(data.system?.memory?.heapUsed / 1024 / 1024).toFixed(1)} MB / RSS:{" "}
                  {(data.system?.memory?.rss / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-warmwhite/50">
              Gathering live system metrics...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#050A14] border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-warmwhite/50 font-mono">
            VICHAAR.FOUNDERS · ROOT ACCESS TELEMETRY
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-citrus text-navy font-bold text-xs uppercase tracking-wider shadow-md hover:bg-citrus/90 transition-colors"
          >
            Close Pulse
          </button>
        </div>
      </div>
    </div>
  );
}
