import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/sendEmail";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.participantUser.findUnique({
      where: { email: cleanEmail }
    });

    // If user exists, generate recovery token and send email
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await prisma.participantUser.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires
        }
      });

      await sendPasswordResetEmail({
        name: user.fullName,
        email: user.email,
        token: resetToken,
        expiryMinutes: 30
      });
    }

    // Always return success for security (prevents email enumeration)
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password recovery link has been dispatched."
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process password recovery." }, { status: 500 });
  }
}
