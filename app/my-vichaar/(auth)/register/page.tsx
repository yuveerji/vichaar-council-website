"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, AtSign, Mail, Phone, Calendar, Building2, Lock, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import InstitutionalDatePicker from "@/components/ui/InstitutionalDatePicker";
import FirebaseGoogleButton from "@/components/ui/FirebaseGoogleButton";

export default function ParticipantRegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 7 core fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [institution, setInstitution] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [usernameMessage, setUsernameMessage] = useState("");

  // Form submission state
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Debounced username availability check
  useEffect(() => {
    const clean = username.trim().replace(/^@+/, "").toLowerCase();
    if (!clean) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    if (clean.length < 3) {
      setUsernameStatus("unavailable");
      setUsernameMessage("Username must be at least 3 characters.");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      setUsernameStatus("unavailable");
      setUsernameMessage("Only lowercase letters, numbers, and underscores allowed.");
      return;
    }

    setUsernameStatus("checking");
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/my-vichaar/auth/check-username?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus("available");
          setUsernameMessage("Username is available!");
        } else {
          setUsernameStatus("unavailable");
          setUsernameMessage(data.message || "Username is unavailable.");
        }
      } catch {
        setUsernameStatus("unavailable");
        setUsernameMessage("Could not verify username availability.");
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!agreeTerms) {
      setErrorMessage("You must agree to the Terms of Participation and Privacy Policy.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (usernameStatus === "unavailable") {
      setErrorMessage("Please choose a valid and available @username.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/my-vichaar/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            username,
            email,
            phone,
            dateOfBirth,
            institution,
            password,
            confirmPassword,
            agreeTerms
          })
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || "Failed to create account. Please check your entries.");
          return;
        }

        setSuccessMessage("Account created! A 6-digit verification code has been dispatched to your email...");
        setTimeout(() => {
          router.push("/my-vichaar/verify-email");
          router.refresh();
        }, 1200);
      } catch {
        setErrorMessage("Network error. Please check your connection and try again.");
      }
    });
  };

  return (
    <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Top accent badge */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-citrus font-semibold">
            OFFICIAL ADMISSION
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-wide mt-1">
            Create Your Account
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-emerald-400 font-medium px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-full">
            100% Free
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Firebase Google One-Click Registration */}
      <div className="mb-6">
        <FirebaseGoogleButton mode="register" />
      </div>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative bg-[#0B1526] px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-warmwhite/40">
          Or register with full details
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Full Name */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-medium mb-1.5">
            1. Full Name <span className="text-citrus">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmwhite/40" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Yuveer Chhatwani"
              className="w-full pl-10 pr-4 py-3 bg-[#080E1A] border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-citrus transition-colors"
            />
          </div>
        </div>

        {/* 2. Username (@system) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-medium">
              2. Username <span className="text-citrus">*</span>
            </label>
            {usernameStatus === "checking" && (
              <span className="text-[11px] text-white/50 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin text-citrus" /> Checking...
              </span>
            )}
            {usernameStatus === "available" && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Available
              </span>
            )}
            {usernameStatus === "unavailable" && (
              <span className="text-[11px] text-red-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> {usernameMessage}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-citrus font-semibold text-sm">
              @
            </span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="e.g. yuveer_27"
              className={`w-full pl-9 pr-10 py-3 bg-[#080E1A] border rounded-xl text-white placeholder-white/30 text-sm focus:outline-none transition-colors ${
                usernameStatus === "available"
                  ? "border-emerald-500/60 focus:border-emerald-400"
                  : usernameStatus === "unavailable"
                  ? "border-red-500/60 focus:border-red-400"
                  : "border-white/15 focus:border-citrus"
              }`}
            />
            {usernameStatus === "available" && (
              <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            )}
          </div>
          <p className="text-[11px] text-warmwhite/50 mt-1">
            Your unique Council identifier for passes, publications, and certificates.
          </p>
        </div>

        {/* 3. Email Address & 4. Phone Number (2 columns on sm+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-medium mb-1.5">
              3. Email Address <span className="text-citrus">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmwhite/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#080E1A] border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-citrus transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-medium mb-1.5">
              4. Phone Number <span className="text-citrus">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmwhite/40" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 bg-[#080E1A] border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-citrus transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 5. Date of Birth & 6. Institution (2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <InstitutionalDatePicker
              label="5. Date of Birth"
              required
              value={dateOfBirth}
              onChange={(val) => setDateOfBirth(val)}
              placeholder="Select Date of Birth"
              minYear={2003}
              maxYear={2015}
              theme="dark"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-medium mb-1.5">
              6. School / Institution <span className="text-citrus">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmwhite/40" />
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Modern School, Barakhamba"
                className="w-full pl-10 pr-4 py-3 bg-[#080E1A] border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-citrus transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 7. Create Password & Confirm Password (2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-medium mb-1.5">
              7. Create Password <span className="text-citrus">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmwhite/40" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full pl-10 pr-4 py-3 bg-[#080E1A] border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-citrus transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-medium mb-1.5">
              Confirm Password <span className="text-citrus">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmwhite/40" />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full pl-10 pr-4 py-3 bg-[#080E1A] border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-citrus transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-[#080E1A] text-citrus focus:ring-citrus/40"
            />
            <span className="text-xs text-warmwhite/70 leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-citrus underline hover:text-white">
                Terms of Participation
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-citrus underline hover:text-white">
                Privacy Policy
              </Link>{" "}
              of The Vichaar Council.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 px-6 rounded-xl bg-citrus hover:bg-[#FFA62B]/90 text-[#070E1A] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-citrus/20 hover:shadow-citrus/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Official Account...</span>
            </>
          ) : (
            <>
              <span>Create My Vichaar Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Sign In Alternative */}
        <div className="pt-4 text-center border-t border-white/10">
          <p className="text-xs text-warmwhite/60">
            Already have an official participant account?{" "}
            <Link
              href="/my-vichaar/login"
              className="text-citrus font-semibold hover:underline ml-1"
            >
              Sign In to MY VICHAAR →
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
