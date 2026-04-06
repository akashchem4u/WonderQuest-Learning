"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import OwnerGate from "@/app/owner/owner-gate";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  bg: "#0d1117",
  bgDeep: "#010409",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  mint: "#50e890",
  violet: "#9b72ff",
  red: "#f85149",
  amber: "#f59e0b",
} as const;

// ── Stub data ─────────────────────────────────────────────────────────────────
type Period = "7d" | "30d" | "90d" | "all";

type KpiCell = {
  label: string;
  val: string;
  valColor?: string;
  valSize?: string;
  delta: string;
  deltaColor: string;
  sub: string;
  alert?: boolean;
  warn?: boolean;
  active?: boolean;
};

const KPI_HEALTHY_30D: KpiCell[] = [
  { label: "MAU", val: "4,812", delta: "▲ +9.2%", deltaColor: C.mint, sub: "vs prev 30d", active: true },
  { label: "DAU (avg)", val: "842", delta: "▲ +6.4%", deltaColor: C.mint, sub: "vs prev 30d" },
  { label: "MRR", val: "$8.4K", delta: "▲ +5.0%", deltaColor: C.mint, sub: "vs prev 30d" },
  { label: "ARR", val: "$101K", delta: "▲ +12%", deltaColor: C.mint, sub: "annualised" },
  { label: "Schools", val: "23", delta: "▲ +2", deltaColor: C.mint, sub: "active this month" },
  { label: "Feedback", val: "6", delta: "— P0+P1 open", deltaColor: "rgba(255,255,255,.3)", sub: "42 total this month" },
  { label: "Release Gate", val: "● Open", valColor: C.mint, valSize: "14px", delta: "94/100", deltaColor: "rgba(255,255,255,.3)", sub: "v2.5.1" },
  { label: "Route Health", val: "● All Up", valColor: C.mint, valSize: "14px", delta: "10/10 routes", deltaColor: "rgba(255,255,255,.3)", sub: "99.94% uptime" },
];

const KPI_HEALTHY_7D: KpiCell[] = [
  { label: "MAU", val: "4,812", delta: "— (month metric)", deltaColor: "rgba(255,255,255,.3)", sub: "full month shown" },
  { label: "DAU (avg)", val: "891", delta: "▲ +5.8%", deltaColor: C.mint, sub: "vs prev 7d" },
  { label: "MRR", val: "$8.4K", delta: "— (month metric)", deltaColor: "rgba(255,255,255,.3)", sub: "full month shown" },
  { label: "ARR", val: "$101K", delta: "— (month metric)", deltaColor: "rgba(255,255,255,.3)", sub: "annualised" },
  { label: "Sessions", val: "5,902", delta: "▲ +3.1%", deltaColor: C.mint, sub: "7d total" },
  { label: "Feedback", val: "6", delta: "— P0+P1 open", deltaColor: "rgba(255,255,255,.3)", sub: "9 new this week" },
  { label: "Release Gate", val: "● Open", valColor: C.mint, valSize: "14px", delta: "94/100", deltaColor: "rgba(255,255,255,.3)", sub: "v2.5.1" },
  { label: "Route Health", val: "● All Up", valColor: C.mint, valSize: "14px", delta: "10/10 routes", deltaColor: "rgba(255,255,255,.3)", sub: "99.94% uptime" },
];

const KPI_INCIDENT_30D: KpiCell[] = [
  { label: "MAU", val: "4,812", delta: "▲ +9.2%", deltaColor: C.mint, sub: "vs prev 30d" },
  { label: "DAU (avg)", val: "842", delta: "▲ +6.4%", deltaColor: C.mint, sub: "vs prev 30d" },
  { label: "MRR", val: "$8.4K", delta: "▲ +5.0%", deltaColor: C.mint, sub: "vs prev 30d" },
  { label: "ARR", val: "$101K", delta: "▲ +12%", deltaColor: C.mint, sub: "annualised" },
  { label: "Schools", val: "23", delta: "— active", deltaColor: "rgba(255,255,255,.3)", sub: "9 affected now" },
  { label: "Feedback", val: "8", delta: "▲ +2 since incident", deltaColor: C.red, sub: "P0+P1 open", warn: true },
  { label: "Release Gate", val: "● Open", valColor: C.mint, valSize: "14px", delta: "94/100", deltaColor: "rgba(255,255,255,.3)", sub: "v2.5.1" },
  { label: "Route Health", val: "1 DOWN", valColor: C.red, delta: "🚨 P0 · 5h 23m", deltaColor: C.red, sub: "Assignment Engine", alert: true },
];

type Variant = "healthy" | "incident";

// ── Page ──────────────────────────────────────────────────────────────────────
export default function KpiPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [variant, setVariant] = useState<Variant>("healthy");

  const allowed = true;
  if (!allowed) {
    return <OwnerGate configured={false} />;
  }

  const cells =
    variant === "incident"
      ? KPI_INCIDENT_30D
      : period === "7d"
      ? KPI_HEALTHY_7D
      : KPI_HEALTHY_30D;

  const isIncident = variant === "incident";
  const stripBg = isIncident ? "rgba(10,2,3,1)" : C.bgDeep;
  const shellBorder = isIncident ? "rgba(248,81,73,.2)" : C.border;

  const PERIODS: { id: Period; label: string }[] = [
    { id: "7d", label: "7d" },
    { id: "30d", label: "30d" },
    { id: "90d", label: "90d" },
    { id: "all", label: "All Time" },
  ];

  return (
    <AppFrame audience="owner">
      <main
        style={{
          minHeight: "100vh",
          background: C.base,
          padding: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: C.text,
        }}
      >
        {/* ── Page title ────────────────────────────────────────────────── */}
        <div style={{ fontSize: "22px", fontWeight: 700, color: C.text, marginBottom: "20px" }}>
          KPI Strip
        </div>

        {/* ── Variant selector ──────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px" }}>
          {(["healthy", "incident"] as Variant[]).map((v) => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "system-ui",
                background: variant === v ? "#2563eb" : "#fff",
                color: variant === v ? "#fff" : "#555",
              }}
            >
              {v === "healthy" ? "All Healthy" : "With Incident"}
            </button>
          ))}
        </div>

        {/* ── KPI strip shell ───────────────────────────────────────────── */}
        <div
          style={{
            background: C.bg,
            borderRadius: "16px",
            overflow: "hidden",
            border: `1px solid ${shellBorder}`,
            marginBottom: "28px",
          }}
        >
          {/* Period bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              background: stripBg,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "flex", gap: "4px" }}>
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "system-ui",
                    background: period === p.id ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)",
                    color: period === p.id ? C.text : "rgba(255,255,255,.3)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: isIncident ? C.red : "rgba(255,255,255,.25)",
                fontWeight: isIncident ? 700 : 400,
              }}
            >
              {isIncident
                ? "🚨 P0 INCIDENT ACTIVE · Route Health updating every 10s"
                : "Updated 3 min ago · refreshes every 5 min"}
            </div>
          </div>

          {/* KPI strip grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8,1fr)",
              background: stripBg,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {cells.map((cell, i) => (
              <div
                key={cell.label}
                style={{
                  padding: "14px 16px",
                  borderRight: i < cells.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                  cursor: "pointer",
                  position: "relative",
                  background: cell.alert
                    ? "rgba(248,81,73,.04)"
                    : cell.warn
                    ? "rgba(245,158,11,.03)"
                    : cell.active
                    ? "rgba(80,232,144,.05)"
                    : "transparent",
                }}
              >
                {/* Active / alert underline */}
                {(cell.active || cell.alert) && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: cell.alert ? C.red : C.mint,
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    color: cell.alert ? C.red : "rgba(255,255,255,.3)",
                    marginBottom: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cell.label}
                </div>
                <div
                  style={{
                    fontSize: cell.valSize ?? "20px",
                    fontWeight: 900 as const,
                    color: cell.valColor ?? (cell.alert ? C.red : C.text),
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}
                >
                  {cell.val}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    color: cell.deltaColor,
                  }}
                >
                  {cell.delta}
                </div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,.25)", marginTop: "2px" }}>
                  {cell.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Content area */}
          <div
            style={{
              padding: "20px 24px",
              background: isIncident ? "rgba(248,81,73,.04)" : "transparent",
              borderTop: isIncident ? "1px solid rgba(248,81,73,.1)" : "none",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: isIncident ? C.red : C.text,
                marginBottom: "6px",
              }}
            >
              {isIncident
                ? "⚠️ P0 Incident Active — Assignment Engine Down"
                : "KPI Strip — All Healthy"}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,.3)", lineHeight: 1.5 }}>
              {isIncident
                ? "Route Health cell turns red (background + underline + text). Update frequency bumped to 10s for Route Health only. Feedback count jumps as teacher reports come in. Period bar shows \"P0 INCIDENT ACTIVE\" warning. All other KPIs unchanged."
                : period === "7d"
                ? "MAU and MRR are monthly metrics — they always show the current month value regardless of period selector. When 7d is selected, Sessions replaces Schools cell since DAU/Sessions are more relevant at 7d granularity."
                : "Green underline on MAU cell (active example). Feedback shows 6 open P0+P1 items as a number badge. Release Gate and Route Health show text status dots instead of numbers. Click any cell to navigate to its detail page."}
            </div>
          </div>
        </div>

        {/* ── Degraded (amber) variant ──────────────────────────────────── */}
        <div style={{ marginBottom: "12px", fontSize: "13px", fontWeight: 700, color: "rgba(240,246,255,.6)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
          Degraded (amber) variant — Reports route slow
        </div>
        <div
          style={{
            background: C.bg,
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(245,158,11,.2)",
            marginBottom: "28px",
          }}
        >
          {/* Period bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              background: C.bgDeep,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "flex", gap: "4px" }}>
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "system-ui",
                    background: p.id === "30d" ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)",
                    color: p.id === "30d" ? C.text : "rgba(255,255,255,.3)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: "10px", color: C.amber, fontWeight: 700 }}>
              ⚠ Route degraded · Updated 2 min ago
            </div>
          </div>

          {/* Degraded strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8,1fr)",
              background: C.bgDeep,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {[
              { label: "MAU", val: "4,812", delta: "▲ +9.2%", deltaColor: C.mint, sub: "vs prev 30d" },
              { label: "DAU (avg)", val: "842", delta: "▲ +6.4%", deltaColor: C.mint, sub: "vs prev 30d" },
              { label: "MRR", val: "$8.4K", delta: "▲ +5.0%", deltaColor: C.mint, sub: "vs prev 30d" },
              { label: "ARR", val: "$101K", delta: "▲ +12%", deltaColor: C.mint, sub: "annualised" },
              { label: "Schools", val: "23", delta: "▲ +2", deltaColor: C.mint, sub: "active this month" },
              { label: "Feedback", val: "6", delta: "— P0+P1 open", deltaColor: "rgba(255,255,255,.3)", sub: "42 total this month" },
              { label: "Release Gate", val: "● Open", valColor: C.mint, valSize: "14px", delta: "94/100", deltaColor: "rgba(255,255,255,.3)", sub: "v2.5.1" },
              { label: "Route Health", val: "⚠ Degraded", valColor: C.amber, valSize: "13px", delta: "1 slow route", deltaColor: C.amber, sub: "Reports p95: 620ms", warn: true },
            ].map((cell, i) => (
              <div
                key={cell.label}
                style={{
                  padding: "14px 16px",
                  borderRight: i < 7 ? "1px solid rgba(255,255,255,.04)" : "none",
                  cursor: "pointer",
                  background: cell.warn ? "rgba(245,158,11,.03)" : "transparent",
                }}
              >
                <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "rgba(255,255,255,.3)", marginBottom: "6px", whiteSpace: "nowrap" }}>
                  {cell.label}
                </div>
                <div
                  style={{
                    fontSize: (cell as KpiCell).valSize ?? "20px",
                    fontWeight: 900,
                    color: (cell as KpiCell).valColor ?? C.text,
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}
                >
                  {cell.val}
                </div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: cell.deltaColor, display: "flex", alignItems: "center", gap: "3px" }}>
                  {cell.delta}
                </div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,.25)", marginTop: "2px" }}>{cell.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: C.text, marginBottom: "6px" }}>
              Degraded State — Amber, Not Red
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,.3)", lineHeight: 1.5 }}>
              Route Health cell turns amber for degraded (not down). Reports route has custom SLA of 500ms p95. At 620ms it shows amber "Degraded" rather than red "DOWN". No P0 incident is declared. Feedback count unchanged. Update frequency stays at 60s (not bumped to 10s).
            </div>
          </div>
        </div>

        {/* ── KPI cell reference table ──────────────────────────────────── */}
        <div style={{ marginBottom: "12px", fontSize: "13px", fontWeight: 700, color: "rgba(240,246,255,.6)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
          KPI Cell Reference
        </div>
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr>
                {["Cell", "Metric", "Delta basis", "On P0 incident"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "rgba(255,255,255,.4)",
                      padding: "10px 14px",
                      borderBottom: "2px solid rgba(255,255,255,.06)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["MAU", "Monthly active users (unique students with ≥1 session in month)", "vs prev month", "Unchanged"],
                ["DAU (avg)", "Daily active users, averaged over selected period", "vs prev period", "Unchanged"],
                ["MRR", "Monthly recurring revenue (subscription contracts)", "vs prev month", "Unchanged"],
                ["ARR", "Annualised MRR (MRR × 12)", "Annualised comparison", "Unchanged"],
                ["Schools", "Schools with ≥1 active student this month", "vs prev month count", 'Shows "X affected"'],
                ["Feedback", "P0+P1 open count", "Change vs period start", 'Amber + "+X since incident"'],
                ["Release Gate", "Gate status + score", "Status text", "Unchanged"],
                ["Route Health", 'Status: All Up / Degraded / N DOWN', "Uptime %", 'Red + "N DOWN" + duration'],
              ].map(([cell, metric, delta, incident]) => (
                <tr key={cell} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                  <td style={{ padding: "8px 14px", color: C.text, fontWeight: 600, whiteSpace: "nowrap" }}>{cell}</td>
                  <td style={{ padding: "8px 14px", color: "rgba(255,255,255,.65)" }}>{metric}</td>
                  <td style={{ padding: "8px 14px", color: "rgba(255,255,255,.45)", whiteSpace: "nowrap" }}>{delta}</td>
                  <td style={{ padding: "8px 14px", color: "rgba(255,255,255,.45)" }}>{incident}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </AppFrame>
  );
}
