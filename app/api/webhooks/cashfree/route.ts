import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import cashfree from "@/lib/cashfree";
import { confirmRegistrationSuccess } from "@/lib/registration-service";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";

    const isVerified = cashfree.verifyWebhookSignature(rawBody, signature, timestamp);

    let parsedPayload: any = {};
    try {
      parsedPayload = JSON.parse(rawBody);
    } catch {
      parsedPayload = { raw: rawBody };
    }

    const eventType = parsedPayload.type || "PAYMENT_NOTIFICATION";
    const orderData = parsedPayload.data?.order || parsedPayload.data || {};
    const paymentData = parsedPayload.data?.payment || {};
    const orderId = orderData.order_id || parsedPayload.orderId;

    // Log the webhook
    await prisma.paymentWebhook.create({
      data: {
        eventId: parsedPayload.event_time ? String(parsedPayload.event_time) : `evt_${Date.now()}`,
        webhookType: eventType,
        payloadJson: rawBody,
        signature,
        isVerified
      }
    });

    if (!isVerified && process.env.NODE_ENV === "production") {
      console.warn("Cashfree Webhook: Invalid signature rejected.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Process payment success webhook
    if (orderId && (eventType === "PAYMENT_SUCCESS_WEBHOOK" || parsedPayload.event === "ORDER_PAID")) {
      const paymentOrder = await prisma.paymentOrder.findUnique({
        where: { orderId },
        include: { registration: true }
      });

      if (paymentOrder) {
        await confirmRegistrationSuccess({
          registrationId: paymentOrder.registrationId,
          orderId,
          cfPaymentId: paymentData.cf_payment_id || `cf_pay_${Date.now()}`,
          paymentMethod: paymentData.payment_method?.type || "ONLINE",
          bankReference: paymentData.bank_reference || paymentData.reference_id || `CF_REF_${Date.now()}`,
          amount: paymentOrder.amount,
          source: "CASHFREE_WEBHOOK"
        });
      }
    }

    return NextResponse.json({ status: "OK", received: true });
  } catch (error: any) {
    console.error("Cashfree Webhook Handler Error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
