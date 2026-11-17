import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pub = await prisma.publication.findUnique({ where: { slug } });
  if (!pub) return { title: "Article Not Found" };
  return {
    title: `${pub.title} | The Vichaar Council Journal`,
    description: pub.subtitle || pub.title
  };
}

export default async function PublicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const publication = await prisma.publication.findUnique({
    where: { slug }
  });

  if (!publication || publication.status !== "PUBLISHED") {
    notFound();
  }

  let citations: string[] = [];
  try {
    if (publication.citationsJson) citations = JSON.parse(publication.citationsJson);
  } catch {}

  return (
    <article className="bg-warmwhite text-charcoal min-h-screen pt-32 pb-16 sm:pt-36 sm:pb-24">
      <div className="container-shell max-w-3xl">
        {/* Navigation */}
        <Link
          href="/research"
          className="text-[10px] tracking-widest text-amalfi hover:underline uppercase mb-8 inline-block font-semibold"
        >
          ← Back to Journal & Working Papers
        </Link>

        {/* Header */}
        <header className="border-b border-charcoal/15 pb-8 mb-10">
          <div className="flex items-center gap-3 text-xs text-amalfi font-bold uppercase tracking-wider mb-3">
            <span>{publication.categoryName}</span>
            <span>•</span>
            <span>{publication.readTimeMinutes} min read</span>
            <span>•</span>
            <span className="text-charcoal/60 font-normal">
              {new Date(publication.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-charcoal leading-tight">
            {publication.title}
          </h1>

          {publication.subtitle && (
            <p className="mt-4 font-editorial text-xl italic text-charcoal/80 leading-relaxed">
              &ldquo;{publication.subtitle}&rdquo;
            </p>
          )}

          {/* Author Box */}
          <div className="mt-8 pt-6 border-t border-charcoal/10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-warmwhite font-editorial text-lg font-bold">
              {publication.authorName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <span className="font-bold text-sm text-charcoal block">{publication.authorName}</span>
              <span className="text-xs text-mutedgrey block">{publication.authorRole}</span>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <div className="prose prose-lg max-w-none text-charcoal/85 space-y-6 text-base sm:text-lg leading-relaxed font-serif">
          {publication.content.split("\n\n").map((section, idx) => {
            if (section.startsWith("### ")) {
              return (
                <h2 key={idx} className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal pt-6">
                  {section.replace("### ", "")}
                </h2>
              );
            }
            return <p key={idx}>{section}</p>;
          })}
        </div>

        {/* Citations & References */}
        {citations.length > 0 && (
          <div className="mt-16 pt-8 border-t border-charcoal/15">
            <h3 className="font-editorial text-2xl font-bold text-charcoal mb-4">
              References & Citations
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-charcoal/70">
              {citations.map((cite, i) => (
                <li key={i} className="pl-2">{cite}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Share & Engage */}
        <div className="mt-16 bg-navy text-warmwhite p-8 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-editorial text-2xl font-bold block">Submit a Research Paper</span>
            <span className="text-xs text-mutedgrey">The Vichaar Council welcomes original manuscripts on constitutional and economic policy.</span>
          </div>
          <Link
            href="/contact"
            className="border border-citrus bg-citrus px-6 py-3 text-xs font-bold tracking-widest text-ink hover:bg-warmwhite uppercase rounded-xs shrink-0"
          >
            Editorial Submission ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
