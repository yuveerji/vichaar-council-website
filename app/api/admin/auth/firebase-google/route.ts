import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { createAdminSession, isIdentifierAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, displayName, photoURL } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required for Google authentication." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check authorization clearance
    const isAllowed = await isIdentifierAdmin(cleanEmail, null);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error: `Access Denied: ${cleanEmail} is not an authorized Founder or Secretariat officer.`
        },
        { status: 403 }
      );
    }

    // Find or create AdminUser
    let admin = await prisma.adminUser.findUnique({
      where: { email: cleanEmail }
    });

    const isFounder = [
      "yuveerchhatwani18@gmail.com",
      "chhatwaniyuveer@gmail.com",
      "founder@thevichaarcouncil.in"
    ].includes(cleanEmail);

    if (!admin) {
      const defaultHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
      admin = await prisma.adminUser.create({
        data: {
          email: cleanEmail,
          name: displayName || (isFounder ? "Yuveer (Founder)" : "Secretariat Officer"),
          passwordHash: defaultHash,
          role: isFounder ? "FOUNDER" : "SUPER_ADMIN",
          isActive: true,
          lastLoginAt: new Date()
        }
      });
    } else {
      admin = await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          lastLoginAt: new Date(),
          ...(isFounder && admin.role !== "FOUNDER" ? { role: "FOUNDER" } : {})
        }
      });
    }

    // Issue admin session
    await createAdminSession(admin.id);

    return NextResponse.json({
      success: true,
      redirect: "/admin/dashboard",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error: any) {
    console.error("Admin Firebase Google Auth error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to authenticate administrator with Google." },
      { status: 500 }
    );
  }
}
