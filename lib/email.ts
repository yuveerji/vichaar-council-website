import crypto from "crypto";
import { sendOtpEmail as sendOfficialOtpEmail } from "./sendEmail";

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

interface SendOtpOptions {
  to: string;
  fullName: string;
  otp: string;
  purpose?: string;
  expiryMinutes?: number;
}

/**
 * Send an official institutional OTP email via Gmail SMTP (from thevichaarcouncil@gmail.com).
 */
export async function sendOtpEmail({
  to,
  fullName,
  otp,
  purpose = "Email Verification",
  expiryMinutes = 10
}: SendOtpOptions): Promise<{ success: boolean; messageId?: string; error?: string; isSimulation?: boolean }> {
  try {
    const result = await sendOfficialOtpEmail({
      to,
      fullName,
      otp,
      purpose,
      expiryMinutes
    });

    return {
      success: result.success,
      messageId: result.data?.messageId || result.data?.id,
      error: result.error
    };
  } catch (err: any) {
    console.error("sendOtpEmail error:", err);
    return {
      success: false,
      error: err.message || "Failed to dispatch OTP"
    };
  }
}
