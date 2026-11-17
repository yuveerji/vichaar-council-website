import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import {
  hashPassword,
  isValidUsername,
  sanitizeUsername,
  createParticipantSession
} from "@/lib/participant-auth";
import { syncParticipantToSheets } from "@/lib/google-sheets";
import { generateOtp, sendOtpEmail } from "@/lib/email";
import { sendVerification } from "@/lib/sendEmail";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      username: rawUsername,
      email: rawEmail,
      phone,
      dateOfBirth,
      institution,
      password,
      confirmPassword,
      agreeTerms
    } = body;

    // 1. Full Name
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }

    // 2. Username
    if (!rawUsername || typeof rawUsername !== "string") {
      return NextResponse.json({ error: "Please choose a username." }, { status: 400 });
    }
    const username = sanitizeUsername(rawUsername);
    if (!isValidUsername(username)) {
      return NextResponse.json({
        error: "Username must be 3–30 characters using only letters, numbers, and underscores."
      }, { status: 400 });
    }

    // 3. Email
    if (!rawEmail || typeof rawEmail !== "string" || !rawEmail.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }
    const email = rawEmail.trim().toLowerCase();

    // 4. Phone
    if (!phone || typeof phone !== "string" || phone.trim().length < 7) {
      return NextResponse.json({ error: "Please enter a valid contact phone number." }, { status: 400 });
    }

    // 5. Date of Birth
    if (!dateOfBirth || typeof dateOfBirth !== "string") {
      return NextResponse.json({ error: "Please enter your date of birth." }, { status: 400 });
    }

    // 6. Institution
    if (!institution || typeof institution !== "string" || institution.trim().length < 2) {
      return NextResponse.json({ error: "Please specify your school, college, or institution." }, { status: 400 });
    }

    // 7. Password
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters in length." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    if (!agreeTerms) {
      return NextResponse.json({ error: "You must agree to the Terms of Participation and Privacy Policy." }, { status: 400 });
    }

    // Check unique email
    const existingEmail = await prisma.participantUser.findUnique({
      where: { email }
    });
    if (existingEmail) {
      return NextResponse.json({ error: "An account with this email address already exists. Please log in." }, { status: 409 });
    }

    // Check unique username
    const existingUser = await prisma.participantUser.findUnique({
      where: { username }
    });
    if (existingUser) {
      return NextResponse.json({ error: "This username is already taken. Please choose another." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const verificationOtp = generateOtp();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    const newParticipant = await prisma.participantUser.create({
      data: {
        fullName: fullName.trim(),
        username,
        email,
        phone: phone.trim(),
        dateOfBirth: dateOfBirth.trim(),
        institution: institution.trim(),
        passwordHash,
        isEmailVerified: false,
        emailVerificationToken: verificationOtp,
        emailVerificationExpires: verificationExpires,
        role: "PARTICIPANT"
      }
    });

    // Send Official Email Verification with both 1-click button and 6-digit OTP code
    sendVerification({
      name: newParticipant.fullName,
      email: newParticipant.email,
      token: verificationOtp
    }).catch((e) => console.error("Initial verification email dispatch error:", e));

    // Link any previous registrations made by this email to this new participant
    await prisma.registration.updateMany({
      where: { email },
      data: { participantId: newParticipant.id }
    });

    // Synchronize to Master Google Sheets Database (PARTICIPANTS Tab)
    syncParticipantToSheets({
      id: newParticipant.id,
      fullName: newParticipant.fullName,
      username: newParticipant.username,
      email: newParticipant.email,
      phone: newParticipant.phone,
      dateOfBirth: newParticipant.dateOfBirth,
      institution: newParticipant.institution,
      isEmailVerified: newParticipant.isEmailVerified
    }).catch((e) => console.error("Google Sheets sync error:", e));

    // Create Welcome Notification
    await prisma.participantNotification.create({
      data: {
        participantId: newParticipant.id,
        title: "Welcome to MY VICHAAR",
        message: `Welcome, ${newParticipant.fullName}! Your official participant space is active. Explore upcoming conferences, submit intellectual papers, and track your registrations.`,
        type: "SYSTEM",
        link: "/my-vichaar/dashboard"
      }
    });

    // Automatically create session & login
    await createParticipantSession(newParticipant.id);

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: newParticipant.id,
        fullName: newParticipant.fullName,
        username: newParticipant.username,
        email: newParticipant.email,
        phone: newParticipant.phone,
        dateOfBirth: newParticipant.dateOfBirth,
        institution: newParticipant.institution,
        isEmailVerified: newParticipant.isEmailVerified
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating participant account:", error);
    return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
  }
}
