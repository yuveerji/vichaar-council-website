import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/participant-auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentParticipant();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null, unreadNotifications: 0, latestNotification: null }, { status: 401 });
    }

    const [unreadNotifications, latestNotification] = await Promise.all([
      prisma.participantNotification.count({
        where: { participantId: user.id, isRead: false }
      }),
      prisma.participantNotification.findFirst({
        where: { participantId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          link: true,
          isRead: true,
          createdAt: true
        }
      })
    ]);

    return NextResponse.json({
      authenticated: true,
      user,
      unreadNotifications,
      latestNotification
    });
  } catch (error) {
    console.error("Error checking auth status:", error);
    return NextResponse.json({ authenticated: false, user: null, unreadNotifications: 0, latestNotification: null }, { status: 500 });
  }
}
