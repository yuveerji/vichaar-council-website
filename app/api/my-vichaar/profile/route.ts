import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentParticipant, isValidUsername, sanitizeUsername } from "@/lib/participant-auth";
import { syncParticipantToSheets } from "@/lib/google-sheets";

export async function GET() {
  try {
    const user = await getCurrentParticipant();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch related counts and registrations
    const [registrations, certificates, submissions, notifications] = await Promise.all([
      prisma.registration.findMany({
        where: { participantId: user.id },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              startDate: true,
              city: true,
              venue: true,
              format: true,
              status: true
            }
          },
          ticketCategory: {
            select: {
              name: true,
              price: true
            }
          },
          paymentOrder: {
            select: {
              orderId: true,
              status: true,
              amount: true,
              paymentMethod: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.participantCertificate.findMany({
        where: { participantId: user.id },
        orderBy: { issueDate: "desc" }
      }),
      prisma.participantSubmission.findMany({
        where: { participantId: user.id },
        orderBy: { createdAt: "desc" }
      }),
      prisma.participantNotification.findMany({
        where: { participantId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

    const confirmedRegistrations = registrations.filter(
      (r) => r.paymentStatus === "SUCCESS" && new Date(r.event.startDate) >= new Date()
    );
    const pendingRegistrations = registrations.filter(
      (r) => r.paymentStatus !== "SUCCESS" && r.paymentStatus !== "CANCELLED"
    );
    const completedRegistrations = registrations.filter(
      (r) => r.paymentStatus === "SUCCESS" && new Date(r.event.startDate) < new Date()
    );

    return NextResponse.json({
      profile: user,
      metrics: {
        totalRegistrations: registrations.length,
        upcomingCount: confirmedRegistrations.length, // Only confirmed passes count as upcoming
        confirmedCount: confirmedRegistrations.length,
        pendingCount: pendingRegistrations.length,
        completedCount: completedRegistrations.length,
        certificatesCount: certificates.length,
        submissionsCount: submissions.length,
        unreadNotificationsCount: notifications.filter((n) => !n.isRead).length
      },
      registrations,
      certificates,
      submissions,
      notifications
    });
  } catch (error) {
    console.error("Error fetching participant profile:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentParticipant();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, username: newUsernameRaw, phone, dateOfBirth, institution, avatarUrl } = body;

    const dataToUpdate: Record<string, any> = {};

    // 1. Full Name
    if (fullName !== undefined) {
      const trimmed = String(fullName || "").trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Full Name cannot be empty." }, { status: 400 });
      }
      dataToUpdate.fullName = trimmed;
    }

    // 2. Username (with validation & uniqueness check)
    if (newUsernameRaw !== undefined) {
      const sanitized = sanitizeUsername(String(newUsernameRaw || ""));
      if (!sanitized) {
        return NextResponse.json({ error: "Username cannot be empty." }, { status: 400 });
      }

      if (sanitized !== user.username) {
        if (!isValidUsername(sanitized)) {
          return NextResponse.json({
            error: "Username must be 3-30 characters with lowercase letters, numbers, or underscores only."
          }, { status: 400 });
        }

        const reserved = ["admin", "root", "vichaar", "support", "help", "official", "council", "secretariat", "moderator"];
        if (reserved.includes(sanitized)) {
          return NextResponse.json({ error: "This username is reserved." }, { status: 400 });
        }

        const conflict = await prisma.participantUser.findFirst({
          where: {
            username: sanitized,
            NOT: { id: user.id }
          }
        });

        if (conflict) {
          return NextResponse.json({ error: "Username is already taken by another participant." }, { status: 400 });
        }

        dataToUpdate.username = sanitized;
      }
    }

    // 3. Institution (properly clear to null if deleted or empty)
    if (institution !== undefined) {
      const trimmedInst = typeof institution === "string" ? institution.trim() : "";
      dataToUpdate.institution = trimmedInst.length > 0 ? trimmedInst : null;
    }

    // 4. Phone Number
    if (phone !== undefined) {
      const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
      dataToUpdate.phone = trimmedPhone.length > 0 ? trimmedPhone : null;
    }

    // 5. Date of Birth
    if (dateOfBirth !== undefined) {
      const trimmedDob = typeof dateOfBirth === "string" ? dateOfBirth.trim() : "";
      dataToUpdate.dateOfBirth = trimmedDob.length > 0 ? trimmedDob : null;
    }

    // 6. Avatar URL
    if (avatarUrl !== undefined) {
      dataToUpdate.avatarUrl = avatarUrl || null;
    }

    const updated = await prisma.participantUser.update({
      where: { id: user.id },
      data: dataToUpdate,
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
        role: true
      }
    });

    // Synchronize to Google Sheets Master Database in background
    syncParticipantToSheets({
      id: updated.id,
      fullName: updated.fullName,
      username: updated.username,
      email: updated.email,
      phone: updated.phone,
      dateOfBirth: updated.dateOfBirth,
      institution: updated.institution,
      isEmailVerified: updated.isEmailVerified
    }).catch((e) => console.error("[GSHEETS SYNC ERROR - PROFILE UPDATE]:", e));

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile: updated
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
