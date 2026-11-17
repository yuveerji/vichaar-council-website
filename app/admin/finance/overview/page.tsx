import { notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import prisma from "@/lib/db";
import { CreditCard, TrendingUp, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FinancialOverviewPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) {
    notFound();
  }

  const [orders, successfulOrders] = await Promise.all([
    prisma.paymentOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: { registration: { include: { event: true } } }
    }),
    prisma.paymentOrder.findMany({
      where: { status: "SUCCESS" }
    })
  ]);

  const grossCollections = successfulOrders.reduce((sum, o) => sum + o.amount, 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const failedOrders = orders.filter((o) => o.status === "FAILED");

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-citrus bg-citrus/20 px-2 py-0.5 rounded border border-citrus/30">
                06 — FINANCE & OPERATIONS
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">CASHFREE TRANSACTION RECONCILIATION</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
              Financial Overview
            </h1>
            <p className="text-xs text-warmwhite/70 mt-1">
              Live settlement metrics, order reconciliation, and Cashfree gateway transactions.
            </p>
          </div>

          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full self-start sm:self-auto">
            Cashfree Production Environment Active
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/40 block">
              GROSS SETTLEMENTS
            </span>
            <span className="font-editorial text-3xl font-bold text-citrus block mt-2">
              ₹{grossCollections.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono block mt-1">
              {successfulOrders.length} verified orders
            </span>
          </div>

          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/40 block">
              TOTAL ORDERS CREATED
            </span>
            <span className="font-editorial text-3xl font-bold text-white block mt-2">
              {orders.length}
            </span>
            <span className="text-[10px] text-warmwhite/50 font-mono block mt-1">
              All payment attempts
            </span>
          </div>

          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/40 block">
              PENDING VERIFICATION
            </span>
            <span className="font-editorial text-3xl font-bold text-amber-300 block mt-2">
              {pendingOrders.length}
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono block mt-1">
              Awaiting webhook/bank response
            </span>
          </div>

          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-warmwhite/40 block">
              AVERAGE TICKET SIZE
            </span>
            <span className="font-editorial text-3xl font-bold text-white block mt-2">
              ₹{successfulOrders.length > 0 ? (grossCollections / successfulOrders.length).toFixed(0) : "549"}
            </span>
            <span className="text-[10px] text-warmwhite/50 font-mono block mt-1">
              Per delegate seat
            </span>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase font-mono tracking-wider text-warmwhite/60 font-bold">
            Recent Cashfree Orders ({orders.length})
          </h2>

          <div className="bg-[#0B1526] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#070E1A] text-warmwhite/50 uppercase tracking-wider border-b border-white/10 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Delegate</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-warmwhite/40">
                        No orders recorded in Cashfree ledger yet.
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 15).map((o) => (
                      <tr key={o.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-bold text-white">{o.orderId}</td>
                        <td className="py-3 px-4 text-warmwhite/80">{o.registration?.fullName || "—"}</td>
                        <td className="py-3 px-4 text-warmwhite/60 truncate max-w-xs">
                          {o.registration?.event?.title || "SHABD & SOCH 2026"}
                        </td>
                        <td className="py-3 px-4 font-bold text-citrus">₹{o.amount}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.status === "SUCCESS"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : o.status === "FAILED"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-warmwhite/40">
                          {new Date(o.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
