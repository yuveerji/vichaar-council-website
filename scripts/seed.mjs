import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedShabdSoch } from "./seed-shabd-soch.mjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=== THE VICHAAR COUNCIL: ESSENTIAL SYSTEM INITIALIZATION ===");

  // 1. Genuine Administrator Account Setup
  const defaultAdminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@thevichaarcouncil.in";
  const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "CouncilAdmin@2026!";
  const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: defaultAdminEmail },
    update: { passwordHash },
    create: {
      email: defaultAdminEmail,
      name: "Senior Secretariat Director",
      passwordHash,
      role: "SUPER_ADMIN"
    }
  });
  console.log("[INITIALIZED] Super Administrator account:", admin.email);

  // 2. Institutional Site Settings (Genuine Configuration Only)
  const siteSettings = [
    { key: "site_name", value: "The Vichaar Council" },
    { key: "site_tagline", value: "Where Ideas Earn Their Weight." },
    { key: "contact_email", value: "contact@thevichaarcouncil.in" },
    { key: "official_address", value: "The Vichaar Council, Udaipur, Rajasthan, India" },
    { key: "phone_number", value: "+91 73573 37067" },
    { key: "registration_currency", value: "INR" }
  ];

  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value }
    });
  }
  console.log(`[INITIALIZED] ${siteSettings.length} verified institutional site settings.`);

  // 3. Official Confirmed Assemblies & Events
  await seedShabdSoch();

  console.log("Production initialization complete. Genuine institutional records seeded.");
}

main()
  .catch((e) => {
    console.error("Initialization error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
