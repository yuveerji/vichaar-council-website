import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import EventRegistrationChannels from "@/components/events/EventRegistrationChannels";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Award,
  Utensils,
  Music,
  FileText,
  Users,
  Compass,
  BadgeCheck,
  HelpCircle
} from "lucide-react";

interface RegisterPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug }
  });

  if (!event) {
    return { title: "Event Not Found | The Vichaar Council" };
  }

  return {
    title: `Register for ${event.title} | The Vichaar Council`,
    description: `Official delegate registration for ${event.title}. Secure your pass with instant confirmation.`
  };
}

export default async function EventRegisterPage({ params }: RegisterPageProps) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      tickets: {
        where: { isActive: true },
        orderBy: { price: "asc" }
      }
    }
  });

  if (!event || !event.isPublished) {
    notFound();
  }

  const delegatePerks = [
    {
      icon: Compass,
      title: "Round 1 & 2 Flipped Debates",
      category: "ACADEMIC ADMISSIONS",
      description: "Full competitive access to opening stance defense and signature side-flipped rebuttal rounds.",
      highlight: "Classes 7th to 12th"
    },
    {
      icon: Sparkles,
      title: "Motion of Entertainment (MoE)",
      category: "SIGNATURE SEGMENT",
      description: "High-energy interactive entertainment segment celebrating impromptu wit and creative expression.",
      highlight: "Interactive Forum"
    },
    {
      icon: Utensils,
      title: "Curated Lunch & Refreshments",
      category: "EXECUTIVE HOSPITALITY",
      description: "Networking lunch and artisanal refreshment breaks provided throughout the full conference day.",
      highlight: "All Meals Included"
    },
    {
      icon: Music,
      title: "Surprise Acoustic Jamming",
      category: "COUNCIL CULTURE",
      description: "Unwind post-deliberation with live acoustic music, open-mic socials, and Council celebration.",
      highlight: "Evening Social"
    },
    {
      icon: Award,
      title: "Council Deliberation Certificate",
      category: "VERIFIABLE CREDENTIAL",
      description: "Official validated certificate with permanent digital QR verification issued to your My Vichaar account.",
      highlight: "Permanent Record"
    },
    {
      icon: FileText,
      title: "Delegate Kit & Dossier",
      category: "CONFERENCE STATIONERY",
      description: "Personalised delegate lanyard pass, motion research backgrounder, and academic docket.",
      highlight: "Official Accreditation"
    }
  ];

  return (
    <div className="bg-warmwhite text-charcoal min-h-screen">
      {/* Header */}
      <section className="bg-navy text-warmwhite pt-32 pb-14 sm:pt-36 lg:pt-40 lg:pb-16 relative overflow-hidden border-b border-white/10">
        <div className="hero-grid absolute inset-0 opacity-30" />
        <div className="container-shell relative z-10 max-w-6xl">
          {/* Breadcrumb / Return Link */}
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-xs font-sans font-semibold tracking-wider text-citrus hover:text-gelato transition-colors uppercase mb-4 sm:mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Event Overview</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="eyebrow text-crimson font-sans">Official Admissions & Accreditation</span>
            <span className="text-white/30">•</span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-citrus/90">
              The Vichaar Council · Udaipur
            </span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white max-w-4xl">
            Register: {event.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-mutedgrey font-sans">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-citrus shrink-0" />
              <span>
                {new Date(event.startDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-citrus shrink-0" />
              <span>{event.venue}, {event.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-citrus shrink-0" />
              <span>Full-Day Discourse & Social Experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Registration Section */}
      <section className="py-10 sm:py-14 lg:py-18">
        <div className="container-shell max-w-6xl space-y-10">

          {/* =========================================================================
              PROMINENT FULL-WIDTH PERKS & INCLUSIONS SHOWCASE CARD (ABOVE FORM)
              ========================================================================= */}
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0F1D33] via-[#0A1424] to-[#070E1A] border-2 border-citrus/30 p-6 sm:p-8 lg:p-10 shadow-2xl text-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -right-24 -top-24 w-96 h-96 bg-citrus/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-crimson/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-citrus/20 border border-citrus/40 text-[10px] sm:text-[11px] font-bold font-mono tracking-widest text-citrus uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-citrus" />
                      <span>ALL-INCLUSIVE DELEGATE ACCREDITATION</span>
                    </span>
                    <span className="hidden sm:inline text-xs text-white/40">|</span>
                    <span className="hidden sm:inline text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Inclusive
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-bold text-white tracking-wide">
                    What Your Delegate Pass Includes
                  </h2>
                  <p className="text-xs sm:text-sm text-warmwhite/75 mt-1 max-w-2xl leading-relaxed">
                    Every registered student and delegation receives complete access to all academic rounds, social sessions, hospitality, and official credentials with zero hidden charges.
                  </p>
                </div>

                {/* Quick Fee Callout */}
                <div className="bg-[#101D35]/90 border border-white/15 rounded-2xl p-4 sm:p-5 shrink-0 text-left md:text-right backdrop-blur-md">
                  <div className="text-[10px] uppercase tracking-wider text-warmwhite/60 font-mono">Standard Pass</div>
                  <div className="text-2xl sm:text-3xl font-bold font-editorial text-citrus mt-0.5">₹549 <span className="text-xs font-sans text-warmwhite/60 font-normal">/ delegate</span></div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-1 flex items-center md:justify-end gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified Council Pricing
                  </div>
                </div>
              </div>

              {/* Perks Grid (Responsive 2 / 3 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pt-6 sm:pt-8">
                {delegatePerks.map((perk, idx) => {
                  const Icon = perk.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-[#0B1526]/80 hover:bg-[#101F38] border border-white/10 hover:border-citrus/40 rounded-2xl p-5 sm:p-6 transition-all duration-300 group flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-citrus/15 border border-citrus/30 flex items-center justify-center text-citrus group-hover:scale-110 transition-transform">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-warmwhite/60 group-hover:text-citrus group-hover:border-citrus/30 transition-colors">
                            {perk.highlight}
                          </span>
                        </div>

                        <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-citrus/90 font-semibold block mb-1">
                          {perk.category}
                        </span>

                        <h3 className="text-base sm:text-lg font-editorial font-bold text-white group-hover:text-citrus transition-colors leading-snug">
                          {perk.title}
                        </h3>

                        <p className="text-xs text-warmwhite/70 leading-relaxed mt-2 font-sans">
                          {perk.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Included with registration</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Guarantee Note */}
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-warmwhite/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-citrus shrink-0" />
                  <span>Transparent Non-Profit Model · Fees directly cover venue, materials, adjudicators, and catering.</span>
                </div>
                <div className="font-mono text-[11px] text-citrus">
                  Official Secretariat Docket · Udaipur
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              FULL-WIDTH REGISTRATION CHANNELS & MULTI-STEP APPLICATION FORM
              ========================================================================= */}
          <div className="w-full">
            <EventRegistrationChannels
              eventId={event.id}
              eventTitle={event.title}
              eventSlug={event.slug}
              tickets={event.tickets}
              eventStatus={event.status}
            />
          </div>

          {/* =========================================================================
              ADMISSIONS POLICY, SECURITY & INSTITUTIONAL SUPPORT FOOTER
              ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Admissions Policy */}
            <div className="border border-charcoal/15 bg-white p-6 sm:p-7 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-charcoal font-bold font-sans">
                <ShieldCheck className="w-5 h-5 text-citrus" />
                <span className="uppercase tracking-wider text-xs">Official Admissions & Pass Issuance Policy</span>
              </div>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Admissions are processed securely via Cashfree Payments or verified Direct Bank Transfer (NEFT/IMPS/UPI). Your unique registration code (e.g. <code className="bg-warmwhite px-1.5 py-0.5 rounded font-mono text-crimson font-bold">TVC-2026-XXXXX</code>) and digital pass with instant QR verification activate upon payment confirmation.
              </p>
              <div className="pt-2 border-t border-charcoal/10 flex items-center justify-between text-[11px] text-charcoal/60">
                <span>Instant email notification upon receipt</span>
                <span className="font-semibold text-emerald-700">Encrypted 256-bit SSL</span>
              </div>
            </div>

            {/* School & Group Inquiries */}
            <div className="border border-charcoal/15 bg-[#FAF9F5] p-6 sm:p-7 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-charcoal font-bold font-sans">
                <Users className="w-5 h-5 text-crimson" />
                <span className="uppercase tracking-wider text-xs">Institutional Delegations & Secretariat Support</span>
              </div>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Schools registering large delegations can use the <strong>Institutional Registration</strong> channel above to enroll all students simultaneously. For custom invoicing, school cheques, or transport queries, reach the Secretariat directly.
              </p>
              <div className="pt-2 border-t border-charcoal/10 flex items-center justify-between text-xs">
                <span className="text-charcoal/60">Email: <a href="mailto:events@thevichaarcouncil.in" className="text-crimson hover:underline font-semibold">events@thevichaarcouncil.in</a></span>
                <Link href="/contact" className="text-crimson hover:underline font-bold text-xs inline-flex items-center gap-1">
                  <span>Help Desk</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
