import Link from "next/link";
import Image from "next/image";
import VichaarLogo from "@/components/VichaarLogo";
import { ArrowLeft, ShieldCheck, Award, FileText } from "lucide-react";

export default function MyVichaarAuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070E1A] text-warmwhite flex flex-col justify-between selection:bg-citrus selection:text-[#070E1A]">
      {/* Top Banner on Mobile */}
      <div className="lg:hidden border-b border-white/10 bg-[#0A1424] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <VichaarLogo
            variant="navbar-compact"
            size={34}
            className="shrink-0"
          />
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-citrus font-medium">The Vichaar Council</div>
            <div className="text-sm font-semibold tracking-wide text-white">MY VICHAAR</div>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs text-white/70 hover:text-citrus transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto">
        {/* Left Editorial Brand Panel (Desktop) */}
        <aside className="hidden lg:flex lg:w-5/12 xl:w-4/12 flex-col justify-between p-12 xl:p-16 border-r border-white/10 bg-gradient-to-b from-[#0A1424] via-[#0E1B30] to-[#070E1A] relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-citrus/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-72 h-72 bg-crimson/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3.5 group mb-12">
              <VichaarLogo
                variant="auth"
                size={44}
                className="shrink-0 group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="block text-[11px] tracking-[0.25em] uppercase text-warmwhite/70 font-medium">
                  THE
                </span>
                <span className="block text-[18px] tracking-[0.08em] font-editorial uppercase font-semibold text-white group-hover:text-gelato transition-colors">
                  VICHAAR COUNCIL
                </span>
              </div>
            </Link>

            <div className="space-y-4">
              <span className="inline-block text-xs uppercase tracking-[0.25em] text-citrus font-semibold px-3 py-1 bg-citrus/10 border border-citrus/20 rounded-full">
                PARTICIPANT PORTAL
              </span>
              <h1 className="text-3xl xl:text-4xl font-editorial font-bold text-white tracking-wide leading-tight">
                MY VICHAAR
              </h1>
              <p className="text-sm font-editorial italic text-citrus tracking-wider text-opacity-90">
                YOUR SPACE. YOUR IDEAS. YOUR JOURNEY.
              </p>
              <p className="text-sm text-warmwhite/70 leading-relaxed pt-2">
                The institutional digital platform of The Vichaar Council. Manage your event registrations, digital delegate credentials, research papers, and verified certifications in one dedicated space.
              </p>
            </div>
          </div>

          {/* Middle Pillars */}
          <div className="relative z-10 space-y-5 my-10 border-t border-b border-white/10 py-8">
            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-citrus" />
              </div>
              <div>
                <div className="text-xs uppercase font-semibold tracking-wider text-white">One Account, Every Experience</div>
                <div className="text-xs text-warmwhite/60 mt-0.5">Free personal account with zero subscription or tier barriers.</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs uppercase font-semibold tracking-wider text-white">Authentic Credentials</div>
                <div className="text-xs text-warmwhite/60 mt-0.5">Instant delegate passes, QR check-ins, and institutional certificates.</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <div className="text-xs uppercase font-semibold tracking-wider text-white">Intellectual Submissions</div>
                <div className="text-xs text-warmwhite/60 mt-0.5">Direct pipeline to Council journals and policy discourse forums.</div>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-warmwhite/50 border-t border-white/5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-warmwhite/70 hover:text-citrus transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Vichaar Council</span>
            </Link>
            <span>v1.0 Institutional</span>
          </div>
        </aside>

        {/* Right Form Card Panel */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 xl:p-16">
          <div className="w-full max-w-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
