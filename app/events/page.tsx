import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "Events & Assemblies | The Vichaar Council",
  description: "Browse upcoming assemblies, parliamentary simulations, and diplomatic conclaves. Official delegate registrations."
};

export const revalidate = 60;

export default async function EventsDirectoryPage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: { tickets: true },
    orderBy: { startDate: "asc" }
  });

  return (
    <div className="bg-warmwhite text-charcoal">
      {/* Header */}
      <section className="bg-navy text-warmwhite pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="container-shell relative z-10 max-w-4xl">
          <p className="eyebrow text-citrus mb-3">Assemblies · Debates · Deliberative Forums</p>
          <h1 className="font-editorial text-5xl sm:text-6xl font-bold leading-tight">
            Official Assemblies & Events
          </h1>
          <p className="mt-5 text-base text-mutedgrey leading-relaxed">
            Where ideas earn their weight through disciplined dialogue. Discover our upcoming assemblies,
            parliamentary simulations, and youth diplomatic conclaves. Official delegate registrations processed securely via Cashfree Payments.
          </p>
        </div>
      </section>

      {/* Events List or Empty State */}
      <section className="py-24">
        <div className="container-shell">
          {events.length > 0 ? (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {events.map((evt) => {
                const minPrice = evt.tickets.length > 0 ? Math.min(...evt.tickets.map((t) => t.price)) : 0;
                const isFree = minPrice === 0;

                return (
                  <div
                    key={evt.id}
                    className="card-lift flex flex-col justify-between border border-charcoal/15 bg-white rounded-sm overflow-hidden shadow-sm"
                  >
                    <div>
                      {/* Cover Image */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy">
                        <Image
                          src={evt.coverImage || "/assets/homepage_background.png"}
                          alt={evt.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 text-[10px] font-sans font-semibold tracking-widest uppercase bg-navy/90 text-citrus border border-citrus/30">
                            {evt.categoryName || "Assembly"}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`px-2.5 py-1 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-xs ${
                            evt.status === "REGISTRATION_OPEN"
                              ? "bg-emerald-600 text-white"
                              : "bg-navy text-mutedgrey"
                          }`}>
                            {evt.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <div className="p-7">
                        <div className="flex items-center gap-3 text-xs text-charcoal/60 mb-2 font-sans font-normal">
                          <span>📅 {new Date(evt.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          <span>•</span>
                          <span>📍 {evt.city}</span>
                        </div>

                        <h2 className="font-display text-2xl font-semibold text-charcoal mt-1 mb-3 leading-snug">
                          <Link href={`/events/${evt.slug}`} className="hover:text-crimson transition-colors">
                            {evt.title}
                          </Link>
                        </h2>

                        <p className="text-xs leading-relaxed text-charcoal/70 line-clamp-3 font-sans font-normal">
                          {evt.summary}
                        </p>

                        <div className="mt-5 pt-4 border-t border-charcoal/5 flex flex-wrap gap-2 text-[11px] text-charcoal/80 font-sans font-normal">
                          <span className="bg-warmwhite px-2 py-1 rounded border border-charcoal/10">Format: {evt.format.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-7 pt-0 border-t border-charcoal/10 flex items-center justify-between font-sans">
                      <div>
                        <span className="block text-[9px] tracking-wider text-mutedgrey uppercase font-semibold">Registration Fee</span>
                        <span className="font-editorial text-xl font-semibold text-charcoal">
                          {isFree ? "Complimentary" : `₹${minPrice} onwards`}
                        </span>
                      </div>

                      <Link
                        href={`/events/${evt.slug}`}
                        className="border border-charcoal bg-charcoal px-5 py-2.5 text-[10px] font-semibold tracking-widest text-warmwhite hover:bg-citrus hover:text-ink hover:border-citrus transition-colors uppercase rounded-xs"
                      >
                        View & Register ↗
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-charcoal/15 bg-white p-12 sm:p-16 rounded-sm text-center max-w-2xl mx-auto shadow-sm">
              <span className="font-editorial text-3xl text-charcoal block font-medium">
                No upcoming events at the moment.
              </span>
              <p className="mt-4 text-sm text-charcoal/70 leading-relaxed font-sans font-normal max-w-lg mx-auto">
                Official assembly dates, delegate admissions, and parliamentary session schedules will be announced here once ratified by the Secretariat.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-charcoal bg-charcoal px-6 py-3 text-xs font-sans font-semibold tracking-wider text-warmwhite hover:bg-citrus hover:text-ink hover:border-citrus transition-colors uppercase rounded-xs"
                >
                  Contact Secretariat Regarding Assemblies ↗
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
