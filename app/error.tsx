"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Institutional Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-warmwhite text-charcoal flex items-center justify-center py-20 px-4">
      <div className="max-w-md text-center border border-charcoal/15 bg-white p-10 rounded-sm shadow-sm">
        <span className="eyebrow text-crimson mb-2 block">System Notice</span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal">
          Deliberation Interrupted
        </h1>
        <div className="red-rule mx-auto my-6" />
        <p className="text-xs text-charcoal/70 leading-relaxed mb-6">
          An unexpected interruption occurred during the processing of this request. The Secretariat has recorded the event diagnostic.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="border border-citrus bg-citrus px-6 py-2.5 text-xs font-bold tracking-widest text-ink uppercase rounded-xs hover:bg-navy hover:text-warmwhite transition-colors"
          >
            Retry Request
          </button>
          <Link
            href="/"
            className="border border-charcoal/20 px-6 py-2.5 text-xs font-bold tracking-widest text-charcoal uppercase rounded-xs hover:border-charcoal transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
