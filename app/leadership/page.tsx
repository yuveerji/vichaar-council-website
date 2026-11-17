import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "Leadership | The Vichaar Council",
  description: "Meet the Executive Directorate, Academic Council, and Youth Secretariat of The Vichaar Council."
};

export const revalidate = 60;

export default async function LeadershipPage() {
  const leaders = await prisma.leadershipProfile.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: "asc" }
  });

  const executiveBoard = leaders.filter((l) => l.category === "EXECUTIVE_BOARD");
  const academicCouncil = leaders.filter((l) => l.category === "ACADEMIC_COUNCIL");
  const secretariat = leaders.filter((l) => l.category === "SECRETARIAT");

  return (
    <div className="bg-warmwhite text-charcoal">
      {/* Header */}
      <section className="bg-navy text-warmwhite pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="container-shell relative z-10 max-w-4xl">
          <p className="eyebrow text-citrus mb-3">Institutional Stewardship</p>
          <h1 className="font-editorial text-5xl sm:text-6xl font-bold leading-tight">
            Council Leadership
          </h1>
          <p className="mt-5 text-base text-mutedgrey leading-relaxed">
            The Vichaar Council is stewarded by an independent assembly of student leaders,
            academic fellows, and legal scholars dedicated to intellectual rigor and institutional excellence.
          </p>
        </div>
      </section>

      {/* Leadership Sections or Empty State */}
      <section className="py-24 space-y-20">
        <div className="container-shell">
          {leaders.length > 0 ? (
            <>
              {/* Executive Directorate */}
              {executiveBoard.length > 0 && (
                <div className="mb-16">
                  <div className="border-b border-charcoal/15 pb-4 mb-10">
                    <span className="eyebrow text-crimson font-sans">Governance</span>
                    <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mt-1">
                      Executive Directorate
                    </h2>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {executiveBoard.map((leader) => (
                      <div key={leader.id} className="border border-charcoal/15 bg-white p-8 rounded-sm shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-citrus/40 bg-navy text-2xl font-bold font-display text-citrus shadow-sm">
                            {leader.fullName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <h3 className="font-display text-2xl font-semibold text-charcoal">{leader.fullName}</h3>
                          <p className="text-xs font-semibold text-crimson uppercase tracking-wider mt-1 font-sans">{leader.roleTitle}</p>
                          <p className="mt-4 text-xs leading-relaxed text-charcoal/75 font-sans font-normal">{leader.bio}</p>
                        </div>
                        {leader.linkedinUrl && (
                          <div className="mt-6 pt-4 border-t border-charcoal/10 font-sans">
                            <a
                              href={leader.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-citrus hover:underline uppercase"
                            >
                              Institutional Profile ↗
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Academic & Research Council */}
              {academicCouncil.length > 0 && (
                <div className="mb-16">
                  <div className="border-b border-charcoal/15 pb-4 mb-10">
                    <span className="eyebrow text-amalfi font-sans">Scholarship</span>
                    <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mt-1">
                      Academic & Research Council
                    </h2>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {academicCouncil.map((leader) => (
                      <div key={leader.id} className="border border-charcoal/15 bg-white p-8 rounded-sm shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amalfi/40 bg-navy text-2xl font-bold font-display text-seabreeze shadow-sm">
                            {leader.fullName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <h3 className="font-display text-2xl font-semibold text-charcoal">{leader.fullName}</h3>
                          <p className="text-xs font-semibold text-amalfi uppercase tracking-wider mt-1 font-sans">{leader.roleTitle}</p>
                          <p className="mt-4 text-xs leading-relaxed text-charcoal/75 font-sans font-normal">{leader.bio}</p>
                        </div>
                        {leader.linkedinUrl && (
                          <div className="mt-6 pt-4 border-t border-charcoal/10 font-sans">
                            <a
                              href={leader.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-amalfi hover:underline uppercase"
                            >
                              Academic Profile ↗
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secretariat */}
              {secretariat.length > 0 && (
                <div>
                  <div className="border-b border-charcoal/15 pb-4 mb-10">
                    <span className="eyebrow text-citrus font-sans">Operations & Diplomacy</span>
                    <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mt-1">
                      Secretariat Directorate
                    </h2>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {secretariat.map((leader) => (
                      <div key={leader.id} className="border border-charcoal/15 bg-white p-8 rounded-sm shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-citrus/40 bg-navy text-2xl font-bold font-display text-citrus shadow-sm">
                            {leader.fullName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <h3 className="font-display text-2xl font-semibold text-charcoal">{leader.fullName}</h3>
                          <p className="text-xs font-semibold text-citrus uppercase tracking-wider mt-1 font-sans">{leader.roleTitle}</p>
                          <p className="mt-4 text-xs leading-relaxed text-charcoal/75 font-sans font-normal">{leader.bio}</p>
                        </div>
                        {leader.linkedinUrl && (
                          <div className="mt-6 pt-4 border-t border-charcoal/10 font-sans">
                            <a
                              href={leader.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-citrus hover:underline uppercase"
                            >
                              Diplomatic Credentials ↗
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="border border-charcoal/15 bg-white p-12 sm:p-16 rounded-sm text-center max-w-2xl mx-auto shadow-sm">
              <span className="font-editorial text-3xl text-charcoal block font-medium">
                Official leadership information will be announced here.
              </span>
              <p className="mt-4 text-sm text-charcoal/70 leading-relaxed font-sans font-normal max-w-lg mx-auto">
                The governing body, academic advisory council, and student secretariats are currently being appointed for the forthcoming institutional session.
              </p>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-charcoal bg-charcoal px-6 py-3 text-xs font-sans font-semibold tracking-wider text-warmwhite hover:bg-citrus hover:text-ink hover:border-citrus transition-colors uppercase rounded-xs"
                >
                  Contact Secretariat Administration ↗
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
