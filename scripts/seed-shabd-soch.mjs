import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedShabdSoch() {
  console.log("--> Seeding official event: SHABD & SOCH (Updated: Phase 1-7, ₹549 fee)");

  const category = await prisma.eventCategory.upsert({
    where: { slug: "debate-social" },
    update: {
      name: "Debate & Social Experience",
      description: "Deliberation forums integrating competitive debating with interactive entertainment and youth social connection."
    },
    create: {
      name: "Debate & Social Experience",
      slug: "debate-social",
      description: "Deliberation forums integrating competitive debating with interactive entertainment and youth social connection."
    }
  });

  const shabdSochAgenda = [
    {
      phase: "Phase 1",
      time: "Phase 1",
      title: "Registrations & Opening Ceremony",
      description: "Delegate accreditation, welcome assembly, orientation to parliamentary debate rules, and announcement of the central agenda."
    },
    {
      phase: "Phase 2",
      time: "Phase 2",
      title: "Round 1 — The Original Stance",
      description: "Participants defend their originally assigned positions on the central agenda with structured opening speeches, cross-examination, and rebuttal."
    },
    {
      phase: "Phase 3",
      time: "Phase 3",
      title: "Lunch Break & Refreshments",
      description: "Curated networking lunch, informal deliberations, and delegate engagement."
    },
    {
      phase: "Phase 4",
      time: "Phase 4",
      title: "Round 2 — The Flipped Stance",
      description: "The challenge takes a turn. Participants switch sides to defend the opposite position on the very same agenda, testing empathy and intellectual agility."
    },
    {
      phase: "Phase 5",
      time: "Phase 5",
      title: "MoE — Motion of Entertainment",
      description: "A dynamic, high-energy interactive entertainment segment designed to encourage creative expression and camaraderie."
    },
    {
      phase: "Phase 6",
      time: "Phase 6",
      title: "Closing Ceremony & Commendations",
      description: "Institutional summary, adjudicator feedback, recognition of distinguished delegates, and presentation of awards."
    },
    {
      phase: "Phase 7",
      time: "Phase 7",
      title: "Special Surprise: Recurring Jamming Session & Socials",
      description: "Our signature recurring acoustic Jamming Session and social experience. An exclusive live music open floor where delegates unwind, sing along, celebrate together, and create lasting memories."
    }
  ];

  const shabdSochFaqs = [
    {
      question: "Who is eligible to participate in SHABD & SOCH?",
      answer: "SHABD & SOCH is specifically curated for students from Classes 7th to 12th. Both seasoned debaters and first-time speakers are warmly welcome."
    },
    {
      question: "What is the two-round flipped debate format?",
      answer: "In Round 1, participants defend an assigned stance on the central agenda. In Round 2, delegates flip sides to defend the counter-perspective. This tests open-mindedness, nuance, and mastery of competing ideas."
    },
    {
      question: "What is the registration fee?",
      answer: "The registration fee is ₹549 per delegate, covering all 7 event phases, debating adjudication, delegate materials, refreshments, and access to the live jamming social."
    },
    {
      question: "Where will the event be hosted?",
      answer: "The event is scheduled for 20 December 2026 in Udaipur, Rajasthan. The exact ratified auditorium venue will be announced to all registered delegates in advance."
    },
    {
      question: "What is the Special Surprise recurring Jamming Session?",
      answer: "The Special Surprise recurring Jamming Session is The Vichaar Council's signature social tradition. At the close of intense parliamentary and flipped debate rounds, delegates gather for an acoustic, participatory live music jamming session designed to celebrate thought, expression, camaraderie, and youthful connection."
    },
    {
      question: "What is MoE (Motion of Entertainment)?",
      answer: "Beyond competitive debate, SHABD & SOCH celebrates youth culture with interactive entertainment rounds, creative challenges, and an engaging shared atmosphere."
    }
  ];

  const shabdSochEvent = await prisma.event.upsert({
    where: { slug: "shabd-and-soch" },
    update: {
      title: "SHABD & SOCH: A Full-Day Debate & Social Experience",
      summary: "A full-day debating and social experience for Classes 7th to 12th. One central agenda, two flipped rounds, Motion of Entertainment, and our signature Special Surprise recurring Jamming Session.",
      description: `WHERE WORDS MEET THOUGHT.\n\nSHABD & SOCH is a full-day debating and social experience organised by The Vichaar Council (Powered by Zenvitra), bringing together young minds for a day of arguments, perspectives, intellectual exchange, entertainment and meaningful connections.\n\nDesigned for students from Classes 7th to 12th, the event creates a space where participants can question ideas, challenge perspectives, articulate their thoughts and engage with issues that shape the world around them.\n\nAt the heart of SHABD & SOCH lies a unique two-round debate experience built around one central agenda. Participants first defend their original positions and then face the challenge of switching sides, arguing for the very perspective they previously opposed.\n\nBeyond debating, SHABD & SOCH features dedicated creative and social spaces: the high-energy MoE — Motion of Entertainment, and our flagship Special Surprise: a recurring live Jamming Session where young delegates connect, sing along, celebrate, and build lasting friendships.\n\nFormat: In-person debating fest with interactive entertainment and social experiences across 7 chronological phases.`,
      categoryId: category.id,
      categoryName: category.name,
      format: "IN_PERSON",
      venue: "Venue to be announced (TBA)",
      city: "Udaipur",
      startDate: new Date("2026-12-20T09:30:00.000Z"),
      endDate: new Date("2026-12-20T16:00:00.000Z"),
      coverImage: "/assets/homepage_background.png",
      status: "REGISTRATION_OPEN",
      isPublished: true,
      isFeatured: true,
      agendaJson: JSON.stringify(shabdSochAgenda),
      faqsJson: JSON.stringify(shabdSochFaqs)
    },
    create: {
      title: "SHABD & SOCH: A Full-Day Debate & Social Experience",
      slug: "shabd-and-soch",
      summary: "A full-day debating and social experience for Classes 7th to 12th. One central agenda, two flipped rounds, Motion of Entertainment, and our signature Special Surprise recurring Jamming Session.",
      description: `WHERE WORDS MEET THOUGHT.\n\nSHABD & SOCH is a full-day debating and social experience organised by The Vichaar Council (Powered by Zenvitra), bringing together young minds for a day of arguments, perspectives, intellectual exchange, entertainment and meaningful connections.\n\nDesigned for students from Classes 7th to 12th, the event creates a space where participants can question ideas, challenge perspectives, articulate their thoughts and engage with issues that shape the world around them.\n\nAt the heart of SHABD & SOCH lies a unique two-round debate experience built around one central agenda. Participants first defend their original positions and then face the challenge of switching sides, arguing for the very perspective they previously opposed.\n\nBeyond debating, SHABD & SOCH features dedicated creative and social spaces: the high-energy MoE — Motion of Entertainment, and our flagship Special Surprise: a recurring live Jamming Session where young delegates connect, sing along, celebrate, and build lasting friendships.\n\nFormat: In-person debating fest with interactive entertainment and social experiences across 7 chronological phases.`,
      categoryId: category.id,
      categoryName: category.name,
      format: "IN_PERSON",
      venue: "Venue to be announced (TBA)",
      city: "Udaipur",
      startDate: new Date("2026-12-20T09:30:00.000Z"),
      endDate: new Date("2026-12-20T16:00:00.000Z"),
      coverImage: "/assets/homepage_background.png",
      status: "REGISTRATION_OPEN",
      isPublished: true,
      isFeatured: true,
      agendaJson: JSON.stringify(shabdSochAgenda),
      faqsJson: JSON.stringify(shabdSochFaqs)
    }
  });

  // Ticket Categories: ₹549 Registration Fee
  await prisma.ticketCategory.deleteMany({
    where: { eventId: shabdSochEvent.id }
  });

  const delegateTicket = await prisma.ticketCategory.create({
    data: {
      eventId: shabdSochEvent.id,
      name: "Delegate Pass (Classes 7th to 12th)",
      description: "Full accreditation pass for Classes 7th to 12th. Includes Round 1 & Round 2 debate entries, MoE participation, lunch & refreshments, live jamming socials, and official certificate.",
      price: 549,
      capacity: 99999,
      soldCount: 0,
      isActive: true
    }
  });

  console.log(`[SEEDED] SHABD & SOCH (ID: ${shabdSochEvent.id}) with ticket price ₹${delegateTicket.price}`);
  return shabdSochEvent;
}

if (process.argv[1]?.endsWith("seed-shabd-soch.mjs")) {
  seedShabdSoch()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
