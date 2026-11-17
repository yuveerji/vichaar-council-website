import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | The Vichaar Council",
  description: "Terms and conditions governing use of the platform and assembly participation."
};

export default function TermsPage() {
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
          Terms & Conditions
        </h1>
        <p className="text-xs text-mutedgrey uppercase tracking-wider mb-8">
          Effective: November 2026 · Governing Official Participation
        </p>

        <div className="prose prose-sm max-w-none text-charcoal/80 space-y-6 leading-relaxed">
          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing this platform, registering for assemblies, or participating in Council initiatives, you agree to comply with and be bound by these official Terms & Conditions and the Council Delegate Code of Conduct.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">2. Delegate Code of Conduct</h2>
            <p>
              The Vichaar Council is a forum dedicated to constructive, civilized disagreement. Verbal abuse, personal ad hominem attacks, incitement to hatred, harassment, or deliberate disruption of assembly proceedings will result in immediate disqualification and revocation of admission without refund.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">3. Intellectual Property</h2>
            <p>
              All policy white papers, working papers, and articles published by The Vichaar Council are protected by intellectual property laws. Authors retain moral ownership, while the Council retains non-exclusive rights to publish and distribute materials for educational and institutional purposes.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">4. Event Registrations & Fees</h2>
            <p>
              All prices are stated in Indian Rupees (INR ₹). Admissions are confirmed only upon successful verification of payment via our authorized gateway, Cashfree Payments.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-2xl font-bold text-charcoal mb-2">5. Jurisdiction</h2>
            <p>
              Any disputes arising out of participation in Council events shall be subject to the exclusive jurisdiction of the competent courts in Udaipur, Rajasthan, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
