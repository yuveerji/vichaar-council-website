import { notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import prisma from "@/lib/db";
import { Users, Shield, CheckCircle2, XCircle, Search, Mail, Phone, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrganisationUsersPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) {
    notFound();
  }

  const [participants, adminUsers] = await Promise.all([
    prisma.participantUser.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        registrations: {
          select: { id: true, registrationNumber: true, paymentStatus: true }
        }
      }
    }),
    prisma.adminUser.findMany({
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-citrus bg-citrus/20 px-2 py-0.5 rounded border border-citrus/30">
                02 — ORGANISATION
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">DELEGATE & MEMBER DIRECTORY</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
              Members & Accounts
            </h1>
            <p className="text-xs text-warmwhite/70 mt-1">
              Consolidated registry of participant delegates, secretariat officials, and root founders.
            </p>
          </div>

          <div className="text-xs font-mono text-warmwhite/50 self-start sm:self-auto">
            {participants.length} delegates · {adminUsers.length} administrators
          </div>
        </div>

        {/* Administrators Section */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase font-mono tracking-wider text-citrus font-bold flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Executive & Secretariat Roster ({adminUsers.length})</span>
          </h2>

          <div className="bg-[#0B1526] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#070E1A] text-warmwhite/50 uppercase tracking-wider border-b border-white/10 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Clearance Tier</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {adminUsers.map((a) => (
                    <tr key={a.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-white">{a.name}</td>
                      <td className="py-3 px-4 text-warmwhite/70">{a.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.role === "FOUNDER"
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                              : "bg-white/10 text-warmwhite"
                          }`}
                        >
                          {a.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400">
                        {a.isActive ? "Active" : "Suspended"}
                      </td>
                      <td className="py-3 px-4 text-warmwhite/40">
                        {new Date(a.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Delegates / Participants Section */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase font-mono tracking-wider text-citrus font-bold flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Participant Delegates & Youth Scholars ({participants.length})</span>
          </h2>

          <div className="bg-[#0B1526] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#070E1A] text-warmwhite/50 uppercase tracking-wider border-b border-white/10 text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Delegate Name</th>
                    <th className="py-3.5 px-4">Handle</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Role / Clearance</th>
                    <th className="py-3.5 px-4">Email Verified</th>
                    <th className="py-3.5 px-4">Registrations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-warmwhite/40">
                        No registered participant accounts found.
                      </td>
                    </tr>
                  ) : (
                    participants.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4 font-bold text-white">{p.fullName}</td>
                        <td className="py-3.5 px-4 text-citrus">@{p.username}</td>
                        <td className="py-3.5 px-4 text-warmwhite/70">{p.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.role === "FOUNDER"
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                : "bg-white/10 text-warmwhite"
                            }`}
                          >
                            {p.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.isEmailVerified ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="text-warmwhite/40">Pending</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-warmwhite/60">
                          {p.registrations.length} registrations
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
