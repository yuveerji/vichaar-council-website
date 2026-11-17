import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import cashfree from "@/lib/cashfree";
import { syncRegistrationToSheets } from "@/lib/google-sheets";
import { getCurrentParticipant } from "@/lib/participant-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, ticketCategoryId, fullName, email, phone, city, institution, notes } = body;

    if (!eventId || !ticketCategoryId || !fullName || !email || !phone || !city) {
      return NextResponse.json(
        { error: "Missing required registration fields (Event, Ticket, Name, Email, Phone, City)." },
        { status: 400 }
      );
    }

    // Resolve Participant Account (logged in session or matching email)
    const currentParticipant = await getCurrentParticipant();
    let participantId = currentParticipant?.id || body.participantId || null;

    if (!participantId && email) {
      const existingUser = await prisma.participantUser.findUnique({
        where: { email }
      });
      if (existingUser) {
        participantId = existingUser.id;
      }
    }

    // 1. Fetch Event & Ticket Category
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { tickets: true }
    });

    if (!event || !event.isPublished) {
      return NextResponse.json({ error: "Selected event is not found or not active." }, { status: 404 });
    }

    if (event.status === "SOLD_OUT" || event.status === "REGISTRATION_CLOSED") {
      return NextResponse.json({ error: "Registration for this event is closed." }, { status: 400 });
    }

    const ticket = event.tickets.find((t) => t.id === ticketCategoryId);
    if (!ticket || !ticket.isActive) {
      return NextResponse.json({ error: "Selected ticket category is unavailable." }, { status: 400 });
    }

    if (ticket.soldCount >= ticket.capacity) {
      return NextResponse.json({ error: "This ticket category is fully booked." }, { status: 400 });
    }

    // 2. Generate unique registration number: TVC-YEAR-RANDOM
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const registrationNumber = `TVC-${currentYear}-${randomSuffix}`;

    // 3. Check if Ticket is Free (Price === 0)
    if (ticket.price === 0) {
      const freeRegistration = await prisma.$transaction(async (tx) => {
        const reg = await tx.registration.create({
          data: {
            registrationNumber,
            eventId: event.id,
            ticketCategoryId: ticket.id,
            participantId: participantId || undefined,
            fullName,
            email,
            phone,
            city,
            institution,
            notes,
            paymentStatus: "SUCCESS",
            totalAmount: 0.0,
            currency: "INR"
          }
        });

        await tx.ticketCategory.update({
          where: { id: ticket.id },
          data: { soldCount: { increment: 1 } }
        });

        await tx.event.update({
          where: { id: event.id },
          data: { registeredCount: { increment: 1 } }
        });

        return reg;
      });

      // Synchronize Free Registration to Google Sheets
      syncRegistrationToSheets({
        id: freeRegistration.id,
        registrationNumber: freeRegistration.registrationNumber,
        eventId: event.id,
        eventTitle: event.title,
        fullName: freeRegistration.fullName,
        email: freeRegistration.email,
        phone: freeRegistration.phone,
        institution: freeRegistration.institution,
        passCategory: ticket.name,
        totalAmount: 0,
        paymentStatus: "SUCCESS"
      }).catch((e) => console.error("Google Sheets sync error:", e));

      return NextResponse.json({
        success: true,
        isFree: true,
        registrationNumber: freeRegistration.registrationNumber,
        eventSlug: event.slug,
        message: "Complimentary registration confirmed successfully."
      });
    }

    // 4. Paid Ticket: Create Pending Registration & Cashfree Order
    const orderId = `order_tvc_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Cashfree Production and Sandbox API strictly enforce HTTPS for return_url and notify_url.
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://thevichaarcouncil.in";
    if (!siteUrl || siteUrl.includes("localhost")) {
      const host = req.headers.get("host") || "thevichaarcouncil.in";
      siteUrl = host.includes("localhost") ? "https://thevichaarcouncil.in" : `https://${host}`;
    } else if (!siteUrl.startsWith("https://")) {
      siteUrl = siteUrl.replace(/^http:\/\//, "https://");
    }
    siteUrl = siteUrl.replace(/\/+$/, "");

    const newRegistration = await prisma.registration.create({
      data: {
        registrationNumber,
        eventId: event.id,
        ticketCategoryId: ticket.id,
        participantId: participantId || undefined,
        fullName,
        email,
        phone,
        city,
        institution,
        notes,
        paymentStatus: "PENDING",
        totalAmount: ticket.price,
        currency: "INR",
        paymentOrderId: orderId
      }
    });

    const returnUrl = `${siteUrl}/events/${event.slug}/confirmation?order_id=${orderId}`;
    const notifyUrl = `${siteUrl}/api/webhooks/cashfree`;

    const cfOrder = await cashfree.createOrder({
      orderId,
      orderAmount: ticket.price,
      orderCurrency: "INR",
      customerDetails: {
        customerId: `cust_${newRegistration.id.slice(0, 8)}`,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone
      },
      orderMeta: {
        returnUrl,
        notifyUrl
      },
      orderNote: `${event.title} - ${ticket.name} (${registrationNumber})`
    });

    await prisma.paymentOrder.create({
      data: {
        orderId,
        registrationId: newRegistration.id,
        amount: ticket.price,
        currency: "INR",
        status: "CREATED",
        paymentSessionId: cfOrder.paymentSessionId,
        cfOrderId: cfOrder.cfOrderId,
        rawResponseJson: JSON.stringify(cfOrder)
      }
    });

    // Synchronize Pending Paid Registration to Google Sheets
    syncRegistrationToSheets({
      id: newRegistration.id,
      registrationNumber: newRegistration.registrationNumber,
      eventId: event.id,
      eventTitle: event.title,
      fullName: newRegistration.fullName,
      email: newRegistration.email,
      phone: newRegistration.phone,
      institution: newRegistration.institution,
      passCategory: ticket.name,
      totalAmount: ticket.price,
      paymentStatus: "PENDING"
    }).catch((e) => console.error("Google Sheets sync error:", e));

    return NextResponse.json({
      success: true,
      isFree: false,
      orderId,
      paymentSessionId: cfOrder.paymentSessionId,
      cfOrderId: cfOrder.cfOrderId,
      registrationNumber,
      amount: ticket.price,
      currency: "INR",
      eventSlug: event.slug,
      isMock: cfOrder.isMock || false
    });
  } catch (error: any) {
    console.error("Error creating Cashfree order:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while initiating registration payment." },
      { status: 500 }
    );
  }
}
