import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const evt = await prisma.event.findUnique({ where: { slug } });
  if (!evt) return { title: "Event Not Found" };
  return {
    title: `${evt.title} | The Vichaar Council Assemblies`,
    description: evt.summary
  };
}

export default async function EventDetailPage({ params }: Props) {
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

  // Parse structured data safely
  let agendaItems: any[] = [];
  try {
    if (event.agendaJson) agendaItems = JSON.parse(event.agendaJson);
  } catch {}

  let speakersList: any[] = [];
  try {
    if (event.speakersJson) speakersList = JSON.parse(event.speakersJson);
  } catch {}

  let faqsList: any[] = [];
  try {
    if (event.faqsJson) faqsList = JSON.parse(event.faqsJson);
  } catch {}

  const minPrice = event.tickets.length > 0 ? Math.min(...event.tickets.map((t) => t.price)) : 0;
  const isFree = minPrice === 0;

  return (
    <div className="bg-warmwhite text-charcoal">
      {/* Editorial Header */}
      <section className="bg-navy text-warmwhite pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="container-shell relative z-10 max-w-5xl">
          <Link
            href="/events"
            className="text-[10px] tracking-widest text-citrus hover:underline uppercase mb-6 inline-block font-semibold"
          >
            ← Back to All Assemblies & Events
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-citrus/20 border border-citrus/40 text-citrus text-[10px] font-bold tracking-widest uppercase rounded-xs">
              {event.categoryName || "Assembly"}
            </span>
            <span className="px-3 py-1 bg-white/10 text-mutedgrey text-[10px] font-bold tracking-widest uppercase rounded-xs">
              Format: {event.format.replace("_", " ")}
            </span>
            <span className="px-3 py-1 bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold tracking-widest uppercase rounded-xs">
              {event.status.replace("_", " ")}
            </span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl font-bold leading-tight">
            {event.title}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-mutedgrey leading-relaxed max-w-3xl">
            {event.summary}
          </p>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-mutedgrey">
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-citrus">Date</span>
              <span className="font-semibold text-warmwhite">
                {new Date(event.startDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-citrus">Venue</span>
              <span className="font-semibold text-warmwhite">{event.venue}, {event.city}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-citrus">Registration Fee</span>
              <span className="font-semibold text-warmwhite">
                {event.tickets.length > 0
                  ? Math.min(...event.tickets.map((t) => t.price)) === 0
                    ? "Complimentary"
                    : `₹${Math.min(...event.tickets.map((t) => t.price))} per delegate`
                  : "₹549 per delegate"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Details + Registration Card */}
      <section className="py-20">
        <div className="container-shell max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.9fr] lg:items-start">
            {/* Left Column: Description, Agenda, Speakers, FAQs */}
            <div className="space-y-16">
              {/* Cover Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-charcoal/15 shadow-sm">
                <Image
                  src={event.coverImage || "/assets/homepage_background.png"}
                  alt={event.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Event Description */}
              <div>
                <p className="eyebrow text-crimson mb-2">Docket Overview</p>
                <h2 className="font-editorial text-3xl font-bold text-charcoal mb-4">
                  About the Assembly
                </h2>
                <div className="prose prose-sm max-w-none text-charcoal/80 space-y-4 leading-relaxed">
                  {event.description.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Agenda Schedule */}
              {agendaItems.length > 0 && (
                <div className="border-t border-charcoal/10 pt-10">
                  <p className="eyebrow text-amalfi mb-2">Order of Proceedings</p>
                  <h2 className="font-editorial text-3xl font-bold text-charcoal mb-6">
                    Assembly Schedule
                  </h2>
                  <div className="space-y-4">
                    {agendaItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 border border-charcoal/10 bg-white rounded-xs">
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-crimson shrink-0 pt-0.5">
                          {item.phase || item.time}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-charcoal">{item.title}</h4>
                          <p className="text-xs text-charcoal/70 mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speakers & Faculty */}
              {speakersList.length > 0 && (
                <div className="border-t border-charcoal/10 pt-10">
                  <p className="eyebrow text-citrus mb-2">Distinguished Faculty & Guests</p>
                  <h2 className="font-editorial text-3xl font-bold text-charcoal mb-6">
                    Presiding Officers & Speakers
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {speakersList.map((speaker, idx) => (
                      <div key={idx} className="border border-charcoal/10 bg-white p-5 rounded-xs">
                        <span className="font-editorial text-lg font-bold text-charcoal block">{speaker.name}</span>
                        <span className="text-[10px] font-bold text-crimson uppercase tracking-wider block mt-0.5">{speaker.title}</span>
                        <p className="text-xs text-charcoal/70 mt-2">{speaker.bio}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs */}
              {faqsList.length > 0 && (
                <div className="border-t border-charcoal/10 pt-10">
                  <p className="eyebrow text-mutedgrey mb-2">Queries & Logistics</p>
                  <h2 className="font-editorial text-3xl font-bold text-charcoal mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {faqsList.map((faq, idx) => (
                      <div key={idx} className="border border-charcoal/10 bg-white p-5 rounded-xs">
                        <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                          Q: {faq.question}
                        </h4>
                        <p className="text-xs leading-relaxed text-charcoal/70">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation & Refund Terms Notice */}
              <div className="border border-citrus/40 bg-citrus/5 p-6 rounded-xs text-xs text-charcoal/80 space-y-2">
                <span className="font-bold uppercase tracking-wider text-charcoal block">
                  Official Cancellation & Refund Policy
                </span>
                <p>
                  Registrations for paid assemblies can be cancelled and refunded up to 7 calendar days before the event
                  start date. Verified refunds are credited via Cashfree to the original source account within 5–7 banking days.
                  For queries, reach out to <strong>{event.contactEmail}</strong>.
                </p>
              </div>
            </div>

            {/* Right Column: Event Pass Action Card (Anchored at starting point) */}
            <div>
              <div className="border border-charcoal/15 bg-white p-7 sm:p-8 rounded-sm shadow-md space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 text-[10px] font-sans font-semibold tracking-widest uppercase bg-navy text-citrus border border-citrus/30 rounded-xs">
                      {event.categoryName || "Assembly"}
                    </span>
                    <span className="px-2.5 py-1 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-xs bg-emerald-600 text-white">
                      {event.status.replace("_", " ")}
                    </span>
                  </div>

                  <span className="eyebrow text-crimson block mb-1">Official Delegate Pass</span>
                  <h3 className="font-editorial text-2xl font-bold text-charcoal">
                    {event.title}
                  </h3>
                  <p className="text-xs text-charcoal/70 mt-2 leading-relaxed">
                    Official admissions processed directly with instant receipt, confirmed registration credential, and badge issuance.
                  </p>
                </div>

                <div className="border-t border-b border-charcoal/10 py-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/60 uppercase tracking-wider text-[11px] font-semibold">Pass Type</span>
                    <span className="font-semibold text-charcoal">Delegate Pass (Classes 7th to 12th)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/60 uppercase tracking-wider text-[11px] font-semibold">Registration Fee</span>
                    <span className="font-editorial text-2xl font-bold text-charcoal">
                      {event.tickets.length > 0 && Math.min(...event.tickets.map((t) => t.price)) > 0
                        ? `₹${Math.min(...event.tickets.map((t) => t.price))}`
                        : "₹549"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/60 uppercase tracking-wider text-[11px] font-semibold">Format</span>
                    <span className="font-semibold text-charcoal">{event.format.replace("_", " ")}</span>
                  </div>
                </div>

                {/* Inclusions */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal block mb-2.5">
                    Pass Inclusions:
                  </span>
                  <ul className="space-y-2 text-xs text-charcoal/80">
                    <li className="flex items-center gap-2">
                      <span className="text-crimson font-bold">✓</span>
                      <span>Round 1 & Round 2 Flipped Debate Participation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-crimson font-bold">✓</span>
                      <span>MoE (Motion of Entertainment) & Socials</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-crimson font-bold">✓</span>
                      <span>Networking Lunch & Curated Refreshments</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-crimson font-bold">✓</span>
                      <span>Special Surprise: Recurring Jamming Session & Socials</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-crimson font-bold">✓</span>
                      <span>Official Certificate of Deliberation</span>
                    </li>
                  </ul>
                </div>

                {/* Primary Button & Channels */}
                <div className="pt-2 space-y-2.5">
                  <Link
                    href={`/events/${event.slug}/register`}
                    className="w-full inline-flex items-center justify-center gap-2.5 bg-citrus hover:bg-citrus-hover text-ink font-display font-bold text-xs sm:text-sm tracking-wider uppercase py-4 px-6 rounded-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,166,43,0.45)] active:scale-[0.98] shadow-md group"
                  >
                    <span>Register Here (All Channels)</span>
                    <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link
                    href={`/events/${event.slug}/register?type=institutional`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-navy hover:bg-slate text-warmwhite font-sans font-semibold text-xs tracking-wider uppercase py-3 px-4 rounded-xs border border-citrus/30 transition-all hover:border-citrus text-center"
                  >
                    <span>🏫 School &amp; Institutional Delegation Form →</span>
                  </Link>
                  <p className="text-[11px] text-center text-charcoal/60 mt-3 font-sans">
                    Official Admissions · Individual, Team &amp; Institutional Channels
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
