import { NextRequest, NextResponse } from "next/server";
import {
  verifyParticipantCredentials,
  createParticipantSession
} from "@/lib/participant-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json({ error: "Please enter your email or @username." }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Please enter your password." }, { status: 400 });
    }

    const user = await verifyParticipantCredentials(identifier, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials. Please verify your username/email and password." }, { status: 401 });
    }

    await createParticipantSession(user.id);

    return NextResponse.json({
      success: true,
      message: "Authentication successful.",
      user
    });
  } catch (error) {
    console.error("Error logging in participant:", error);
    return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 });
  }
}
