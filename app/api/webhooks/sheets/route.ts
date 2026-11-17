import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  confirmRegistrationSuccess,
  cancelOrRemoveRegistration,
  updateRegistrationPaymentStatus
} from "@/lib/registration-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[GOOGLE SHEETS WEBHOOK RECEIVED]:", body);

    const action = body.action || "confirm_registration";
    const apiKey = body.apiKey || body.api_secret || req.headers.get("x-api-key");
    const configuredApiKey =
      process.env.GOOGLE_SHEETS_API_KEY ||
      process.env.TVC_API_SECRET_KEY ||
      "tvc_secret_prod_vichaar_council_db_2026_x89a";

    // Reconcile and test ping actions
    if (action === "ping" || action === "test_connection") {
      return NextResponse.json({
        success: true,
        status: "operational",
        message: "Google Sheets Master Database webhook endpoint is operational and authenticated.",
        timestamp: new Date().toISOString()
      });
    }

    if (configuredApiKey && apiKey && apiKey !== configuredApiKey) {
      return NextResponse.json({ error: "Unauthorized Google Sheets webhook" }, { status: 401 });
    }

    // =========================================================================
    // 01. RECONCILIATION: Prune / cancel registrations deleted directly in Google Sheets
    // =========================================================================
    if (action === "sync_active_registrations" && Array.isArray(body.active_registration_numbers)) {
      const activeSheetRegs = body.active_registration_numbers
        .map((r: any) => String(r).trim())
        .filter(Boolean);

      console.log(`[SHEETS RECONCILIATION] Received ${activeSheetRegs.length} active registration numbers from Sheet.`);

      // Find all registrations currently in website database that are NOT in Google Sheets
      const orphaned = await prisma.registration.findMany({
        where: {
          NOT: { registrationNumber: { in: activeSheetRegs } }
        },
        select: { id: true, registrationNumber: true, eventId: true }
      });

      if (orphaned.length > 0) {
        const orphanedIds = orphaned.map((o) => o.id);
        const orphanedNumbers = orphaned.map((o) => o.registrationNumber);

        console.log(`[SHEETS RECONCILIATION] Pruning ${orphaned.length} registrations removed from Sheet:`, orphanedNumbers);

        // Delete associated payment orders
        await prisma.paymentOrder.deleteMany({
          where: { registrationId: { in: orphanedIds } }
        }).catch(() => null);

        // Delete registrations
        await prisma.registration.deleteMany({
          where: { id: { in: orphanedIds } }
        });

        return NextResponse.json({
          success: true,
          message: `Reconciled database: ${orphaned.length} removed registration(s) synced and removed from website.`,
          pruned: orphanedNumbers
        });
      }

      return NextResponse.json({
        success: true,
        message: "All database registrations are fully synchronized with Google Sheets.",
        pruned: []
      });
    }

    // =========================================================================
    // 02. SINGLE REMOVAL / CANCELLATION: Action delete_registration or status CANCELLED/DELETED
    // =========================================================================
    const registrationNumber = body.registrationNumber || body.registration_number || body.reg_no;
    const orderId = body.orderId || body.order_id;
    const paymentStatus = String(body.paymentStatus || body.payment_status || body.status || "").toUpperCase();

    if (
      action === "delete_registration" ||
      action === "remove_registration" ||
      action === "cancel_registration" ||
      paymentStatus === "CANCELLED" ||
      paymentStatus === "DELETED" ||
      paymentStatus === "REFUNDED"
    ) {
      if (!registrationNumber && !orderId) {
        return NextResponse.json(
          { error: "registrationNumber or orderId is required to delete/cancel registration." },
          { status: 400 }
        );
      }

      const hardDelete = body.hardDelete !== false && (action === "delete_registration" || action === "remove_registration" || paymentStatus === "DELETED");

      const result = await cancelOrRemoveRegistration({
        registrationNumber,
        orderId,
        reason: body.reason || "Removed from Google Sheets Master Database by Secretariat",
        hardDelete
      });

      return NextResponse.json(result);
    }

    // =========================================================================
    // 03. PAYMENT STATUS UPDATE: SUCCESS, FAILED, PENDING, etc.
    // =========================================================================
    if (!registrationNumber && !orderId) {
      return NextResponse.json(
        { error: "registrationNumber or orderId is required to update registration from Sheets." },
        { status: 400 }
      );
    }

    const effectiveStatus = paymentStatus || (action === "payment_success" ? "SUCCESS" : "PENDING");
    const isForceResend = Boolean(
      body.force || body.resend || body.forceResend || body.action === "resend_details"
    );

    // Trigger full registration status update: DB update, In-Site Notification, and user communication
    const result = await updateRegistrationPaymentStatus({
      registrationNumber,
      orderId,
      paymentStatus: effectiveStatus,
      paymentMethod: body.paymentMethod || body.payment_method || "GSHEETS_VERIFIED",
      bankReference: body.bankReference || body.bank_reference || "GSHEETS_OFFICIAL",
      amount: body.amount ? Number(body.amount) : undefined,
      reason: body.reason || `Payment status changed to ${effectiveStatus} in Google Sheets`,
      source: "GSHEETS_SYNC",
      forceResend: isForceResend
    });

    const anyResult = result as any;
    return NextResponse.json({
      success: true,
      message: anyResult.message || `Registration ${registrationNumber} status updated to ${effectiveStatus}. User notified.`,
      status: effectiveStatus,
      registration: anyResult.registration || null
    });
  } catch (error: any) {
    console.error("[GOOGLE SHEETS WEBHOOK ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process Google Sheets webhook" },
      { status: 500 }
    );
  }
}
