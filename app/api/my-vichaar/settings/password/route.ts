import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentParticipant, verifyPassword, hashPassword } from "@/lib/participant-auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentParticipant();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Please enter current and new password." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
    }

    // Retrieve db user with passwordHash
    const dbUser = await prisma.participantUser.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const isMatch = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password does not match our records." }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await prisma.participantUser.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    // Create security notification
    await prisma.participantNotification.create({
      data: {
        participantId: user.id,
        title: "Password Changed",
        message: "Your account password was successfully updated.",
        type: "SYSTEM",
        link: "/my-vichaar/settings"
      }
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}
