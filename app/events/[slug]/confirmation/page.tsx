"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

interface ConfirmationPageProps {
  params: Promise<{ slug: string }>;
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const isFree = searchParams.get("is_free") === "true";
  const regNo = searchParams.get("reg_no");
  const statusParam = searchParams.get("status");
  const delegateName = searchParams.get("name");
  const amountParam = searchParams.get("amount");
  const utrParam = searchParams.get("utr");
  const channelParam = searchParams.get("channel");

  const isPendingUtr = statusParam === "pending";
  const isInstitutional = channelParam === "institutional";

  const [loading, setLoading] = useState(!isFree && !isPendingUtr);
  const [error, setError] = useState("");
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    if (isPendingUtr) {
      setReceiptData({
        registrationNumber: regNo || "TVC-2026-PENDING",
        fullName: delegateName || (isInstitutional ? "Registered School Delegation" : "Registered Delegate"),
        eventTitle: "SHABD & SOCH: A Full-Day Debate & Social Experience",
        ticketName: isInstitutional ? "Institutional Delegation Pass" : (channelParam === "team" ? "Team Debate Pass (2 Delegates)" : "Delegate Pass (Classes 7–12)"),
        amountPaid: Number(amountParam) || 549.0,
        currency: "INR",
        paymentMethod: "UPI_UTR_VERIFICATION",
        orderId: orderId || "TVC-ORD-PENDING",
        bankReference: utrParam || "UTR Provided",
        confirmedAt: new Date().toISOString(),
        isPending: true
      });
      setLoading(false);
      return;
    }

    if (isFree) {
      setReceiptData({
        registrationNumber: regNo || "TVC-FREE-CONFIRMED",
        fullName: "Registered Delegate",
        eventTitle: "The Vichaar Council Assembly",
        amountPaid: 0.0,
        currency: "INR",
        paymentMethod: "COMPLIMENTARY",
        bankReference: "N/A",
        confirmedAt: new Date().toISOString(),
        isPending: false
      });
      return;
    }

    if (!orderId) {
      setError("No valid order reference was supplied.");
      setLoading(false);
      return;
    }

    async function verifyOrder() {
      try {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to verify transaction status.");
        }

        if (data.status === "SUCCESS") {
          setReceiptData({ ...data.registration, isPending: false });
        } else {
          setError(data.message || `Payment status is currently ${data.status}.`);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred during payment verification.");
      } finally {
        setLoading(false);
      }
    }

    verifyOrder();
  }, [orderId, isFree, regNo, isPendingUtr, delegateName, amountParam, utrParam]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-warmwhite text-charcoal min-h-screen pt-32 sm:pt-40 pb-24 font-sans">
      <div className="container-shell max-w-2xl">
        {loading ? (
          <div className="border border-charcoal/15 bg-white p-12 text-center rounded-sm shadow-md">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-citrus border-t-transparent mb-4"></div>
            <h2 className="font-editorial text-2xl font-bold text-charcoal">
              Verifying Payment Transaction...
            </h2>
            <p className="text-xs text-charcoal/60 mt-2">
              Reconciling institutional transaction records and securing your delegate credentials.
            </p>
          </div>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 p-8 text-center rounded-sm">
            <span className="text-3xl block mb-2">⚠️</span>
            <h2 className="font-editorial text-2xl font-bold text-red-900">
              Payment Verification Pending
            </h2>
            <p className="text-xs text-red-700 mt-2 max-w-md mx-auto">{error}</p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href={`/events/${slug}`}
                className="border border-charcoal px-5 py-2 text-xs font-bold tracking-widest text-charcoal uppercase rounded-xs"
              >
                Back to Event
              </Link>
              <Link
                href="/contact"
                className="border border-citrus bg-citrus px-5 py-2 text-xs font-bold tracking-widest text-ink uppercase rounded-xs"
              >
                Contact Support
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Banner */}
            {receiptData?.isPending ? (
              <div className="bg-navy border-l-4 border-citrus text-warmwhite p-6 rounded-sm shadow-md">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-citrus">⏳</span>
                  <div>
                    <h1 className="font-editorial text-2xl font-bold text-white">
                      Registration Submitted · Payment Verification Pending
                    </h1>
                    <p className="text-xs text-warmwhite/80 mt-1">
                      Your registration and UTR transaction reference have been recorded. Our Secretariat is verifying
                      your payment with bank records.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-800 text-warmwhite p-6 rounded-sm text-center shadow-md">
                <span className="text-3xl block mb-1">✓</span>
                <h1 className="font-editorial text-3xl font-bold">
                  Registration Confirmed
                </h1>
                <p className="text-xs text-emerald-100 mt-1">
                  Your credentials have been recorded in the Council Assembly Roll.
                </p>
              </div>
            )}

            {/* Official Confirmation Receipt (Printable) */}
            <div className="border border-charcoal/20 bg-white p-8 sm:p-10 rounded-sm shadow-lg print:border-none print:shadow-none print:p-0">
              {/* Receipt Header */}
              <div className="border-b-2 border-charcoal pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-editorial text-2xl font-bold text-charcoal block">
                    THE VICHAAR COUNCIL
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.24em] text-crimson uppercase">
                    {isInstitutional
                      ? "Official Institutional Delegation Voucher"
                      : "Official Delegate Admission Voucher"}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-mutedgrey block">
                    {isInstitutional ? "Delegation Ref Number" : "Registration Number"}
                  </span>
                  <span className="font-mono text-base font-bold text-charcoal">
                    {receiptData?.registrationNumber}
                  </span>
                </div>
              </div>

              {/* Receipt Body & QR Section */}
              <div className="grid gap-6 sm:grid-cols-3 text-xs py-2 items-center">
                <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-mutedgrey block text-[10px] uppercase tracking-wider">
                      {isInstitutional ? "School / Institution" : "Delegate Name"}
                    </span>
                    <span className="font-bold text-charcoal text-sm">{receiptData?.fullName}</span>
                  </div>

                  <div>
                    <span className="text-mutedgrey block text-[10px] uppercase tracking-wider">Event Assembly</span>
                    <span className="font-bold text-charcoal text-sm">{receiptData?.eventTitle}</span>
                  </div>

                  <div>
                    <span className="text-mutedgrey block text-[10px] uppercase tracking-wider">Pass Category</span>
                    <span className="font-semibold text-charcoal">{receiptData?.ticketName || "Delegate Pass (Classes 7–12)"}</span>
                  </div>

                  <div>
                    <span className="text-mutedgrey block text-[10px] uppercase tracking-wider">Transaction Amount</span>
                    <span className="font-editorial text-lg font-bold text-charcoal">
                      {receiptData?.amountPaid === 0 ? "Complimentary (₹0)" : `₹${receiptData?.amountPaid} ${receiptData?.currency || "INR"}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-mutedgrey block text-[10px] uppercase tracking-wider">Payment Reference / UTR</span>
                    <span className="font-mono text-charcoal/80 font-bold">{receiptData?.bankReference || receiptData?.orderId || "N/A"}</span>
                  </div>

                  <div>
                    <span className="text-mutedgrey block text-[10px] uppercase tracking-wider">Submission Date</span>
                    <span className="text-charcoal/80">
                      {new Date(receiptData?.confirmedAt || Date.now()).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Scannable Real QR SVG on Admission Voucher */}
                <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-charcoal/15 bg-white text-center shadow-xs">
                  <QRCodeSVG
                    value={`${typeof window !== "undefined" ? window.location.origin : "https://thevichaarcouncil.in"}/verify?reg=${encodeURIComponent(receiptData?.registrationNumber || "")}`}
                    size={95}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "/assets/vichaar-logo.png",
                      height: 20,
                      width: 20,
                      excavate: true
                    }}
                  />
                  <span className="text-[8px] font-mono font-bold tracking-tight text-charcoal/80 mt-1.5 uppercase">
                    SCAN TO VERIFY PASS
                  </span>
                </div>
              </div>

              {/* Security & Verification Watermark */}
              <div className="mt-8 pt-6 border-t border-charcoal/10 flex items-center justify-between text-[10px] text-mutedgrey">
                <div>
                  <p className="font-semibold text-charcoal">The Vichaar Council Secretariat</p>
                  <p>Admissions &amp; Academic Accreditation Roll</p>
                </div>
                <div className="text-right">
                  {receiptData?.isPending ? (
                    <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-800 font-bold uppercase rounded-xs">
                      STATUS: PENDING VERIFICATION
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold uppercase rounded-xs">
                      STATUS: CONFIRMED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="border border-charcoal bg-charcoal px-5 py-2.5 text-xs font-bold tracking-widest text-warmwhite hover:bg-citrus hover:text-ink uppercase rounded-xs transition-colors"
                >
                  🖨️ Print Voucher
                </button>
                <Link
                  href="/my-vichaar/tickets"
                  className="border border-citrus bg-citrus px-5 py-2.5 text-xs font-bold tracking-widest text-ink hover:bg-citrus/90 uppercase rounded-xs transition-colors"
                >
                  View in MY VICHAAR Passes →
                </Link>
              </div>
              <Link
                href="/events"
                className="text-xs font-bold text-charcoal hover:underline uppercase"
              >
                ← Return to Events Calendar
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
