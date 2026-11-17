import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentParticipant } from "@/lib/participant-auth";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentParticipant();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    // 1. Multipart Form Data (Direct File Upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No image file provided" }, { status: 400 });
      }

      // Validate MIME type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid image format. Please upload JPG, PNG, WebP, or GIF." },
          { status: 400 }
        );
      }

      // Max size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File exceeds 5MB size limit." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "png";
      const filename = `avatar_${user.id}_${Date.now()}.${ext}`;

      const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await fs.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);

      const avatarUrl = `/uploads/avatars/${filename}`;

      await prisma.participantUser.update({
        where: { id: user.id },
        data: { avatarUrl }
      });

      return NextResponse.json({
        success: true,
        message: "Profile picture uploaded successfully.",
        avatarUrl
      });
    }

    // 2. JSON Body (Base64 or Image URL)
    const body = await req.json();
    const { avatarUrl } = body;

    if (!avatarUrl || typeof avatarUrl !== "string") {
      return NextResponse.json({ error: "Valid avatarUrl is required." }, { status: 400 });
    }

    await prisma.participantUser.update({
      where: { id: user.id },
      data: { avatarUrl }
    });

    return NextResponse.json({
      success: true,
      message: "Profile picture updated successfully.",
      avatarUrl
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload profile picture" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentParticipant();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.participantUser.update({
      where: { id: user.id },
      data: { avatarUrl: null }
    });

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully.",
      avatarUrl: null
    });
  } catch (error: any) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove profile picture" },
      { status: 500 }
    );
  }
}
