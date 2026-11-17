import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "Research & Publications | The Vichaar Council",
  description: "Explore policy analyses, constitutional commentaries, and philosophical research papers published by The Vichaar Council."
};

export const revalidate = 60;

export default async function ResearchDirectoryPage() {
  const publications = await prisma.publication.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" }
  });

  return (
    <div className="bg-warmwhite text-charcoal">
      {/* Header */}
      <section className="bg-navy text-warmwhite pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="container-shell relative z-10 max-w-4xl">
          <p className="eyebrow text-citrus mb-3">Discourse India Journal · Working Papers</p>
          <h1 className="font-editorial text-5xl sm:text-6xl font-bold leading-tight">
            Research & Publications
          </h1>
          <p className="mt-5 text-base text-mutedgrey leading-relaxed">
            The intellectual journal of The Vichaar Council. Rigorous essays, empirical investigations,
            and constitutional critiques advancing non-partisan public understanding.
          </p>
        </div>
      </section>

      {/* Articles Grid or Empty State */}
      <section className="py-24">
        <div className="container-shell max-w-5xl">
          {publications.length > 0 ? (
            <div className="space-y-12">
              {publications.map((pub) => (
                <article
                  key={pub.id}
                  className="border-b border-charcoal/15 pb-12 grid gap-6 md:grid-cols-[1fr_2.5fr] items-start"
                >
                  <div>
                    <span className="eyebrow text-amalfi block mb-1 font-sans">{pub.categoryName}</span>
                    <span className="text-xs text-mutedgrey block font-mono">{pub.readTimeMinutes} min read</span>
                    <span className="text-xs text-charcoal/60 block mt-2 font-sans">
                      {new Date(pub.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal leading-snug">
                      <Link href={`/research/${pub.slug}`} className="hover:text-amalfi transition-colors">
                        {pub.title}
                      </Link>
                    </h2>

                    {pub.subtitle && (
                      <p className="mt-2 text-sm italic font-editorial text-charcoal/70 font-normal">
                        &ldquo;{pub.subtitle}&rdquo;
                      </p>
                    )}

                    <p className="mt-4 text-xs sm:text-sm leading-relaxed text-charcoal/75 line-clamp-3 font-sans font-normal">
                      {pub.content.replace(/###/g, "").slice(0, 220)}...
                    </p>

                    <div className="mt-6 flex items-center justify-between font-sans">
                      <div>
                        <span className="text-xs font-semibold text-charcoal block">{pub.authorName}</span>
                        <span className="text-[10px] text-mutedgrey block">{pub.authorRole}</span>
                      </div>

                      <Link
                        href={`/research/${pub.slug}`}
                        className="border-b border-charcoal pb-0.5 text-xs font-semibold tracking-widest text-charcoal hover:text-amalfi hover:border-amalfi transition-colors uppercase"
                      >
                        Read Full Working Paper ↗
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-charcoal/15 bg-white p-12 sm:p-16 rounded-sm text-center max-w-2xl mx-auto shadow-sm">
              <span className="font-editorial text-3xl text-charcoal block font-medium">
                New perspectives and publications will be featured here.
              </span>
              <p className="mt-4 text-sm text-charcoal/70 leading-relaxed font-sans font-normal max-w-lg mx-auto">
                The inaugural edition of Discourse India Journal and policy working papers are undergoing peer review by our editorial board.
              </p>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-amalfi text-amalfi hover:bg-amalfi hover:text-warmwhite px-6 py-3 text-xs font-sans font-semibold tracking-wider transition-colors uppercase rounded-xs"
                >
                  Submit Research Proposal or Paper ↗
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
