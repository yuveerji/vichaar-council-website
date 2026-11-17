import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/db";
import { syncRegistrationToSheets, syncPaymentToSheets } from "@/lib/google-sheets";
import { getCurrentParticipant } from "@/lib/participant-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Section A: Personal & Academic Details
    const fullName = String(body.fullName || "").trim();
    const dateOfBirth = String(body.dateOfBirth || "").trim();
    const currentClass = String(body.currentClass || "").trim();
    const schoolName = String(body.schoolName || "").trim();
    const city = String(body.city || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const whatsappNumber = String(body.whatsappNumber || "").trim();
    const guardianNameAndContact = String(body.guardianNameAndContact || "").trim();

    // Section B: Debate Preferences
    const stancePreference = String(body.stancePreference || "").trim();
    const comfortableBothStances = String(body.comfortableBothStances || "").trim();
    const previousExperience = String(body.previousExperience || "").trim();
    const whyParticipate = String(body.whyParticipate || "").trim();

    // Section C: Payment Details
    const feePaid = Number(body.feePaid || 549);
    const transactionId = String(body.transactionId || "").trim();
    const paymentScreenshot = body.paymentScreenshot || "";

    // Section D: Consent & Confirmation
    const guardianConsent = Boolean(body.guardianConsent);
    const participantDeclaration = Boolean(body.participantDeclaration);

    // Section E: Additional Information
    const foodAllergies = String(body.foodAllergies || "No").trim();
    const allergiesSpecify = String(body.allergiesSpecify || "").trim();
    const additionalInfo = String(body.additionalInfo || "").trim();

    // Validation
    if (
      !fullName ||
      !dateOfBirth ||
      !currentClass ||
      !schoolName ||
      !city ||
      !email ||
      !whatsappNumber ||
      !guardianNameAndContact
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields in Section A (Personal & Academic Details)." },
        { status: 400 }
      );
    }

    if (!stancePreference || !comfortableBothStances || !previousExperience || !whyParticipate) {
      return NextResponse.json(
        { error: "Please answer all debate preference questions in Section B." },
        { status: 400 }
      );
    }

    if (!transactionId) {
      return NextResponse.json(
        { error: "Please enter your Transaction ID / UTR Number in Section C." },
        { status: 400 }
      );
    }

    if (!guardianConsent || !participantDeclaration) {
      return NextResponse.json(
        { error: "Please accept both the Parent/Guardian Consent and Participant Declaration in Section D." },
        { status: 400 }
      );
    }

    // Locate target event (default to SHABD & SOCH)
    const eventSlug = body.eventSlug || "shabd-and-soch";
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ slug: eventSlug }, { slug: "shabd-soch" }, { id: body.eventId }]
      },
      include: {
        tickets: true
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Target event record not found." }, { status: 404 });
    }

    const ticketCategory =
      event.tickets.find((t) => t.id === body.ticketCategoryId) ||
      event.tickets[0] ||
      (await prisma.ticketCategory.findFirst({ where: { eventId: event.id } }));

    if (!ticketCategory) {
      return NextResponse.json({ error: "No ticket category available for this event." }, { status: 400 });
    }

    // Generate Registration Number
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const registrationNumber = `TVC-${currentYear}-${randomSuffix}`;

    // Handle Payment Screenshot Upload (save to public/uploads/payments if base64)
    let screenshotUrl = "";
    if (paymentScreenshot && typeof paymentScreenshot === "string" && paymentScreenshot.startsWith("data:image/")) {
      try {
        const matches = paymentScreenshot.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
          const buffer = Buffer.from(matches[2], "base64");
          const fileName = `${registrationNumber}_receipt_${Date.now()}.${ext}`;
          const uploadDir = path.join(process.cwd(), "public", "uploads", "payments");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          fs.writeFileSync(path.join(uploadDir, fileName), buffer);
          screenshotUrl = `/uploads/payments/${fileName}`;
        }
      } catch (fileErr) {
        console.warn("Could not save screenshot to disk:", fileErr);
      }
    } else if (typeof paymentScreenshot === "string" && paymentScreenshot.startsWith("http")) {
      screenshotUrl = paymentScreenshot;
    }

    // Check if participant is logged in or exists
    const currentParticipant = await getCurrentParticipant();
    let participantId = currentParticipant?.id || null;
    if (!participantId && email) {
      const userMatch = await prisma.participantUser.findUnique({ where: { email } });
      if (userMatch) {
        participantId = userMatch.id;
      }
    }

    // Comprehensive 20-Question Response Object
    const responses = {
      sectionA: {
        q1_fullName: fullName,
        q2_dateOfBirth: dateOfBirth,
        q3_currentClass: currentClass,
        q4_schoolName: schoolName,
        q5_city: city,
        q6_email: email,
        q7_whatsappNumber: whatsappNumber,
        q8_guardianNameAndContact: guardianNameAndContact
      },
      sectionB: {
        q9_stancePreference: stancePreference,
        q10_comfortableBothStances: comfortableBothStances,
        q11_previousExperience: previousExperience,
        q12_whyParticipate: whyParticipate
      },
      sectionC: {
        q13_feePaid: feePaid,
        q14_transactionId: transactionId,
        q15_screenshotUrl: screenshotUrl
      },
      sectionD: {
        q16_guardianConsent: guardianConsent,
        q17_participantDeclaration: participantDeclaration
      },
      sectionE: {
        q18_foodAllergies: foodAllergies,
        q19_allergiesSpecify: allergiesSpecify,
        q20_additionalInfo: additionalInfo
      },
      submittedAt: new Date().toISOString()
    };

    // Create Registration in Database
    const registration = await prisma.registration.create({
      data: {
        registrationNumber,
        eventId: event.id,
        ticketCategoryId: ticketCategory.id,
        participantId: participantId || undefined,
        fullName,
        email,
        phone: whatsappNumber,
        city,
        institution: schoolName,
        notes: JSON.stringify(responses),
        paymentStatus: "PENDING",
        totalAmount: feePaid,
        currency: "INR",
        paymentOrderId: `ORDER_UTR_${transactionId}`
      }
    });

    // Create PaymentOrder record for UTR tracking
    const orderId = `ORDER_UTR_${transactionId}`;
    await prisma.paymentOrder.create({
      data: {
        orderId,
        registrationId: registration.id,
        amount: feePaid,
        currency: "INR",
        status: "PENDING_VERIFICATION",
        cfOrderId: transactionId,
        rawResponseJson: JSON.stringify({
          source: "MANUAL_UPI_UTR",
          transactionId,
          screenshotUrl,
          responses
        })
      }
    }).catch((e) => console.warn("PaymentOrder creation notice:", e));

    // Update Event counts
    await prisma.event.update({
      where: { id: event.id },
      data: { registeredCount: { increment: 1 } }
    }).catch(() => null);

    // Create In-Portal Notification if linked to user
    if (participantId) {
      await prisma.participantNotification.create({
        data: {
          participantId,
          title: "Registration Received: SHABD & SOCH",
          message: `Your registration (${registrationNumber}) for SHABD & SOCH has been received. Our Secretariat is verifying your payment UTR: ${transactionId}.`,
          type: "SYSTEM",
          link: `/events/${event.slug}/confirmation?reg_no=${registrationNumber}&status=pending`
        }
      }).catch(() => null);
    }

    // Build absolute URL for screenshot if stored locally
    const baseUrl = process.env.NEXTAUTH_URL || "https://thevichaarcouncil.in";
    const fullScreenshotUrl = screenshotUrl
      ? (screenshotUrl.startsWith("http") ? screenshotUrl : `${baseUrl}${screenshotUrl}`)
      : "";

    // Synchronize to Google Sheets Master Database
    syncRegistrationToSheets({
      id: registration.id,
      registrationNumber,
      eventId: event.id,
      eventTitle: event.title,
      participantId: participantId || "",
      fullName,
      email,
      phone: whatsappNumber,
      institution: schoolName,
      passCategory: ticketCategory.name,
      totalAmount: feePaid,
      paymentStatus: "PENDING",
      paymentScreenshot: paymentScreenshot || "",
      paymentScreenshotUrl: fullScreenshotUrl
    }).catch((e) => console.error("[GSHEETS SYNC ERROR - REGISTRATION]:", e));

    syncPaymentToSheets({
      orderId,
      cfOrderId: transactionId,
      registrationNumber,
      participantId: participantId || "",
      participantName: fullName,
      payerEmail: email,
      payerPhone: whatsappNumber,
      amount: feePaid,
      paymentMethod: "UPI_UTR_MANUAL",
      paymentStatus: "PENDING",
      bankReference: transactionId,
      paymentScreenshot: paymentScreenshot || "",
      paymentScreenshotUrl: fullScreenshotUrl
    }).catch((e) => console.error("[GSHEETS SYNC ERROR - PAYMENT]:", e));

    return NextResponse.json({
      success: true,
      registrationNumber,
      orderId,
      eventSlug: event.slug,
      message: "Registration submitted successfully. Pending UTR verification."
    });
  } catch (error: any) {
    console.error("Error in /api/events/register:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process registration submission." },
      { status: 500 }
    );
  }
}
