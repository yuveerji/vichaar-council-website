"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import VichaarLogo from "@/components/VichaarLogo";
import CommandPalette from "./CommandPalette";
import {
  LayoutDashboard,
  CheckSquare,
  Activity,
  Bell,
  CheckCircle2,
  Users,
  Shield,
  Briefcase,
  FileText,
  Newspaper,
  Megaphone,
  Image as ImageIcon,
  FolderOpen,
  Navigation,
  Calendar,
  Ticket,
  Award,
  BarChart3,
  MessageSquare,
  FileCheck,
  AlertOctagon,
  ShieldAlert,
  BookOpen,
  Mail,
  Send,
  Handshake,
  HeartHandshake,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  LineChart,
  Download,
  LifeBuoy,
  HelpCircle,
  ListTodo,
  Settings,
  User,
  Lock,
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

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    role: string;
    username?: string;
    department?: string;
  };
}

interface OperationalSection {
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

const operationalSections: OperationalSection[] = [
  {
    id: "workspace",
    number: "01",
    title: "WORKSPACE",
    icon: LayoutDashboard,
    items: [
      { name: "Dashboard", href: "/admin/dashboard" },
      { name: "My Tasks", href: "/admin/workspace/tasks", badge: "QUEUE" },
      { name: "Activity Feed", href: "/admin/workspace/activity" },
      { name: "Notifications", href: "/admin/workspace/notifications" },
      { name: "Pending Approvals", href: "/admin/workspace/approvals", badge: "REVIEW" }
    ]
  },
  {
    id: "people",
    number: "02",
    title: "PEOPLE & ORGANISATION",
    icon: Users,
    items: [
      { name: "Members Directory", href: "/admin/people/members" },
      { name: "User Management", href: "/admin/people/users" },
      { name: "Leadership Directory", href: "/admin/people/leadership" },
      { name: "Core Team", href: "/admin/people/team" },
      { name: "Departments", href: "/admin/people/departments" },
      { name: "Applications & Recruitment", href: "/admin/people/recruitment" },
      { name: "Roles & Access", href: "/admin/people/roles" }
    ]
  },
  {
    id: "content",
    number: "03",
    title: "CONTENT & MEDIA",
    icon: FileText,
    items: [
      { name: "Page Manager", href: "/admin/content/pages" },
      { name: "Articles & Publications", href: "/admin/content/articles" },
      { name: "Announcements", href: "/admin/content/announcements" },
      { name: "Media Library", href: "/admin/content/media" },
      { name: "Document Manager", href: "/admin/content/documents" },
      { name: "Navigation Manager", href: "/admin/content/navigation" }
    ]
  },
  {
    id: "events",
    number: "04",
    title: "EVENTS & PROGRAMMES",
    icon: Calendar,
    items: [
      { name: "Events Dashboard", href: "/admin/events" },
      { name: "Event Management", href: "/admin/events/manage" },
      { name: "Registrations", href: "/admin/registrations", badge: "LIVE" },
      { name: "Participant Directory", href: "/admin/events/participants" },
      { name: "Attendance", href: "/admin/events/attendance" },
      { name: "Certificates", href: "/admin/events/certificates" },
      { name: "Event Reports", href: "/admin/events/reports" }
    ]
  },
  {
    id: "community",
    number: "05",
    title: "COMMUNITY",
    icon: MessageSquare,
    items: [
      { name: "Community Dashboard", href: "/admin/community/dashboard" },
      { name: "Discussions", href: "/admin/community/discussions" },
      { name: "User Submissions", href: "/admin/community/submissions" },
      { name: "Reports & Complaints", href: "/admin/community/reports" },
      { name: "Moderation Queue", href: "/admin/community/moderation" },
      { name: "Community Guidelines", href: "/admin/community/guidelines" }
    ]
  },
  {
    id: "communications",
    number: "06",
    title: "COMMUNICATIONS",
    icon: Mail,
    items: [
      { name: "Email Centre", href: "/admin/communications/email" },
      { name: "Email Templates", href: "/admin/communications/templates" },
      { name: "Bulk Communications", href: "/admin/communications/bulk" },
      { name: "Announcements", href: "/admin/communications/announcements" },
      { name: "Contact Submissions", href: "/admin/enquiries" },
      { name: "Notification Centre", href: "/admin/communications/notifications" }
    ]
  },
  {
    id: "partnerships",
    number: "07",
    title: "PARTNERSHIPS & OUTREACH",
    icon: Handshake,
    items: [
      { name: "Partner Directory", href: "/admin/partnerships/directory" },
      { name: "Partnership Applications", href: "/admin/partnerships/applications" },
      { name: "Sponsors", href: "/admin/partnerships/sponsors" },
      { name: "Institutional Collaborations", href: "/admin/partnerships/collaborations" },
      { name: "Outreach Records", href: "/admin/partnerships/outreach" }
    ]
  },
  {
    id: "finance",
    number: "08",
    title: "FINANCE & RECORDS",
    icon: DollarSign,
    items: [
      { name: "Payment Records", href: "/admin/finance/records" },
      { name: "Transactions", href: "/admin/payments" },
      { name: "Registration Fees", href: "/admin/finance/fees" },
      { name: "Invoices", href: "/admin/finance/invoices" },
      { name: "Financial Reports", href: "/admin/finance/reports" }
    ]
  },
  {
    id: "analytics",
    number: "09",
    title: "ANALYTICS & REPORTS",
    icon: BarChart3,
    items: [
      { name: "Website Analytics", href: "/admin/analytics/website" },
      { name: "Membership Analytics", href: "/admin/analytics/membership" },
      { name: "Event Analytics", href: "/admin/analytics/events" },
      { name: "Engagement Reports", href: "/admin/analytics/engagement" },
      { name: "Export Centre", href: "/admin/analytics/exports", badge: "CSV" }
    ]
  },
  {
    id: "support",
    number: "10",
    title: "SUPPORT & OPERATIONS",
    icon: LifeBuoy,
    items: [
      { name: "Support Tickets", href: "/admin/support/tickets" },
      { name: "Enquiry Management", href: "/admin/support/enquiries" },
      { name: "Issue Tracking", href: "/admin/support/issues" },
      { name: "FAQs & Help Centre", href: "/admin/support/faqs" },
      { name: "Operational Checklist", href: "/admin/support/checklist" }
    ]
  },
  {
    id: "settings",
    number: "11",
    title: "ADMIN SETTINGS",
    icon: Settings,
    items: [
      { name: "My Profile", href: "/admin/settings/profile" },
      { name: "My Department", href: "/admin/settings/department" },
      { name: "Assigned Permissions", href: "/admin/settings/permissions" },
      { name: "Personal Preferences", href: "/admin/settings/preferences" },
      { name: "Session & Security", href: "/admin/settings/security" }
    ]
  }
];

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    workspace: true,
    people: true,
    content: true,
    events: true,
    communications: true
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

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

  const isUserFounder =
    user?.role === "FOUNDER" ||
    user?.role === "ROOT" ||
    ["yuveerji", "chhatwani", "yuveer"].includes(user?.username?.toLowerCase() || "") ||
    ["yuveerchhatwani18@gmail.com", "chhatwaniyuveer@gmail.com", "founder@thevichaarcouncil.in"].includes(user?.email?.toLowerCase() || "");

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-warmwhite flex font-sans">
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Operational Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#0A1220] border-r border-white/10 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl ${
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}
      >
        {/* Brand Header */}
        <div className="shrink-0 p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0C1628] via-[#0A1220] to-[#0C1628]">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "mx-auto" : ""}`}
            title="VICHAAR.ADMIN Operational Cockpit"
          >
            <VichaarLogo
              variant="dashboard"
              className="shrink-0 transition-transform duration-300 hover:scale-105"
            />
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-editorial text-sm font-bold text-white tracking-wider block leading-none">
                    VICHAAR.ADMIN
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    OPERATIONAL
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[9px] font-mono tracking-wider text-warmwhite/60 uppercase">
                    Administration Centre
                  </span>
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

        {/* Founder Workspace Switcher Button */}
        {isUserFounder && !isCollapsed && (
          <div className="p-3 border-b border-amber-500/20 bg-amber-950/20">
            <Link
              href="/founders"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 border border-amber-500/30 text-xs text-amber-200 hover:border-amber-400 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-citrus animate-pulse" />
                <span className="font-editorial font-bold tracking-wide text-[11px]">VICHAAR.FOUNDERS</span>
              </div>
              <span className="text-[8px] font-mono font-bold bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-300">
                ROOT ↗
              </span>
            </Link>
          </div>
        )}

        {/* Search / Command Launcher */}
        {!isCollapsed && (
          <div className="p-3 border-b border-white/5 bg-[#080E1A]">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-warmwhite/60 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-citrus" />
                <span className="truncate">Vichaar Command...</span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-warmwhite/70">
                ⌘K
              </span>
            </button>
          </div>
        )}

        {/* 11 Operational Sections Menu */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden scroll-smooth py-3 space-y-3 [scrollbar-width:thin] [scrollbar-color:rgba(255,166,43,0.3)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-citrus/40 [&::-webkit-scrollbar-thumb]:rounded-full ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          {operationalSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.id] !== false;
            const hasActiveChild = section.items.some(
              (item) => pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(`${item.href}/`))
            );

            if (isCollapsed) {
              return (
                <div key={section.id} className="flex flex-col items-center">
                  <button
                    onClick={() => setCommandPaletteOpen(true)}
                    title={`${section.number} — ${section.title}`}
                    className={`p-3 rounded-xl transition-all ${
                      hasActiveChild
                        ? "bg-citrus text-navy shadow-md"
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
                      const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(`${item.href}/`));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? "bg-citrus/15 border border-citrus/30 text-white font-semibold shadow-sm"
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

        {/* Footer Profile & Logout */}
        <div className={`shrink-0 border-t border-white/10 space-y-2 bg-[#080E1A] ${isCollapsed ? "p-2" : "p-3.5"}`}>
          {!isCollapsed && (
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">
                  {user?.name || "Council Secretariat Officer"}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {isUserFounder ? "FOUNDER" : user?.role || "ADMIN"}
                </span>
              </div>
              <div className="text-[10px] text-warmwhite/50 font-mono truncate mt-0.5">
                Dept: {user?.department || "General Operations"}
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

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <header className="sticky top-0 z-30 h-16 bg-[#0A1220]/95 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between backdrop-blur-xl">
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
              <span className="hidden sm:inline font-mono">Vichaar Command</span>
              <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-warmwhite/60">
                Ctrl + K
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* If Founder, show direct access to VICHAAR.FOUNDERS */}
            {isUserFounder && (
              <Link
                href="/founders"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-bold font-mono transition-all shadow-sm"
              >
                <Crown className="w-3.5 h-3.5 text-citrus" />
                <span>VICHAAR.FOUNDERS ↗</span>
              </Link>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-warmwhite/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="hidden md:inline">SYSTEM STATUS: READY</span>
              <span className="md:hidden">READY</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
