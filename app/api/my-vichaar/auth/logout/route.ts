import { NextResponse } from "next/server";
import { logoutParticipant } from "@/lib/participant-auth";

export async function POST() {
  try {
    await logoutParticipant();
    return NextResponse.json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Error during participant logout:", error);
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
