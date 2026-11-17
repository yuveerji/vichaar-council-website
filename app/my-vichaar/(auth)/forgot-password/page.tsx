"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await fetch("/api/my-vichaar/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      <div className="pb-6 mb-6 border-b border-white/10">
        <span className="text-[11px] uppercase tracking-[0.2em] text-citrus font-semibold">
          ACCOUNT SECURITY
        </span>
        <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-wide mt-1">
          Reset Password
        </h2>
        <p className="text-xs text-warmwhite/60 mt-1">
          Enter your registered email address and we will provide password recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-6 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Recovery Link Sent</h3>
            <p className="text-xs text-warmwhite/70 max-w-sm mx-auto mt-2 leading-relaxed">
              If an account is associated with <span className="text-white font-medium">{email}</span>, a secure password reset link has been dispatched.
            </p>
          </div>
          <Link
            href="/my-vichaar/login"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-citrus font-bold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-medium mb-1.5">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmwhite/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu"
                className="w-full pl-10 pr-4 py-3 bg-[#080E1A] border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-citrus transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-citrus hover:bg-[#FFA62B]/90 text-[#070E1A] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-citrus/20 transition-all"
          >
            <span>Send Reset Instructions</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-4 text-center border-t border-white/10">
            <Link
              href="/my-vichaar/login"
              className="inline-flex items-center gap-1.5 text-xs text-warmwhite/60 hover:text-citrus transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
