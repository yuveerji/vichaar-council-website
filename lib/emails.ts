export const BRAND = {
  name: "THE VICHAAR COUNCIL",
  portal: "MY VICHAAR",
  navy: "#101C32",
  cream: "#F8E6A0",
  crimson: "#B51F24",
  citrus: "#FFA62B",
  slate: "#263B59",
  charcoal: "#1F242E",
  paper: "#F7F6F2"
};

export const escapeHTML = (value: any = ""): string =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char] || char);

interface EmailLayoutOptions {
  preheader: string;
  content: string;
  logoUrl?: string;
}



// Shared email layout with institutional typography (Bodoni Moda / Cormorant Garamond / Manrope)
export function emailLayout({ preheader, content, logoUrl }: EmailLayoutOptions): string {
  const effectiveLogoUrl = logoUrl || "cid:tvc-logo";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>MY VICHAAR | The Vichaar Council</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,600;0,6..96,700;1,6..96,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,600;0,6..96,700;1,6..96,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@400;500;600;700&display=swap');
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }


    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }


    img { -ms-interpolation-mode: bicubic; }


  </style>
</head>

<body style="margin:0;padding:0;background:#F3F2EE;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.navy};-webkit-font-smoothing:antialiased;">

<div style="display:none;font-size:1px;color:#F3F2EE;max-height:0;max-width:0;opacity:0;overflow:hidden;">
${escapeHTML(preheader)}


</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background:#F3F2EE;">
<tr>
<td align="center" style="padding:45px 15px;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
  style="max-width:600px;background:#FFFFFF;border-radius:6px;overflow:hidden;box-shadow:0 12px 36px rgba(16,28,50,0.08);border:1px solid #E6E4DC;">

<!-- Institutional Header with Official Council Seal -->
<tr>
<td style="background:${BRAND.navy};padding:36px 32px 28px;text-align:center;">

  <!-- Official Council Seal / Logo -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
    <tr>
      <td align="center">
        <img src="${effectiveLogoUrl}" alt="The Vichaar Council" width="82" height="82" style="display:block;width:82px;height:82px;object-fit:contain;margin:0 auto;" />
      </td>
    </tr>
  </table>

  <div style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:5px;color:#FFFFFF;font-weight:600;text-transform:uppercase;">
    VICHAAR
  </div>

  <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:9.5px;letter-spacing:3.5px;color:${BRAND.cream};margin-top:8px;text-transform:uppercase;font-weight:600;">
    THE VICHAAR COUNCIL · WHERE IDEAS EARN THEIR WEIGHT
  </div>

  <div style="height:1px;background:#35445E;margin:18px auto 14px;max-width:110px;"></div>

  <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:10px;letter-spacing:2.5px;color:#C7CDD5;font-weight:500;">
    MY VICHAAR · PARTICIPANT PORTAL
  </div>

</td>
</tr>

<!-- Main Content -->
<tr>
<td style="padding:48px 42px 38px;">
${content}


</td>
</tr>

<!-- Institutional Footer -->
<tr>
<td style="background:${BRAND.paper};padding:32px 35px;text-align:center;border-top:1px solid #EAE8E2;">

  <div style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-size:17px;color:${BRAND.navy};letter-spacing:2.5px;font-weight:600;">
    THE VICHAAR COUNCIL
  </div>

  <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:11px;line-height:1.8;color:#717885;margin:12px 0 10px;">
    <em>Where Ideas Earn Their Weight.</em>
    <br>
    Official digital dispatch from MY VICHAAR Secretariat.
    Please do not reply directly to this automated address.
  </p>

  <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:10px;color:#9CA3AF;margin-top:18px;letter-spacing:0.5px;">
    © ${new Date().getFullYear()} The Vichaar Council. All rights reserved.
  </div>

</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;
}



export interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
  otp?: string;
  expiry?: string;
  logoUrl?: string;
}



export function verificationEmail({
  name,
  verificationUrl,
  otp,
  expiry = "24 hours",
  logoUrl
}: VerificationEmailProps): string {
  const safeName = escapeHTML(name);

  return emailLayout({
    preheader: "Verify your email address to activate your MY VICHAAR account.",
    logoUrl,

    content: `
      <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:10px;letter-spacing:2.5px;color:${BRAND.crimson};font-weight:700;margin-bottom:18px;text-transform:uppercase;">
        ACCOUNT SECURITY / EMAIL VERIFICATION
      </div>

      <h1 style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-weight:600;font-size:34px;line-height:1.2;color:${BRAND.navy};margin:0 0 24px;letter-spacing:-0.5px;">
        Verify your email.
      </h1>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:15px;line-height:1.8;color:#4B5565;">
        Dear <strong>${safeName}</strong>,
      </p>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14.5px;line-height:1.9;color:#4B5565;">
        Welcome to <strong>MY VICHAAR</strong>, the official participant portal of The Vichaar Council.
      </p>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14px;line-height:1.9;color:#596273;">
        We have received your account registration. To verify your email address and activate full Council credentials, click the verification button below or enter your 6-digit code in your browser:
      </p>

      ${
        otp
          ? `
      <!-- Large Styled OTP Card -->
      <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 16px;">
        <tr>
          <td align="center">
            <div style="display:inline-block;background:#070E1A;border:2px solid ${BRAND.citrus};border-radius:12px;padding:18px 36px;box-shadow:0 8px 24px rgba(7,14,26,0.25);text-align:center;">
              <div style="font-size:9.5px;letter-spacing:2.5px;color:#A5A8AD;text-transform:uppercase;font-weight:700;margin-bottom:8px;">
                YOUR 6-DIGIT VERIFICATION CODE
              </div>
              <div style="font-family:'Courier New',Courier,monospace;font-size:40px;letter-spacing:0.35em;color:${BRAND.citrus};font-weight:800;line-height:1;">
                ${escapeHTML(otp)}


              </div>
            </div>
          </td>
        </tr>
      </table>

      <div style="text-align:center;font-size:11px;color:#8F96A3;margin:8px 0 20px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">
        — OR VERIFY WITH ONE CLICK —
      </div>
      `
          : ""
      }



      <!-- Prominent 1-Click Verification Button -->
      <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td align="center">
            <a href="${escapeHTML(verificationUrl)}"
            style="display:inline-block;background:${BRAND.navy};color:#FFFFFF;text-decoration:none;padding:17px 40px;font-family:'Manrope',-apple-system,sans-serif;font-size:12.5px;letter-spacing:2px;font-weight:700;border-radius:6px;border:1px solid #334460;box-shadow:0 6px 18px rgba(16,28,50,0.25);text-transform:uppercase;">
              VERIFY EMAIL ADDRESS &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:12px;line-height:1.8;color:#7A8291;text-align:center;">
        This verification link & code expire in <strong>${escapeHTML(expiry)}</strong>. If you did not initiate this registration, you can safely ignore this dispatch.
      </p>

      <div style="background:#F7F6F2;padding:16px 20px;margin-top:24px;border-left:3px solid ${BRAND.citrus};border-radius:0 4px 4px 0;">
        <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:11.5px;color:#616977;line-height:1.8;margin:0;">
          <strong style="color:${BRAND.navy};">Having trouble with the button?</strong><br>
          Clicking the button will immediately redirect you to the website and verify your email. If the button doesn't open, copy and paste this URL into your browser:
          <br><br>
          <a href="${escapeHTML(verificationUrl)}"
          style="color:${BRAND.crimson};word-break:break-all;text-decoration:underline;">
            ${escapeHTML(verificationUrl)}


          </a>
        </p>
      </div>

      <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:19px;font-style:italic;color:${BRAND.navy};margin-top:36px;border-top:1px solid #EFECE6;padding-top:20px;">
        Ideas begin with a voice.
      </p>
    `
  });
}



export interface RegistrationConfirmationEmailProps {
  name: string;
  email: string;
  portalUrl: string;
}



export function registrationConfirmationEmail({ name, email, portalUrl }: RegistrationConfirmationEmailProps): string {
  const safeName = escapeHTML(name);
  const safeEmail = escapeHTML(email);

  return emailLayout({
    preheader: "Your MY VICHAAR account has been successfully activated.",

    content: `
      <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:10px;letter-spacing:2.5px;color:#2E7D32;font-weight:700;margin-bottom:18px;text-transform:uppercase;">
        ACCOUNT ACTIVATED / 02
      </div>

      <h1 style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-weight:600;font-size:34px;line-height:1.2;color:${BRAND.navy};margin:0 0 24px;letter-spacing:-0.5px;">
        You're officially in.
      </h1>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:15px;line-height:1.8;color:#4B5565;">
        Dear <strong>${safeName}</strong>,
      </p>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14.5px;line-height:1.9;color:#4B5565;">
        Your email address has been successfully authenticated, and your account on <strong>MY VICHAAR</strong> is now fully active.
      </p>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14px;line-height:1.9;color:#596273;">
        Welcome to the digital participant community of The Vichaar Council. You can now manage registrations, access digital conference passes, submit research, and verify certificates.
      </p>

      <!-- Account Details Table -->
      <table width="100%" role="presentation" cellpadding="0" cellspacing="0"
        style="margin:32px 0;background:#F8F7F3;border:1px solid #E5E3D8;border-radius:4px;overflow:hidden;">

        <tr>
          <td colspan="2" style="padding:16px 20px 12px;font-family:'Manrope',-apple-system,sans-serif;font-size:10px;letter-spacing:2px;color:${BRAND.crimson};font-weight:700;border-bottom:1px solid #ECEAE1;text-transform:uppercase;">
            YOUR ACCOUNT CREDENTIALS
          </td>
        </tr>

        <tr>
          <td style="padding:14px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;color:#78808E;border-bottom:1px solid #EFECE4;">
            Account Holder
          </td>
          <td align="right" style="padding:14px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:13px;color:${BRAND.navy};font-weight:700;border-bottom:1px solid #EFECE4;">
            ${safeName}


          </td>
        </tr>

        <tr>
          <td style="padding:14px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;color:#78808E;border-bottom:1px solid #EFECE4;">
            Registered Email
          </td>
          <td align="right" style="padding:14px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12.5px;color:${BRAND.navy};border-bottom:1px solid #EFECE4;font-family:monospace;">
            ${safeEmail}


          </td>
        </tr>

        <tr>
          <td style="padding:14px 20px 16px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;color:#78808E;">
            Account Status
          </td>
          <td align="right" style="padding:14px 20px 16px;font-family:'Manrope',-apple-system,sans-serif;font-size:11px;color:#1B5E20;font-weight:800;letter-spacing:1px;">
            <span style="background:#E8F5E9;padding:4px 10px;border-radius:12px;border:1px solid #C8E6C9;">
              ● ACTIVE / VERIFIED
            </span>
          </td>
        </tr>

      </table>

      <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
        <tr>
          <td align="center">
            <a href="${escapeHTML(portalUrl)}"
            style="display:inline-block;background:${BRAND.navy};color:#FFFFFF;text-decoration:none;padding:17px 36px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;letter-spacing:2px;font-weight:700;border-radius:3px;box-shadow:0 4px 14px rgba(16,28,50,0.2);">
              ENTER MY VICHAAR →
            </a>
          </td>
        </tr>
      </table>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:13px;line-height:1.9;color:#667080;">
        You can now access your participant profile and explore upcoming Council assemblies.
      </p>

      <p style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-size:19px;line-height:1.5;color:${BRAND.navy};margin-top:34px;border-top:1px solid #EFECE6;padding-top:20px;">
        Welcome aboard.<br>
        <span style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:15px;color:#6B7280;">
          The Vichaar Council Secretariat
        </span>
      </p>
    `
  });
}



// ==========================================
// TEMPLATE 3: OFFICIAL EVENT ADMISSION VOUCHER & CONFIRMATION LETTER
// ==========================================

export interface EventAdmissionEmailOptions {
  name: string;
  email: string;
  registrationNumber: string;
  eventTitle: string;
  ticketCategory: string;
  venue: string;
  city: string;
  eventDate: string;
  amountPaid: number | string;
  currency?: string;
  orderId?: string;
  bankReference?: string;
  portalTicketsUrl?: string;
}



export function eventAdmissionVoucherEmail({
  name,
  email,
  registrationNumber,
  eventTitle,
  ticketCategory,
  venue,
  city,
  eventDate,
  amountPaid,
  currency = "INR",
  orderId = "N/A",
  bankReference = "N/A",
  portalTicketsUrl = "http://localhost:3000/my-vichaar/tickets"
}: EventAdmissionEmailOptions) {
  const safeName = escapeHTML(name);
  const safeReg = escapeHTML(registrationNumber);
  const safeEvent = escapeHTML(eventTitle);
  const safeCategory = escapeHTML(ticketCategory);
  const safeVenue = escapeHTML(venue);
  const safeCity = escapeHTML(city);
  const safeDate = escapeHTML(eventDate);
  const safeOrder = escapeHTML(orderId);
  const safeRef = escapeHTML(bankReference);

  return emailLayout({
    preheader: `Registration Confirmed: ${safeEvent} | Registration ID: ${safeReg}`,
    content: `
      <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:10px;letter-spacing:2.5px;color:${BRAND.crimson};font-weight:700;margin-bottom:18px;text-transform:uppercase;">
        OFFICIAL ADMISSION DOCKET / 03
      </div>

      <h1 style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-weight:600;font-size:32px;line-height:1.2;color:${BRAND.navy};margin:0 0 16px;letter-spacing:-0.5px;">
        Registration Confirmed.
      </h1>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14.5px;line-height:1.8;color:#4B5565;">
        Dear <strong>${safeName}</strong>,
      </p>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14px;line-height:1.9;color:#4B5565;">
        Your delegate registration for <strong>${safeEvent}</strong> has been officially confirmed and recorded in the Assembly Roll of The Vichaar Council.
      </p>

      <!-- Official Delegate Docket -->
      <table width="100%" role="presentation" cellpadding="0" cellspacing="0"
        style="margin:28px 0;background:#F9F8F5;border:2px solid ${BRAND.navy};border-radius:6px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">

        <!-- Docket Header -->
        <tr style="background:${BRAND.navy};color:#FFFFFF;">
          <td colspan="2" style="padding:16px 20px;">
            <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:9.5px;letter-spacing:3px;color:${BRAND.cream};text-transform:uppercase;font-weight:700;">
              OFFICIAL DELEGATE ADMISSION VOUCHER
            </div>
            <div style="font-family:'Bodoni Moda',Georgia,serif;font-size:22px;color:#FFFFFF;margin-top:4px;font-weight:700;letter-spacing:1px;">
              ${safeReg}


            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:12px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;color:#667085;border-bottom:1px solid #EBE9E1;">
            Assembly Event
          </td>
          <td align="right" style="padding:12px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:13px;color:${BRAND.navy};font-weight:700;border-bottom:1px solid #EBE9E1;">
            ${safeEvent}


          </td>
        </tr>

        <tr>
          <td style="padding:12px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;color:#667085;border-bottom:1px solid #EBE9E1;">
            Pass Tier / Category
          </td>
          <td align="right" style="padding:12px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12.5px;color:${BRAND.navy};font-weight:600;border-bottom:1px solid #EBE9E1;">
            ${safeCategory}


          </td>
        </tr>

        <tr>
          <td style="padding:12px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;color:#667085;border-bottom:1px solid #EBE9E1;">
            Chamber Venue
          </td>
          <td align="right" style="padding:12px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12.5px;color:${BRAND.navy};font-weight:600;border-bottom:1px solid #EBE9E1;">
            ${safeVenue}, ${safeCity}


          </td>
        </tr>

        <tr>
          <td style="padding:12px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;color:#667085;border-bottom:1px solid #EBE9E1;">
            Assembly Schedule
          </td>
          <td align="right" style="padding:12px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12.5px;color:${BRAND.navy};font-weight:600;border-bottom:1px solid #EBE9E1;">
            ${safeDate}


          </td>
        </tr>

        <tr>
          <td style="padding:12px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;color:#667085;border-bottom:1px solid #EBE9E1;">
            Amount Paid
          </td>
          <td align="right" style="padding:12px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:13px;color:${BRAND.navy};font-weight:700;border-bottom:1px solid #EBE9E1;">
            ₹${amountPaid} ${currency}


          </td>
        </tr>

        <tr>
          <td style="padding:12px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;color:#667085;border-bottom:1px solid #EBE9E1;">
            Transaction Reference
          </td>
          <td align="right" style="padding:12px 20px;font-family:monospace;font-size:11px;color:#4B5565;border-bottom:1px solid #EBE9E1;">
            ${safeOrder}


          </td>
        </tr>

        <tr>
          <td style="padding:14px 20px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;color:#667085;">
            Payment & Clearance Status
          </td>
          <td align="right" style="padding:14px 20px;">
            <span style="font-family:'Manrope',sans-serif;background:#E8F5E9;color:#1B5E20;font-size:10.5px;font-weight:800;letter-spacing:1px;padding:5px 12px;border-radius:12px;border:1px solid #A5D6A7;">
              ● CONFIRMED / SUCCESS
            </span>
          </td>
        </tr>

      </table>

      <!-- CTA to Digital Pass -->
      <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="margin:30px 0;">
        <tr>
          <td align="center">
            <a href="${escapeHTML(portalTicketsUrl)}"
            style="display:inline-block;background:${BRAND.citrus};color:#070E1A;text-decoration:none;padding:16px 36px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;letter-spacing:2px;font-weight:800;border-radius:4px;box-shadow:0 4px 16px rgba(255,166,43,0.35);text-transform:uppercase;">
              VIEW DIGITAL PASS IN MY VICHAAR →
            </a>
          </td>
        </tr>
      </table>

      <div style="background:#FFF9E6;border-left:3px solid ${BRAND.citrus};padding:14px 16px;border-radius:0 4px 4px 0;margin:24px 0;">
        <p style="font-family:'Manrope',sans-serif;font-size:12px;color:#785A00;line-height:1.7;margin:0;">
          <strong>Chamber Admittance Notice:</strong> Please present your digital pass or this admission docket at the registration desk upon arrival. Delegates are requested to arrive 30 minutes prior to call to order.
        </p>
      </div>

      <p style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-size:18px;line-height:1.5;color:${BRAND.navy};margin-top:34px;border-top:1px solid #EFECE6;padding-top:20px;">
        Where Ideas Earn Their Weight.<br>
        <span style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:14.5px;color:#6B7280;">
          The Secretariat, The Vichaar Council
        </span>
      </p>
    `
  });
}





// ==========================================
// TEMPLATE 4: 6-DIGIT OTP VERIFICATION
// ==========================================

export interface OtpEmailProps {
  fullName: string;
  otp: string;
  purpose?: string;
  expiryMinutes?: number;
  verificationUrl?: string;
  logoUrl?: string;
}



export function otpEmail({
  fullName,
  otp,
  purpose = "Account Verification",
  expiryMinutes = 10,
  verificationUrl,
  logoUrl
}: OtpEmailProps): string {
  const safeName = escapeHTML(fullName);

  return emailLayout({
    preheader: `${otp} is your verification code for ${purpose} · The Vichaar Council`,
    logoUrl,

    content: `
      <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:10px;letter-spacing:2.5px;color:${BRAND.citrus};font-weight:700;margin-bottom:18px;text-transform:uppercase;">
        SECURITY DISPATCH / ${escapeHTML(purpose.toUpperCase())}


      </div>

      <h1 style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-weight:600;font-size:32px;line-height:1.25;color:${BRAND.navy};margin:0 0 20px;letter-spacing:-0.5px;">
        ${escapeHTML(purpose)}


      </h1>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:15px;line-height:1.8;color:#4B5565;">
        Dear <strong>${safeName}</strong>,
      </p>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14px;line-height:1.8;color:#596273;">
        Please enter the following 6-digit one-time verification password to authenticate your credentials on <strong>MY VICHAAR</strong>, or simply click the verification button below:
      </p>

      <!-- Large Styled OTP Card -->
      <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 16px;">
        <tr>
          <td align="center">
            <div style="display:inline-block;background:#070E1A;border:2px solid ${BRAND.citrus};border-radius:12px;padding:20px 36px;box-shadow:0 8px 24px rgba(7,14,26,0.25);text-align:center;">
              <div style="font-size:9.5px;letter-spacing:2.5px;color:#A5A8AD;text-transform:uppercase;font-weight:700;margin-bottom:8px;">
                YOUR ONE-TIME VERIFICATION CODE
              </div>
              <div style="font-family:'Courier New',Courier,monospace;font-size:40px;letter-spacing:0.35em;color:${BRAND.citrus};font-weight:800;line-height:1;">
                ${escapeHTML(otp)}


              </div>
            </div>
          </td>
        </tr>
      </table>

      ${
        verificationUrl
          ? `
      <div style="text-align:center;font-size:11px;color:#8F96A3;margin:12px 0 20px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">
        — OR VERIFY INSTANTLY WITH ONE CLICK —
      </div>

      <!-- Prominent One-Click Verification Button -->
      <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr>
          <td align="center">
            <a href="${escapeHTML(verificationUrl)}"
            style="display:inline-block;background:${BRAND.navy};color:#FFFFFF;text-decoration:none;padding:17px 40px;font-family:'Manrope',-apple-system,sans-serif;font-size:12.5px;letter-spacing:2px;font-weight:700;border-radius:6px;border:1px solid #334460;box-shadow:0 6px 18px rgba(16,28,50,0.25);text-transform:uppercase;">
              VERIFY EMAIL ADDRESS &rarr;
            </a>
          </td>
        </tr>
      </table>

      <div style="background:#F7F6F2;padding:16px 20px;margin-top:20px;border-left:3px solid ${BRAND.citrus};border-radius:0 4px 4px 0;">
        <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:11.5px;color:#616977;line-height:1.8;margin:0;">
          <strong style="color:${BRAND.navy};">Instant Redirect:</strong> Clicking the button above redirects you to the website and verifies your account immediately. If the button doesn't open, copy and paste this link:<br>
          <a href="${escapeHTML(verificationUrl)}" style="color:${BRAND.crimson};word-break:break-all;text-decoration:underline;">
            ${escapeHTML(verificationUrl)}


          </a>
        </p>
      </div>
      `
          : ""
      }



      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:12px;line-height:1.8;color:#7A8291;text-align:center;margin-top:24px;">
        This code is valid for <strong>${expiryMinutes} minutes</strong>. Please do not disclose it to anyone.
      </p>

      <div style="background:#F7F6F2;padding:16px 20px;margin-top:20px;border-left:3px solid ${BRAND.crimson};border-radius:0 4px 4px 0;">
        <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:11.5px;color:#616977;line-height:1.8;margin:0;">
          <strong style="color:${BRAND.navy};">Security Notice:</strong> The Vichaar Council Secretariat and officials will never solicit your one-time verification password via telephone or messaging apps. If you did not initiate this request, you may safely ignore this dispatch.
        </p>
      </div>

      <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:19px;font-style:italic;color:${BRAND.navy};margin-top:34px;border-top:1px solid #EFECE6;padding-top:20px;">
        Ideas begin with a voice.
      </p>
    `
  });
}



// ==========================================
// TEMPLATE 5: PASSWORD RESET RECOVERY
// ==========================================

export interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  expiryMinutes?: number;
}



export function passwordResetEmail({
  name,
  resetUrl,
  expiryMinutes = 30
}: PasswordResetEmailProps): string {
  const safeName = escapeHTML(name);

  return emailLayout({
    preheader: "Reset your MY VICHAAR account password · The Vichaar Council",

    content: `
      <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:10px;letter-spacing:2.5px;color:${BRAND.crimson};font-weight:700;margin-bottom:18px;text-transform:uppercase;">
        ACCOUNT SECURITY / PASSWORD RECOVERY
      </div>

      <h1 style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-weight:600;font-size:32px;line-height:1.25;color:${BRAND.navy};margin:0 0 20px;letter-spacing:-0.5px;">
        Reset your password.
      </h1>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:15px;line-height:1.8;color:#4B5565;">
        Dear <strong>${safeName}</strong>,
      </p>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14px;line-height:1.9;color:#596273;">
        We received a request to reset the password for your <strong>MY VICHAAR</strong> account. To establish a new password and regain access to your participant portal, please click the secure link below:
      </p>

      <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
        <tr>
          <td align="center">
            <a href="${escapeHTML(resetUrl)}"
            style="display:inline-block;background:${BRAND.navy};color:#FFFFFF;text-decoration:none;padding:16px 36px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;letter-spacing:2px;font-weight:700;border-radius:4px;box-shadow:0 4px 14px rgba(16,28,50,0.25);text-transform:uppercase;">
              RESET PASSWORD &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:12px;line-height:1.8;color:#7A8291;">
        This password reset link expires in <strong>${expiryMinutes} minutes</strong>. If you did not make this request, you may safely ignore this message—your account remains secure.
      </p>

      <div style="background:#F7F6F2;padding:16px 20px;margin-top:26px;border-left:3px solid ${BRAND.citrus};border-radius:0 4px 4px 0;">
        <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:11.5px;color:#616977;line-height:1.8;margin:0;">
          <strong>Having trouble with the button?</strong><br>
          Copy and paste this link into your browser:<br>
          <a href="${escapeHTML(resetUrl)}" style="color:${BRAND.crimson};word-break:break-all;">
            ${escapeHTML(resetUrl)}


          </a>
        </p>
      </div>

      <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:19px;font-style:italic;color:${BRAND.navy};margin-top:34px;border-top:1px solid #EFECE6;padding-top:20px;">
        Ideas begin with a voice.
      </p>
    `
  });
}



// ==========================================
// TEMPLATE 6: CONTACT INQUIRY ACKNOWLEDGEMENT
// ==========================================

export interface ContactAckEmailProps {
  name: string;
  referenceId: string;
  subject: string;
  message: string;
}



export function contactAcknowledgementEmail({
  name,
  referenceId,
  subject,
  message
}: ContactAckEmailProps): string {
  const safeName = escapeHTML(name);

  return emailLayout({
    preheader: `We received your correspondence [Ref: ${referenceId}] · The Vichaar Council`,

    content: `
      <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:10px;letter-spacing:2.5px;color:${BRAND.citrus};font-weight:700;margin-bottom:18px;text-transform:uppercase;">
        CORRESPONDENCE LODGED / REF: ${escapeHTML(referenceId)}


      </div>

      <h1 style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-weight:600;font-size:32px;line-height:1.25;color:${BRAND.navy};margin:0 0 20px;letter-spacing:-0.5px;">
        We have received your message.
      </h1>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:15px;line-height:1.8;color:#4B5565;">
        Dear <strong>${safeName}</strong>,
      </p>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14px;line-height:1.9;color:#596273;">
        Thank you for writing to <strong>The Vichaar Council</strong>. Your correspondence has been logged with the Secretariat and assigned reference number <strong>${escapeHTML(referenceId)}</strong>.
      </p>

      <div style="background:#F8F7F3;border:1px solid #E5E3D8;border-radius:4px;padding:20px;margin:24px 0;">
        <div style="font-size:10px;letter-spacing:2px;color:${BRAND.crimson};font-weight:700;text-transform:uppercase;margin-bottom:8px;">
          SUBJECT: ${escapeHTML(subject)}


        </div>
        <p style="font-size:13px;color:#4B5565;line-height:1.7;margin:0;font-style:italic;">
          "${escapeHTML(message)}"
        </p>
      </div>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:13px;line-height:1.8;color:#596273;">
        Our team reviews every inquiry thoroughly. You can expect a response to your registered email in due course.
      </p>

      <p style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-size:18px;line-height:1.5;color:${BRAND.navy};margin-top:34px;border-top:1px solid #EFECE6;padding-top:20px;">
        Where Ideas Earn Their Weight.<br>
        <span style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:14.5px;color:#6B7280;">
          The Secretariat, The Vichaar Council
        </span>
      </p>
    `
  });
}

/**
 * 7. Payment Verification Failed / Review Notice Email
 */
export interface PaymentFailedEmailProps {
  name: string;
  registrationNumber: string;
  eventTitle: string;
  reason?: string;
  supportEmail?: string;
}

export function paymentFailedEmail({
  name,
  registrationNumber,
  eventTitle,
  reason = "The provided transaction UTR or payment screenshot could not be verified by the Secretariat.",
  supportEmail = "contact@thevichaarcouncil.in"
}: PaymentFailedEmailProps): string {
  const safeName = escapeHTML(name);
  const safeReg = escapeHTML(registrationNumber);
  const safeEvent = escapeHTML(eventTitle);
  const safeReason = escapeHTML(reason);

  return emailLayout({
    preheader: `Payment Verification Update for ${registrationNumber} · The Vichaar Council`,
    content: `
      <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:10px;letter-spacing:2.5px;color:${BRAND.crimson};font-weight:700;margin-bottom:18px;text-transform:uppercase;">
        ADMISSIONS NOTICE / REF: ${safeReg}
      </div>

      <h1 style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-weight:600;font-size:28px;line-height:1.25;color:${BRAND.navy};margin:0 0 20px;letter-spacing:-0.5px;">
        Payment Verification Notice
      </h1>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:15px;line-height:1.8;color:#4B5565;">
        Dear <strong>${safeName}</strong>,
      </p>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14px;line-height:1.9;color:#596273;">
        We are writing to inform you regarding your delegate accreditation for <strong>${safeEvent}</strong> (Registration: <strong>${safeReg}</strong>).
      </p>

      <div style="background:#FEF2F2;border:1px solid #FECACA;border-left:4px solid ${BRAND.crimson};border-radius:4px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;letter-spacing:2px;color:${BRAND.crimson};font-weight:700;text-transform:uppercase;margin-bottom:6px;">
          VERIFICATION STATUS: FAILED
        </div>
        <p style="font-size:13px;color:#991B1B;line-height:1.7;margin:0;">
          ${safeReason}
        </p>
      </div>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:13px;line-height:1.8;color:#596273;">
        If you have completed your payment via UPI, please log in to your participant portal to verify your 12-digit transaction UTR number or re-upload a legible bank transaction screenshot.
      </p>

      <div style="margin:28px 0;text-align:center;">
        <a href="https://thevichaarcouncil.in/my-vichaar/registrations" style="display:inline-block;background:${BRAND.navy};color:${BRAND.cream};padding:14px 28px;border-radius:4px;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">
          Review Registration in Portal &rarr;
        </a>
      </div>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:12px;line-height:1.8;color:#6B7280;">
        If you believe this is in error or require immediate assistance, reply directly to this email or reach our Secretariat at <strong>${escapeHTML(supportEmail)}</strong>.
      </p>

      <p style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-size:18px;line-height:1.5;color:${BRAND.navy};margin-top:34px;border-top:1px solid #EFECE6;padding-top:20px;">
        Where Ideas Earn Their Weight.<br>
        <span style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:14.5px;color:#6B7280;">
          The Secretariat, The Vichaar Council
        </span>
      </p>
    `
  });
}
