import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isValidUsername, sanitizeUsername } from "@/lib/participant-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get("username") || "";
    const currentUsername = searchParams.get("current_username") || "";

    if (!rawUsername.trim()) {
      return NextResponse.json({ available: false, message: "Username cannot be empty" }, { status: 400 });
    }

    const username = sanitizeUsername(rawUsername);

    // If it matches the user's existing username, it is available to keep
    if (currentUsername && username.toLowerCase() === currentUsername.trim().toLowerCase()) {
      return NextResponse.json({ available: true, message: "This is your current username." });
    }

    if (!isValidUsername(username)) {
      return NextResponse.json({
        available: false,
        message: "Username must be 3-30 characters with lowercase letters, numbers, or underscores only."
      });
    }

    // Reserved usernames
    const reserved = ["admin", "root", "vichaar", "support", "help", "official", "council", "secretariat", "moderator"];
    if (reserved.includes(username)) {
      return NextResponse.json({ available: false, message: "This username is reserved." });
    }

    const existing = await prisma.participantUser.findUnique({
      where: { username }
    });

    if (existing) {
      return NextResponse.json({ available: false, message: "This username is already taken." });
    }

    return NextResponse.json({ available: true, message: "Username is available!" });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json({ available: false, message: "Server error checking username" }, { status: 500 });
  }
}
