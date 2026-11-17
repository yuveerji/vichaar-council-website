import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthorizedAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthorizedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key, enabled } = await req.json();
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    await prisma.siteSetting.upsert({
      where: { key: `MODULE_${key}` },
      update: { value: String(enabled) },
      create: {
        key: `MODULE_${key}`,
        value: String(enabled),
        description: `Module toggle for ${key}`
      }
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "TOGGLE_MODULE",
        entity: "SiteSetting",
        entityId: key,
        details: `Toggled module ${key} to ${enabled}`
      }
    });

    return NextResponse.json({ success: true, key, enabled });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
