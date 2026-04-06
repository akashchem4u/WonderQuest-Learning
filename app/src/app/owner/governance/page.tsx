import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

// ── Palette ───────────────────────────────────────────────────────────────────
const BASE    = "#100b2e";
const MINT    = "#50e890";
const VIOLET  = "#9b72ff";
const RED     = "#f85149";
const AMBER   = "#f59e0b";
const TEAL    = "#58e8c1";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.06)";
const TEXT    = "#f0f6ff";
const MUTED   = "rgba(255,255,255,0.4)";
const MUTED2  = "rgba(255,255,255,0.25)";

// ── Stub data ─────────────────────────────────────────────────────────────────

type LogCategory = "Privacy" | "Content" | "Ops" | "Security" | "Release" | "Account";

interface LogEntry {
  time: string;
  category: LogCategory;
  action: string;
  detail: string;
  actor: string;
  tags: { label: string; cat: LogCategory | "Incident" | "Deploy" | "Automation" | "FERPA/GDPR" }[];
}

const DOT_COLORS: Record<LogCategory, string> = {
  Privacy:  VIOLET,
  Content:  TEAL,
  Ops:      MINT,
  Security: RED,
  Release:  AMBER,
  Account:  "rgba(255,255,255,.3)",
};

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  Privacy:     { bg: "rgba(155,114,255,.12)", color: VIOLET },
  Content:     { bg: "rgba(88,232,193,.1)",   color: TEAL   },
  Ops:         { bg: "rgba(80,232,144,.1)",   color: MINT   },
  Security:    { bg: "rgba(248,81,73,.12)",   color: RED    },
  Incident:    { bg: "rgba(248,81,73,.12)",   color: RED    },
  Release:     { bg: "rgba(245,158,11,.1)",   color: AMBER  },
  Deploy:      { bg: "rgba(245,158,11,.1)",   color: AMBER  },
  Account:     { bg: "rgba(255,255,255,.08)", color: MUTED  },
  Automation:  { bg: "rgba(80,232,144,.1)",   color: MINT   },
  "FERPA/GDPR":{ bg: "rgba(255,255,255,.08)", color: MUTED  },
};

const LOG_ENTRIES: LogEntry[] = [
  {
    time: "Mar 24 · 11:32 AM",
    category: "Ops",
    action: "P0 Incident Resolved — Assignment Engine (PD-4412)",
    detail: "Incident declared 6:10 AM, resolved 11:30 AM. Duration: 5h 20m. Root cause: Redis null payload crash in v2.5.0. Fix: Hotfix v2.5.1. 9 schools affected.",
    actor: "Actor: Owner + System (auto-close on healthy)",
    tags: [{ label: "Ops", cat: "Ops" }, { label: "Incident", cat: "Incident" }],
  },
  {
    time: "Mar 24 · 11:30 AM",
    category: "Release",
    action: "Hotfix v2.5.1 Deployed to Production",
    detail: "Deployed by engineering team. Resolved assignment queue consumer null payload crash. No data migration required. All tests passed pre-deploy.",
    actor: "Actor: Engineering (Sam) · CI/CD pipeline",
    tags: [{ label: "Release", cat: "Release" }, { label: "Deploy", cat: "Deploy" }],
  },
  {
    time: "Mar 24 · 6:10 AM",
    category: "Security",
    action: "P0 Incident Declared — Assignment Engine Down",
    detail: "Auto-declared by monitoring system (error rate exceeded threshold). PagerDuty PD-4412 created. #incidents Slack notified. Teacher status page updated.",
    actor: "Actor: System (auto)",
    tags: [{ label: "Ops", cat: "Ops" }, { label: "Incident", cat: "Incident" }],
  },
  {
    time: "Mar 23 · 2:15 PM",
    category: "Content",
    action: "Skill Blocked — Fractions: Mixed Numbers (SK-0284)",
    detail: "Auto-blocked: wrong-answer-as-correct reports exceeded threshold (8 reports). Delivery locked. Curriculum team notified. Skill served in 1,240 sessions before block.",
    actor: "Actor: System (auto-block)",
    tags: [{ label: "Content", cat: "Content" }],
  },
  {
    time: "Mar 22 · 4:30 PM",
    category: "Release",
    action: 'Release v2.5 "Assignment Engine" Launched to Production',
    detail: "Gate score 94/100. All categories passed. Stakeholder sign-off complete (Founder + Lead Eng + Curriculum Lead). 3 skills locked at launch (curriculum review pending).",
    actor: "Actor: Owner (launch confirmed) · Engineering",
    tags: [{ label: "Release", cat: "Release" }],
  },
  {
    time: "Mar 20 · 10:00 AM",
    category: "Privacy",
    action: "Student Data Deletion Request Processed — School: Riverside Elementary",
    detail: "Right-to-erasure request received from parent. Student data (session logs, mastery scores, play events) deleted from primary database and analytics warehouse. Anonymised aggregate data retained per data minimisation policy. 72h processing time (within 30-day statutory requirement).",
    actor: "Actor: System (automated GDPR pipeline) + Owner verified",
    tags: [{ label: "Privacy", cat: "Privacy" }, { label: "FERPA/GDPR", cat: "FERPA/GDPR" }],
  },
  {
    time: "Mar 18 · 9:15 AM",
    category: "Account",
    action: "New School Onboarded — Cedar Valley Prep",
    detail: "School contract signed. Admin account created. 3 teacher accounts provisioned. Data processing agreement (DPA) countersigned. FERPA covered entity verification complete.",
    actor: "Actor: Owner (onboarding flow)",
    tags: [{ label: "Account", cat: "Account" }],
  },
  {
    time: "Mar 15 · 3:00 PM",
    category: "Security",
    action: "Owner MFA Configuration Updated",
    detail: "TOTP device re-enrolled (previous device lost). Previous TOTP device invalidated. Login session on previous device forcibly terminated.",
    actor: "Actor: Owner (authenticated with backup code)",
    tags: [{ label: "Security", cat: "Security" }],
  },
  {
    time: "Mar 10 · 11:55 PM",
    category: "Privacy",
    action: "Automated Intervention Anonymisation — Retention Policy",
    detail: "Batch job: interventions older than 90 days anonymised. 48 records processed: student_id null, teacher_notes deleted. Aggregate trigger/resolution stats retained. No personally identifiable data retained.",
    actor: "Actor: System (nightly cron)",
    tags: [{ label: "Privacy", cat: "Privacy" }, { label: "Automation", cat: "Automation" }],
  },
  {
    time: "Mar 5 · 2:00 PM",
    category: "Content",
    action: "Skill Unblocked — Fractions: Equivalent (SK-0281)",
    detail: "Answer key corrected (question_ids 3280, 3285). Curriculum team reviewed and approved. Skill re-published to production. Review log entry: Retested by 2 reviewers. Clear.",
    actor: "Actor: Owner (approved unblock)",
    tags: [{ label: "Content", cat: "Content" }],
  },
];

const CATEGORIES: LogCategory[] = ["Privacy", "Content", "Ops", "Security", "Release", "Account"];

export default async function OwnerGovernancePage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  if (!allowed) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <OwnerGate configured={configured} />
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", background: BASE, minHeight: "100vh", padding: "24px 20px", color: TEXT }}>

        {/* Page title */}
        <div style={{ maxWidth: 1100, margin: "0 auto 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: 6 }}>Owner · Compliance</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: TEXT, margin: 0 }}>Governance Log</h1>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 4, marginBottom: 0 }}>Immutable audit trail — Privacy · Content · Ops · Security · Release · Account events. 7-year FERPA retention.</p>
        </div>

        {/* ── Governance log shell ─────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto 32px", background: "#0d1117", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>

          {/* Shell header */}
          <div style={{ background: "#010409", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>Governance Log</span>
              <span style={{ fontSize: 11, color: MUTED2 }}>Immutable audit trail · 7-year retention</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: MINT }}>&#8595; Export CSV</span>
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 8, padding: "12px 24px", background: "#010409", borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: MUTED2, textTransform: "uppercase", letterSpacing: ".06em" }}>Category</span>
            <span style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,.12)", color: TEXT }}>All</span>
            {CATEGORIES.map((cat) => (
              <span key={cat} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,.04)", color: MUTED2 }}>{cat}</span>
            ))}
            <input
              readOnly
              placeholder="Search log entries…"
              style={{ marginLeft: "auto", background: SURFACE, border: "1px solid rgba(255,255,255,.1)", borderRadius: 7, padding: "5px 12px", fontSize: 11, color: TEXT, fontFamily: "system-ui", outline: "none", width: 200 }}
            />
          </div>

          {/* Log entries */}
          <div style={{ padding: "16px 24px" }}>
            {LOG_ENTRIES.map((entry, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: i < LOG_ENTRIES.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                {/* Time */}
                <div style={{ fontSize: 10, color: MUTED2, minWidth: 100, flexShrink: 0, paddingTop: 1 }}>{entry.time}</div>

                {/* Category dot */}
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: DOT_COLORS[entry.category], marginTop: 4, flexShrink: 0 }} />

                {/* Body */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{entry.action}</div>
                  <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.4 }}>{entry.detail}</div>
                  <div style={{ fontSize: 10, color: MUTED2, marginTop: 3 }}>{entry.actor}</div>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    {entry.tags.map((t) => {
                      const style = TAG_STYLES[t.label] ?? TAG_STYLES["Account"];
                      return (
                        <span key={t.label} style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: style.bg, color: style.color }}>{t.label}</span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Retention info banner ─────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto 32px", background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "18px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: MUTED2, marginBottom: 6 }}>Log Categories</div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
              <span style={{ color: VIOLET, fontWeight: 700 }}>Privacy</span>: Data deletion, anonymisation, consent, FERPA/GDPR.<br />
              <span style={{ color: TEAL,   fontWeight: 700 }}>Content</span>: Skill publish/block/unblock, content review.<br />
              <span style={{ color: MINT,   fontWeight: 700 }}>Ops</span>: Incidents, system events, deployments.<br />
              <span style={{ color: RED,    fontWeight: 700 }}>Security</span>: MFA changes, login anomalies, access changes.<br />
              <span style={{ color: AMBER,  fontWeight: 700 }}>Release</span>: Version launches, hotfixes.<br />
              <span style={{ color: MUTED,  fontWeight: 700 }}>Account</span>: School onboard/offboard, DPA changes.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: MUTED2, marginBottom: 6 }}>Immutability</div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>Entries are append-only. No update or delete operations on the log table. Write access restricted to system service account only. Owner can view and export but cannot modify. Regular integrity checks compare log hash chain.</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: MUTED2, marginBottom: 6 }}>Retention Policy</div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
              <span style={{ color: TEXT }}>Privacy/FERPA</span>: 7 years (statutory requirement).<br />
              <span style={{ color: TEXT }}>Security</span>: 5 years.<br />
              <span style={{ color: TEXT }}>Ops/Release</span>: 3 years.<br />
              Privacy entries retained even after school contract ends.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: MUTED2, marginBottom: 6 }}>Actor Field</div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}><span style={{ color: TEXT }}>System (auto)</span> for automated actions (monitoring, cron, auto-block). <span style={{ color: TEXT }}>Owner</span> for manual actions. Engineering team name for deploy actions. No individual teacher names — school name only for school-initiated events.</div>
          </div>
        </div>

        {/* ── Footer nav ───────────────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", borderTop: `1px solid ${BORDER}`, paddingTop: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/owner" style={{ fontSize: 13, color: MINT, textDecoration: "none", fontWeight: 600 }}>&#8592; Dashboard</Link>
          <Link href="/owner/feedback" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Feedback Workbench</Link>
          <Link href="/owner/feedback-summary" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Feedback Summary</Link>
          <Link href="/owner/triage" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Triage</Link>
          <Link href="/owner/content" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Content</Link>
          <Link href="/owner/release" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Release</Link>
          <Link href="/owner/roadmap" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Roadmap</Link>
          <Link href="/owner/command" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>Command</Link>
        </div>
      </div>
    </AppFrame>
  );
}
