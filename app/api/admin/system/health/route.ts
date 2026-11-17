import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET() {
  const startTime = Date.now();
  const healthReport: any = {
    timestamp: new Date().toISOString(),
    status: "HEALTHY",
    services: {},
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || "development"
    }
  };

  // 1. Check SQLite Database
  try {
    const dbStart = Date.now();
    await prisma.$queryRawUnsafe("SELECT 1;");
    const dbLatency = Date.now() - dbStart;

    const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
    let dbSize = 0;
    if (fs.existsSync(dbPath)) {
      dbSize = fs.statSync(dbPath).size;
    }

    const [regCount, userCount, adminCount] = await Promise.all([
      prisma.registration.count(),
      prisma.participantUser.count(),
      prisma.adminUser.count()
    ]);

    healthReport.services.database = {
      name: "SQLite Database",
      status: "OPERATIONAL",
      latencyMs: dbLatency,
      details: {
        file: "prisma/dev.db",
        sizeBytes: dbSize,
        sizeFormatted: `${(dbSize / 1024).toFixed(1)} KB`,
        registrations: regCount,
        participants: userCount,
        administrators: adminCount
      }
    };
  } catch (err: any) {
    healthReport.services.database = {
      name: "SQLite Database",
      status: "DEGRADED",
      error: err.message
    };
    healthReport.status = "DEGRADED";
  }

  // 2. Check Cashfree Payments Configuration
  const cashfreeAppId = process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID;
  const cashfreeSecret = process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET;
  const cashfreeEnv = process.env.CASHFREE_ENVIRONMENT || "production";

  healthReport.services.cashfree = {
    name: "Cashfree Payment Gateway",
    status: cashfreeAppId && cashfreeSecret ? "OPERATIONAL" : "WARNING",
    details: {
      environment: cashfreeEnv.toUpperCase(),
      appIdMasked: cashfreeAppId ? `${cashfreeAppId.slice(0, 6)}...${cashfreeAppId.slice(-4)}` : "NOT_CONFIGURED",
      secretConfigured: Boolean(cashfreeSecret),
      webhookConfigured: Boolean(process.env.CASHFREE_WEBHOOK_SECRET),
      targetDomain: "thevichaarcouncil.in"
    }
  };

  // 3. Check Email Services (Resend & SMTP)
  const resendKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.EMAIL_SERVER_HOST || "smtp.gmail.com";
  const smtpUser = process.env.EMAIL_SERVER_USER || "thevichaarcouncil@gmail.com";

  healthReport.services.email = {
    name: "Resend & SMTP Communications",
    status: resendKey ? "OPERATIONAL" : "WARNING",
    details: {
      resendConfigured: Boolean(resendKey),
      resendKeyMasked: resendKey ? `${resendKey.slice(0, 6)}...` : "NOT_CONFIGURED",
      smtpHost,
      smtpPort: process.env.EMAIL_SERVER_PORT || 465,
      smtpSender: smtpUser,
      fromAddress: process.env.EMAIL_FROM || "The Vichaar Council <onboarding@resend.dev>"
    }
  };

  // 4. Check Google Sheets Master Database Webhook
  const sheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const sheetsApiKey = process.env.GOOGLE_SHEETS_API_KEY || process.env.TVC_API_SECRET_KEY;

  healthReport.services.googleSheets = {
    name: "Google Sheets Master Sync",
    status: sheetsWebhook ? "OPERATIONAL" : "WARNING",
    details: {
      webhookConfigured: Boolean(sheetsWebhook),
      webhookDomain: sheetsWebhook ? new URL(sheetsWebhook).hostname : "NOT_CONFIGURED",
      secretKeyConfigured: Boolean(sheetsApiKey),
      autoSyncOnPayment: true
    }
  };

  // 5. Check Firebase & Google Authentication
  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  healthReport.services.firebaseAuth = {
    name: "Firebase & Google Authentication",
    status: firebaseApiKey ? "OPERATIONAL" : "WARNING",
    details: {
      provider: "Google OAuth 2.0 (Firebase Client)",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "thevichaarcouncil",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "thevichaarcouncil.firebaseapp.com",
      appIdMasked: firebaseAppId ? `${firebaseAppId.slice(0, 10)}...` : "CONFIGURED",
      oneClickParticipantLogin: true,
      oneClickAdminLogin: true
    }
  };

  healthReport.totalLatencyMs = Date.now() - startTime;

  return NextResponse.json(healthReport);
}
