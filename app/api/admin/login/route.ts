import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = body.identifier || body.email;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Institutional email or username and password are required." },
        { status: 400 }
      );
    }

    const adminUser = await verifyAdminCredentials(identifier, password);

    if (!adminUser) {
      return NextResponse.json(
        { error: "Invalid administrative credentials or account not on authorized admin list." },
        { status: 401 }
      );
    }

    await createAdminSession(adminUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (error: any) {
    console.error("Admin Login Error:", error);
    return NextResponse.json({ error: "Authentication server error." }, { status: 500 });
  }
}
