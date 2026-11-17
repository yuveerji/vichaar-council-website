# The Vichaar Council · MY VICHAAR Master Database (Google Apps Script)

This directory contains the master Apps Script engine for the official **`MY VICHAAR — MASTER DATABASE`** Google Sheets workbook.

---

## 1. Structure Overview

The script automates and maintains the **19 Master Database Tabs** in recommended sequence:

| Tab No. | Tab Name | Color Group | Purpose |
| :--- | :--- | :--- | :--- |
| **01** | `PARTICIPANTS` | Navy (`#101C32`) | Participant accounts and profile records |
| **02** | `INSTITUTIONS` | Navy (`#101C32`) | Schools, colleges, and institutional profiles |
| **03** | `CONSENT_RECORDS` | Navy (`#101C32`) | Terms, privacy, and guardian consent logs |
| **04** | `EVENTS` | Navy (`#101C32`) | Event details, dates, fees, and registration status |
| **05** | `REGISTRATIONS` | Blue (`#263B59`) | General event registrations and status |
| **06** | `DELEGATE_REGISTRATIONS` | Blue (`#263B59`) | Individual delegate applications |
| **07** | `INSTITUTIONAL_REGISTRATIONS` | Blue (`#263B59`) | School/College delegation applications |
| **08** | `DELEGATIONS` | Blue (`#263B59`) | Group delegation slots and allotments |
| **09** | `DELEGATION_MEMBERS` | Blue (`#263B59`) | Members assigned to delegations |
| **10** | `DELEGATE_PREFERENCES` | Blue (`#263B59`) | Committee and portfolio preferences |
| **11** | `TICKETS` | Purple (`#6B21A8`) | Digital passes, QR hashes, and check-in records |
| **12** | `PAYMENTS` | Purple (`#6B21A8`) | Cashfree order transactions, methods, and status |
| **13** | `CERTIFICATES` | Purple (`#6B21A8`) | Issued certificates and verification IDs |
| **14** | `SUBMISSIONS` | Purple (`#6B21A8`) | Policy briefs, research papers, and review status |
| **15** | `NOTIFICATIONS` | Green (`#047857`) | Communication dispatches and read statuses |
| **16** | `ADMIN_USERS` | Red (`#B51F24`) | Secretariat and admin role assignments |
| **17** | `AUDIT_LOG` | Red (`#B51F24`) | System audit trail and change history |
| **18** | `CONFIG` | Grey (`#4B5563`) | Status constants and system configurations |
| **19** | `DASHBOARD` | Grey (`#4B5563`) | Live operational KPI summary and reporting |

---

## 2. Installation & One-Click Setup

1. Create a new Google Spreadsheet and name it:
   ```
   MY VICHAAR — MASTER DATABASE
   ```
2. Navigate to **Extensions** → **Apps Script**.
3. Replace the default content of `Code.gs` with the code in [`Code.gs`](./Code.gs).
4. Save the project as **`My Vichaar Core Engine`**.
5. Click **Run** on the `initializeMasterDatabase` function (or reload your spreadsheet and select **🏛️ The Vichaar Council** → **🚀 Initialize Master Database (19 Tabs)** from the custom top menu).
6. Grant Google authorization permissions when prompted.

---

## 3. Webhook Integration with Next.js Portal

To connect your live Vichaar Council website with this Google Sheet:

1. In the Apps Script editor, click **Deploy** → **New deployment**.
2. Select type: **Web app**.
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` (or restricted via API key).
3. Copy the generated **Web App URL** (`https://script.google.com/macros/s/.../exec`).
4. In Project Settings → **Script Properties**, set:
   - Property: `TVC_API_SECRET_KEY`
   - Value: `your-secure-secret-token`
5. In your Next.js `.env` file, add:
   ```env
   GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
   GOOGLE_SHEETS_API_KEY="your-secure-secret-token"
   ```

### Supported API Actions (`POST` JSON payload):
- `sync_participant`: Ingests a new participant account.
- `sync_registration`: Ingests an event registration and generates a digital pass ticket.
- `sync_payment`: Updates Cashfree payment status and synchronizes the pass.
- `check_in_ticket`: Scans and validates delegate QR codes at the venue.
- `sync_submission`: Archives policy papers and research submissions.
- `log_audit`: Writes administrative audit entries.
