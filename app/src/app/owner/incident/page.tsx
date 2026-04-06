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
} as const;

// ── Static data: resolved incidents ───────────────────────────────────────────
const RESOLVED_INCIDENTS = [
  {
    id: "INC-004",
    title: "Assignment Engine — Queue Processing Failure",
    severity: "P0",
    severityColor: C.red,
    severityBg: "rgba(248,81,73,.12)",
    affectedArea: "Assignment Engine",
    resolvedDate: "Mar 24, 2026 · 11:30 AM",
    duration: "5h 20m",
    rootCause: "Redis queue consumer crash on null task payload (v2.5.0 regression)",
    fix: "Hotfix v2.5.1 — null guard in consumer loop",
    schoolsAffected: 9,
    slaMet: false,
  },
  {
    id: "INC-003",
    title: "Adaptive Engine — Elevated Latency",
    severity: "P1",
    severityColor: C.amber,
    severityBg: "rgba(245,158,11,.12)",
    affectedArea: "Adaptive Engine",
    resolvedDate: "Feb 12, 2026 · 3:15 PM",
    duration: "47m",
    rootCause: "Cold start spike after scheduled maintenance window",
    fix: "Warmed up Lambda instances; added pre-warm ping scheduled job",
    schoolsAffected: 0,
    slaMet: true,
  },
  {
    id: "INC-002",
    title: "Auth / SSO — Login Failures for Clever-linked Accounts",
    severity: "P1",
    severityColor: C.amber,
    severityBg: "rgba(245,158,11,.12)",
    affectedArea: "Auth / SSO",
    resolvedDate: "Jan 8, 2026 · 9:50 AM",
    duration: "1h 12m",
    rootCause: "Clever OAuth token refresh endpoint returned unexpected 429 rate limit",
    fix: "Added exponential back-off retry on Clever token refresh; alerted Clever support",
    schoolsAffected: 3,
    slaMet: true,
  },
  {
    id: "INC-001",
    title: "Database — Read Replica Lag Spike",
    severity: "P2",
    severityColor: C.violet,
    severityBg: "rgba(155,114,255,.12)",
    affectedArea: "Database",
    resolvedDate: "Dec 3, 2025 · 6:22 PM",
    duration: "23m",
    rootCause: "Bulk curriculum import job saturated read replica I/O",
    fix: "Routed bulk import jobs to primary write path; added I/O alarm threshold",
    schoolsAffected: 0,
    slaMet: true,
  },
];

const RUNBOOK_LINKS = [
  { label: "Incident Response Runbook", href: "https://example.com/runbooks/incident-response", desc: "Declare → page on-call → update status page → post-mortem" },
  { label: "Assignment Engine Recovery", href: "https://example.com/runbooks/assignment-engine", desc: "Redis flush, queue drain, consumer restart steps" },
  { label: "Auth / SSO Troubleshooting", href: "https://example.com/runbooks/auth-sso", desc: "Clever / ClassLink / Google OAuth common failure modes" },
  { label: "Database Failover Procedure", href: "https://example.com/runbooks/db-failover", desc: "RDS failover, replica promotion, connection string rotation" },
  { label: "Status Page Update Guide", href: "https://example.com/runbooks/status-page", desc: "How to post and resolve incidents on the teacher-facing status page" },
];

export default async function IncidentPage() {
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
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.muted, marginBottom: 4 }}>
                Owner · Operations
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: "0 0 4px" }}>
                🚨 Incident Log
              </h1>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                Historical record of all P0–P2 incidents, root causes, and resolutions
              </p>
            </div>

            {/* ── System status banner ─────────────────────────────────── */}
            <div
              style={{
                background: "rgba(80,232,144,.08)",
                border: `1px solid rgba(80,232,144,.2)`,
                borderRadius: 10,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: C.mint,
                  display: "inline-block",
                  flexShrink: 0,
                  boxShadow: `0 0 0 3px rgba(80,232,144,.25)`,
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.mint }}>All systems operational</span>
              <span style={{ fontSize: 12, color: C.muted, marginLeft: 4 }}>— No active incidents · Last checked on page load</span>
            </div>

            {/* ── Active incidents ─────────────────────────────────────── */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 12 }}>
                Active Incidents
              </div>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 28 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.mint }}>No active incidents</div>
                <div style={{ fontSize: 12, color: C.muted }}>All routes healthy. Monitoring is active.</div>
              </div>
            </div>

            {/* ── Resolved incidents ───────────────────────────────────── */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 12 }}>
                Resolved Incidents
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {RESOLVED_INCIDENTS.map((inc) => (
                  <div
                    key={inc.id}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      padding: "18px 20px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: 5,
                            background: inc.severityBg,
                            color: inc.severityColor,
                            letterSpacing: ".04em",
                          }}
                        >
                          {inc.severity}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{inc.title}</span>
                        <span style={{ fontSize: 11, color: C.muted2 }}>{inc.id}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 4,
                            background: inc.slaMet ? "rgba(80,232,144,.1)" : "rgba(245,158,11,.12)",
                            color: inc.slaMet ? C.mint : C.amber,
                          }}
                        >
                          {inc.slaMet ? "SLA met" : "SLA missed"}
                        </span>
                        <span style={{ fontSize: 11, color: C.mint, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "rgba(80,232,144,.08)" }}>
                          Resolved
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "6px 24px", fontSize: 12 }}>
                      <div>
                        <span style={{ color: C.muted2 }}>Resolved: </span>
                        <span style={{ color: C.text }}>{inc.resolvedDate}</span>
                      </div>
                      <div>
                        <span style={{ color: C.muted2 }}>Duration: </span>
                        <span style={{ color: C.text, fontWeight: 600 }}>{inc.duration}</span>
                      </div>
                      {inc.schoolsAffected > 0 && (
                        <div>
                          <span style={{ color: C.muted2 }}>Schools affected: </span>
                          <span style={{ color: C.amber, fontWeight: 700 }}>{inc.schoolsAffected}</span>
                        </div>
                      )}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <span style={{ color: C.muted2 }}>Root cause: </span>
                        <span style={{ color: C.text }}>{inc.rootCause}</span>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <span style={{ color: C.muted2 }}>Fix: </span>
                        <span style={{ color: C.mint }}>{inc.fix}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Runbook links ────────────────────────────────────────── */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 12 }}>
                Runbooks &amp; Remediation
              </div>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {RUNBOOK_LINKS.map((link, i) => (
                  <div
                    key={link.label}
                    style={{
                      padding: "14px 20px",
                      borderBottom: i < RUNBOOK_LINKS.length - 1 ? `1px solid rgba(255,255,255,.04)` : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{link.label}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{link.desc}</div>
                    </div>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, color: C.mint, textDecoration: "none", fontWeight: 600, flexShrink: 0 }}
                    >
                      Open ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Footer nav ───────────────────────────────────────────── */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Link href="/owner/routes" style={{ fontSize: 13, color: C.mint, textDecoration: "none", fontWeight: 600 }}>← Route Health</Link>
              <Link href="/owner/command" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Command Centre</Link>
              <Link href="/owner/kpi" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>KPI Dashboard</Link>
              <Link href="/owner/governance" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Governance</Link>
            </div>
          </div>
        </main>
      )}
    </AppFrame>
  );
}
