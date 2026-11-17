import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getAuthorizedAdmin, getAdminWhitelist } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminWhitelistManager from "@/components/admin/AdminWhitelistManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) {
    notFound();
  }

  const [siteSettings, whitelist, adminUsers, participantAdmins] = await Promise.all([
    prisma.siteSetting.findMany(),
    getAdminWhitelist(),
    prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true
      }
    }),
    prisma.participantUser.findMany({
      where: {
        OR: [{ role: "ADMIN" }, { role: "SUPER_ADMIN" }, { role: "SECRETARIAT" }]
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true
      }
    })
  ]);

  const cashfreeEnv = process.env.CASHFREE_ENV || "SANDBOX";
  const clientId = process.env.CASHFREE_CLIENT_ID || "";
  const cashfreeConfigured = Boolean(clientId) && !clientId.includes("PLACEHOLDER");

  return (
    <AdminLayout user={currentAdmin}>
      <div className="max-w-4xl space-y-8">
        <div className="border-b border-navy-border pb-6">
          <span className="eyebrow text-citrus">System Architecture</span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-warmwhite mt-1">
            Institutional Settings & Clearance Controls
          </h1>
          <p className="text-xs text-mutedgrey mt-2">
            Audit gateway credentials, operational parameters, and administrator access control.
          </p>
        </div>

        {/* Admin Whitelist & Clearance Management Card */}
        <AdminWhitelistManager
          initialWhitelist={whitelist}
          initialAdminUsers={adminUsers.map((u) => ({
            ...u,
            lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null
          }))}
          initialParticipantAdmins={participantAdmins}
        />

        {/* Cashfree Payment Gateway Card */}
        <div className="border border-navy-border bg-navy p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-navy-border pb-4">
            <div>
              <h3 className="font-editorial text-xl font-bold text-warmwhite">
                Cashfree Payment Gateway Integration
              </h3>
              <p className="text-xs text-mutedgrey">
                Primary payment aggregator for event ticketing and delegate registrations.
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-bold uppercase rounded-xs ${
                cashfreeConfigured
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-amber-950 text-amber-400 border border-amber-800"
              }`}
            >
              {cashfreeEnv} MODE {cashfreeConfigured ? "(LIVE API)" : "(SIMULATOR READY)"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="p-3 bg-navy-deep rounded border border-white/5">
              <span className="text-mutedgrey block text-[10px] uppercase">API Endpoint</span>
              <span className="font-mono text-warmwhite text-[11px]">
                {cashfreeEnv === "PRODUCTION"
                  ? "https://api.cashfree.com/pg"
                  : "https://sandbox.cashfree.com/pg"}
              </span>
            </div>
            <div className="p-3 bg-navy-deep rounded border border-white/5">
              <span className="text-mutedgrey block text-[10px] uppercase">API Version</span>
              <span className="font-mono text-warmwhite text-[11px]">
                {process.env.CASHFREE_API_VERSION || "2023-08-01"}
              </span>
            </div>
            <div className="p-3 bg-navy-deep rounded border border-white/5">
              <span className="text-mutedgrey block text-[10px] uppercase">Client App ID</span>
              <span className="font-mono text-citrus text-[11px]">
                {clientId ? `${clientId.slice(0, 8)}...` : "Not Configured"}
              </span>
            </div>
            <div className="p-3 bg-navy-deep rounded border border-white/5">
              <span className="text-mutedgrey block text-[10px] uppercase">Webhook Endpoint</span>
              <span className="font-mono text-warmwhite text-[11px]">
                /api/webhooks/cashfree
              </span>
            </div>
          </div>

          <div className="p-4 bg-navy-surface rounded text-xs text-mutedgrey leading-relaxed">
            💡 <strong>Cashfree Production Activation:</strong> To toggle to live mode, update <code>CASHFREE_ENV=PRODUCTION</code> in your environment variables and provide production merchant credentials obtained from the Cashfree Merchant Dashboard.
          </div>
        </div>

        {/* Database & Institutional Values */}
        <div className="border border-navy-border bg-navy p-6 rounded-sm space-y-4">
          <h3 className="font-editorial text-xl font-bold text-warmwhite border-b border-navy-border pb-4">
            Institutional Settings Records
          </h3>
          <div className="space-y-3">
            {siteSettings
              .filter((s) => s.key !== "ADMIN_WHITELIST")
              .map((s) => (
                <div key={s.id} className="flex justify-between items-center text-xs p-3 bg-navy-deep border border-white/5 rounded-xs">
                  <div>
                    <span className="font-bold text-citrus font-mono block">{s.key}</span>
                    <span className="text-mutedgrey text-[10px]">{s.description}</span>
                  </div>
                  <span className="font-mono text-warmwhite font-semibold">{s.value}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
