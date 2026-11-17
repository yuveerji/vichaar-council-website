import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regNo = searchParams.get("reg") || searchParams.get("code") || searchParams.get("id");

    if (!regNo) {
      return NextResponse.json({ error: "Registration number required." }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({
      where: { registrationNumber: regNo },
      include: {
        event: {
          select: {
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
            venue: true,
            city: true
          }
        },
        ticketCategory: {
          select: {
            name: true,
            price: true
          }
        },
        participant: {
          select: {
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!registration) {
      return NextResponse.json(
        { verified: false, error: "No accreditation record matches this credential." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verified: true,
      accreditation: {
        registrationNumber: registration.registrationNumber,
        delegateName: registration.fullName,
        username: registration.participant?.username || null,
        avatarUrl: registration.participant?.avatarUrl || null,
        institution: registration.institution || "Independent Delegate",
        eventTitle: registration.event.title,
        eventSlug: registration.event.slug,
        eventDate: registration.event.startDate,
        venue: registration.event.venue,
        city: registration.event.city,
        ticketTier: registration.ticketCategory.name,
        paymentStatus: registration.paymentStatus,
        checkInStatus: registration.checkInStatus,
        issuedAt: registration.createdAt
      }
    });
  } catch (error: any) {
    console.error("Verification API error:", error);
    return NextResponse.json(
      { error: "Internal verification service error." },
      { status: 500 }
    );
  }
}
