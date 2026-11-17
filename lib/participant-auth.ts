import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/db";

export const PARTICIPANT_SESSION_COOKIE = "my_vichaar_session";
const SESSION_EXPIRY_DAYS = 30;

export function sanitizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

export function isValidUsername(username: string): boolean {
  const clean = sanitizeUsername(username);
  // 3-30 chars, alphanumeric and underscores only
  return /^[a-z0-9_]{3,30}$/.test(clean);
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createParticipantSession(participantId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await prisma.participantSession.create({
    data: {
      token,
      participantId,
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(PARTICIPANT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });

  return token;
}

export async function getCurrentParticipant() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PARTICIPANT_SESSION_COOKIE)?.value;

    if (!token) {
      return null;
    }

    const session = await prisma.participantSession.findUnique({
      where: { token },
      include: {
        participant: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            institution: true,
            avatarUrl: true,
            isEmailVerified: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    if (!session.participant.isActive) {
      return null;
    }

    return session.participant;
  } catch (error) {
    console.error("Error retrieving current participant:", error);
    return null;
  }
}

export async function logoutParticipant() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PARTICIPANT_SESSION_COOKIE)?.value;

  if (token) {
    await prisma.participantSession.deleteMany({ where: { token } });
    cookieStore.delete(PARTICIPANT_SESSION_COOKIE);
  }
}

export async function verifyParticipantCredentials(identifier: string, passwordPlain: string) {
  const clean = identifier.trim().toLowerCase();
  const cleanUsername = sanitizeUsername(clean);

  // Search by email or username
  const participant = await prisma.participantUser.findFirst({
    where: {
      OR: [
        { email: clean },
        { username: cleanUsername }
      ]
    }
  });

  if (!participant || !participant.isActive) {
    return null;
  }

  const isValid = await bcrypt.compare(passwordPlain, participant.passwordHash);
  if (!isValid) {
    return null;
  }

  await prisma.participantUser.update({
    where: { id: participant.id },
    data: { lastLoginAt: new Date() }
  });

  return {
    id: participant.id,
    fullName: participant.fullName,
    username: participant.username,
    email: participant.email,
    phone: participant.phone,
    dateOfBirth: participant.dateOfBirth,
    institution: participant.institution,
    avatarUrl: participant.avatarUrl,
    isEmailVerified: participant.isEmailVerified,
    role: participant.role
  };
}
