/**
 * ============================================================================
 * THE VICHAAR COUNCIL | MY VICHAAR MASTER DATABASE
 * Apps Script V4.3 — Production-oriented institutional automation
 *
 * Preserves the existing 19-tab schema, website actions, and audit trail.
 * Added: Google Drive folder integration for payment screenshot receipts &
 *        Full bidirectional sync when a registration is removed/cancelled from Sheets.
 *
 * REQUIRED SCRIPT PROPERTIES (Project Settings > Script Properties):
 *   TVC_API_SECRET_KEY       Long random shared secret (min 32 characters)
 *   TVC_WEBSITE_URL          Website base URL (e.g. https://thevichaarcouncil.in)
 *   TVC_SPREADSHEET_ID       Optional; set when using a standalone script
 *   TVC_DRIVE_FOLDER_ID      Optional; Drive folder ID for payment screenshots
 *                            (Auto-created if omitted: "MY VICHAAR — Payment Screenshots")
 * ============================================================================
 */

var CONFIG = {
  INSTITUTION_NAME: "THE VICHAAR COUNCIL",
  PORTAL_NAME: "MY VICHAAR",
  VERSION: "4.3.0",
  TIMEZONE: "Asia/Kolkata",
  API_SECRET_KEY_PROP: "TVC_API_SECRET_KEY",
  WEBSITE_URL_PROP: "TVC_WEBSITE_URL",
  SPREADSHEET_ID_PROP: "TVC_SPREADSHEET_ID",
  DRIVE_FOLDER_ID_PROP: "TVC_DRIVE_FOLDER_ID",
  DEFAULT_WEBSITE_URL: "https://thevichaarcouncil.in",
  DEFAULT_RECEIPTS_FOLDER_NAME: "MY VICHAAR — Payment Screenshots",
  WEBSITE_WEBHOOK_PATH: "/api/webhooks/sheets",
  MAX_WEBHOOK_AGE_SECONDS: 300,
  MAX_EMAIL_RETRIES: 5,
  EMAIL_BATCH_SIZE: 20,
  LOCK_WAIT_MS: 20000,
  BRAND_NAVY: "#101C32",
  BRAND_GOLD: "#F8E6A0",
  BRAND_CRIMSON: "#B51F24",
  BRAND_CITRUS: "#FFA62B",
  BORDER_COLOR: "#D1D5DB",
  ROW_ALT_COLOR: "#F9FAFB",
  TABS: [
    { name: "PARTICIPANTS", color: "#101C32", prefix: "PRT" },
    { name: "INSTITUTIONS", color: "#101C32", prefix: "INS" },
    { name: "CONSENT_RECORDS", color: "#101C32", prefix: "CNS" },
    { name: "EVENTS", color: "#101C32", prefix: "EVT" },
    { name: "REGISTRATIONS", color: "#263B59", prefix: "REG" },
    { name: "DELEGATE_REGISTRATIONS", color: "#263B59", prefix: "DEL" },
    { name: "INSTITUTIONAL_REGISTRATIONS", color: "#263B59", prefix: "IRG" },
    { name: "DELEGATIONS", color: "#263B59", prefix: "DLG" },
    { name: "DELEGATION_MEMBERS", color: "#263B59", prefix: "MBR" },
    { name: "DELEGATE_PREFERENCES", color: "#263B59", prefix: "PRF" },
    { name: "TICKETS", color: "#6B21A8", prefix: "TKT" },
    { name: "PAYMENTS", color: "#6B21A8", prefix: "PAY" },
    { name: "CERTIFICATES", color: "#6B21A8", prefix: "CRT" },
    { name: "SUBMISSIONS", color: "#6B21A8", prefix: "SUB" },
    { name: "NOTIFICATIONS", color: "#047857", prefix: "NTF" },
    { name: "ADMIN_USERS", color: "#B51F24", prefix: "ADM" },
    { name: "AUDIT_LOG", color: "#B51F24", prefix: "LOG" },
    { name: "CONFIG", color: "#4B5563", prefix: "CFG" },
    { name: "DASHBOARD", color: "#4B5563", prefix: "DSH" }
  ],
  HEADERS: {
    PARTICIPANTS: ["participant_id","full_name","username","email","phone","date_of_birth","institution_name","grade_or_year","city","state","country","is_email_verified","guardian_name","guardian_phone","guardian_email","account_status","created_at","updated_at"],
    INSTITUTIONS: ["institution_id","institution_name","institution_type","board_or_affiliation","city","state","country","official_email","contact_number","faculty_advisor_name","faculty_advisor_phone","faculty_advisor_email","status","total_delegates_registered","created_at","updated_at"],
    CONSENT_RECORDS: ["consent_id","participant_id","participant_name","consent_type","version","agreed_to_terms","agreed_to_privacy","guardian_consent_given","guardian_name","ip_address","timestamp_utc","created_at"],
    EVENTS: ["event_id","event_slug","title","category","format","start_date","end_date","venue","city","delegate_fee_inr","status","registration_open","total_registered","total_checked_in","created_at","updated_at"],
    REGISTRATIONS: ["registration_id","registration_number","event_id","event_title","registration_type","participant_id","participant_name","email","phone","institution_name","pass_category","total_amount_inr","payment_status","check_in_status","payment_screenshot_url","registered_at","created_at","updated_at","email_sent_status"],
    DELEGATE_REGISTRATIONS: ["delegate_reg_id","registration_number","participant_id","full_name","event_id","event_title","grade_class","experience_level","committee_pref_1","committee_pref_2","portfolio_pref_1","portfolio_pref_2","dietary_requirements","emergency_contact","status","created_at"],
    INSTITUTIONAL_REGISTRATIONS: ["inst_reg_id","institution_id","institution_name","event_id","event_title","faculty_in_charge","faculty_email","faculty_phone","delegation_size","delegation_code","payment_status","total_amount_inr","status","created_at","updated_at"],
    DELEGATIONS: ["delegation_id","delegation_code","institution_id","institution_name","event_id","event_title","head_delegate_name","head_delegate_email","head_delegate_phone","total_members","registration_status","created_at"],
    DELEGATION_MEMBERS: ["member_id","delegation_id","delegation_code","participant_id","participant_name","email","assigned_committee","assigned_portfolio","member_role","created_at"],
    DELEGATE_PREFERENCES: ["pref_id","registration_number","participant_id","participant_name","event_id","committee_1","portfolio_1","committee_2","portfolio_2","committee_3","portfolio_3","experience_notes","created_at"],
    TICKETS: ["ticket_id","ticket_number","registration_number","participant_id","participant_name","event_id","event_title","pass_category","qr_payload","verification_hash","status","issued_at"],
    PAYMENTS: ["payment_id","order_id","cf_payment_id","registration_number","participant_name","email","event_title","amount_inr","currency","payment_status","payment_method","bank_reference","payer_phone","payment_screenshot_url","payment_time","verified_by","created_at","updated_at","email_sent_status"],
    CERTIFICATES: ["certificate_id","certificate_number","participant_id","participant_name","event_id","event_title","award_type","committee","portfolio","qr_verification_url","issued_at"],
    SUBMISSIONS: ["submission_id","registration_number","participant_id","participant_name","event_id","submission_type","title","file_url","status","submitted_at"],
    NOTIFICATIONS: ["notification_id","recipient_email","participant_id","title","message","notification_type","channel","status","sent_at"],
    ADMIN_USERS: ["admin_id","full_name","email","username","role","permissions","is_active","created_at"],
    AUDIT_LOG: ["log_id","timestamp","action","entity_type","entity_id","performed_by","ip_address","details_json"],
    CONFIG: ["config_key","config_value","description","last_updated"],
    DASHBOARD: ["metric_key","metric_label","metric_value","last_computed"]
  }
};

/* ------------------------------- MENU ----------------------------------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu("🏛️ MY VICHAAR")
    .addItem("🚀 Initialize / Verify Master Database", "initializeMasterDatabase")
    .addItem("🧪 Run System Health Check", "runHealthCheck")
    .addSeparator()
    .addItem("📁 Open Screenshots Drive Folder", "openReceiptsDriveFolder")
    .addItem("✅ Confirm Selected Registration", "confirmSelectedRowRegistration")
    .addItem("📨 Resend Confirmation Details", "resendSelectedRowDetails")
    .addItem("🗑️ Remove / Cancel Selected Registration", "removeSelectedRowRegistration")
    .addItem("🧹 Clear All Registrations (Sheets & Site)", "clearAllRegistrationsAndPayments")
    .addItem("🔄 Sync Registrations with Website", "syncActiveRegistrationsWithWebsite")
    .addItem("📬 Process Email Queue", "processEmailQueue")
    .addSeparator()
    .addItem("🔐 Configure API Secret", "promptSetApiSecret")
    .addItem("🌐 Set Website URL", "promptSetWebsiteUrl")
    .addItem("⏱️ Install Automation Triggers", "installAutomationTriggers")
    .addItem("📊 Refresh Dashboard", "refreshDashboardMetrics")
    .addItem("🔎 Reconcile Database", "reconcileDatabase")
    .addToUi();
}

function onInstall() { onOpen(); }

/* --------------------------- CORE UTILITIES ----------------------------- */

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty(CONFIG.SPREADSHEET_ID_PROP);
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function now_() { return new Date(); }

function timestamp_(date, pattern) {
  return Utilities.formatDate(date || now_(), CONFIG.TIMEZONE, pattern || "yyyy-MM-dd HH:mm:ss");
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function withScriptLock_(callback) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(CONFIG.LOCK_WAIT_MS)) throw new Error("System is busy. Please retry shortly.");
  try { return callback(); } finally { lock.releaseLock(); }
}

function normalizeEmail_(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail_(value));
}

function safeString_(value, max) {
  var s = String(value == null ? "" : value).trim();
  return s.length > (max || 500) ? s.substring(0, max || 500) : s;
}

function constantTimeEquals_(a, b) {
  a = String(a || "");
  b = String(b || "");
  var diff = a.length ^ b.length;
  var n = Math.max(a.length, b.length);
  for (var i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function getEffectiveWebsiteWebhookUrl() {
  var saved = PropertiesService.getScriptProperties().getProperty(CONFIG.WEBSITE_URL_PROP);
  var base = (saved && saved.trim()) ? saved.trim().replace(/\/+$/, "") : CONFIG.DEFAULT_WEBSITE_URL;
  return base + CONFIG.WEBSITE_WEBHOOK_PATH;
}

function getHeaderMap_(sheet) {
  var lastCol = sheet.getLastColumn();
  if (!lastCol) return {};
  var headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  var map = {};
  headers.forEach(function(h, i) { if (h) map[String(h).trim()] = i + 1; });
  return map;
}

function rowToObject_(sheet, row) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return {};
  var headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  var values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
  var obj = {};
  headers.forEach(function(h, i) { if (h) obj[String(h).trim()] = values[i]; });
  return obj;
}

function setByHeaders_(sheet, row, data) {
  var map = getHeaderMap_(sheet);
  Object.keys(data).forEach(function(key) {
    if (map[key]) sheet.getRange(row, map[key]).setValue(data[key]);
  });
}

function findRowByKey_(sheet, keyColumn, keyValue) {
  if (keyValue === "" || keyValue == null || sheet.getLastRow() < 2) return -1;
  var map = getHeaderMap_(sheet);
  var col = map[keyColumn];
  if (!col) throw new Error("Missing key column: " + keyColumn + " in " + sheet.getName());
  var values = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).getDisplayValues();
  var target = String(keyValue).trim();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === target) return i + 2;
  }
  return -1;
}

function appendOrUpdateRow(sheet, keyColumn, keyValue, dataObj) {
  if (keyValue == null || String(keyValue).trim() === "") throw new Error("Cannot upsert without " + keyColumn);
  var row = findRowByKey_(sheet, keyColumn, keyValue);
  if (row < 0) row = Math.max(2, sheet.getLastRow() + 1);
  setByHeaders_(sheet, row, dataObj);
  return row;
}

function audit_(action, entityType, entityId, details, performedBy) {
  try {
    var ss = getSpreadsheet_();
    var sh = ss.getSheetByName("AUDIT_LOG");
    if (!sh) return;
    var id = Utilities.getUuid();
    appendOrUpdateRow(sh, "log_id", id, {
      log_id: id,
      timestamp: timestamp_(),
      action: safeString_(action, 100),
      entity_type: safeString_(entityType, 100),
      entity_id: safeString_(entityId, 150),
      performed_by: safeString_(performedBy || "SYSTEM", 150),
      ip_address: "",
      details_json: JSON.stringify(details || {})
    });
  } catch (err) {
    console.error("Audit write failed: " + err);
  }
}

/* ----------------------- GOOGLE DRIVE RECEIPTS -------------------------- */

function getOrCreateReceiptsFolder_() {
  var props = PropertiesService.getScriptProperties();
  var folderId = props.getProperty(CONFIG.DRIVE_FOLDER_ID_PROP);
  if (folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (_) {}
  }

  var folders = DriveApp.getFoldersByName(CONFIG.DEFAULT_RECEIPTS_FOLDER_NAME);
  if (folders.hasNext()) {
    var existing = folders.next();
    props.setProperty(CONFIG.DRIVE_FOLDER_ID_PROP, existing.getId());
    return existing;
  }

  var newFolder = DriveApp.createFolder(CONFIG.DEFAULT_RECEIPTS_FOLDER_NAME);
  newFolder.setDescription("The Vichaar Council delegate payment receipts and UTR screenshots.");
  props.setProperty(CONFIG.DRIVE_FOLDER_ID_PROP, newFolder.getId());
  return newFolder;
}

function openReceiptsDriveFolder() {
  var folder = getOrCreateReceiptsFolder_();
  var url = folder.getUrl();
  var html = "<div style='font-family:sans-serif;padding:16px;text-align:center;'>" +
             "<h3 style='color:#101C32;margin-bottom:8px;'>Payment Receipts Drive Folder</h3>" +
             "<p style='font-size:13px;color:#4B5563;margin-bottom:16px;'>All uploaded UTR payment screenshots are stored in this Google Drive folder:</p>" +
             "<a href='" + url + "' target='_blank' style='display:inline-block;padding:10px 20px;background:#FFA62B;color:#101C32;font-weight:bold;text-decoration:none;border-radius:4px;'>Open Drive Folder ↗</a>" +
             "</div>";
  var output = HtmlService.createHtmlOutput(html).setWidth(420).setHeight(180);
  SpreadsheetApp.getUi().showModalDialog(output, "📁 Payment Receipts Folder");
}

function saveScreenshotToDrive_(screenshotData, regNo, name) {
  if (!screenshotData) return "";
  try {
    var folder = getOrCreateReceiptsFolder_();
    var cleanReg = safeString_(regNo || Utilities.getUuid(), 40).replace(/[^a-zA-Z0-9_-]/g, "");
    var cleanName = safeString_(name || "Delegate", 40).replace(/[^a-zA-Z0-9_-]/g, "");
    var fileName = cleanReg + "_" + cleanName + "_receipt_" + Date.now();
    var blob = null;

    if (typeof screenshotData === "string" && screenshotData.indexOf("data:image/") === 0) {
      var parts = screenshotData.split(";base64,");
      var mimeType = parts[0].replace("data:", "");
      var ext = mimeType.indexOf("png") >= 0 ? ".png" : ".jpg";
      var bytes = Utilities.base64Decode(parts[1]);
      blob = Utilities.newBlob(bytes, mimeType, fileName + ext);
    } else if (typeof screenshotData === "string" && (screenshotData.indexOf("http://") === 0 || screenshotData.indexOf("https://") === 0)) {
      try {
        var resp = UrlFetchApp.fetch(screenshotData, { muteHttpExceptions: true });
        if (resp.getResponseCode() === 200) {
          blob = resp.getBlob().setName(fileName + ".jpg");
        } else {
          return screenshotData;
        }
      } catch (_) {
        return screenshotData;
      }
    } else if (typeof screenshotData === "string" && screenshotData.length > 100) {
      var bytesRaw = Utilities.base64Decode(screenshotData);
      blob = Utilities.newBlob(bytesRaw, "image/jpeg", fileName + ".jpg");
    }

    if (!blob) return typeof screenshotData === "string" && screenshotData.indexOf("http") === 0 ? screenshotData : "";

    var file = folder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (_) {}
    return file.getUrl();
  } catch (err) {
    console.error("Failed to save screenshot to Drive: " + err);
    return typeof screenshotData === "string" && screenshotData.indexOf("http") === 0 ? screenshotData : "";
  }
}

/* ------------------------------ SECURITY -------------------------------- */

function canonicalize_(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalize_).join(",") + "]";
  return "{" + Object.keys(value).sort().map(function(k) {
    return JSON.stringify(k) + ":" + canonicalize_(value[k]);
  }).join(",") + "}";
}

function bytesToHex_(bytes) {
  return bytes.map(function(b) {
    var v = b < 0 ? b + 256 : b;
    return ("0" + v.toString(16)).slice(-2);
  }).join("");
}

function authenticatePayload_(payload) {
  var secret = PropertiesService.getScriptProperties().getProperty(CONFIG.API_SECRET_KEY_PROP);
  if (!secret || secret.length < 32) throw new Error("Webhook authentication is not configured. Set a 32+ character API secret in Project Properties.");
  if ((payload.api_secret && constantTimeEquals_(payload.api_secret, secret)) ||
      (payload.apiKey && constantTimeEquals_(payload.apiKey, secret))) {
    return true;
  }

  if (!payload.signature || !payload.timestamp || !payload.nonce) {
    throw new Error("Unauthorized: missing authentication credentials.");
  }
  var ts = Number(payload.timestamp);
  var nowSec = Math.floor(Date.now() / 1000);
  if (!isFinite(ts) || Math.abs(nowSec - ts) > CONFIG.MAX_WEBHOOK_AGE_SECONDS) {
    throw new Error("Unauthorized: request timestamp expired.");
  }

  var unsigned = {};
  Object.keys(payload).forEach(function(k) {
    if (k !== "signature" && k !== "api_secret" && k !== "apiKey") unsigned[k] = payload[k];
  });
  var message = String(payload.timestamp) + "." + canonicalize_(unsigned);
  var expected = bytesToHex_(Utilities.computeHmacSha256Signature(message, secret));
  if (!constantTimeEquals_(expected.toLowerCase(), String(payload.signature).toLowerCase())) {
    throw new Error("Unauthorized: invalid request signature.");
  }

  var nonce = safeString_(payload.nonce, 120);
  if (!/^[A-Za-z0-9._-]{12,120}$/.test(nonce)) throw new Error("Unauthorized: invalid nonce.");
  var cache = CacheService.getScriptCache();
  var cacheKey = "nonce_" + Utilities.base64EncodeWebSafe(nonce).substring(0, 180);
  var nonceLock = LockService.getScriptLock();
  if (!nonceLock.tryLock(5000)) throw new Error("System busy; retry request.");
  try {
    if (cache.get(cacheKey)) throw new Error("Unauthorized: replayed request.");
    cache.put(cacheKey, "1", CONFIG.MAX_WEBHOOK_AGE_SECONDS);
  } finally { nonceLock.releaseLock(); }
  return true;
}

/* ---------------------------- WEBHOOK API ------------------------------- */

function doGet() {
  return jsonResponse_({
    service: CONFIG.PORTAL_NAME,
    institution: CONFIG.INSTITUTION_NAME,
    version: CONFIG.VERSION,
    status: "online",
    timestamp: timestamp_()
  });
}

function doPost(e) {
  var requestId = Utilities.getUuid();
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ success: false, error: "Empty request payload", request_id: requestId });
    }
    if (e.postData.contents.length > 50000000) {
      return jsonResponse_({ success: false, error: "Payload too large", request_id: requestId });
    }
    var payload = JSON.parse(e.postData.contents);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return jsonResponse_({ success: false, error: "Invalid JSON object", request_id: requestId });
    }
    authenticatePayload_(payload);

    var action = safeString_(payload.action, 80);
    var result;
    switch (action) {
      case "health":
        result = { success: true, status: "online", version: CONFIG.VERSION };
        break;
      case "send_email":
        result = queueEmail_(payload, requestId);
        break;
      case "sync_registration":
        result = syncRegistration_(payload, false, requestId);
        break;
      case "sync_payment":
      case "payment_success":
        result = syncRegistration_(payload, true, requestId);
        break;
      case "sync_participant":
        result = syncParticipant_(payload, requestId);
        break;
      case "sync_submission":
        result = syncSubmission_(payload, requestId);
        break;
      default:
        throw new Error("Unsupported action: " + action);
    }
    result.request_id = requestId;
    return jsonResponse_(result);
  } catch (err) {
    console.error("Webhook " + requestId + ": " + (err.stack || err));
    return jsonResponse_({
      success: false,
      error: safeString_(err.message || err, 500),
      request_id: requestId
    });
  }
}

function validateRegistrationPayload_(p, isPayment) {
  var regNo = safeString_(p.registration_number, 100);
  if (!regNo) throw new Error("registration_number is required.");
  var email = normalizeEmail_(p.email);
  if (email && !isValidEmail_(email)) throw new Error("Invalid email address.");
  if (isPayment) {
    var status = String(p.payment_status || "").toUpperCase();
    if (status !== "SUCCESS" && status !== "PAID" && status !== "PENDING") {
      throw new Error("Payment action requires valid status.");
    }
  }
  return { registration_number: regNo, email: email };
}

function syncRegistration_(p, isPayment, requestId) {
  return withScriptLock_(function() {
    var valid = validateRegistrationPayload_(p, isPayment);
    var ss = getSpreadsheet_();
    var reg = ss.getSheetByName("REGISTRATIONS");
    var pay = ss.getSheetByName("PAYMENTS");
    if (!reg || !pay) throw new Error("REGISTRATIONS or PAYMENTS sheet is missing. Initialize database first.");

    var now = timestamp_();
    var participantName = safeString_(p.name || p.full_name || p.participant_name, 200);

    // Google Drive Payment Screenshot Saving
    var screenshotInput = p.payment_screenshot || p.screenshot || p.screenshot_base64 || p.payment_screenshot_url || p.screenshot_url;
    var driveUrl = "";
    if (screenshotInput) {
      driveUrl = saveScreenshotToDrive_(screenshotInput, valid.registration_number, participantName);
    }

    var regData = {
      registration_number: valid.registration_number,
      participant_id: safeString_(p.participant_id || p.participantId, 100),
      participant_name: participantName,
      email: valid.email,
      phone: safeString_(p.phone, 40),
      institution_name: safeString_(p.institution_name || p.institution, 200),
      pass_category: safeString_(p.pass_category || p.passCategory, 120),
      event_id: safeString_(p.event_id || p.eventId, 100),
      event_title: safeString_(p.event_title || p.eventTitle, 200),
      registration_type: safeString_(p.registration_type || "INDIVIDUAL_DELEGATE", 80),
      total_amount_inr: Number(p.amount || p.total_amount_inr || 0),
      payment_screenshot_url: driveUrl || safeString_(p.payment_screenshot_url || p.screenshot_url, 500) || "",
      updated_at: now
    };

    if (!isFinite(regData.total_amount_inr) || regData.total_amount_inr < 0) throw new Error("Invalid registration amount.");

    var suppliedStatus = String(p.payment_status || "").toUpperCase();
    if (isPayment && (suppliedStatus === "SUCCESS" || suppliedStatus === "PAID")) {
      regData.payment_status = "SUCCESS";
      regData.email_sent_status = "SENT - " + now;
    } else if (suppliedStatus) {
      regData.payment_status = suppliedStatus;
    }

    var existingRegRow = findRowByKey_(reg, "registration_number", valid.registration_number);
    if (existingRegRow < 0) {
      regData.created_at = now;
      regData.registered_at = now;
    }
    var regRow = appendOrUpdateRow(reg, "registration_number", valid.registration_number, regData);

    // Sync to PAYMENTS table if payment payload or payment reference is provided
    if (isPayment || p.order_id || p.orderId || p.bank_reference || p.bankReference) {
      var cfPaymentId = safeString_(p.cf_payment_id || p.cfPaymentId, 120);
      var payData = {
        order_id: safeString_(p.order_id || p.orderId, 120),
        cf_payment_id: cfPaymentId,
        registration_number: valid.registration_number,
        participant_id: safeString_(p.participant_id || p.participantId, 100),
        participant_name: regData.participant_name,
        email: valid.email,
        event_title: regData.event_title,
        amount_inr: regData.total_amount_inr,
        currency: safeString_(p.currency || "INR", 8),
        payment_status: regData.payment_status || "PENDING",
        payment_method: safeString_(p.payment_method || "UPI", 60),
        bank_reference: safeString_(p.bank_reference || p.bankReference, 150),
        payer_phone: safeString_(p.payer_phone || p.phone, 40),
        payment_screenshot_url: driveUrl || safeString_(p.payment_screenshot_url || p.screenshot_url, 500) || "",
        payment_time: p.payment_time || now,
        verified_by: regData.payment_status === "SUCCESS" ? "WEBSITE_BACKEND_VERIFIED" : "PENDING_SECRETARIAT_UTR",
        email_sent_status: regData.payment_status === "SUCCESS" ? "SENT - " + now : "PENDING",
        updated_at: now
      };

      var existingPayRow = cfPaymentId ? findRowByKey_(pay, "cf_payment_id", cfPaymentId) : -1;
      if (cfPaymentId && existingPayRow > 0) {
        setByHeaders_(pay, existingPayRow, payData);
      } else {
        var orderId = payData.order_id;
        var byOrder = orderId ? findRowByKey_(pay, "order_id", orderId) : -1;
        if (byOrder > 0) {
          setByHeaders_(pay, byOrder, payData);
        } else {
          payData.payment_id = "PAY-" + Utilities.getUuid().substring(0, 12).toUpperCase();
          payData.created_at = now;
          appendOrUpdateRow(pay, "payment_id", payData.payment_id, payData);
        }
      }

      audit_("PAYMENT_SYNC", "REGISTRATION", valid.registration_number, {
        order_id: payData.order_id, amount: payData.amount_inr, status: payData.payment_status,
        drive_screenshot: driveUrl || "N/A", request_id: requestId
      }, "WEBSITE_BACKEND");

      if (regData.payment_status === "SUCCESS") {
        enqueueRegistrationEmail_(regData, valid.registration_number, requestId);
      }
    } else {
      audit_("REGISTRATION_SYNC", "REGISTRATION", valid.registration_number, { request_id: requestId, drive_screenshot: driveUrl || "N/A" }, "WEBSITE_BACKEND");
    }

    return {
      success: true,
      message: "Registration synchronized with Google Drive receipts.",
      registration_number: valid.registration_number,
      drive_screenshot_url: driveUrl,
      row: regRow
    };
  });
}

function syncParticipant_(p, requestId) {
  return withScriptLock_(function() {
    var email = normalizeEmail_(p.email);
    if (!email || !isValidEmail_(email)) throw new Error("A valid email is required for participant sync.");
    var ss = getSpreadsheet_();
    var sh = ss.getSheetByName("PARTICIPANTS");
    if (!sh) throw new Error("PARTICIPANTS sheet missing.");

    var now = timestamp_();
    var participantId = safeString_(p.participant_id || p.id, 100) || ("PRT-" + Utilities.getUuid().substring(0, 8).toUpperCase());
    var partData = {
      participant_id: participantId,
      full_name: safeString_(p.full_name || p.fullName || p.name, 200),
      username: safeString_(p.username, 100),
      email: email,
      phone: safeString_(p.phone, 40),
      date_of_birth: safeString_(p.date_of_birth || p.dateOfBirth, 40),
      institution_name: safeString_(p.institution_name || p.institution, 200),
      grade_or_year: safeString_(p.grade_or_year || p.grade, 50),
      city: safeString_(p.city || "New Delhi", 100),
      state: safeString_(p.state || "Delhi", 100),
      country: safeString_(p.country || "India", 100),
      is_email_verified: Boolean(p.is_email_verified || p.isEmailVerified),
      guardian_name: safeString_(p.guardian_name, 150),
      guardian_phone: safeString_(p.guardian_phone, 40),
      guardian_email: safeString_(p.guardian_email, 150),
      account_status: safeString_(p.account_status || "ACTIVE", 50),
      updated_at: now
    };

    var existingRow = findRowByKey_(sh, "email", email);
    if (existingRow < 0) {
      partData.created_at = now;
      appendOrUpdateRow(sh, "participant_id", participantId, partData);
    } else {
      setByHeaders_(sh, existingRow, partData);
    }

    audit_("PARTICIPANT_SYNC", "PARTICIPANT", participantId, { email: email, request_id: requestId }, "WEBSITE_BACKEND");
    return { success: true, message: "Participant synchronized.", participant_id: participantId };
  });
}

function syncSubmission_(p, requestId) {
  return withScriptLock_(function() {
    var ss = getSpreadsheet_();
    var sh = ss.getSheetByName("SUBMISSIONS");
    if (!sh) throw new Error("SUBMISSIONS sheet missing.");

    var subId = safeString_(p.submission_id || p.id, 100) || ("SUB-" + Utilities.getUuid().substring(0, 8).toUpperCase());
    var now = timestamp_();
    var subData = {
      submission_id: subId,
      registration_number: safeString_(p.registration_number || p.registrationNumber, 100),
      participant_id: safeString_(p.participant_id || p.participantId, 100),
      participant_name: safeString_(p.participant_name || p.authorName, 200),
      event_id: safeString_(p.event_id || p.eventId, 100),
      submission_type: safeString_(p.submission_type || p.category, 100),
      title: safeString_(p.title, 300),
      file_url: safeString_(p.file_url || p.fileUrl, 500),
      status: safeString_(p.status || "UNDER_REVIEW", 80),
      submitted_at: now
    };

    appendOrUpdateRow(sh, "submission_id", subId, subData);
    audit_("SUBMISSION_SYNC", "SUBMISSION", subId, { title: subData.title, request_id: requestId }, "WEBSITE_BACKEND");
    return { success: true, message: "Submission synchronized.", submission_id: subId };
  });
}

/* ------------------------------ EMAILS ---------------------------------- */

function queueEmail_(p, requestId) {
  var to = normalizeEmail_(p.to || p.recipient_email);
  if (!isValidEmail_(to)) throw new Error("A valid recipient email is required.");
  var subject = safeString_(p.subject, 250);
  if (!subject) throw new Error("Email subject is required.");
  var html = String(p.html || "");
  var body = String(p.body || "");
  if (!html && !body) throw new Error("Email body is required.");
  var idempotencyKey = safeString_(p.idempotency_key || requestId, 150);
  var sh = getSpreadsheet_().getSheetByName("NOTIFICATIONS");
  if (!sh) throw new Error("NOTIFICATIONS sheet is missing.");

  return withScriptLock_(function() {
    var existing = findRowByKey_(sh, "notification_id", idempotencyKey);
    if (existing > 0) return { success: true, queued: true, duplicate: true, notification_id: idempotencyKey };

    var isSentDirectly = false;
    try {
      var options = { name: CONFIG.INSTITUTION_NAME };
      if (html) options.htmlBody = html;
      if (p.reply_to) options.replyTo = p.reply_to;
      GmailApp.sendEmail(to, subject, body || "Please view this email in an HTML-compatible email client.", options);
      isSentDirectly = true;
    } catch (e) {
      console.warn("Direct send failed, queuing for background runner:", e);
    }

    var message = JSON.stringify({ subject: subject, html: html, body: body, replyTo: safeString_(p.reply_to, 200) });
    appendOrUpdateRow(sh, "notification_id", idempotencyKey, {
      notification_id: idempotencyKey,
      recipient_email: to,
      title: subject,
      message: message,
      notification_type: "EMAIL",
      channel: "EMAIL",
      status: isSentDirectly ? "SENT" : "QUEUED",
      sent_at: isSentDirectly ? timestamp_() : ""
    });
    audit_(isSentDirectly ? "EMAIL_SENT_DIRECT" : "EMAIL_QUEUED", "NOTIFICATION", idempotencyKey, { to: to }, "WEBSITE_BACKEND");
    return { success: true, queued: !isSentDirectly, sent_directly: isSentDirectly, notification_id: idempotencyKey };
  });
}

function enqueueRegistrationEmail_(regData, regNo, requestId) {
  var sh = getSpreadsheet_().getSheetByName("NOTIFICATIONS");
  if (!sh || !regData.email || !isValidEmail_(regData.email)) return;
  var id = "REGCONF-" + regNo;
  var row = findRowByKey_(sh, "notification_id", id);
  if (row > 0) return;
  appendOrUpdateRow(sh, "notification_id", id, {
    notification_id: id,
    recipient_email: regData.email,
    participant_id: "",
    title: "Registration payment confirmed",
    message: JSON.stringify({ registration_number: regNo, event_title: regData.event_title, request_id: requestId }),
    notification_type: "REGISTRATION_CONFIRMATION",
    channel: "WEBSITE_EMAIL",
    status: "WEBSITE_HANDLED",
    sent_at: timestamp_()
  });
}

/* ------------------------- ADMIN REGISTRATION --------------------------- */

function confirmSelectedRowRegistration() { processSelectedRow_(false); }

function resendSelectedRowDetails() {
  var ui = SpreadsheetApp.getUi();
  var choice = ui.alert("Resend Confirmation Details",
    "Resend the confirmation/pass details through the website for the selected registration?",
    ui.ButtonSet.YES_NO);
  if (choice === ui.Button.YES) processSelectedRow_(true);
}

function processSelectedRow_(force) {
  var ui = SpreadsheetApp.getUi();
  var sh = SpreadsheetApp.getActiveSheet();
  if (["REGISTRATIONS","PAYMENTS"].indexOf(sh.getName()) < 0) {
    ui.alert("Select a row in REGISTRATIONS or PAYMENTS."); return;
  }
  var row = sh.getActiveRange().getRow();
  if (row < 2) { ui.alert("Select a data row (row 2 or below)."); return; }
  var obj = rowToObject_(sh, row);
  var regNo = safeString_(obj.registration_number, 100);
  if (!regNo) { ui.alert("Selected row has no registration_number."); return; }
  var sent = String(obj.email_sent_status || "").toUpperCase();
  if (!force && sent.indexOf("SENT") === 0) {
    ui.alert("Already sent", "This registration is already marked as sent. Use the resend option only when requested.", ui.ButtonSet.OK);
    return;
  }
  var payload = {
    action: force ? "resend_details" : "payment_success",
    registration_number: regNo,
    order_id: obj.order_id || "",
    amount: obj.total_amount_inr || obj.amount_inr || 0,
    payment_status: "SUCCESS",
    payment_method: obj.payment_method || "GSHEETS_ADMIN",
    bank_reference: obj.bank_reference || "MANUAL_VERIFIED",
    verified: true,
    force: force,
    source: "GSHEETS_ADMIN_ACTION"
  };
  var result = postToWebsite_(payload);
  if (!result.success) {
    ui.alert("Website request failed", result.error || "The website did not confirm the operation. Sheet status was not changed.", ui.ButtonSet.OK);
    return;
  }
  setByHeaders_(sh, row, {
    payment_status: "SUCCESS",
    email_sent_status: (force ? "RESENT - " : "SENT - ") + timestamp_()
  });
  audit_(force ? "ADMIN_RESEND" : "ADMIN_CONFIRM", "REGISTRATION", regNo, result, getActiveUserEmail_());
  ui.alert("Success", (force ? "Resend request accepted" : "Confirmation accepted") + " for " + regNo + ".", ui.ButtonSet.OK);
}

/**
 * Remove / Cancel a registration from Google Sheets and sync overall to the website
 */
function removeSelectedRowRegistration() {
  var ui = SpreadsheetApp.getUi();
  var sh = SpreadsheetApp.getActiveSheet();
  if (["REGISTRATIONS","PAYMENTS"].indexOf(sh.getName()) < 0) {
    ui.alert("Select a row in REGISTRATIONS or PAYMENTS to remove.");
    return;
  }
  var row = sh.getActiveRange().getRow();
  if (row < 2) { ui.alert("Select a data row (row 2 or below)."); return; }
  var obj = rowToObject_(sh, row);
  var regNo = safeString_(obj.registration_number, 100);
  if (!regNo) { ui.alert("Selected row has no registration_number."); return; }

  var choice = ui.alert("Remove Registration Across Systems",
    "Are you sure you want to REMOVE and delete registration " + regNo + " (" + (obj.participant_name || "") + ")?\n\nThis will synchronize with the website, revoke accreditation, delete the pass, and remove this row.",
    ui.ButtonSet.YES_NO);
  if (choice !== ui.Button.YES) return;

  var payload = {
    action: "delete_registration",
    registration_number: regNo,
    order_id: obj.order_id || "",
    hardDelete: true,
    reason: "Deleted from Master Database by Secretariat Admin (" + getActiveUserEmail_() + ")",
    source: "GSHEETS_ADMIN_REMOVE"
  };

  var result = postToWebsite_(payload);
  if (!result.success) {
    ui.alert("Website sync failed", result.error || "The website could not remove this registration. Row was not deleted.", ui.ButtonSet.OK);
    return;
  }

  // Delete the row from the current sheet
  sh.deleteRow(row);

  // Also remove corresponding row in the counterpart sheet if present
  var ss = getSpreadsheet_();
  var counterpartSheetName = sh.getName() === "REGISTRATIONS" ? "PAYMENTS" : "REGISTRATIONS";
  var counterpartSheet = ss.getSheetByName(counterpartSheetName);
  if (counterpartSheet && counterpartSheet.getLastRow() >= 2) {
    var cRow = findRowByKey_(counterpartSheet, "registration_number", regNo);
    if (cRow > 1) {
      counterpartSheet.deleteRow(cRow);
    }
  }

  audit_("ADMIN_REGISTRATION_DELETED", "REGISTRATION", regNo, result, getActiveUserEmail_());
  ui.alert("Registration Removed", "Registration " + regNo + " has been successfully removed and synchronized across the website.", ui.ButtonSet.OK);
}

/**
 * Clear all data rows from REGISTRATIONS, PAYMENTS, and TICKETS and sync to website
 */
function clearAllRegistrationsAndPayments() {
  var ui = SpreadsheetApp.getUi();
  var confirm = ui.alert(
    "⚠️ Clear All Registrations & Payments?",
    "This will delete ALL data rows from REGISTRATIONS, PAYMENTS, and TICKETS in Google Sheets and delete all passes/registrations on the website database.\n\nAre you sure you want to clear all registrations?",
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  var ss = getSpreadsheet_();
  ["REGISTRATIONS", "PAYMENTS", "TICKETS"].forEach(function(tabName) {
    var sh = ss.getSheetByName(tabName);
    if (sh && sh.getLastRow() > 1) {
      sh.deleteRows(2, sh.getLastRow() - 1);
    }
  });

  var result = postToWebsite_({
    action: "sync_active_registrations",
    active_registration_numbers: [],
    source: "GSHEETS_ADMIN_CLEAR_ALL"
  });

  audit_("ADMIN_CLEAR_ALL_REGISTRATIONS", "DATABASE", "ALL", result, getActiveUserEmail_());
  ui.alert("Database Reset Complete", "All registrations, payments, and tickets have been cleared from both Google Sheets and the website.", ui.ButtonSet.OK);
}

/**
 * Reconcile all registrations: any registration removed from Google Sheets will be pruned on website
 */
function syncActiveRegistrationsWithWebsite() {
  var ui = SpreadsheetApp.getUi();
  var ss = getSpreadsheet_();
  var reg = ss.getSheetByName("REGISTRATIONS");
  if (!reg) {
    ui.alert("REGISTRATIONS sheet is missing.");
    return;
  }

  var activeRegs = [];
  if (reg.getLastRow() >= 2) {
    var map = getHeaderMap_(reg);
    var col = map["registration_number"];
    if (col) {
      var values = reg.getRange(2, col, reg.getLastRow() - 1, 1).getDisplayValues();
      for (var i = 0; i < values.length; i++) {
        var num = String(values[i][0]).trim();
        if (num) activeRegs.push(num);
      }
    }
  }

  var payload = {
    action: "sync_active_registrations",
    active_registration_numbers: activeRegs,
    source: "GSHEETS_RECONCILIATION"
  };

  var result = postToWebsite_(payload);
  if (!result.success) {
    ui.alert("Sync Failed", result.error || "Could not synchronize active registrations with the website.", ui.ButtonSet.OK);
    return;
  }

  audit_("REGISTRATIONS_RECONCILED", "DATABASE", "ALL", result, getActiveUserEmail_());
  var prunedCount = result.pruned ? result.pruned.length : 0;
  ui.alert("Synchronization Complete",
    "Website registrations synchronized with Google Sheets.\n\n" +
    "• Active Sheet Registrations: " + activeRegs.length + "\n" +
    "• Removed Registrations Pruned: " + prunedCount +
    (prunedCount > 0 ? "\n\nPruned from website: " + result.pruned.join(", ") : "\n\nAll records are in exact sync!"),
    ui.ButtonSet.OK);
}

function postToWebsite_(payload) {
  var secret = PropertiesService.getScriptProperties().getProperty(CONFIG.API_SECRET_KEY_PROP);
  if (!secret) return { success: false, error: "API secret is not configured in Script Properties." };
  payload.api_secret = secret;
  payload.apiKey = secret;
  try {
    var response = UrlFetchApp.fetch(getEffectiveWebsiteWebhookUrl(), {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
      followRedirects: false
    });
    var code = response.getResponseCode();
    var text = response.getContentText();
    var parsed;
    try { parsed = JSON.parse(text); } catch (_) { parsed = { success: false, error: text }; }
    if (code < 200 || code >= 300 || parsed.success !== true) {
      return { success: false, http_code: code, error: safeString_(parsed.error || text, 1000) };
    }
    return parsed;
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/* --------------------------- SHEET TRIGGERS ----------------------------- */

function handleSheetEdit(e) {
  if (!e || !e.range || e.range.getNumRows() !== 1 || e.range.getNumColumns() !== 1) return;
  var sh = e.range.getSheet();
  if (["REGISTRATIONS","PAYMENTS"].indexOf(sh.getName()) < 0 || e.range.getRow() < 2) return;
  var map = getHeaderMap_(sh);
  if (map.payment_status !== e.range.getColumn()) return;

  var statusVal = String(e.value || "").toUpperCase().trim();

  // If status is changed to CANCELLED, DELETED, or REFUNDED -> sync cancellation to website
  if (statusVal === "CANCELLED" || statusVal === "DELETED" || statusVal === "REFUNDED") {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return;
    try {
      var obj = rowToObject_(sh, e.range.getRow());
      var regNo = safeString_(obj.registration_number, 100);
      if (!regNo) return;
      var result = postToWebsite_({
        action: "cancel_registration",
        registration_number: regNo,
        order_id: obj.order_id || "",
        payment_status: statusVal,
        hardDelete: statusVal === "DELETED",
        reason: "Status edited to " + statusVal + " in Google Sheet",
        source: "GSHEETS_EDIT_STATUS_CANCEL"
      });
      if (result.success) {
        setByHeaders_(sh, e.range.getRow(), { email_sent_status: "REVOKED - " + timestamp_() });
        audit_("SHEET_REGISTRATION_CANCELLED", "REGISTRATION", regNo, result, getActiveUserEmail_());
      }
    } finally {
      lock.releaseLock();
    }
    return;
  }

  if (statusVal !== "SUCCESS") return;

  var lockSuccess = LockService.getScriptLock();
  if (!lockSuccess.tryLock(5000)) return;
  try {
    var objSuccess = rowToObject_(sh, e.range.getRow());
    var regNoSuccess = safeString_(objSuccess.registration_number, 100);
    if (!regNoSuccess) return;
    var sent = String(objSuccess.email_sent_status || "").toUpperCase();
    if (sent.indexOf("SENT") === 0 || sent.indexOf("PENDING") === 0) return;

    var resultSuccess = postToWebsite_({
      action: "payment_success",
      registration_number: regNoSuccess,
      order_id: objSuccess.order_id || "",
      amount: objSuccess.total_amount_inr || objSuccess.amount_inr || 0,
      payment_status: "SUCCESS",
      payment_method: objSuccess.payment_method || "GSHEETS_EDIT",
      bank_reference: objSuccess.bank_reference || "MANUAL_VERIFIED",
      verified: true,
      source: "GSHEETS_EDIT_TRIGGER"
    });
    if (resultSuccess.success) {
      setByHeaders_(sh, e.range.getRow(), { email_sent_status: "SENT - " + timestamp_() });
      audit_("SHEET_PAYMENT_STATUS_EDIT", "REGISTRATION", regNoSuccess, resultSuccess, getActiveUserEmail_());
    } else {
      setByHeaders_(sh, e.range.getRow(), { email_sent_status: "WEBHOOK_ERROR - " + timestamp_() });
      audit_("SHEET_PAYMENT_WEBHOOK_FAILED", "REGISTRATION", regNoSuccess, resultSuccess, getActiveUserEmail_());
    }
  } finally {
    lockSuccess.releaseLock();
  }
}

/* ------------------------- INITIALIZATION -------------------------------- */

function initializeMasterDatabase() {
  var ss = getSpreadsheet_();
  var created = 0, verified = 0, conflicts = [];
  CONFIG.TABS.forEach(function(tab) {
    var sh = ss.getSheetByName(tab.name);
    if (!sh) { sh = ss.insertSheet(tab.name); created++; }
    sh.setTabColor(tab.color);
    var expected = CONFIG.HEADERS[tab.name];
    var lastCol = sh.getLastColumn();
    if (lastCol === 0) {
      sh.getRange(1, 1, 1, expected.length).setValues([expected]);
    } else {
      var current = sh.getRange(1, 1, 1, lastCol).getDisplayValues()[0].map(function(v) { return String(v).trim(); });
      var missing = expected.filter(function(h) { return current.indexOf(h) < 0; });
      if (missing.length) {
        var start = lastCol + 1;
        sh.getRange(1, start, 1, missing.length).setValues([missing]);
        conflicts.push(tab.name + ": appended " + missing.length + " missing header(s)");
      }
    }
    var width = sh.getLastColumn();
    if (width > 0) {
      sh.getRange(1, 1, 1, width)
        .setBackground(tab.color).setFontColor("#FFFFFF")
        .setFontWeight("bold").setFontFamily("Arial")
        .setWrap(true);
      sh.setFrozenRows(1);
      sh.setRowHeight(1, 34);
      sh.getRange(1, 1, Math.max(sh.getMaxRows(), 2), width)
        .setVerticalAlignment("middle");
      if (!sh.getFilter() && sh.getLastRow() > 1) sh.getRange(1, 1, sh.getLastRow(), width).createFilter();
    }
    verified++;
  });
  
  var receiptsFolder = getOrCreateReceiptsFolder_();

  audit_("DATABASE_INITIALIZED", "DATABASE", ss.getId(), { created: created, verified: verified, drive_folder: receiptsFolder.getUrl(), notes: conflicts }, getActiveUserEmail_());
  SpreadsheetApp.getUi().alert("MY VICHAAR V4.3 database check complete.\nNew tabs: " + created + "\nTabs verified: " + verified + "\nScreenshots Drive Folder: " + receiptsFolder.getName() + (conflicts.length ? "\n\nSchema updates:\n" + conflicts.join("\n") : "\nAll expected headers are present."));
}

/* -------------------------- DASHBOARD ------------------------------------ */

function refreshDashboardMetrics() {
  var ss = getSpreadsheet_();
  var reg = ss.getSheetByName("REGISTRATIONS");
  var pay = ss.getSheetByName("PAYMENTS");
  var inst = ss.getSheetByName("INSTITUTIONAL_REGISTRATIONS");
  var dash = ss.getSheetByName("DASHBOARD");
  if (!dash) throw new Error("DASHBOARD sheet missing.");
  var regRows = readObjects_(reg);
  var payRows = readObjects_(pay);
  var instRows = readObjects_(inst);

  var totalRegs = regRows.length;
  var paidRegs = regRows.filter(function(r) { return String(r.payment_status).toUpperCase() === "SUCCESS"; }).length;
  var pendingRegs = regRows.filter(function(r) { return String(r.payment_status).toUpperCase() === "PENDING"; }).length;
  var failedRegs = regRows.filter(function(r) { return String(r.payment_status).toUpperCase() === "FAILED"; }).length;
  var revenue = payRows.filter(function(r) { return String(r.payment_status).toUpperCase() === "SUCCESS"; })
    .reduce(function(sum, r) { return sum + (Number(r.amount_inr) || 0); }, 0);
  var metrics = [
    ["TOTAL_REGISTRATIONS","Total Registrations",totalRegs],
    ["PAID_REGISTRATIONS","Paid Registrations",paidRegs],
    ["PENDING_REGISTRATIONS","Pending Registrations",pendingRegs],
    ["FAILED_REGISTRATIONS","Failed Registrations",failedRegs],
    ["INSTITUTIONAL_REGISTRATIONS","Institutional Registrations",instRows.length],
    ["TOTAL_PAYMENT_RECORDS","Payment Records",payRows.length],
    ["VERIFIED_REVENUE_INR","Verified Revenue (INR)",revenue]
  ];
  metrics.forEach(function(m) {
    appendOrUpdateRow(dash, "metric_key", m[0], {
      metric_key: m[0], metric_label: m[1], metric_value: m[2], last_computed: timestamp_()
    });
  });
  audit_("DASHBOARD_REFRESH", "DASHBOARD", "ALL", { metrics: metrics.length }, getActiveUserEmail_());
  SpreadsheetApp.getUi().alert("Dashboard refreshed.\nRegistrations: " + totalRegs + "\nPaid: " + paidRegs + "\nVerified revenue: ₹" + revenue);
}

function readObjects_(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  var values = sh.getDataRange().getValues();
  var headers = values[0].map(String);
  return values.slice(1).filter(function(row) { return row.some(function(v) { return v !== ""; }); }).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

/* -------------------------- RECONCILIATION ------------------------------- */

function reconcileDatabase() {
  var ss = getSpreadsheet_();
  var reg = ss.getSheetByName("REGISTRATIONS");
  var pay = ss.getSheetByName("PAYMENTS");
  if (!reg || !pay) throw new Error("Required sheets missing.");
  var regs = readObjects_(reg), pays = readObjects_(pay);
  var paymentRegs = {};
  pays.forEach(function(p) {
    if (String(p.payment_status).toUpperCase() === "SUCCESS" && p.registration_number) {
      paymentRegs[String(p.registration_number)] = true;
    }
  });
  var mismatches = [];
  regs.forEach(function(r) {
    var status = String(r.payment_status || "").toUpperCase();
    var hasSuccess = !!paymentRegs[String(r.registration_number)];
    if (status === "SUCCESS" && !hasSuccess) mismatches.push("Registration " + r.registration_number + " is SUCCESS but has no successful payment row.");
    if (status !== "SUCCESS" && hasSuccess) mismatches.push("Registration " + r.registration_number + " has a successful payment row but registration status is " + status + ".");
  });

  // Also sync with website to prune any removed rows
  var activeRegs = regs.map(function(r) { return r.registration_number; }).filter(Boolean);
  var websiteSyncResult = postToWebsite_({
    action: "sync_active_registrations",
    active_registration_numbers: activeRegs,
    source: "GSHEETS_RECONCILE_TRIGGER"
  });

  audit_("DATABASE_RECONCILIATION", "DATABASE", "ALL", { mismatch_count: mismatches.length, website_sync: websiteSyncResult }, getActiveUserEmail_());
  SpreadsheetApp.getUi().alert("Reconciliation complete.\nRegistrations checked: " + regs.length + "\nPayment records checked: " + pays.length + "\nMismatches: " + mismatches.length + (websiteSyncResult.pruned && websiteSyncResult.pruned.length ? "\nWebsite pruned registrations: " + websiteSyncResult.pruned.length : "\nWebsite is in exact sync.") + (mismatches.length ? "\n\n" + mismatches.slice(0, 20).join("\n") : ""));
  return { checked_registrations: regs.length, checked_payments: pays.length, mismatches: mismatches, website_sync: websiteSyncResult };
}

/* --------------------------- HEALTH CHECK -------------------------------- */

function runHealthCheck() {
  var ss = getSpreadsheet_();
  var missing = [];
  CONFIG.TABS.forEach(function(t) {
    var sh = ss.getSheetByName(t.name);
    if (!sh) missing.push(t.name);
    else {
      var headers = getHeaderMap_(sh);
      CONFIG.HEADERS[t.name].forEach(function(h) { if (!headers[h]) missing.push(t.name + "." + h); });
    }
  });
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty(CONFIG.API_SECRET_KEY_PROP);
  var folder = getOrCreateReceiptsFolder_();
  var checks = [
    "Spreadsheet: " + ss.getName(),
    "Expected tabs: " + CONFIG.TABS.length,
    "Schema issues: " + missing.length,
    "API secret: " + (secret && secret.length >= 32 ? "configured" : "NOT CONFIGURED"),
    "Website URL: " + getEffectiveWebsiteWebhookUrl(),
    "Receipts Drive Folder: " + folder.getName() + " (" + folder.getId() + ")",
    "Timezone: " + CONFIG.TIMEZONE
  ];
  SpreadsheetApp.getUi().alert("MY VICHAAR V4.3 — HEALTH CHECK\n\n" + checks.join("\n") + (missing.length ? "\n\nMissing:\n" + missing.slice(0, 30).join("\n") : "\n\nSchema and Drive storage are healthy."));
  return { ok: missing.length === 0 && !!secret && secret.length >= 32, missing: missing };
}

/* ------------------------ SETUP / TRIGGERS ------------------------------- */

function promptSetApiSecret() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Configure API Secret",
    "Paste a randomly generated secret of at least 32 characters. Store the same secret only on your trusted website server (.env).",
    ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var secret = response.getResponseText().trim();
  if (secret.length < 32) { ui.alert("Secret must be at least 32 characters."); return; }
  PropertiesService.getScriptProperties().setProperty(CONFIG.API_SECRET_KEY_PROP, secret);
  audit_("API_SECRET_CONFIGURED", "CONFIG", CONFIG.API_SECRET_KEY_PROP, {}, getActiveUserEmail_());
  ui.alert("API secret saved in Script Properties. Configure the identical value in your server .env as GOOGLE_SHEETS_API_KEY.");
}

function promptSetWebsiteUrl() {
  var ui = SpreadsheetApp.getUi();
  var current = PropertiesService.getScriptProperties().getProperty(CONFIG.WEBSITE_URL_PROP) || CONFIG.DEFAULT_WEBSITE_URL;
  var response = ui.prompt("Set Website URL", "Enter HTTPS base URL (no trailing slash):", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var url = response.getResponseText().trim().replace(/\/+$/, "");
  if (!/^https?:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:\/.*)?$/.test(url)) { ui.alert("Please enter a valid HTTP/HTTPS URL."); return; }
  PropertiesService.getScriptProperties().setProperty(CONFIG.WEBSITE_URL_PROP, url);
  audit_("WEBSITE_URL_UPDATED", "CONFIG", CONFIG.WEBSITE_URL_PROP, { previous: current, next: url }, getActiveUserEmail_());
  ui.alert("Website URL saved:\n" + url + CONFIG.WEBSITE_WEBHOOK_PATH);
}

function installAutomationTriggers() {
  var ss = getSpreadsheet_();
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) {
    if (["handleSheetEdit","processEmailQueueScheduled","refreshDashboardScheduled"].indexOf(t.getHandlerFunction()) >= 0) {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger("handleSheetEdit").forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger("processEmailQueueScheduled").timeBased().everyMinutes(5).create();
  ScriptApp.newTrigger("refreshDashboardScheduled").timeBased().everyHours(1).create();
  audit_("AUTOMATION_TRIGGERS_INSTALLED", "SYSTEM", "TRIGGERS", {}, getActiveUserEmail_());
  SpreadsheetApp.getUi().alert("Automation triggers installed:\n• Payment status edit handler\n• Email queue every 5 minutes\n• Dashboard refresh every hour");
}

function processEmailQueueScheduled() {
  processEmailQueue_(false);
}

function processEmailQueue_(showUi) {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName("NOTIFICATIONS");
  if (!sh || sh.getLastRow() < 2) return;
  var map = getHeaderMap_(sh);
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  var count = 0;
  for (var i = 0; i < rows.length && count < CONFIG.EMAIL_BATCH_SIZE; i++) {
    var row = i + 2;
    var status = String(rows[i][map.status - 1] || "").toUpperCase();
    var channel = String(rows[i][map.channel - 1] || "").toUpperCase();
    if (channel !== "EMAIL" || ["QUEUED","RETRY"].indexOf(status) < 0) continue;
    count++;
    try {
      var to = normalizeEmail_(rows[i][map.recipient_email - 1]);
      var msg = JSON.parse(String(rows[i][map.message - 1] || "{}"));
      if (!isValidEmail_(to) || !msg.subject || (!msg.html && !msg.body)) throw new Error("Invalid queued email.");
      var options = { name: CONFIG.INSTITUTION_NAME };
      if (msg.html) options.htmlBody = msg.html;
      if (msg.replyTo) options.replyTo = msg.replyTo;
      GmailApp.sendEmail(to, msg.subject, msg.body || "Please view this email in an HTML-compatible email client.", options);
      setByHeaders_(sh, row, { status: "SENT", sent_at: timestamp_() });
    } catch (err) {
      var id = String(rows[i][map.notification_id - 1]);
      var props = PropertiesService.getScriptProperties();
      var key = "EMAIL_ATTEMPTS_" + id.substring(0, 180);
      var tries = Number(props.getProperty(key) || 0) + 1;
      props.setProperty(key, String(tries));
      setByHeaders_(sh, row, { status: tries >= CONFIG.MAX_EMAIL_RETRIES ? "FAILED" : "RETRY" });
      audit_("EMAIL_SEND_FAILED", "NOTIFICATION", id, { attempt: tries, error: String(err) }, "EMAIL_QUEUE");
    }
  }
  if (showUi) SpreadsheetApp.getUi().alert("Email queue run complete. Records attempted: " + count);
}

function processEmailQueue() { processEmailQueue_(true); }

function refreshDashboardScheduled() {
  var ss = getSpreadsheet_(), dash = ss.getSheetByName("DASHBOARD");
  if (!dash) return;
  var regs = readObjects_(ss.getSheetByName("REGISTRATIONS"));
  var pays = readObjects_(ss.getSheetByName("PAYMENTS"));
  var inst = readObjects_(ss.getSheetByName("INSTITUTIONAL_REGISTRATIONS"));
  var success = regs.filter(function(r) { return String(r.payment_status).toUpperCase() === "SUCCESS"; }).length;
  var pending = regs.filter(function(r) { return String(r.payment_status).toUpperCase() === "PENDING"; }).length;
  var revenue = pays.filter(function(p) { return String(p.payment_status).toUpperCase() === "SUCCESS"; })
    .reduce(function(s, p) { return s + (Number(p.amount_inr) || 0); }, 0);
  [
    ["TOTAL_REGISTRATIONS","Total Registrations",regs.length],
    ["PAID_REGISTRATIONS","Paid Registrations",success],
    ["PENDING_REGISTRATIONS","Pending Registrations",pending],
    ["INSTITUTIONAL_REGISTRATIONS","Institutional Registrations",inst.length],
    ["VERIFIED_REVENUE_INR","Verified Revenue (INR)",revenue]
  ].forEach(function(m) {
    appendOrUpdateRow(dash, "metric_key", m[0], { metric_key:m[0], metric_label:m[1], metric_value:m[2], last_computed:timestamp_() });
  });
}

function getActiveUserEmail_() {
  try { return Session.getActiveUser().getEmail() || "ADMIN"; }
  catch (_) { return "ADMIN"; }
}
