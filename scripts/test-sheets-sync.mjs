const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyfpgJ_G17p5j0HMxhfm3RFUs-QY6etPbiTWhiZKI3zcbRE-EOmbgwJAxDchH12DLnYPQ/exec";

async function testSync() {
  console.log("=== TESTING LIVE GOOGLE SHEETS MASTER DATABASE SYNC ===");

  // 1. Health check GET
  console.log("\n1. Testing GET Webhook Endpoint:");
  const getRes = await fetch(WEBHOOK_URL);
  const getJson = await getRes.json();
  console.log("Response:", getJson);
  console.assert(getJson.status === "ONLINE", "Expected ONLINE status");
  console.log("✔ GET endpoint healthy and responsive.");

  // 2. Test syncing a participant record (POST sync_participant)
  console.log("\n2. Testing POST sync_participant (PARTICIPANTS tab):");
  const testParticipant = {
    action: "sync_participant",
    data: {
      full_name: "Yuveer Chhatwani",
      username: "yuveer_27",
      email: "yuveer@example.com",
      phone: "+91 73573 37067",
      date_of_birth: "27/05/2007",
      institution_name: "The Vichaar Council Youth Academy",
      grade_or_year: "Class 12th",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      is_email_verified: true,
      account_status: "ACTIVE"
    }
  };

  const partRes = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(testParticipant)
  });
  const partJson = await partRes.json();
  console.log("Participant Sync Result:", partJson);
  console.assert(partJson.success === true, "Participant sync failed");
  console.log(`✔ Participant record inserted with ID: ${partJson.participant_id}`);

  // 3. Test syncing an event registration (POST sync_registration)
  console.log("\n3. Testing POST sync_registration (REGISTRATIONS + TICKETS tabs):");
  const testReg = {
    action: "sync_registration",
    data: {
      registration_number: "TVC-2026-94812",
      event_id: "EVT-SHABD-SOCH-2026",
      event_title: "SHABD & SOCH",
      registration_type: "INDIVIDUAL_DELEGATE",
      participant_id: partJson.participant_id,
      participant_name: "Yuveer Chhatwani",
      email: "yuveer@example.com",
      phone: "+91 73573 37067",
      institution_name: "The Vichaar Council Youth Academy",
      pass_category: "Delegate Pass (Classes 7th to 12th)",
      total_amount_inr: 549,
      payment_status: "SUCCESS"
    }
  };

  const regRes = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(testReg)
  });
  const regJson = await regRes.json();
  console.log("Registration Sync Result:", regJson);
  console.assert(regJson.success === true, "Registration sync failed");
  console.log(`✔ Registration and Ticket pass created with Ticket Code: ${regJson.ticket_code}`);

  // 4. Test syncing payment (POST sync_payment)
  console.log("\n4. Testing POST sync_payment (PAYMENTS tab):");
  const testPayment = {
    action: "sync_payment",
    data: {
      order_id: "order_tvc_live_test_01",
      registration_number: "TVC-2026-94812",
      participant_name: "Yuveer Chhatwani",
      payer_email: "yuveer@example.com",
      payer_phone: "+91 73573 37067",
      amount_inr: 549,
      payment_method: "UPI",
      payment_status: "SUCCESS",
      bank_reference: "UPI/392819283912/REF"
    }
  };

  const payRes = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(testPayment)
  });
  const payJson = await payRes.json();
  console.log("Payment Sync Result:", payJson);
  console.assert(payJson.success === true, "Payment sync failed");
  console.log(`✔ Payment record recorded with ID: ${payJson.payment_id}`);

  console.log("\n=== ALL GOOGLE SHEETS LIVE SYNC OPERATIONS SUCCEEDED! ===");
}

testSync().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
