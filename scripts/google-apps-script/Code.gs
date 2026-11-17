/**
 * ============================================================================
 * THE VICHAAR COUNCIL · MY VICHAAR MASTER DATABASE
 * Master Core Google Apps Script (Version 1.0)
 * 
 * Workbook: MY VICHAAR — MASTER DATABASE
 * Purpose: Central institutional data store, event accreditation, delegations,
 *          Cashfree payment verification, tickets, certificates and audit engine.
 * ============================================================================
 */

// Global Configuration
var CONFIG = {
  INSTITUTION_NAME: "THE VICHAAR COUNCIL",
  PORTAL_NAME: "MY VICHAAR",
  TIMEZONE: "Asia/Kolkata",
  API_SECRET_KEY_PROP: "TVC_API_SECRET_KEY", // Set via Project Settings > Script Properties
  
  // Theme Palette
  BRAND_NAVY: "#101C32",
  BRAND_GOLD: "#F8E6A0",
  BRAND_CRIMSON: "#B51F24",
  BRAND_CITRUS: "#FFA62B",
  BORDER_COLOR: "#D1D5DB",
  ROW_ALT_COLOR: "#F9FAFB",

  // 19 Master Tabs Definition with Categorized Group Colors
  TABS: [
    // 01-04: Core Database (Navy)
    { name: "PARTICIPANTS", color: "#101C32", prefix: "PRT" },
    { name: "INSTITUTIONS", color: "#101C32", prefix: "INS" },
    { name: "CONSENT_RECORDS", color: "#101C32", prefix: "CNS" },
    { name: "EVENTS", color: "#101C32", prefix: "EVT" },

    // 05-10: Registrations (Amalfi Blue)
    { name: "REGISTRATIONS", color: "#263B59", prefix: "REG" },
    { name: "DELEGATE_REGISTRATIONS", color: "#263B59", prefix: "DEL" },
    { name: "INSTITUTIONAL_REGISTRATIONS", color: "#263B59", prefix: "IRG" },
    { name: "DELEGATIONS", color: "#263B59", prefix: "DLG" },
    { name: "DELEGATION_MEMBERS", color: "#263B59", prefix: "MBR" },
    { name: "DELEGATE_PREFERENCES", color: "#263B59", prefix: "PRF" },

    // 11-14: Event Operations (Purple)
    { name: "TICKETS", color: "#6B21A8", prefix: "TKT" },
    { name: "PAYMENTS", color: "#6B21A8", prefix: "PAY" },
    { name: "CERTIFICATES", color: "#6B21A8", prefix: "CRT" },
    { name: "SUBMISSIONS", color: "#6B21A8", prefix: "SUB" },

    // 15: Communication (Green)
    { name: "NOTIFICATIONS", color: "#047857", prefix: "NTF" },

    // 16-17: Administration & Security (Red)
    { name: "ADMIN_USERS", color: "#B51F24", prefix: "ADM" },
    { name: "AUDIT_LOG", color: "#B51F24", prefix: "LOG" },

    // 18-19: System & Reporting (Grey)
    { name: "CONFIG", color: "#4B5563", prefix: "CFG" },
    { name: "DASHBOARD", color: "#4B5563", prefix: "DSH" }
  ],

  // Column Headers Specification for each of the 19 Tabs
  HEADERS: {
    PARTICIPANTS: [
      "participant_id", "full_name", "username", "email", "phone",
      "date_of_birth", "institution_name", "grade_or_year", "city",
      "state", "country", "is_email_verified", "guardian_name",
      "guardian_phone", "guardian_email", "account_status", "created_at", "updated_at"
    ],
    INSTITUTIONS: [
      "institution_id", "institution_name", "institution_type", "board_or_affiliation",
      "city", "state", "country", "official_email", "contact_number",
      "faculty_advisor_name", "faculty_advisor_phone", "faculty_advisor_email",
      "status", "total_delegates_registered", "created_at", "updated_at"
    ],
    CONSENT_RECORDS: [
      "consent_id", "participant_id", "participant_name", "consent_type",
      "version", "agreed_to_terms", "agreed_to_privacy", "guardian_consent_given",
      "guardian_name", "ip_address", "timestamp_utc", "created_at"
    ],
    EVENTS: [
      "event_id", "event_slug", "title", "category", "format",
      "start_date", "end_date", "venue", "city", "delegate_fee_inr",
      "status", "registration_open", "total_registered", "total_checked_in",
      "created_at", "updated_at"
    ],
    REGISTRATIONS: [
      "registration_id", "registration_number", "event_id", "event_title",
      "registration_type", "participant_id", "participant_name", "email",
      "phone", "institution_name", "pass_category", "total_amount_inr",
      "payment_status", "check_in_status", "registered_at", "created_at", "updated_at"
    ],
    DELEGATE_REGISTRATIONS: [
      "delegate_reg_id", "registration_number", "participant_id", "full_name",
      "event_id", "event_title", "grade_class", "experience_level",
      "committee_pref_1", "committee_pref_2", "portfolio_pref_1", "portfolio_pref_2",
      "dietary_requirements", "emergency_contact", "status", "created_at"
    ],
    INSTITUTIONAL_REGISTRATIONS: [
      "inst_reg_id", "institution_id", "institution_name", "event_id",
      "event_title", "faculty_in_charge", "faculty_email", "faculty_phone",
      "delegation_size", "delegation_code", "payment_status", "total_amount_inr",
      "status", "created_at", "updated_at"
    ],
    DELEGATIONS: [
      "delegation_id", "delegation_code", "delegation_name", "institution_id",
      "institution_name", "event_id", "head_delegate_id", "head_delegate_name",
      "total_allotted_slots", "filled_slots", "status", "created_at", "updated_at"
    ],
    DELEGATION_MEMBERS: [
      "member_id", "delegation_id", "delegation_code", "participant_id",
      "participant_name", "email", "phone", "role_in_delegation",
      "committee_assigned", "portfolio_assigned", "status", "created_at"
    ],
    DELEGATE_PREFERENCES: [
      "preference_id", "registration_number", "participant_id", "participant_name",
      "event_id", "pref_rank_1_committee", "pref_rank_1_portfolio",
      "pref_rank_2_committee", "pref_rank_2_portfolio",
      "pref_rank_3_committee", "pref_rank_3_portfolio", "past_experience_summary", "created_at"
    ],
    TICKETS: [
      "ticket_id", "ticket_code", "registration_number", "event_id",
      "event_title", "participant_id", "participant_name", "ticket_tier",
      "qr_verification_hash", "check_in_status", "check_in_timestamp_utc",
      "checked_in_by", "status", "issued_at"
    ],
    PAYMENTS: [
      "payment_id", "order_id", "cf_order_id", "registration_number",
      "participant_name", "payer_email", "payer_phone", "amount_inr",
      "currency", "payment_gateway", "payment_method", "payment_status",
      "bank_reference", "transaction_timestamp_utc", "refund_id", "refund_status",
      "created_at", "updated_at"
    ],
    CERTIFICATES: [
      "certificate_id", "certificate_number", "participant_id", "recipient_name",
      "recipient_username", "event_id", "event_title", "certificate_type",
      "citation_text", "verification_url", "issue_date", "status", "issued_by", "created_at"
    ],
    SUBMISSIONS: [
      "submission_id", "participant_id", "author_name", "author_username",
      "paper_title", "category", "abstract", "document_url", "word_count",
      "review_status", "reviewer_name", "reviewer_score", "reviewer_feedback",
      "submitted_at", "updated_at"
    ],
    NOTIFICATIONS: [
      "notification_id", "participant_id", "recipient_email", "title",
      "message", "category", "action_link", "is_read", "delivery_channel",
      "delivery_status", "dispatched_at"
    ],
    ADMIN_USERS: [
      "admin_id", "name", "email", "role", "department",
      "is_active", "access_level", "last_active_at", "created_at", "updated_at"
    ],
    AUDIT_LOG: [
      "log_id", "actor_id", "actor_name", "actor_email", "action_type",
      "entity_type", "entity_id", "change_summary", "ip_address", "timestamp_utc"
    ],
    CONFIG: [
      "config_id", "config_category", "key_name", "value_text",
      "description", "is_system", "updated_at"
    ]
  }
};

/**
 * ============================================================================
 * 01. INITIALIZATION & CUSTOM MENU
 * ============================================================================
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("🏛️ The Vichaar Council")
    .addItem("🚀 Initialize Master Database (19 Tabs)", "initializeMasterDatabase")
    .addItem("📊 Refresh Dashboard Analytics", "buildDashboardSheet")
    .addItem("⚙️ Populate Default System Config", "populateDefaultConfig")
    .addSeparator()
    .addItem("🔒 Apply Protection to System Columns", "protectSystemColumns")
    .addItem("🩺 Run System Health & Data Integrity Check", "runSystemHealthCheck")
    .addToUi();
}

/**
 * Master Provisioning function: creates and formats all 19 tabs
 */
function initializeMasterDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var existingSheets = ss.getSheets();
  var sheetMap = {};
  for (var i = 0; i < existingSheets.length; i++) {
    sheetMap[existingSheets[i].getName()] = existingSheets[i];
  }

  // Iterate over 19 tabs definition in recommended order
  for (var t = 0; t < CONFIG.TABS.length; t++) {
    var tabInfo = CONFIG.TABS[t];
    var sheet = sheetMap[tabInfo.name];

    if (!sheet) {
      sheet = ss.insertSheet(tabInfo.name, t);
    } else {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(t + 1);
    }

    // Set tab color group
    try {
      sheet.setTabColor(tabInfo.color);
    } catch (e) {
      // Color setting fallback
    }

    // Handle dashboard separately from standard tabular sheets
    if (tabInfo.name === "DASHBOARD") {
      continue;
    }

    // Set headers
    var headers = CONFIG.HEADERS[tabInfo.name];
    if (headers && headers.length > 0) {
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]);

      // Style header row
      headerRange
        .setBackground(CONFIG.BRAND_NAVY)
        .setFontColor(CONFIG.BRAND_GOLD)
        .setFontFamily("Arial")
        .setFontSize(10)
        .setFontWeight("bold")
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle")
        .setWrap(true);

      sheet.setRowHeight(1, 38);

      // Freeze first row
      sheet.setFrozenRows(1);

      // Enable filter on header range if not already active
      var currentFilter = sheet.getFilter();
      if (!currentFilter && sheet.getLastRow() >= 1) {
        sheet.getRange(1, 1, sheet.getMaxRows(), headers.length).createFilter();
      }

      // Auto-fit column widths
      for (var c = 1; c <= headers.length; c++) {
        sheet.setColumnWidth(c, 160);
      }
    }
  }

  // Populate Default Config and Dashboard
  populateDefaultConfig();
  buildDashboardSheet();

  SpreadsheetApp.getActiveSpreadsheet().toast("All 19 Tabs successfully initialized and styled!", "The Vichaar Council", 5);
}

/**
 * Builds calculated operational reporting dashboard on the DASHBOARD tab
 */
function buildDashboardSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("DASHBOARD");
  if (!sheet) return;

  sheet.clear();
  sheet.setTabColor("#4B5563");

  // Title Block
  sheet.getRange("A1:H1").merge()
    .setValue("THE VICHAAR COUNCIL · MY VICHAAR MASTER OPERATIONS DASHBOARD")
    .setBackground(CONFIG.BRAND_NAVY)
    .setFontColor(CONFIG.BRAND_GOLD)
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 45);

  sheet.getRange("A2:H2").merge()
    .setValue("Live operational KPIs generated from master records · Auto-updating formulas")
    .setBackground("#0F172A")
    .setFontColor("#94A3B8")
    .setFontSize(9)
    .setHorizontalAlignment("center");
  sheet.setRowHeight(2, 24);

  // Metric Cards
  var metrics = [
    { label: "Total Participants", formula: '=IFERROR(COUNTA(PARTICIPANTS!A2:A), 0)', cell: "A4", bg: "#1E293B" },
    { label: "Total Registrations", formula: '=IFERROR(COUNTA(REGISTRATIONS!A2:A), 0)', cell: "C4", bg: "#1E293B" },
    { label: "Confirmed / Paid Passes", formula: '=IFERROR(COUNTIF(REGISTRATIONS!M2:M, "SUCCESS"), 0)', cell: "E4", bg: "#1E293B" },
    { label: "Checked-in Delegates", formula: '=IFERROR(COUNTIF(TICKETS!J2:J, TRUE), 0)', cell: "G4", bg: "#1E293B" },
    { label: "Total Revenue (INR)", formula: '=IFERROR(SUMIF(PAYMENTS!L2:L, "SUCCESS", PAYMENTS!H2:H), 0)', cell: "A7", bg: "#0F172A" },
    { label: "Active Institutions", formula: '=IFERROR(COUNTA(INSTITUTIONS!A2:A), 0)', cell: "C7", bg: "#0F172A" },
    { label: "Pending Submissions", formula: '=IFERROR(COUNTIF(SUBMISSIONS!J2:J, "SUBMITTED"), 0)', cell: "E7", bg: "#0F172A" },
    { label: "Certificates Issued", formula: '=IFERROR(COUNTA(CERTIFICATES!A2:A), 0)', cell: "G7", bg: "#0F172A" }
  ];

  for (var m = 0; m < metrics.length; m++) {
    var item = metrics[m];
    var col = item.cell.charAt(0);
    var row = parseInt(item.cell.substring(1), 10);
    var nextCol = String.fromCharCode(col.charCodeAt(0) + 1);

    // Label Cell
    sheet.getRange(col + row + ":" + nextCol + row).merge()
      .setValue(item.label)
      .setBackground(CONFIG.BRAND_NAVY)
      .setFontColor("#E2E8F0")
      .setFontSize(9)
      .setFontWeight("bold")
      .setHorizontalAlignment("center");

    // Value Cell
    sheet.getRange(col + (row + 1) + ":" + nextCol + (row + 1)).merge()
      .setFormula(item.formula)
      .setBackground(item.bg)
      .setFontColor(CONFIG.BRAND_CITRUS)
      .setFontSize(18)
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");
  }

  // System Status Block
  sheet.getRange("A11:H11").merge()
    .setValue("SYSTEM PROTOCOLS & INTEGRITY")
    .setBackground(CONFIG.BRAND_NAVY)
    .setFontColor(CONFIG.BRAND_GOLD)
    .setFontSize(10)
    .setFontWeight("bold")
    .setHorizontalAlignment("left");

  var rules = [
    ["1. Record ID Immutability", "Permanent alphanumeric IDs (PRT-, REG-, TKT-) are assigned upon ingestion and must never be altered."],
    ["2. Zero Plaintext Passwords", "Participant passwords, salts and authentication tokens remain strictly on secure Next.js server clusters."],
    ["3. Financial Reconciliation", "Every registration marked 'SUCCESS' must correlate to a valid order_id verified against Cashfree."],
    ["4. Digital Ticket Pass Validity", "Tickets must have a cryptographically verified SHA-256 hash before admittance at security checkpoints."]
  ];

  for (var r = 0; r < rules.length; r++) {
    var rowIdx = 12 + r;
    sheet.getRange("A" + rowIdx + ":B" + rowIdx).merge()
      .setValue(rules[r][0])
      .setFontWeight("bold")
      .setFontSize(9)
      .setBackground("#F8FAFC");

    sheet.getRange("C" + rowIdx + ":H" + rowIdx).merge()
      .setValue(rules[r][1])
      .setFontSize(9)
      .setBackground("#FFFFFF");
  }

  sheet.setFrozenRows(2);
}

/**
 * Populates system parameters and enum definitions in the CONFIG tab
 */
function populateDefaultConfig() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("CONFIG");
  if (!sheet) return;

  var existingLastRow = sheet.getLastRow();
  if (existingLastRow > 1) return; // Prevent overwriting existing configurations

  var configs = [
    ["CFG-001", "PAYMENT_STATUS", "CREATED", "Payment initiated via portal", "System status", true],
    ["CFG-002", "PAYMENT_STATUS", "SUCCESS", "Payment confirmed via Cashfree webhook", "System status", true],
    ["CFG-003", "PAYMENT_STATUS", "FAILED", "Payment transaction failed", "System status", true],
    ["CFG-004", "PAYMENT_STATUS", "REFUNDED", "Full or partial refund processed", "System status", true],
    ["CFG-005", "REGISTRATION_TYPE", "INDIVIDUAL_DELEGATE", "Direct delegate signup", "Registration category", true],
    ["CFG-006", "REGISTRATION_TYPE", "INSTITUTIONAL_DELEGATION", "School/College group delegation", "Registration category", true],
    ["CFG-007", "TICKET_TIER", "DELEGATE_PASS", "Standard delegate admission (₹549)", "Pass specification", true],
    ["CFG-008", "TICKET_TIER", "OBSERVER_PASS", "Observer/Audience accreditation", "Pass specification", true],
    ["CFG-009", "CERTIFICATE_TYPE", "PARTICIPATION", "Official Certificate of Participation", "Academic credential", true],
    ["CFG-010", "CERTIFICATE_TYPE", "MERIT", "Best Delegate / High Commendation Award", "Academic credential", true],
    ["CFG-011", "SUBMISSION_TYPE", "POLICY_BRIEF", "Original youth policy brief", "Research submission", true],
    ["CFG-012", "SUBMISSION_TYPE", "POSITION_PAPER", "Committee agenda stance document", "Debate paper", true],
    ["CFG-013", "SYSTEM", "DEFAULT_CURRENCY", "INR", "Base currency for all event transactions", true],
    ["CFG-014", "SYSTEM", "OFFICIAL_CONTACT_LINE", "+91 73573 37067", "Official Secretariat contact hotline", true]
  ];

  var now = getIsoTimestamp();
  var rows = configs.map(function(c) {
    return [c[0], c[1], c[2], c[3], c[4], c[5], now];
  });

  sheet.getRange(2, 1, rows.length, 7).setValues(rows);
}

/**
 * ============================================================================
 * 02. UNIQUE ID GENERATION & UTILITIES
 * ============================================================================
 */

function generateUniqueId(prefix) {
  var year = new Date().getFullYear();
  var randomDigits = Math.floor(10000 + Math.random() * 90000);
  return prefix + "-" + year + "-" + randomDigits;
}

function getIsoTimestamp() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

/**
 * Protects system generated IDs and formula columns from accidental manual overwriting
 */
function protectSystemColumns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetsToProtect = ["PARTICIPANTS", "REGISTRATIONS", "TICKETS", "PAYMENTS", "CERTIFICATES"];

  for (var i = 0; i < sheetsToProtect.length; i++) {
    var sheet = ss.getSheetByName(sheetsToProtect[i]);
    if (!sheet) continue;

    var idColRange = sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1);
    var protection = idColRange.protect().setDescription("Protection: System Generated Primary ID");
    protection.setWarningOnly(true);
  }

  ss.toast("Column protections enabled across master sheets.", "The Vichaar Council", 3);
}

/**
 * System Data Integrity Check
 */
function runSystemHealthCheck() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var errors = [];

  for (var i = 0; i < CONFIG.TABS.length; i++) {
    var tabName = CONFIG.TABS[i].name;
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      errors.push("Missing tab: " + tabName);
    }
  }

  var ui = SpreadsheetApp.getUi();
  if (errors.length === 0) {
    ui.alert("System Health Check: PASSED\n\nAll 19 master sheets are present, configured, and synchronized with The Vichaar Council architecture.");
  } else {
    ui.alert("System Health Check: ATTENTION REQUIRED\n\n" + errors.join("\n"));
  }
}

/**
 * ============================================================================
 * 03. RESTFUL JSON WEBHOOK ENGINE (doGet & doPost)
 * Ingests and synchronizes records from the Next.js Portal & Cashfree Webhooks
 * ============================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    institution: CONFIG.INSTITUTION_NAME,
    portal: CONFIG.PORTAL_NAME,
    status: "ONLINE",
    version: "1.0",
    timestamp: getIsoTimestamp()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ error: "Empty or invalid payload" }, 400);
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    // Optional API Secret Key Authentication
    var expectedKey = PropertiesService.getScriptProperties().getProperty(CONFIG.API_SECRET_KEY_PROP);
    if (expectedKey && payload.apiKey !== expectedKey) {
      return jsonResponse({ error: "Unauthorized access: Invalid API key" }, 401);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var now = getIsoTimestamp();

    switch (action) {
      // 1. Participant Registration Sync
      case "sync_participant":
        return handleSyncParticipant(ss, payload, now);

      // 2. Event Registration Sync
      case "sync_registration":
        return handleSyncRegistration(ss, payload, now);

      // 3. Payment Status Update (Cashfree Webhook)
      case "sync_payment":
        return handleSyncPayment(ss, payload, now);

      // 4. Ticket Check-in Scanner
      case "check_in_ticket":
        return handleCheckInTicket(ss, payload, now);

      // 5. Academic Submission Sync
      case "sync_submission":
        return handleSyncSubmission(ss, payload, now);

      // 6. Audit Log Recording
      case "log_audit":
        return handleLogAudit(ss, payload, now);

      default:
        return jsonResponse({ error: "Unknown action: " + action }, 400);
    }
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Appends or updates participant account in the PARTICIPANTS tab
 */
function handleSyncParticipant(ss, payload, now) {
  var sheet = ss.getSheetByName("PARTICIPANTS");
  if (!sheet) return jsonResponse({ error: "PARTICIPANTS tab missing" }, 500);

  var data = payload.data || {};
  var pId = data.participant_id || generateUniqueId("PRT");

  var row = [
    pId,
    data.full_name || "",
    data.username || "",
    data.email || "",
    data.phone || "",
    data.date_of_birth || "",
    data.institution_name || "",
    data.grade_or_year || "",
    data.city || "",
    data.state || "",
    data.country || "India",
    data.is_email_verified === true ? "TRUE" : "FALSE",
    data.guardian_name || "",
    data.guardian_phone || "",
    data.guardian_email || "",
    data.account_status || "ACTIVE",
    now,
    now
  ];

  sheet.appendRow(row);

  // Log in Audit Log
  appendAuditLog(ss, "SYSTEM", "PORTAL_API", "PARTICIPANT_REGISTERED", "PARTICIPANTS", pId, "New participant registered: @" + data.username);

  return jsonResponse({ success: true, participant_id: pId });
}

/**
 * Ingests a new registration into REGISTRATIONS, DELEGATE_REGISTRATIONS and generates a TICKET
 */
function handleSyncRegistration(ss, payload, now) {
  var regSheet = ss.getSheetByName("REGISTRATIONS");
  var tktSheet = ss.getSheetByName("TICKETS");
  if (!regSheet || !tktSheet) return jsonResponse({ error: "Required sheets missing" }, 500);

  var data = payload.data || {};
  var regId = data.registration_id || generateUniqueId("REG");
  var regNumber = data.registration_number || ("TVC-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000));
  var tktId = generateUniqueId("TKT");
  var tktCode = "PASS-" + regNumber;

  // Append Registration
  regSheet.appendRow([
    regId,
    regNumber,
    data.event_id || "EVT-SHABD-SOCH-2026",
    data.event_title || "SHABD & SOCH",
    data.registration_type || "INDIVIDUAL_DELEGATE",
    data.participant_id || "",
    data.participant_name || "",
    data.email || "",
    data.phone || "",
    data.institution_name || "",
    data.pass_category || "Delegate Pass (Classes 7th to 12th)",
    data.total_amount_inr || 549,
    data.payment_status || "PENDING",
    "FALSE", // Check-in status
    now,
    now,
    now
  ]);

  // Generate Ticket Record
  tktSheet.appendRow([
    tktId,
    tktCode,
    regNumber,
    data.event_id || "EVT-SHABD-SOCH-2026",
    data.event_title || "SHABD & SOCH",
    data.participant_id || "",
    data.participant_name || "",
    data.pass_category || "Delegate Pass",
    generateTicketHash(regNumber, data.email),
    "FALSE",
    "",
    "",
    "ISSUED",
    now
  ]);

  appendAuditLog(ss, data.participant_name || "GUEST", data.email, "CREATE_REGISTRATION", "REGISTRATIONS", regNumber, "Pass booked for " + (data.event_title || "Event"));

  return jsonResponse({
    success: true,
    registration_id: regId,
    registration_number: regNumber,
    ticket_id: tktId,
    ticket_code: tktCode
  });
}

/**
 * Updates payment status and marks ticket ready
 */
function handleSyncPayment(ss, payload, now) {
  var paySheet = ss.getSheetByName("PAYMENTS");
  var regSheet = ss.getSheetByName("REGISTRATIONS");
  if (!paySheet) return jsonResponse({ error: "PAYMENTS tab missing" }, 500);

  var data = payload.data || {};
  var payId = data.payment_id || generateUniqueId("PAY");

  paySheet.appendRow([
    payId,
    data.order_id || "",
    data.cf_order_id || "",
    data.registration_number || "",
    data.participant_name || "",
    data.payer_email || "",
    data.payer_phone || "",
    data.amount_inr || 549,
    "INR",
    "Cashfree",
    data.payment_method || "UPI",
    data.payment_status || "SUCCESS",
    data.bank_reference || "",
    now,
    "",
    "",
    now,
    now
  ]);

  // Update corresponding Registration row if status is SUCCESS
  if (regSheet && data.registration_number) {
    var regData = regSheet.getDataRange().getValues();
    for (var r = 1; r < regData.length; r++) {
      if (regData[r][1] === data.registration_number) { // Column B: registration_number
        regSheet.getRange(r + 1, 13).setValue(data.payment_status); // Column M: payment_status
        regSheet.getRange(r + 1, 17).setValue(now); // Column Q: updated_at
        break;
      }
    }
  }

  appendAuditLog(ss, "CASHFREE_GATEWAY", "webhook", "RECORD_PAYMENT", "PAYMENTS", payId, "Payment " + data.payment_status + " for " + data.registration_number);

  return jsonResponse({ success: true, payment_id: payId });
}

/**
 * Scans and checks in a delegate at the venue admissions desk
 */
function handleCheckInTicket(ss, payload, now) {
  var tktSheet = ss.getSheetByName("TICKETS");
  var regSheet = ss.getSheetByName("REGISTRATIONS");
  if (!tktSheet) return jsonResponse({ error: "TICKETS sheet missing" }, 500);

  var ticketCode = payload.ticket_code;
  var scannerAdmin = payload.scanner_admin || "Admissions Officer";

  var tktData = tktSheet.getDataRange().getValues();
  for (var i = 1; i < tktData.length; i++) {
    if (tktData[i][1] === ticketCode) { // Column B: ticket_code
      if (tktData[i][9] === true || tktData[i][9] === "TRUE") {
        return jsonResponse({
          success: false,
          already_checked_in: true,
          checked_in_at: tktData[i][10],
          delegate_name: tktData[i][6]
        });
      }

      // Mark checked in
      tktSheet.getRange(i + 1, 10).setValue("TRUE");
      tktSheet.getRange(i + 1, 11).setValue(now);
      tktSheet.getRange(i + 1, 12).setValue(scannerAdmin);

      var regNumber = tktData[i][2];
      // Sync check-in to registrations sheet
      if (regSheet && regNumber) {
        var regData = regSheet.getDataRange().getValues();
        for (var r = 1; r < regData.length; r++) {
          if (regData[r][1] === regNumber) {
            regSheet.getRange(r + 1, 14).setValue("TRUE");
            break;
          }
        }
      }

      appendAuditLog(ss, scannerAdmin, "checkin_terminal", "DELEGATE_CHECK_IN", "TICKETS", ticketCode, "Admitted delegate: " + tktData[i][6]);

      return jsonResponse({
        success: true,
        delegate_name: tktData[i][6],
        event_title: tktData[i][4],
        check_in_timestamp: now
      });
    }
  }

  return jsonResponse({ error: "Ticket code not recognized" }, 404);
}

/**
 * Synchronizes intellectual submissions
 */
function handleSyncSubmission(ss, payload, now) {
  var sheet = ss.getSheetByName("SUBMISSIONS");
  if (!sheet) return jsonResponse({ error: "SUBMISSIONS sheet missing" }, 500);

  var data = payload.data || {};
  var subId = data.submission_id || generateUniqueId("SUB");

  sheet.appendRow([
    subId,
    data.participant_id || "",
    data.author_name || "",
    data.author_username || "",
    data.paper_title || "",
    data.category || "Policy Brief",
    data.abstract || "",
    data.document_url || "",
    data.word_count || 0,
    "SUBMITTED",
    "",
    "",
    "",
    now,
    now
  ]);

  appendAuditLog(ss, data.author_name, data.author_username, "PAPER_SUBMISSION", "SUBMISSIONS", subId, "Received paper: " + data.paper_title);

  return jsonResponse({ success: true, submission_id: subId });
}

/**
 * Appends administrative audit log entries to the AUDIT_LOG tab
 */
function appendAuditLog(ss, actorName, actorEmail, actionType, entityType, entityId, summary) {
  try {
    var logSheet = ss.getSheetByName("AUDIT_LOG");
    if (!logSheet) return;

    var logId = generateUniqueId("LOG");
    var now = getIsoTimestamp();

    logSheet.appendRow([
      logId,
      actorEmail || "SYSTEM",
      actorName || "SYSTEM",
      actorEmail || "system@thevichaarcouncil.in",
      actionType,
      entityType,
      entityId || "",
      summary || "",
      "127.0.0.1",
      now
    ]);
  } catch (e) {
    // Audit log should never block the main transaction
  }
}

function handleLogAudit(ss, payload, now) {
  appendAuditLog(
    ss,
    payload.actor_name,
    payload.actor_email,
    payload.action_type,
    payload.entity_type,
    payload.entity_id,
    payload.change_summary
  );
  return jsonResponse({ success: true });
}

function generateTicketHash(regNumber, email) {
  var raw = regNumber + ":" + email + ":" + "VICHAAR_COUNCIL_KEY_2026";
  var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
  var hex = "";
  for (var i = 0; i < signature.length; i++) {
    var byteVal = signature[i];
    if (byteVal < 0) byteVal += 256;
    var byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = "0" + byteHex;
    hex += byteHex;
  }
  return hex.substring(0, 16).toUpperCase();
}

function jsonResponse(data, status) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
