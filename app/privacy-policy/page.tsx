import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | The Vichaar Council",
  description: "Official Privacy Policy of The Vichaar Council regarding data protection and delegate privacy."
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-xs text-mutedgrey uppercase tracking-wider mb-8">
          Last Updated: November 2026 · Compliant with the Digital Personal Data Protection Act (DPDP), India
        </p>

        <div className="prose prose-sm max-w-none text-charcoal/80 space-y-6 leading-relaxed">
          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">1. Institutional Commitment</h2>
            <p>
              The Vichaar Council (&ldquo;the Council&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is an independent youth-led intellectual institution. We are committed to safeguarding the privacy and digital sovereignty of all delegates, scholars, and visitors who interact with our official digital platform.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">2. Information We Collect</h2>
            <p>We collect only the minimal data strictly necessary for assembly coordination and statutory compliance:</p>
            <ul className="list-disc list-inside space-y-1 text-xs pl-2">
              <li><strong>Delegate Identity:</strong> Full name, institutional affiliation, email address, contact phone number, and city.</li>
              <li><strong>Transaction Data:</strong> Order reference IDs, registration numbers, ticket category, and timestamp. (We never store debit/credit card numbers, CVVs, or UPI PINs; all payments are processed through Cashfree Payments).</li>
              <li><strong>Correspondence:</strong> Messages and contact requests transmitted through our official forms.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">3. Payment Processing via Cashfree</h2>
            <p>
              When you register for paid events, transactions are securely handled by <strong>Cashfree Payments</strong>, an authorized payment aggregator compliant with PCI-DSS Level 1 standards and Reserve Bank of India (RBI) guidelines. Your banking credentials remain exclusively with the payment processor and are never accessible to Council personnel.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">4. Data Sharing & Third Parties</h2>
            <p>
              We do not sell, rent, monetize, or trade delegate information with commercial advertisers or political campaign entities. Information is accessed solely by authorized Secretariat members for event operations.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">5. Grievance Redressal</h2>
            <p>
              For any privacy concerns or data erasure requests, please contact the Data Protection Officer at <strong>privacy@thevichaarcouncil.in</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
