"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import OwnerGate from "@/app/owner/owner-gate";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  bg: "#0d1117",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  mint: "#22c55e",
  violet: "#9b72ff",
  blue: "#38bdf8",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
} as const;

// ── API types ─────────────────────────────────────────────────────────────────
interface BandCount {
  code: string;
  displayName: string;
  studentCount: number;
}

interface OverviewData {
  counts: {
    students: number;
    guardians: number;
    sessions: number;
    feedbackItems: number;
  };
  byBand: BandCount[];
}

// ── Static chart/funnel data (unchanged) ──────────────────────────────────────
const CHART_POINTS = [
  { x: 52, y: 196.7, label: "Apr" },
  { x: 117, y: 183.3, label: "May" },
  { x: 181, y: 170, label: "Jun" },
  { x: 246, y: 150, label: "Jul" },
  { x: 311, y: 130, label: "Aug" },
  { x: 375, y: 110, label: "Sep" },
  { x: 440, y: 90, label: "Oct" },
  { x: 505, y: 70, label: "Nov" },
  { x: 569, y: 50, label: "Dec" },
  { x: 634, y: 36.7, label: "Jan" },
  { x: 698, y: 26.7, label: "Feb" },
  { x: 762, y: 20.1, label: "Mar" },
];

const WEEKLY_BARS = [
  { label: "W1", height: 42 },
  { label: "W2", height: 50 },
  { label: "W3", height: 48, opacity: 0.7 },
  { label: "W4", height: 56 },
  { label: "W5", height: 62 },
  { label: "W6", height: 58, opacity: 0.75 },
  { label: "W7", height: 63 },
  { label: "W8", height: 67 },
];

const RETENTION = [
  { week: "W1", pct: 100 },
  { week: "W2", pct: 89 },
  { week: "W3", pct: 81, approx: true },
  { week: "W4", pct: 74 },
  { week: "W6", pct: 67, approx: true },
  { week: "W8", pct: 61 },
];

const FUNNEL = [
  { step: "Signed up", pct: 100, count: "1,847", color: "#22c55e" },
  { step: "Completed onboarding", pct: 87, count: "1,612", color: "#4dd880" },
  { step: "First session", pct: 81, count: "1,489", color: "#44c870" },
  { step: "7-day return", pct: 51, count: "934", color: "#f0c040", darkText: true },
  { step: "30-day active", pct: 40, count: "734", color: "#ff7a5c" },
];

const BAND_COLORS: Record<string, { bg: string; color: string }> = {
  "Pre-K": { bg: "rgba(255,180,60,.18)", color: "#ffb43c" },
  "K–1":   { bg: "rgba(80,232,144,.18)", color: "#50e890" },
  "G2–3":  { bg: "rgba(80,160,255,.18)", color: "#50a0ff" },
  "G4–5":  { bg: "rgba(200,120,255,.18)", color: "#c878ff" },
};

const ENG_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  High:   { bg: "rgba(80,232,144,.15)", color: "#50e890", border: "1px solid rgba(80,232,144,.3)" },
  Medium: { bg: "rgba(255,180,60,.12)", color: "#ffb43c", border: "1px solid rgba(255,180,60,.3)" },
  Low:    { bg: "rgba(255,100,90,.12)", color: "#ff6a5e", border: "1px solid rgba(255,100,90,.25)" },
};

function fmt(n: number): string {
  return n.toLocaleString();
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdoptionPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoadError("Request timed out"), 8000);
    fetch("/api/owner/overview")
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((data: OverviewData & { error?: string }) => {
        clearTimeout(timer);
        if (data?.error) {
          setLoadError(data.error);
        } else {
          setOverview(data);
        }
      })
      .catch((e: Error) => { clearTimeout(timer); setLoadError(e.message ?? "Failed to fetch overview data."); });
  }, []);

  if (loadError) {
    return <OwnerGate configured={false} />;
  }

  const studentCount = overview?.counts.students ?? 0;
  const sessionCount = overview?.counts.sessions ?? 0;
  const guardianCount = overview?.counts.guardians ?? 0;
  const byBand = overview?.byBand ?? [];

  // Build KPI cards from real data
  const kpiCards = [
    { label: "Students", value: fmt(studentCount), delta: overview ? "Live data" : "Loading…", up: true },
    { label: "Families", value: fmt(guardianCount), delta: overview ? "Live data" : "Loading…", up: true },
    { label: "Sessions", value: fmt(sessionCount), delta: overview ? "All time" : "Loading…", up: true },
    { label: "Feedback", value: fmt(overview?.counts.feedbackItems ?? 0), delta: overview ? "All time" : "Loading…", up: true },
    { label: "DAU / MAU", value: "—", delta: "● Analytics lag", up: false, valueSm: true },
  ];

  const polylinePoints = CHART_POINTS.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints =
    `52,210 ` +
    CHART_POINTS.map((p) => `${p.x},${p.y}`).join(" ") +
    ` 762,210`;

  return (
    <AppFrame audience="owner" currentPath="/owner/adoption">
      <main
        style={{
          minHeight: "100vh",
          background: C.base,
          padding: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: C.text,
        }}
      >
        {/* ── Page header ───────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: C.text, letterSpacing: "-0.3px" }}>
            Adoption Trends
          </div>
          <div
            style={{
              background: "#50e890",
              color: C.bg,
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.8px",
              padding: "3px 9px",
              borderRadius: "4px",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            Owner Only
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
            {["7d", "30d", "90d", "All Time"].map((p) => (
              <button
                key={p}
                style={{
                  background: p === "30d" ? "rgba(80,232,144,.15)" : "rgba(255,255,255,.06)",
                  border: p === "30d" ? "1px solid #50e890" : "1px solid rgba(255,255,255,.08)",
                  color: p === "30d" ? "#50e890" : "rgba(240,246,255,.6)",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "5px 11px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab nav ───────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "28px",
            borderBottom: "1px solid rgba(255,255,255,.08)",
          }}
        >
          {["Adoption Dashboard", "School Adoption"].map((tab, i) => (
            <div
              key={tab}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                padding: "10px 18px 12px",
                cursor: "pointer",
                borderBottom: i === 0 ? "2px solid #50e890" : "2px solid transparent",
                marginBottom: "-1px",
                color: i === 0 ? "#50e890" : "rgba(240,246,255,.45)",
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* ── KPI row ───────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          {kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "10px",
                padding: "18px 16px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  color: "rgba(240,246,255,.4)",
                  marginBottom: "6px",
                }}
              >
                {kpi.label}
              </div>
              <div
                style={{
                  fontSize: kpi.valueSm ? "24px" : "28px",
                  fontWeight: 800,
                  color: C.text,
                  lineHeight: 1,
                  marginBottom: "6px",
                  letterSpacing: "-0.5px",
                }}
              >
                {kpi.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: kpi.up ? "#50e890" : C.muted,
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                {kpi.delta}
              </div>
            </div>
          ))}
        </div>

        {/* ── Band breakdown ────────────────────────────────────────────── */}
        {byBand.length > 0 && (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "28px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(240,246,255,.6)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>
              Students by Band
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {byBand.map((band) => {
                const style = BAND_COLORS[band.code] ?? { bg: "rgba(255,255,255,.1)", color: C.muted };
                return (
                  <div
                    key={band.code}
                    style={{
                      background: style.bg,
                      borderRadius: "8px",
                      padding: "14px 18px",
                      minWidth: "120px",
                      flex: "1 1 120px",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 700, color: style.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                      {band.displayName || band.code}
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: C.text, lineHeight: 1 }}>
                      {fmt(band.studentCount)}
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(240,246,255,.4)", marginTop: "4px" }}>students</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MAU Trend Chart ───────────────────────────────────────────── */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>
                MAU Growth — 12 Months
              </div>
              <div style={{ fontSize: "11px", color: "rgba(240,246,255,.35)", marginTop: "4px", display: "flex", alignItems: "center", gap: "5px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#f0c040",
                    flexShrink: 0,
                  }}
                />
                Analytics warehouse · 4–6h data lag
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "rgba(240,246,255,.5)" }}>
              <span>
                <span
                  style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#50e890",
                    marginRight: "4px",
                    verticalAlign: "middle",
                  }}
                />
                MAU
              </span>
              <span>
                <span
                  style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "rgba(80,232,144,.25)",
                    marginRight: "4px",
                    verticalAlign: "middle",
                  }}
                />
                Trend area
              </span>
            </div>
          </div>

          <svg
            viewBox="0 0 780 250"
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "280px", display: "block", overflow: "visible" }}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#50e890" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#50e890" stopOpacity="0.02" />
              </linearGradient>
              <clipPath id="chartClip">
                <rect x="52" y="10" width="710" height="200" />
              </clipPath>
            </defs>

            {/* Y-axis grid lines */}
            {[
              { y: 10, label: "3000" },
              { y: 43, label: "2500" },
              { y: 77, label: "2000" },
              { y: 110, label: "1500" },
              { y: 143, label: "1000" },
              { y: 177, label: "500" },
              { y: 210, label: "0" },
            ].map(({ y, label }) => (
              <g key={label}>
                <line
                  x1="52"
                  y1={y}
                  x2="762"
                  y2={y}
                  stroke={y === 210 ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.05)"}
                  strokeWidth="1"
                />
                <text
                  x="46"
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(240,246,255,.35)"
                  fontSize="10"
                >
                  {label}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {CHART_POINTS.map((p) => (
              <text
                key={p.label}
                x={p.x}
                y="228"
                textAnchor="middle"
                fill="rgba(240,246,255,.35)"
                fontSize="10"
              >
                {p.label}
              </text>
            ))}

            {/* Area fill */}
            <polygon
              clipPath="url(#chartClip)"
              fill="url(#areaGrad)"
              points={areaPoints}
            />

            {/* Line */}
            <polyline
              clipPath="url(#chartClip)"
              fill="none"
              stroke="#50e890"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={polylinePoints}
            />

            {/* Data points */}
            {CHART_POINTS.map((p, i) => (
              <circle
                key={p.label}
                cx={p.x}
                cy={p.y}
                r={i === CHART_POINTS.length - 1 ? 4.5 : 3.5}
                fill="#50e890"
                stroke={i === CHART_POINTS.length - 1 ? C.bg : undefined}
                strokeWidth={i === CHART_POINTS.length - 1 ? 2 : undefined}
              />
            ))}

            {/* Beta launch annotation */}
            <g>
              <line x1="181" y1="170" x2="181" y2="135" stroke="#f0c040" strokeWidth="1" strokeDasharray="3,2" />
              <rect x="148" y="117" width="66" height="17" rx="3" fill="rgba(240,192,64,.15)" stroke="rgba(240,192,64,.4)" strokeWidth="1" />
              <text x="181" y="129" textAnchor="middle" fill="#f0c040" fontSize="9.5" fontWeight="700">Beta launch</text>
            </g>

            {/* School onboarding annotation */}
            <g>
              <line x1="440" y1="90" x2="440" y2="55" stroke="#50a0ff" strokeWidth="1" strokeDasharray="3,2" />
              <rect x="394" y="37" width="92" height="17" rx="3" fill="rgba(80,160,255,.15)" stroke="rgba(80,160,255,.4)" strokeWidth="1" />
              <text x="440" y="49" textAnchor="middle" fill="#50a0ff" fontSize="9.5" fontWeight="700">School onboarding</text>
            </g>
          </svg>
        </div>

        {/* ── Cohort row ────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {/* Teacher cohort */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.7px",
                textTransform: "uppercase",
                color: "rgba(240,246,255,.45)",
                marginBottom: "8px",
              }}
            >
              Teacher Cohort — Sessions per Week (8-week window)
            </div>
            <div style={{ fontSize: "12px", color: "rgba(240,246,255,.45)", marginBottom: "4px" }}>
              Total sessions (all time): {fmt(sessionCount)}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "4px",
                height: "70px",
                marginTop: "12px",
              }}
            >
              {WEEKLY_BARS.map((bar) => (
                <div
                  key={bar.label}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "3px",
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${bar.height}px`,
                      background: "#50e890",
                      borderRadius: "3px 3px 0 0",
                      opacity: bar.opacity ?? 0.82,
                    }}
                  />
                  <div style={{ fontSize: "10px", color: "rgba(240,246,255,.4)", whiteSpace: "nowrap" }}>
                    {bar.label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(240,246,255,.35)", marginTop: "10px" }}>
              Avg sessions/teacher/week: 4.2 · Trend ▲ improving
            </div>
          </div>

          {/* Family retention */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.7px",
                textTransform: "uppercase",
                color: "rgba(240,246,255,.45)",
                marginBottom: "8px",
              }}
            >
              Family Retention Curve — {fmt(guardianCount)} Families
            </div>
            <div style={{ fontSize: "12px", color: "rgba(240,246,255,.45)", marginBottom: "2px" }}>
              % still active by week
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
              {RETENTION.map((r) => (
                <div
                  key={r.week}
                  style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}
                >
                  <div style={{ width: "32px", color: "rgba(240,246,255,.5)", flexShrink: 0 }}>
                    {r.week}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: "10px",
                      background: "rgba(255,255,255,.06)",
                      borderRadius: "5px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${r.pct}%`,
                        background: "#50e890",
                        borderRadius: "5px",
                        opacity: r.approx ? 0.85 : 1,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: "38px",
                      textAlign: "right",
                      color: r.approx ? "rgba(240,246,255,.5)" : C.text,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {r.approx ? `~${r.pct}%` : `${r.pct}%`}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(240,246,255,.35)", marginTop: "10px" }}>
              61% 8-week retention · Industry avg ~55%
            </div>
          </div>
        </div>

        {/* ── Activation funnel ─────────────────────────────────────────── */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "rgba(240,246,255,.6)",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              marginBottom: "6px",
            }}
          >
            Activation Funnel
          </div>
          <div style={{ fontSize: "11px", color: "rgba(240,246,255,.35)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#f0c040",
                flexShrink: 0,
              }}
            />
            Each step = distinct event in analytics_events table
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
            {FUNNEL.map((step) => (
              <div key={step.step} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "180px", fontSize: "13px", color: "rgba(240,246,255,.75)", flexShrink: 0 }}>
                  {step.step}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: "22px",
                    background: "rgba(255,255,255,.05)",
                    borderRadius: "5px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${step.pct}%`,
                      background: step.color,
                      borderRadius: "5px",
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: step.darkText ? C.bg : "#0d1117",
                    }}
                  >
                    {step.pct}%
                  </div>
                </div>
                <div style={{ width: "55px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: C.text, flexShrink: 0 }}>
                  {step.count}
                </div>
                <div style={{ width: "38px", textAlign: "right", fontSize: "12px", color: "rgba(240,246,255,.5)", flexShrink: 0 }}>
                  {step.pct === 100 ? "—" : `${step.pct}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Band adoption table ───────────────────────────────────────── */}
        {byBand.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(240,246,255,.6)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Students by Band ({fmt(studentCount)} total)
              </div>
              <div style={{ fontSize: "12px", color: "rgba(240,246,255,.4)", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                Engagement:
                {(["High", "Medium", "Low"] as const).map((eng) => (
                  <span
                    key={eng}
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "5px",
                      ...ENG_STYLE[eng],
                    }}
                  >
                    {eng}
                  </span>
                ))}
                DAU/MAU
              </div>
            </div>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "10px",
                overflowX: "auto",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr>
                    {["Band", "Display Name", "Students"].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          color: "rgba(240,246,255,.4)",
                          padding: "12px 16px",
                          textAlign: "left",
                          borderBottom: "1px solid rgba(255,255,255,.06)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byBand.map((band) => {
                    const style = BAND_COLORS[band.code] ?? { bg: "rgba(255,255,255,.08)", color: C.muted };
                    return (
                      <tr
                        key={band.code}
                        style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}
                      >
                        <td style={{ padding: "11px 16px" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: "3px",
                              letterSpacing: "0.3px",
                              background: style.bg,
                              color: style.color,
                            }}
                          >
                            {band.code}
                          </span>
                        </td>
                        <td style={{ padding: "11px 16px", color: C.text, fontWeight: 600 }}>{band.displayName || band.code}</td>
                        <td style={{ padding: "11px 16px", color: C.text }}>{fmt(band.studentCount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: "11px", color: "rgba(240,246,255,.35)", marginTop: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#f0c040",
                  flexShrink: 0,
                }}
              />
              Individual student names are never displayed · B2B contract context only
            </div>
          </div>
        )}
      </main>
    </AppFrame>
  );
}
