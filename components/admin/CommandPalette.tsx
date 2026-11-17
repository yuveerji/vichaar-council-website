"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Mail,
  CreditCard,
  MessageSquare,
  Sliders,
  Shield,
  Settings,
  Activity,
  Zap,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  X
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  href?: string;
  action?: () => void;
  icon: any;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSystemPulse?: () => void;
}

export default function CommandPalette({ isOpen, onClose, onOpenSystemPulse }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const runGoogleSheetsSync = async () => {
    setSyncStatus("Syncing with Google Sheets...");
    try {
      const res = await fetch("/api/admin/sync-sheets", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus("Google Sheets sync successful!");
      } else {
        setSyncStatus(`Sync error: ${data.error || "Failed"}`);
      }
    } catch (err: any) {
      setSyncStatus(`Sync error: ${err.message}`);
    }
    setTimeout(() => {
      setSyncStatus(null);
      onClose();
    }, 2000);
  };

  const commandItems: CommandItem[] = [
    // 01 EXECUTIVE
    {
      id: "exec-overview",
      title: "Command Overview",
      subtitle: "Executive KPIs, live registrations, revenue and pulse",
      category: "01 — EXECUTIVE",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      shortcut: "G O"
    },
    {
      id: "exec-operations",
      title: "Live Operations",
      subtitle: "Active delegate sessions, admissions, venue status",
      category: "01 — EXECUTIVE",
      href: "/admin/executive/operations",
      icon: Activity
    },
    {
      id: "exec-pulse",
      title: "System Pulse",
      subtitle: "Inspect real-time health of SQLite, Cashfree, Resend, and Sheets",
      category: "01 — EXECUTIVE",
      action: () => {
        onClose();
        if (onOpenSystemPulse) onOpenSystemPulse();
      },
      icon: Zap,
      shortcut: "P"
    },

    // 02 ORGANISATION
    {
      id: "org-users",
      title: "Members & Users",
      subtitle: "Manage delegate and participant accounts, profiles, verification",
      category: "02 — ORGANISATION",
      href: "/admin/organisation/users",
      icon: Users
    },
    {
      id: "org-leadership",
      title: "Leadership & Team",
      subtitle: "Patrons, secretariat roster, advisory board",
      category: "02 — ORGANISATION",
      href: "/admin/organisation/leadership",
      icon: Users
    },
    {
      id: "org-roles",
      title: "Roles & Permissions",
      subtitle: "Configure access tiers, Founder root clearance, whitelists",
      category: "02 — ORGANISATION",
      href: "/admin/organisation/roles",
      icon: Shield
    },

    // 03 CONTENT & PUBLISHING
    {
      id: "content-pages",
      title: "Pages & Content Manager",
      subtitle: "Edit institutional pages, curriculum, copy",
      category: "03 — CONTENT & PUBLISHING",
      href: "/admin/content/pages",
      icon: FileText
    },
    {
      id: "content-news",
      title: "News & Articles",
      subtitle: "Official communiqués, press dispatches, thought pieces",
      category: "03 — CONTENT & PUBLISHING",
      href: "/admin/content/news",
      icon: FileText
    },

    // 04 PROGRAMMES & EVENTS
    {
      id: "events-manage",
      title: "Event Management",
      subtitle: "All assemblies, summits, debates, dates, agendas",
      category: "04 — PROGRAMMES & EVENTS",
      href: "/admin/events",
      icon: Calendar,
      shortcut: "G E"
    },
    {
      id: "events-shabd-soch",
      title: "SHABD & SOCH Management",
      subtitle: "Full control for the 20 Dec 2026 Udaipur flagship debate",
      category: "04 — PROGRAMMES & EVENTS",
      href: "/admin/events/shabd-soch",
      icon: Calendar
    },
    {
      id: "events-registrations",
      title: "Delegate Registrations",
      subtitle: "Review, approve, search registrations and delegate codes",
      category: "04 — PROGRAMMES & EVENTS",
      href: "/admin/registrations",
      icon: FileText,
      shortcut: "G R"
    },
    {
      id: "events-passes",
      title: "Tickets & Digital Passes",
      subtitle: "Issue, revoke, and inspect verified QR passes",
      category: "04 — PROGRAMMES & EVENTS",
      href: "/admin/events/tickets",
      icon: Zap
    },

    // 05 COMMUNICATIONS
    {
      id: "comm-email",
      title: "Email Command Centre",
      subtitle: "Direct broadcaster via Resend API and SMTP credentials",
      category: "05 — COMMUNICATIONS",
      href: "/admin/communications/email",
      icon: Mail
    },
    {
      id: "comm-enquiries",
      title: "Contact & Enquiries Inbox",
      subtitle: "Incoming institutional dispatch messages and sponsor inquiries",
      category: "05 — COMMUNICATIONS",
      href: "/admin/enquiries",
      icon: Mail
    },

    // 06 FINANCE & OPERATIONS
    {
      id: "fin-payments",
      title: "Cashfree Payments & Orders",
      subtitle: "Live payment orders, webhooks, transaction ledger",
      category: "06 — FINANCE & OPERATIONS",
      href: "/admin/payments",
      icon: CreditCard,
      shortcut: "G P"
    },
    {
      id: "fin-analytics",
      title: "Financial Overview & Revenue",
      subtitle: "Gross settlements, average ticket size, refunds",
      category: "06 — FINANCE & OPERATIONS",
      href: "/admin/finance/overview",
      icon: CreditCard
    },

    // 08 WEBSITE CONTROL
    {
      id: "web-modules",
      title: "Module Manager & Live Toggles",
      subtitle: "Enable/disable registration forms, jamming, flash banners",
      category: "08 — WEBSITE CONTROL",
      href: "/admin/website/modules",
      icon: Sliders
    },
    {
      id: "web-homepage",
      title: "Homepage Builder",
      subtitle: "Reorder homepage blocks, adjust hero typography and CTAs",
      category: "08 — WEBSITE CONTROL",
      href: "/admin/website/homepage",
      icon: Sliders
    },

    // 09 SYSTEM & SECURITY
    {
      id: "sys-health",
      title: "System Health & Diagnostic Pulse",
      subtitle: "Continuous diagnostics for DB, Cashfree, Resend, and Sheets",
      category: "09 — SYSTEM & SECURITY",
      href: "/admin/system/health",
      icon: Zap
    },
    {
      id: "sys-audit",
      title: "Founder Activity Ledger",
      subtitle: "Immutable audit log of all administrative actions and diffs",
      category: "09 — SYSTEM & SECURITY",
      href: "/admin/system/audit-logs",
      icon: Shield
    },

    // 10 FOUNDER SETTINGS
    {
      id: "set-global",
      title: "Global System Settings",
      subtitle: "Institution parameters, maintenance mode, API tokens",
      category: "10 — FOUNDER SETTINGS",
      href: "/admin/settings",
      icon: Settings,
      shortcut: "G S"
    },
    {
      id: "set-automation",
      title: "Automation Studio",
      subtitle: "Configure workflow triggers (Webhook -> Pass -> Sheets)",
      category: "10 — FOUNDER SETTINGS",
      href: "/admin/founders/automation",
      icon: Zap
    },

    // QUICK ACTIONS
    {
      id: "act-sync-sheets",
      title: "Trigger Google Sheets Master Sync",
      subtitle: "Immediately synchronize registrations and payments with Sheets",
      category: "QUICK ACTIONS",
      action: runGoogleSheetsSync,
      icon: RefreshCw,
      shortcut: "SYNC"
    },
    {
      id: "act-live-site",
      title: "Open Live Public Website",
      subtitle: "View the official site in a new tab",
      category: "QUICK ACTIONS",
      action: () => {
        window.open("/", "_blank");
        onClose();
      },
      icon: ExternalLink
    }
  ];

  const filteredItems = commandItems.filter((item) => {
    const s = `${item.title} ${item.subtitle} ${item.category}`.toLowerCase();
    return s.includes(query.toLowerCase());
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      const target = filteredItems[selectedIndex];
      if (target.action) {
        target.action();
      } else if (target.href) {
        router.push(target.href);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#09121F] border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Input Field */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-navy via-[#0C1729] to-navy">
          <Command className="w-5 h-5 text-citrus shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a module, action, or command... (e.g. 'sheets', 'cashfree', 'events')"
            className="w-full bg-transparent text-sm text-white placeholder-warmwhite/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-warmwhite/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-warmwhite/60 shrink-0">
            ESC
          </span>
        </div>

        {/* Sync Status Banner */}
        {syncStatus && (
          <div className="p-3 bg-amber-950/80 border-b border-amber-500/40 text-xs text-amber-300 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-citrus" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-white/5 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-warmwhite/50">
              No command or module matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.href) {
                      router.push(item.href);
                      onClose();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 text-white"
                      : "text-warmwhite/80 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? "bg-amber-400 text-navy" : "bg-white/5 text-citrus"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{item.title}</span>
                        <span className="text-[9px] uppercase tracking-wider text-warmwhite/40 font-mono">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-warmwhite/60 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-warmwhite/70">
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? "text-citrus translate-x-1" : "text-transparent"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-2.5 px-4 bg-[#070E1A] border-t border-white/10 flex items-center justify-between text-[11px] text-warmwhite/50">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↑</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↓</kbd> navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↵</kbd> execute
            </span>
          </div>
          <span className="font-editorial text-amber-300 font-bold tracking-wider">
            VICHAAR.FOUNDERS COMMAND PALETTE
          </span>
        </div>
      </div>
    </div>
  );
}
