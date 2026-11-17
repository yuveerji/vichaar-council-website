"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Sliders, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Globe, Power } from "lucide-react";

interface FeatureToggle {
  key: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

export default function WebsiteModulesPage() {
  const [modules, setModules] = useState<FeatureToggle[]>([
    {
      key: "REGISTRATIONS_OPEN",
      name: "Delegate Registrations Portal",
      description: "Controls whether the public registration flow accepts new delegate applications.",
      category: "EVENTS & REGISTRATION",
      enabled: true
    },
    {
      key: "INSTITUTIONAL_FORM_ACTIVE",
      name: "Institutional & School Registration",
      description: "Enables Section A, B, and C for school coordinators to register bulk student delegations.",
      category: "EVENTS & REGISTRATION",
      enabled: true
    },
    {
      key: "CASHFREE_CHECKOUT_ACTIVE",
      name: "Instant Cashfree Payment Gateway",
      description: "Routes delegates to online UPI/cards payment order generation.",
      category: "FINANCIAL",
      enabled: true
    },
    {
      key: "JAMMING_SOCIALS_SHOWCASE",
      name: "Live Jamming Session Feature Block",
      description: "Displays our signature recurring live music jamming sessions on the homepage and event pages.",
      category: "CONTENT & EXPERIENCE",
      enabled: true
    },
    {
      key: "FLASH_ANNOUNCEMENT_BANNER",
      name: "Global Announcement Bar",
      description: "Shows an urgent or flagship notification across the top of all pages.",
      category: "COMMUNICATIONS",
      enabled: false
    },
    {
      key: "MAINTENANCE_MODE",
      name: "Emergency Maintenance Mode",
      description: "Restricts public browsing to a holding dispatch screen while Founders retain root access.",
      category: "SYSTEM & ACCESS",
      enabled: false
    }
  ]);

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleModule = async (key: string) => {
    setSavingKey(key);
    setFeedback(null);

    setModules((prev) =>
      prev.map((m) => (m.key === key ? { ...m, enabled: !m.enabled } : m))
    );

    // Persist to site settings
    try {
      const target = modules.find((m) => m.key === key);
      const nextState = !target?.enabled;

      await fetch("/api/admin/website/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled: nextState })
      });

      setFeedback(`Updated ${key} successfully.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback("Failed to persist toggle to database.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-citrus bg-citrus/20 px-2 py-0.5 rounded border border-citrus/30">
                08 — WEBSITE CONTROL
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">LIVE MODULE CONTROLLER</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
              Module Manager & Feature Controls
            </h1>
            <p className="text-xs text-warmwhite/70 mt-1">
              Toggle live functional subsystems on or off in real time with instant global propagation.
            </p>
          </div>

          {feedback && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{feedback}</span>
            </div>
          )}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.key}
              className={`p-6 rounded-2xl border transition-all ${
                mod.enabled
                  ? "bg-[#0B1526] border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                  : "bg-[#070E1A] border-white/10 opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-warmwhite/40 block">
                    {mod.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">{mod.name}</h3>
                  <p className="text-xs text-warmwhite/60 mt-1 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  disabled={savingKey === mod.key}
                  onClick={() => toggleModule(mod.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    mod.enabled ? "bg-emerald-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      mod.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-warmwhite/40">{mod.key}</span>
                <span
                  className={`font-bold ${
                    mod.enabled ? "text-emerald-400" : "text-warmwhite/50"
                  }`}
                >
                  {mod.enabled ? "ACTIVE & LIVE" : "DISABLED"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
