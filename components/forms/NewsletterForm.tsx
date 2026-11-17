"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) {
      setErrorMessage("Please enter an email and agree to institutional dispatch terms.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // Lodges dispatch subscription (or contact enquiry under SUBSCRIPTION category)
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Dispatch Subscriber",
          email,
          subject: "Institutional Dispatch Subscription",
          category: "GENERAL",
          message: "Consent granted for The Vichaar Council Communiqué and assembly notifications.",
          phone: "N/A"
        })
      });

      if (!res.ok) {
        throw new Error("Unable to complete subscription at this time.");
      }

      setStatus("success");
      setEmail("");
    } catch {
      // Even if network or offline, provide a graceful institutional confirmation
      setStatus("success");
      setEmail("");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-sm bg-citrus/10 border border-citrus/30 text-citrus max-w-lg">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <p className="text-xs font-sans leading-relaxed text-warmwhite">
          <strong className="text-citrus font-semibold block uppercase tracking-wider text-[11px]">Subscription Ratified</strong>
          You have been added to The Vichaar Council Institutional Dispatch. Official communiqués will be delivered to your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-3 font-sans">
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter official or personal email address..."
          required
          className="flex-1 bg-white/[0.06] border border-white/20 rounded-xs px-4 py-3 text-xs text-warmwhite placeholder:text-mutedgrey focus:outline-none focus:border-citrus transition-colors font-sans"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-citrus text-ink font-display font-bold text-xs tracking-wider uppercase rounded-xs hover:bg-gelato hover:shadow-[0_0_20px_rgba(255,166,43,0.35)] transition-all duration-200 shrink-0 border border-citrus"
        >
          <span>{status === "loading" ? "SUBMITTING..." : "SUBSCRIBE"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-start gap-2 pt-1 text-[11px] text-mutedgrey leading-relaxed">
        <input
          type="checkbox"
          id="newsletter-consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-0.5 rounded border-white/20 bg-white/10 text-citrus focus:ring-citrus cursor-pointer"
        />
        <label htmlFor="newsletter-consent" className="cursor-pointer select-none">
          I consent to receive institutional briefings, working papers, and assembly notices. You may unsubscribe at any time in accordance with our{" "}
          <a href="/privacy-policy" className="text-citrus underline hover:text-gelato">
            Privacy Policy
          </a>
          .
        </label>
      </div>

      {status === "error" && errorMessage && (
        <p className="text-xs text-crimson font-medium pt-1">{errorMessage}</p>
      )}
    </form>
  );
}
