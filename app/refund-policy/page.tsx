import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | The Vichaar Council",
  description: "Official cancellation, postponement, and refund policy for event registrations processed via Cashfree Payments."
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-warmwhite text-charcoal min-h-screen pt-32 pb-16 sm:pt-36 sm:pb-24">
      <div className="container-shell max-w-3xl">
        <Link
          href="/"
          className="text-[10px] tracking-widest text-citrus hover:underline uppercase mb-8 inline-block font-semibold"
        >
          ← Return to Home
        </Link>

        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-charcoal mb-4">
          Cancellation & Refund Policy
        </h1>
        <p className="text-xs text-mutedgrey uppercase tracking-wider mb-8">
          Official Payment Gateway Policy · Governing Cashfree Transactions
        </p>

        <div className="prose prose-sm max-w-none text-charcoal/80 space-y-6 leading-relaxed">
          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">1. Scope of Policy</h2>
            <p>
              This Cancellation and Refund Policy applies to all paid event registrations, delegate passes, observer fees, and publication fees collected through our official payment gateway partner, <strong>Cashfree Payments</strong>, denominated in Indian Rupees (INR ₹).
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">2. Delegate-Initiated Cancellations</h2>
            <ul className="list-disc list-inside space-y-2 text-xs pl-2">
              <li>
                <strong>Cancellations 7+ Days Prior:</strong> If a registered delegate requests cancellation at least seven (7) full calendar days prior to the published event commencement date, a full refund of the ticket fee will be processed, less applicable third-party payment gateway transaction charges (typically 2–3%).
              </li>
              <li>
                <strong>Cancellations Within 7 Days:</strong> Due to committed institutional logistics (venue allocations, printed delegate dockets, catering commitments), cancellations requested less than seven (7) days prior to the event are non-refundable. However, delegate pass transfers to an eligible substitute scholar may be permitted with prior written approval from the Secretariat.
              </li>
              <li>
                <strong>No-Shows:</strong> Failure to attend the assembly without prior written notice shall not be eligible for any refund.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">3. Council-Initiated Postponements or Cancellations</h2>
            <p>
              In the rare event that The Vichaar Council must postpone or cancel an assembly due to unforeseen administrative constraints, force majeure, or statutory directives:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs pl-2">
              <li>Delegates will be offered the option to transfer their admission to the rescheduled date.</li>
              <li>Delegates who cannot attend the rescheduled date may request a 100% full refund of the fee paid.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">4. Mode and Timeline of Refund</h2>
            <p>
              Approved refunds are initiated through Cashfree Payments back to the original funding source (original UPI ID, bank account, or debit/credit card). Refund processing times generally range from <strong>5 to 7 business banking days</strong> depending on the acquiring bank.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">5. How to Initiate a Refund Request</h2>
            <p>
              To request a cancellation and refund, email the Admissions Secretariat at <strong>events@thevichaarcouncil.in</strong> with:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs pl-2">
              <li>Your Official Registration Number (e.g. <code>TVC-2026-XXXXX</code>).</li>
              <li>Cashfree Order ID / Transaction Reference.</li>
              <li>Reason for cancellation.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
