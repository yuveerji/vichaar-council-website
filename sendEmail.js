const { Resend } = require("resend");

const {
  verificationEmail,
  registrationConfirmationEmail,
} = require("./emails");

const apiKey = process.env.RESEND_API_KEY || "";
const resend = new Resend(apiKey);

const SENDER = process.env.EMAIL_FROM || "MY VICHAAR <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// 1. Send verification email
async function sendVerification({ name, email, token }) {
  const verificationUrl =
    `${APP_URL}/my-vichaar/verify-email?token=${encodeURIComponent(token)}`;

  console.log("==================================================================");
  console.log(`[MY VICHAAR EMAIL] Sending Verification to: ${email} (${name})`);
  console.log(`[MY VICHAAR EMAIL] Verification Link: ${verificationUrl}`);
  console.log("==================================================================");

  try {
    const res = await resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: "thevichaarcouncil@gmail.com",
      subject: "Verify your email | MY VICHAAR",
      html: verificationEmail({
        name,
        verificationUrl,
        expiry: "24 hours",
      }),
    });

    if (res.error) {
      console.warn("Resend API notice:", res.error.message);
      if (email.toLowerCase() !== "thevichaarcouncil@gmail.com") {
        await resend.emails.send({
          from: SENDER,
          to: "thevichaarcouncil@gmail.com",
          subject: `[FORWARDED TO COUNCIL] Verify your email for ${email} | MY VICHAAR`,
          html: `<div style="padding:15px;background:#fff3cd;border:1px solid #ffeeba;margin-bottom:20px;font-family:sans-serif;font-size:13px;color:#856404;">
            <strong>Council Administration Dispatch Notice:</strong> This is a forwarded participant verification email for <strong>${name}</strong> (${email}).
          </div>` + verificationEmail({ name, verificationUrl, expiry: "24 hours" })
        }).catch(() => null);
      }
      return { success: true, isSimulation: true };
    }

    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to send verification email:", err);
    return { success: false, error: err.message };
  }
}

// 2. Send registration confirmation
async function sendRegistrationConfirmation({ name, email }) {
  const portalUrl = `${APP_URL}/my-vichaar/dashboard`;

  console.log("==================================================================");
  console.log(`[MY VICHAAR EMAIL] Sending Account Activation to: ${email} (${name})`);
  console.log(`[MY VICHAAR EMAIL] Portal Entry Link: ${portalUrl}`);
  console.log("==================================================================");

  try {
    const res = await resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: "thevichaarcouncil@gmail.com",
      subject: "Your account is now active | MY VICHAAR",
      html: registrationConfirmationEmail({
        name,
        email,
        portalUrl,
      }),
    });

    if (res.error) {
      console.warn("Resend API notice:", res.error.message);
      if (email.toLowerCase() !== "thevichaarcouncil@gmail.com") {
        await resend.emails.send({
          from: SENDER,
          to: "thevichaarcouncil@gmail.com",
          subject: `[FORWARDED TO COUNCIL] Account Activated for ${email} | MY VICHAAR`,
          html: `<div style="padding:15px;background:#d4edda;border:1px solid #c3e6cb;margin-bottom:20px;font-family:sans-serif;font-size:13px;color:#155724;">
            <strong>Council Administration Notice:</strong> Account successfully activated for <strong>${name}</strong> (${email}).
          </div>` + registrationConfirmationEmail({ name, email, portalUrl })
        }).catch(() => null);
      }
      return { success: true, isSimulation: true };
    }

    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendVerification,
  sendRegistrationConfirmation,
};
