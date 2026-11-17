"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, CheckCircle2, Download, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";

export default function ParticipantCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/my-vichaar/profile");
        const json = await res.json();
        if (res.ok) {
          setCertificates(json.certificates || []);
        }
      } catch (e) {
        console.error("Error loading certificates:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-citrus" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <span className="text-[11px] uppercase tracking-[0.2em] text-citrus font-semibold">
          ACADEMIC RECOGNITION
        </span>
        <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-wide mt-1">
          Certificates of Merit & Participation
        </h1>
        <p className="text-xs text-warmwhite/60 mt-1">
          Cryptographically signed, tamper-evident institutional certificates issued by The Vichaar Council.
        </p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-citrus/40 transition-colors shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <span className="text-xs font-mono text-citrus font-semibold">
                    {cert.certificateNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Verifiable
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-6 h-6 text-citrus" />
                  <h2 className="text-xl font-editorial font-bold text-white">
                    {cert.title}
                  </h2>
                </div>

                <div className="text-sm font-semibold text-warmwhite/90">
                  {cert.eventTitle}
                </div>

                {cert.description && (
                  <p className="text-xs text-warmwhite/60 mt-2 leading-relaxed">
                    {cert.description}
                  </p>
                )}

                <div className="text-xs text-warmwhite/50 mt-4">
                  Issued on: {new Date(cert.issueDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-warmwhite/50">
                  Credential ID: {cert.certificateNumber}
                </span>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-citrus/15 hover:bg-citrus/25 text-citrus text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-12 text-center space-y-4">
          <Award className="w-12 h-12 text-warmwhite/30 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Certificates Issued Yet</h3>
          <p className="text-xs text-warmwhite/60 max-w-sm mx-auto">
            Certificates of Participation and Merit are issued upon conclusion of Council conferences, debating fests, and research evaluations.
          </p>
        </div>
      )}
    </div>
  );
}
