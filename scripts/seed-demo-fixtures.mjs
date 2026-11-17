import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding The Vichaar Council database...");

  // 1. Admin User
  const passwordHash = await bcrypt.hash("CouncilAdmin@2026!", 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@thevichaarcouncil.in" },
    update: { passwordHash },
    create: {
      email: "admin@thevichaarcouncil.in",
      name: "Senior Secretariat Director",
      passwordHash,
      role: "SUPER_ADMIN"
    }
  });
  console.log("Admin seeded:", admin.email);

  // 2. Categories
  const catDebate = await prisma.eventCategory.upsert({
    where: { slug: "debate-dialogue" },
    update: {},
    create: {
      name: "Debate & Dialogue",
      slug: "debate-dialogue",
      description: "Structured public arguments, parliamentary debates and dialectical encounters."
    }
  });

  const catPolicy = await prisma.eventCategory.upsert({
    where: { slug: "public-policy" },
    update: {},
    create: {
      name: "Public Policy & Governance",
      slug: "public-policy",
      description: "Rigorous examination of legislative, economic and social policy frameworks."
    }
  });

  const catDiplomacy = await prisma.eventCategory.upsert({
    where: { slug: "diplomacy" },
    update: {},
    create: {
      name: "Diplomacy & Global Affairs",
      slug: "diplomacy",
      description: "International relations, multilateral negotiations and strategic affairs."
    }
  });

  // 3. Events
  const event1 = await prisma.event.upsert({
    where: { slug: "national-youth-policy-forum-2026" },
    update: {},
    create: {
      title: "The National Youth Policy Forum 2026",
      slug: "national-youth-policy-forum-2026",
      summary: "India's premier independent deliberative assembly bringing 200 young scholars, legal minds and civic leaders together.",
      description: `The National Youth Policy Forum is the flagship assembly of The Vichaar Council. Over two intense days of structured deliberation, participants examine India's evolving policy landscape across three core committees: Constitutional & Legal Reforms, Economic Sovereignty in the Digital Age, and Federal Institutional Design.\n\nDelegates engage with institutional experts, draft legislative working papers, and defend their recommendations before a panel of former jurists, civil servants, and senior editors. This forum is not an academic exercise; the final Policy White Paper is compiled and submitted to relevant parliamentary standing committees and civil society think tanks.`,
      categoryId: catPolicy.id,
      categoryName: "Public Policy & Governance",
      format: "IN_PERSON",
      venue: "India Habitat Centre, Lodhi Road",
      city: "New Delhi",
      startDate: new Date("2026-12-18T09:00:00Z"),
      endDate: new Date("2026-12-19T18:00:00Z"),
      coverImage: "/assets/homepage_background.png",
      status: "REGISTRATION_OPEN",
      isPublished: true,
      isFeatured: true,
      capacity: 200,
      registeredCount: 38,
      contactEmail: "secretariat@thevichaarcouncil.in",
      agendaJson: JSON.stringify([
        { time: "09:00 AM", title: "Registration & Plenary Induction", description: "Verification of delegate credentials and committee docket distribution." },
        { time: "10:30 AM", title: "Keynote Address: Institutional Resilience", description: "Opening address on the constitutional responsibilities of the next generation." },
        { time: "11:45 AM", title: "Committee Session I: Clause-by-Clause Scrutiny", description: "Deliberation on draft legislative frameworks and stakeholder evidence." },
        { time: "02:30 PM", title: "Committee Session II: Moderated Policy Caucus", description: "Negotiating consensus, amendments, and cross-caucus voting." },
        { time: "05:00 PM", title: "Plenary Presentation & White Paper Adoption", description: "Presentation of committee resolutions to the Advisory Board." }
      ]),
      speakersJson: JSON.stringify([
        { name: "Dr. K. S. Parthasarathy", title: "Distinguished Jurist & Senior Advocate", bio: "Former Dean of Constitutional Studies with four decades of appellate practice." },
        { name: "Amb. Arundhati Roy-Chowdhury", title: "Former Ambassador & Strategic Analyst", bio: "Specialist in multilateral diplomatic statecraft and South Asian treaties." },
        { name: "Vikramaditya Sharma", title: "Chief Economic Fellow, Vichaar Institute", bio: "Researches fiscal federalism and state expenditure dynamics." }
      ]),
      faqsJson: JSON.stringify([
        { question: "Who is eligible to participate?", answer: "Open to students, researchers, policy fellows, and young professionals aged 16 to 28." },
        { question: "Is accommodation provided for outstation delegates?", answer: "Delegates may opt for subsidized institutional hostel accommodations upon registration approval." },
        { question: "What is the cancellation and refund policy?", answer: "Registrations can be refunded up to 7 days before the forum, subject to standard gateway processing fees." }
      ]),
      tickets: {
        create: [
          {
            name: "Standard Delegate Pass",
            price: 499.0,
            capacity: 120,
            soldCount: 24,
            description: "Access to all committee sessions, delegate docket, luncheon, and official Certificate of Deliberation."
          },
          {
            name: "Student & Research Scholar Pass",
            price: 249.0,
            capacity: 60,
            soldCount: 14,
            description: "Subsidized pass for active university and school scholars (valid institutional ID required)."
          },
          {
            name: "Institutional Observer Pass",
            price: 0.0,
            capacity: 20,
            soldCount: 0,
            description: "Complimentary access for accredited faculty advisors and partner institution observers."
          }
        ]
      }
    }
  });

  const event2 = await prisma.event.upsert({
    where: { slug: "vichaar-parliament-simulation-winter-2026" },
    update: {},
    create: {
      title: "Vichaar Parliamentary Simulation: The Winter Assembly",
      slug: "vichaar-parliament-simulation-winter-2026",
      summary: "A rigorous bicameral legislative simulation examining national emergency powers and federal governance.",
      description: `The Vichaar Parliament Simulation reproduces the exact procedures, conventions, and rhetorical standards of parliamentary proceedings. Participants are assigned portfolios across the Treasury Benches, the Opposition, and Independent members to debate a specially drafted Private Member's Bill on Digital Sovereignty and Surveillance Safeguards.\n\nEvery intervention is timed, points of order are ruled by a senior presiding officer, and votes are conducted by formal division.`,
      categoryId: catDebate.id,
      categoryName: "Debate & Dialogue",
      format: "IN_PERSON",
      venue: "Constitutional Assembly Hall, New Delhi",
      city: "New Delhi",
      startDate: new Date("2026-11-28T10:00:00Z"),
      endDate: new Date("2026-11-28T19:00:00Z"),
      coverImage: "/assets/homepage_background.png",
      status: "REGISTRATION_OPEN",
      isPublished: true,
      isFeatured: true,
      capacity: 100,
      registeredCount: 42,
      contactEmail: "parliament@thevichaarcouncil.in",
      agendaJson: JSON.stringify([
        { time: "10:00 AM", title: "Opening of the House & Question Hour", description: "Oral answers to star-marked ministerial questions." },
        { time: "11:30 AM", title: "Zero Hour Submissions", description: "Urgent matters of national importance raised without prior notice." },
        { time: "01:30 PM", title: "Legislative Business: Digital Sovereignty Bill", description: "First and second reading of the draft statute." },
        { time: "04:30 PM", title: "Clause-by-Clause Voting & Division", description: "Formal recording of votes and assent." }
      ]),
      speakersJson: JSON.stringify([
        { name: "Prashant Sengupta", title: "Speaker Pro-Tem & Constitutional Historian", bio: "Advises parliamentary research groups on legislative drafting." }
      ]),
      faqsJson: JSON.stringify([
        { question: "Is prior MUN or debating experience required?", answer: "No. A comprehensive rules of procedure briefing docket is provided upon confirmation." }
      ]),
      tickets: {
        create: [
          {
            name: "Member of Parliament (Delegate)",
            price: 799.0,
            capacity: 75,
            soldCount: 30,
            description: "Full debating portfolio with speaking rights, legislative voting privileges, and formal docket."
          },
          {
            name: "Press Gallery & Journalist Pass",
            price: 399.0,
            capacity: 25,
            soldCount: 12,
            description: "Access to the Press Gallery, press conferences, and the right to file dispatches for the Assembly Gazette."
          }
        ]
      }
    }
  });

  const event3 = await prisma.event.upsert({
    where: { slug: "south-asian-diplomatic-conclave" },
    update: {},
    create: {
      title: "The South Asian Diplomatic Conclave",
      slug: "south-asian-diplomatic-conclave",
      summary: "A high-level diplomatic simulation negotiating cross-border water sharing, energy grids, and regional trade.",
      description: `Bringing together delegates representing regional powers, international observers, and civil society actors to negotiate binding multilateral accords under real-time simulated diplomatic crises.`,
      categoryId: catDiplomacy.id,
      categoryName: "Diplomacy & Global Affairs",
      format: "HYBRID",
      venue: "Vigyan Bhawan & Digital Delegation Gateway",
      city: "New Delhi",
      startDate: new Date("2027-01-23T10:00:00Z"),
      endDate: new Date("2027-01-24T18:00:00Z"),
      coverImage: "/assets/homepage_background.png",
      status: "UPCOMING",
      isPublished: true,
      isFeatured: false,
      capacity: 150,
      registeredCount: 15,
      contactEmail: "diplomacy@thevichaarcouncil.in",
      tickets: {
        create: [
          {
            name: "Plenipotentiary Envoy (In-Person)",
            price: 999.0,
            capacity: 80,
            soldCount: 10,
            description: "In-person participation at Vigyan Bhawan, bilateral negotiation suites, and official protocol reception."
          },
          {
            name: "Virtual Delegated Scholar",
            price: 0.0,
            capacity: 70,
            soldCount: 5,
            description: "Fully digital access to the live negotiation streams and observer caucus."
          }
        ]
      }
    }
  });
  console.log("Events seeded:", [event1.title, event2.title, event3.title]);

  // 4. Initiatives
  const initiativesData = [
    {
      title: "The National Youth Policy Forum",
      slug: "national-youth-policy-forum",
      category: "Public Discourse",
      summary: "A recurring deliberative assembly where young researchers and thinkers draft, debate, and deliver structured policy white papers to institutional stakeholders.",
      content: `The National Youth Policy Forum is rooted in the belief that youth participation in national governance should not be decorative. It is an annual convening that bridges academic inquiry with practical policy drafting.\n\nCommittees focus on fiscal governance, legal clarity, civil liberties, and technological policy. The proceedings are governed by strict parliamentary standards, producing actionable recommendations that are published and disseminated across institutional networks.`,
      coverImage: "/assets/homepage_background.png",
      status: "ACTIVE",
      orderIndex: 1
    },
    {
      title: "Vichaar Parliamentary Simulation",
      slug: "vichaar-parliamentary-simulation",
      category: "Debate & Rhetoric",
      summary: "A faithful, non-partisan recreation of India's legislative mechanisms, training young minds in the demanding art of parliamentary questioning and statutory scrutiny.",
      content: `Too often, public perception of parliamentary debate focuses on theatrics. The Vichaar Parliamentary Simulation trains participants in the actual machinery of democratic lawmaking: Question Hour scrutiny, Private Members' Bills, Zero Hour submissions, and clause-by-clause amendments.\n\nParticipants represent diverse political philosophies without personal bias, learning to appreciate the weight of every statutory phrase and the procedural safeguards that protect minority viewpoints.`,
      coverImage: "/assets/homepage_background.png",
      status: "ACTIVE",
      orderIndex: 2
    },
    {
      title: "Critical Inquiry Labs",
      slug: "critical-inquiry-labs",
      category: "Research Labs",
      summary: "Intensive, semester-long research groups led by university fellows examining pressing sociological, economic, and geopolitical questions.",
      content: `The Critical Inquiry Labs provide high-school and university researchers with methodological mentorship. Fellows meet weekly to deconstruct seminal philosophical texts, analyze empirical datasets, and produce rigorously peer-reviewed working papers.\n\nOur labs operate on a culture of intellectual humility and relentless verification—refusing to accept conventional wisdom without systematic evidence.`,
      coverImage: "/assets/homepage_background.png",
      status: "ACTIVE",
      orderIndex: 3
    },
    {
      title: "The South Asian Diplomatic Conclave",
      slug: "south-asian-diplomatic-conclave-initiative",
      category: "Diplomacy",
      summary: "An international relations initiative dedicated to fostering cross-border dialogue, multilateral diplomacy, and regional dispute resolution.",
      content: `Regional stability in South Asia requires an intellectual cadre fluent in the nuances of bilateral diplomacy, trade integration, and conflict mitigation. The Diplomatic Conclave gathers aspiring diplomats and foreign-policy analysts to negotiate multilateral treaties under realistic crisis simulations.`,
      coverImage: "/assets/homepage_background.png",
      status: "ACTIVE",
      orderIndex: 4
    },
    {
      title: "Discourse India Journal",
      slug: "discourse-india-journal",
      category: "Publications",
      summary: "The official peer-reviewed publication of The Vichaar Council, featuring long-form essays, constitutional analyses, and critical reviews.",
      content: `Published tri-annually, Discourse India offers a home for articulate, non-partisan inquiry. It welcomes submissions from students, faculty, and independent scholars who bring disciplined intellectual rigor to bear on contemporary challenges.`,
      coverImage: "/assets/homepage_background.png",
      status: "ACTIVE",
      orderIndex: 5
    }
  ];

  for (const init of initiativesData) {
    await prisma.initiative.upsert({
      where: { slug: init.slug },
      update: {},
      create: init
    });
  }
  console.log("Initiatives seeded.");

  // 5. Research & Publications
  const publicationsData = [
    {
      title: "Constitutional Moralism in an Age of Hyper-Polarisation",
      slug: "constitutional-moralism-age-of-hyper-polarisation",
      subtitle: "Why procedural adherence must prevail over ideological expediency in democratic deliberations.",
      categoryName: "Policy Analysis",
      authorName: "Adv. Raghav Vashisht",
      authorRole: "Director of Legal Studies, The Vichaar Council",
      authorBio: "Constitutional lawyer and researcher specializing in federalism and judicial review.",
      readTimeMinutes: 7,
      isFeatured: true,
      content: `Democracy is frequently celebrated as the triumphant expression of popular will. Yet the foundational achievement of constitutionalism is precisely the opposite: to establish deliberate, counter-majoritarian barriers that prevent transient political majorities from eroding institutional stability.\n\nIn contemporary public life, we observe a growing temptation to view procedure as an inconvenient obstruction to moral righteousness. Whether on television panels or legislative chambers, the argument is increasingly framed as a binary clash of good against evil.\n\n### The Erosion of Procedural Fidelity\n\nWhen procedural norms are disregarded in pursuit of a supposedly noble objective, the institution itself suffers irreversible damage. A legal order cannot be sustained on moral self-congratulation; it requires predictable, universally applicable procedural safeguards.\n\nTo restore health to our deliberative bodies, we must re-anchor our civic culture in what Dr. B.R. Ambedkar termed *constitutional morality*—a disciplined deference to institutional forms, mutual tolerance, and the recognition that one's opponents are legitimate participants in the republic.`,
      citationsJson: JSON.stringify([
        "Ambedkar, B. R. (1948). Speech in the Constituent Assembly on the Draft Constitution.",
        "Austin, Granville (1966). The Indian Constitution: Cornerstone of a Nation. Oxford University Press.",
        "Baxi, Upendra (2010). 'The Rule of Law in India.' SUR International Journal on Human Rights."
      ])
    },
    {
      title: "The Architecture of Public Reason: Reviving Dialectical Disagreement",
      slug: "architecture-of-public-reason",
      subtitle: "How modern debating ecosystems have abandoned rigorous enquiry for performative antagonism.",
      categoryName: "Editorial",
      authorName: "Dr. Ananya Sen",
      authorRole: "Academic Fellow in Philosophy",
      authorBio: "Researches epistemology, deliberative democracy, and ancient Indian debating traditions (Vāda Vidhi).",
      readTimeMinutes: 5,
      isFeatured: false,
      content: `In the classical Indian philosophical tradition, discourse (*Vāda*) was strictly distinguished from mere polemical dispute (*Jalpa*) or destructive cavil (*Vitaṇḍā*). In *Vāda*, both interlocutors entered the chamber with a common commitment to the pursuit of truth (*Tattva-bubhutsu*).\n\nToday, modern digital spaces and competitive debating formats have largely devolved into *Vitaṇḍā*—where victory is measured not by the illumination of truth, but by the humiliating dismantling of an opponent's speech.\n\n### Recovering Epistemic Charity\n\nAt The Vichaar Council, our primary objective is to cultivate the discipline of epistemic charity: the intellectual obligation to interpret an opponent's argument in its strongest, most articulate form before seeking to critique it. Only when ideas are tested against their strongest formulation can intellectual progress occur.`,
      citationsJson: JSON.stringify([
        "Nyāya Sūtras of Akṣapāda Gautama (c. 2nd century CE), Chapter 1: On Vāda, Jalpa, and Vitaṇḍā.",
        "Rawls, John (1993). Political Liberalism. Columbia University Press."
      ])
    },
    {
      title: "Youth Civic Mobilisation and the Reform of Municipal Governance",
      slug: "youth-civic-mobilisation-municipal-governance",
      subtitle: "Empirical findings from civic audits conducted across Tier-1 and Tier-2 Indian urban wards.",
      categoryName: "Research",
      authorName: "Devika Nair",
      authorRole: "Research Lead, Urban Governance Initiative",
      authorBio: "Urban policy researcher examining decentralization and 74th Constitutional Amendment implementation.",
      readTimeMinutes: 8,
      isFeatured: false,
      content: `While youth political activism is frequently visible around national elections and digital campaigns, there remains a glaring deficit in structured youth engagement with local urban governance.\n\nOur year-long audit across twenty municipal wards revealed that fewer than 4% of university students were aware of their local Ward Committee meetings or the statutory allocation of municipal councillor funds.\n\n### The Case for Ward-Level Youth Assemblies\n\nBy institutionalizing Ward-Level Youth Assemblies, municipal corporations can tap into the technical expertise, digital literacy, and civic enthusiasm of young residents to solve tangible urban dilemmas: waste management, public transit safety, and public green spaces.`,
      citationsJson: JSON.stringify([
        "Ministry of Housing and Urban Affairs (2023). Report on Urban Local Body Governance and Fiscal Autonomy.",
        "Janaagraha Centre for Citizenship and Democracy (2022). Annual Survey of India's City-Systems."
      ])
    }
  ];

  for (const pub of publicationsData) {
    await prisma.publication.upsert({
      where: { slug: pub.slug },
      update: {},
      create: pub
    });
  }
  console.log("Publications seeded.");

  // 6. Leadership Profiles
  const leadershipData = [
    {
      fullName: "Arjun R. Menon",
      roleTitle: "President & Convener",
      category: "EXECUTIVE_BOARD",
      bio: "Leads institutional strategy and external partnerships. Longtime competitive parliamentary debater and public policy researcher.",
      orderIndex: 1,
      linkedinUrl: "https://linkedin.com/company/vichaar-council"
    },
    {
      fullName: "Kavya Deshmukh",
      roleTitle: "Secretary-General & Head of Deliberations",
      category: "EXECUTIVE_BOARD",
      bio: "Oversees committee logistics, debate adjudication standards, and delegate curriculum across all national assemblies.",
      orderIndex: 2,
      linkedinUrl: "https://linkedin.com/company/vichaar-council"
    },
    {
      fullName: "Tanishq Singhania",
      roleTitle: "Director of Research & Publications",
      category: "ACADEMIC_COUNCIL",
      bio: "Coordinates the Critical Inquiry Labs and edits Discourse India Journal. Researches comparative constitutional law.",
      orderIndex: 3,
      linkedinUrl: "https://linkedin.com/company/vichaar-council"
    },
    {
      fullName: "Meera Subramanian",
      roleTitle: "Director of International Diplomacy",
      category: "SECRETARIAT",
      bio: "Oversees regional diplomatic simulations and bilateral student delegations with South Asian academic institutions.",
      orderIndex: 4,
      linkedinUrl: "https://linkedin.com/company/vichaar-council"
    }
  ];

  for (const lead of leadershipData) {
    await prisma.leadershipProfile.create({
      data: lead
    });
  }
  console.log("Leadership seeded.");

  // 7. Gallery
  const galleryData = [
    {
      title: "Plenary Chamber Debate at India Habitat Centre",
      category: "CONFERENCES",
      caption: "Delegates engaging in moderated caucus during the National Youth Policy Forum.",
      imageUrl: "/assets/homepage_background.png",
      eventTag: "NYPF 2026",
      date: "October 2026",
      orderIndex: 1
    },
    {
      title: "Question Hour at the Parliamentary Simulation",
      category: "DEBATES",
      caption: "Treasury and Opposition members scrutinizing the Private Member's Bill.",
      imageUrl: "/assets/homepage_background.png",
      eventTag: "Vichaar Parliament",
      date: "September 2026",
      orderIndex: 2
    },
    {
      title: "Bilateral Diplomatic Caucus",
      category: "DIPLOMACY",
      caption: "Envoys negotiating draft treaty clauses during the Diplomatic Conclave.",
      imageUrl: "/assets/homepage_background.png",
      eventTag: "Diplomatic Conclave",
      date: "August 2026",
      orderIndex: 3
    },
    {
      title: "Roundtable on Constitutional Moralism",
      category: "DISCOURSE",
      caption: "Senior scholars and student fellows in dialogic seminar.",
      imageUrl: "/assets/homepage_background.png",
      eventTag: "Critical Inquiry Labs",
      date: "July 2026",
      orderIndex: 4
    }
  ];

  for (const gal of galleryData) {
    await prisma.galleryImage.create({
      data: gal
    });
  }
  console.log("Gallery seeded.");

  // 8. Site Settings
  const defaultSettings = [
    { key: "SITE_NAME", value: "The Vichaar Council", description: "Official institution name" },
    { key: "SITE_TAGLINE", value: "WHERE IDEAS EARN THEIR WEIGHT.", description: "Official institutional tagline" },
    { key: "OFFICIAL_EMAIL", value: "contact@thevichaarcouncil.in", description: "Primary contact address" },
    { key: "OFFICIAL_PHONE", value: "+91 11 4982 7100", description: "Secretariat telephone line" },
    { key: "OFFICE_ADDRESS", value: "Institutional Area, Lodhi Road, New Delhi 110003, India", description: "Official correspondence address" },
    { key: "CASHFREE_STATUS", value: "SANDBOX_ACTIVE", description: "Payment gateway integration mode" }
  ];

  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s
    });
  }
  console.log("Site settings seeded.");

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
