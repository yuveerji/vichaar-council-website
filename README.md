# THE VICHAAR COUNCIL
> **WHERE IDEAS EARN THEIR WEIGHT.**

Official Institutional Digital Platform for **THE VICHAAR COUNCIL** — an independent youth-led intellectual and debating institution dedicated to rigorous public discourse, parliamentary simulation, constitutional inquiry, policy research, and diplomacy across India and the Global South.

---

## 🏛️ Institutional Architecture & Stack

- **Framework:** Next.js (App Router, Server Components & Route Handlers)
- **Language:** TypeScript 5.7+
- **Styling & Design Tokens:** Tailwind CSS with official institutional tokens:
  - **Citrus Zest:** `#FFA62B` (Highlights, CTAs, accents)
  - **Sea Breeze:** `#8CC5FF` (Secondary accents)
  - **Amalfi Tile:** `#2E5AA7` (Primary links and accents)
  - **Cream Gelato:** `#F8E6A0` (Soft highlights)
  - **Midnight Navy:** `#101827` (Dark surfaces)
  - **Ink Black:** `#080B10` (Hero contrast)
  - **Deep Red:** `#B51F24` (Important accents)
  - **Parchment Cream:** `#FFF5E7` (Editorial backgrounds)
  - **Warm White:** `#FFFDF8` (Light surfaces)
  - **Charcoal:** `#20232A` (Body text)
- **Database & ORM:** SQLite / PostgreSQL with Prisma ORM
- **Payment Gateway:** Cashfree Payments (v2023-08-01 PG API with sandbox & live production readiness, HMAC-SHA256 webhook signature verification, order reconciliation, automated receipts & refunds)
- **Authentication:** Secure cookie sessions with bcrypt password hashing and role-based authorization

---

## 🧭 Page Routes & Directory

### Public Pages
- `/` — Institutional Homepage (Cinematic editorial hero, Five Pillars, Initiatives, Assemblies, Research, Leadership, Engagement CTA)
- `/about` — About Us (Charter, Vision, Mission, Non-Partisan Commitment, Epistemic Charity)
- `/initiatives` & `/initiatives/[slug]` — Programs & Initiatives Directory
- `/events` & `/events/[slug]` — Assemblies & Events with Cashfree Registration checkout
- `/events/[slug]/confirmation` — Cashfree Payment Verification, Voucher & Printable Receipt
- `/research` & `/research/[slug]` — Discourse India Journal, Policy Working Papers, Essays & Citations
- `/leadership` — Executive Directorate, Academic Council, Secretariat
- `/gallery` — Visual Archive of Assemblies, Debates & Diplomatic Conclaves
- `/contact` — Secretariat Correspondence form with anti-spam honeypot and category routing
- `/privacy-policy` — Compliant with Digital Personal Data Protection (DPDP) Act, India
- `/terms` — Terms & Conditions and Delegate Code of Conduct
- `/refund-policy` — Cancellation and Refund Policy for Cashfree event registrations

### Administration Portal (`/admin`)
- `/admin/login` — Administrative authentication
- `/admin/dashboard` — Operational Cockpit with KPI Metrics, Gross Collections (₹), Recent Registrations, Cashfree Transactions, and Enquiries
- `/admin/events` & `/admin/events/new` — Assembly creation docket and ticket tier management
- `/admin/registrations` — Full delegate admissions roll with status filtering
- `/admin/payments` — Financial audit roll with Cashfree refund trigger
- `/admin/enquiries` — Secretariat correspondence inbox
- `/admin/settings` — Gateway configuration status and site parameters

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 2. Installation
```bash
# Clone the repository
cd vichaar-council-website

# Dependencies are already linked or run:
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Cashfree Payments (Test or Production)
CASHFREE_ENV="SANDBOX"
CASHFREE_CLIENT_ID="your_cashfree_client_id"
CASHFREE_CLIENT_SECRET="your_cashfree_client_secret"
CASHFREE_API_VERSION="2023-08-01"
CASHFREE_WEBHOOK_SECRET="your_cashfree_webhook_secret"

# Administrative Credentials
AUTH_SECRET="your_super_secret_session_key"
ADMIN_EMAIL="admin@thevichaarcouncil.in"
```

### 4. Database Setup & Seeding
```bash
# Push schema to SQLite database
npx prisma db push

# Seed institutional assemblies, initiatives, research, leadership & admin account
node scripts/seed.mjs
```

Default Admin Credentials:
- **Email:** `admin@thevichaarcouncil.in`
- **Password:** `CouncilAdmin@2026!`

### 5. Running the Application
```bash
# Run in development mode
npm run dev

# Or build for production
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) to view the website.

---

## 💳 Cashfree Payments Configuration

The integration supports both **Sandbox Simulation** (for immediate zero-credential local testing) and **Live Cashfree PG API**:

1. **Sandbox Testing:**
   - Log in to [Cashfree DevStudio](https://www.cashfree.com/devstudio/) and create sandbox API keys.
   - Set `CASHFREE_CLIENT_ID` and `CASHFREE_CLIENT_SECRET` in `.env`.
   - Set `CASHFREE_ENV=SANDBOX`.
2. **Production Activation:**
   - Complete merchant KYC on Cashfree Production Dashboard.
   - Set `CASHFREE_ENV=PRODUCTION` in production environment variables.
   - Configure Webhook URL in Cashfree dashboard pointing to `https://thevichaarcouncil.in/api/webhooks/cashfree`.
   - Set `CASHFREE_WEBHOOK_SECRET` matching the Cashfree dashboard.
3. **Refunds:**
   - Authorized admins can trigger partial or full refunds directly from `/admin/payments`.
   - The system calls Cashfree's `/pg/orders/{order_id}/refunds` endpoint and logs an audit trail.

---

## 🧪 Verification & Automated Testing

Run the test suite to verify the database, Cashfree client, and complimentary admissions:
```bash
node scripts/test-workflow.mjs
```

All 9/9 core workflow assertions pass.

---

## 📜 Intellectual Property & Institutional Notice
© 2026 THE VICHAAR COUNCIL. All rights reserved.  
*Where Ideas Earn Their Weight.*
