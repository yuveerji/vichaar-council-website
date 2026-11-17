"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import VichaarLogo from "@/components/VichaarLogo";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  ChevronDown,
  LayoutDashboard,
  Ticket,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  Sparkles,
  Crown
} from "lucide-react";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Our Initiatives", href: "/initiatives" },
  { name: "Events", href: "/events" },
  { name: "Research & Publications", href: "/research" },
  { name: "Leadership", href: "/leadership" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" }
];

interface ParticipantUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role?: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [participant, setParticipant] = useState<ParticipantUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<{
    id: string;
    title: string;
    message: string;
    type: string;
    link?: string | null;
    isRead: boolean;
    createdAt: string;
  } | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isFounder = Boolean(
    participant &&
      (participant.role === "FOUNDER" ||
        participant.role === "ROOT" ||
        ["yuveerji", "chhatwani", "yuveer"].includes(participant.username?.toLowerCase() || "") ||
        ["yuveerchhatwani18@gmail.com", "chhatwaniyuveer@gmail.com", "founder@thevichaarcouncil.in"].includes(participant.email?.toLowerCase() || ""))
  );

  const isHomePage = pathname === "/";
  const showSolidHeader = !isHomePage || isScrolled;

  // Check authentication status on mount & pathname changes
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/my-vichaar/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.authenticated && data.user) {
            setParticipant(data.user);
            setUnreadCount(typeof data.unreadNotifications === "number" ? data.unreadNotifications : 0);
            setLatestNotification(data.latestNotification || null);
          } else if (isMounted) {
            setParticipant(null);
            setUnreadCount(0);
            setLatestNotification(null);
          }
        } else if (isMounted) {
          setParticipant(null);
          setUnreadCount(0);
          setLatestNotification(null);
        }
      } catch {
        if (isMounted) {
          setParticipant(null);
          setUnreadCount(0);
          setLatestNotification(null);
        }
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu automatically when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/my-vichaar/auth/logout", { method: "POST" });
      setParticipant(null);
      setUnreadCount(0);
      setLatestNotification(null);
      setUserDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 text-warmwhite print:hidden ${
        isHomePage && !isScrolled && !mobileMenuOpen
          ? "bg-transparent border-b border-transparent shadow-none"
          : "bg-[#070E1A]/95 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      }`}
    >
      <div className="relative z-10">
        <div className="container-shell flex min-h-[78px] sm:min-h-[86px] items-center justify-between gap-6 py-3">
          {/* Brand Logo & Wordmark — exactly matching proposed homepage hero */}
          <Link
            href="/"
            className="flex items-center gap-3 sm:gap-3.5 group shrink-0"
            aria-label="The Vichaar Council - Home"
          >
            <VichaarLogo
              variant="navbar"
              dropShadow
              className="h-11 w-11 sm:h-12 sm:w-12 transition-transform duration-300 group-hover:scale-105"
            />

            {/* Subtle Vertical Divider */}
            <div className="h-8 w-[1px] bg-white/20 hidden sm:block" />

            {/* Editorial Typography */}
            <div className="flex flex-col text-left">
              <span className="font-editorial text-[10px] xs:text-[11px] sm:text-[12px] tracking-[0.2em] text-warmwhite/90 uppercase leading-none font-medium">
                THE
              </span>
              <span className="font-editorial text-[15px] xs:text-[18px] sm:text-[20px] tracking-[0.05em] sm:tracking-[0.06em] text-warmwhite uppercase leading-tight font-semibold group-hover:text-gelato transition-colors">
                VICHAAR COUNCIL
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7" aria-label="Main Navigation">
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative py-1 text-[14px] xl:text-[15px] font-editorial transition-colors duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-warmwhite font-medium"
                      : "text-warmwhite/80 hover:text-warmwhite font-normal"
                  }`}
                >
                  <span>{item.name}</span>

                  {/* Clean Crimson Underline for Active, subtle hover reveal */}
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-crimson transition-all duration-300 ${
                      isActive
                        ? "opacity-100 scale-x-100"
                        : "opacity-0 scale-x-0 group-hover:opacity-80 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls: My Vichaar Profile Pill / Login & Mobile Menu */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {participant ? (
              /* Authenticated Participant Pill with Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`group flex items-center gap-2.5 py-1.5 pl-2 pr-3 rounded-full border transition-all duration-200 ${
                    userDropdownOpen || pathname.startsWith("/my-vichaar")
                      ? "border-citrus/60 bg-citrus/15 text-white shadow-[0_0_15px_rgba(255,166,43,0.25)]"
                      : "border-white/20 bg-white/[0.06] hover:bg-white/12 hover:border-citrus/40 text-warmwhite"
                  }`}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="h-7 w-7 rounded-full bg-navy border border-citrus/40 flex items-center justify-center text-[11px] font-bold text-citrus shrink-0 shadow-inner overflow-hidden relative">
                    {participant.avatarUrl ? (
                      <Image
                        src={participant.avatarUrl}
                        alt={participant.fullName}
                        width={28}
                        height={28}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(participant.fullName) || <User className="w-3.5 h-3.5" />
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-citrus ring-2 ring-[#070E1A]" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block max-w-[120px]">
                    <span className="block text-xs font-semibold text-white truncate leading-none">
                      {participant.fullName.split(" ")[0]}
                    </span>
                    <span className="block text-[10px] text-warmwhite/60 font-mono truncate leading-tight mt-0.5">
                      @{participant.username}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-warmwhite/70 transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180 text-citrus" : "group-hover:text-warmwhite"
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-[#09121F] border border-white/15 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in-50 zoom-in-95">
                    {/* Header in Dropdown */}
                    <div className="p-3 border-b border-white/10 mb-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-citrus font-bold">
                          MY VICHAAR PORTAL
                        </span>
                        {isFounder && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            FOUNDER
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-white mt-1 truncate">
                        {participant.fullName}
                      </div>
                      <div className="text-xs text-warmwhite/60 font-mono truncate">
                        @{participant.username}
                      </div>
                    </div>

                    {/* Founder Command Centre Priority Link */}
                    {isFounder && (
                      <div className="mb-1 pb-1 border-b border-amber-500/20">
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 hover:border-amber-400 hover:from-amber-500/25 transition-all shadow-[0_0_15px_rgba(255,166,43,0.15)] group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Crown className="w-4 h-4 text-citrus animate-pulse" />
                            <span className="font-editorial tracking-wide">VICHAAR.FOUNDERS</span>
                          </div>
                          <span className="text-[9px] font-mono text-amber-300/80 group-hover:text-amber-200">
                            CTRL+K
                          </span>
                        </Link>
                      </div>
                    )}

                    {/* Navigation Items */}
                    <div className="space-y-0.5">
                      <Link
                        href="/my-vichaar/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-warmwhite/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-citrus" />
                        <span>Portal Dashboard</span>
                      </Link>

                      <Link
                        href="/my-vichaar/tickets"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-warmwhite/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-citrus" />
                        <span>My Digital Passes</span>
                      </Link>

                      <Link
                        href="/my-vichaar/registrations"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-warmwhite/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ClipboardList className="w-4 h-4 text-citrus" />
                        <span>My Registrations</span>
                      </Link>

                      <Link
                        href="/my-vichaar/notifications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-warmwhite/80 hover:text-white hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Bell className="w-4 h-4 text-citrus" />
                          <span>Notifications & Status</span>
                        </div>
                        {unreadCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-citrus text-navy shadow-sm animate-pulse">
                            {unreadCount} new
                          </span>
                        ) : (
                          <span className="text-[10px] text-warmwhite/40 group-hover:text-warmwhite/70 transition-colors">
                            Updates
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/my-vichaar/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-warmwhite/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <User className="w-4 h-4 text-citrus" />
                        <span>Participant Profile</span>
                      </Link>

                      <Link
                        href="/my-vichaar/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-warmwhite/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-citrus" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    {/* Latest Status Notification Snippet */}
                    {latestNotification && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <Link
                          href={latestNotification.link || "/my-vichaar/notifications"}
                          onClick={() => setUserDropdownOpen(false)}
                          className="block p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors group"
                        >
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-citrus font-bold uppercase tracking-wider flex items-center gap-1.5">
                              {!latestNotification.isRead && (
                                <span className="h-1.5 w-1.5 rounded-full bg-citrus animate-ping" />
                              )}
                              Latest Status
                            </span>
                            <span className="text-warmwhite/40">
                              {new Date(latestNotification.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short"
                              })}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-white truncate group-hover:text-citrus transition-colors">
                            {latestNotification.title}
                          </div>
                          <div className="text-[11px] text-warmwhite/70 line-clamp-1 mt-0.5">
                            {latestNotification.message}
                          </div>
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-white/10 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated Quick Entrance */
              <Link
                href="/my-vichaar/login"
                className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/12 hover:border-citrus/50 text-warmwhite text-xs font-semibold tracking-wider transition-colors"
              >
                <User className="w-3.5 h-3.5 text-citrus" />
                <span>My Vichaar</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center h-10 w-10 rounded-md border border-white/15 bg-white/[0.06] hover:bg-white/10 text-warmwhite transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-citrus" /> : <Menu className="w-5 h-5 text-warmwhite" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#070E1A]/98 backdrop-blur-2xl px-5 sm:px-6 py-6 shadow-2xl animate-in slide-in-from-top-2 max-h-[calc(100vh-80px)] overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-1">
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between border-b border-white/5 py-3 text-lg font-editorial transition-colors ${
                    isActive
                      ? "text-citrus font-medium border-l-2 border-crimson pl-3"
                      : "text-warmwhite/80 hover:text-warmwhite hover:pl-2"
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-citrus/50">›</span>
                </Link>
              );
            })}

            {/* Mobile Portal Shortcut */}
            {participant ? (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                {isFounder && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/40 text-amber-300 font-bold text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-citrus" />
                      <span>VICHAAR.FOUNDERS COMMAND</span>
                    </div>
                    <span className="text-[9px] font-mono bg-amber-400/20 px-1.5 py-0.5 rounded">
                      ROOT
                    </span>
                  </Link>
                )}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-citrus font-bold">MY VICHAAR</span>
                    <span className="block text-sm font-bold text-white">{participant.fullName}</span>
                    <span className="block text-xs text-warmwhite/60 font-mono">@{participant.username}</span>
                  </div>
                  <Link
                    href="/my-vichaar/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-citrus text-navy text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-citrus/90 transition-colors"
                  >
                    Open
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Link
                    href="/my-vichaar/tickets"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-lg bg-white/5 text-warmwhite hover:text-white flex flex-col items-center justify-center gap-1 border border-white/5 text-center transition-colors"
                  >
                    <Ticket className="w-3.5 h-3.5 text-citrus" />
                    <span>Passes</span>
                  </Link>
                  <Link
                    href="/my-vichaar/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-lg bg-white/5 text-warmwhite hover:text-white flex flex-col items-center justify-center gap-1 border border-white/5 text-center relative transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5 text-citrus" />
                    <span>Updates</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-citrus" />
                    )}
                  </Link>
                  <Link
                    href="/my-vichaar/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-lg bg-white/5 text-warmwhite hover:text-white flex flex-col items-center justify-center gap-1 border border-white/5 text-center transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-citrus" />
                    <span>Profile</span>
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Sign Out of Portal
                </button>
              </div>
            ) : (
              /* When Logged Out: Touch-Friendly Portal Access */
              <div className="mt-5 pt-5 border-t border-white/10 space-y-2.5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-citrus font-bold">
                  MY VICHAAR DELEGATE PORTAL
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <Link
                    href="/my-vichaar/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-citrus text-navy text-xs font-bold uppercase tracking-wider shadow-md hover:bg-citrus/90 transition-colors text-center"
                  >
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/my-vichaar/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white/10 border border-white/15 text-warmwhite text-xs font-semibold tracking-wider hover:bg-white/15 transition-colors text-center"
                  >
                    <span>Register</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
