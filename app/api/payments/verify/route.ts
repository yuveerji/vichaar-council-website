import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import cashfree from "@/lib/cashfree";
import { confirmRegistrationSuccess } from "@/lib/registration-service";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required for verification." }, { status: 400 });
    }

    // 1. Fetch internal PaymentOrder & Registration
    const paymentOrder = await prisma.paymentOrder.findUnique({
      where: { orderId },
      include: {
        registration: {
          include: {
            event: true,
            ticketCategory: true
          }
        }
      }
    });

    if (!paymentOrder) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    // If already verified SUCCESS, return receipt immediately
    if (paymentOrder.status === "SUCCESS" && paymentOrder.registration.paymentStatus === "SUCCESS") {
      return NextResponse.json({
        success: true,
        status: "SUCCESS",
        registration: {
          registrationNumber: paymentOrder.registration.registrationNumber,
          fullName: paymentOrder.registration.fullName,
          email: paymentOrder.registration.email,
          eventTitle: paymentOrder.registration.event.title,
          eventDate: paymentOrder.registration.event.startDate,
          venue: paymentOrder.registration.event.venue,
          ticketName: paymentOrder.registration.ticketCategory.name,
          amountPaid: paymentOrder.amount,
          currency: paymentOrder.currency,
          orderId: paymentOrder.orderId,
          paymentMethod: paymentOrder.paymentMethod || "UPI",
          bankReference: paymentOrder.bankReference || "N/A",
          confirmedAt: paymentOrder.paymentTime || paymentOrder.updatedAt
        }
      });
    }

    // 2. Query Cashfree for current order status & payment details
    const [cfOrderData, cfPayments] = await Promise.all([
      cashfree.getOrder(orderId).catch(() => null),
      cashfree.getOrderPayments(orderId).catch(() => [])
    ]);

    const isOrderPaid =
      cfOrderData?.order_status === "PAID" ||
      cfPayments.some((p: any) => p.paymentStatus === "SUCCESS");

    const successfulPayment = cfPayments.find((p: any) => p.paymentStatus === "SUCCESS") || cfPayments[0];

    if (isOrderPaid) {
      // 3. Centralized confirmation: updates DB, creates in-site notification, syncs to Google Sheets & dispatches admission email
      const result = await confirmRegistrationSuccess({
        registrationId: paymentOrder.registrationId,
        orderId,
        cfPaymentId: successfulPayment?.cfPaymentId,
        paymentMethod: successfulPayment?.paymentMethod || "ONLINE_GATEWAY",
        bankReference: successfulPayment?.bankReference || `CF_TXN_${Date.now()}`,
        amount: paymentOrder.amount,
        source: "CASHFREE_VERIFY"
      });

      return NextResponse.json({
        success: true,
        status: "SUCCESS",
        registration: result.registration
      });
    } else {
      // Check for failure / pending
      const latestStatus = cfOrderData?.order_status || "PENDING";
      const internalStatus = latestStatus === "EXPIRED" ? "EXPIRED" : latestStatus === "FAILED" ? "FAILED" : "PENDING";

      await prisma.paymentOrder.update({
        where: { orderId },
        data: {
          status: internalStatus,
          rawResponseJson: JSON.stringify({ cfOrderData, cfPayments })
        }
      });

      return NextResponse.json({
        success: false,
        status: internalStatus,
        message: "Payment is pending confirmation or was not completed.",
        orderId
      });
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify transaction status." },
      { status: 500 }
    );
  }
}
