"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, Lock, ArrowRight, Loader2, XCircle } from "lucide-react";
import FirebaseGoogleButton from "@/components/ui/FirebaseGoogleButton";

export default function ParticipantLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/my-vichaar/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password })
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || "Invalid username/email or password.");
          return;
        }

        router.push("/my-vichaar/dashboard");
        router.refresh();
      } catch {
        setErrorMessage("Network error. Please check your connection and try again.");
      }
    });
  };

  return (
    <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="pb-6 mb-6 border-b border-white/10">
        <span className="text-[11px] uppercase tracking-[0.2em] text-citrus font-semibold">
          PARTICIPANT ACCESS
        </span>
        <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-wide mt-1">
          Sign In to MY VICHAAR
        </h2>
        <p className="text-xs text-warmwhite/60 mt-1">
          Access your digital passes, conference submissions, and certifications.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Firebase Google Authentication Button */}
      <div className="mb-6">
        <FirebaseGoogleButton mode="login" />
      </div>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative bg-[#0B1526] px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-warmwhite/40">
          Or sign in with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-medium mb-1.5">
            Email Address or @Username
          </label>
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmwhite/40" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="name@institution.edu or @username"
              className="w-full pl-10 pr-4 py-3 bg-[#080E1A] border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-citrus transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-medium">
              Password
            </label>
            <Link
              href="/my-vichaar/forgot-password"
              className="text-xs text-citrus/80 hover:text-citrus transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmwhite/40" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-4 py-3 bg-[#080E1A] border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-citrus transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 px-6 rounded-xl bg-citrus hover:bg-[#FFA62B]/90 text-[#070E1A] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-citrus/20 hover:shadow-citrus/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-6 text-center border-t border-white/10">
          <p className="text-xs text-warmwhite/60">
            Don't have an official account yet?{" "}
            <Link
              href="/my-vichaar/register"
              className="text-citrus font-semibold hover:underline ml-1"
            >
              Create Account for Free →
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
