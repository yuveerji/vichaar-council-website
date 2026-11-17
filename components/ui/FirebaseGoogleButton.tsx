"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogleFirebase } from "@/lib/firebase";
import { Loader2, AlertCircle } from "lucide-react";

interface FirebaseGoogleButtonProps {
  mode?: "login" | "register" | "admin";
  redirectTo?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export default function FirebaseGoogleButton({
  mode = "login",
  redirectTo,
  className = "",
  onSuccess,
  onError
}: FirebaseGoogleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Firebase Google Authentication via Popup
      const googleUser = await signInWithGoogleFirebase();

      // 2. Transmit credentials to server API
      const endpoint =
        mode === "admin"
          ? "/api/admin/auth/firebase-google"
          : "/api/my-vichaar/auth/firebase-google";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleUser.email,
          displayName: googleUser.displayName,
          photoURL: googleUser.photoURL,
          uid: googleUser.uid,
          idToken: googleUser.idToken
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to authenticate with Google.");
      }

      if (onSuccess) {
        onSuccess();
      }

      const destination =
        redirectTo || (mode === "admin" ? "/admin/dashboard" : "/my-vichaar/dashboard");

      router.push(destination);
      router.refresh();
    } catch (err: any) {
      const message = err.message || "Failed to sign in with Google.";
      setErrorMsg(message);
      if (onError) onError(message);
    } finally {
      setLoading(false);
    }
  };

  const buttonText =
    mode === "admin"
      ? "Sign in with Google (Founder / Admin)"
      : mode === "register"
      ? "Sign up with Google"
      : "Continue with Google";

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer border ${
          mode === "admin"
            ? "bg-[#0A1424] hover:bg-[#0E1C33] border-amber-500/30 text-amber-200 hover:border-amber-400 shadow-md"
            : "bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300 shadow-sm"
        } ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span className="font-semibold tracking-wide">{loading ? "Connecting to Google..." : buttonText}</span>
      </button>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
