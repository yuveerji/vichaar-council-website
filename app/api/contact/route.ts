import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendContactAcknowledgementEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, category, message, honeyPot } = body;

    // Anti-spam honeypot
    if (honeyPot) {
      return NextResponse.json({ success: true, message: "Enquiry submitted successfully." });
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields (Name, Email, Subject, Message)." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    const enquiry = await prisma.contactEnquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        category: category || "GENERAL",
        message,
        consentAgreed: true,
        status: "NEW",
        ipAddress: clientIp
      }
    });

    // Dispatch official acknowledgement email from thevichaarcouncil@gmail.com
    sendContactAcknowledgementEmail({
      name,
      email,
      referenceId: enquiry.id.slice(0, 8).toUpperCase(),
      subject,
      message
    }).catch((e) => console.warn("[CONTACT EMAIL NOTICE]", e.message));

    return NextResponse.json({
      success: true,
      message: "Your correspondence has been lodged with the Secretariat. We will respond in due course.",
      referenceId: enquiry.id
    });
  } catch (error: any) {
    console.error("Contact Form Submission Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your message." },
      { status: 500 }
    );
  }
}
