import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact & Institutional Correspondence | The Vichaar Council",
  description: "Official contact directory, secretariat inquiries, institutional partnerships, and correspondence with The Vichaar Council."
};

export default function ContactPage() {
  return (
    <div className="bg-warmwhite text-charcoal">
      {/* Header */}
      <section className="bg-navy text-warmwhite pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="container-shell relative z-10 max-w-4xl">
          <p className="eyebrow text-citrus mb-3">Institutional Correspondence</p>
          <h1 className="font-editorial text-5xl sm:text-6xl font-bold leading-tight">
            Connect With The Council
          </h1>
          <p className="mt-5 text-base text-mutedgrey leading-relaxed">
            For academic partnerships, assembly collaborations, media inquiries, or official correspondence,
            reach out directly to the Secretariat of The Vichaar Council.
          </p>
        </div>
      </section>

      {/* Grid: Details + Contact Form */}
      <section className="py-24">
        <div className="container-shell max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            {/* Left Column: Official Directory */}
            <div className="space-y-10">
              <div>
                <span className="eyebrow text-crimson">Institutional Address</span>
                <h3 className="font-editorial text-2xl font-bold text-charcoal mt-1 mb-3">
                  Secretariat Chambers
                </h3>
                <div className="space-y-4 text-sm text-charcoal/80 leading-relaxed font-sans">
                  <div>
                    <span className="font-semibold text-charcoal block text-xs uppercase tracking-wider text-citrus-hover">Secretariat Headquarters:</span>
                    <p className="mt-0.5 text-base font-medium text-charcoal">
                      The Vichaar Council<br />
                      <span className="text-sm font-normal text-charcoal/80">Udaipur, Rajasthan, India</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-charcoal/10 pt-8">
                <span className="eyebrow text-amalfi">Electronic & Telephonic Directory</span>
                <div className="mt-4 space-y-4 text-xs text-charcoal/80 font-sans">
                  <div>
                    <span className="text-mutedgrey uppercase tracking-wider block text-[10px]">Official Direct Line</span>
                    <a href="tel:+917357337067" className="font-semibold text-charcoal hover:text-citrus text-sm">
                      +91 73573 37067
                    </a>
                  </div>
                  <div>
                    <span className="text-mutedgrey uppercase tracking-wider block text-[10px]">General Secretariat</span>
                    <a href="mailto:contact@thevichaarcouncil.in" className="font-semibold text-charcoal hover:text-amalfi text-sm">
                      contact@thevichaarcouncil.in
                    </a>
                  </div>
                  <div>
                    <span className="text-mutedgrey uppercase tracking-wider block text-[10px]">Assemblies & Admissions</span>
                    <a href="mailto:events@thevichaarcouncil.in" className="font-semibold text-charcoal hover:text-amalfi text-sm">
                      events@thevichaarcouncil.in
                    </a>
                  </div>
                  <div>
                    <span className="text-mutedgrey uppercase tracking-wider block text-[10px]">Research & Publications</span>
                    <a href="mailto:research@thevichaarcouncil.in" className="font-semibold text-charcoal hover:text-amalfi text-sm">
                      research@thevichaarcouncil.in
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-charcoal/10 pt-8">
                <span className="eyebrow text-citrus">Hours of Deliberation</span>
                <p className="mt-2 text-xs text-charcoal/70 leading-relaxed font-sans">
                  Monday to Friday: 09:30 AM – 06:00 PM IST<br />
                  Saturday (Working Assembly Days only): 10:00 AM – 04:00 PM IST<br />
                  Closed on National Holidays.
                </p>
              </div>

              <div className="border border-charcoal/15 bg-white p-6 rounded-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal block mb-1 font-sans">
                  Institutional Transparency Notice
                </span>
                <p className="text-xs text-charcoal/70 leading-relaxed font-sans">
                  The Vichaar Council is an independent youth institution. We do not accept political party sponsorships,
                  nor do we offer commercial promotional branding.
                </p>
              </div>
            </div>

            {/* Right Column: Working Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
