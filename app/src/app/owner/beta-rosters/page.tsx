"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import OwnerGate from "@/app/owner/owner-gate";

const C = {
  bg: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  mint: "#50e890",
  amber: "#f0a840",
  violet: "#a78bfa",
  gold: "#facc15",
  red: "#f87171",
  faint: "rgba(255,255,255,0.04)",
};

type Tab = "roster" | "chart" | "spec";
type Cohort = "all" | "A" | "B" | "C";

type Family = {
  label: string;
  status: "active" | "paused" | "completed" | "withdrawn";
  cohort: "A" | "B" | "C";
  joined: string;
  lastActive: string;
  sessionsWk: number | string;
  sessionsLow?: boolean;
  feedbackItems: number;
  nps: number | null;
  npsType: "pos" | "mid" | "neg" | null;
  lowEng?: boolean;
};

const FAMILIES: Family[] = [
  {
    label: "Beta Family A",
    status: "active",
    cohort: "A",
    joined: "Jan 6, 2026",
    lastActive: "Mar 24, 2026",
    sessionsWk: 4,
    feedbackItems: 12,
    nps: 65,
    npsType: "pos",
  },
  {
    label: "Beta Family B",
    status: "active",
    cohort: "A",
    joined: "Jan 6, 2026",
    lastActive: "Mar 20, 2026",
    sessionsWk: 1,
    sessionsLow: true,
    feedbackItems: 4,
    nps: 28,
    npsType: "mid",
    lowEng: true,
  },
  {
    label: "Beta Family C",
    status: "paused",
    cohort: "A",
    joined: "Jan 6, 2026",
    lastActive: "Mar 10, 2026",
    sessionsWk: 0,
    feedbackItems: 7,
    nps: 40,
    npsType: "mid",
  },
  {
    label: "Beta Family D",
    status: "active",
    cohort: "B",
    joined: "Feb 3, 2026",
    lastActive: "Mar 24, 2026",
    sessionsWk: 5,
    feedbackItems: 9,
    nps: 55,
    npsType: "pos",
  },
  {
    label: "Beta Family E",
    status: "active",
    cohort: "B",
    joined: "Feb 3, 2026",
    lastActive: "Mar 18, 2026",
    sessionsWk: 1,
    sessionsLow: true,
    feedbackItems: 2,
    nps: 22,
    npsType: "mid",
    lowEng: true,
  },
  {
    label: "Beta Family F",
    status: "completed",
    cohort: "B",
    joined: "Feb 3, 2026",
    lastActive: "Mar 14, 2026",
    sessionsWk: 0,
    feedbackItems: 15,
    nps: 60,
    npsType: "pos",
  },
  {
    label: "Beta Family G",
    status: "active",
    cohort: "C",
    joined: "Mar 3, 2026",
    lastActive: "Mar 24, 2026",
    sessionsWk: 3,
    feedbackItems: 5,
    nps: 35,
    npsType: "pos",
  },
  {
    label: "Beta Family H",
    status: "paused",
    cohort: "C",
    joined: "Mar 3, 2026",
    lastActive: "Mar 16, 2026",
    sessionsWk: 1,
    sessionsLow: true,
    feedbackItems: 1,
    nps: 18,
    npsType: "mid",
    lowEng: true,
  },
];

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  active: {
    bg: "rgba(80,232,144,0.15)",
    color: "#50e890",
    border: "rgba(80,232,144,0.3)",
    label: "Active",
  },
  paused: {
    bg: "rgba(240,168,64,0.15)",
    color: "#f0a840",
    border: "rgba(240,168,64,0.3)",
    label: "Paused",
  },
  completed: {
    bg: "rgba(99,102,241,0.15)",
    color: "#a78bfa",
    border: "rgba(99,102,241,0.3)",
    label: "Completed",
  },
  withdrawn: {
    bg: "rgba(248,113,113,0.15)",
    color: "#f87171",
    border: "rgba(248,113,113,0.3)",
    label: "Withdrawn",
  },
};

const NPS_COLORS: Record<string, string> = {
  pos: "#50e890",
  mid: "#f0a840",
  neg: "#f87171",
};

const COHORT_COLORS: Record<string, string> = {
  A: "#50e890",
  B: "#a78bfa",
  C: "#facc15",
};

const BUSINESS_RULES = [
  "Families with sessions_this_week < 2 must be visually flagged in amber to prompt owner outreach — this threshold is configurable via the admin settings panel.",
  "NPS scores are only displayed once a minimum of 3 feedback submissions have been recorded for a cohort; otherwise the cell renders as '—' to prevent misleading small-sample scores.",
  "A family with status = 'withdrawn' must be excluded from all aggregate stats (summary row, retention, NPS) and rendered with reduced opacity in the roster table.",
  "Cohort filter state must persist in the URL query string (?cohort=A) so that owners can share filtered views via link without exposing personal identifiers.",
  "The 'Export CSV' action requires a secondary confirmation dialog reminding the owner that the exported file contains cohort-level data only and must not be shared externally without a data-sharing agreement in place.",
];

const PRIVACY_RULES = [
  'Families are identified by cohort label only (e.g. "Beta Family A") — no personal name, email address, or parent identifier is stored or displayed in this component.',
  "Child names must never appear in roster or chart views; first name only is permitted exclusively in per-session drill-down data, gated by a separate owner action.",
  "CSV export outputs cohort-level aggregate data only — no row-level personal identifiers are included in the export payload.",
  "This component and its route (/owner/beta/families) must be hidden — not merely disabled — after the GA launch flag is toggled on.",
];

export default function OwnerBetaRostersPage() {
  const [tab, setTab] = useState<Tab>("roster");
  const [cohortFilter, setCohortFilter] = useState<Cohort>("all");

  const tabs: { id: Tab; label: string }[] = [
    { id: "roster", label: "Roster" },
    { id: "chart", label: "Engagement Chart" },
    { id: "spec", label: "Spec" },
  ];

  const cohortFilters: { id: Cohort; label: string }[] = [
    { id: "all", label: "All" },
    { id: "A", label: "Cohort A" },
    { id: "B", label: "Cohort B" },
    { id: "C", label: "Cohort C" },
  ];

  const filteredFamilies =
    cohortFilter === "all" ? FAMILIES : FAMILIES.filter((f) => f.cohort === cohortFilter);

  return (
    <AppFrame audience="owner">
      <OwnerGate configured={true} />
      <div style={{ padding: "0 0 64px" }}>
        {/* Page header */}
        <div style={{ maxWidth: 960, margin: "0 auto 24px", padding: "8px 16px 0" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Beta Family Roster</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            Owner view of beta-testing families — cohort labels, engagement status, and feedback participation.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(80,232,144,0.10)",
              border: "1px solid rgba(80,232,144,0.25)",
              color: C.mint,
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 11,
              fontWeight: 600,
              marginTop: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: C.mint,
                display: "inline-block",
              }}
            />
            WonderQuest Design System #286
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ maxWidth: 960, margin: "0 auto 24px", padding: "0 16px" }}>
          <div
            style={{
              display: "flex",
              gap: 4,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: tab === t.id ? C.mint : C.muted,
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "10px 18px",
                  cursor: "pointer",
                  borderBottom: tab === t.id ? `2px solid ${C.mint}` : "2px solid transparent",
                  borderRadius: "6px 6px 0 0",
                  minHeight: 44,
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── ROSTER TAB ── */}
        {tab === "roster" && (
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px" }}>
            {/* Summary stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                { val: "24", lbl: "Families Enrolled", color: C.mint },
                { val: "3", lbl: "Cohorts Active", color: C.mint },
                { val: "3.2", lbl: "Avg Sessions / Week", color: C.mint },
                { val: "67%", lbl: "Feedback Participation", color: C.amber },
              ].map((s) => (
                <div
                  key={s.lbl}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: "16px 18px",
                    textAlign: "center" as const,
                  }}
                >
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Roster card */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.muted,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                  marginBottom: 16,
                }}
              >
                Family Roster
              </div>

              {/* Cohort filter */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 16 }}>
                {cohortFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCohortFilter(f.id)}
                    style={{
                      background:
                        cohortFilter === f.id ? "rgba(80,232,144,0.12)" : "rgba(255,255,255,0.05)",
                      border:
                        cohortFilter === f.id
                          ? "1px solid rgba(80,232,144,0.4)"
                          : `1px solid ${C.border}`,
                      color: cohortFilter === f.id ? C.mint : C.muted,
                      fontSize: 13,
                      fontWeight: 500,
                      padding: "8px 16px",
                      borderRadius: 20,
                      cursor: "pointer",
                      minHeight: 44,
                      transition: "all 0.15s",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div
                style={{
                  overflowX: "auto" as const,
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${C.border}` }}>
                      {["Cohort Label", "Status", "Cohort", "Joined", "Last Active", "Sessions/wk", "Feedback Items", "NPS"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "12px 14px",
                              textAlign: "left" as const,
                              fontSize: 11,
                              fontWeight: 600,
                              color: C.muted,
                              textTransform: "uppercase" as const,
                              letterSpacing: "0.05em",
                              whiteSpace: "nowrap" as const,
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFamilies.map((row) => {
                      const ss = STATUS_STYLES[row.status];
                      return (
                        <tr
                          key={row.label}
                          style={{
                            borderBottom: `1px solid ${C.border}`,
                            background: row.lowEng ? "rgba(240,168,64,0.06)" : "transparent",
                          }}
                        >
                          <td style={{ padding: "13px 14px", color: C.text }}>
                            <strong>{row.label}</strong>
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "3px 10px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 600,
                                background: ss.bg,
                                color: ss.color,
                                border: `1px solid ${ss.border}`,
                                whiteSpace: "nowrap" as const,
                              }}
                            >
                              {ss.label}
                            </span>
                          </td>
                          <td style={{ padding: "13px 14px", color: C.muted }}>Cohort {row.cohort}</td>
                          <td style={{ padding: "13px 14px", color: C.muted }}>{row.joined}</td>
                          <td style={{ padding: "13px 14px", color: C.muted }}>{row.lastActive}</td>
                          <td style={{ padding: "13px 14px" }}>
                            {row.sessionsLow ? (
                              <span style={{ color: C.amber, fontWeight: 600 }}>{row.sessionsWk}</span>
                            ) : (
                              <span style={{ color: C.text }}>{row.sessionsWk}</span>
                            )}
                          </td>
                          <td style={{ padding: "13px 14px", color: C.text }}>{row.feedbackItems}</td>
                          <td style={{ padding: "13px 14px" }}>
                            {row.nps !== null && row.npsType ? (
                              <span style={{ color: NPS_COLORS[row.npsType], fontWeight: 600 }}>
                                +{row.nps}
                              </span>
                            ) : (
                              <span style={{ color: C.muted }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <p style={{ fontSize: 12, color: C.amber, marginTop: 10 }}>
                ▲ Amber rows indicate low engagement (sessions/week &lt; 2) — consider outreach.
              </p>

              {/* Export */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const, marginTop: 16 }}>
                <button
                  disabled
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${C.border}`,
                    color: C.muted,
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "10px 18px",
                    borderRadius: 8,
                    cursor: "not-allowed",
                    opacity: 0.55,
                    minHeight: 44,
                  }}
                >
                  ↓ Export CSV
                </button>
                <span style={{ fontSize: 12, color: C.muted, fontStyle: "italic" as const }}>
                  Exports cohort data only — no personal identifiers
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── CHART TAB ── */}
        {tab === "chart" && (
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px" }}>
            {/* Bar chart */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 24,
                marginBottom: 16,
                overflowX: "auto" as const,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 18 }}>
                Weekly Sessions by Cohort — Last 4 Weeks
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const, marginBottom: 16, fontSize: 12 }}>
                {(["A", "B", "C"] as const).map((co) => (
                  <div key={co} style={{ display: "flex", alignItems: "center", gap: 7, color: C.muted }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        background: COHORT_COLORS[co],
                        flexShrink: 0,
                      }}
                    />
                    Cohort {co}
                  </div>
                ))}
              </div>
              <svg
                viewBox="0 0 680 268"
                style={{ maxWidth: 680, display: "block", width: "100%" }}
                aria-label="Grouped bar chart: weekly sessions per cohort across 4 weeks."
              >
                {/* Grid lines */}
                <g fontFamily="sans-serif" fontSize="11" fill="#8b949e">
                  {[0, 1, 2, 3, 4, 5].map((v, i) => {
                    const y = 240 - v * 41.6;
                    return (
                      <g key={v}>
                        <text x="40" y={y + 4} textAnchor="end">{v}</text>
                        <line x1="48" y1={y} x2="656" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                      </g>
                    );
                  })}
                  <text transform="translate(12,136) rotate(-90)" textAnchor="middle" fontSize="11" fill="#8b949e">
                    Sessions / week
                  </text>
                </g>
                {/* Axes */}
                <line x1="48" y1="240" x2="656" y2="240" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                <line x1="48" y1="32" x2="48" y2="240" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                {/* Week labels */}
                <g fontFamily="sans-serif" fontSize="12" fill="#8b949e" textAnchor="middle">
                  <text x="120" y="260">Week 1</text>
                  <text x="270" y="260">Week 2</text>
                  <text x="420" y="260">Week 3</text>
                  <text x="570" y="260">Week 4</text>
                </g>
                {/* W1: A=3.8, B=2.9 */}
                <rect x="83" y="82" width="22" height="158" fill="#50e890" rx="3" opacity="0.85" />
                <rect x="109" y="120" width="22" height="120" fill="#a78bfa" rx="3" opacity="0.85" />
                <rect x="135" y="200" width="22" height="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 2" rx="3" />
                {/* W2: A=4.1, B=3.2 */}
                <rect x="233" y="70" width="22" height="170" fill="#50e890" rx="3" opacity="0.85" />
                <rect x="259" y="108" width="22" height="132" fill="#a78bfa" rx="3" opacity="0.85" />
                <rect x="285" y="200" width="22" height="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 2" rx="3" />
                {/* W3: A=3.5, B=3.6, C=2.4 */}
                <rect x="383" y="95" width="22" height="145" fill="#50e890" rx="3" opacity="0.85" />
                <rect x="409" y="90" width="22" height="150" fill="#a78bfa" rx="3" opacity="0.85" />
                <rect x="435" y="141" width="22" height="99" fill="#facc15" rx="3" opacity="0.85" />
                {/* W4: A=3.9, B=3.4, C=2.8 */}
                <rect x="533" y="78" width="22" height="162" fill="#50e890" rx="3" opacity="0.85" />
                <rect x="559" y="99" width="22" height="141" fill="#a78bfa" rx="3" opacity="0.85" />
                <rect x="585" y="124" width="22" height="116" fill="#facc15" rx="3" opacity="0.85" />
                {/* Value labels */}
                <g fontFamily="sans-serif" fontSize="10" textAnchor="middle" fill="rgba(255,255,255,0.7)">
                  <text x="94" y="78">3.8</text>
                  <text x="120" y="116">2.9</text>
                  <text x="244" y="66">4.1</text>
                  <text x="270" y="104">3.2</text>
                  <text x="394" y="91">3.5</text>
                  <text x="420" y="86">3.6</text>
                  <text x="446" y="137">2.4</text>
                  <text x="544" y="74">3.9</text>
                  <text x="570" y="95">3.4</text>
                  <text x="596" y="120">2.8</text>
                </g>
              </svg>
            </div>

            {/* Retention */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.muted,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                  marginBottom: 16,
                }}
              >
                Week-over-Week Retention by Cohort
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 8 }}>
                {[
                  {
                    cohort: "A",
                    color: "#50e890",
                    rows: [
                      { period: "W1 → W2", pct: "92%" },
                      { period: "W2 → W3", pct: "88%" },
                      { period: "W3 → W4", pct: "90%" },
                    ],
                  },
                  {
                    cohort: "B",
                    color: "#a78bfa",
                    rows: [
                      { period: "W1 → W2", pct: "85%" },
                      { period: "W2 → W3", pct: "89%" },
                      { period: "W3 → W4", pct: "83%" },
                    ],
                  },
                  {
                    cohort: "C",
                    color: "#facc15",
                    rows: [
                      { period: "W1 → W2", pct: null },
                      { period: "W2 → W3", pct: null },
                      { period: "W3 → W4", pct: "79%" },
                    ],
                  },
                ].map((cg) => (
                  <div
                    key={cg.cohort}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: 16,
                      textAlign: "center" as const,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.06em",
                        marginBottom: 12,
                        color: cg.color,
                      }}
                    >
                      Cohort {cg.cohort}
                    </div>
                    {cg.rows.map((r) => (
                      <div
                        key={r.period}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "5px 0",
                          borderBottom: `1px solid ${C.border}`,
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: C.muted }}>{r.period}</span>
                        <span style={{ fontWeight: 600, color: r.pct ? C.mint : C.muted }}>{r.pct ?? "N/A"}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                Cohort C joined in Week 3. W1/W2 retention not applicable.
              </p>
            </div>

            {/* NPS */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.muted,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                  marginBottom: 16,
                }}
              >
                Net Promoter Score by Cohort
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  { cohort: "A", color: "#50e890", score: "+52", npsType: "pos" },
                  { cohort: "B", color: "#a78bfa", score: "+38", npsType: "mid" },
                  { cohort: "C", color: "#facc15", score: "+31", npsType: "mid" },
                ].map((n) => (
                  <div
                    key={n.cohort}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: 18,
                      textAlign: "center" as const,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: n.color, marginBottom: 10 }}>
                      Cohort {n.cohort}
                    </div>
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 700,
                        lineHeight: 1,
                        marginBottom: 6,
                        color: NPS_COLORS[n.npsType],
                      }}
                    >
                      {n.score}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.05em",
                      }}
                    >
                      NPS Score
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 12 }}>
                NPS scale: &lt;0 Critical · 0–29 Needs work · 30–69 Good · 70+ Excellent
              </p>
            </div>
          </div>
        )}

        {/* ── SPEC TAB ── */}
        {tab === "spec" && (
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px" }}>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "20px 24px",
              }}
            >
              {/* Component */}
              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    color: C.mint,
                    marginBottom: 12,
                    borderBottom: `1px solid ${C.border}`,
                    paddingBottom: 8,
                  }}
                >
                  Component
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "8px 16px" }}>
                  {[
                    { k: "Name", v: "BetaFamilyRoster" },
                    { k: "DS Item", v: "#286" },
                    { k: "Route", v: "/owner/beta/families" },
                    { k: "Auth", v: "Owner only — requires role === 'owner' JWT claim" },
                    { k: "Visibility", v: "Beta phase only — hidden after GA launch" },
                  ].map((r) => (
                    <>
                      <span key={r.k + "k"} style={{ color: C.muted, fontSize: 12.5, fontWeight: 500 }}>
                        {r.k}
                      </span>
                      <span key={r.k + "v"} style={{ color: C.text, fontSize: 12.5, fontFamily: "monospace" }}>
                        {r.v}
                      </span>
                    </>
                  ))}
                </div>
              </div>

              {/* Privacy */}
              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    color: C.mint,
                    marginBottom: 12,
                    borderBottom: `1px solid ${C.border}`,
                    paddingBottom: 8,
                  }}
                >
                  Privacy Rules
                </h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {PRIVACY_RULES.map((rule, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.55 }}>
                      <span style={{ color: C.mint, flexShrink: 0 }}>🔒</span>
                      <span style={{ color: C.text }}>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Business Rules */}
              <div style={{ marginBottom: 0 }}>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    color: C.mint,
                    marginBottom: 12,
                    borderBottom: `1px solid ${C.border}`,
                    paddingBottom: 8,
                  }}
                >
                  Business Rules
                </h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {BUSINESS_RULES.map((rule, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.55, alignItems: "flex-start" }}>
                      <span
                        style={{
                          background: "rgba(80,232,144,0.12)",
                          color: C.mint,
                          borderRadius: 6,
                          padding: "1px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        BR-{i + 1}
                      </span>
                      <span style={{ color: C.text }}>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
