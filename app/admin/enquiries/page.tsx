import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) {
    notFound();
  }

  const enquiries = await prisma.contactEnquiry.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        <div className="border-b border-navy-border pb-6 flex items-center justify-between">
          <div>
            <span className="eyebrow text-citrus">Correspondence & Grievance Registry</span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-warmwhite mt-1">
              Secretariat Inbox
            </h1>
            <p className="text-xs text-mutedgrey mt-2">
              Official log of institutional inquiries, media requests, and partnership proposals.
            </p>
          </div>
          <span className="text-xs font-mono text-citrus bg-navy px-3 py-1.5 border border-navy-border rounded">
            Total Messages: {enquiries.length}
          </span>
        </div>

        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="border border-navy-border bg-navy p-6 rounded-sm shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-warmwhite text-sm">{enq.name}</span>
                  <span className="text-xs text-mutedgrey">·</span>
                  <a href={`mailto:${enq.email}`} className="text-xs text-citrus hover:underline">
                    {enq.email}
                  </a>
                  {enq.phone && (
                    <span className="text-xs text-mutedgrey">({enq.phone})</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-citrus/15 text-citrus text-[9px] font-bold uppercase rounded-xs">
                    {enq.category}
                  </span>
                  <span className="text-[10px] text-mutedgrey">
                    {new Date(enq.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-warmwhite block uppercase tracking-wide">
                  Subject: {enq.subject}
                </span>
                <p className="text-xs text-mutedgrey mt-2 leading-relaxed bg-navy-deep p-4 rounded-xs border border-white/5">
                  {enq.message}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 text-[10px] text-mutedgrey">
                <span>Status: <strong className="text-emerald-400">{enq.status}</strong></span>
                <a
                  href={`mailto:${enq.email}?subject=Re: ${encodeURIComponent(enq.subject)} - The Vichaar Council Secretariat`}
                  className="text-citrus hover:underline font-bold uppercase tracking-wider"
                >
                  Reply via Email ↗
                </a>
              </div>
            </div>
          ))}

          {enquiries.length === 0 && (
            <div className="border border-navy-border bg-navy p-12 text-center text-mutedgrey text-sm">
              No correspondence logged yet.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
