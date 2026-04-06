"use client";

import { useState, useEffect } from "react";
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

// ── API types ─────────────────────────────────────────────────────────────────
interface OverviewCounts {
  students: number;
  guardians: number;
  sessions: number;
  feedbackItems: number;
  totalPoints: number;
  exampleItems: number;
  explainers: number;
}

interface LatestSession {
  id: string;
  displayName: string;
  sessionMode: string;
  startedAt: string;
  endedAt: string | null;
  effectivenessScore: number | null;
}

interface OverviewData {
  counts: OverviewCounts;
  latestSessions: LatestSession[];
}

// ── Period type ────────────────────────────────────────────────────────────────
type Period = "7d" | "30d" | "90d" | "all";
type Variant = "healthy" | "incident";

// ── KPI cell type ─────────────────────────────────────────────────────────────
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

function buildCells(data: OverviewData, period: Period): KpiCell[] {
  const { counts, latestSessions } = data;
  const contentItems = counts.exampleItems + counts.explainers;

  const recentSessionCount = latestSessions.length;

  return [
    {
      label: "Students",
      val: counts.students.toLocaleString(),
      delta: "live count",
      deltaColor: "rgba(255,255,255,.3)",
      sub: "non-tester",
      active: true,
    },
    {
      label: "Guardians",
      val: counts.guardians.toLocaleString(),
      delta: "live count",
      deltaColor: "rgba(255,255,255,.3)",
      sub: "non-tester",
    },
    {
      label: period === "7d" ? "Recent Sessions" : "Total Sessions",
      val: period === "7d" ? recentSessionCount.toString() : counts.sessions.toLocaleString(),
      delta: period === "7d" ? "last 8 shown" : "all time",
      deltaColor: C.mint,
      sub: "non-tester",
    },
    {
      label: "Total Points",
      val: counts.totalPoints.toLocaleString(),
      delta: "earned",
      deltaColor: C.mint,
      sub: "all students",
    },
    {
      label: "Content Items",
      val: contentItems.toLocaleString(),
      delta: `${counts.exampleItems} examples`,
      deltaColor: "rgba(255,255,255,.3)",
      sub: `${counts.explainers} explainers`,
    },
    {
      label: "Feedback",
      val: counts.feedbackItems.toLocaleString(),
      delta: "total items",
      deltaColor: counts.feedbackItems > 20 ? C.amber : "rgba(255,255,255,.3)",
      sub: "all time",
      warn: counts.feedbackItems > 20,
    },
    {
      label: "Release Gate",
      val: "● Open",
      valColor: C.mint,
      valSize: "14px",
      delta: "94/100",
      deltaColor: "rgba(255,255,255,.3)",
      sub: "v2.5.1",
    },
    {
      label: "Route Health",
      val: "● All Up",
      valColor: C.mint,
      valSize: "14px",
      delta: "10/10 routes",
      deltaColor: "rgba(255,255,255,.3)",
      sub: "99.94% uptime",
    },
  ];
}

// ── KPI Cell Reference rows (static) ──────────────────────────────────────────
const KPI_REF_ROWS = [
  ["Students",      "Non-tester students in the platform",             "Live DB count",        "Unchanged"],
  ["Guardians",     "Non-tester guardians linked to students",         "Live DB count",        "Unchanged"],
  ["Sessions",      "Total challenge sessions by non-tester students", "All time / last 8 shown (7d)", "Unchanged"],
  ["Total Points",  "Sum of progression_state total_points",           "Live DB count",        "Unchanged"],
  ["Content Items", "Example items + explainer assets",                "Live DB count",        "Unchanged"],
  ["Feedback",      "Total feedback_items (non-tester)",               "Live DB count",        'Amber if >20'],
  ["Release Gate",  "Gate status + score",                             "Status text",          "Unchanged"],
  ["Route Health",  'Status: All Up / Degraded / N DOWN',             "Uptime %",             'Red + "N DOWN" + duration'],
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function KpiPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [variant, setVariant] = useState<Variant>("healthy");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/owner/overview")
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  const allowed = true;
  if (!allowed) {
    return <OwnerGate configured={false} />;
  }

  const isIncident = variant === "incident";
  const stripBg = isIncident ? "rgba(10,2,3,1)" : C.bgDeep;
  const shellBorder = isIncident ? "rgba(248,81,73,.2)" : C.border;

  const PERIODS: { id: Period; label: string }[] = [
    { id: "7d", label: "7d" },
    { id: "30d", label: "30d" },
    { id: "90d", label: "90d" },
    { id: "all", label: "All Time" },
  ];

  // Incident overlay cells (static design demo)
  const INCIDENT_CELLS: KpiCell[] = [
    { label: "Students", val: data ? data.counts.students.toLocaleString() : "—", delta: "live count", deltaColor: "rgba(255,255,255,.3)", sub: "non-tester" },
    { label: "Guardians", val: data ? data.counts.guardians.toLocaleString() : "—", delta: "live count", deltaColor: "rgba(255,255,255,.3)", sub: "non-tester" },
    { label: "Sessions", val: data ? data.counts.sessions.toLocaleString() : "—", delta: "all time", deltaColor: C.mint, sub: "non-tester" },
    { label: "Total Points", val: data ? data.counts.totalPoints.toLocaleString() : "—", delta: "earned", deltaColor: C.mint, sub: "all students" },
    { label: "Content Items", val: data ? (data.counts.exampleItems + data.counts.explainers).toLocaleString() : "—", delta: "examples+explainers", deltaColor: "rgba(255,255,255,.3)", sub: "live count" },
    { label: "Feedback", val: data ? data.counts.feedbackItems.toLocaleString() : "—", delta: "▲ +2 since incident", deltaColor: C.red, sub: "total items", warn: true },
    { label: "Release Gate", val: "● Open", valColor: C.mint, valSize: "14px", delta: "94/100", deltaColor: "rgba(255,255,255,.3)", sub: "v2.5.1" },
    { label: "Route Health", val: "1 DOWN", valColor: C.red, delta: "🚨 P0 · 5h 23m", deltaColor: C.red, sub: "Assignment Engine", alert: true },
  ];

  const cells = isIncident
    ? INCIDENT_CELLS
    : data
    ? buildCells(data, period)
    : [];

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

        {/* ── Loading / error ───────────────────────────────────────────── */}
        {loading && (
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            Loading live data…
          </div>
        )}
        {error && (
          <div style={{ fontSize: 13, color: C.red, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {/* ── Live stat badges ──────────────────────────────────────────── */}
        {data && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {[
              { label: "Students", val: data.counts.students },
              { label: "Sessions", val: data.counts.sessions },
              { label: "Content", val: data.counts.exampleItems + data.counts.explainers },
              { label: "Feedback", val: data.counts.feedbackItems },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: C.mint }}>{s.val.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

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
                : loading
                ? "Fetching live data…"
                : "Live data · refreshes on page load"}
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
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 16px",
                      borderRight: i < 7 ? "1px solid rgba(255,255,255,.04)" : "none",
                    }}
                  >
                    <div style={{ height: 9, width: 40, background: "rgba(255,255,255,.06)", borderRadius: 3, marginBottom: 8 }} />
                    <div style={{ height: 20, width: 56, background: "rgba(255,255,255,.06)", borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ height: 10, width: 48, background: "rgba(255,255,255,.04)", borderRadius: 3 }} />
                  </div>
                ))
              : cells.map((cell, i) => (
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
                : "KPI Strip — Live Data"}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,.3)", lineHeight: 1.5 }}>
              {isIncident
                ? "Route Health cell turns red (background + underline + text). Update frequency bumped to 10s for Route Health only. Feedback count jumps as teacher reports come in. Period bar shows \"P0 INCIDENT ACTIVE\" warning. All other KPIs unchanged."
                : period === "7d"
                ? "Sessions shows the 8 most recent sessions from the database. Content Items = examples + explainers. Feedback shows total non-tester items."
                : "Green underline on Students cell (active). Feedback shows total count. Release Gate and Route Health show text status dots. Click any cell to navigate to its detail page."}
            </div>
          </div>
        </div>

        {/* ── Session trend ─────────────────────────────────────────────── */}
        {data && data.latestSessions.length > 0 && (
          <>
            <div style={{ marginBottom: "12px", fontSize: "13px", fontWeight: 700, color: "rgba(240,246,255,.6)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Latest Sessions
            </div>
            <div
              style={{
                background: C.bg,
                borderRadius: "16px",
                overflow: "hidden",
                border: `1px solid ${C.border}`,
                marginBottom: "28px",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr>
                      {["Student", "Mode", "Started", "Ended", "Score"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "rgba(255,255,255,.4)",
                            padding: "10px 14px",
                            borderBottom: "2px solid rgba(255,255,255,.06)",
                            background: C.bgDeep,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.latestSessions.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                        <td style={{ padding: "8px 14px", color: C.text, fontWeight: 600 }}>{s.displayName}</td>
                        <td style={{ padding: "8px 14px", color: "rgba(255,255,255,.55)", textTransform: "capitalize" }}>{s.sessionMode}</td>
                        <td style={{ padding: "8px 14px", color: "rgba(255,255,255,.45)" }}>{new Date(s.startedAt).toLocaleString()}</td>
                        <td style={{ padding: "8px 14px", color: "rgba(255,255,255,.45)" }}>{s.endedAt ? new Date(s.endedAt).toLocaleString() : "—"}</td>
                        <td style={{ padding: "8px 14px", color: s.effectivenessScore !== null ? C.mint : "rgba(255,255,255,.3)", fontWeight: 700 }}>
                          {s.effectivenessScore !== null ? s.effectivenessScore : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

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
              {KPI_REF_ROWS.map(([cell, metric, delta, incident]) => (
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
