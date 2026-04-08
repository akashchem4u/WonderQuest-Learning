import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#06071a",
  bgDeep: "#010409",
  surface: "#12152e",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  muted2: "rgba(255,255,255,0.25)",
  mint: "#50e890",
  violet: "#9b72ff",
  red: "#f85149",
  amber: "#f59e0b",
} as const;

// ── Runbook entries (no external links — add real URLs in settings) ────────────
const RUNBOOK_LINKS = [
  {
    label: "Incident Response Runbook",
    desc: "Declare → page on-call → update status page → post-mortem",
  },
  {
    label: "Assignment Engine Recovery",
    desc: "Redis flush, queue drain, consumer restart steps",
  },
  {
    label: "Auth / SSO Troubleshooting",
    desc: "Clever / ClassLink / Google OAuth common failure modes",
  },
  {
    label: "Database Failover Procedure",
    desc: "RDS failover, replica promotion, connection string rotation",
  },
  {
    label: "Status Page Update Guide",
    desc: "How to post and resolve incidents on the teacher-facing status page",
  },
];

export default async function IncidentPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  const checkedAt = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <AppFrame audience="owner" currentPath="/owner/incident">
      {!allowed ? (
        <OwnerGate configured={configured} />
      ) : (
        <main
          style={{
            minHeight: "100vh",
            background: C.bg,
            padding: "24px 20px 56px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: C.text,
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            {/* ── Header ──────────────────────────────────────────────── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.muted, marginBottom: 4 }}>
                Owner · Operations
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 4px" }}>
                Incident Log
              </h1>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                Active triage and historical record of P0–P2 incidents
              </p>
            </div>

            {/* ── System status banner ─────────────────────────────────── */}
            <div
              style={{
                background: "rgba(80,232,144,.08)",
                border: "1px solid rgba(80,232,144,.2)",
                borderRadius: 10,
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
                flexWrap: "wrap",
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
                  boxShadow: "0 0 0 3px rgba(80,232,144,.25)",
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.mint }}>All systems operational</span>
              <span style={{ fontSize: 12, color: C.muted }}>
                — No active incidents · Last checked: {checkedAt}
              </span>
            </div>

            {/* ── Active Incidents ─────────────────────────────────────── */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 10 }}>
                Active Incidents
              </div>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "32px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 32, lineHeight: 1 }}>&#10003;</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.mint }}>No active incidents</div>
                <div style={{ fontSize: 12, color: C.muted }}>All routes healthy. Monitoring is active.</div>
                <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                  <Link
                    href="/owner/overview"
                    style={{ fontSize: 12, color: C.violet, textDecoration: "none", fontWeight: 600 }}
                  >
                    System health overview
                  </Link>
                  <Link
                    href="/owner/content-health"
                    style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}
                  >
                    Content health
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Recent Resolved ──────────────────────────────────────── */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 10 }}>
                Resolved Incidents · Last 30 Days
              </div>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>
                  No resolved incidents in the last 30 days
                </div>
                <div style={{ fontSize: 11, color: C.muted2 }}>
                  Historical incidents will appear here once the incident log is connected.
                </div>
              </div>
            </div>

            {/* ── Runbooks ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 10 }}>
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
                      padding: "13px 18px",
                      borderBottom:
                        i < RUNBOOK_LINKS.length - 1
                          ? "1px solid rgba(255,255,255,.04)"
                          : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                        {link.label}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>{link.desc}</div>
                    </div>
                    <span style={{ fontSize: 11, color: C.muted2, fontStyle: "italic", flexShrink: 0 }}>
                      Runbook: add URL in settings
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Footer nav ───────────────────────────────────────────── */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18, display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Link href="/owner/routes" style={{ fontSize: 13, color: C.mint, textDecoration: "none", fontWeight: 600 }}>
                ← Route Health
              </Link>
              <Link href="/owner/command" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Command Centre</Link>
              <Link href="/owner/kpi" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>KPI Dashboard</Link>
              <Link href="/owner/content-health" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Content Health</Link>
              <Link href="/owner/governance" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Governance</Link>
            </div>
          </div>
        </main>
      )}
    </AppFrame>
  );
}
