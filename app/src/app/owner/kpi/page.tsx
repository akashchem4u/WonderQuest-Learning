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

// ── Hardcoded KPI data ─────────────────────────────────────────────────────────
// These represent realistic production metrics. API endpoint for live KPIs is
// planned — for now these are hardcoded to illustrate the dashboard shape.

const KPI_CARDS = [
  { label: "MAU", value: "1,380", sub: "Monthly active users (30d)", accent: C.mint },
  { label: "Sessions / day", value: "298", sub: "Daily average over 30d" },
  { label: "D7 Retention", value: "59%", sub: "Users active 7 days after first session", accent: C.mint },
  { label: "D30 Retention", value: "36%", sub: "Users active 30 days after first session" },
  { label: "Avg streak", value: "3.9d", sub: "Median consecutive days active" },
];

const FUNNEL = [
  { label: "Registration", count: 1_380, pct: 100, color: C.mint },
  { label: "First session", count: 1_117, pct: 81, color: "rgba(80,232,144,.6)" },
  { label: "3 sessions", count: 773, pct: 56, color: "rgba(80,232,144,.4)" },
  { label: "7-day streak", count: 303, pct: 22, color: C.violet },
];

const BANDS = [
  { label: "P0 — Foundation", students: 487, color: C.mint },
  { label: "P1 — Building", students: 392, color: C.teal },
  { label: "P2 — Expanding", students: 264, color: C.violet },
  { label: "P3 — Advanced", students: 118, color: C.amber },
];

const MAX_BAND = 487;

export default async function KpiPage() {
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
                Owner · Analytics
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: "0 0 4px" }}>
                📊 KPI Dashboard
              </h1>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                Engagement, retention, and cohort metrics · 30-day window · hardcoded pilot data
              </p>
            </div>

            {/* ── Period selector pills (visual only — data is 30d) ────── */}
            <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
              {["7d", "30d", "90d"].map((p) => (
                <div
                  key={p}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    background: p === "30d" ? C.surface : "transparent",
                    color: p === "30d" ? C.text : C.muted,
                    border: `1px solid ${p === "30d" ? C.border : "transparent"}`,
                    cursor: "default",
                  }}
                >
                  {p}
                </div>
              ))}
            </div>

            {/* ── Top KPI cards ────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
              {KPI_CARDS.map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "18px 20px",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted2, marginBottom: 8 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: card.accent ?? C.text, lineHeight: 1, marginBottom: 4 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {card.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Funnel + Band adoption ───────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>

              {/* Cohort funnel */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2 }}>Cohort Funnel</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 20 }}>Registration → engagement depth · 30d cohort</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {FUNNEL.map((step) => (
                    <div key={step.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{step.label}</span>
                        <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 900, color: step.color }}>{step.count.toLocaleString()}</span>
                          <span style={{ fontSize: 10, color: C.muted2 }}>{step.pct}%</span>
                        </span>
                      </div>
                      <div style={{ height: 7, background: "rgba(255,255,255,.06)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${step.pct}%`, background: step.color, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Band adoption */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2 }}>Band Adoption</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 20 }}>Active students per curriculum band · all time</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {BANDS.map((band) => (
                    <div key={band.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{band.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: band.color }}>{band.students}</span>
                      </div>
                      <div style={{ height: 7, background: "rgba(255,255,255,.06)", borderRadius: 4, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.round((band.students / MAX_BAND) * 100)}%`,
                            background: band.color,
                            borderRadius: 4,
                            opacity: 0.85,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Data freshness note ──────────────────────────────────── */}
            <div
              style={{
                background: C.bgDeep,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "14px 18px",
                fontSize: 11,
                color: C.muted,
                marginBottom: 32,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.amber, display: "inline-block", flexShrink: 0 }} />
              <span>
                KPI metrics are hardcoded pilot data (30d window). A live KPI API endpoint is planned — connect it to replace these values.
                Live session and feedback data is available at{" "}
                <Link href="/owner/command" style={{ color: C.mint, textDecoration: "none", fontWeight: 600 }}>Command Centre</Link>.
              </span>
            </div>

            {/* ── Footer nav ───────────────────────────────────────────── */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Link href="/owner/command" style={{ fontSize: 13, color: C.mint, textDecoration: "none", fontWeight: 600 }}>← Command Centre</Link>
              <Link href="/owner/adoption" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Adoption</Link>
              <Link href="/owner/incident" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Incident Log</Link>
              <Link href="/owner/governance" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Governance</Link>
            </div>
          </div>
        </main>
      )}
    </AppFrame>
  );
}
