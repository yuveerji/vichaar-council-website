import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "Our Initiatives | The Vichaar Council",
  description: "Explore the official initiatives, parliamentary simulations, research labs, and diplomatic conclaves of The Vichaar Council."
};

export const revalidate = 60;

export default async function InitiativesPage() {
  const initiatives = await prisma.initiative.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: "asc" }
  });

  return (
    <div className="bg-warmwhite text-charcoal">
      {/* Header */}
      <section className="bg-navy text-warmwhite pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="container-shell relative z-10 max-w-4xl">
          <p className="eyebrow text-citrus mb-3">Programs of Intellectual Engagement</p>
          <h1 className="font-editorial text-5xl sm:text-6xl font-bold leading-tight">
            Our Initiatives
          </h1>
          <p className="mt-5 text-base text-mutedgrey leading-relaxed">
            From simulation of constitutional assemblies to semester-long policy research labs,
            discover the structured programs through which The Vichaar Council trains the next generation.
          </p>
        </div>
      </section>

      {/* Grid or Empty State */}
      <section className="py-24">
        <div className="container-shell">
          {initiatives.length > 0 ? (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {initiatives.map((init, index) => (
                <div
                  key={init.id}
                  className="card-lift flex flex-col justify-between border border-charcoal/15 bg-white rounded-sm overflow-hidden shadow-sm"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy">
                      <Image
                        src={init.coverImage || "/assets/homepage_background.png"}
                        alt={init.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[10px] font-sans font-semibold tracking-widest uppercase bg-navy/90 text-citrus border border-citrus/30">
                          {init.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-7">
                      <span className="text-[10px] tracking-widest text-mutedgrey uppercase font-mono">
                        Initiative 0{index + 1}
                      </span>
                      <h2 className="font-display text-2xl font-semibold text-charcoal mt-2 mb-3 leading-snug">
                        <Link href={`/initiatives/${init.slug}`} className="hover:text-crimson transition-colors">
                          {init.title}
                        </Link>
                      </h2>
                      <p className="text-xs leading-relaxed text-charcoal/70 font-sans font-normal">
                        {init.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-7 pt-0 border-t border-charcoal/10 flex items-center justify-between font-sans">
                    <span className="text-[10px] tracking-wider text-mutedgrey uppercase font-semibold">
                      Status: {init.status}
                    </span>
                    <Link
                      href={`/initiatives/${init.slug}`}
                      className="border border-charcoal px-4 py-2 text-[10px] font-semibold tracking-widest text-charcoal hover:bg-citrus hover:text-ink hover:border-citrus transition-colors uppercase rounded-xs"
                    >
                      Examine Initiative ↗
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-charcoal/15 bg-white p-12 sm:p-16 rounded-sm text-center max-w-2xl mx-auto shadow-sm">
              <span className="font-editorial text-3xl text-charcoal block font-medium">
                Our initiatives will be featured here as they are announced.
              </span>
              <p className="mt-4 text-sm text-charcoal/70 leading-relaxed font-sans font-normal max-w-lg mx-auto">
                The Vichaar Council is currently formulating its programmatic curriculum across parliamentary simulation, constitutional jurisprudence, and public policy working groups.
              </p>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-charcoal bg-charcoal px-6 py-3 text-xs font-sans font-semibold tracking-wider text-warmwhite hover:bg-citrus hover:text-ink hover:border-citrus transition-colors uppercase rounded-xs"
                >
                  Contact Secretariat Regarding Initiatives ↗
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
