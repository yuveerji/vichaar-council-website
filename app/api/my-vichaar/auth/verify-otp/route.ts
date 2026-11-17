import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentParticipant } from "@/lib/participant-auth";
import { sendRegistrationConfirmation } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawOtp = body.otp ? String(body.otp).trim().replace(/[^0-9]/g, "") : "";
    const reqEmail = body.email ? String(body.email).trim().toLowerCase() : undefined;

    if (!rawOtp || rawOtp.length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit verification code." },
        { status: 400 }
      );
    }

    // 1. Identify Participant
    const currentUser = await getCurrentParticipant();
    let user = null;

    if (currentUser) {
      user = await prisma.participantUser.findUnique({
        where: { id: currentUser.id }
      });
    } else if (reqEmail) {
      user = await prisma.participantUser.findUnique({
        where: { email: reqEmail }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Participant account not found. Please log in or register." },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Your email address is already verified."
      });
    }

    // 2. Check Token Expiry
    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        { error: "This verification code has expired. Please request a fresh code." },
        { status: 400 }
      );
    }

    // 3. Check Token Match
    if (user.emailVerificationToken !== rawOtp) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check your email and try again." },
        { status: 400 }
      );
    }

    // 4. Mark Verified & Clear Token
    await prisma.participantUser.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });

    // 5. Send Welcome / Verification Notification in-portal
    await prisma.participantNotification.create({
      data: {
        participantId: user.id,
        title: "Official Verification Completed",
        message: "Your participant account credentials and email have been officially authenticated by The Vichaar Council.",
        type: "SYSTEM"
      }
    }).catch(() => null);

    // 6. Dispatch Registration Confirmation Email via Resend
    sendRegistrationConfirmation({
      name: user.fullName,
      email: user.email
    }).catch((e) => console.error("Activation email dispatch error:", e));

    return NextResponse.json({
      success: true,
      message: "Email address verified successfully! Your account credentials have been authenticated."
    });
  } catch (error: any) {
    console.error("Error in verify-otp route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify code." },
      { status: 500 }
    );
  }
}
