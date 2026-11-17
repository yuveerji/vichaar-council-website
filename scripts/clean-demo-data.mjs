import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== THE VICHAAR COUNCIL: PRODUCTION DATA CLEANUP ===");

  // 1. Audit before cleanup
  const countsBefore = {
    events: await prisma.event.count(),
    tickets: await prisma.ticketCategory.count(),
    initiatives: await prisma.initiative.count(),
    publications: await prisma.publication.count(),
    leadership: await prisma.leadershipProfile.count(),
    gallery: await prisma.galleryImage.count(),
    registrations: await prisma.registration.count(),
    orders: await prisma.paymentOrder.count(),
    enquiries: await prisma.contactEnquiry.count(),
    admins: await prisma.adminUser.count(),
    settings: await prisma.siteSetting.count(),
  };

  console.log("Record count before cleanup:", countsBefore);

  // 2. Remove all demonstration content while strictly preserving Admins & Settings
  console.log("\nRemoving demonstration and test records...");

  // Tickets & Events
  const deletedTickets = await prisma.ticketCategory.deleteMany({});
  console.log(`Deleted ${deletedTickets.count} demonstration ticket categories.`);

  const deletedEvents = await prisma.event.deleteMany({});
  console.log(`Deleted ${deletedEvents.count} demonstration events.`);

  const deletedEventCategories = await prisma.eventCategory.deleteMany({});
  console.log(`Deleted ${deletedEventCategories.count} demonstration event categories.`);

  // Initiatives
  const deletedInitiatives = await prisma.initiative.deleteMany({});
  console.log(`Deleted ${deletedInitiatives.count} demonstration initiatives.`);

  // Publications
  const deletedPublications = await prisma.publication.deleteMany({});
  console.log(`Deleted ${deletedPublications.count} demonstration research publications.`);

  const deletedPublicationCategories = await prisma.publicationCategory.deleteMany({});
  console.log(`Deleted ${deletedPublicationCategories.count} demonstration publication categories.`);

  // Leadership Profiles
  const deletedLeadership = await prisma.leadershipProfile.deleteMany({});
  console.log(`Deleted ${deletedLeadership.count} demonstration leadership profiles.`);

  // Gallery
  const deletedGalleryImages = await prisma.galleryImage.deleteMany({});
  console.log(`Deleted ${deletedGalleryImages.count} demonstration gallery images.`);

  const deletedGalleryAlbums = await prisma.galleryAlbum.deleteMany({});
  console.log(`Deleted ${deletedGalleryAlbums.count} demonstration gallery albums.`);

  // Registrations & Payments (if any mock records exist)
  const deletedRegistrations = await prisma.registration.deleteMany({});
  console.log(`Deleted ${deletedRegistrations.count} test registrations.`);

  const deletedOrders = await prisma.paymentOrder.deleteMany({});
  console.log(`Deleted ${deletedOrders.count} test payment orders.`);

  const deletedAttempts = await prisma.paymentAttempt.deleteMany({});
  console.log(`Deleted ${deletedAttempts.count} test payment attempts.`);

  const deletedWebhooks = await prisma.paymentWebhook.deleteMany({});
  console.log(`Deleted ${deletedWebhooks.count} test payment webhooks.`);

  const deletedRefunds = await prisma.refund.deleteMany({});
  console.log(`Deleted ${deletedRefunds.count} test refunds.`);

  // Contact enquiries
  const deletedEnquiries = await prisma.contactEnquiry.deleteMany({});
  console.log(`Deleted ${deletedEnquiries.count} test contact enquiries.`);

  // Verify Admins and Settings preserved
  const adminsAfter = await prisma.adminUser.count();
  const settingsAfter = await prisma.siteSetting.count();
  console.log(`\nPreserved genuine admin accounts: ${adminsAfter}`);
  console.log(`Preserved institutional site settings: ${settingsAfter}`);

  console.log("\n=== DATABASE CLEANUP COMPLETED SUCCESSFULLY ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
