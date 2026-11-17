"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList, Calendar, MapPin, Ticket, CreditCard, ArrowRight, Loader2, CheckCircle2, Clock } from "lucide-react";

export default function ParticipantRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed">("all");

  useEffect(() => {
    async function loadRegistrations() {
      try {
        const res = await fetch("/api/my-vichaar/profile");
        const data = await res.json();
        if (res.ok) {
          setRegistrations(data.registrations || []);
        }
      } catch (e) {
        console.error("Error loading registrations:", e);
      } finally {
        setLoading(false);
      }
    }
    loadRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-citrus" />
      </div>
    );
  }

  const upcomingList = registrations.filter(
    (r) => new Date(r.event?.startDate || 0) >= new Date()
  );
  const completedList = registrations.filter(
    (r) => new Date(r.event?.startDate || 0) < new Date()
  );

  const displayedList =
    activeTab === "upcoming"
      ? upcomingList
      : activeTab === "completed"
      ? completedList
      : registrations;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-citrus font-semibold">
            PARTICIPATION RECORD
          </span>
          <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-wide mt-1">
            My Registrations
          </h1>
          <p className="text-xs text-warmwhite/60 mt-1">
            Track confirmed accreditations, pass statuses, and transaction details.
          </p>
        </div>

        <Link
          href="/events"
          className="px-5 py-2.5 rounded-xl bg-citrus hover:bg-[#FFA62B]/90 text-[#070E1A] font-bold text-xs uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <span>Explore More Events</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === "all"
              ? "bg-white/10 text-white border border-white/15"
              : "text-warmwhite/60 hover:text-white"
          }`}
        >
          All ({registrations.length})
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === "upcoming"
              ? "bg-white/10 text-white border border-white/15"
              : "text-warmwhite/60 hover:text-white"
          }`}
        >
          Upcoming ({upcomingList.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === "completed"
              ? "bg-white/10 text-white border border-white/15"
              : "text-warmwhite/60 hover:text-white"
          }`}
        >
          Completed ({completedList.length})
        </button>
      </div>

      {/* Registration List */}
      {displayedList.length > 0 ? (
        <div className="space-y-4">
          {displayedList.map((reg) => (
            <div
              key={reg.id}
              className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 hover:border-citrus/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] uppercase tracking-wider text-citrus font-semibold">
                      {reg.ticketCategory?.name || "Delegate Pass"}
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="text-xs font-mono text-warmwhite/60">
                      {reg.registrationNumber}
                    </span>
                  </div>
                  <h3 className="text-xl font-editorial font-bold text-white">
                    {reg.event?.title || "Council Event"}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      reg.paymentStatus === "SUCCESS"
                        ? "text-emerald-400 bg-emerald-950/60 border-emerald-500/30"
                        : "text-amber-300 bg-amber-950/60 border-amber-500/30"
                    }`}
                  >
                    {reg.paymentStatus === "SUCCESS" ? "Confirmed" : reg.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-4 text-xs text-warmwhite/70">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-citrus" />
                  <span>
                    {new Date(reg.event?.startDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-citrus" />
                  <span className="truncate">{reg.event?.city || "New Delhi"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-citrus" />
                  <span>₹{reg.totalAmount || "549"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-citrus" />
                  <span>Booked on {new Date(reg.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-warmwhite/50">
                  Venue: {reg.event?.venue}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href="/my-vichaar/tickets"
                    className="px-4 py-1.5 rounded-lg bg-citrus/15 hover:bg-citrus/25 text-citrus text-xs font-semibold tracking-wide transition-colors"
                  >
                    Digital Pass →
                  </Link>
                  <Link
                    href={`/events/${reg.event?.slug || "shabd-and-soch"}`}
                    className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors"
                  >
                    Event Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-12 text-center space-y-4">
          <ClipboardList className="w-12 h-12 text-warmwhite/30 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Registrations Found</h3>
          <p className="text-xs text-warmwhite/60 max-w-sm mx-auto">
            You do not have any registrations under this filter. Browse our upcoming debate festivals and academic conferences to participate.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-citrus text-[#070E1A] font-bold text-xs uppercase tracking-wider hover:bg-citrus/90 transition-all shadow-md"
          >
            <span>Browse Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
