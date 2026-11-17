import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import PaymentsTable from "@/components/admin/PaymentsTable";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) {
    notFound();
  }

  const orders = await prisma.paymentOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      registration: {
        include: {
          event: {
            select: { title: true }
          }
        }
      }
    }
  });

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        <div className="border-b border-navy-border pb-6">
          <span className="eyebrow text-citrus">Financial Administration</span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-warmwhite mt-1">
            Cashfree Transactions & Reconciliation
          </h1>
          <p className="text-xs text-mutedgrey mt-2">
            Audit logs of all order sessions, payment verifications, and authorized refund requests.
          </p>
        </div>

        <PaymentsTable initialOrders={orders as any} />
      </div>
    </AdminLayout>
  );
}
