import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-warmwhite text-charcoal flex items-center justify-center py-20 px-4">
      <div className="max-w-md text-center border border-charcoal/15 bg-white p-10 rounded-sm shadow-sm">
        <span className="eyebrow text-crimson mb-2 block">Error 404</span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-charcoal">
          Chamber Not Found
        </h1>
        <div className="citrus-rule mx-auto my-6" />
        <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed mb-8">
          The requested docket, resolution, or institutional page does not exist or has been archived by the Secretariat.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/"
            className="border border-citrus bg-citrus px-6 py-3 text-xs font-bold tracking-widest text-ink uppercase rounded-xs hover:bg-navy hover:text-warmwhite transition-colors"
          >
            Return to Homepage ↗
          </Link>
          <Link
            href="/events"
            className="border border-charcoal/20 px-6 py-3 text-xs font-bold tracking-widest text-charcoal uppercase rounded-xs hover:border-charcoal transition-colors"
          >
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}
