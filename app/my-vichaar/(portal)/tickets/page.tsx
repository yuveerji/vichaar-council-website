"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import VichaarLogo from "@/components/VichaarLogo";
import { Ticket, Calendar, MapPin, Download, Printer, CheckCircle2, Clock, Loader2, ArrowRight, X, Maximize2, Sparkles, ShieldCheck, AlertCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function ParticipantTicketsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enlargedPass, setEnlargedPass] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/my-vichaar/profile");
        const json = await res.json();
        if (res.ok) {
          setProfile(json.profile);
          setRegistrations(json.registrations || []);
        }
      } catch (e) {
        console.error("Error loading passes:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getVerifyUrl = (regNumber: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://thevichaarcouncil.in";
    return `${origin}/verify?reg=${encodeURIComponent(regNumber)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-citrus" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-citrus font-semibold">
            ADMISSIONS & ACCREDITATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-wide mt-1">
            Digital Event Passes
          </h1>
          <p className="text-xs text-warmwhite/60 mt-1">
            Official entry passes with instant QR verification for Council events and debate sessions.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-wider text-white transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-citrus" />
          <span>Print All Passes</span>
        </button>
      </div>

      {registrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {registrations.map((reg) => {
            const isConfirmed = reg.paymentStatus === "SUCCESS";

            return isConfirmed ? (
              /* CONFIRMED OFFICIAL DELEGATE PASS */
              <div
                key={reg.id}
                className="bg-gradient-to-b from-[#0F1D33] via-[#0B1526] to-[#070E1A] border-2 border-white/15 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden text-warmwhite group hover:border-citrus/50 transition-all"
              >
                {/* Subtle Watermark Emblem */}
                <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-5 pointer-events-none">
                  <Image
                    src="/assets/vichaar-logo.png"
                    alt="Watermark"
                    width={200}
                    height={200}
                  />
                </div>

                {/* Pass Top Banner */}
                <div className="flex items-start justify-between pb-5 sm:pb-6 border-b border-white/10 gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <VichaarLogo
                      variant="pass"
                      size={36}
                      className="shrink-0"
                    />
                    <div>
                      <span className="block text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-warmwhite/60 font-semibold">
                        THE VICHAAR COUNCIL
                      </span>
                      <span className="block text-xs sm:text-sm font-editorial font-bold text-citrus tracking-wider">
                        OFFICIAL DELEGATE PASS
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
                      ADMIT ONE
                    </span>
                  </div>
                </div>

                {/* Event Title */}
                <div className="py-5 sm:py-6">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-citrus font-medium">
                    {reg.ticketCategory?.name || "Delegate Pass (Classes 7th to 12th)"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-editorial font-bold text-white mt-1 leading-snug">
                    {reg.event?.title || "SHABD & SOCH"}
                  </h2>
                </div>

                {/* Delegate Info & QR Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-t border-b border-dashed border-white/15 items-center">
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-warmwhite/50">Delegate Name</div>
                      <div className="text-sm sm:text-base font-bold text-white">{profile?.fullName || reg.fullName}</div>
                      <div className="text-xs text-citrus/90 font-mono">@{profile?.username}</div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-warmwhite/50">Pass Registration Code</div>
                      <div className="text-xs font-mono font-bold text-white tracking-wider bg-white/5 px-2.5 py-1 rounded inline-block mt-0.5 border border-white/10">
                        {reg.registrationNumber}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-warmwhite/50">Affiliation</div>
                      <div className="text-xs text-warmwhite/80 truncate">
                        {profile?.institution || "Independent Delegate"}
                      </div>
                    </div>
                  </div>

                  {/* Real Scannable QR Code */}
                  <button
                    type="button"
                    onClick={() => setEnlargedPass(reg)}
                    className="group/qr flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-black text-center shadow-lg transition-transform hover:scale-105 cursor-pointer relative mx-auto sm:mx-0 w-fit sm:w-auto"
                    title="Click to enlarge QR pass"
                  >
                    <QRCodeSVG
                      value={getVerifyUrl(reg.registrationNumber)}
                      size={84}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: "/assets/vichaar-logo.png",
                        height: 18,
                        width: 18,
                        excavate: true
                      }}
                    />
                    <span className="text-[9px] font-mono font-bold tracking-tighter text-black/80 mt-1">
                      SCAN TO VERIFY
                    </span>
                    <span className="text-[8px] text-citrus font-bold uppercase tracking-wider mt-0.5 opacity-0 group-hover/qr:opacity-100 transition-opacity">
                      Enlarge ↗
                    </span>
                  </button>
                </div>

                {/* Pass Venue & Date Footer */}
                <div className="pt-5 flex items-center justify-between text-xs text-warmwhite/70">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-citrus" />
                    <span>
                      {new Date(reg.event?.startDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                    <MapPin className="w-3.5 h-3.5 text-citrus shrink-0" />
                    <span className="truncate">{reg.event?.city || "New Delhi"}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* PENDING VERIFICATION CARD (NOT YET CONFIRMED IN GSHEET) */
              <div
                key={reg.id}
                className="bg-gradient-to-b from-[#181308] via-[#0E1524] to-[#070E1A] border-2 border-amber-500/35 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden text-warmwhite group hover:border-amber-400/60 transition-all"
              >
                {/* Watermark Emblem */}
                <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-5 pointer-events-none">
                  <Image
                    src="/assets/vichaar-logo.png"
                    alt="Watermark"
                    width={200}
                    height={200}
                  />
                </div>

                {/* Pass Top Banner */}
                <div className="flex items-start justify-between pb-5 sm:pb-6 border-b border-white/10 gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <VichaarLogo
                      variant="pass"
                      size={36}
                      className="shrink-0"
                    />
                    <div>
                      <span className="block text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-warmwhite/60 font-semibold">
                        THE VICHAAR COUNCIL
                      </span>
                      <span className="block text-xs sm:text-sm font-editorial font-bold text-amber-300 tracking-wider">
                        REGISTRATION CARD
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>PENDING VERIFICATION</span>
                    </span>
                  </div>
                </div>

                {/* Event Title */}
                <div className="py-5 sm:py-6">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-400/90 font-medium">
                    {reg.ticketCategory?.name || "Delegate Pass (Classes 7th to 12th)"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-editorial font-bold text-white mt-1 leading-snug">
                    {reg.event?.title || "SHABD & SOCH"}
                  </h2>
                </div>

                {/* Delegate Info & Review Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-t border-b border-dashed border-white/15 items-center">
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-warmwhite/50">Delegate Name</div>
                      <div className="text-sm sm:text-base font-bold text-white">{profile?.fullName || reg.fullName}</div>
                      <div className="text-xs text-amber-300/80 font-mono">@{profile?.username}</div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-warmwhite/50">Pass Registration Code</div>
                      <div className="text-xs font-mono font-bold text-amber-200 tracking-wider bg-amber-950/40 px-2.5 py-1 rounded inline-block mt-0.5 border border-amber-500/30">
                        {reg.registrationNumber}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-warmwhite/50">Affiliation</div>
                      <div className="text-xs text-warmwhite/80 truncate">
                        {profile?.institution || "Independent Delegate"}
                      </div>
                    </div>
                  </div>

                  {/* Pending Lock Box instead of Active Scannable Barcode */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#09121F] border border-amber-500/30 text-center shadow-lg mx-auto sm:mx-0 w-fit sm:w-auto">
                    <Clock className="w-6 h-6 text-amber-400 animate-pulse mb-1" />
                    <span className="text-[9px] font-mono font-bold tracking-wider text-amber-300">
                      UTR IN REVIEW
                    </span>
                    <span className="text-[8px] text-warmwhite/50 leading-tight mt-1">
                      Admit QR unlocks on GSheet confirm
                    </span>
                  </div>
                </div>

                {/* Secretariat Verification Notice */}
                <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/25 text-xs text-amber-300/90 leading-relaxed">
                  <div className="font-semibold text-amber-200 flex items-center gap-1.5 mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Awaiting Master Database Confirmation</span>
                  </div>
                  Your registration is currently being verified against bank UTR records by The Vichaar Council Secretariat. Once confirmed in Google Sheets, your official barcode badge and "ADMIT ONE" pass will activate immediately.
                </div>

                {/* Pass Venue & Date Footer */}
                <div className="pt-4 flex items-center justify-between text-xs text-warmwhite/70">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {new Date(reg.event?.startDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{reg.event?.city || "New Delhi"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-12 text-center space-y-4">
          <Ticket className="w-12 h-12 text-warmwhite/30 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Active Digital Passes</h3>
          <p className="text-xs text-warmwhite/60 max-w-sm mx-auto">
            Once you register for a Council event, your official barcode delegate badge and entry pass will appear here instantly.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-citrus text-[#070E1A] font-bold text-xs uppercase tracking-wider hover:bg-citrus/90 transition-all shadow-md"
          >
            <span>Explore Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Enlarged High-Resolution QR Modal */}
      {enlargedPass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-[#070E1A] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center relative shadow-2xl space-y-5">
            <button
              onClick={() => setEnlargedPass(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-warmwhite transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-citrus font-bold">
                ADMISSIONS DESK SCANNER
              </span>
              <h3 className="text-xl font-editorial font-bold text-white mt-1">
                {enlargedPass.event?.title || "Council Event"}
              </h3>
              <p className="text-xs text-warmwhite/60">
                {enlargedPass.ticketCategory?.name || "Delegate Pass"}
              </p>
            </div>

            {/* High-Resolution QR SVG Badge */}
            <div className="p-4 rounded-2xl bg-white text-black inline-block mx-auto shadow-2xl">
              <QRCodeSVG
                value={getVerifyUrl(enlargedPass.registrationNumber)}
                size={180}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/assets/vichaar-logo.png",
                  height: 36,
                  width: 36,
                  excavate: true
                }}
              />
              <div className="mt-2 text-[10px] font-mono font-bold tracking-tight text-black/80">
                OFFICIAL DELEGATE QR PASS
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-base font-bold text-white">
                {profile?.fullName || enlargedPass.fullName}
              </div>
              <div className="text-xs font-mono font-bold text-citrus tracking-wider bg-white/5 py-1 px-3 rounded-lg inline-block border border-white/10">
                {enlargedPass.registrationNumber}
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-citrus hover:bg-citrus/90 text-navy text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
              <a
                href={getVerifyUrl(enlargedPass.registrationNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <span>Verify Link ↗</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
