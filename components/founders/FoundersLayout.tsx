"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import VichaarLogo from "@/components/VichaarLogo";
import CommandPalette from "@/components/admin/CommandPalette";
import SystemPulseModal from "@/components/admin/SystemPulseModal";
import {
  LayoutDashboard,
  Activity,
  Users,
  Shield,
  FileText,
  Calendar,
  Mail,
  CreditCard,
  MessageSquare,
  Sliders,
  Zap,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  LogOut,
  Command,
  Crown,
  ArrowRight
} from "lucide-react";

interface FoundersLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    role: string;
    username?: string;
  };
}

interface FounderNavSection {
  id: string;
  number: string;
  title: string;
  icon: any;
  items: {
    name: string;
    href: string;
    badge?: string;
  }[];
}

const founderNavSections: FounderNavSection[] = [
  {
    id: "executive",
    number: "01",
    title: "EXECUTIVE",
    icon: LayoutDashboard,
    items: [
      { name: "Command Overview", href: "/founders" },
      { name: "Live Operations", href: "/founders/executive/operations" },
      { name: "Alerts & Notifications", href: "/founders/executive/alerts" }
    ]
  },
  {
    id: "organisation",
    number: "02",
    title: "ORGANISATION",
    icon: Users,
    items: [
      { name: "Members & Users", href: "/founders/organisation/users" },
      { name: "Leadership & Team", href: "/founders/organisation/leadership" },
      { name: "Roles & Permissions", href: "/founders/organisation/roles" },
      { name: "Applications & Recruitment", href: "/founders/organisation/applications" }
    ]
  },
  {
    id: "content",
    number: "03",
    title: "CONTENT & PUBLISHING",
    icon: FileText,
    items: [
      { name: "Pages & Content Manager", href: "/founders/content/pages" },
      { name: "News & Articles", href: "/founders/content/news" },
      { name: "Media Library", href: "/founders/content/media" },
      { name: "Navigation & Footer Builder", href: "/founders/content/navigation" },
      { name: "SEO & Metadata", href: "/founders/content/seo" }
    ]
  },
  {
    id: "programmes",
    number: "04",
    title: "PROGRAMMES & EVENTS",
    icon: Calendar,
    items: [
      { name: "Event Management", href: "/founders/events" },
      { name: "SHABD & SOCH Management", href: "/founders/events/shabd-soch", badge: "FLAGSHIP" },
      { name: "Registrations Ledger", href: "/founders/registrations" },
      { name: "Tickets & Passes", href: "/founders/events/tickets" },
      { name: "Certificates & Awards", href: "/founders/events/certificates" }
    ]
  },
  {
    id: "communications",
    number: "05",
    title: "COMMUNICATIONS",
    icon: Mail,
    items: [
      { name: "Email Command Centre", href: "/founders/communications/email" },
      { name: "Campaign Manager", href: "/founders/communications/campaigns" },
      { name: "Announcements", href: "/founders/communications/announcements" },
      { name: "Contact & Enquiries", href: "/founders/enquiries" },
      { name: "Notification Manager", href: "/founders/communications/notifications" }
    ]
  },
  {
    id: "finance",
    number: "06",
    title: "FINANCE & OPERATIONS",
    icon: CreditCard,
    items: [
      { name: "Financial Overview", href: "/founders/finance/overview" },
      { name: "Cashfree Transactions", href: "/founders/payments", badge: "PROD" },
      { name: "Invoices & Records", href: "/founders/finance/invoices" },
      { name: "Partnerships & Sponsors", href: "/founders/finance/partnerships" },
      { name: "Reports & Analytics", href: "/founders/finance/reports" }
    ]
  },
  {
    id: "community",
    number: "07",
    title: "COMMUNITY",
    icon: MessageSquare,
    items: [
      { name: "Discussions & Submissions", href: "/founders/community/submissions" },
      { name: "Reports & Moderation", href: "/founders/community/moderation" },
      { name: "Community Engagement", href: "/founders/community/engagement" }
    ]
  },
  {
    id: "website",
    number: "08",
    title: "WEBSITE CONTROL",
    icon: Sliders,
    items: [
      { name: "Module Manager & Toggles", href: "/founders/website/modules" },
      { name: "Homepage Builder", href: "/founders/website/homepage" },
      { name: "Site Configuration", href: "/founders/website/config" },
      { name: "Feature Controls", href: "/founders/website/features" },
      { name: "Branding & Appearance", href: "/founders/website/branding" }
    ]
  },
  {
    id: "system",
    number: "09",
    title: "SYSTEM & SECURITY",
    icon: Zap,
    items: [
      { name: "System Health & Pulse", href: "/founders/system/health" },
      { name: "Database & Backups", href: "/founders/system/database" },
      { name: "Integrations & APIs", href: "/founders/system/integrations" },
      { name: "Founder Activity Ledger", href: "/founders/system/audit-logs" },
      { name: "Security Centre", href: "/founders/system/security" }
    ]
  },
  {
    id: "founderSettings",
    number: "10",
    title: "FOUNDER SETTINGS",
    icon: Settings,
    items: [
      { name: "Global Settings", href: "/founders/settings" },
      { name: "Automation Studio", href: "/founders/automation", badge: "AUTONOMOUS" },
      { name: "Change History", href: "/founders/changelog" },
      { name: "Founder Profile", href: "/founders/profile" }
    ]
  }
];

export default function FoundersLayout({ children, user }: FoundersLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    executive: true,
    programmes: true,
    finance: true,
    website: true,
    system: true,
    founderSettings: true
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [systemPulseOpen, setSystemPulseOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#050A14] text-warmwhite flex font-sans">
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenSystemPulse={() => setSystemPulseOpen(true)}
      />

      <SystemPulseModal
        isOpen={systemPulseOpen}
        onClose={() => setSystemPulseOpen(false)}
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Founder Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#070E1A] border-r border-amber-500/20 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl ${
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}
      >
        {/* Brand Header */}
        <div className="shrink-0 p-4 border-b border-amber-500/20 flex items-center justify-between bg-gradient-to-r from-navy via-[#0C1628] to-navy">
          <Link
            href="/founders"
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "mx-auto" : ""}`}
            title="VICHAAR.FOUNDERS Strategic Command"
          >
            <VichaarLogo
              variant="dashboard"
              className="shrink-0 transition-transform duration-300 hover:scale-105"
            />
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-editorial text-sm font-bold text-white tracking-wider block leading-none">
                    VICHAAR.FOUNDERS
                  </span>
                  <Crown className="w-3.5 h-3.5 text-citrus shrink-0" />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-amber-300 uppercase px-1.5 py-0.2 rounded bg-amber-400/20 border border-amber-400/30">
                    STRATEGIC ROOT
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-warmwhite/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Switch to Operational VICHAAR.ADMIN Button */}
        {!isCollapsed && (
          <div className="p-3 border-b border-white/5 bg-[#0A1220]">
            <Link
              href="/admin/dashboard"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-warmwhite/80 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="font-medium text-[11px]">Open Operational Admin</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-citrus transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* 10 Sections Menu */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden scroll-smooth py-3 space-y-3 [scrollbar-width:thin] [scrollbar-color:rgba(255,166,43,0.3)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-citrus/40 [&::-webkit-scrollbar-thumb]:rounded-full ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          {founderNavSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.id] !== false;
            const hasActiveChild = section.items.some(
              (item) => pathname === item.href || (item.href !== "/founders" && pathname.startsWith(`${item.href}/`))
            );

            if (isCollapsed) {
              return (
                <div key={section.id} className="flex flex-col items-center">
                  <button
                    onClick={() => setCommandPaletteOpen(true)}
                    title={`${section.number} — ${section.title}`}
                    className={`p-3 rounded-xl transition-all ${
                      hasActiveChild
                        ? "bg-gradient-to-r from-amber-500/25 to-amber-500/10 text-citrus border border-amber-500/40"
                        : "text-warmwhite/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                </div>
              );
            }

            return (
              <div key={section.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-colors ${
                    hasActiveChild ? "text-citrus font-bold" : "text-warmwhite/50 hover:text-warmwhite"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-citrus/80">{section.number}</span>
                    <span className="uppercase">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-warmwhite/40" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-warmwhite/40" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-0.5 pl-2 border-l border-white/5 ml-2">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || (item.href !== "/founders" && pathname.startsWith(`${item.href}/`));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/35 text-white font-semibold shadow-sm"
                              : "text-warmwhite/70 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-citrus/20 text-citrus border border-citrus/30 shrink-0 ml-1">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Profile */}
        <div className={`shrink-0 border-t border-white/10 space-y-2 bg-[#050A14] ${isCollapsed ? "p-2" : "p-3.5"}`}>
          {!isCollapsed && (
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">
                  {user?.name || "Yuveer (Founder)"}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ROOT CLEARANCE
                </span>
              </div>
              <div className="text-[10px] text-warmwhite/50 font-mono truncate mt-0.5">
                {user?.username ? `@${user.username}` : user?.email || "yuveerchhatwani18@gmail.com"}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/"
              target="_blank"
              className="text-[11px] text-warmwhite/50 hover:text-citrus transition-colors flex items-center gap-1"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-[11px] text-red-400 hover:text-red-300 font-bold transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <header className="sticky top-0 z-30 h-16 bg-[#070E1A]/95 border-b border-amber-500/20 px-4 sm:px-8 flex items-center justify-between backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-warmwhite hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-warmwhite/60 hover:text-white transition-all shadow-sm"
            >
              <Command className="w-4 h-4 text-citrus" />
              <span className="hidden sm:inline font-mono">Founder Command</span>
              <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-warmwhite/60">
                Ctrl + K
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Ecosystem Switcher to Operational Admin */}
            <Link
              href="/admin/dashboard"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-warmwhite hover:text-white font-mono transition-colors"
            >
              <span>Switch to VICHAAR.ADMIN</span>
              <ArrowRight className="w-3 h-3 text-citrus" />
            </Link>

            <button
              onClick={() => setSystemPulseOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono hover:border-emerald-400 transition-all shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-bold">SYSTEM PULSE</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
