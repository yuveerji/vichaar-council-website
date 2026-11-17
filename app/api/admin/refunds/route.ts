import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import cashfree from "@/lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { orderId, amount, reason } = await req.json();

    if (!orderId || !amount || !reason) {
      return NextResponse.json({ error: "Order ID, amount, and reason are required." }, { status: 400 });
    }

    const paymentOrder = await prisma.paymentOrder.findUnique({
      where: { orderId },
      include: { registration: true }
    });

    if (!paymentOrder || paymentOrder.status !== "SUCCESS") {
      return NextResponse.json({ error: "Eligible successful payment order not found." }, { status: 404 });
    }

    if (amount > paymentOrder.amount) {
      return NextResponse.json({ error: "Refund amount exceeds original transaction amount." }, { status: 400 });
    }

    const refundId = `rfnd_tvc_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const cfRefundResponse = await cashfree.initiateRefund({
      orderId,
      refundAmount: Number(amount),
      refundId,
      refundReason: reason
    });

    const refund = await prisma.$transaction(async (tx) => {
      const ref = await tx.refund.create({
        data: {
          refundId,
          orderId,
          amount: Number(amount),
          reason,
          status: "SUCCESS",
          cfRefundId: cfRefundResponse.cf_refund_id || `cf_rfnd_${Date.now()}`,
          initiatedBy: admin.email
        }
      });

      await tx.paymentOrder.update({
        where: { orderId },
        data: { status: "REFUNDED" }
      });

      await tx.registration.update({
        where: { id: paymentOrder.registrationId },
        data: { paymentStatus: "REFUNDED" }
      });

      await tx.auditLog.create({
        data: {
          userId: admin.id,
          action: "INITIATE_REFUND",
          entity: "Refund",
          entityId: ref.id,
          details: `Processed refund of ₹${amount} for order ${orderId}. Reason: ${reason}`
        }
      });

      return ref;
    });

    return NextResponse.json({
      success: true,
      message: `Refund of ₹${amount} processed successfully.`,
      refund
    });
  } catch (error: any) {
    console.error("Refund processing error:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate refund." }, { status: 500 });
  }
}
