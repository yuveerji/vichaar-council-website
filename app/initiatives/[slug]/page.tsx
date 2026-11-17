import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const init = await prisma.initiative.findUnique({ where: { slug } });
  if (!init) return { title: "Initiative Not Found" };
  return {
    title: `${init.title} | The Vichaar Council Initiatives`,
    description: init.summary
  };
}

export default async function InitiativeDetailPage({ params }: Props) {
  const { slug } = await params;
  const initiative = await prisma.initiative.findUnique({
    where: { slug }
  });

  if (!initiative) {
    notFound();
  }

  // Fetch related events
  const relatedEvents = await prisma.event.findMany({
    where: { isPublished: true },
    take: 2
  });

  return (
    <div className="bg-warmwhite text-charcoal">
      {/* Hero Header */}
      <section className="bg-navy text-warmwhite pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-28 relative overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="container-shell relative z-10 max-w-4xl">
          <Link
            href="/initiatives"
            className="text-[10px] tracking-widest text-citrus hover:underline uppercase mb-6 inline-block font-semibold"
          >
            ← Back to All Initiatives
          </Link>
          <div className="inline-block px-3 py-1 bg-citrus/20 border border-citrus/40 text-citrus text-[10px] font-bold tracking-widest uppercase rounded-xs mb-4">
            {initiative.category}
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl font-bold leading-tight">
            {initiative.title}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-mutedgrey leading-relaxed">
            {initiative.summary}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container-shell max-w-4xl">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-charcoal/15 mb-12 shadow-md">
            <Image
              src={initiative.coverImage || "/assets/homepage_background.png"}
              alt={initiative.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none text-charcoal/85 space-y-6 text-base leading-relaxed">
            {initiative.content.split("\n\n").map((para, idx) => {
              if (para.startsWith("### ")) {
                return (
                  <h3 key={idx} className="font-editorial text-2xl font-bold text-charcoal pt-4">
                    {para.replace("### ", "")}
                  </h3>
                );
              }
              return <p key={idx}>{para}</p>;
            })}
          </div>

          {/* Related Events Section */}
          {relatedEvents.length > 0 && (
            <div className="mt-20 pt-12 border-t border-charcoal/15">
              <h3 className="font-editorial text-3xl font-bold text-charcoal mb-6">
                Related Assemblies & Events
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {relatedEvents.map((evt) => (
                  <div key={evt.id} className="border border-charcoal/15 bg-white p-6 rounded-sm shadow-sm">
                    <span className="text-[10px] tracking-wider text-crimson font-bold uppercase">
                      {evt.categoryName || "Assembly"}
                    </span>
                    <h4 className="font-editorial text-xl font-bold text-charcoal mt-1 mb-2">
                      <Link href={`/events/${evt.slug}`} className="hover:text-crimson">
                        {evt.title}
                      </Link>
                    </h4>
                    <p className="text-xs text-charcoal/70 mb-4 line-clamp-2">{evt.summary}</p>
                    <Link
                      href={`/events/${evt.slug}`}
                      className="text-xs font-bold text-citrus hover:underline uppercase"
                    >
                      View Event & Register ↗
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 bg-navy text-warmwhite p-8 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="font-editorial text-2xl font-bold block">Inquire About This Initiative</span>
              <span className="text-xs text-mutedgrey">For institutional partnerships, campus chapters, and delegate quotas.</span>
            </div>
            <Link
              href="/contact"
              className="border border-citrus bg-citrus px-6 py-3 text-xs font-bold tracking-widest text-ink hover:bg-warmwhite uppercase rounded-xs shrink-0"
            >
              Contact Secretariat ↗
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
