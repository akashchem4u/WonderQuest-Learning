"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  faint: "rgba(255,255,255,0.05)",
};

type Tab = "active" | "history" | "stats";
type StatusFilter = "active" | "improving" | "all";

const ACTIVE_INTERVENTIONS = [
  {
    id: "jordan",
    initial: "J",
    avatarBg: "#475569",
    name: "Jordan",
    trigger: "Confidence floor on Fractions: Adding Unlike Denominators. Floor hit 4× this week.",
    statusLabel: "Active · 6 days",
    statusBg: "rgba(245,158,11,0.15)",
    statusColor: "#f59e0b",
    statusBorder: "rgba(245,158,11,0.35)",
    triggerLabel: "Confidence floor",
    bandLabel: "P2 G2–3",
    bandBg: "rgba(88,232,193,0.13)",
    bandColor: "#0d9065",
    masteryAtLabel: "Mastery when flagged:",
    masteryAt: 28,
    masteryAtColor: "#f59e0b",
    masteryNow: 38,
    masteryNowColor: "#38bdf8",
    started: "Started Mar 18",
    daysOpen: "6 days open",
    btnLabel: "View →",
    improving: false,
  },
  {
    id: "priya",
    initial: "P",
    avatarBg: "#ec4899",
    name: "Priya",
    trigger: "Absence — 6 days missed. Monitor re-engagement and mastery recovery.",
    statusLabel: "Active · 4 days",
    statusBg: "rgba(245,158,11,0.15)",
    statusColor: "#f59e0b",
    statusBorder: "rgba(245,158,11,0.35)",
    triggerLabel: "Absence",
    bandLabel: "P1 K–1",
    bandBg: "rgba(155,114,255,0.13)",
    bandColor: "#6d3fcf",
    masteryAtLabel: "Mastery when flagged:",
    masteryAt: 44,
    masteryAtColor: "#f59e0b",
    masteryNow: 52,
    masteryNowColor: "#38bdf8",
    started: "Started Mar 20",
    daysOpen: "4 days open",
    btnLabel: "View →",
    improving: false,
  },
  {
    id: "aisha",
    initial: "A",
    avatarBg: "#0ea5e9",
    name: "Aisha",
    trigger: "Hint pattern — requested hints 6× on same Multiplication question type.",
    statusLabel: "Improving · 10 days",
    statusBg: "rgba(34,197,94,0.12)",
    statusColor: "#22c55e",
    statusBorder: "rgba(34,197,94,0.3)",
    triggerLabel: "Hint pattern",
    bandLabel: "P2 G2–3",
    bandBg: "rgba(88,232,193,0.13)",
    bandColor: "#0d9065",
    masteryAtLabel: "Flagged at:",
    masteryAt: 30,
    masteryAtColor: "#f59e0b",
    masteryNow: 58,
    masteryNowColor: "#22c55e",
    started: "Started Mar 14",
    daysOpen: "10 days · Improving",
    btnLabel: "View →",
    improving: true,
  },
  {
    id: "marcus",
    initial: "M",
    avatarBg: "#16a34a",
    name: "Marcus",
    trigger: "Band ceiling — consistently reaching P2 limit. Ready for P3 advancement review.",
    statusLabel: "Band ceiling · Positive",
    statusBg: "rgba(56,189,248,0.12)",
    statusColor: "#38bdf8",
    statusBorder: "rgba(56,189,248,0.3)",
    triggerLabel: "Band ceiling",
    bandLabel: "P2 → P3?",
    bandBg: "rgba(88,232,193,0.13)",
    bandColor: "#0d9065",
    masteryAtLabel: null,
    masteryAt: null,
    masteryAtColor: null,
    masteryNow: null,
    masteryNowColor: null,
    started: "Started Mar 21",
    daysOpen: "3 days",
    btnLabel: "Review →",
    improving: false,
  },
];

const RESOLVED_INTERVENTIONS = [
  {
    id: "bella",
    initial: "B",
    avatarBg: "#ec4899",
    name: "Bella",
    trigger: "Confidence floor on Long Division. Resolved after visual model support + 8 sessions.",
    statusLabel: "Resolved · 12 days",
    triggerLabel: "Confidence floor",
    masteryBefore: 28,
    masteryAfter: 82,
    resolved: "Resolved Mar 18",
  },
  {
    id: "ethan",
    initial: "E",
    avatarBg: "#16a34a",
    name: "Ethan",
    trigger: "Absence (4 days). Re-engagement successful — streak restored within 3 days.",
    statusLabel: "Resolved · 5 days",
    triggerLabel: "Absence",
    masteryBefore: 55,
    masteryAfter: 70,
    resolved: "Resolved Mar 12",
  },
];

const WEEK_BARS = [
  { w: "W1", openH: 20, resolvedH: 20 },
  { w: "W2", openH: 28, resolvedH: 0 },
  { w: "W3", openH: 18, resolvedH: 18 },
  { w: "W4", openH: 32, resolvedH: 0 },
  { w: "W5", openH: 24, resolvedH: 24 },
  { w: "W6", openH: 38, resolvedH: 0 },
  { w: "W7", openH: 30, resolvedH: 30 },
  { w: "W8", openH: 36, resolvedH: 0 },
];

function MasteryBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        borderRadius: 3,
        height: 5,
        width: 60,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          borderRadius: 3,
        }}
      />
    </div>
  );
}

function InterventionRow({ row, resolved }: { row: (typeof ACTIVE_INTERVENTIONS)[0]; resolved?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: row.avatarBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 900,
          color: "#fff",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {row.initial}
      </div>

      {/* Body */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2 }}>{row.name}</div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4, marginBottom: 5 }}>{row.trigger}</div>

        {/* Chips */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, marginBottom: row.masteryAtLabel ? 6 : 0 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 8,
              background: row.statusBg,
              color: row.statusColor,
              border: `1px solid ${row.statusBorder || "transparent"}`,
            }}
          >
            {row.statusLabel}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              color: C.muted,
            }}
          >
            {row.triggerLabel}
          </span>
          {row.bandLabel && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 8,
                background: row.bandBg,
                color: row.bandColor,
              }}
            >
              {row.bandLabel}
            </span>
          )}
        </div>

        {/* Mastery bars */}
        {row.masteryAtLabel && row.masteryAt !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{row.masteryAtLabel}</span>
            <MasteryBar pct={row.masteryAt!} color={row.masteryAtColor!} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{row.masteryAt}/100</span>
            <span style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginLeft: 8 }}>Now:</span>
            <MasteryBar pct={row.masteryNow!} color={row.masteryNowColor!} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{row.masteryNow}/100</span>
          </div>
        )}
      </div>

      {/* Right */}
      <div style={{ flexShrink: 0, textAlign: "right" as const, minWidth: 80 }}>
        <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4 }}>{row.started}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>{row.daysOpen}</div>
        <button
          style={{
            marginTop: 6,
            padding: "5px 10px",
            borderRadius: 7,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            background: C.surface,
            color: C.blue,
            border: `1.5px solid rgba(56,189,248,0.25)`,
            display: "block",
          }}
        >
          {row.btnLabel}
        </button>
      </div>
    </div>
  );
}

export default function TeacherInterventionOverviewPage() {
  const [tab, setTab] = useState<Tab>("active");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const tabs: { id: Tab; label: string }[] = [
    { id: "active", label: "Active Interventions" },
    { id: "history", label: "Resolved History" },
    { id: "stats", label: "Stats" },
  ];

  const statusFilters: { id: StatusFilter; label: string; count: number }[] = [
    { id: "active", label: "Active", count: 4 },
    { id: "improving", label: "Improving", count: 2 },
    { id: "all", label: "All open", count: 6 },
  ];

  const filteredInterventions =
    statusFilter === "active"
      ? ACTIVE_INTERVENTIONS.filter((r) => !r.improving)
      : statusFilter === "improving"
      ? ACTIVE_INTERVENTIONS.filter((r) => r.improving)
      : ACTIVE_INTERVENTIONS;

  return (
    <AppFrame audience="teacher">
      <div style={{ padding: "24px 16px 64px", minHeight: "100vh" }}>
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap" as const,
            marginBottom: 24,
            maxWidth: 960,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                background: tab === t.id ? C.blue : "rgba(255,255,255,0.08)",
                color: tab === t.id ? "#0d1117" : C.muted,
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ACTIVE INTERVENTIONS ── */}
        {tab === "active" && (
          <div style={{ maxWidth: 960 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: C.muted,
                marginBottom: 16,
              }}
            >
              Intervention overview — all active interventions
            </p>
            <div
              style={{
                background: C.surface,
                borderRadius: 16,
                padding: "20px 22px",
                border: `1px solid ${C.border}`,
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>🛠 Interventions — Class 4B</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, cursor: "pointer" }}>Export</div>
              </div>

              {/* Summary stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {[
                  { n: "4", l: "Active" },
                  { n: "2", l: "Improving" },
                  { n: "12", l: "Resolved (term)" },
                  { n: "78%", l: "Resolution rate", color: C.mint },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 10,
                      padding: "10px 12px",
                      textAlign: "center" as const,
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 900, color: s.color ?? C.text }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Status filter tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" as const }}>
                {statusFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "none",
                      background: statusFilter === f.id ? C.blue : "rgba(255,255,255,0.06)",
                      color: statusFilter === f.id ? "#0d1117" : C.muted,
                    }}
                  >
                    {f.label}{" "}
                    <span
                      style={{
                        display: "inline-block",
                        background: statusFilter === f.id ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                        fontSize: 10,
                        fontWeight: 900,
                        padding: "0 5px",
                        borderRadius: 5,
                        marginLeft: 4,
                      }}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Intervention rows */}
              {filteredInterventions.map((row) => (
                <InterventionRow key={row.id} row={row} />
              ))}
            </div>
          </div>
        )}

        {/* ── RESOLVED HISTORY ── */}
        {tab === "history" && (
          <div style={{ maxWidth: 960 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: C.muted,
                marginBottom: 16,
              }}
            >
              Resolved interventions — this term
            </p>
            <div
              style={{
                background: C.surface,
                borderRadius: 16,
                padding: "20px 22px",
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>✅ Resolved — This Term</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, cursor: "pointer" }}>See archived</div>
              </div>

              {RESOLVED_INTERVENTIONS.map((row) => (
                <div
                  key={row.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "14px 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: row.avatarBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#fff",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {row.initial}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2 }}>{row.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4, marginBottom: 5 }}>{row.trigger}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 8,
                          background: "rgba(34,197,94,0.12)",
                          color: C.mint,
                        }}
                      >
                        {row.statusLabel}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.06)",
                          color: C.muted,
                        }}
                      >
                        {row.triggerLabel}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
                      <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>Before:</span>
                      <MasteryBar pct={row.masteryBefore} color={C.amber} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{row.masteryBefore}/100</span>
                      <span style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginLeft: 8 }}>After:</span>
                      <MasteryBar pct={row.masteryAfter} color={C.mint} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{row.masteryAfter}/100 ✓</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" as const, minWidth: 80 }}>
                    <div style={{ fontSize: 10, color: "#aaa", marginBottom: 6 }}>{row.resolved}</div>
                    <button
                      style={{
                        padding: "5px 10px",
                        borderRadius: 7,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: C.surface,
                        color: C.blue,
                        border: `1.5px solid rgba(56,189,248,0.25)`,
                      }}
                    >
                      View history →
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ textAlign: "center" as const, padding: 12, fontSize: 11, color: "#aaa" }}>
                Showing 2 of 12 resolved this term.{" "}
                <span style={{ color: C.blue, fontWeight: 700, cursor: "pointer" }}>View all →</span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#aaa",
                  paddingTop: 8,
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                Resolved interventions are retained for 90 days, then student names are anonymised. Teacher notes are deleted after 90 days.
              </div>
            </div>
          </div>
        )}

        {/* ── STATS ── */}
        {tab === "stats" && (
          <div style={{ maxWidth: 960 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: C.muted,
                marginBottom: 16,
              }}
            >
              Intervention statistics — this term (aggregate)
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: 14,
              }}
            >
              {/* Resolution Rate chart */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: 12,
                  padding: "16px 18px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    color: C.text,
                    marginBottom: 10,
                  }}
                >
                  Resolution Rate — Last 8 Weeks
                </div>
                <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 40, marginBottom: 4 }}>
                  {WEEK_BARS.map((b) => (
                    <div key={b.w} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2 }}>
                      <div
                        style={{
                          height: b.openH,
                          width: 16,
                          background: b.resolvedH > 0 ? C.mint : C.blue,
                          borderRadius: "2px 2px 0 0",
                        }}
                      />
                      <div style={{ fontSize: 9, color: "#aaa", textAlign: "center" as const }}>{b.w}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Blue = opened. Green = resolved in same week.</div>
              </div>

              {/* Trigger Distribution */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: 12,
                  padding: "16px 18px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    color: C.text,
                    marginBottom: 10,
                  }}
                >
                  Trigger Distribution — This Term
                </div>
                {[
                  { label: "Confidence floor", n: 8, pct: "50%" },
                  { label: "Absence follow-up", n: 4, pct: "25%" },
                  { label: "Hint pattern", n: 2, pct: "13%" },
                  { label: "Band ceiling", n: 2, pct: "13%" },
                ].map((r) => (
                  <div
                    key={r.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "5px 0",
                      borderBottom: `1px solid ${C.border}`,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: C.muted }}>{r.label}</span>
                    <span>
                      <span style={{ fontWeight: 800, color: C.text }}>{r.n}</span>{" "}
                      <span style={{ fontSize: 10, color: C.muted }}>{r.pct}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Resolution Funnel */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: 12,
                  padding: "16px 18px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    color: C.text,
                    marginBottom: 10,
                  }}
                >
                  Resolution Funnel — This Term
                </div>
                {[
                  { label: "Total opened", n: 16 },
                  { label: "Resolved by system", n: 9, pct: "56%" },
                  { label: "Resolved by teacher action", n: 3, pct: "19%" },
                  { label: "Still active / improving", n: 4, pct: "25%" },
                ].map((r) => (
                  <div
                    key={r.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "5px 0",
                      borderBottom: `1px solid ${C.border}`,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: C.muted }}>{r.label}</span>
                    <span>
                      <span style={{ fontWeight: 800, color: C.text }}>{r.n}</span>{" "}
                      {r.pct && <span style={{ fontSize: 10, color: C.muted }}>{r.pct}</span>}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: `1px solid ${C.border}`,
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#15803d",
                  }}
                >
                  78% resolved this term
                </div>
              </div>

              {/* Avg days */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: 12,
                  padding: "16px 18px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    color: C.text,
                    marginBottom: 10,
                  }}
                >
                  Average Days to Resolution
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                  {[
                    { n: "8.4", lbl: "Avg days (all)", color: C.text },
                    { n: "6.1", lbl: "Confidence floor", color: C.mint },
                    { n: "4.8", lbl: "Absence", color: C.blue },
                  ].map((s) => (
                    <div key={s.lbl} style={{ textAlign: "center" as const }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.n}</div>
                      <div style={{ fontSize: 10, color: "#aaa", fontWeight: 700 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#aaa", lineHeight: 1.4 }}>
                  Stats are class-level aggregates. No per-student comparison or ranking shown.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
