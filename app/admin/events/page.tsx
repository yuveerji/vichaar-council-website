import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";

export const dynamic = "force-dynamic";

export default async function AdminEventsListPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) {
    notFound();
  }

  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
    include: {
      tickets: true,
      _count: { select: { registrations: true } }
    }
  });

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-border pb-6">
          <div>
            <span className="eyebrow text-citrus">Assemblies & Conferences</span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-warmwhite mt-1">
              Event Management
            </h1>
          </div>
          <Link
            href="/admin/events/new"
            className="border border-citrus bg-citrus px-4 py-2 text-xs font-bold tracking-wider text-ink uppercase rounded-xs hover:bg-warmwhite transition-colors"
          >
            + Create New Assembly
          </Link>
        </div>

        <div className="border border-navy-border bg-navy p-6 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[10px] text-mutedgrey uppercase tracking-wider">
                  <th className="pb-3">Event Title</th>
                  <th className="pb-3">Category & Format</th>
                  <th className="pb-3">Date & Venue</th>
                  <th className="pb-3">Capacity & Confirmed</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-navy-surface/40">
                    <td className="py-3 font-bold text-warmwhite max-w-[220px]">
                      {evt.title}
                      <span className="block font-mono text-[10px] text-citrus font-normal">/{evt.slug}</span>
                    </td>
                    <td className="py-3 text-[11px] text-mutedgrey">
                      <div>{evt.categoryName || "Assembly"}</div>
                      <div className="text-[10px] uppercase text-warmwhite">{evt.format.replace("_", " ")}</div>
                    </td>
                    <td className="py-3 text-[11px] text-mutedgrey">
                      <div>{new Date(evt.startDate).toLocaleDateString("en-IN")}</div>
                      <div className="text-[10px]">{evt.city}</div>
                    </td>
                    <td className="py-3 text-warmwhite font-semibold">
                      {evt._count.registrations} / {evt.capacity}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-xs ${
                          evt.status === "REGISTRATION_OPEN"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-navy-deep text-mutedgrey border border-white/10"
                        }`}
                      >
                        {evt.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/events/${evt.slug}`}
                        target="_blank"
                        className="text-citrus hover:underline font-bold text-[11px] uppercase mr-3"
                      >
                        View Live ↗
                      </Link>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-mutedgrey">
                      <p className="font-editorial text-xl text-warmwhite mb-1">No assemblies or events created yet.</p>
                      <p className="text-xs text-mutedgrey mb-4">Official sessions will appear on this administrative register once published.</p>
                      <Link
                        href="/admin/events/new"
                        className="inline-block border border-citrus bg-citrus px-5 py-2 text-xs font-bold text-ink uppercase rounded-xs hover:bg-warmwhite transition-colors"
                      >
                        + Create First Assembly
                      </Link>
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
