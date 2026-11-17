"use client";

import { useState } from "react";

interface PaymentOrder {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  bankReference: string | null;
  paymentTime: Date | null;
  createdAt: Date;
  registration: {
    fullName: string;
    email: string;
    registrationNumber: string;
    event: {
      title: string;
    };
  };
}

interface PaymentsTableProps {
  initialOrders: PaymentOrder[];
}

export default function PaymentsTable({ initialOrders }: PaymentsTableProps) {
  const [orders, setOrders] = useState<PaymentOrder[]>(initialOrders);
  const [refundModalOrder, setRefundModalOrder] = useState<PaymentOrder | null>(null);
  const [refundReason, setRefundReason] = useState("Delegate withdrawal per cancellation policy");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleRefundSubmit = async () => {
    if (!refundModalOrder) return;
    setIsProcessing(true);
    setFeedbackMessage("");

    try {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: refundModalOrder.orderId,
          amount: refundModalOrder.amount,
          reason: refundReason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process refund.");
      }

      setFeedbackMessage(`Refund of ₹${refundModalOrder.amount} processed successfully via Cashfree.`);
      setOrders(
        orders.map((o) =>
          o.orderId === refundModalOrder.orderId ? { ...o, status: "REFUNDED" } : o
        )
      );
      setRefundModalOrder(null);
    } catch (err: any) {
      setFeedbackMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {feedbackMessage && (
        <div className="p-4 bg-navy-surface border border-citrus/40 text-citrus text-xs rounded-xs">
          {feedbackMessage}
        </div>
      )}

      <div className="border border-navy-border bg-navy p-6 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] text-mutedgrey uppercase tracking-wider">
                <th className="pb-3">Cashfree Order ID</th>
                <th className="pb-3">Delegate & Event</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Payment Details</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-navy-surface/40">
                  <td className="py-3 font-mono text-warmwhite text-[11px]">
                    {ord.orderId}
                    <span className="block text-[9px] text-mutedgrey mt-0.5">
                      Reg: {ord.registration.registrationNumber}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-warmwhite block">{ord.registration.fullName}</span>
                    <span className="text-[10px] text-mutedgrey block line-clamp-1">{ord.registration.event.title}</span>
                  </td>
                  <td className="py-3 font-editorial text-base font-bold text-warmwhite">
                    ₹{ord.amount}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-xs ${
                        ord.status === "SUCCESS"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : ord.status === "REFUNDED"
                          ? "bg-purple-950 text-purple-400 border border-purple-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 text-[10px] text-mutedgrey">
                    <div>Method: {ord.paymentMethod || "UPI / Gateway"}</div>
                    {ord.bankReference && <div>Ref: {ord.bankReference}</div>}
                  </td>
                  <td className="py-3 text-right">
                    {ord.status === "SUCCESS" ? (
                      <button
                        onClick={() => setRefundModalOrder(ord)}
                        className="border border-red-500/50 bg-red-950/40 px-3 py-1 text-[10px] font-bold text-red-300 hover:bg-red-900 uppercase rounded-xs transition-colors"
                      >
                        Refund ₹{ord.amount}
                      </button>
                    ) : (
                      <span className="text-[10px] text-mutedgrey italic">No action</span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-mutedgrey">
                    No verified transactions or Cashfree payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-navy-border bg-navy-deep p-6 rounded-sm text-warmwhite shadow-2xl">
            <h3 className="font-editorial text-2xl font-bold text-warmwhite mb-2">
              Process Cashfree Refund
            </h3>
            <p className="text-xs text-mutedgrey mb-4">
              Authorize a full reversal of ₹{refundModalOrder.amount} back to {refundModalOrder.registration.fullName}&apos;s original payment method.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
                  Reason for Refund *
                </label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full border border-navy-border bg-navy px-3 py-2 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setRefundModalOrder(null)}
                  className="px-4 py-2 border border-white/20 text-xs text-mutedgrey hover:text-white uppercase rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRefundSubmit}
                  className="px-4 py-2 border border-red-500 bg-red-700 text-xs font-bold text-white uppercase rounded-xs hover:bg-red-600 transition-colors"
                >
                  {isProcessing ? "Processing via Cashfree..." : "Confirm Refund ↗"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
