import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug, summary, description, categoryName, format, venue, city, startDate, capacity, tickets } = body;

    if (!title || !slug || !summary || !description || !startDate) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        summary,
        description,
        categoryName: categoryName || "Assembly",
        format: format || "IN_PERSON",
        venue: venue || "New Delhi Chamber",
        city: city || "New Delhi",
        startDate: new Date(startDate),
        capacity: Number(capacity) || 100,
        status: "REGISTRATION_OPEN",
        isPublished: true,
        tickets: {
          create: (tickets || []).map((t: any) => ({
            name: t.name,
            price: Number(t.price),
            capacity: Number(t.capacity) || 50,
            description: t.description || ""
          }))
        }
      }
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: error.message || "Failed to create event." }, { status: 500 });
  }
}
