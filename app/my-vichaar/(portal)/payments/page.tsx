"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Clock, AlertCircle, Download, FileText, Loader2 } from "lucide-react";

export default function ParticipantPaymentsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/my-vichaar/profile");
        const json = await res.json();
        if (res.ok) {
          setRegistrations(json.registrations || []);
        }
      } catch (e) {
        console.error("Error loading payments:", e);
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
          FINANCIAL AUDIT & INVOICES
        </span>
        <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-wide mt-1">
          Payment History
        </h1>
        <p className="text-xs text-warmwhite/60 mt-1">
          Cashfree transaction receipts, official tax invoices, and payment verifications.
        </p>
      </div>

      {registrations.length > 0 ? (
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1B30] text-warmwhite/70 uppercase tracking-wider text-[11px] border-b border-white/10">
                <tr>
                  <th className="py-4 px-6">Event / Pass</th>
                  <th className="py-4 px-6">Order ID / Ref</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{reg.event?.title}</div>
                      <div className="text-[11px] text-warmwhite/50">{reg.ticketCategory?.name || "Delegate Pass"}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-warmwhite/80">
                      {reg.paymentOrder?.orderId || reg.registrationNumber}
                    </td>
                    <td className="py-4 px-6 text-warmwhite/70">
                      {new Date(reg.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      ₹{reg.totalAmount || "549"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          reg.paymentStatus === "SUCCESS"
                            ? "text-emerald-400 bg-emerald-950/60 border-emerald-500/30"
                            : "text-amber-300 bg-amber-950/60 border-amber-500/30"
                        }`}
                      >
                        {reg.paymentStatus === "SUCCESS" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> {reg.paymentStatus}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-warmwhite text-[11px] font-medium border border-white/10 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-12 text-center space-y-4">
          <CreditCard className="w-12 h-12 text-warmwhite/30 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Transactions Recorded</h3>
          <p className="text-xs text-warmwhite/60 max-w-sm mx-auto">
            Once you register for a Council event or conference, official invoices and payment receipts will be archived here.
          </p>
        </div>
      )}
    </div>
  );
}
