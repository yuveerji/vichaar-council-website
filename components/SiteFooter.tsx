"use client";

import Link from "next/link";
import Image from "next/image";
import VichaarLogo from "@/components/VichaarLogo";
import { ArrowRight, ArrowUpRight, MapPin, ArrowUp } from "lucide-react";

export default function SiteFooter() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full border-t border-white/10 bg-[#04060A] text-warmwhite relative z-10 font-sans selection:bg-citrus/30 overflow-hidden">
      {/* ─── Top Ambient Glow Lines & Radial Aura from zenvitra-beta ─── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-crimson via-citrus via-gelato to-amalfi opacity-90" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-citrus/40 via-seabreeze/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[850px] h-[280px] bg-amalfi/[0.08] blur-[150px] rounded-full pointer-events-none" />

      {/* ─── 1. TOP DISPATCH & INSTITUTIONAL COMMUNIQUÉ BAR (from zenvitra-beta) ─── */}
      <div className="border-b border-white/10 bg-gradient-to-r from-navy-surface/60 via-black/40 to-navy-surface/60 backdrop-blur-xl relative overflow-hidden">
        <div className="container-shell py-8 sm:py-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Heading & Value Proposition */}
            <div className="lg:col-span-7 space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-citrus/10 border border-citrus/25 text-citrus text-[10px] sm:text-[11px] font-mono tracking-wider uppercase shadow-[0_0_12px_rgba(255,166,43,0.15)] flex-wrap">
                <span className="h-1.5 w-1.5 rounded-full bg-citrus animate-ping shrink-0" />
                <span className="break-words-safe">INSTITUTIONAL COMMUNIQUÉ // THE VICHAAR COUNCIL</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display text-balance">
                Deliberations, Working Papers &amp; <span className="font-editorial italic font-normal text-gelato">Assembly Notifications</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed font-sans font-normal">
                Stay appraised of convened assemblies, parliamentary simulations, constitutional research briefs, and youth delegate admissions.
              </p>
            </div>

            {/* Right: Quick Action CTAs */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-stretch sm:items-center lg:justify-end gap-3">
              <Link
                href="/contact"
                className="group relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-citrus to-citrus-hover text-ink font-display font-bold text-xs tracking-wider uppercase transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,166,43,0.45)] active:scale-[0.98] whitespace-nowrap shrink-0 border border-citrus w-full sm:w-auto"
              >
                <span>GET IN TOUCH</span>
                <ArrowRight className="w-3.5 h-3.5 text-ink group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-warmwhite font-display font-semibold text-xs tracking-wider uppercase border border-white/15 transition-all duration-200 hover:scale-[1.02] w-full sm:w-auto"
              >
                <span>CALENDAR</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-citrus" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN DIRECTORY GRID ─── */}
      <div className="container-shell py-16 lg:py-20 relative z-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Institutional Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3.5 group mb-6" aria-label="The Vichaar Council">
              <VichaarLogo
                variant="footer"
                dropShadow
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <div>
                <span className="block font-display text-xl sm:text-2xl font-bold tracking-wide text-warmwhite group-hover:text-gelato transition-colors">
                  THE VICHAAR COUNCIL
                </span>
                <span className="block text-[9px] sm:text-[10px] font-sans font-semibold tracking-[0.16em] sm:tracking-[0.22em] text-gelato uppercase mt-1">
                  WHERE IDEAS EARN THEIR WEIGHT.
                </span>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-relaxed text-mutedgrey mb-6 font-sans font-normal">
              An independent youth-led intellectual and debating institution dedicated to rigorous public discourse,
              critical enquiry, constitutional scholarship, and transformative leadership across India and the Global South.
            </p>

            {/* Feature Badges utilizing all 4 colors wisely */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-seabreeze/10 border border-seabreeze/30 text-seabreeze rounded-full text-[11px] font-sans font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-seabreeze"></span> Non-Partisan Forum
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-citrus/10 border border-citrus/30 text-citrus rounded-full text-[11px] font-sans font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-citrus"></span> Youth-Led Deliberation
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gelato/15 border border-gelato/35 text-gelato rounded-full text-[11px] font-sans font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-gelato"></span> Academic Rigor
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amalfi/25 border border-amalfi/40 text-seabreeze rounded-full text-[11px] font-sans font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amalfi"></span> Constitutional Fidelity
              </span>
            </div>

            {/* Official Address */}
            <div className="mt-6 flex items-start gap-2.5 text-xs text-mutedgrey font-sans">
              <MapPin className="w-4 h-4 text-citrus shrink-0 mt-0.5" />
              <div>
                <p className="text-warmwhite font-medium text-sm">The Vichaar Council</p>
                <p className="text-neutral-400">Udaipur, Rajasthan, India</p>
              </div>
            </div>
          </div>

          {/* Institutional Directory (with zenvitra-beta hover translation) */}
          <div>
            <p className="font-display uppercase text-xs tracking-widest text-citrus mb-4 font-bold">Institutional</p>
            <ul className="space-y-3 text-sm text-mutedgrey">
              <li>
                <Link href="/about" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-citrus/40 group-hover:text-citrus transition-colors">›</span>
                  <span>About the Council</span>
                </Link>
              </li>
              <li>
                <Link href="/initiatives" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-citrus/40 group-hover:text-citrus transition-colors">›</span>
                  <span>Our Initiatives</span>
                </Link>
              </li>
              <li>
                <Link href="/leadership" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-citrus/40 group-hover:text-citrus transition-colors">›</span>
                  <span>Council Leadership</span>
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-citrus/40 group-hover:text-citrus transition-colors">›</span>
                  <span>Visual Archive</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-citrus/40 group-hover:text-citrus transition-colors">›</span>
                  <span>Institutional Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Programmes & Research */}
          <div>
            <p className="font-display uppercase text-xs tracking-widest text-seabreeze mb-4 font-bold">Engagements</p>
            <ul className="space-y-3 text-sm text-mutedgrey">
              <li>
                <Link href="/events" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-seabreeze/40 group-hover:text-seabreeze transition-colors">›</span>
                  <span>Upcoming Assemblies</span>
                </Link>
              </li>
              <li>
                <Link href="/initiatives" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-seabreeze/40 group-hover:text-seabreeze transition-colors">›</span>
                  <span>Parliamentary Simulation</span>
                </Link>
              </li>
              <li>
                <Link href="/research" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-seabreeze/40 group-hover:text-seabreeze transition-colors">›</span>
                  <span>Policy Working Papers</span>
                </Link>
              </li>
              <li>
                <Link href="/research" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-seabreeze/40 group-hover:text-seabreeze transition-colors">›</span>
                  <span>Discourse India Journal</span>
                </Link>
              </li>
              <li>
                <Link href="/events" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-seabreeze/40 group-hover:text-seabreeze transition-colors">›</span>
                  <span>Delegate Registrations</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div>
            <p className="font-display uppercase text-xs tracking-widest text-gelato mb-4 font-bold">Governance & Legal</p>
            <ul className="space-y-3 text-sm text-mutedgrey">
              <li>
                <Link href="/privacy-policy" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-gelato/40 group-hover:text-gelato transition-colors">›</span>
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-gelato/40 group-hover:text-gelato transition-colors">›</span>
                  <span>Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-gelato/40 group-hover:text-gelato transition-colors">›</span>
                  <span>Cancellation & Refund</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="group flex items-center gap-1.5 hover:text-warmwhite hover:translate-x-1.5 transition-all duration-200">
                  <span className="text-[10px] text-gelato/40 group-hover:text-gelato transition-colors">›</span>
                  <span>Grievance Redressal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── 3. INSTITUTIONAL ADDRESS BAR ─── */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-mutedgrey font-sans">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-citrus shrink-0" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-warmwhite font-medium">The Vichaar Council</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-300">Udaipur, Rajasthan, India</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 text-xs">
            <Link href="/contact" className="hover:text-citrus transition-colors flex items-center gap-1 font-sans">
              <span>Contact Us</span>
              <span className="text-[10px]">↗</span>
            </Link>
          </div>
        </div>

        {/* ─── 4. BOTTOM COPYRIGHT & BACK TO TOP BAR ─── */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] tracking-wider text-mutedgrey/80 font-sans">
          <p>© {new Date().getFullYear()} THE VICHAAR COUNCIL. All rights reserved.</p>
          <p className="font-editorial italic text-gelato text-sm">
            &ldquo;Where Ideas Earn Their Weight.&rdquo;
          </p>
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-1.5 text-neutral-400 hover:text-citrus transition-colors py-1 px-3 rounded-full hover:bg-white/[0.05] border border-transparent hover:border-white/10"
            aria-label="Scroll back to top"
          >
            <span className="text-[10px] font-display uppercase tracking-widest">Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
