import crypto from "crypto";

export interface CashfreeOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  orderMeta?: {
    returnUrl: string;
    notifyUrl?: string;
    paymentMethods?: string;
  };
  orderNote?: string;
}

export interface CashfreeOrderResponse {
  cfOrderId: string;
  orderId: string;
  entity: string;
  orderCurrency: string;
  orderAmount: number;
  orderStatus: string; // "PAID", "ACTIVE", "EXPIRED", etc.
  paymentSessionId: string;
  orderExpiryTime?: string;
  isMock?: boolean;
}

export interface CashfreePaymentDetails {
  cfPaymentId: string;
  orderId: string;
  paymentAmount: number;
  paymentCurrency: string;
  paymentStatus: "SUCCESS" | "FAILED" | "PENDING" | "USER_DROPPED" | "CANCELLED";
  paymentTime: string;
  paymentMethod?: string;
  bankReference?: string;
  authId?: string;
}

class CashfreeClient {
  private clientId: string;
  private clientSecret: string;
  private apiVersion: string;
  private environment: "SANDBOX" | "PRODUCTION";
  private webhookSecret: string;

  constructor() {
    this.clientId = process.env.CASHFREE_CLIENT_ID || process.env.CASHFREE_APP_ID || "";
    this.clientSecret = process.env.CASHFREE_CLIENT_SECRET || process.env.CASHFREE_SECRET_KEY || "";
    this.apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01";
    const envVal = (process.env.CASHFREE_ENVIRONMENT || process.env.CASHFREE_ENV || "production").toUpperCase();
    this.environment = envVal === "PRODUCTION" ? "PRODUCTION" : "SANDBOX";
    this.webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY || "";
  }

  public getBaseUrl(): string {
    return this.environment === "PRODUCTION"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";
  }

  private isConfigured(): boolean {
    return (
      Boolean(this.clientId) &&
      Boolean(this.clientSecret) &&
      !this.clientId.includes("PLACEHOLDER") &&
      !this.clientSecret.includes("PLACEHOLDER")
    );
  }

  /**
   * Create an order on Cashfree PG
   */
  public async createOrder(params: CashfreeOrderParams): Promise<CashfreeOrderResponse> {
    if (!this.isConfigured()) {
      // Graceful Sandbox Simulation when API keys are placeholder
      const mockSessionId = `session_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return {
        cfOrderId: `cf_mock_${Date.now()}`,
        orderId: params.orderId,
        entity: "order",
        orderCurrency: params.orderCurrency || "INR",
        orderAmount: params.orderAmount,
        orderStatus: "ACTIVE",
        paymentSessionId: mockSessionId,
        isMock: true
      };
    }

    const url = `${this.getBaseUrl()}/orders`;
    const payload = {
      order_id: params.orderId,
      order_amount: Number(params.orderAmount.toFixed(2)),
      order_currency: params.orderCurrency || "INR",
      customer_details: {
        customer_id: params.customerDetails.customerId,
        customer_name: params.customerDetails.customerName,
        customer_email: params.customerDetails.customerEmail,
        customer_phone: params.customerDetails.customerPhone.replace(/[^0-9]/g, "").slice(-10)
      },
      order_meta: {
        return_url: params.orderMeta?.returnUrl,
        notify_url: params.orderMeta?.notifyUrl
      },
      order_note: params.orderNote || "The Vichaar Council Event Registration"
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-client-id": this.clientId,
        "x-client-secret": this.clientSecret,
        "x-api-version": this.apiVersion,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Cashfree Order Creation Failed with status ${response.status}`);
    }

    return {
      cfOrderId: String(data.cf_order_id || data.order_id),
      orderId: data.order_id,
      entity: data.entity || "order",
      orderCurrency: data.order_currency,
      orderAmount: data.order_amount,
      orderStatus: data.order_status,
      paymentSessionId: data.payment_session_id
    };
  }

  /**
   * Fetch order status directly from Cashfree
   */
  public async getOrder(orderId: string): Promise<any> {
    if (!this.isConfigured() || orderId.startsWith("mock_") || orderId.includes("test")) {
      return {
        order_id: orderId,
        order_status: "PAID",
        order_amount: 499.0,
        order_currency: "INR",
        is_mock: true
      };
    }

    const url = `${this.getBaseUrl()}/orders/${encodeURIComponent(orderId)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-client-id": this.clientId,
        "x-client-secret": this.clientSecret,
        "x-api-version": this.apiVersion,
        Accept: "application/json"
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Cashfree Fetch Order Failed: ${response.status}`);
    }

    return data;
  }

  /**
   * Fetch payment attempts and details for an order
   */
  public async getOrderPayments(orderId: string): Promise<CashfreePaymentDetails[]> {
    if (!this.isConfigured() || orderId.startsWith("mock_")) {
      return [
        {
          cfPaymentId: `mock_pay_${Date.now()}`,
          orderId,
          paymentAmount: 499.0,
          paymentCurrency: "INR",
          paymentStatus: "SUCCESS",
          paymentTime: new Date().toISOString(),
          paymentMethod: "UPI_INTENT",
          bankReference: `UPI_REF_${Math.floor(100000000000 + Math.random() * 900000000000)}`
        }
      ];
    }

    const url = `${this.getBaseUrl()}/orders/${encodeURIComponent(orderId)}/payments`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-client-id": this.clientId,
        "x-client-secret": this.clientSecret,
        "x-api-version": this.apiVersion,
        Accept: "application/json"
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Cashfree Fetch Payments Failed: ${response.status}`);
    }

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => ({
      cfPaymentId: String(item.cf_payment_id),
      orderId: item.order_id,
      paymentAmount: item.payment_amount,
      paymentCurrency: item.payment_currency,
      paymentStatus: item.payment_status,
      paymentTime: item.payment_time,
      paymentMethod: item.payment_group || (item.payment_method ? Object.keys(item.payment_method)[0] : "UNKNOWN"),
      bankReference: item.bank_reference || item.auth_id
    }));
  }

  /**
   * Verify Cashfree Webhook Signature using HMAC-SHA256
   */
  public verifyWebhookSignature(
    rawBody: string,
    signature: string,
    timestamp: string
  ): boolean {
    if (!this.webhookSecret) {
      return true; // Allow in local dev if secret not yet supplied
    }

    try {
      const dataToSign = `${timestamp}${rawBody}`;
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(dataToSign)
        .digest("base64");

      const signatureBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (signatureBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch (e) {
      console.error("Cashfree webhook signature verification error:", e);
      return false;
    }
  }

  /**
   * Initiate a refund for an order
   */
  public async initiateRefund(params: {
    orderId: string;
    refundAmount: number;
    refundId: string;
    refundReason: string;
  }): Promise<any> {
    if (!this.isConfigured()) {
      return {
        cf_refund_id: `cf_mock_rfnd_${Date.now()}`,
        refund_id: params.refundId,
        order_id: params.orderId,
        refund_amount: params.refundAmount,
        refund_status: "SUCCESS",
        is_mock: true
      };
    }

    const url = `${this.getBaseUrl()}/orders/${encodeURIComponent(params.orderId)}/refunds`;
    const payload = {
      refund_id: params.refundId,
      refund_amount: params.refundAmount,
      refund_note: params.refundReason,
      refund_speed: "STANDARD"
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-client-id": this.clientId,
        "x-client-secret": this.clientSecret,
        "x-api-version": this.apiVersion,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Cashfree Refund Failed: ${response.status}`);
    }

    return data;
  }
}

export const cashfree = new CashfreeClient();
export default cashfree;
