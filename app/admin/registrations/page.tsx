import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) {
    notFound();
  }

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      event: { select: { title: true, slug: true } },
      ticketCategory: { select: { name: true, price: true } }
    }
  });

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-border pb-6">
          <div>
            <span className="eyebrow text-citrus">Admissions Administration</span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-warmwhite mt-1">
              Delegate Registrations Roll
            </h1>
            <p className="text-xs text-mutedgrey mt-2">
              Official roll of confirmed delegates, observers, and scholars across all assemblies.
            </p>
          </div>
          <span className="text-xs font-mono text-citrus bg-navy px-3 py-1.5 border border-navy-border rounded">
            Total Confirmed: {registrations.filter((r) => r.paymentStatus === "SUCCESS").length} / {registrations.length}
          </span>
        </div>

        <div className="border border-navy-border bg-navy p-6 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[10px] text-mutedgrey uppercase tracking-wider">
                  <th className="pb-3">Reg. ID</th>
                  <th className="pb-3">Delegate Details</th>
                  <th className="pb-3">Assembly Event</th>
                  <th className="pb-3">Pass & Fee</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Admitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-navy-surface/40">
                    <td className="py-3 font-mono text-citrus font-bold text-xs">
                      {reg.registrationNumber}
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-warmwhite block">{reg.fullName}</span>
                      <span className="text-[10px] text-mutedgrey block">{reg.email} · {reg.phone}</span>
                      {reg.institution && (
                        <span className="text-[10px] text-citrus/80 block">{reg.institution}</span>
                      )}
                    </td>
                    <td className="py-3 max-w-[200px]">
                      <span className="text-warmwhite block truncate font-medium">{reg.event.title}</span>
                      <span className="text-[10px] text-mutedgrey block">{reg.city}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-warmwhite block font-medium">{reg.ticketCategory.name}</span>
                      <span className="font-editorial text-sm font-bold text-warmwhite">
                        {reg.totalAmount === 0 ? "Complimentary" : `₹${reg.totalAmount}`}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-xs ${
                          reg.paymentStatus === "SUCCESS"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : reg.paymentStatus === "REFUNDED"
                            ? "bg-purple-950 text-purple-400 border border-purple-800"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}
                      >
                        {reg.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right text-mutedgrey text-[10px]">
                      {new Date(reg.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-mutedgrey">
                      No registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
