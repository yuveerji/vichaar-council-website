import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentParticipant } from "@/lib/participant-auth";
import { syncSubmissionToSheets } from "@/lib/google-sheets";

export async function GET() {
  try {
    const user = await getCurrentParticipant();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.participantSubmission.findMany({
      where: { participantId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Failed to load submissions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentParticipant();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, category, abstract, fileUrl } = await request.json();

    if (!title || !category || !abstract) {
      return NextResponse.json({ error: "Title, Category, and Abstract are required." }, { status: 400 });
    }

    const submission = await prisma.participantSubmission.create({
      data: {
        participantId: user.id,
        title: title.trim(),
        category,
        abstract: abstract.trim(),
        fileUrl: fileUrl || null,
        status: "SUBMITTED"
      }
    });

    // Create confirmation notification
    await prisma.participantNotification.create({
      data: {
        participantId: user.id,
        title: "Submission Received",
        message: `Your paper titled "${title}" has been received by the Academic Review Board.`,
        type: "SYSTEM",
        link: "/my-vichaar/submissions"
      }
    });

    // Synchronize to Master Google Sheets Database (SUBMISSIONS Tab)
    syncSubmissionToSheets({
      id: submission.id,
      participantId: user.id,
      authorName: user.fullName,
      authorUsername: user.username,
      title: submission.title,
      category: submission.category,
      abstract: submission.abstract,
      fileUrl: submission.fileUrl
    }).catch((e) => console.error("Google Sheets sync error:", e));

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Failed to record submission." }, { status: 500 });
  }
}
