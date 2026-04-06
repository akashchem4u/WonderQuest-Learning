import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0d1117",
  bgDeep: "#010409",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  muted2: "rgba(255,255,255,0.25)",
  mint: "#50e890",
  violet: "#9b72ff",
  red: "#f85149",
  amber: "#f59e0b",
  teal: "#58e8c1",
} as const;

// ── Compliance items ───────────────────────────────────────────────────────────
const COMPLIANCE_ITEMS = [
  {
    label: "FERPA",
    desc: "Family Educational Rights and Privacy Act",
    detail: "Student education records protected. Data processing agreements in place for all school contracts. 7-year audit log retention.",
    status: "compliant" as const,
    lastReviewed: "Mar 2026",
  },
  {
    label: "COPPA",
    desc: "Children's Online Privacy Protection Act",
    detail: "No personal data collected from children under 13 without verifiable parental consent. School-operated exception applied per FTC guidance. No third-party behavioral advertising.",
    status: "compliant" as const,
    lastReviewed: "Mar 2026",
  },
  {
    label: "State Privacy Act (CA)",
    desc: "California Student Privacy Act / AB 1584",
    detail: "Student data used only for educational purposes. No sale or disclosure of student data. Data deletion on contract termination. Compliant contracts executed for all CA schools.",
    status: "compliant" as const,
    lastReviewed: "Feb 2026",
  },
  {
    label: "GDPR",
    desc: "General Data Protection Regulation (EU/EEA)",
    detail: "Right-to-erasure pipeline automated. Data minimisation policy enforced. DPO contact on file. Privacy notices published. No EU user data transferred outside adequate-protection countries.",
    status: "compliant" as const,
    lastReviewed: "Jan 2026",
  },
];

// ── Audit log entries ─────────────────────────────────────────────────────────
type LogCategory = "Privacy" | "Content" | "Ops" | "Security" | "Release" | "Account";

interface LogEntry {
  time: string;
  category: LogCategory;
  action: string;
  detail: string;
  actor: string;
}

const DOT_COLORS: Record<LogCategory, string> = {
  Privacy:  C.violet,
  Content:  C.teal,
  Ops:      C.mint,
  Security: C.red,
  Release:  C.amber,
  Account:  "rgba(255,255,255,.3)",
};

const LOG_ENTRIES: LogEntry[] = [
  {
    time: "Mar 24 · 11:32 AM",
    category: "Ops",
    action: "P0 Incident Resolved — Assignment Engine (INC-004)",
    detail: "Incident declared 6:10 AM, resolved 11:30 AM. Duration: 5h 20m. Root cause: Redis null payload crash in v2.5.0. Fix: Hotfix v2.5.1. 9 schools affected.",
    actor: "Owner + System (auto-close on healthy)",
  },
  {
    time: "Mar 24 · 11:30 AM",
    category: "Release",
    action: "Hotfix v2.5.1 Deployed to Production",
    detail: "Deployed by engineering. Resolved assignment queue consumer null payload crash. No data migration required. All tests passed pre-deploy.",
    actor: "Engineering (Sam) · CI/CD pipeline",
  },
  {
    time: "Mar 24 · 6:10 AM",
    category: "Security",
    action: "P0 Incident Declared — Assignment Engine Down",
    detail: "Auto-declared by monitoring (error rate exceeded threshold). PagerDuty INC-004 created. #incidents Slack notified.",
    actor: "System (auto)",
  },
  {
    time: "Mar 23 · 2:15 PM",
    category: "Content",
    action: "Skill Blocked — Fractions: Mixed Numbers (SK-0284)",
    detail: "Auto-blocked: wrong-answer-as-correct reports exceeded threshold (8 reports). Delivery locked. Curriculum team notified.",
    actor: "System (auto-block)",
  },
  {
    time: "Mar 22 · 4:30 PM",
    category: "Release",
    action: "Release v2.5 \"Assignment Engine\" Launched to Production",
    detail: "Gate score 94/100. Stakeholder sign-off complete. 3 skills locked at launch (curriculum review pending).",
    actor: "Owner (launch confirmed) · Engineering",
  },
  {
    time: "Mar 20 · 10:00 AM",
    category: "Privacy",
    action: "Student Data Deletion Request Processed — Riverside Elementary",
    detail: "Right-to-erasure request. Student data (sessions, mastery scores, play events) deleted from primary DB and analytics warehouse. Anonymised aggregate data retained per data minimisation policy. Processed within 72h.",
    actor: "System (automated GDPR pipeline) + Owner verified",
  },
  {
    time: "Mar 18 · 9:15 AM",
    category: "Account",
    action: "New School Onboarded — Cedar Valley Prep",
    detail: "Admin account created. 3 teacher accounts provisioned. Data processing agreement countersigned. FERPA covered entity verification complete.",
    actor: "Owner (onboarding flow)",
  },
  {
    time: "Mar 15 · 3:00 PM",
    category: "Security",
    action: "Owner MFA Configuration Updated",
    detail: "TOTP device re-enrolled (previous device lost). Previous TOTP device invalidated. Login session on previous device forcibly terminated.",
    actor: "Owner (authenticated with backup code)",
  },
  {
    time: "Mar 10 · 11:55 PM",
    category: "Privacy",
    action: "Automated Intervention Anonymisation — Retention Policy",
    detail: "Batch job: interventions older than 90 days anonymised. 48 records processed: student_id null, teacher_notes deleted. Aggregate stats retained.",
    actor: "System (nightly cron)",
  },
  {
    time: "Mar 5 · 2:00 PM",
    category: "Content",
    action: "Skill Unblocked — Fractions: Equivalent (SK-0281)",
    detail: "Answer key corrected. Curriculum team reviewed and approved. Skill re-published. Retested by 2 reviewers.",
    actor: "Owner (approved unblock)",
  },
];

// ── Retention policy rows ─────────────────────────────────────────────────────
const RETENTION_ROWS = [
  { category: "Privacy / FERPA events", period: "7 years", note: "Statutory requirement — retained even after contract end" },
  { category: "Security events", period: "5 years", note: "Audit and SOC 2 readiness" },
  { category: "Ops / Release events", period: "3 years", note: "Incident review and release history" },
  { category: "Content / Account events", period: "3 years", note: "Content integrity and school lifecycle" },
  { category: "Session / play telemetry", period: "2 years", note: "Anonymised after 90 days; raw deleted at 2 years" },
];

export default async function GovernancePage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  return (
    <AppFrame audience="owner">
      {!allowed ? (
        <OwnerGate configured={configured} />
      ) : (
        <main
          style={{
            minHeight: "100vh",
            background: C.bg,
            padding: "28px 24px 56px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: C.text,
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            {/* ── Header ──────────────────────────────────────────────── */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.muted, marginBottom: 4 }}>
                Owner · Compliance
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: "0 0 4px" }}>
                📋 Governance Log
              </h1>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                Immutable audit trail — Privacy · Content · Ops · Security · Release · Account events · 7-year FERPA retention
              </p>
            </div>

            {/* ── Compliance items ─────────────────────────────────────── */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 12 }}>
                Key Compliance
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {COMPLIANCE_ITEMS.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      padding: "16px 18px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "rgba(80,232,144,.15)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 900,
                          color: C.mint,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: C.mint }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 4 }}>{item.desc}</div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 8 }}>{item.detail}</div>
                    <div style={{ fontSize: 10, color: C.muted2 }}>Last reviewed: {item.lastReviewed}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Audit log ────────────────────────────────────────────── */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2 }}>
                  Audit Log
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>Append-only · No modify/delete permitted</div>
              </div>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                {/* Log header bar */}
                <div
                  style={{
                    background: C.bgDeep,
                    padding: "12px 20px",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: "uppercase", letterSpacing: ".06em", marginRight: 4 }}>Category</span>
                  {(["Privacy", "Content", "Ops", "Security", "Release", "Account"] as LogCategory[]).map((cat) => (
                    <span
                      key={cat}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 9px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        background: "rgba(255,255,255,.04)",
                        color: DOT_COLORS[cat],
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: DOT_COLORS[cat], display: "inline-block" }} />
                      {cat}
                    </span>
                  ))}
                </div>
                {/* Entries */}
                <div style={{ padding: "4px 0" }}>
                  {LOG_ENTRIES.map((entry, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 14,
                        padding: "12px 20px",
                        borderBottom: i < LOG_ENTRIES.length - 1 ? `1px solid rgba(255,255,255,.04)` : "none",
                      }}
                    >
                      {/* Timestamp */}
                      <div style={{ fontSize: 10, color: C.muted2, minWidth: 110, flexShrink: 0, paddingTop: 2, lineHeight: 1.4 }}>
                        {entry.time}
                      </div>
                      {/* Category dot */}
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: DOT_COLORS[entry.category],
                          marginTop: 5,
                          flexShrink: 0,
                        }}
                      />
                      {/* Body */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{entry.action}</div>
                        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 3 }}>{entry.detail}</div>
                        <div style={{ fontSize: 10, color: C.muted2 }}>Actor: {entry.actor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Data retention policy ────────────────────────────────── */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 12 }}>
                Data Retention Policy
              </div>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: C.bgDeep }}>
                      {["Data category", "Retention period", "Notes"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                            color: C.muted2,
                            padding: "10px 16px",
                            borderBottom: `1px solid ${C.border}`,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RETENTION_ROWS.map((row, i) => (
                      <tr
                        key={row.category}
                        style={{ borderBottom: i < RETENTION_ROWS.length - 1 ? `1px solid rgba(255,255,255,.04)` : "none" }}
                      >
                        <td style={{ padding: "10px 16px", color: C.text, fontWeight: 600 }}>{row.category}</td>
                        <td style={{ padding: "10px 16px", color: C.mint, fontWeight: 700, whiteSpace: "nowrap" }}>{row.period}</td>
                        <td style={{ padding: "10px 16px", color: C.muted }}>{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 14px",
                  background: C.bgDeep,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontSize: 11,
                  color: C.muted,
                }}
              >
                Audit log entries are append-only and immutable. No update or delete operations are permitted on the log table. Write access is restricted to the system service account only. Owner can view and export — not modify.
              </div>
            </div>

            {/* ── Footer nav ───────────────────────────────────────────── */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Link href="/owner/safety-review" style={{ fontSize: 13, color: C.mint, textDecoration: "none", fontWeight: 600 }}>Safety Review</Link>
              <Link href="/owner/command" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Command Centre</Link>
              <Link href="/owner/incident" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Incident Log</Link>
              <Link href="/owner/kpi" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>KPI Dashboard</Link>
            </div>
          </div>
        </main>
      )}
    </AppFrame>
  );
}
