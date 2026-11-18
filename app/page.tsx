import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import ContactForm from "@/components/forms/ContactForm";
import NewsletterForm from "@/components/forms/NewsletterForm";
import { ArrowRight, ArrowUpRight, BookOpen, MessageSquare, Scale, Globe, Award, Sparkles, MapPin, Mail, Phone, Clock } from "lucide-react";

export const revalidate = 60;

const fivePillars = [
  {
    title: "DEBATE",
    slogan: "The courage to question.",
    description: "Challenging orthodoxy through structured parliamentary argumentation, empirical cross-examination, and rhetorical precision.",
    href: "/initiatives",
    color: "text-citrus",
    hoverColor: "group-hover:text-citrus",
    iconSrc: "/assets/pillars/debate.png"
  },
  {
    title: "DIALOGUE",
    slogan: "The willingness to listen.",
    description: "Cultivating principled civil discourse across ideological boundaries, anchored in mutual listening and epistemic modesty.",
    href: "/about",
    color: "text-seabreeze",
    hoverColor: "group-hover:text-seabreeze",
    iconSrc: "/assets/pillars/dialogue.png"
  },
  {
    title: "RESEARCH",
    slogan: "The pursuit of knowledge.",
    description: "Authoring peer-reviewed policy working papers, constitutional commentaries, and data-driven legislative briefs.",
    href: "/research",
    color: "text-gelato",
    hoverColor: "group-hover:text-gelato",
    iconSrc: "/assets/pillars/research.png"
  },
  {
    title: "DIPLOMACY",
    slogan: "The understanding of differences.",
    description: "Simulating multilateral conclaves, treaty drafting, and strategic dispute resolution to discover sustainable common ground.",
    href: "/initiatives",
    color: "text-seabreeze",
    hoverColor: "group-hover:text-seabreeze",
    iconSrc: "/assets/pillars/diplomacy.png"
  },
  {
    title: "LEADERSHIP",
    slogan: "The responsibility to create impact.",
    description: "Equipping emerging public policy scholars and youth leaders with ethical stewardship, institutional decorum, and civic courage.",
    href: "/leadership",
    color: "text-gelato",
    hoverColor: "group-hover:text-citrus",
    iconSrc: "/assets/pillars/leadership.png"
  }
];

export default async function HomePage() {
  const [featuredInitiatives, upcomingEvents, latestPublications, leadershipPreview, galleryImages] = await Promise.all([
    prisma.initiative.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: "asc" },
      take: 3
    }),
    prisma.event.findMany({
      where: { isPublished: true },
      include: { tickets: true },
      orderBy: { startDate: "asc" },
      take: 4
    }),
    prisma.publication.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3
    }),
    prisma.leadershipProfile.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: "asc" },
      take: 4
    }),
    prisma.galleryImage.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: "asc" },
      take: 6
    })
  ]);

  // Find a designated featured event if available
  const featuredEvent = upcomingEvents.find((e) => e.isFeatured) || upcomingEvents[0] || null;

  return (
    <div className="bg-warmwhite text-charcoal">
      {/* =========================================================================
          SECTION 03 — HERO SECTION
          - Seamless transparent navbar overhead
          - Authentic background with Parliament, podium, microphones, red diagonal stripes,
            and the official emblem integrated on the podium face
          - Royal Classical Typography (Bodoni Moda & Cormorant Garamond)
          - Bottom Five Pillars Dock
         ========================================================================= */}
      <section className="relative min-h-[760px] lg:min-h-[900px] xl:min-h-[940px] bg-navy-deep text-warmwhite overflow-hidden flex flex-col justify-between">
        {/* Full-bleed Cinematic Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/homepage_background.png"
            alt="The Vichaar Council Assembly Chamber"
            fill
            priority
            className="object-cover object-right lg:object-center filter brightness-[0.92] contrast-105"
          />
          {/* Soft dark vignette on left side to ensure royal typography is crisp and readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/75 to-transparent lg:w-[58%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-navy-deep/40" />
        </div>

        {/* Hero Left Content Container (pt-32+ to flow beneath the transparent navbar) */}
        <div className="container-shell relative z-10 pt-36 sm:pt-44 lg:pt-48 pb-14">
          <div className="max-w-2xl">
            {/* Eyebrow: Sea Breeze text with Citrus Zest divider rules */}
            <div className="flex flex-wrap items-center gap-2.5 text-[10px] sm:text-xs font-sans font-semibold tracking-[0.14em] sm:tracking-[0.24em] text-seabreeze uppercase mb-5 sm:mb-6">
              <span className="w-6 sm:w-8 h-[1px] bg-citrus/60 hidden sm:inline-block" />
              <span className="break-words-safe">DIALOGUE · DEBATE · RESEARCH · IMPACT</span>
              <span className="w-6 sm:w-8 h-[1px] bg-citrus/60 hidden sm:inline-block" />
            </div>

            {/* Primary Display Headline — Bodoni Moda 700 with Crimson Accent */}
            <h1 className="font-display text-4xl xs:text-5xl sm:text-7xl lg:text-[96px] xl:text-[104px] font-bold leading-[0.95] sm:leading-[0.92] tracking-tight text-warmwhite break-words-safe">
              THE<br />
              <span className="text-crimson font-bold">VICHAAR</span><br />
              COUNCIL
            </h1>

            {/* Official Tagline — Cormorant Garamond 500 Italic in Cream Gelato */}
            <p className="font-editorial italic font-medium text-xl sm:text-3xl lg:text-4xl text-gelato tracking-wide mt-4 sm:mt-5 text-balance">
              Where Ideas Earn Their Weight.
            </p>

            {/* Supporting Institutional Description — Manrope 400 */}
            <p className="mt-4 sm:mt-5 text-xs sm:text-base leading-relaxed text-mutedgrey/90 max-w-lg font-sans font-normal">
              An independent youth-led institution for critical thinking, meaningful debate and lasting impact.
            </p>

            {/* Primary & Secondary Action Buttons (Citrus Zest + Amalfi Tile / Sea Breeze) with zenvitra-beta hover scale & royal Bodoni typography */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-3 border border-citrus bg-citrus px-6 sm:px-8 py-3.5 text-xs font-display font-bold tracking-[0.18em] text-ink transition-all duration-300 hover:scale-[1.03] hover:border-gelato hover:bg-gelato hover:shadow-[0_0_25px_rgba(255,166,43,0.45)] active:scale-[0.98] uppercase rounded-xs shadow-gold group w-full sm:w-auto text-center"
              >
                <span>EXPLORE OUR EVENTS</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">&gt;</span>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 border border-seabreeze/40 bg-amalfi/30 backdrop-blur-sm px-6 py-3.5 text-xs font-display font-bold tracking-[0.16em] text-seabreeze transition-all duration-300 hover:scale-[1.03] hover:bg-amalfi hover:text-warmwhite hover:border-amalfi hover:shadow-[0_0_20px_rgba(159,226,191,0.25)] active:scale-[0.98] uppercase rounded-xs w-full sm:w-auto text-center"
              >
                <span>DISCOVER THE COUNCIL</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Horizontal Five Pillars Dock (All 4 Institutional Colors + Crimson) */}
        <div className="relative z-10 border-t border-white/20 bg-navy-deep/85 backdrop-blur-md">
          {/* Central 4-Point Star Ornament in Cream Gelato */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-navy-deep border border-gelato/60 px-2 py-0.5 rounded-full shadow-lg text-gelato hidden sm:flex items-center justify-center">
            <svg className="w-4 h-4 fill-gelato" viewBox="0 0 24 24">
              <polygon points="12,2 14.5,9.5 22,12 14.5,14.5 12,22 9.5,14.5 2,12 9.5,9.5" />
            </svg>
          </div>

          <div className="container-shell">
            <div className="grid grid-cols-2 sm:grid-cols-5 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-center py-5 sm:py-7">
              {fivePillars.map((pillar) => (
                <Link
                  key={pillar.title}
                  href={pillar.href}
                  className="flex flex-col items-center justify-center p-3 group transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="relative mb-2.5 h-8 w-8 sm:h-9 sm:w-9 transition-transform duration-200 group-hover:scale-110">
                    <Image
                      src={pillar.iconSrc}
                      alt={pillar.title}
                      width={36}
                      height={36}
                      className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(201,162,85,0.4)]"
                    />
                  </div>
                  <span className={`font-display text-xs sm:text-sm font-semibold tracking-[0.16em] sm:tracking-[0.2em] text-warmwhite ${pillar.hoverColor} transition-colors uppercase`}>
                    {pillar.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04 — INSTITUTIONAL INTRODUCTION
          Visual Environment: Cream / Parchment
          "AN INSTITUTION BUILT AROUND THE POWER OF IDEAS."
         ========================================================================= */}
      <section className="parchment-texture border-b border-parchment-dark/60 py-24 lg:py-32">
        <div className="container-shell">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="eyebrow text-crimson mb-3 font-sans">01 / The Council</p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-charcoal leading-tight">
                Ideas deserve a space.<br />
                <span className="text-amalfi italic font-editorial font-normal">Perspectives deserve a voice.</span>
              </h2>
              
              {/* 4-Color Institutional Accent Line */}
              <div className="flex items-center gap-1.5 mt-6">
                <span className="w-10 h-[2px] bg-crimson" />
                <span className="w-8 h-[2px] bg-citrus" />
                <span className="w-6 h-[2px] bg-gelato" />
                <span className="w-10 h-[2px] bg-amalfi" />
              </div>

              {/* 4 Institutional Pillars Badges */}
              <div className="grid grid-cols-2 gap-2.5 mt-8">
                <div className="p-3 bg-amalfi/10 border border-amalfi/25 rounded-xs">
                  <span className="text-[10px] font-bold text-amalfi uppercase block tracking-wider font-sans">Evidentiary</span>
                  <span className="text-xs font-semibold text-charcoal block mt-0.5 font-sans">Empirical Proof</span>
                </div>
                <div className="p-3 bg-citrus/10 border border-citrus/30 rounded-xs">
                  <span className="text-[10px] font-bold text-citrus-hover uppercase block tracking-wider font-sans">Deliberative</span>
                  <span className="text-xs font-semibold text-charcoal block mt-0.5 font-sans">Parliamentary Order</span>
                </div>
                <div className="p-3 bg-seabreeze/15 border border-seabreeze/40 rounded-xs">
                  <span className="text-[10px] font-bold text-amalfi uppercase block tracking-wider font-sans">Epistemic</span>
                  <span className="text-xs font-semibold text-charcoal block mt-0.5 font-sans">Nuanced Truth</span>
                </div>
                <div className="p-3 bg-gelato/25 border border-gelato/60 rounded-xs">
                  <span className="text-[10px] font-bold text-charcoal uppercase block tracking-wider font-sans">Diplomatic</span>
                  <span className="text-xs font-semibold text-charcoal block mt-0.5 font-sans">Constructive Accord</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-charcoal/85 text-base sm:text-lg leading-relaxed font-sans font-normal pt-2">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
                AN INSTITUTION BUILT AROUND THE POWER OF IDEAS.
              </h3>
              <p>
                The Vichaar Council was convened to address a deepening vacuum in contemporary civic discourse:
                the retreat of thoughtful, evidence-led enquiry in favor of polarization and algorithmic outrage.
              </p>
              <p className="text-base text-charcoal/80 leading-relaxed font-normal">
                Operating as an independent, non-partisan institution, the Council orchestrates high-stakes parliamentary simulations,
                constitutional colloquia, and rigorous policy research fellowships. We bring together India’s most promising collegiate thinkers,
                jurists, and youth leaders to confront national dilemmas with scholarly gravity.
              </p>
              <p className="text-base text-charcoal/80 leading-relaxed font-normal">
                Here, dialogue is not an arena for partisan point-scoring, but a disciplined crucible where competing convictions are tested,
                refined, and elevated through intellectual accountability.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-xs font-sans font-semibold tracking-widest text-crimson hover:text-amalfi transition-colors uppercase"
                >
                  <span>READ OUR STORY</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 05 — THE FIVE PILLARS (EXPANDED DEDICATED SECTION)
          Visual Environment: Deep Navy (#101C32)
         ========================================================================= */}
      <section className="bg-navy-deep text-warmwhite py-24 lg:py-32 border-b border-navy-border relative overflow-hidden">
        {/* Subtle radial aura */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-amalfi/10 blur-[140px] pointer-events-none rounded-full" />
        
        <div className="container-shell relative z-10">
          <div className="max-w-2xl mb-16">
            <p className="eyebrow text-citrus mb-2 font-sans">02 / Institutional Foundations</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-warmwhite">
              The Five Pillars
            </h2>
            <p className="mt-4 text-sm sm:text-base text-mutedgrey leading-relaxed font-sans font-normal">
              Five deliberative commitments shaping every debate, assembly, and research initiative convened by the Council.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {fivePillars.map((pillar, idx) => (
              <div
                key={pillar.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-sm border border-white/10 bg-navy-surface/60 p-6 sm:p-7 transition-all duration-300 hover:border-citrus hover:bg-navy-surface/90"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-10 w-10 relative">
                      <Image
                        src={pillar.iconSrc}
                        alt={pillar.title}
                        width={40}
                        height={40}
                        className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(201,162,85,0.4)]"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-white/30">0{idx + 1}</span>
                  </div>

                  <h3 className="font-display text-xl font-bold tracking-wider text-warmwhite group-hover:text-citrus transition-colors uppercase">
                    {pillar.title}
                  </h3>
                  <p className="font-editorial italic text-gelato text-sm mt-1 mb-3">
                    {pillar.slogan}
                  </p>
                  <p className="text-xs text-mutedgrey leading-relaxed font-sans font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <Link
                    href={pillar.href}
                    className="inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold tracking-wider text-seabreeze group-hover:text-citrus transition-colors uppercase"
                  >
                    <span>Examine Docket</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 06 — OUR PHILOSOPHY / MANIFESTO
          Visual Environment: Dramatic Crimson / Deep Cherry (#160608)
         ========================================================================= */}
      <section className="bg-[#160608] text-warmwhite py-28 lg:py-36 border-y border-crimson/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,31,36,0.12)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="container-shell relative z-10 max-w-4xl text-center mx-auto">
          <p className="eyebrow text-citrus mb-6 font-sans">03 / Institutional Manifesto</p>
          
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-warmwhite leading-tight uppercase tracking-tight">
            WE DO NOT BELIEVE EVERY CONVERSATION NEEDS A WINNER.<br />
            <span className="text-citrus mt-2 block">WE BELIEVE IT NEEDS SUBSTANCE.</span>
          </h2>

          <div className="w-16 h-[2px] bg-crimson mx-auto my-8" />

          <p className="font-editorial italic text-2xl sm:text-3xl lg:text-4xl text-gelato leading-relaxed max-w-3xl mx-auto font-normal">
            &ldquo;We believe that the strength of an idea lies not in how loudly it is expressed, but in how thoughtfully it withstands examination.&rdquo;
          </p>

          <p className="mt-8 text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed font-sans font-normal">
            In an era dominated by algorithmic amplification, soundbites, and polarization, The Vichaar Council stands as an intellectual sanctuary for nuanced deliberation. We reject performative outrage in favour of measured analysis, where young minds explore public questions with gravity, courtesy, and intellectual humility.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 border border-citrus bg-citrus px-8 py-3.5 text-xs font-display font-bold tracking-[0.18em] text-ink transition-all duration-300 hover:bg-gelato hover:border-gelato uppercase rounded-xs shadow-gold"
            >
              <span>EXPLORE THE COUNCIL MANIFESTO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 07 — ABOUT THE COUNCIL
          Visual Environment: Cream / Parchment (#FDFBF7)
         ========================================================================= */}
      <section className="bg-[#FDFBF7] py-24 lg:py-32 border-b border-charcoal/10">
        <div className="container-shell">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Left: Architectural Visual Panel */}
            <div className="lg:col-span-5 relative aspect-[4/3] rounded-sm overflow-hidden border border-charcoal/20 shadow-md">
              <Image
                src="/assets/homepage_background.png"
                alt="Parliamentary Chamber Architecture"
                fill
                className="object-cover object-center filter contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-warmwhite">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-citrus block">Council Secretariat</span>
                <span className="font-editorial italic text-base">Udaipur, Rajasthan, India</span>
              </div>
            </div>

            {/* Right: Institutional Mandate */}
            <div className="lg:col-span-7 space-y-5 text-charcoal/85 font-sans font-normal">
              <p className="eyebrow text-crimson mb-2">04 / Institutional Mandate</p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
                An Independent Youth-Led Forum for Public Reason.
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-charcoal/90">
                The Vichaar Council functions as an autonomous intellectual body, stewarded by collegiate researchers, parliamentary debaters, and policy fellows. We do not align with any political party, corporate interest, or ideological bloc.
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-charcoal/80">
                Through our flagship parliamentary assemblies, legal dockets, and research working papers, we provide delegates with empirical preparation, procedural discipline, and exposure to constitutional scholarship.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-charcoal bg-charcoal px-7 py-3 text-xs font-display font-bold tracking-[0.16em] text-warmwhite hover:bg-citrus hover:text-ink hover:border-citrus transition-all uppercase rounded-xs"
                >
                  <span>DISCOVER THE FULL FRAMEWORK</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/initiatives"
                  className="inline-flex items-center gap-2 border border-charcoal/25 bg-transparent px-6 py-3 text-xs font-display font-semibold tracking-[0.16em] text-charcoal hover:bg-charcoal/5 transition-all uppercase rounded-xs"
                >
                  <span>VIEW PROGRAMMES</span>
                  <span>↗</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 08 — OUR INITIATIVES
          Visual Environment: Deep Navy (#101C32)
         ========================================================================= */}
      <section className="bg-navy text-warmwhite py-24 lg:py-32 border-b border-white/10">
        <div className="container-shell">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
            <div>
              <p className="eyebrow text-citrus mb-2 font-sans">05 / Active Dockets & Platforms</p>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-warmwhite">
                Our Initiatives
              </h2>
            </div>
            <Link
              href="/initiatives"
              className="inline-flex items-center gap-2 text-xs font-sans font-semibold tracking-widest text-citrus hover:text-gelato transition-colors uppercase"
            >
              <span>Explore All Initiatives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {featuredInitiatives.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-3">
              {featuredInitiatives.map((init, idx) => (
                <div
                  key={init.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-sm border border-white/15 bg-navy-surface/80 p-8 transition-all duration-300 hover:border-citrus"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] tracking-widest text-citrus uppercase mb-4 font-sans font-semibold">
                      <span>Initiative 0{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded bg-citrus/15 text-citrus font-semibold">{init.category}</span>
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-warmwhite group-hover:text-citrus transition-colors">
                      {init.title}
                    </h3>
                    <p className="mt-4 text-xs leading-relaxed text-mutedgrey font-sans font-normal">
                      {init.summary}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between font-sans">
                    <span className="text-[10px] tracking-wider text-mutedgrey uppercase font-normal">Status: {init.status}</span>
                    <Link
                      href={`/initiatives/${init.slug}`}
                      className="text-xs font-semibold tracking-widest text-citrus group-hover:underline uppercase"
                    >
                      Examine Docket ↗
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-white/10 bg-navy-surface/60 p-10 sm:p-14 rounded-sm text-center max-w-2xl mx-auto shadow-sm">
              <span className="font-editorial text-2xl sm:text-3xl text-warmwhite block font-medium">
                Our initiatives will be featured here as they are announced.
              </span>
              <p className="mt-3 text-xs sm:text-sm text-mutedgrey leading-relaxed max-w-md mx-auto font-sans font-normal">
                The Council is currently formalizing programmatic dockets for constitutional inquiry, parliamentary simulation, and collegiate fellowships.
              </p>
              <div className="mt-6">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-sans font-semibold tracking-wider text-warmwhite hover:border-citrus hover:text-citrus transition-colors uppercase rounded-xs"
                >
                  Discover Institutional Framework →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 09 — FEATURED EVENT
          Visual Environment: Warm Parchment (#FAF8F3)
         ========================================================================= */}
      <section className="bg-[#FAF8F3] py-20 lg:py-28 border-b border-charcoal/10">
        <div className="container-shell">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow text-crimson mb-2 font-sans">06 / Marquee Deliberation</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal">
              Featured Event
            </h2>
          </div>

          {featuredEvent ? (
            <div className="border border-charcoal/20 bg-white rounded-sm overflow-hidden shadow-sm grid md:grid-cols-12">
              <div className="relative aspect-[16/10] md:aspect-auto md:col-span-5 bg-navy">
                <Image
                  src={featuredEvent.coverImage || "/assets/homepage_background.png"}
                  alt={featuredEvent.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8 sm:p-10 md:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-charcoal/60 mb-3 font-sans">
                    <span className="px-2.5 py-1 text-[10px] font-sans font-semibold tracking-widest uppercase bg-navy text-warmwhite">
                      {featuredEvent.categoryName || "Parliamentary Session"}
                    </span>
                    <span>📍 {featuredEvent.city}</span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-charcoal mb-4">
                    {featuredEvent.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-charcoal/75 font-sans font-normal mb-6">
                    {featuredEvent.summary}
                  </p>
                </div>

                <div className="pt-6 border-t border-charcoal/10 flex flex-wrap items-center justify-between gap-4 font-sans">
                  <div>
                    <span className="block text-[10px] tracking-wider text-mutedgrey uppercase font-semibold">Scheduled Date</span>
                    <span className="font-display text-base font-bold text-charcoal">
                      {new Date(featuredEvent.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <Link
                    href={`/events/${featuredEvent.slug}`}
                    className="border border-charcoal bg-charcoal px-6 py-3 text-xs font-display font-bold tracking-widest text-warmwhite hover:bg-citrus hover:text-ink hover:border-citrus transition-colors uppercase rounded-xs"
                  >
                    REGISTER FOR ASSEMBLY ↗
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-charcoal/15 bg-white p-10 sm:p-14 rounded-sm text-center max-w-2xl mx-auto shadow-sm">
              <span className="font-editorial text-2xl sm:text-3xl text-charcoal block font-medium">
                Next Assembly Docket Under Secretariat Review
              </span>
              <p className="mt-3 text-xs sm:text-sm text-charcoal/70 leading-relaxed max-w-md mx-auto font-sans font-normal">
                Official dates, venue coordinates, and youth delegate applications for the forthcoming parliamentary session are being finalized by the Council Secretariat.
              </p>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-charcoal bg-charcoal px-6 py-2.5 text-xs font-sans font-semibold tracking-wider text-warmwhite hover:bg-citrus hover:text-ink hover:border-citrus transition-colors uppercase rounded-xs"
                >
                  Enquire Regarding Admissions ↗
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 10 — UPCOMING EVENTS
          Visual Environment: Clean Warmwhite
         ========================================================================= */}
      <section className="bg-warmwhite py-24 lg:py-32 border-b border-charcoal/10">
        <div className="container-shell">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 border-b border-charcoal/10 pb-8">
            <div>
              <p className="eyebrow text-crimson mb-2 font-sans">07 / Official Assemblies & Debates</p>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal">
                Upcoming Events
              </h2>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs font-sans font-semibold tracking-widest text-crimson hover:text-charcoal transition-colors uppercase"
            >
              Explore Full Event Calendar ↗
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((evt) => {
                const minPrice = evt.tickets.length > 0 ? Math.min(...evt.tickets.map((t) => t.price)) : 0;
                const isFree = minPrice === 0;

                return (
                  <div
                    key={evt.id}
                    className="card-lift flex flex-col justify-between border border-charcoal/15 bg-white p-7 rounded-sm shadow-sm"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy mb-6 rounded-xs">
                        <Image
                          src={evt.coverImage || "/assets/homepage_background.png"}
                          alt={evt.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`inline-block px-2.5 py-1 text-[10px] font-sans font-semibold tracking-wider uppercase rounded-xs ${
                            evt.status === "REGISTRATION_OPEN"
                              ? "bg-emerald-600 text-white"
                              : "bg-navy text-mutedgrey"
                          }`}>
                            {evt.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-charcoal/60 mb-2 font-sans font-normal">
                        <span>📅 {new Date(evt.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>•</span>
                        <span>📍 {evt.city}</span>
                      </div>

                      <h3 className="font-display text-2xl font-semibold text-charcoal leading-snug">
                        <Link href={`/events/${evt.slug}`} className="hover:text-crimson transition-colors">
                          {evt.title}
                        </Link>
                      </h3>

                      <p className="mt-3 text-xs leading-relaxed text-charcoal/70 line-clamp-3 font-sans font-normal">
                        {evt.summary}
                      </p>
                    </div>

                    <div className="mt-8 pt-5 border-t border-charcoal/10 flex items-center justify-between font-sans">
                      <div>
                        <span className="block text-[9px] tracking-wider text-mutedgrey uppercase font-semibold">Registration Fee</span>
                        <span className="font-editorial text-xl font-semibold text-charcoal">
                          {isFree ? "Complimentary" : `₹${minPrice} onwards`}
                        </span>
                      </div>

                      <Link
                        href={`/events/${evt.slug}`}
                        className="border border-charcoal bg-charcoal px-4 py-2 text-[10px] font-sans font-semibold tracking-widest text-warmwhite transition-colors hover:bg-citrus hover:text-ink hover:border-citrus uppercase rounded-xs"
                      >
                        Register Now ↗
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-charcoal/15 bg-white p-10 sm:p-14 rounded-sm text-center max-w-2xl mx-auto shadow-sm">
              <span className="font-editorial text-2xl sm:text-3xl text-charcoal block font-medium">
                No upcoming events at the moment.
              </span>
              <p className="mt-3 text-xs sm:text-sm text-charcoal/70 leading-relaxed max-w-md mx-auto font-sans font-normal">
                Official assembly dates, delegate applications, and parliamentary session schedules will be published here once ratified by the Secretariat.
              </p>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-charcoal bg-charcoal px-6 py-2.5 text-xs font-sans font-semibold tracking-wider text-warmwhite hover:bg-citrus hover:text-ink hover:border-citrus transition-colors uppercase rounded-xs"
                >
                  Contact Secretariat Regarding Assemblies ↗
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 11 — DOCUMENTATION
          Visual Environment: Deep Navy (#0B1424)
         ========================================================================= */}
      <section className="bg-[#0B1424] text-warmwhite py-24 lg:py-32 border-b border-navy-border">
        <div className="container-shell">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
            <div>
              <p className="eyebrow text-citrus mb-2 font-sans">08 / Scholarly Dockets & Working Papers</p>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-warmwhite">
                Documentation
              </h2>
            </div>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 text-xs font-sans font-semibold tracking-widest text-citrus hover:text-gelato transition-colors uppercase"
            >
              Browse Documentation Archive ↗
            </Link>
          </div>

          {latestPublications.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-3">
              {latestPublications.map((pub) => (
                <div
                  key={pub.id}
                  className="card-lift flex flex-col justify-between border border-white/15 bg-navy-surface p-8 rounded-sm shadow-sm"
                >
                  <div>
                    <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-citrus block mb-3">
                      {pub.categoryName}
                    </span>
                    <h3 className="font-display text-2xl font-semibold text-warmwhite hover:text-citrus transition-colors leading-snug">
                      <Link href={`/research/${pub.slug}`}>
                        {pub.title}
                      </Link>
                    </h3>
                    {pub.subtitle && (
                      <p className="font-editorial italic text-gelato text-sm mt-2">
                        {pub.subtitle}
                      </p>
                    )}
                    <p className="mt-4 text-xs leading-relaxed text-mutedgrey line-clamp-3 font-sans font-normal">
                      {pub.content.slice(0, 150)}...
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-mutedgrey font-sans">
                    <span>By {pub.authorName}</span>
                    <Link
                      href={`/research/${pub.slug}`}
                      className="font-semibold text-citrus hover:underline tracking-wider uppercase text-[10px]"
                    >
                      Read Brief →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-white/10 bg-navy-surface/60 p-10 sm:p-14 rounded-sm text-center max-w-2xl mx-auto shadow-sm">
              <span className="font-editorial text-2xl sm:text-3xl text-warmwhite block font-medium">
                Research papers will appear here as they are published.
              </span>
              <p className="mt-3 text-xs sm:text-sm text-mutedgrey leading-relaxed max-w-md mx-auto font-sans font-normal">
                The Academic Directorate is peer-reviewing constitutional working papers, legislative commentaries, and policy briefs.
              </p>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-sans font-semibold tracking-wider text-warmwhite hover:border-citrus hover:text-citrus transition-colors uppercase rounded-xs"
                >
                  Inquire Regarding Research Submissions →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 12 — OUR APPROACH TO DIALOGUE
          Visual Environment: Cream / Parchment
         ========================================================================= */}
      <section className="parchment-texture py-24 lg:py-32 border-b border-parchment-dark/60">
        <div className="container-shell max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="eyebrow text-crimson mb-3 font-sans">09 / The Art of Civil Discourse</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-charcoal leading-tight">
              DISAGREEMENT IS NOT THE END OF DIALOGUE.<br />
              <span className="text-amalfi italic font-editorial font-normal">IT IS OFTEN WHERE IT BEGINS.</span>
            </h2>
            <div className="w-12 h-[2px] bg-crimson mx-auto my-6" />
            <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-sans font-normal">
              At The Vichaar Council, we distinguish between ideological hostility and principled contention.
              True intellectual growth requires subjecting our most cherished assumptions to reciprocal cross-examination.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white/80 border border-charcoal/15 p-6 rounded-sm shadow-sm">
              <span className="text-xs font-bold text-amalfi uppercase tracking-wider block font-sans mb-1">01 / Modesty</span>
              <h3 className="font-display text-lg font-bold text-charcoal mb-2">Epistemic Modesty</h3>
              <p className="text-xs text-charcoal/75 leading-relaxed font-sans font-normal">
                Acknowledging the limitations of one&apos;s own viewpoint and recognizing that truth rarely resides in absolutes.
              </p>
            </div>
            <div className="bg-white/80 border border-charcoal/15 p-6 rounded-sm shadow-sm">
              <span className="text-xs font-bold text-crimson uppercase tracking-wider block font-sans mb-1">02 / Contestation</span>
              <h3 className="font-display text-lg font-bold text-charcoal mb-2">Constructive Rigor</h3>
              <p className="text-xs text-charcoal/75 leading-relaxed font-sans font-normal">
                Confronting arguments rather than personalities, refusing personal ad hominem attacks and straw-man fallacies.
              </p>
            </div>
            <div className="bg-white/80 border border-charcoal/15 p-6 rounded-sm shadow-sm">
              <span className="text-xs font-bold text-citrus-hover uppercase tracking-wider block font-sans mb-1">03 / Procedure</span>
              <h3 className="font-display text-lg font-bold text-charcoal mb-2">Parliamentary Decorum</h3>
              <p className="text-xs text-charcoal/75 leading-relaxed font-sans font-normal">
                Adhering to strict deliberative protocols that grant equal voice and eliminate coercive shouting.
              </p>
            </div>
            <div className="bg-white/80 border border-charcoal/15 p-6 rounded-sm shadow-sm">
              <span className="text-xs font-bold text-amalfi uppercase tracking-wider block font-sans mb-1">04 / Evidence</span>
              <h3 className="font-display text-lg font-bold text-charcoal mb-2">Evidentiary Grounding</h3>
              <p className="text-xs text-charcoal/75 leading-relaxed font-sans font-normal">
                Requiring empirical proof, legal statutes, and verifiable citations for every substantive claim made.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 13 — LEADERSHIP
          Visual Environment: Warm White
         ========================================================================= */}
      <section className="bg-warmwhite py-24 lg:py-32 border-b border-charcoal/10">
        <div className="container-shell">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 border-b border-charcoal/10 pb-8">
            <div>
              <p className="eyebrow text-crimson mb-2 font-sans">10 / Governance & Secretariat</p>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal">
                Council Leadership
              </h2>
            </div>
            <Link
              href="/leadership"
              className="inline-flex items-center gap-2 text-xs font-sans font-semibold tracking-widest text-crimson hover:text-charcoal transition-colors uppercase"
            >
              Meet Full Secretariat ↗
            </Link>
          </div>

          {leadershipPreview.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {leadershipPreview.map((leader) => (
                <div
                  key={leader.id}
                  className="card-lift border border-charcoal/15 bg-white p-6 rounded-sm text-center shadow-sm"
                >
                  <div className="relative mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border-2 border-charcoal/20 bg-navy/10 flex items-center justify-center">
                    {leader.avatarUrl ? (
                      <Image
                        src={leader.avatarUrl}
                        alt={leader.fullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-display text-2xl font-bold text-charcoal/40">
                        {leader.fullName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold text-charcoal">
                    {leader.fullName}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-citrus-hover tracking-wider uppercase font-sans">
                    {leader.roleTitle}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-charcoal/70 line-clamp-3 font-sans font-normal">
                    {leader.bio}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-charcoal/15 bg-white p-10 sm:p-14 rounded-sm text-center max-w-2xl mx-auto shadow-sm">
              <span className="font-editorial text-2xl sm:text-3xl text-charcoal block font-medium">
                Secretariat Governance & Executive Directorate
              </span>
              <p className="mt-3 text-xs sm:text-sm text-charcoal/70 leading-relaxed max-w-md mx-auto font-sans font-normal">
                Officially designated leadership profiles and academic board appointments will be displayed here following formal ratification.
              </p>
              <div className="mt-6">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-charcoal bg-charcoal px-6 py-2.5 text-xs font-sans font-semibold tracking-wider text-warmwhite hover:bg-citrus hover:text-ink hover:border-citrus transition-colors uppercase rounded-xs"
                >
                  Read Governance Structure →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 14 — GALLERY
          Visual Environment: Deep Navy (#070D18)
         ========================================================================= */}
      <section className="bg-[#070D18] text-warmwhite py-24 lg:py-32 border-b border-white/10">
        <div className="container-shell">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
            <div>
              <p className="eyebrow text-citrus mb-2 font-sans">11 / Visual Chronicle</p>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-warmwhite">
                Photographic Archive
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-mutedgrey font-sans font-normal">
                Documenting parliamentary sessions, youth assemblies, and diplomatic dialogues across India.
              </p>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-xs font-sans font-semibold tracking-widest text-citrus hover:text-gelato transition-colors uppercase"
            >
              Explore Full Visual Archive ↗
            </Link>
          </div>

          {galleryImages.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((img) => (
                <div key={img.id} className="group relative aspect-[4/3] rounded-sm overflow-hidden border border-white/10 bg-navy">
                  <Image
                    src={img.imageUrl}
                    alt={img.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 text-warmwhite">
                    <span className="text-[10px] font-sans font-semibold text-citrus uppercase tracking-wider block">{img.category}</span>
                    <h4 className="font-display text-sm font-bold truncate">{img.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-white/10 bg-navy-surface/60 p-10 sm:p-14 rounded-sm text-center max-w-2xl mx-auto shadow-sm">
              <span className="font-editorial text-2xl sm:text-3xl text-warmwhite block font-medium">
                Visual Archive Under Archival Curation
              </span>
              <p className="mt-3 text-xs sm:text-sm text-mutedgrey leading-relaxed max-w-md mx-auto font-sans font-normal">
                Authentic photographic documentation from our convened assemblies and parliamentary colloquia will be published directly following event conclusion.
              </p>
              <div className="mt-6">
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-sans font-semibold tracking-wider text-warmwhite hover:border-citrus hover:text-citrus transition-colors uppercase rounded-xs"
                >
                  View Archive Directory →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 15 — PARTICIPATION CTA (NO MEMBERSHIP)
          Visual Environment: Crimson / Dark Cherry (#1D090B)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-[#1D090B] text-warmwhite py-28 lg:py-36 border-t border-crimson/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,166,43,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="container-shell relative z-10 text-center max-w-3xl mx-auto">
          <p className="eyebrow text-citrus mb-4 font-sans">12 / Call to Deliberation</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-warmwhite leading-tight uppercase">
            HAVE AN IDEA WORTH DISCUSSING?
          </h2>
          <p className="mt-6 text-base sm:text-lg text-neutral-300 leading-relaxed font-sans font-normal">
            Explore the Council&apos;s initiatives, participate in our convened assemblies, and contribute your voice to meaningful public discourse across India.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/initiatives"
              className="inline-flex items-center gap-2 border border-citrus bg-citrus px-8 py-3.5 text-xs font-display font-bold tracking-[0.18em] text-ink transition-all duration-300 hover:scale-[1.03] hover:bg-gelato hover:border-gelato uppercase rounded-xs shadow-gold"
            >
              <span>EXPLORE INITIATIVES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-8 py-3.5 text-xs font-display font-bold tracking-[0.18em] text-warmwhite transition-all duration-300 hover:border-citrus hover:text-citrus uppercase rounded-xs"
            >
              <span>VIEW EVENTS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 16 — CONTACT
          Visual Environment: Warm Cream (#F9F7F1)
         ========================================================================= */}
      <section className="bg-[#F9F7F1] py-24 lg:py-32 border-b border-charcoal/10">
        <div className="container-shell max-w-6xl">
          <div className="max-w-2xl mb-16">
            <p className="eyebrow text-crimson mb-2 font-sans">13 / Official Correspondence</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal">
              Connect with the Secretariat
            </h2>
            <p className="mt-3 text-sm text-charcoal/70 font-sans font-normal">
              For academic partnerships, assembly collaborations, media inquiries, or official correspondence, reach out directly.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            {/* Left: Contact Directory & Address */}
            <div className="lg:col-span-5 space-y-8 font-sans">
              <div className="border border-charcoal/15 bg-white p-7 rounded-sm shadow-sm space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
                  <div>
                    <span className="font-display uppercase text-[10px] tracking-widest text-crimson font-bold block mb-1">Secretariat Headquarters</span>
                    <p className="font-bold text-charcoal text-base">The Vichaar Council</p>
                    <p className="text-sm text-charcoal/75">Udaipur, Rajasthan, India</p>
                  </div>
                </div>

                <div className="border-t border-charcoal/10 pt-5 space-y-4 text-xs">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-citrus-hover shrink-0" />
                    <div>
                      <span className="text-[10px] text-mutedgrey uppercase tracking-wider block">Official Direct Line</span>
                      <a href="tel:+917357337067" className="font-semibold text-charcoal hover:text-citrus text-sm">
                        +91 73573 37067
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-amalfi shrink-0" />
                    <div>
                      <span className="text-[10px] text-mutedgrey uppercase tracking-wider block">General Secretariat</span>
                      <a href="mailto:contact@thevichaarcouncil.in" className="font-semibold text-charcoal hover:text-amalfi text-sm">
                        contact@thevichaarcouncil.in
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-charcoal/60 shrink-0" />
                    <div>
                      <span className="text-[10px] text-mutedgrey uppercase tracking-wider block">Hours of Deliberation</span>
                      <span className="text-charcoal/80">Mon – Fri: 09:30 AM – 06:00 PM IST</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Embedded Contact Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 17 — NEWSLETTER / INSTITUTIONAL DISPATCH
          Visual Environment: Deep Navy Surface (#0A111E)
         ========================================================================= */}
      <section className="bg-[#0A111E] text-warmwhite py-20 lg:py-24 border-t border-white/10">
        <div className="container-shell max-w-4xl text-center mx-auto">
          <p className="eyebrow text-citrus mb-3 font-sans">14 / Institutional Communiqué</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-warmwhite">
            The Vichaar Council Dispatch
          </h2>
          <p className="mt-4 text-sm sm:text-base text-mutedgrey max-w-xl mx-auto leading-relaxed font-sans font-normal mb-8">
            Receive official assembly notifications, research white papers, and delegate admission dates directly in your inbox.
          </p>

          <div className="flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
