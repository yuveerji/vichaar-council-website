const BRAND = {
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

const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char] || char);

// Shared email layout with institutional typography (Bodoni Moda / Cormorant Garamond / Manrope)
function emailLayout({ preheader, content }) {
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

<!-- Institutional Header -->
<tr>
<td style="background:${BRAND.navy};padding:40px 35px 32px;text-align:center;">

  <div style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:6px;color:#FFFFFF;font-weight:600;text-transform:uppercase;">
    VICHAAR
  </div>

  <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:9.5px;letter-spacing:3.5px;color:${BRAND.cream};margin-top:10px;text-transform:uppercase;font-weight:600;">
    THE VICHAAR COUNCIL
  </div>

  <div style="height:1px;background:#445573;margin:22px auto 16px;max-width:100px;"></div>

  <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:10px;letter-spacing:3px;color:#C7CDD5;font-weight:500;">
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

// ==========================================
// TEMPLATE 1: EMAIL VERIFICATION
// ==========================================

function verificationEmail({ name, verificationUrl, expiry = "24 hours" }) {
  const safeName = escapeHTML(name);

  return emailLayout({
    preheader: "Verify your email address to activate your MY VICHAAR account.",

    content: `
      <div style="font-family:'Manrope',-apple-system,sans-serif;font-size:10px;letter-spacing:2.5px;color:${BRAND.crimson};font-weight:700;margin-bottom:18px;text-transform:uppercase;">
        ACCOUNT SECURITY / 01
      </div>

      <h1 style="font-family:'Bodoni Moda','Cormorant Garamond',Georgia,serif;font-weight:600;font-size:34px;line-height:1.2;color:${BRAND.navy};margin:0 0 24px;letter-spacing:-0.5px;">
        One final step.
      </h1>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:15px;line-height:1.8;color:#4B5565;">
        Dear <strong>${safeName}</strong>,
      </p>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14.5px;line-height:1.9;color:#4B5565;">
        Welcome to <strong>MY VICHAAR</strong>, the official participant portal of The Vichaar Council.
      </p>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:14px;line-height:1.9;color:#596273;">
        We have received your account registration. To verify your email address and activate full Council participant credentials, please authenticate via the secure portal link below.
      </p>

      <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="margin:34px 0;">
        <tr>
          <td align="center">
            <a href="${escapeHTML(verificationUrl)}"
            style="display:inline-block;background:${BRAND.navy};color:#FFFFFF;text-decoration:none;padding:17px 36px;font-family:'Manrope',-apple-system,sans-serif;font-size:12px;letter-spacing:2px;font-weight:700;border-radius:3px;box-shadow:0 4px 14px rgba(16,28,50,0.2);">
              VERIFY EMAIL ADDRESS →
            </a>
          </td>
        </tr>
      </table>

      <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:12px;line-height:1.8;color:#7A8291;">
        This verification link expires in <strong>${escapeHTML(expiry)}</strong>. If you did not initiate this registration, you can safely ignore this dispatch.
      </p>

      <div style="background:#F7F6F2;padding:18px 20px;margin-top:28px;border-left:3px solid ${BRAND.citrus};border-radius:0 4px 4px 0;">
        <p style="font-family:'Manrope',-apple-system,sans-serif;font-size:11.5px;color:#616977;line-height:1.8;margin:0;">
          <strong style="color:${BRAND.navy};">Having trouble with the button?</strong><br>
          Copy and paste the following URL into your browser address bar:
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

// ==========================================
// TEMPLATE 2: REGISTRATION CONFIRMATION
// ==========================================

function registrationConfirmationEmail({ name, email, portalUrl }) {
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

module.exports = {
  BRAND,
  escapeHTML,
  emailLayout,
  verificationEmail,
  registrationConfirmationEmail,
};
