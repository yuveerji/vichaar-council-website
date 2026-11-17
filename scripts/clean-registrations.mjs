import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== CLEARING ALL TEST REGISTRATIONS AND PASSES ===");

  const delCerts = await prisma.participantCertificate.deleteMany({});
  console.log(`Deleted ${delCerts.count} certificates.`);

  const delAttempts = await prisma.paymentAttempt.deleteMany({});
  console.log(`Deleted ${delAttempts.count} payment attempts.`);

  const delWebhooks = await prisma.paymentWebhook.deleteMany({});
  console.log(`Deleted ${delWebhooks.count} payment webhooks.`);

  const delOrders = await prisma.paymentOrder.deleteMany({});
  console.log(`Deleted ${delOrders.count} payment orders.`);

  const delRegs = await prisma.registration.deleteMany({});
  console.log(`Deleted ${delRegs.count} registrations.`);

  const delNotifs = await prisma.participantNotification.deleteMany({
    where: {
      OR: [
        { type: "REGISTRATION" },
        { title: { contains: "Registration" } },
        { title: { contains: "Admission" } }
      ]
    }
  });
  console.log(`Deleted ${delNotifs.count} registration notifications.`);

  const resetEvents = await prisma.event.updateMany({
    data: { registeredCount: 0 }
  });
  console.log(`Reset registeredCount to 0 for ${resetEvents.count} events.`);

  console.log("=== REGISTRATIONS CLEANUP COMPLETE ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
