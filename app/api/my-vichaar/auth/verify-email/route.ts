import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentParticipant, createParticipantSession } from "@/lib/participant-auth";
import { sendRegistrationConfirmation } from "@/lib/sendEmail";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body.token ? String(body.token).trim() : undefined;
    const reqEmail = body.email ? String(body.email).trim().toLowerCase() : undefined;

    if (token) {
      // 1. Locate user by matching token
      let user = await prisma.participantUser.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: { gte: new Date() },
          ...(reqEmail ? { email: reqEmail } : {})
        }
      });

      // If not found by active token, check if already verified by email
      if (!user && reqEmail) {
        const existing = await prisma.participantUser.findUnique({
          where: { email: reqEmail }
        });
        if (existing && existing.isEmailVerified) {
          await createParticipantSession(existing.id);
          return NextResponse.json({
            success: true,
            alreadyVerified: true,
            message: "Your email address is already verified."
          });
        }
      }

      if (!user) {
        return NextResponse.json({ error: "The verification link is invalid or has expired." }, { status: 400 });
      }

      // 2. Mark email as verified and clear token
      await prisma.participantUser.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null
        }
      });

      // 3. Automatically authenticate user into portal session
      await createParticipantSession(user.id);

      // 4. In-portal system notification
      await prisma.participantNotification.create({
        data: {
          participantId: user.id,
          title: "Email Verified",
          message: "Your email credentials have been authenticated. Welcome to MY VICHAAR!",
          type: "SYSTEM",
          link: "/my-vichaar/dashboard"
        }
      }).catch(() => null);

      // 5. Dispatch Registration Confirmation & Activation Email
      sendRegistrationConfirmation({
        name: user.fullName,
        email: user.email
      }).catch((e) => console.error("Activation email dispatch error:", e));

      return NextResponse.json({
        success: true,
        message: "Email successfully verified! Your participant session is active."
      });
    }

    // Fallback: If current logged-in participant requests verification
    const currentUser = await getCurrentParticipant();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.participantUser.update({
      where: { id: currentUser.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });

    sendRegistrationConfirmation({
      name: currentUser.fullName,
      email: currentUser.email
    }).catch((e) => console.error("Activation email dispatch error:", e));

    return NextResponse.json({ success: true, message: "Your email has been verified successfully." });
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
