import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/db";
import {
  syncRegistrationToSheets,
  syncPaymentToSheets,
  syncInstitutionalRegistrationToSheets
} from "@/lib/google-sheets";
import { getCurrentParticipant } from "@/lib/participant-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Section A: Institutional Information
    const schoolName = String(body.schoolName || "").trim();
    const schoolAddress = String(body.schoolAddress || "").trim();
    const city = String(body.city || "").trim();
    const schoolBoard = String(body.schoolBoard || "").trim();
    const officialSchoolEmail = String(body.officialSchoolEmail || "").trim().toLowerCase();
    const schoolWebsite = String(body.schoolWebsite || "").trim();

    // Section B: Authorised Representative
    const coordinatorName = String(body.coordinatorName || "").trim();
    const coordinatorDesignation = String(body.coordinatorDesignation || "").trim();
    const coordinatorEmail = String(body.coordinatorEmail || "").trim().toLowerCase();
    const coordinatorPhone = String(body.coordinatorPhone || "").trim();

    // Section C: Participation Details
    const totalStudents = parseInt(String(body.totalStudents || "1"), 10) || 1;
    const classesRepresented = Array.isArray(body.classesRepresented) ? body.classesRepresented : [];
    const studentRoster = String(body.studentRoster || "").trim();
    const participationMode = String(body.participationMode || "Individual Participation").trim();
    const stancePreference = String(body.stancePreference || "No Preference").trim();

    // Section D: Consolidated Payment Details
    const feePaid = Number(body.feePaid || totalStudents * 549);
    const transactionId = String(body.transactionId || "").trim();
    const paymentScreenshot = body.paymentScreenshot || "";

    // Section E: Declaration & Notes
    const declarationConfirmed = Boolean(body.declarationConfirmed);
    const additionalRequests = String(body.additionalRequests || "").trim();

    // Validations
    if (!schoolName || !schoolAddress || !city || !officialSchoolEmail) {
      return NextResponse.json(
        { error: "Please complete all required fields in Section A (School Details)." },
        { status: 400 }
      );
    }

    if (!coordinatorName || !coordinatorDesignation || !coordinatorEmail || !coordinatorPhone) {
      return NextResponse.json(
        { error: "Please complete all Coordinator Details in Section B." },
        { status: 400 }
      );
    }

    if (totalStudents < 1) {
      return NextResponse.json(
        { error: "Total number of students must be at least 1." },
        { status: 400 }
      );
    }

    if (classesRepresented.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one class represented." },
        { status: 400 }
      );
    }

    if (!studentRoster || studentRoster.length < 5) {
      return NextResponse.json(
        { error: "Please provide the student roster in Section C." },
        { status: 400 }
      );
    }

    if (!transactionId) {
      return NextResponse.json(
        { error: "Please provide the transaction UTR number in Section D." },
        { status: 400 }
      );
    }

    if (!declarationConfirmed) {
      return NextResponse.json(
        { error: "The institutional declaration in Section E must be accepted." },
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

    // Generate Institutional Registration Number & Delegation Code
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const registrationNumber = `TVC-INST-${currentYear}-${randomSuffix}`;
    const delegationCode = `DLG-${schoolName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "SCH")}-${randomSuffix}`;

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

    // Check if coordinator is logged in or exists
    const currentParticipant = await getCurrentParticipant();
    let participantId = currentParticipant?.id || null;
    if (!participantId && coordinatorEmail) {
      const userMatch = await prisma.participantUser.findUnique({ where: { email: coordinatorEmail } });
      if (userMatch) {
        participantId = userMatch.id;
      }
    }

    // Structured Institutional Payload
    const responses = {
      channel: "INSTITUTIONAL",
      delegationCode,
      sectionA: {
        schoolName,
        schoolAddress,
        city,
        schoolBoard,
        officialSchoolEmail,
        schoolWebsite
      },
      sectionB: {
        coordinatorName,
        coordinatorDesignation,
        coordinatorEmail,
        coordinatorPhone
      },
      sectionC: {
        totalStudents,
        classesRepresented,
        studentRoster,
        participationMode,
        stancePreference
      },
      sectionD: {
        feePaid,
        transactionId,
        screenshotUrl
      },
      sectionE: {
        declarationConfirmed,
        additionalRequests
      },
      submittedAt: new Date().toISOString()
    };

    const orderId = `ORDER_INST_UTR_${transactionId}`;

    // Save Registration in Database
    const registration = await prisma.registration.create({
      data: {
        registrationNumber,
        eventId: event.id,
        ticketCategoryId: ticketCategory.id,
        participantId: participantId || undefined,
        fullName: coordinatorName,
        email: coordinatorEmail,
        phone: coordinatorPhone,
        city,
        institution: schoolName,
        notes: JSON.stringify(responses),
        paymentStatus: "PENDING",
        totalAmount: feePaid,
        currency: "INR",
        paymentOrderId: orderId
      }
    });

    // Save PaymentOrder
    await prisma.paymentOrder.create({
      data: {
        orderId,
        registrationId: registration.id,
        amount: feePaid,
        currency: "INR",
        status: "PENDING_VERIFICATION",
        cfOrderId: transactionId,
        rawResponseJson: JSON.stringify({
          source: "MANUAL_UPI_INSTITUTIONAL",
          schoolName,
          coordinatorName,
          totalStudents,
          transactionId,
          screenshotUrl,
          responses
        })
      }
    }).catch((e) => console.warn("PaymentOrder creation notice:", e));

    // Update event registered delegate count
    await prisma.event.update({
      where: { id: event.id },
      data: { registeredCount: { increment: totalStudents } }
    }).catch(() => null);

    // Create In-Portal Notification if coordinator is registered
    if (participantId) {
      await prisma.participantNotification.create({
        data: {
          participantId,
          title: `Institutional Registration Received · ${schoolName}`,
          message: `Your institutional registration (${registrationNumber}) for ${totalStudents} students at SHABD & SOCH has been received. Secretariat is verifying your consolidated transfer (UTR: ${transactionId}).`,
          type: "SYSTEM",
          link: `/events/${event.slug}/confirmation?reg_no=${registrationNumber}&status=pending&channel=institutional`
        }
      }).catch(() => null);
    }

    // Build absolute URL for screenshot if stored locally
    const baseUrl = process.env.NEXTAUTH_URL || "https://thevichaarcouncil.in";
    const fullScreenshotUrl = screenshotUrl
      ? (screenshotUrl.startsWith("http") ? screenshotUrl : `${baseUrl}${screenshotUrl}`)
      : "";

    // Sync to Google Sheets:
    // 1. Institutional Specific Tabs (INSTITUTIONS & INSTITUTIONAL_REGISTRATIONS)
    syncInstitutionalRegistrationToSheets({
      institutionName: schoolName,
      schoolAddress,
      city,
      schoolBoard,
      officialSchoolEmail,
      schoolWebsite,
      coordinatorName,
      coordinatorDesignation,
      coordinatorEmail,
      coordinatorPhone,
      delegationSize: totalStudents,
      delegationCode,
      registrationNumber,
      eventId: event.id,
      eventTitle: event.title,
      totalAmount: feePaid,
      transactionId,
      paymentScreenshot: paymentScreenshot || "",
      paymentScreenshotUrl: fullScreenshotUrl,
      studentRoster
    }).catch((e) => console.error("[GSHEETS SYNC ERROR - INSTITUTIONAL]:", e));

    // 2. Also mirror to master REGISTRATIONS tab
    syncRegistrationToSheets({
      id: registration.id,
      registrationNumber,
      eventId: event.id,
      eventTitle: event.title,
      registrationType: "INSTITUTIONAL_DELEGATION",
      participantId: participantId || "",
      fullName: `${coordinatorName} (${schoolName})`,
      email: coordinatorEmail,
      phone: coordinatorPhone,
      institution: schoolName,
      passCategory: `Institutional Delegation (${totalStudents} Students)`,
      totalAmount: feePaid,
      paymentStatus: "PENDING",
      paymentScreenshot: paymentScreenshot || "",
      paymentScreenshotUrl: fullScreenshotUrl
    }).catch((e) => console.error("[GSHEETS SYNC ERROR - REGISTRATION]:", e));

    // 3. Mirror to PAYMENTS tab
    syncPaymentToSheets({
      orderId,
      cfOrderId: transactionId,
      registrationNumber,
      participantId: participantId || "",
      participantName: `${coordinatorName} [${schoolName}]`,
      payerEmail: coordinatorEmail,
      payerPhone: coordinatorPhone,
      amount: feePaid,
      paymentMethod: "UPI_UTR_INSTITUTIONAL",
      paymentStatus: "PENDING",
      bankReference: transactionId,
      paymentScreenshot: paymentScreenshot || "",
      paymentScreenshotUrl: fullScreenshotUrl
    }).catch((e) => console.error("[GSHEETS SYNC ERROR - PAYMENT]:", e));

    return NextResponse.json({
      success: true,
      registrationNumber,
      delegationCode,
      orderId,
      eventSlug: event.slug,
      message: "Institutional registration submitted successfully. Pending UTR verification."
    });
  } catch (error: any) {
    console.error("Error in /api/events/register-institutional:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process institutional registration." },
      { status: 500 }
    );
  }
}
