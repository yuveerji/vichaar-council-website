import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  getAuthorizedAdmin,
  getAdminWhitelist,
  addAdminToWhitelist,
  removeAdminFromWhitelist
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getAuthorizedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [whitelist, adminUsers, participantAdmins] = await Promise.all([
      getAdminWhitelist(),
      prisma.adminUser.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true
        }
      }),
      prisma.participantUser.findMany({
        where: {
          OR: [{ role: "ADMIN" }, { role: "SUPER_ADMIN" }, { role: "SECRETARIAT" }]
        },
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          role: true,
          isActive: true
        }
      })
    ]);

    return NextResponse.json({
      whitelist,
      adminUsers,
      participantAdmins
    });
  } catch (error: any) {
    console.error("Error fetching admin list:", error);
    return NextResponse.json({ error: "Failed to fetch admin list" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthorizedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { identifier, role } = await req.json();

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "A valid email or username is required." },
        { status: 400 }
      );
    }

    const result = await addAdminToWhitelist(identifier, role || "ADMIN");

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error adding admin:", error);
    return NextResponse.json({ error: error.message || "Failed to add admin." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAuthorizedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "A valid identifier is required." },
        { status: 400 }
      );
    }

    const result = await removeAdminFromWhitelist(identifier);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error removing admin:", error);
    return NextResponse.json({ error: error.message || "Failed to remove admin." }, { status: 500 });
  }
}
