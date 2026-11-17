import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { createParticipantSession, hashPassword, sanitizeUsername } from "@/lib/participant-auth";
import { syncParticipantToSheets } from "@/lib/google-sheets";

const FOUNDER_EMAILS = [
  "yuveerchhatwani18@gmail.com",
  "chhatwaniyuveer@gmail.com",
  "founder@thevichaarcouncil.in",
  "admin@thevichaarcouncil.in"
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, displayName, photoURL, uid, idToken } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required for Google authentication." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isFounder = FOUNDER_EMAILS.includes(cleanEmail);

    // 1. Check if user already exists
    let user = await prisma.participantUser.findUnique({
      where: { email: cleanEmail }
    });

    if (user) {
      // Update profile info from Google if missing
      const updates: any = {
        isEmailVerified: true,
        lastLoginAt: new Date()
      };

      if (!user.avatarUrl && photoURL) {
        updates.avatarUrl = photoURL;
      }
      if (isFounder && user.role !== "FOUNDER") {
        updates.role = "FOUNDER";
      }

      user = await prisma.participantUser.update({
        where: { id: user.id },
        data: updates
      });
    } else {
      // 2. Automatically generate unique username from Google display name or email
      let baseUsername = "";
      if (displayName) {
        baseUsername = sanitizeUsername(displayName.replace(/\s+/g, "_"));
      }
      if (!baseUsername || baseUsername.length < 3) {
        baseUsername = sanitizeUsername(cleanEmail.split("@")[0]);
      }
      baseUsername = baseUsername.slice(0, 20);

      // Check if username already exists, append random numbers if so
      let chosenUsername = baseUsername;
      const existingUsername = await prisma.participantUser.findUnique({
        where: { username: chosenUsername }
      });

      if (existingUsername) {
        const rand = Math.floor(100 + Math.random() * 900);
        chosenUsername = `${baseUsername}_${rand}`.slice(0, 30);
      }

      // Generate secure random fallback password hash
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const passwordHash = await hashPassword(randomPassword);

      user = await prisma.participantUser.create({
        data: {
          fullName: displayName || cleanEmail.split("@")[0],
          username: chosenUsername,
          email: cleanEmail,
          passwordHash,
          avatarUrl: photoURL || null,
          isEmailVerified: true,
          role: isFounder ? "FOUNDER" : "PARTICIPANT",
          lastLoginAt: new Date()
        }
      });

      // Background sync to Google Sheets
      syncParticipantToSheets({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone || "N/A",
        institution: user.institution || "Independent Delegate"
      }).catch((err) => console.error("Google Sheets sync error:", err));
    }

    // 3. Issue session cookie
    await createParticipantSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("Firebase Google Auth error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to authenticate with Google." },
      { status: 500 }
    );
  }
}
