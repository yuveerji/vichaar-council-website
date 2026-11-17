import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/db";

export const PARTICIPANT_SESSION_COOKIE = "my_vichaar_session";
const SESSION_EXPIRY_DAYS = 30;
const AUTH_SECRET = process.env.AUTH_SECRET || "vichaar-council-super-secret-auth-key-2026-very-secure";

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

function signSessionToken(participantId: string, expiresAt: Date): string {
  const payload = `${participantId}.${expiresAt.getTime()}`;
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export async function createParticipantSession(participantId: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
  const token = signSessionToken(participantId, expiresAt);

  try {
    await prisma.participantSession.create({
      data: {
        token,
        participantId,
        expiresAt
      }
    });
  } catch (err) {
    console.warn("[participant-auth] Could not persist session record to DB (stateless fallback active):", err);
  }

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

    // 1. Check stateless cryptographic HMAC signature
    const parts = token.split(".");
    if (parts.length === 3) {
      const [participantId, expiryStr, signature] = parts;
      const expectedSignature = crypto
        .createHmac("sha256", AUTH_SECRET)
        .update(`${participantId}.${expiryStr}`)
        .digest("hex");

      const expiryTime = Number(expiryStr);
      if (signature === expectedSignature && !isNaN(expiryTime) && expiryTime > Date.now()) {
        try {
          const participant = await prisma.participantUser.findUnique({
            where: { id: participantId },
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
          });

          if (participant && participant.isActive) {
            return participant;
          }
        } catch (dbErr) {
          console.error("[participant-auth] Error querying participant by ID:", dbErr);
        }
      }
    }

    // 2. Fallback to database session lookup for legacy tokens
    try {
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
    } catch {
      return null;
    }
  } catch (error) {
    console.error("Error retrieving current participant:", error);
    return null;
  }
}

export async function logoutParticipant() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PARTICIPANT_SESSION_COOKIE)?.value;

    if (token) {
      try {
        await prisma.participantSession.deleteMany({ where: { token } });
      } catch {}
      cookieStore.delete(PARTICIPANT_SESSION_COOKIE);
    }
  } catch (error) {
    console.error("Error in logoutParticipant:", error);
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

  // Best-effort update of lastLoginAt (safely ignored if SQLite is in read-only mode)
  try {
    await prisma.participantUser.update({
      where: { id: participant.id },
      data: { lastLoginAt: new Date() }
    });
  } catch (err) {
    console.warn("[participant-auth] Could not update lastLoginAt (continuing auth):", err);
  }

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
