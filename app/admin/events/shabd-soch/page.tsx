import { notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import prisma from "@/lib/db";
import Link from "next/link";
import { Calendar, MapPin, Users, Ticket, CheckCircle2, Clock, Music, ArrowRight, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ShabdSochManagementPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) {
    notFound();
  }

  const event = await prisma.event.findFirst({
    where: {
      OR: [
        { slug: "shabd-and-soch" },
        { title: { contains: "SHABD & SOCH" } }
      ]
    },
    include: {
      tickets: true,
      registrations: {
        include: { ticketCategory: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!event) {
    return (
      <AdminLayout user={currentAdmin}>
        <div className="p-8 text-center text-warmwhite/60">
          SHABD & SOCH 2026 event record not found in database.
        </div>
      </AdminLayout>
    );
  }

  const confirmedRegistrations = event.registrations.filter((r) => r.paymentStatus === "SUCCESS");
  const pendingRegistrations = event.registrations.filter((r) => r.paymentStatus !== "SUCCESS");

  let phases: any[] = [];
  try {
    if (event.agendaJson) phases = JSON.parse(event.agendaJson);
  } catch {}

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-citrus bg-citrus/20 px-2 py-0.5 rounded border border-citrus/30">
                04 — PROGRAMMES & EVENTS
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">FLAGSHIP ASSEMBLY</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
              SHABD & SOCH: Management Centre
            </h1>
            <p className="text-xs text-warmwhite/70 mt-1">
              20 December 2026 · Udaipur, Rajasthan · Parliamentary & Flipped Debate + Recurring Jamming Sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/events/${event.slug || "shabd-and-soch"}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white font-mono uppercase tracking-wider transition-colors"
            >
              Public Page ↗
            </Link>
            <Link
              href={`/events/${event.slug || "shabd-and-soch"}/register`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-citrus hover:bg-citrus/90 text-navy text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md"
            >
              Live Register Form ↗
            </Link>
          </div>
        </div>

        {/* Quick Event Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-5">
            <span className="text-[10px] font-mono uppercase text-warmwhite/40 block">Total Capacity</span>
            <span className="font-editorial text-3xl font-bold text-white block mt-1">
              {event.capacity} seats
            </span>
            <span className="text-[10px] text-warmwhite/50 font-mono block mt-1">Classes 7th to 12th</span>
          </div>

          <div className="bg-[#0B1526] border border-emerald-500/20 rounded-2xl p-5">
            <span className="text-[10px] font-mono uppercase text-emerald-400 block">Confirmed Delegates</span>
            <span className="font-editorial text-3xl font-bold text-emerald-300 block mt-1">
              {confirmedRegistrations.length}
            </span>
            <span className="text-[10px] text-warmwhite/50 font-mono block mt-1">Accredited Passes</span>
          </div>

          <div className="bg-[#0B1526] border border-amber-500/20 rounded-2xl p-5">
            <span className="text-[10px] font-mono uppercase text-amber-400 block">Pending Verification</span>
            <span className="font-editorial text-3xl font-bold text-amber-300 block mt-1">
              {pendingRegistrations.length}
            </span>
            <span className="text-[10px] text-warmwhite/50 font-mono block mt-1">In review pipeline</span>
          </div>

          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-5">
            <span className="text-[10px] font-mono uppercase text-warmwhite/40 block">Ticket Tier</span>
            <span className="font-editorial text-3xl font-bold text-citrus block mt-1">
              ₹549
            </span>
            <span className="text-[10px] text-warmwhite/50 font-mono block mt-1">All 7 phases included</span>
          </div>
        </div>

        {/* 7 Chronological Event Phases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-mono tracking-wider text-citrus font-bold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Official 7-Phase Assembly Agenda</span>
            </h2>
            <span className="text-[10px] font-mono text-warmwhite/40">20 Dec 2026 · 09:30 AM to 04:00 PM</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phases.map((p, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0B1526] border border-white/10 space-y-2 hover:border-citrus/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-citrus/20 text-citrus border border-citrus/30">
                    {p.phase || `Phase ${idx + 1}`}
                  </span>
                  {p.title?.includes("Jamming") && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <Music className="w-3 h-3" /> SPECIAL SURPRISE
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white font-editorial">{p.title}</h4>
                <p className="text-xs text-warmwhite/70 leading-relaxed font-sans">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
