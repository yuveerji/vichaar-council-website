import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentParticipant } from "@/lib/participant-auth";
import { generateOtp, sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const reqEmail = body.email ? body.email.trim().toLowerCase() : undefined;

    // 1. Identify User (either from session or request body email)
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
        { error: "No participant account was found. Please register or sign in first." },
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

    // 2. Cooldown check: prevent spamming resend within 45 seconds
    if (user.emailVerificationExpires) {
      const msLeft = user.emailVerificationExpires.getTime() - Date.now();
      // Total validity is 10 mins (600,000ms). If msLeft > 555,000, less than 45s passed since issuance.
      if (msLeft > 9 * 60 * 1000 + 15 * 1000) {
        const waitSec = Math.ceil((msLeft - (9 * 60 * 1000 + 15 * 1000)) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSec} seconds before requesting another verification code.` },
          { status: 429 }
        );
      }
    }

    // 3. Generate 6-digit OTP and 10-minute expiry
    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await prisma.participantUser.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: otp,
        emailVerificationExpires: expiry
      }
    });

    // 4. Dispatch Email
    const result = await sendOtpEmail({
      to: user.email,
      fullName: user.fullName,
      otp,
      purpose: "Participant Email Verification"
    });

    if (!result.success) {
      console.warn("Email dispatch error (simulation fallback active):", result.error);
    }

    // Obfuscate email for safe front-end display: e.g. "yu***@gmail.com"
    const [namePart, domainPart] = user.email.split("@");
    const maskedEmail =
      namePart.length > 2
        ? `${namePart[0]}${"*".repeat(Math.max(1, namePart.length - 2))}${namePart[namePart.length - 1]}@${domainPart}`
        : `${namePart}@${domainPart}`;

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${maskedEmail}.`,
      email: user.email,
      maskedEmail,
      isSimulation: result.isSimulation || false
    });
  } catch (error: any) {
    console.error("Error in send-otp route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch verification code." },
      { status: 500 }
    );
  }
}
