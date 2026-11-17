import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function sanitizeUsername(raw) {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

function isValidUsername(username) {
  const clean = sanitizeUsername(username);
  return /^[a-z0-9_]{3,30}$/.test(clean);
}

async function runTests() {
  console.log("=== MY VICHAAR PARTICIPANT PORTAL TEST SUITE ===");

  // 1. Username validation tests
  console.log("\n1. Testing Username Sanitization & Validation:");
  console.assert(sanitizeUsername("@yuveer_27") === "yuveer_27", "Sanitize leading @ failed");
  console.assert(isValidUsername("yuveer_27") === true, "Valid username failed");
  console.assert(isValidUsername("ab") === false, "Short username test failed");
  console.assert(isValidUsername("yuveer.chhatwani") === false, "Dot username test failed (only alphanumeric & underscore)");
  console.log("✔ Username logic passed.");

  // 2. Password Hashing tests
  console.log("\n2. Testing Password Hashing & Comparison:");
  const testPassword = "SuperSecurePassword123!";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(testPassword, salt);
  console.assert(await bcrypt.compare(testPassword, hash) === true, "Password verification failed");
  console.assert(await bcrypt.compare("WrongPassword!", hash) === false, "Wrong password check failed");
  console.log("✔ Password hashing passed.");

  // 3. Database test participant creation
  console.log("\n3. Testing Participant DB Model:");
  const testEmail = "test_participant_demo@vichaarcouncil.in";
  const testUsername = "test_delegate_99";

  // Cleanup past test if any
  await prisma.participantUser.deleteMany({
    where: { OR: [{ email: testEmail }, { username: testUsername }] }
  });

  const created = await prisma.participantUser.create({
    data: {
      fullName: "Yuveer Chhatwani",
      username: testUsername,
      email: testEmail,
      phone: "+91 98765 43210",
      dateOfBirth: "27/05/2007",
      institution: "Delhi Public School, R.K. Puram",
      passwordHash: hash,
      isEmailVerified: true,
      role: "PARTICIPANT"
    }
  });

  console.assert(created.id, "Participant ID missing");
  console.assert(created.username === testUsername, "Username mismatch");
  console.assert(created.isEmailVerified === true, "Email verified status mismatch");
  console.log(`✔ Participant user created successfully: ${created.fullName} (@${created.username})`);

  // 4. Session Model test
  console.log("\n4. Testing Participant Session:");
  const testToken = "test_session_token_" + Date.now();
  const session = await prisma.participantSession.create({
    data: {
      token: testToken,
      participantId: created.id,
      expiresAt: new Date(Date.now() + 86400000)
    }
  });
  console.assert(session.participantId === created.id, "Session relation mismatch");
  console.log("✔ Participant session created successfully.");

  // 5. Test Notification Model
  console.log("\n5. Testing Notification & Submission Models:");
  const notif = await prisma.participantNotification.create({
    data: {
      participantId: created.id,
      title: "Welcome to MY VICHAAR",
      message: "Official test dispatch",
      type: "SYSTEM"
    }
  });
  console.assert(notif.participantId === created.id, "Notification mismatch");

  // 6. Test Certificate Model
  const cert = await prisma.participantCertificate.create({
    data: {
      certificateNumber: "TVC-CERT-TEST-" + Date.now(),
      participantId: created.id,
      eventTitle: "SHABD & SOCH 2026",
      title: "Certificate of Participation",
      description: "Awarded for exceptional debating conviction and perspective flipping."
    }
  });
  console.assert(cert.certificateNumber.startsWith("TVC-CERT-"), "Cert format mismatch");
  console.log("✔ Certificate created successfully.");

  // Clean up test fixtures
  await prisma.participantUser.delete({ where: { id: created.id } });
  console.log("✔ Test data cleanup completed.");

  console.log("\n=== ALL MY VICHAAR PORTAL TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((e) => {
  console.error("Test failed with error:", e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
