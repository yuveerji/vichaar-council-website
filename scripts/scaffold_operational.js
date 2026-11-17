const fs = require('fs');
const path = require('path');

const operationalPages = [
  // 01 WORKSPACE
  {
    subpath: 'workspace/tasks',
    title: 'My Tasks & Work Queue',
    section: '01 — WORKSPACE',
    desc: 'Assigned operational tasks, action items, and departmental deliverables.'
  },
  {
    subpath: 'workspace/activity',
    title: 'Activity Feed',
    section: '01 — WORKSPACE',
    desc: 'Real-time timeline of administrative actions, delegate check-ins, and registrations.'
  },
  {
    subpath: 'workspace/notifications',
    title: 'Operational Notifications',
    section: '01 — WORKSPACE',
    desc: 'System alerts, upcoming event milestones, and critical departmental updates.'
  },
  {
    subpath: 'workspace/approvals',
    title: 'Pending Approvals',
    section: '01 — WORKSPACE',
    desc: 'Review and approve delegate registration waivers, publication drafts, and partner requests.'
  },

  // 02 PEOPLE & ORGANISATION
  {
    subpath: 'people/members',
    title: 'Members Directory',
    section: '02 — PEOPLE & ORGANISATION',
    desc: 'Directory of registered Council delegates, accredited youth scholars, and alumni.'
  },
  {
    subpath: 'people/users',
    title: 'User Management',
    section: '02 — PEOPLE & ORGANISATION',
    desc: 'Manage portal user credentials, email verification statuses, and account activities.'
  },
  {
    subpath: 'people/leadership',
    title: 'Leadership Directory',
    section: '02 — PEOPLE & ORGANISATION',
    desc: 'Executive board members, advisory patrons, and departmental directors.'
  },
  {
    subpath: 'people/team',
    title: 'Core Team & Officers',
    section: '02 — PEOPLE & ORGANISATION',
    desc: 'Active operational staff, rapporteurs, student marshals, and adjudicators.'
  },
  {
    subpath: 'people/departments',
    title: 'Departments & Working Groups',
    section: '02 — PEOPLE & ORGANISATION',
    desc: 'Operational breakdown: Events, Content, Communications, Finance, and Community.'
  },
  {
    subpath: 'people/recruitment',
    title: 'Applications & Recruitment',
    section: '02 — PEOPLE & ORGANISATION',
    desc: 'Review fellowship and executive committee candidate applications.'
  },
  {
    subpath: 'people/roles',
    title: 'Roles & Access Clearances',
    section: '02 — PEOPLE & ORGANISATION',
    desc: 'Operational role tiers and departmental assignment matrices.'
  },

  // 03 CONTENT & MEDIA
  {
    subpath: 'content/articles',
    title: 'Articles & Publications',
    section: '03 — CONTENT & MEDIA',
    desc: 'Draft, edit, review, and schedule policy papers, debate motions, and opinion editorials.'
  },
  {
    subpath: 'content/documents',
    title: 'Document Manager',
    section: '03 — CONTENT & MEDIA',
    desc: 'Upload and manage official rulebooks, debate backgrounders, and PDF charters.'
  },

  // 04 EVENTS & PROGRAMMES
  {
    subpath: 'events/manage',
    title: 'Event Management & Assemblies',
    section: '04 — EVENTS & PROGRAMMES',
    desc: 'Create, schedule, and curate agendas, venues, and pricing for upcoming summits.'
  },
  {
    subpath: 'events/participants',
    title: 'Participant Directory',
    section: '04 — EVENTS & PROGRAMMES',
    desc: 'Search, filter, and view participating students, schools, and debate delegations.'
  },
  {
    subpath: 'events/attendance',
    title: 'Assembly Attendance & Check-In',
    section: '04 — EVENTS & PROGRAMMES',
    desc: 'Real-time on-site accreditation check-in scanner and delegate roster.'
  },
  {
    subpath: 'events/reports',
    title: 'Event Reports & Summaries',
    section: '04 — EVENTS & PROGRAMMES',
    desc: 'Post-assembly outcome summaries, committee resolutions, and participation statistics.'
  },

  // 05 COMMUNITY
  {
    subpath: 'community/dashboard',
    title: 'Community Dashboard',
    section: '05 — COMMUNITY',
    desc: 'Overview of youth discourse, active forum topics, and delegate discussions.'
  },
  {
    subpath: 'community/discussions',
    title: 'Deliberation Forums & Discussions',
    section: '05 — COMMUNITY',
    desc: 'Moderate debate discourse, motion arguments, and student discussion threads.'
  },
  {
    subpath: 'community/reports',
    title: 'Reports & Complaints',
    section: '05 — COMMUNITY',
    desc: 'Grievance reports and conduct moderation requests submitted by participants.'
  },
  {
    subpath: 'community/guidelines',
    title: 'Community Guidelines',
    section: '05 — COMMUNITY',
    desc: 'Official standards of parliamentary conduct, debate ethics, and discourse rules.'
  },

  // 06 COMMUNICATIONS
  {
    subpath: 'communications/templates',
    title: 'Email Templates & Curation',
    section: '06 — COMMUNICATIONS',
    desc: 'Manage accreditation confirmations, password resets, and motion brief templates.'
  },
  {
    subpath: 'communications/bulk',
    title: 'Bulk Communications Broadcaster',
    section: '06 — COMMUNICATIONS',
    desc: 'Broadcast official communiqués to registered delegates and institutional coordinators.'
  },

  // 07 PARTNERSHIPS & OUTREACH
  {
    subpath: 'partnerships/directory',
    title: 'Partner Directory',
    section: '07 — PARTNERSHIPS & OUTREACH',
    desc: 'Educational institutions, school networks, and partner university records.'
  },
  {
    subpath: 'partnerships/applications',
    title: 'Partnership Applications',
    section: '07 — PARTNERSHIPS & OUTREACH',
    desc: 'Collaboration proposals submitted by academic bodies and debate societies.'
  },
  {
    subpath: 'partnerships/sponsors',
    title: 'Sponsors & Patrons',
    section: '07 — PARTNERSHIPS & OUTREACH',
    desc: 'Corporate sponsors, scholarship endowments, and institutional patrons.'
  },
  {
    subpath: 'partnerships/collaborations',
    title: 'Institutional Collaborations',
    section: '07 — PARTNERSHIPS & OUTREACH',
    desc: 'Joint initiatives, inter-school tournaments, and academic exchange programs.'
  },
  {
    subpath: 'partnerships/outreach',
    title: 'Outreach Records & Contacts',
    section: '07 — PARTNERSHIPS & OUTREACH',
    desc: 'Outreach campaign logs, coordinator contact details, and institutional dispatches.'
  },

  // 08 FINANCE & RECORDS
  {
    subpath: 'finance/records',
    title: 'Payment Records & Ledger',
    section: '08 — FINANCE & RECORDS',
    desc: 'Audit trail of all online and institutional registration payments.'
  },
  {
    subpath: 'finance/fees',
    title: 'Registration Fees & Tiers',
    section: '08 — FINANCE & RECORDS',
    desc: 'Manage delegate seat pricing, institutional group discounts, and scholarship waivers.'
  },

  // 09 ANALYTICS & REPORTS
  {
    subpath: 'analytics/website',
    title: 'Website Analytics',
    section: '09 — ANALYTICS & REPORTS',
    desc: 'Visitor traffic, page engagement, and device breakdown.'
  },
  {
    subpath: 'analytics/membership',
    title: 'Membership Analytics',
    section: '09 — ANALYTICS & REPORTS',
    desc: 'Delegate registration velocity, geographic distribution, and grade demographics.'
  },
  {
    subpath: 'analytics/events',
    title: 'Event Analytics',
    section: '09 — ANALYTICS & REPORTS',
    desc: 'Ticket sell-out pacing, capacity utilization, and attendance ratios.'
  },
  {
    subpath: 'analytics/engagement',
    title: 'Engagement Reports',
    section: '09 — ANALYTICS & REPORTS',
    desc: 'Debate participation rates, speech submissions, and jamming social metrics.'
  },
  {
    subpath: 'analytics/exports',
    title: 'Export Centre & Ledger Downloads',
    section: '09 — ANALYTICS & REPORTS',
    desc: 'Generate downloadable CSV spreadsheets of confirmed delegates and financial records.'
  },

  // 10 SUPPORT & OPERATIONS
  {
    subpath: 'support/tickets',
    title: 'Support Tickets & Inquiries',
    section: '10 — SUPPORT & OPERATIONS',
    desc: 'Manage and resolve participant questions, payment issues, and pass corrections.'
  },
  {
    subpath: 'support/enquiries',
    title: 'Enquiry Management',
    section: '10 — SUPPORT & OPERATIONS',
    desc: 'Direct triage and response management for contact form dispatches.'
  },
  {
    subpath: 'support/issues',
    title: 'Issue Tracking & Bug Reports',
    section: '10 — SUPPORT & OPERATIONS',
    desc: 'Track reported website glitches, form submission errors, and resolution status.'
  },
  {
    subpath: 'support/faqs',
    title: 'FAQs & Help Centre Manager',
    section: '10 — SUPPORT & OPERATIONS',
    desc: 'Curate knowledge base articles and event registration guidelines.'
  },
  {
    subpath: 'support/checklist',
    title: 'Operational Checklist',
    section: '10 — SUPPORT & OPERATIONS',
    desc: 'Pre-event readiness verification, venue equipment checklist, and coordinator briefing.'
  },

  // 11 ADMIN SETTINGS
  {
    subpath: 'settings/profile',
    title: 'My Profile & Credentials',
    section: '11 — ADMIN SETTINGS',
    desc: 'Manage your administrator name, contact email, and login password.'
  },
  {
    subpath: 'settings/department',
    title: 'My Department & Team',
    section: '11 — ADMIN SETTINGS',
    desc: 'View your assigned departmental division, reporting hierarchy, and teammates.'
  },
  {
    subpath: 'settings/permissions',
    title: 'Assigned Permissions',
    section: '11 — ADMIN SETTINGS',
    desc: 'Inspect your active operational clearances and module authorization rules.'
  },
  {
    subpath: 'settings/preferences',
    title: 'Personal Preferences',
    section: '11 — ADMIN SETTINGS',
    desc: 'Configure notification alerts, dashboard layout widgets, and table density.'
  },
  {
    subpath: 'settings/security',
    title: 'Session & Security',
    section: '11 — ADMIN SETTINGS',
    desc: 'Active login sessions, IP security logs, and multi-factor authentication status.'
  }
];

function generateOperationalTemplate(p) {
  return `import { notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Activity, Clock } from "lucide-react";

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
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                ${p.section}
              </span>
              <span className="text-xs text-warmwhite/50 font-mono">OPERATIONAL INTERFACE</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white mt-1.5">
              ${p.title}
            </h1>
            <p className="text-xs text-warmwhite/70 mt-1">
              ${p.desc}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-mono self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span>OPERATIONAL ACCESS</span>
          </div>
        </div>

        {/* Operational Workspace Card */}
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white font-editorial tracking-wide">
                ${p.title} · Department Workspace
              </h3>
              <p className="text-xs text-warmwhite/60 font-mono mt-0.5">
                Department: {currentAdmin.department || "General Operations"}
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Module Synchronized</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-warmwhite/70 leading-relaxed font-sans max-w-3xl">
            This module provides authorized Council administrators with direct operational capabilities to manage records, process incoming submissions, and execute departmental duties without accessing underlying server configurations.
          </p>

          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-citrus hover:bg-citrus/90 text-navy text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/registrations"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-warmwhite font-mono uppercase tracking-wider transition-colors"
            >
              Registrations Ledger
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
`;
}

for (const p of operationalPages) {
  const targetDir = path.join(process.cwd(), 'app/admin', p.subpath);
  const targetFile = path.join(targetDir, 'page.tsx');
  if (!fs.existsSync(targetFile)) {
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, generateOperationalTemplate(p), 'utf8');
    console.log('Created operational page:', p.subpath);
  } else {
    console.log('Operational page exists:', p.subpath);
  }
}
console.log('Done scaffolding operational pages.');
