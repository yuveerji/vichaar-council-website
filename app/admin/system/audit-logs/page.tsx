import { notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import prisma from "@/lib/db";
import { Shield, Clock, Search, Terminal, AlertCircle, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) {
    notFound();
  }

  const logs = await prisma.auditLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true
        }
      }
    }
  });

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                09 — SYSTEM & SECURITY
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">IMMUTABLE AUDIT TRAIL</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
              Founder Activity Ledger
            </h1>
            <p className="text-xs text-warmwhite/70 mt-1">
              Cryptographically timestamped audit log of all administrative actions, sync jobs, and parameter modifications.
            </p>
          </div>

          <div className="text-xs font-mono text-warmwhite/50 self-start sm:self-auto">
            {logs.length} logged events
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#070E1A] text-warmwhite/50 uppercase tracking-wider border-b border-white/10 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Details / Metadata</th>
                  <th className="py-3.5 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-warmwhite/40">
                      No administrative events recorded yet. All actions taken in the Command Centre are logged here automatically.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 text-warmwhite/60 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block">
                          {log.user?.name || "System Automated"}
                        </span>
                        <span className="text-[10px] text-warmwhite/40 block">
                          {log.user?.email || "internal-daemon"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-warmwhite/80">
                        {log.entity} {log.entityId && <span className="text-[10px] text-warmwhite/40">#{log.entityId.slice(0, 8)}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-warmwhite/60 max-w-xs truncate">
                        {log.details || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-warmwhite/40">
                        {log.ipAddress || "::1"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
