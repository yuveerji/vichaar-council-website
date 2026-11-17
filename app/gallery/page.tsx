import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "Visual Archive & Gallery | The Vichaar Council",
  description: "Photographic archive of parliamentary assemblies, debates, conclaves, and seminars of The Vichaar Council."
};

export const revalidate = 60;

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: "asc" }
  });

  return (
    <div className="bg-warmwhite text-charcoal">
      {/* Header */}
      <section className="bg-navy text-warmwhite pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="container-shell relative z-10 max-w-4xl">
          <p className="eyebrow text-citrus mb-3">Institutional Photographic Record</p>
          <h1 className="font-editorial text-5xl sm:text-6xl font-bold leading-tight">
            Visual Archive
          </h1>
          <p className="mt-5 text-base text-mutedgrey leading-relaxed">
            Moments of passionate inquiry, parliamentary division, and high-level diplomatic deliberations
            captured across Council gatherings in India.
          </p>
        </div>
      </section>

      {/* Gallery Grid or Empty State */}
      <section className="py-24">
        <div className="container-shell">
          {images.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
              {images.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-sm border border-charcoal/15 bg-navy shadow-sm"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={item.imageUrl || "/assets/homepage_background.png"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/20 to-transparent opacity-80" />
                    
                    <div className="absolute top-4 left-4">
                      <span className="px-2.5 py-1 text-[10px] font-sans font-semibold tracking-widest uppercase bg-navy/90 text-citrus border border-citrus/30 rounded-xs">
                        {item.category}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-warmwhite">
                      {item.eventTag && (
                        <span className="text-[10px] font-sans tracking-wider text-mutedgrey uppercase block mb-1">
                          {item.eventTag} {item.date ? `· ${item.date}` : ""}
                        </span>
                      )}
                      <h3 className="font-display text-xl sm:text-2xl font-semibold leading-snug">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-xs text-mutedgrey mt-2 line-clamp-2 font-sans font-normal">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-charcoal/15 bg-white p-12 sm:p-16 rounded-sm text-center max-w-2xl mx-auto shadow-sm">
              <span className="font-editorial text-3xl text-charcoal block font-medium">
                Explore moments from the Council&apos;s activities as our archive grows.
              </span>
              <p className="mt-4 text-sm text-charcoal/70 leading-relaxed font-sans font-normal max-w-lg mx-auto">
                Official photographic records, conference plenaries, and press galleries will be curated here following each ratified parliamentary assembly.
              </p>
              <div className="mt-8">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 border border-charcoal bg-charcoal px-6 py-3 text-xs font-sans font-semibold tracking-wider text-warmwhite hover:bg-citrus hover:text-ink hover:border-citrus transition-colors uppercase rounded-xs"
                >
                  Return to Homepage →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
