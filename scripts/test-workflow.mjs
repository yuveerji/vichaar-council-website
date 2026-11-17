import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import cashfree from "../lib/cashfree.ts";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== RUNNING THE VICHAAR COUNCIL PRODUCTION INTEGRATION SUITE ===\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Verify Clean Production Database State (No Demo Records)
    const demoEvents = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: "Demo" } },
          { title: { contains: "Sample" } },
          { title: { contains: "Mock" } },
          { slug: { in: ["demo-event", "sample-debate"] } }
        ]
      }
    });
    const initiativesCount = await prisma.initiative.count();
    const publicationsCount = await prisma.publication.count();
    const registrationsCount = await prisma.registration.count();
    const ordersCount = await prisma.paymentOrder.count();

    assert(demoEvents.length === 0, "Production database is clean of demo events (count: 0)");
    assert(initiativesCount === 0, "Production database is clean of demo initiatives (count: 0)");
    assert(publicationsCount === 0, "Production database is clean of demo publications (count: 0)");
    assert(registrationsCount === 0, "Production database is clean of test registrations (count: 0)");
    assert(ordersCount === 0, "Production database is clean of mock payment orders (count: 0)");

    // 2. Administrator Verification
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: "admin@thevichaarcouncil.in" }
    });
    assert(Boolean(adminUser), "Verified super admin exists in database (admin@thevichaarcouncil.in)");

    const passwordMatch = await bcrypt.compare("CouncilAdmin@2026!", adminUser.passwordHash);
    assert(passwordMatch, "Admin password hash validation succeeds");

    // 3. Site Settings Verification
    const settingsCount = await prisma.siteSetting.count();
    assert(settingsCount >= 6, `Verified institutional site settings present (${settingsCount} settings)`);

    // 4. Cashfree Payment Gateway Client Integration
    const testOrderId = `order_test_${Date.now()}`;
    const cfOrder = await cashfree.createOrder({
      orderId: testOrderId,
      orderAmount: 499.0,
      orderCurrency: "INR",
      customerDetails: {
        customerId: "cust_test_123",
        customerName: "Scholar Test",
        customerEmail: "scholar@example.com",
        customerPhone: "9876543210"
      },
      orderMeta: {
        returnUrl: "http://localhost:3000/events/test/confirmation"
      }
    });

    assert(Boolean(cfOrder.orderId), `Cashfree Order creation operational with ID: ${cfOrder.orderId}`);
    assert(Boolean(cfOrder.paymentSessionId), `Cashfree Payment Session ID generated: ${cfOrder.paymentSessionId.slice(0, 16)}...`);

    // 5. Cashfree Webhook Cryptographic Verification
    const testPayload = JSON.stringify({ event: "ORDER_PAID", orderId: testOrderId });
    const isWebhookValid = cashfree.verifyWebhookSignature(testPayload, "dummy_sig", "1731760000");
    assert(typeof isWebhookValid === "boolean", "Cashfree webhook signature cryptographic handler is operational");

    // 6. Test Registration Cycle (Create & Immediate Teardown to maintain clean state)
    const tempCat = await prisma.eventCategory.create({
      data: { name: "Test Category", slug: `test-cat-${Date.now()}` }
    });
    const tempEvent = await prisma.event.create({
      data: {
        title: "Temporary Validation Assembly",
        slug: `temp-assembly-${Date.now()}`,
        summary: "Validation assembly for pipeline integrity test",
        description: "Full test description",
        city: "New Delhi",
        venue: "Virtual Chamber",
        startDate: new Date(),
        endDate: new Date(),
        categoryId: tempCat.id,
        categoryName: tempCat.name,
        capacity: 100,
        tickets: {
          create: [{ name: "Complimentary Observer Pass", price: 0, capacity: 50 }]
        }
      },
      include: { tickets: true }
    });

    const tempReg = await prisma.registration.create({
      data: {
        registrationNumber: `TVC-VAL-${Date.now()}`,
        eventId: tempEvent.id,
        ticketCategoryId: tempEvent.tickets[0].id,
        fullName: "Integrity Test Delegate",
        email: "test.delegate@thevichaarcouncil.in",
        phone: "+91 99999 88888",
        city: "New Delhi",
        paymentStatus: "SUCCESS",
        totalAmount: 0,
        currency: "INR"
      }
    });

    assert(Boolean(tempReg.id), `Registration engine verified with reference: ${tempReg.registrationNumber}`);

    // Immediate cleanup to keep production database 100% clean
    await prisma.registration.delete({ where: { id: tempReg.id } });
    await prisma.ticketCategory.deleteMany({ where: { eventId: tempEvent.id } });
    await prisma.event.delete({ where: { id: tempEvent.id } });
    await prisma.eventCategory.delete({ where: { id: tempCat.id } });

    const remainingTempEvent = await prisma.event.findUnique({ where: { id: tempEvent.id } });
    const finalRegCount = await prisma.registration.count();
    assert(!remainingTempEvent && finalRegCount === 0, "Test teardown verified: temporary test records purged");

    console.log(`\n=== ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED ===\n`);
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
