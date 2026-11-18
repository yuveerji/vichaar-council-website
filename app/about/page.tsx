import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, Compass, Eye, ShieldCheck, Users, Sparkles, BookOpen, MessageSquare, Scale, Globe, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About The Vichaar Council | Where Ideas Earn Their Weight",
  description: "Learn about the institutional foundation, vision, mission, five pillars, and philosophical commitment of The Vichaar Council."
};

const pillars = [
  {
    num: "I",
    title: "DEBATE",
    slogan: "The courage to question. The ability to reason.",
    description: "Debate is an exercise in intellectual discipline. We encourage individuals to develop structured arguments, examine opposing positions, communicate effectively and defend their perspectives through reason and evidence.",
    iconSrc: "/assets/pillars/debate.png",
    color: "text-citrus"
  },
  {
    num: "II",
    title: "DIALOGUE",
    slogan: "The willingness to listen. The ability to understand.",
    description: "Meaningful dialogue creates room for different experiences, ideas and perspectives. We seek to encourage conversations that move beyond simply being heard towards genuinely understanding one another.",
    iconSrc: "/assets/pillars/dialogue.png",
    color: "text-seabreeze"
  },
  {
    num: "III",
    title: "RESEARCH",
    slogan: "The pursuit of knowledge beyond assumption.",
    description: "We value curiosity, investigation and informed inquiry. Through research and documentation, we encourage deeper engagement with contemporary issues, emerging ideas and subjects that deserve greater examination.",
    iconSrc: "/assets/pillars/research.png",
    color: "text-gelato"
  },
  {
    num: "IV",
    title: "DIPLOMACY",
    slogan: "The art of understanding differences.",
    description: "Diplomacy represents the ability to navigate complexity, appreciate different interests and approach disagreements with patience, perspective and strategic understanding.",
    iconSrc: "/assets/pillars/diplomacy.png",
    color: "text-seabreeze"
  },
  {
    num: "V",
    title: "LEADERSHIP",
    slogan: "The responsibility to turn thought into action.",
    description: "Leadership is not simply about holding a position. It is about taking responsibility, building trust, contributing meaningfully and creating opportunities for collective progress.",
    iconSrc: "/assets/pillars/leadership.png",
    color: "text-citrus"
  }
];

const principles = [
  {
    title: "Intellectual Independence",
    description: "The freedom to think independently, question assumptions and form reasoned perspectives."
  },
  {
    title: "Constructive Disagreement",
    description: "The understanding that disagreement is not a barrier to dialogue, but an opportunity to examine ideas more deeply."
  },
  {
    title: "Informed Expression",
    description: "The belief that meaningful opinions are strengthened by research, reasoning, evidence and awareness."
  },
  {
    title: "Respectful Engagement",
    description: "The commitment to treating differing perspectives with dignity, even when they are challenged or disagreed with."
  },
  {
    title: "Inclusivity of Thought",
    description: "The encouragement of diverse perspectives, backgrounds and experiences in intellectual conversations."
  },
  {
    title: "Responsible Leadership",
    description: "The understanding that influence carries responsibility, and that meaningful leadership begins with accountability, integrity and listening."
  }
];

const whatWeDo = [
  {
    title: "Public Discourse & Dialogue",
    description: "Spaces for engaging with contemporary social, political, economic and global issues through informed discussion and the exchange of perspectives."
  },
  {
    title: "Debating & Public Speaking",
    description: "Opportunities to develop articulation, argumentation, reasoning and confidence through structured and open debate formats."
  },
  {
    title: "Diplomacy & Simulations",
    description: "Experiences that introduce participants to international relations, negotiation, institutional processes and the complexities of global affairs."
  },
  {
    title: "Documentation",
    description: "An intellectual platform for exploring ideas, examining developments, sharing perspectives and contributing to informed conversations."
  },
  {
    title: "Youth Leadership & Engagement",
    description: "Opportunities to participate, collaborate, organise and contribute to meaningful intellectual initiatives."
  }
];

const approachCommitments = [
  "Question before concluding.",
  "Research before asserting.",
  "Listen before responding.",
  "Disagree without disrespect.",
  "Challenge ideas without diminishing individuals.",
  "Remain open to changing their perspectives."
];

const whoWeAreFor = [
  "Explore unfamiliar perspectives.",
  "Understand contemporary issues.",
  "Strengthen their ability to communicate.",
  "Engage in meaningful debates.",
  "Develop intellectual confidence.",
  "Learn about diplomacy and global affairs.",
  "Contribute to thoughtful public discourse.",
  "Participate in collaborative initiatives."
];

export default function AboutPage() {
  return (
    <div className="bg-warmwhite text-charcoal font-sans selection:bg-citrus/30">
      {/* =========================================================================
          01. THE INSTITUTION
          Visual Environment: Deep Navy (#101C32)
         ========================================================================= */}
      <section className="bg-navy-deep text-warmwhite pt-36 pb-24 sm:pt-44 lg:pt-48 lg:pb-32 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/homepage_background.png"
            alt="The Vichaar Council Chamber"
            fill
            priority
            className="object-cover object-center filter brightness-[0.4] contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/85 to-navy-deep/70" />
        </div>

        <div className="container-shell relative z-10 max-w-4xl">
          <div className="flex items-center gap-2.5 text-[11px] font-sans font-semibold tracking-[0.24em] text-citrus uppercase mb-6">
            <span className="w-8 h-[1px] bg-citrus/60" />
            <span>01 / THE INSTITUTION</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-warmwhite leading-tight">
            THE VICHAAR COUNCIL
          </h1>

          <p className="font-editorial italic font-medium text-2xl sm:text-3xl lg:text-4xl text-gelato tracking-wide mt-4 mb-8">
            Where Ideas Earn Their Weight.
          </p>

          <div className="w-16 h-[2px] bg-crimson mb-8" />

          <div className="space-y-6 text-base sm:text-lg text-neutral-300 leading-relaxed font-sans font-normal">
            <p className="text-xl sm:text-2xl text-warmwhite font-editorial italic font-normal leading-relaxed">
              Ideas have the power to question conventions, challenge established perspectives and shape the world around us. But meaningful ideas need more than an audience. They need a space where they can be expressed, examined, debated and understood.
            </p>
            <p>
              <strong className="text-warmwhite font-semibold">THE VICHAAR COUNCIL</strong> is an independent, youth-led intellectual institution dedicated to fostering critical thinking, meaningful debate, public discourse, diplomacy, research and leadership.
            </p>
            <p>
              Built on the belief that thoughtful dialogue is essential to an informed society, the Council seeks to create opportunities for individuals to engage with ideas, explore differing perspectives and develop a deeper understanding of the issues shaping our world.
            </p>
            <p>
              We bring together curiosity, conviction and conversation to create an environment where disagreement can be constructive, questions are encouraged and intellectual independence is valued.
            </p>
            <p>
              We believe that the strength of an idea lies not merely in how confidently it is expressed, but in how thoughtfully it withstands examination.
            </p>
            <p className="font-editorial italic text-gelato text-xl sm:text-2xl pt-2">
              This is where conversations begin, perspectives evolve and ideas earn their weight.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          02. WHY WE EXIST
          Visual Environment: Cream / Parchment
         ========================================================================= */}
      <section className="parchment-texture border-b border-parchment-dark/60 py-24 lg:py-32">
        <div className="container-shell max-w-4xl">
          <p className="eyebrow text-crimson mb-3 font-sans">02 / WHY WE EXIST</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-charcoal leading-tight">
            BECAUSE THINKING DESERVES MORE THAN SILENCE.
          </h2>

          <div className="w-12 h-[2px] bg-crimson my-8" />

          <div className="space-y-6 text-base sm:text-lg text-charcoal/85 leading-relaxed font-sans font-normal">
            <p>
              The world is full of conversations, opinions and competing narratives. Yet meaningful spaces for thoughtful disagreement, informed discussion and genuine intellectual engagement remain essential.
            </p>
            <p>
              Too often, conversations end where they should begin: with assumptions unchallenged, questions unanswered and perspectives unexplored.
            </p>
            <p className="font-bold text-charcoal text-lg sm:text-xl">
              The Vichaar Council exists to encourage a different approach.
            </p>
            <p>
              We seek to create spaces where individuals are not merely encouraged to express what they think, but are also invited to understand why they think it, examine the reasoning behind their positions and engage respectfully with perspectives different from their own.
            </p>
            <p>
              Our purpose is to make intellectual participation more accessible, meaningful and engaging.
            </p>
            <div className="p-6 bg-white/80 border-l-4 border-crimson rounded-xs shadow-sm mt-8">
              <p className="font-editorial italic text-xl sm:text-2xl text-charcoal">
                &ldquo;We believe that an informed voice begins with an open mind, that leadership requires the willingness to listen and that progress is strengthened when ideas are tested through dialogue.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          03. OUR VISION & 04. OUR MISSION
          Visual Environment: Deep Navy (#080F1D)
         ========================================================================= */}
      <section className="bg-[#080F1D] text-warmwhite py-24 lg:py-32 border-b border-white/10">
        <div className="container-shell">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* 03. OUR VISION */}
            <div className="border border-white/15 bg-navy-surface p-8 sm:p-12 rounded-sm shadow-sm flex flex-col justify-between">
              <div>
                <p className="eyebrow text-citrus mb-3 font-sans">03 / OUR VISION</p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-warmwhite leading-snug">
                  TO CULTIVATE A CULTURE OF THINKING, QUESTIONING AND MEANINGFUL PARTICIPATION.
                </h3>
                <div className="w-12 h-[2px] bg-citrus my-6" />
                <div className="space-y-4 text-sm sm:text-base text-neutral-300 leading-relaxed font-sans font-normal">
                  <p>
                    We envision an intellectually engaged generation that approaches the world with curiosity, confidence and a willingness to question.
                  </p>
                  <p>
                    A generation that can engage with complexity, understand differing perspectives, articulate its convictions and participate thoughtfully in conversations that shape society.
                  </p>
                  <p>
                    We aspire to contribute to an environment where debate is valued over hostility, understanding over assumption and informed participation over passive observation.
                  </p>
                  <p className="text-gelato font-editorial italic text-lg pt-2">
                    Our vision extends beyond individual conversations. It is about encouraging a lasting culture of intellectual curiosity, responsible leadership and meaningful public engagement.
                  </p>
                </div>
              </div>
            </div>

            {/* 04. OUR MISSION */}
            <div className="border border-white/15 bg-navy-surface p-8 sm:p-12 rounded-sm shadow-sm flex flex-col justify-between">
              <div>
                <p className="eyebrow text-seabreeze mb-3 font-sans">04 / OUR MISSION</p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-warmwhite leading-snug">
                  TO TURN CURIOSITY INTO CONVERSATION, AND CONVERSATION INTO IMPACT.
                </h3>
                <div className="w-12 h-[2px] bg-seabreeze my-6" />
                <p className="text-sm sm:text-base text-neutral-300 mb-6 font-sans">
                  Our mission is to develop and facilitate meaningful intellectual opportunities through:
                </p>

                <ul className="space-y-4 text-sm font-sans text-neutral-300">
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-citrus shrink-0 mt-2" />
                    <div>
                      <strong className="text-warmwhite block font-semibold">Encouraging Critical Thinking</strong>
                      <span>Promoting independent thought, analytical reasoning and the examination of ideas.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-citrus shrink-0 mt-2" />
                    <div>
                      <strong className="text-warmwhite block font-semibold">Strengthening Public Discourse</strong>
                      <span>Creating opportunities for informed, constructive and meaningful conversations on contemporary issues.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-citrus shrink-0 mt-2" />
                    <div>
                      <strong className="text-warmwhite block font-semibold">Advancing Debate &amp; Dialogue</strong>
                      <span>Encouraging articulate expression, respectful disagreement and thoughtful engagement.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-citrus shrink-0 mt-2" />
                    <div>
                      <strong className="text-warmwhite block font-semibold">Exploring Diplomacy &amp; Global Affairs</strong>
                      <span>Developing awareness of international relations, geopolitical developments and global perspectives.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-citrus shrink-0 mt-2" />
                    <div>
                      <strong className="text-warmwhite block font-semibold">Promoting Research &amp; Knowledge</strong>
                      <span>Encouraging inquiry, evidence-based discussion, intellectual exploration and the exchange of knowledge.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-citrus shrink-0 mt-2" />
                    <div>
                      <strong className="text-warmwhite block font-semibold">Developing Leadership</strong>
                      <span>Creating opportunities to build confidence, responsibility, collaboration and the ability to engage with complex challenges.</span>
                    </div>
                  </li>
                </ul>

                <p className="mt-6 pt-4 border-t border-white/10 text-xs text-mutedgrey italic font-editorial text-base">
                  Through these efforts, we aim to make intellectual engagement an active experience rather than a passive exercise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          05. WHAT WE STAND FOR
          Visual Environment: Warm Cream (#FAF8F3)
         ========================================================================= */}
      <section className="bg-[#FAF8F3] py-24 lg:py-32 border-b border-charcoal/10">
        <div className="container-shell max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="eyebrow text-crimson mb-3 font-sans">05 / WHAT WE STAND FOR</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-charcoal leading-tight uppercase">
              OUR PRINCIPLES. OUR CHARACTER. OUR FOUNDATION.
            </h2>
            <div className="w-12 h-[2px] bg-crimson mx-auto my-6" />
            <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-sans font-normal">
              The Vichaar Council is guided by principles that shape its identity, activities and approach to intellectual engagement.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((pr, idx) => (
              <div
                key={pr.title}
                className="card-lift border border-charcoal/15 bg-white p-7 rounded-sm shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono font-bold text-crimson block mb-2">0{idx + 1}</span>
                  <h3 className="font-display text-xl font-bold text-charcoal mb-3">
                    {pr.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-charcoal/75 font-sans font-normal">
                    {pr.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          06. OUR FIVE PILLARS
          Visual Environment: Deep Navy (#0A1220)
         ========================================================================= */}
      <section className="bg-[#0A1220] text-warmwhite py-24 lg:py-32 border-b border-white/10 relative overflow-hidden">
        <div className="container-shell">
          <div className="max-w-3xl mb-16">
            <p className="eyebrow text-citrus mb-3 font-sans">06 / OUR FIVE PILLARS</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-warmwhite leading-tight uppercase">
              FIVE DIMENSIONS. ONE INTELLECTUAL PURPOSE.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-mutedgrey leading-relaxed font-sans font-normal">
              The work of the Vichaar Council is shaped by five interconnected pillars.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {pillars.map((pil) => (
              <div
                key={pil.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-sm border border-white/10 bg-navy-surface/60 p-6 sm:p-7 transition-all duration-300 hover:border-citrus hover:bg-navy-surface/90"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-10 w-10 relative">
                      <Image
                        src={pil.iconSrc}
                        alt={pil.title}
                        width={40}
                        height={40}
                        className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(201,162,85,0.4)]"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-white/30">{pil.num}</span>
                  </div>

                  <h3 className="font-display text-xl font-bold tracking-wider text-warmwhite group-hover:text-citrus transition-colors uppercase">
                    {pil.title}
                  </h3>
                  <p className="font-editorial italic text-gelato text-sm mt-1 mb-3">
                    {pil.slogan}
                  </p>
                  <p className="text-xs text-mutedgrey leading-relaxed font-sans font-normal">
                    {pil.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="font-editorial italic text-gelato text-lg sm:text-xl">
              &ldquo;Together, these five pillars define the intellectual character of the Council.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          07. WHAT WE DO
          Visual Environment: Parchment
         ========================================================================= */}
      <section className="parchment-texture border-b border-parchment-dark/60 py-24 lg:py-32">
        <div className="container-shell max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="eyebrow text-crimson mb-3 font-sans">07 / WHAT WE DO</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal leading-tight uppercase">
              IDEAS FIND EXPRESSION THROUGH ACTION.
            </h2>
            <div className="w-12 h-[2px] bg-crimson mx-auto my-6" />
            <p className="text-base text-charcoal/80 leading-relaxed font-sans font-normal">
              The Vichaar Council seeks to translate its philosophy into meaningful intellectual and collaborative experiences.
            </p>
          </div>

          <div className="space-y-6">
            {whatWeDo.map((item, idx) => (
              <div
                key={item.title}
                className="bg-white border border-charcoal/15 p-6 sm:p-8 rounded-sm shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-bold text-amalfi">0{idx + 1}</span>
                    <h3 className="font-display text-xl font-bold text-charcoal">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-charcoal/75 leading-relaxed font-sans font-normal">
                    {item.description}
                  </p>
                </div>
                <Link
                  href="/initiatives"
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold tracking-wider text-crimson hover:text-amalfi transition-colors uppercase shrink-0"
                >
                  <span>Explore Docket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-xs sm:text-sm text-charcoal/70 italic font-editorial text-base">
            These areas are interconnected, forming a broader ecosystem of learning, expression and engagement.
          </p>
        </div>
      </section>

      {/* =========================================================================
          08. OUR APPROACH & 09. WHO WE ARE FOR
          Visual Environment: Deep Navy Surface (#070D18)
         ========================================================================= */}
      <section className="bg-[#070D18] text-warmwhite py-24 lg:py-32 border-b border-white/10">
        <div className="container-shell">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* 08. OUR APPROACH */}
            <div className="border border-white/15 bg-navy-surface p-8 sm:p-12 rounded-sm shadow-sm">
              <p className="eyebrow text-citrus mb-3 font-sans">08 / OUR APPROACH</p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-warmwhite leading-snug">
                WE DO NOT BELIEVE EVERY CONVERSATION NEEDS A WINNER.
              </h3>
              <p className="font-editorial italic text-gelato text-xl mt-2 mb-6">
                We believe it needs substance.
              </p>
              <div className="space-y-4 text-sm sm:text-base text-neutral-300 leading-relaxed font-sans font-normal">
                <p>
                  The Vichaar Council approaches intellectual engagement with a simple understanding: the objective of a meaningful conversation is not always to establish who is right, but to understand what deserves to be considered.
                </p>
                <p className="font-semibold text-warmwhite pt-2">
                  We encourage participants to:
                </p>
                <ul className="space-y-2.5 pt-1 text-sm text-neutral-300 font-sans">
                  {approachCommitments.map((c) => (
                    <li key={c} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-citrus" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-4 border-t border-white/10 text-xs sm:text-sm text-mutedgrey">
                  We value the process of thinking as much as the conclusions it produces.
                </p>
                <p className="font-editorial italic text-gelato text-lg">
                  Because intellectual growth begins when certainty makes room for curiosity.
                </p>
              </div>
            </div>

            {/* 09. WHO WE ARE FOR */}
            <div className="border border-white/15 bg-navy-surface p-8 sm:p-12 rounded-sm shadow-sm">
              <p className="eyebrow text-seabreeze mb-3 font-sans">09 / WHO WE ARE FOR</p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-warmwhite leading-snug">
                FOR THE CURIOUS. THE QUESTIONING. THE THINKING.
              </h3>
              <div className="w-12 h-[2px] bg-seabreeze my-6" />
              <div className="space-y-4 text-sm sm:text-base text-neutral-300 leading-relaxed font-sans font-normal">
                <p>
                  The Vichaar Council welcomes individuals who believe that ideas deserve serious consideration and that meaningful conversations can create opportunities for growth.
                </p>
                <p className="font-semibold text-warmwhite pt-1">
                  It is for those who want to:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-neutral-300 font-sans">
                  {whoWeAreFor.map((w) => (
                    <li key={w} className="flex items-start gap-2">
                      <span className="text-seabreeze font-bold">›</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6 border-t border-white/10 space-y-2">
                  <p className="text-warmwhite font-medium">
                    You do not need to have all the answers to be part of a conversation.
                  </p>
                  <p className="font-editorial italic text-gelato text-lg">
                    You only need the willingness to think, question and engage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. THE BELIEF THAT DEFINES US
          Visual Environment: Dramatic Crimson / Deep Cherry (#160608)
         ========================================================================= */}
      <section className="bg-[#160608] text-warmwhite py-28 lg:py-36 border-y border-crimson/30 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,31,36,0.14)_0%,transparent_70%)] pointer-events-none" />

        <div className="container-shell relative z-10 max-w-4xl mx-auto">
          <p className="eyebrow text-citrus mb-4 font-sans">10 / THE BELIEF THAT DEFINES US</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-warmwhite leading-tight uppercase">
            AN IDEA IS ONLY THE BEGINNING.
          </h2>

          <div className="w-16 h-[2px] bg-crimson mx-auto my-8" />

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto font-sans font-normal mb-8">
            We believe that meaningful change begins with the willingness to question what exists and imagine what could be.
          </p>

          <div className="max-w-xl mx-auto space-y-3 font-editorial italic text-xl sm:text-2xl text-gelato text-center py-4">
            <p>A question can challenge an assumption.</p>
            <p>A conversation can introduce a new perspective.</p>
            <p>A debate can strengthen an argument.</p>
            <p>Research can uncover a different understanding.</p>
            <p>Leadership can transform conviction into contribution.</p>
          </div>

          <div className="w-12 h-[1px] bg-white/20 mx-auto my-8" />

          <div className="max-w-2xl mx-auto space-y-3 text-sm sm:text-base text-neutral-300 font-sans font-normal">
            <p>The Vichaar Council exists to encourage each of these possibilities.</p>
            <p className="text-warmwhite font-semibold">Not to dictate what people should think, but to encourage them to think more deeply.</p>
            <p className="text-warmwhite font-semibold">Not to eliminate disagreement, but to make it more meaningful.</p>
            <p className="text-citrus font-semibold">Not merely to create voices, but to encourage informed ones.</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. THE CLOSING STATEMENT & CTAs
          Visual Environment: Deep Navy (#040812)
         ========================================================================= */}
      <section className="bg-[#040812] text-warmwhite py-28 lg:py-36 text-center border-t border-white/10">
        <div className="container-shell max-w-3xl mx-auto">
          <p className="eyebrow text-citrus mb-6 font-sans">11 / INVITATION TO DELIBERATION</p>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-warmwhite leading-tight uppercase">
            THINK DEEPLY. SPEAK FEARLESSLY. ENGAGE MEANINGFULLY.
          </h2>

          <p className="mt-6 text-base sm:text-lg text-neutral-300 leading-relaxed font-sans font-normal max-w-2xl mx-auto">
            The future is shaped by those willing to question, understand and contribute. We invite you to explore the Council, engage with its initiatives and become part of conversations that deserve to happen.
          </p>

          <div className="my-10">
            <span className="font-display text-2xl sm:text-3xl font-bold tracking-wider text-warmwhite block">
              THE VICHAAR COUNCIL
            </span>
            <span className="font-editorial italic text-gelato text-lg sm:text-xl block mt-1">
              Where Ideas Earn Their Weight.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/initiatives"
              className="inline-flex items-center gap-2 border border-citrus bg-citrus px-8 py-3.5 text-xs font-display font-bold tracking-[0.18em] text-ink transition-all duration-300 hover:scale-[1.03] hover:bg-gelato hover:border-gelato uppercase rounded-xs shadow-gold"
            >
              <span>EXPLORE OUR INITIATIVES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-8 py-3.5 text-xs font-display font-bold tracking-[0.18em] text-warmwhite transition-all duration-300 hover:border-citrus hover:text-citrus uppercase rounded-xs"
            >
              <span>DISCOVER OUR EVENTS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-seabreeze/40 bg-amalfi/30 px-8 py-3.5 text-xs font-display font-bold tracking-[0.18em] text-seabreeze transition-all duration-300 hover:bg-amalfi hover:text-warmwhite hover:border-amalfi uppercase rounded-xs"
            >
              <span>GET IN TOUCH</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
