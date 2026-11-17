import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const registrations = await prisma.registration.findMany({
    include: {
      paymentOrder: true,
      participant: true,
      event: { select: { title: true } }
    }
  });
  console.log("REGISTRATIONS COUNT:", registrations.length);
  for (const r of registrations) {
    console.log({
      id: r.id,
      regNo: r.registrationNumber,
      name: r.fullName,
      email: r.email,
      participantId: r.participantId,
      participantUsername: r.participant?.username,
      status: r.paymentStatus,
      createdAt: r.createdAt,
      orderId: r.paymentOrder?.orderId,
      notes: r.notes
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
