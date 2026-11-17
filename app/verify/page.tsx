"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import VichaarLogo from "@/components/VichaarLogo";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Ticket,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Award
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const regNo = searchParams.get("reg") || searchParams.get("code") || searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!regNo) {
      setError("No registration code was provided for accreditation verification.");
      setLoading(false);
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/verify?reg=${encodeURIComponent(regNo || "")}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Accreditation record could not be verified.");
        } else {
          setData(json.accreditation);
        }
      } catch (err: any) {
        setError(err.message || "Failed to reach verification registry.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [regNo]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-10 h-10 animate-spin text-citrus mb-4" />
        <h2 className="text-xl font-editorial font-bold text-white">
          Reconciling Council Credentials...
        </h2>
        <p className="text-xs text-warmwhite/60 mt-2 max-w-sm">
          Verifying digital accreditation hash against the official Secretariat Roll.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto bg-[#0A1320] border border-red-500/30 rounded-2xl p-8 text-center text-warmwhite shadow-2xl">
        <div className="h-16 w-16 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-red-400 font-bold">
          SECURITY PROTOCOL / INVALID
        </div>
        <h1 className="text-2xl font-editorial font-bold text-white mt-1">
          Accreditation Unverified
        </h1>
        <p className="text-xs text-warmwhite/70 mt-3 leading-relaxed">
          {error || "The supplied credential code does not match an active delegate pass in The Vichaar Council registry."}
        </p>

        <div className="mt-6 pt-6 border-t border-white/10 flex justify-center gap-4">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Visit Council Portal
          </Link>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl bg-citrus hover:bg-citrus/90 text-navy text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Contact Secretariat
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = data.paymentStatus === "SUCCESS";

  return (
    <div className="max-w-xl mx-auto">
      {/* Official Certificate Card */}
      <div className="bg-[#070E1A] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-warmwhite">
        <div className="absolute top-0 right-0 w-64 h-64 bg-citrus/10 rounded-full blur-3xl pointer-events-none" />

        {/* Council Watermark Header */}
        <div className="border-b border-white/15 pb-6 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VichaarLogo
              variant="auth"
              size={44}
              className="shrink-0"
            />
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-citrus">
                OFFICIAL ACCREDITATION ROLL
              </div>
              <div className="text-lg font-editorial font-bold text-white tracking-wide">
                THE VICHAAR COUNCIL
              </div>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                isConfirmed
                  ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                  : "bg-amber-950/80 border border-amber-500/40 text-amber-300"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isConfirmed ? "Accredited Pass" : "Pending Payment"}</span>
            </span>
          </div>
        </div>

        {/* Delegate Identity & Real Scannable QR Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center py-2">
          <div className="sm:col-span-2 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-warmwhite/50 block">
                Accredited Delegate
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                {data.delegateName}
              </h2>
              {data.username && (
                <div className="text-xs font-mono text-citrus font-semibold">
                  @{data.username}
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-warmwhite/50 block">
                Registration Code
              </span>
              <span className="inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-sm font-bold text-white tracking-wider mt-0.5">
                {data.registrationNumber}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-warmwhite/50 block">
                Representing Institution
              </span>
              <span className="text-xs text-warmwhite/90 font-medium">
                {data.institution}
              </span>
            </div>
          </div>

          {/* Scannable QR SVG badge */}
          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white text-black text-center shadow-2xl">
            <QRCodeSVG
              value={typeof window !== "undefined" ? window.location.href : `https://thevichaarcouncil.in/verify?reg=${data.registrationNumber}`}
              size={110}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "/assets/vichaar-logo.png",
                height: 22,
                width: 22,
                excavate: true
              }}
            />
            <span className="text-[9px] font-mono font-bold tracking-tight text-black/80 mt-1.5 uppercase">
              SCAN TO RE-VERIFY
            </span>
          </div>
        </div>

        {/* Event Specification Details */}
        <div className="mt-6 pt-6 border-t border-white/15 space-y-3">
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-citrus block mb-1">
              CONFERENCE ASSEMBLY & VENUE
            </span>
            <div className="text-lg font-editorial font-bold text-white">
              {data.eventTitle}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-warmwhite/80">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-citrus" />
                {new Date(data.eventDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-citrus" />
                {data.venue}, {data.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-citrus" />
                {data.ticketTier}
              </span>
            </div>
          </div>
        </div>

        {/* Secretariat Seal Footer */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-warmwhite/50">
          <div>
            <span className="block font-semibold text-warmwhite/80">The Secretariat of The Vichaar Council</span>
            <span>Cryptographic Digital Admission Pass Verification</span>
          </div>
          <div className="text-right font-mono">
            <span>Issued: {new Date(data.issuedAt).toLocaleDateString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#03060C] text-warmwhite pt-32 sm:pt-40 pb-24 px-4 sm:px-6">
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-citrus" />
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
