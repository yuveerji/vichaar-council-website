"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import VichaarLogo from "@/components/VichaarLogo";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Calendar,
  ClipboardList,
  CreditCard,
  Ticket,
  Award,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
  Compass
} from "lucide-react";

interface Participant {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  institution?: string | null;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  role: string;
}

interface PortalClientLayoutProps {
  participant: Participant;
  children: React.ReactNode;
}

const navItems = [
  { name: "Overview", href: "/my-vichaar/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/my-vichaar/profile", icon: User },
  { name: "Event Finder", href: "/events", icon: Compass },
  { name: "My Registrations", href: "/my-vichaar/registrations", icon: ClipboardList },
  { name: "My Payments", href: "/my-vichaar/payments", icon: CreditCard },
  { name: "My Tickets & Passes", href: "/my-vichaar/tickets", icon: Ticket },
  { name: "My Certificates", href: "/my-vichaar/certificates", icon: Award },
  { name: "Submissions", href: "/my-vichaar/submissions", icon: FileText },
  { name: "Notifications", href: "/my-vichaar/notifications", icon: Bell },
  { name: "Account Settings", href: "/my-vichaar/settings", icon: Settings },
];

export default function PortalClientLayout({
  participant,
  children
}: PortalClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load sidebar collapse preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tvc_portal_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("tvc_portal_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/my-vichaar/auth/logout", { method: "POST" });
      router.push("/my-vichaar/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060D17] text-warmwhite flex selection:bg-citrus selection:text-[#070E1A]">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#0A1424] border-r border-white/10 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}
      >
        {/* Top Header / Branding */}
        <div className={`shrink-0 border-b border-white/10 flex items-center ${
          isCollapsed ? "justify-center p-3" : "justify-between p-4 sm:p-5"
        }`}>
          <Link
            href="/my-vichaar/dashboard"
            className={`flex items-center gap-3 group overflow-hidden ${
              isCollapsed ? "mx-auto justify-center" : ""
            }`}
            title="MY VICHAAR Dashboard"
          >
            <VichaarLogo
              variant="dashboard"
              className="shrink-0 transition-transform duration-300 group-hover:scale-105"
            />
            {!isCollapsed && (
              <div className="truncate">
                <span className="block text-[10px] tracking-[0.2em] uppercase text-warmwhite/60 font-medium">
                  THE VICHAAR COUNCIL
                </span>
                <span className="block text-base font-editorial font-bold text-white tracking-wider group-hover:text-gelato transition-colors">
                  MY VICHAAR
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 text-warmwhite/60 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Quick Card in Sidebar */}
        <div className="shrink-0">
          <Link
            href="/my-vichaar/profile"
            onClick={() => setMobileSidebarOpen(false)}
            className={`m-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center gap-3 transition-colors group block ${
              isCollapsed ? "p-2 justify-center" : "p-3"
            }`}
            title={`${participant.fullName} (@${participant.username})`}
          >
            <div className="h-10 w-10 rounded-full bg-[#1A2638] border border-white/15 flex items-center justify-center text-warmwhite/80 group-hover:border-citrus/40 group-hover:text-citrus transition-colors shrink-0 overflow-hidden relative">
              {participant.avatarUrl ? (
                <Image
                  src={participant.avatarUrl}
                  alt={participant.fullName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-citrus font-mono">
                  {participant.fullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-bold text-white truncate group-hover:text-citrus transition-colors">
                  {participant.fullName}
                </div>
                <div className="text-[11px] text-warmwhite/60 truncate font-mono">
                  @{participant.username}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    {participant.isEmailVerified ? "Verified Account" : "Participant"}
                  </span>
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Links — Dedicated Scrollable Smooth Area */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden scroll-smooth py-2 space-y-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,166,43,0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-citrus/40 [&::-webkit-scrollbar-thumb]:rounded-full ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/events" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5"
                } ${
                  isActive
                    ? "bg-citrus/15 text-citrus border border-citrus/30 shadow-sm font-bold"
                    : "text-warmwhite/70 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-citrus" : "text-warmwhite/60"}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions — Pinned Footer */}
        <div className={`shrink-0 border-t border-white/10 space-y-1.5 ${isCollapsed ? "p-2" : "p-3.5"}`}>
          {/* Collapsed Expand Toggle Helper (Visible when collapsed on desktop) */}
          {isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex w-full items-center justify-center p-2.5 rounded-xl text-xs text-citrus hover:bg-citrus/10 transition-colors border border-citrus/20"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          <Link
            href="/"
            title="Return to Council Site"
            className={`w-full flex items-center rounded-xl text-xs text-warmwhite/70 hover:text-white hover:bg-white/5 transition-colors border border-white/5 ${
              isCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2"
            }`}
          >
            {!isCollapsed && <span className="truncate">Council Homepage</span>}
            <ExternalLink className="w-3.5 h-3.5 text-warmwhite/40 shrink-0" />
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign Out of Portal"
            className={`w-full flex items-center rounded-xl text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors border border-transparent disabled:opacity-50 ${
              isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3.5 py-2"
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span className="truncate">{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {/* Top Navbar — Seamlessly Bridges Portal with Public Site */}
        <header className="sticky top-0 z-30 h-16 bg-[#070E1A]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-white/10 bg-white/5 text-warmwhite hover:text-citrus"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Collapse / Expand Toggle Button in Navbar */}
            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex items-center justify-center p-2 rounded-lg border border-white/10 bg-white/5 text-warmwhite/70 hover:text-citrus hover:bg-white/10 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Breadcrumb & Public Site Bridge Links */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden md:inline-flex items-center gap-1.5 text-xs text-warmwhite/70 hover:text-citrus transition-colors font-medium py-1 px-2.5 rounded-lg hover:bg-white/5 border border-white/5"
              >
                <span>← Main Website</span>
              </Link>

              <div className="h-4 w-[1px] bg-white/15 hidden md:block" />

              <nav className="hidden xl:flex items-center gap-4 text-xs font-sans text-warmwhite/60">
                <Link href="/events" className="hover:text-warmwhite transition-colors">
                  Event Finder
                </Link>
                <Link href="/initiatives" className="hover:text-warmwhite transition-colors">
                  Initiatives
                </Link>
                <Link href="/research" className="hover:text-warmwhite transition-colors">
                  Research
                </Link>
                <Link href="/about" className="hover:text-warmwhite transition-colors">
                  About Us
                </Link>
              </nav>

              <div className="text-xs uppercase tracking-[0.2em] text-citrus font-medium block xl:hidden">
                <span className="text-warmwhite font-bold">{pathname.split("/").pop()?.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Account Status Pill */}
            {participant.isEmailVerified ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified account</span>
              </span>
            ) : (
              <Link
                href="/my-vichaar/verify-email"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium px-3 py-1 bg-amber-950/60 border border-amber-500/30 rounded-full hover:bg-amber-900/40 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Email</span>
              </Link>
            )}

            {/* Profile Avatar Entry */}
            <Link
              href="/my-vichaar/profile"
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white/5 border border-white/10 hover:border-citrus/40 hover:bg-white/10 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-[#1A2638] border border-white/10 flex items-center justify-center text-xs text-warmwhite overflow-hidden relative">
                {participant.avatarUrl ? (
                  <Image
                    src={participant.avatarUrl}
                    alt={participant.fullName}
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-citrus font-mono">
                    {participant.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-white max-w-[120px] truncate hidden md:inline">
                {participant.fullName.split(" ")[0]}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content with Generous Bottom Spacing */}
        <main className="flex-1 p-4 sm:p-8 pb-28 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}