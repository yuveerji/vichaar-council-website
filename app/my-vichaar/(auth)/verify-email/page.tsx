"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles
} from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryToken = searchParams.get("token");
  const queryCode = searchParams.get("code") || searchParams.get("otp");
  const queryEmail = searchParams.get("email");

  // Participant & Email state
  const [userEmail, setUserEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // OTP State: 6 digits
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Feedback & Timers
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Pre-fill email and code from query parameters
  useEffect(() => {
    if (queryEmail && !userEmail) {
      setUserEmail(queryEmail);
      const [namePart, domainPart] = queryEmail.split("@");
      if (domainPart) {
        const masked =
          namePart.length > 2
            ? `${namePart[0]}${"*".repeat(Math.max(1, namePart.length - 2))}${namePart[namePart.length - 1]}@${domainPart}`
            : `${namePart}@${domainPart}`;
        setMaskedEmail(masked);
      }
    }

    if (queryCode && queryCode.length === 6) {
      setOtp(queryCode.split(""));
    }
  }, [queryEmail, queryCode]);

  // 1. Handle Direct Token from Verification Email Button
  useEffect(() => {
    if (!queryToken) return;

    async function verifyLinkToken() {
      setIsVerifying(true);
      setErrorMessage("");
      setInfoMessage("Authenticating official verification token from email...");

      try {
        const res = await fetch("/api/my-vichaar/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: queryToken,
            email: queryEmail || userEmail || undefined
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setIsVerified(true);
          setInfoMessage("");
        } else {
          setErrorMessage(data.error || "The verification link is invalid or has expired.");
          setInfoMessage("");
        }
      } catch {
        setErrorMessage("Could not connect to verify link. Please try entering the code manually.");
        setInfoMessage("");
      } finally {
        setIsVerifying(false);
      }
    }

    verifyLinkToken();
  }, [queryToken, queryEmail]);

  // 2. Fetch current participant info on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/my-vichaar/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUserEmail(data.user.email);
            setIsLoggedIn(true);

            // If already verified, update state directly
            if (data.user.isEmailVerified) {
              setIsVerified(true);
              setInitialLoading(false);
              return;
            }

            const [namePart, domainPart] = data.user.email.split("@");
            const masked =
              namePart.length > 2
                ? `${namePart[0]}${"*".repeat(Math.max(1, namePart.length - 2))}${namePart[namePart.length - 1]}@${domainPart}`
                : `${namePart}@${domainPart}`;
            setMaskedEmail(masked);
          }
        }
      } catch {
        // guest mode
      } finally {
        setInitialLoading(false);
      }
    }
    loadUser();
  }, []);

  // 3. Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // 4. Dispatch OTP function
  const handleSendOtp = async (targetEmail?: string) => {
    const emailToSend = targetEmail || userEmail;
    if (!emailToSend) {
      setErrorMessage("Please specify an email address to receive the verification code.");
      return;
    }

    setIsSendingOtp(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/my-vichaar/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch verification code.");
      }

      if (data.alreadyVerified) {
        setIsVerified(true);
        return;
      }

      setInfoMessage(data.message || "A 6-digit verification code has been dispatched to your email.");
      setCooldown(60); // 60 seconds cooldown

      if (data.maskedEmail) {
        setMaskedEmail(data.maskedEmail);
      }

      // Focus first input box
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not dispatch code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 5. Handle OTP box changes
  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, "");

    const newOtp = [...otp];
    newOtp[index] = cleanVal ? cleanVal[cleanVal.length - 1] : "";
    setOtp(newOtp);
    setErrorMessage("");

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const combined = newOtp.join("");
    if (combined.length === 6) {
      triggerVerification(combined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim().replace(/[^0-9]/g, "");
    if (!pasteData) return;

    const digits = pasteData.slice(0, 6).split("");
    const newOtp = ["", "", "", "", "", ""];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();

    if (digits.length === 6) {
      triggerVerification(digits.join(""));
    }
  };

  // 6. Submit verification
  const triggerVerification = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otp.join("");
    if (finalCode.length !== 6) {
      setErrorMessage("Please enter all 6 digits of your verification code.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/my-vichaar/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail || undefined,
          otp: finalCode
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      setIsVerified(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid or expired verification code.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-12 text-center text-warmwhite">
        <Loader2 className="w-8 h-8 animate-spin text-citrus mx-auto mb-3" />
        <p className="text-xs text-warmwhite/60">Verifying session credentials...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center text-warmwhite max-w-lg mx-auto">
      {/* Institutional Top Emblem */}
      <div className="w-14 h-14 rounded-full bg-citrus/10 border border-citrus/30 text-citrus flex items-center justify-center mx-auto mb-4 shadow-inner">
        <ShieldCheck className="w-7 h-7" />
      </div>

      <div className="text-[11px] uppercase tracking-[0.22em] text-citrus font-bold mb-1">
        THE VICHAAR COUNCIL · MY VICHAAR
      </div>
      <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-wide">
        Official Email Verification
      </h2>

      {isVerified ? (
        /* Verified Success View */
        <div className="mt-8 p-6 sm:p-8 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 animate-in fade-in-50 zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            Email Verified Successfully
          </h3>
          <p className="text-xs text-emerald-300/80 mt-2 leading-relaxed max-w-sm mx-auto">
            Your institutional credentials are confirmed. A confirmation activation email has been dispatched to your inbox.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/my-vichaar/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-citrus hover:bg-citrus/90 text-navy font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <span>Go to Portal Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/my-vichaar/profile"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs uppercase tracking-wider transition-all border border-white/10"
            >
              <span>View Profile</span>
            </Link>
          </div>
        </div>
      ) : (
        /* OTP Input & Dispatch View */
        <div className="mt-6">
          <p className="text-xs text-warmwhite/70 max-w-sm mx-auto leading-relaxed">
            {maskedEmail ? (
              <>
                A verification link and 6-digit code have been dispatched to{" "}
                <span className="text-white font-semibold font-mono">{maskedEmail}</span>.
              </>
            ) : (
              "Enter your registered institutional email to receive your official verification link and 6-digit code."
            )}
          </p>

          {/* Email input field if not logged in */}
          {!isLoggedIn && (
            <div className="mt-5 text-left">
              <label className="block text-[11px] uppercase tracking-wider text-warmwhite/80 font-medium mb-1.5">
                Participant Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmwhite/40" />
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full pl-10 pr-4 py-3 bg-[#080E1A] border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-citrus transition-colors"
                />
              </div>
            </div>
          )}

          {/* Error & Info Alerts */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center justify-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-citrus/10 border border-citrus/30 text-citrus text-xs flex items-center justify-center gap-2 text-left">
              <Sparkles className="w-4 h-4 text-citrus shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* 6 Digit Numeric Boxes */}
          <div className="mt-6">
            <label className="block text-[11px] uppercase tracking-widest text-warmwhite/60 font-semibold mb-3">
              Enter 6-Digit Verification Code
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold bg-[#080E1A] text-citrus border border-white/20 rounded-xl focus:outline-none focus:border-citrus focus:ring-2 focus:ring-citrus/20 transition-all shadow-inner"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => triggerVerification()}
              disabled={isVerifying || otp.join("").length !== 6}
              className="w-full py-3.5 px-6 rounded-xl bg-citrus hover:bg-citrus/90 text-[#070E1A] font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-citrus/20 transition-all disabled:opacity-40 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Credentials</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend OTP Button with Cooldown */}
            <div className="flex items-center justify-between text-xs text-warmwhite/60 pt-2 px-1">
              <span>Didn't receive the email code?</span>
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={isSendingOtp || cooldown > 0}
                className="font-semibold text-citrus hover:text-white transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : cooldown > 0 ? (
                  <span>Resend in {cooldown}s</span>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Links */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-warmwhite/50">
            <Link
              href="/my-vichaar/dashboard"
              className="hover:text-warmwhite transition-colors"
            >
              ← Return to Dashboard
            </Link>
            <Link
              href="/contact"
              className="hover:text-citrus transition-colors"
            >
              Need Secretariat Help?
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-12 text-center text-warmwhite max-w-lg mx-auto">
          <Loader2 className="w-8 h-8 animate-spin text-citrus mx-auto mb-3" />
          <p className="text-xs text-warmwhite/60">Loading verification portal...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
