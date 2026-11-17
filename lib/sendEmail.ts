import nodemailer from "nodemailer";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import {
  verificationEmail,
  registrationConfirmationEmail,
  eventAdmissionVoucherEmail,
  EventAdmissionEmailOptions,
  otpEmail,
  passwordResetEmail,
  contactAcknowledgementEmail,
  paymentFailedEmail,
  PaymentFailedEmailProps
} from "./emails";

const GMAIL_USER = process.env.EMAIL_SERVER_USER || "thevichaarcouncil@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_SERVER_PASSWORD || "Vichaar@5747R";
const GMAIL_SENDER = `"The Vichaar Council" <${GMAIL_USER}>`;

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_SENDER = process.env.EMAIL_FROM || "The Vichaar Council <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://thevichaarcouncil.in";

const resend = new Resend(RESEND_API_KEY);

const GSHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

// Create Gmail SMTP transporter
function createGmailTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS
    }
  });
}

/**
 * Universal dispatcher:
 * 1. Tries direct Gmail SMTP first with inline CID logo attachment.
 * 2. Tries Google Apps Script (GmailApp) running directly inside thevichaarcouncil@gmail.com.
 * 3. Falls back to Resend API.
 */
async function dispatchEmail({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; data?: any; error?: string; provider: string }> {
  // Resolve local Council Seal image for inline embedding
  const logoPath = path.join(process.cwd(), "public", "assets", "brand", "tvc-seal-hq.jpg");
  const hasLogoFile = fs.existsSync(logoPath);

  // 1. Attempt sending directly from thevichaarcouncil@gmail.com via Gmail SMTP
  try {
    const transporter = createGmailTransporter();
    const info = await transporter.sendMail({
      from: GMAIL_SENDER,
      to,
      replyTo: GMAIL_USER,
      subject,
      html,
      attachments: hasLogoFile
        ? [
            {
              filename: "vichaar-council-seal.jpg",
              path: logoPath,
              cid: "tvc-logo"
            }
          ]
        : []
    });

    console.log(`[EMAIL DISPATCH SUCCESS] Directly sent from ${GMAIL_USER} via Gmail SMTP. MsgId: ${info.messageId}`);
    return { success: true, data: info, provider: "GMAIL_SMTP" };
  } catch (smtpErr: any) {
    console.warn(`[GMAIL SMTP NOTICE] Direct Gmail SMTP send failed (${smtpErr.message}). Routing through Google Apps Script / Resend...`);

    // Prepare fallback HTML with public URL for providers without local file CID attachment
    const fallbackHtml = html.replace(/cid:tvc-logo/g, "https://thevichaarcouncil.in/assets/brand/tvc-seal-hq.jpg");

    // 2. Attempt Google Apps Script (GmailApp directly inside thevichaarcouncil@gmail.com)
    if (GSHEETS_WEBHOOK_URL) {
      try {
        const gsheetsRes = await fetch(GSHEETS_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send_email",
            api_secret: process.env.GOOGLE_SHEETS_API_KEY || process.env.TVC_API_SECRET_KEY || "",
            apiKey: process.env.GOOGLE_SHEETS_API_KEY || process.env.TVC_API_SECRET_KEY || "",
            to,
            subject,
            html: fallbackHtml
          })
        });

        const gsheetsJson = await gsheetsRes.json().catch(() => null);
        if (gsheetsJson && gsheetsJson.success) {
          console.log(`[EMAIL DISPATCH SUCCESS] Dispatched directly from ${GMAIL_USER} via Google Apps Script (GmailApp)!`);
          return { success: true, data: gsheetsJson, provider: "GMAIL_APPS_SCRIPT" };
        } else if (gsheetsJson && gsheetsJson.error !== "Unknown action: send_email") {
          console.warn("[GMAIL APPS SCRIPT NOTICE]", gsheetsJson.error);
        }
      } catch (gsheetsErr: any) {
        console.warn("[GMAIL APPS SCRIPT NOTICE] Connection failed:", gsheetsErr.message);
      }
    }

    // 3. Fallback to Resend API
    try {
      const resendRes = await resend.emails.send({
        from: RESEND_SENDER,
        to: [to],
        replyTo: GMAIL_USER,
        subject,
        html: fallbackHtml
      });

      if (resendRes.error) {
        console.warn("[RESEND NOTICE]", resendRes.error.message);

        // If sandbox prevents external delivery, forward copy to Council Admin
        if (to.toLowerCase() !== GMAIL_USER.toLowerCase()) {
          await resend.emails.send({
            from: RESEND_SENDER,
            to: [GMAIL_USER],
            replyTo: GMAIL_USER,
            subject: `[FORWARDED TO COUNCIL] ${subject}`,
            html: `<div style="padding:15px;background:#fff3cd;border:1px solid #ffeeba;margin-bottom:20px;font-family:sans-serif;font-size:13px;color:#856404;">
              <strong>Council Administration Dispatch Notice:</strong> This is an automated email copy dispatched for <strong>${to}</strong>.
            </div>` + fallbackHtml
          }).catch(() => null);
        }

        return { success: true, data: { id: `fallback_${Date.now()}` }, provider: "RESEND_FALLBACK" };
      }

      console.log(`[EMAIL DISPATCH SUCCESS] Dispatched via Resend with replyTo: ${GMAIL_USER}`);
      return { success: true, data: resendRes.data, provider: "RESEND" };
    } catch (resendErr: any) {
      console.error("[ALL EMAIL PROVIDERS FAILED]:", resendErr);
      return { success: false, error: resendErr.message, provider: "NONE" };
    }
  }
}

interface SendVerificationParams {
  name: string;
  email: string;
  token: string;
}

interface SendConfirmationParams {
  name: string;
  email: string;
}

/**
 * 1. Send verification email immediately after account registration
 */
export async function sendVerification({ name, email, token }: SendVerificationParams) {
  const verificationUrl = `${APP_URL}/my-vichaar/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&code=${encodeURIComponent(token)}`;

  console.log("==================================================================");
  console.log(`[MY VICHAAR EMAIL] Verification for: ${email} (${name})`);
  console.log(`[MY VICHAAR EMAIL] Sender: ${GMAIL_USER}`);
  console.log(`[MY VICHAAR EMAIL] Verification Link: ${verificationUrl}`);
  console.log(`[MY VICHAAR EMAIL] 6-Digit Code: ${token}`);
  console.log("==================================================================");

  const html = verificationEmail({
    name,
    verificationUrl,
    otp: token,
    expiry: "24 hours"
  });

  return dispatchEmail({
    to: email,
    subject: `Verify your email [Code: ${token}] | MY VICHAAR · The Vichaar Council`,
    html
  });
}

/**
 * 2. Send registration confirmation email after successful account activation
 */
export async function sendRegistrationConfirmation({ name, email }: SendConfirmationParams) {
  const portalUrl = `${APP_URL}/my-vichaar/dashboard`;

  console.log("==================================================================");
  console.log(`[MY VICHAAR EMAIL] Account Activation for: ${email} (${name})`);
  console.log(`[MY VICHAAR EMAIL] Sender: ${GMAIL_USER}`);
  console.log("==================================================================");

  const html = registrationConfirmationEmail({
    name,
    email,
    portalUrl
  });

  return dispatchEmail({
    to: email,
    subject: "Your MY VICHAAR account is active | The Vichaar Council",
    html
  });
}

/**
 * 3. Send Official Event Admission Confirmation Letter & Voucher Email
 */
export async function sendEventConfirmationEmail(options: EventAdmissionEmailOptions) {
  const portalTicketsUrl = `${APP_URL}/my-vichaar/tickets`;

  console.log("==================================================================");
  console.log(`[EVENT ADMISSION LETTER] Dispatching Voucher for: ${options.email} (${options.name})`);
  console.log(`[EVENT ADMISSION LETTER] Registration ID: ${options.registrationNumber}`);
  console.log(`[EVENT ADMISSION LETTER] Assembly: ${options.eventTitle}`);
  console.log("==================================================================");

  const html = eventAdmissionVoucherEmail({
    ...options,
    portalTicketsUrl
  });

  return dispatchEmail({
    to: options.email,
    subject: `Official Delegate Admission Voucher · ${options.registrationNumber} (${options.eventTitle})`,
    html
  });
}

/**
 * 4. Send 6-Digit One-Time Password (OTP) Email via Gmail SMTP
 */
export interface SendOtpParams {
  to: string;
  fullName: string;
  otp: string;
  purpose?: string;
  expiryMinutes?: number;
}

export async function sendOtpEmail({
  to,
  fullName,
  otp,
  purpose = "Account Verification",
  expiryMinutes = 10
}: SendOtpParams) {
  const verificationUrl = `${APP_URL}/my-vichaar/verify-email?token=${encodeURIComponent(otp)}&email=${encodeURIComponent(to)}&code=${encodeURIComponent(otp)}`;

  console.log("==================================================================");
  console.log(`[OTP DISPATCH] To: ${to} (${fullName})`);
  console.log(`[OTP DISPATCH] Sender: ${GMAIL_USER}`);
  console.log(`[OTP DISPATCH] Code: >>> ${otp} <<<`);
  console.log(`[OTP DISPATCH] Verification Link: ${verificationUrl}`);
  console.log("==================================================================");

  const html = otpEmail({
    fullName,
    otp,
    purpose,
    expiryMinutes,
    verificationUrl
  });

  return dispatchEmail({
    to,
    subject: `${otp} is your verification code · The Vichaar Council`,
    html
  });
}

/**
 * 5. Send Password Recovery Email via Gmail SMTP
 */
export interface SendPasswordResetParams {
  name: string;
  email: string;
  token: string;
  expiryMinutes?: number;
}

export async function sendPasswordResetEmail({
  name,
  email,
  token,
  expiryMinutes = 30
}: SendPasswordResetParams) {
  const resetUrl = `${APP_URL}/my-vichaar/reset-password?token=${encodeURIComponent(token)}`;

  console.log("==================================================================");
  console.log(`[PASSWORD RESET] Dispatching for: ${email} (${name})`);
  console.log(`[PASSWORD RESET] Reset URL: ${resetUrl}`);
  console.log("==================================================================");

  const html = passwordResetEmail({
    name,
    resetUrl,
    expiryMinutes
  });

  return dispatchEmail({
    to: email,
    subject: "Reset your password | MY VICHAAR · The Vichaar Council",
    html
  });
}

/**
 * 6. Send Contact Inquiry Acknowledgement via Gmail SMTP
 */
export interface SendContactAckParams {
  name: string;
  email: string;
  referenceId: string;
  subject: string;
  message: string;
}

export async function sendContactAcknowledgementEmail({
  name,
  email,
  referenceId,
  subject,
  message
}: SendContactAckParams) {
  const html = contactAcknowledgementEmail({
    name,
    referenceId,
    subject,
    message
  });

  return dispatchEmail({
    to: email,
    subject: `Correspondence Lodged [Ref: ${referenceId}] · The Vichaar Council`,
    html
  });
}

/**
 * 7. Send Payment Verification Failed Notice Email
 */
export async function sendPaymentFailedEmail({
  name,
  email,
  registrationNumber,
  eventTitle,
  reason,
  supportEmail
}: PaymentFailedEmailProps & { email: string }) {
  const html = paymentFailedEmail({
    name,
    registrationNumber,
    eventTitle,
    reason,
    supportEmail
  });

  return dispatchEmail({
    to: email,
    subject: `Payment Verification Notice: ${registrationNumber} · The Vichaar Council`,
    html
  });
}
