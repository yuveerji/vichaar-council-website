"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import VichaarLogo from "@/components/VichaarLogo";
import FirebaseGoogleButton from "@/components/ui/FirebaseGoogleButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@thevichaarcouncil.in");
  const [password, setPassword] = useState("CouncilAdmin@2026!");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authenticate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-deep text-warmwhite flex items-center justify-center p-4 relative overflow-hidden">
      <div className="hero-grid absolute inset-0 opacity-30" />

      <div className="w-full max-w-md border border-navy-border bg-navy p-8 sm:p-10 rounded-sm shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <VichaarLogo
              variant="auth"
              size={64}
              dropShadow
            />
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-warmwhite">
            THE VICHAAR COUNCIL
          </h1>
          <span className="text-[10px] font-bold tracking-[0.24em] text-citrus uppercase block mt-1">
            Secretariat & Admin Portal
          </span>
          <p className="text-xs text-mutedgrey mt-2">
            Restricted access for authorised Council administrators and finance personnel.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-950/80 border border-red-500/50 text-red-200 text-xs rounded-xs">
            {errorMessage}
          </div>
        )}

        {/* Founder & Admin Google Authentication */}
        <div className="mb-5">
          <FirebaseGoogleButton mode="admin" />
        </div>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-navy-border" />
          </div>
          <span className="relative bg-navy px-3 text-[9px] font-mono uppercase tracking-[0.2em] text-mutedgrey">
            Or continue with credentials
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
              Institutional Email or Username
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@thevichaarcouncil.in or chhatwani"
              className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs placeholder:text-mutedgrey/40"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full border border-citrus bg-citrus py-3 text-xs font-bold tracking-[0.2em] text-ink transition-all hover:bg-warmwhite hover:text-navy uppercase rounded-xs shadow-gold disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "Authenticating..." : "Sign In to Secretariat ↗"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-navy-border text-center text-xs text-mutedgrey">
          <Link href="/" className="hover:text-citrus transition-colors">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
