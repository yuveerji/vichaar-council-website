/**
 * Google Sheets Master Database Integration
 * Webhook client communicating with The Vichaar Council Apps Script
 */

const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const API_KEY =
  process.env.GOOGLE_SHEETS_API_KEY ||
  process.env.TVC_API_SECRET_KEY ||
  "tvc_secret_prod_vichaar_council_db_2026_x89a";

async function sendToGoogleSheets(action: string, data: Record<string, any>) {
  if (!WEBHOOK_URL) {
    console.warn("[Google Sheets] GOOGLE_SHEETS_WEBHOOK_URL is not defined in environment.");
    return null;
  }

  try {
    const payload = {
      action,
      apiKey: API_KEY,
      api_secret: API_KEY,
      verified: true,
      timestamp: Math.floor(Date.now() / 1000),
      ...data,
      data
    };

    // Google Apps Script redirects with 302, fetch handles follow automatically
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8" // Using text/plain avoids CORS preflight redirects in GAS
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json().catch(() => null);
    return json;
  } catch (err) {
    console.error(`[Google Sheets] Failed to sync ${action}:`, err);
    return null;
  }
}

/**
 * 01. Sync participant account registration (Tab: PARTICIPANTS)
 */
export async function syncParticipantToSheets(participant: {
  id?: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  institution?: string | null;
  city?: string | null;
  isEmailVerified?: boolean;
}) {
  return sendToGoogleSheets("sync_participant", {
    participant_id: participant.id,
    full_name: participant.fullName,
    username: participant.username,
    email: participant.email,
    phone: participant.phone || "",
    date_of_birth: participant.dateOfBirth || "",
    institution_name: participant.institution || "",
    city: participant.city || "New Delhi",
    is_email_verified: participant.isEmailVerified || false,
    account_status: "ACTIVE"
  });
}

/**
 * 02. Sync event registration and ticket issuance (Tabs: REGISTRATIONS, TICKETS)
 */
export async function syncRegistrationToSheets(reg: {
  id?: string;
  registrationNumber: string;
  eventId?: string;
  eventTitle?: string;
  registrationType?: string;
  participantId?: string | null;
  fullName: string;
  email: string;
  phone: string;
  institution?: string | null;
  passCategory?: string;
  totalAmount?: number;
  paymentStatus?: string;
  paymentScreenshot?: string | null;
  paymentScreenshotUrl?: string | null;
}) {
  return sendToGoogleSheets("sync_registration", {
    registration_id: reg.id,
    registration_number: reg.registrationNumber,
    event_id: reg.eventId || "EVT-SHABD-SOCH-2026",
    event_title: reg.eventTitle || "SHABD & SOCH",
    registration_type: reg.registrationType || "INDIVIDUAL_DELEGATE",
    participant_id: reg.participantId || "",
    participant_name: reg.fullName,
    full_name: reg.fullName,
    name: reg.fullName,
    email: reg.email,
    phone: reg.phone,
    institution_name: reg.institution || "",
    pass_category: reg.passCategory || "Delegate Pass (Classes 7th to 12th)",
    total_amount_inr: reg.totalAmount || 549,
    amount: reg.totalAmount || 549,
    payment_status: reg.paymentStatus || "PENDING",
    payment_screenshot: reg.paymentScreenshot || "",
    payment_screenshot_url: reg.paymentScreenshotUrl || ""
  });
}

/**
 * 03. Sync payment confirmation (Tab: PAYMENTS, updates REGISTRATIONS)
 */
export async function syncPaymentToSheets(payment: {
  paymentId?: string;
  orderId: string;
  cfOrderId?: string | null;
  registrationNumber: string;
  participantId?: string | null;
  participantName: string;
  payerEmail: string;
  payerPhone: string;
  amount: number;
  paymentMethod?: string | null;
  paymentStatus: string;
  bankReference?: string | null;
  paymentScreenshot?: string | null;
  paymentScreenshotUrl?: string | null;
}) {
  return sendToGoogleSheets("payment_success", {
    payment_id: payment.paymentId,
    order_id: payment.orderId,
    cf_payment_id: payment.cfOrderId || "",
    cf_order_id: payment.cfOrderId || "",
    registration_number: payment.registrationNumber,
    participant_id: payment.participantId || "",
    participant_name: payment.participantName,
    full_name: payment.participantName,
    name: payment.participantName,
    email: payment.payerEmail,
    payer_email: payment.payerEmail,
    phone: payment.payerPhone,
    payer_phone: payment.payerPhone,
    amount: payment.amount,
    amount_inr: payment.amount,
    total_amount_inr: payment.amount,
    payment_method: payment.paymentMethod || "UPI",
    payment_status: payment.paymentStatus,
    bank_reference: payment.bankReference || "",
    payment_screenshot: payment.paymentScreenshot || "",
    payment_screenshot_url: payment.paymentScreenshotUrl || "",
    verified: true,
    payment_verified: true
  });
}

/**
 * 04. Sync intellectual submission (Tab: SUBMISSIONS)
 */
export async function syncSubmissionToSheets(submission: {
  id?: string;
  participantId?: string;
  authorName: string;
  authorUsername: string;
  title: string;
  category: string;
  abstract: string;
  fileUrl?: string | null;
}) {
  return sendToGoogleSheets("sync_submission", {
    submission_id: submission.id,
    participant_id: submission.participantId || "",
    author_name: submission.authorName,
    author_username: submission.authorUsername,
    paper_title: submission.title,
    category: submission.category,
    abstract: submission.abstract,
    document_url: submission.fileUrl || "",
    word_count: submission.abstract.split(/\s+/).length
  });
}

/**
 * 05. Log administrative action (Tab: AUDIT_LOG)
 */
export async function logAuditToSheets(log: {
  actorName: string;
  actorEmail: string;
  actionType: string;
  entityType: string;
  entityId?: string;
  changeSummary: string;
}) {
  return sendToGoogleSheets("log_audit", {
    actor_name: log.actorName,
    actor_email: log.actorEmail,
    action_type: log.actionType,
    entity_type: log.entityType,
    entity_id: log.entityId || "",
    change_summary: log.changeSummary
  });
}

/**
 * 06. Sync Institutional School Registration (Tabs: INSTITUTIONS, INSTITUTIONAL_REGISTRATIONS, PAYMENTS)
 */
export async function syncInstitutionalRegistrationToSheets(data: {
  institutionName: string;
  schoolAddress: string;
  city: string;
  schoolBoard?: string;
  officialSchoolEmail: string;
  schoolWebsite?: string;
  coordinatorName: string;
  coordinatorDesignation: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  delegationSize: number;
  delegationCode: string;
  registrationNumber: string;
  eventId?: string;
  eventTitle?: string;
  totalAmount: number;
  transactionId: string;
  paymentScreenshot?: string | null;
  paymentScreenshotUrl?: string | null;
  studentRoster?: string;
}) {
  return sendToGoogleSheets("sync_institutional_registration", {
    institution_name: data.institutionName,
    school_address: data.schoolAddress,
    city: data.city,
    board_or_affiliation: data.schoolBoard || "CBSE",
    official_email: data.officialSchoolEmail,
    school_website: data.schoolWebsite || "",
    faculty_advisor_name: data.coordinatorName,
    faculty_in_charge: data.coordinatorName,
    faculty_advisor_phone: data.coordinatorPhone,
    faculty_phone: data.coordinatorPhone,
    faculty_advisor_email: data.coordinatorEmail,
    faculty_email: data.coordinatorEmail,
    coordinator_designation: data.coordinatorDesignation,
    delegation_size: data.delegationSize,
    total_delegates_registered: data.delegationSize,
    delegation_code: data.delegationCode,
    registration_number: data.registrationNumber,
    event_id: data.eventId || "EVT-SHABD-SOCH-2026",
    event_title: data.eventTitle || "SHABD & SOCH",
    total_amount_inr: data.totalAmount,
    amount: data.totalAmount,
    transaction_id: data.transactionId,
    bank_reference: data.transactionId,
    payment_status: "PENDING",
    payment_screenshot: data.paymentScreenshot || "",
    payment_screenshot_url: data.paymentScreenshotUrl || "",
    student_roster: data.studentRoster || ""
  });
}

