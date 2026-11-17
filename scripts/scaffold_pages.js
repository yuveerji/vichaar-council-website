const fs = require('fs');
const path = require('path');

const pages = [
  {
    subpath: 'executive/alerts',
    title: 'Alerts & Notifications',
    section: '01 — EXECUTIVE',
    desc: 'System triggers, payment failures, duplicate submission flags, and operational alerts.'
  },
  {
    subpath: 'organisation/leadership',
    title: 'Leadership & Secretariat Roster',
    section: '02 — ORGANISATION',
    desc: 'Institutional patrons, advisory board members, and executive secretariat directory.'
  },
  {
    subpath: 'organisation/roles',
    title: 'Roles & Access Permissions',
    section: '02 — ORGANISATION',
    desc: 'Role hierarchy, ROOT clearance, SUPER_ADMIN privileges, and whitelist governance.'
  },
  {
    subpath: 'organisation/applications',
    title: 'Applications & Recruitment',
    section: '02 — ORGANISATION',
    desc: 'Review youth fellowship, rapporteur, and adjudicator volunteer applications.'
  },
  {
    subpath: 'content/pages',
    title: 'Pages & Content Manager',
    section: '03 — CONTENT & CMS',
    desc: 'Manage institutional pages, about section, mission copy, and institutional dockets.'
  },
  {
    subpath: 'content/news',
    title: 'News & Official Articles',
    section: '03 — CONTENT & CMS',
    desc: 'Publish thought leadership articles, debate debriefs, and press communiqués.'
  },
  {
    subpath: 'content/media',
    title: 'Media & Photo Library',
    section: '03 — CONTENT & CMS',
    desc: 'Curate high-resolution assembly photographs, logos, and digital event assets.'
  },
  {
    subpath: 'content/navigation',
    title: 'Navigation & Footer Builder',
    section: '03 — CONTENT & CMS',
    desc: 'Configure primary navbar links, dropdown structures, and institutional footer columns.'
  },
  {
    subpath: 'content/seo',
    title: 'SEO & Metadata Studio',
    section: '03 — CONTENT & CMS',
    desc: 'OpenGraph previews, meta titles, descriptions, and Google Search indexing status.'
  },
  {
    subpath: 'events/tickets',
    title: 'Tickets & Digital Passes',
    section: '04 — PROGRAMMES & EVENTS',
    desc: 'Issue, inspect, and revoke QR-verified delegate admission passes.'
  },
  {
    subpath: 'events/certificates',
    title: 'Certificates & Merits',
    section: '04 — PROGRAMMES & EVENTS',
    desc: 'Generate, issue, and verify cryptographic merit certificates for delegates.'
  },
  {
    subpath: 'communications/email',
    title: 'Email Command Centre',
    section: '05 — COMMUNICATIONS',
    desc: 'Direct email broadcaster via Resend API and verified SMTP dispatch.'
  },
  {
    subpath: 'communications/campaigns',
    title: 'Campaign Manager',
    section: '05 — COMMUNICATIONS',
    desc: 'Curate automated email sequences for registered delegates, schools, and patrons.'
  },
  {
    subpath: 'communications/announcements',
    title: 'Announcements & Broadcasts',
    section: '05 — COMMUNICATIONS',
    desc: 'Dispatch instantaneous broadcast notifications across user portals.'
  },
  {
    subpath: 'communications/notifications',
    title: 'Notification Manager',
    section: '05 — COMMUNICATIONS',
    desc: 'Audit all in-app notifications delivered to participant portals and their read status.'
  },
  {
    subpath: 'finance/invoices',
    title: 'Invoices & Receipts',
    section: '06 — FINANCE & OPERATIONS',
    desc: 'Automated GST-compliant invoices and delegate accreditation receipts.'
  },
  {
    subpath: 'finance/partnerships',
    title: 'Partnerships & Sponsors',
    section: '06 — FINANCE & OPERATIONS',
    desc: 'Institutional partner agreements, school delegations, and sponsor packages.'
  },
  {
    subpath: 'finance/reports',
    title: 'Settlements & Reports',
    section: '06 — FINANCE & OPERATIONS',
    desc: 'Comprehensive financial reporting, Cashfree settlement timelines, and reconciliations.'
  },
  {
    subpath: 'community/submissions',
    title: 'Discussions & Submissions',
    section: '07 — COMMUNITY & ENGAGEMENT',
    desc: 'Review participant debate motions, research briefs, and speech submissions.'
  },
  {
    subpath: 'community/moderation',
    title: 'Reports & Moderation',
    section: '07 — COMMUNITY & ENGAGEMENT',
    desc: 'Content safety filters, flagged posts, and delegate conduct enforcement.'
  },
  {
    subpath: 'community/engagement',
    title: 'Community Engagement',
    section: '07 — COMMUNITY & ENGAGEMENT',
    desc: 'Analytics on delegate participation, attendance, and alumni network.'
  },
  {
    subpath: 'website/homepage',
    title: 'Homepage Builder',
    section: '08 — WEBSITE CONTROL',
    desc: 'Visual control over homepage blocks, hero typography, and action links.'
  },
  {
    subpath: 'website/config',
    title: 'Site Configuration',
    section: '08 — WEBSITE CONTROL',
    desc: 'Core environment variables, public endpoints, and production TVC domain routing.'
  },
  {
    subpath: 'website/features',
    title: 'Feature Controls',
    section: '08 — WEBSITE CONTROL',
    desc: 'Deep feature flags for experimental modules, AI agents, and preview systems.'
  },
  {
    subpath: 'website/branding',
    title: 'Branding & Appearance',
    section: '08 — WEBSITE CONTROL',
    desc: 'Official circular transparent logo assets, typography, and color palette tokens.'
  },
  {
    subpath: 'system/database',
    title: 'Database & Backups',
    section: '09 — SYSTEM & SECURITY',
    desc: 'Prisma schema state, SQLite WAL snapshots, automated backups, and table migrations.'
  },
  {
    subpath: 'system/integrations',
    title: 'Integrations & External APIs',
    section: '09 — SYSTEM & SECURITY',
    desc: 'Status and credentials for Cashfree, Resend, Google Sheets, and Gemini AI.'
  },
  {
    subpath: 'system/security',
    title: 'Security Centre',
    section: '09 — SYSTEM & SECURITY',
    desc: 'Firewall rules, rate limits, session security, and anti-abuse safeguards.'
  },
  {
    subpath: 'founders/changelog',
    title: 'Change History & Changelog',
    section: '10 — FOUNDER SETTINGS',
    desc: 'Chronological timeline of all system releases, architectural upgrades, and bug fixes.'
  },
  {
    subpath: 'founders/profile',
    title: 'Founder Profile & Key Management',
    section: '10 — FOUNDER SETTINGS',
    desc: 'Manage Founder credentials, root session tokens, and authorized security keys.'
  }
];

function generateTemplate(p) {
  return `import { notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";
import { Shield, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ${p.subpath.replace(/[^a-zA-Z]/g, '')}Page() {
  const currentAdmin = await getAuthorizedAdmin();
  if (!currentAdmin) notFound();

  return (
    <AdminLayout user={currentAdmin}>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-citrus bg-citrus/20 px-2 py-0.5 rounded border border-citrus/30">
                ${p.section}
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">ENTERPRISE CONTROL</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
              ${p.title}
            </h1>
            <p className="text-xs text-warmwhite/70 mt-1">
              ${p.desc}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>MODULE ARMED</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-citrus/10 text-citrus border border-citrus/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-editorial tracking-wide">
                ${p.title} · Active Control Plane
              </h3>
              <p className="text-xs text-warmwhite/60 font-mono mt-0.5">
                Managed under VICHAAR.FOUNDERS Root Access
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-warmwhite/70 leading-relaxed font-sans max-w-3xl">
            This module is seamlessly integrated into the unified Founder Command Centre. Real-time updates, policy configurations, and administrative actions executed here directly reflect across The Vichaar Council institutional platform.
          </p>

          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-citrus hover:bg-citrus/90 text-navy text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Back to Overview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/system/health"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-warmwhite font-mono uppercase tracking-wider transition-colors"
            >
              System Pulse
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
`;
}

for (const p of pages) {
  const targetDir = path.join(process.cwd(), 'app/admin', p.subpath);
  const targetFile = path.join(targetDir, 'page.tsx');
  if (!fs.existsSync(targetFile)) {
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, generateTemplate(p), 'utf8');
    console.log('Created page:', p.subpath);
  } else {
    console.log('Page already exists:', p.subpath);
  }
}
console.log('Done scaffolding sub-pages.');
