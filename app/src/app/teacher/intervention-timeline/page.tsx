"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ───────────────────────────────────────────────────────────────────
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
};

// ── Types & stub data ─────────────────────────────────────────────────────────
type EventType = "trigger" | "note" | "mastery" | "system" | "resolve";

type MasteryBar = {
  label: string;
  pct: number;
  color: string;
  score: string;
};

type TimelineEvent = {
  type: EventType;
  icon: string;
  dotBg: string;
  dotBorder: string;
  chipBg: string;
  chipColor: string;
  chipLabel: string;
  date: string;
  title: string;
  detail?: string;
  noteText?: string;
  masteryBars?: MasteryBar[];
};

const ACTIVE_EVENTS: TimelineEvent[] = [
  {
    type: "trigger",
    icon: "⚠️",
    dotBg: "#fef3c7",
    dotBorder: C.amber,
    chipBg: "rgba(245,158,11,0.15)",
    chipColor: "#92400e",
    chipLabel: "⚠️ Trigger",
    date: "Mar 22, 2026 · 9:14am",
    title: "Support queue triggered",
    detail: "confidence_floor_hit reached threshold (3 hits on Fractions: Division). System created queue item and notified teacher.",
  },
  {
    type: "note",
    icon: "🗒️",
    dotBg: "rgba(56,189,248,0.15)",
    dotBorder: C.blue,
    chipBg: "rgba(56,189,248,0.15)",
    chipColor: C.blue,
    chipLabel: "🗒️ Teacher note",
    date: "Mar 22, 2026 · 2:30pm",
    title: "Teacher check-in & note logged",
    detail: "Queue item acknowledged. Teacher spoke with Jordan during class.",
    noteText: "Spoke with Jordan. They mentioned fractions are confusing — specifically the \"equal parts\" idea. Suggested pizza-slice visual. Will monitor 2 sessions.",
  },
  {
    type: "system",
    icon: "⚙️",
    dotBg: "rgba(255,255,255,0.06)",
    dotBorder: "rgba(255,255,255,0.2)",
    chipBg: "rgba(255,255,255,0.06)",
    chipColor: C.muted,
    chipLabel: "⚙️ System",
    date: "Mar 22, 2026 · 9:14am",
    title: "System: difficulty slightly reduced",
    detail: "Adaptive engine lowered difficulty on Fractions: Division while confidence floor flag is active. Will restore on resolution.",
  },
  {
    type: "mastery",
    icon: "📈",
    dotBg: "rgba(34,197,94,0.15)",
    dotBorder: C.mint,
    chipBg: "rgba(34,197,94,0.15)",
    chipColor: C.mint,
    chipLabel: "📈 Mastery transition",
    date: "Mar 24, 2026 · 4:08pm",
    title: "Mastery status: Just started → Building",
    detail: "Completed 2 sessions since check-in. Mastery crossed 40-threshold. Confidence floor hits reduced to 1 (vs 3 before intervention).",
    masteryBars: [
      { label: "Before", pct: 32, color: C.muted, score: "32 / 100" },
      { label: "After", pct: 46, color: C.blue, score: "46 / 100" },
    ],
  },
  {
    type: "note",
    icon: "🗒️",
    dotBg: "rgba(56,189,248,0.15)",
    dotBorder: C.blue,
    chipBg: "rgba(56,189,248,0.15)",
    chipColor: C.blue,
    chipLabel: "🗒️ Teacher note",
    date: "Mar 24, 2026 · 5:00pm",
    title: "Follow-up note",
    noteText: "Good progress! Jordan seems more confident. Continuing to monitor. Will mark resolved if mastery reaches 65+ without floor hits.",
  },
];

const RESOLVED_EVENTS: TimelineEvent[] = [
  {
    type: "trigger",
    icon: "⚠️",
    dotBg: "#fef3c7",
    dotBorder: C.amber,
    chipBg: "rgba(245,158,11,0.15)",
    chipColor: "#92400e",
    chipLabel: "⚠️ Trigger",
    date: "Mar 22 · 9:14am",
    title: "Queue triggered — Confidence floor 3×",
  },
  {
    type: "note",
    icon: "🗒️",
    dotBg: "rgba(56,189,248,0.15)",
    dotBorder: C.blue,
    chipBg: "rgba(56,189,248,0.15)",
    chipColor: C.blue,
    chipLabel: "🗒️ Note",
    date: "Mar 22 · 2:30pm",
    title: "Teacher check-in — visual model suggested",
  },
  {
    type: "mastery",
    icon: "📈",
    dotBg: "rgba(34,197,94,0.15)",
    dotBorder: C.mint,
    chipBg: "rgba(34,197,94,0.15)",
    chipColor: C.mint,
    chipLabel: "📈 Transition",
    date: "Mar 24 · 4:08pm",
    title: "Mastery: Just started → Building (46)",
  },
  {
    type: "mastery",
    icon: "💪",
    dotBg: "rgba(34,197,94,0.15)",
    dotBorder: C.mint,
    chipBg: "rgba(34,197,94,0.15)",
    chipColor: C.mint,
    chipLabel: "💪 Mastery: Strong",
    date: "Mar 27 · 3:22pm",
    title: "Mastery: Building → Strong (74)",
    masteryBars: [
      { label: "Before", pct: 32, color: C.muted, score: "32" },
      { label: "Now", pct: 74, color: C.mint, score: "74" },
    ],
  },
  {
    type: "resolve",
    icon: "✅",
    dotBg: "rgba(34,197,94,0.15)",
    dotBorder: C.mint,
    chipBg: "rgba(34,197,94,0.15)",
    chipColor: C.mint,
    chipLabel: "✅ Resolved",
    date: "Mar 28 · 9:00am",
    title: "Intervention resolved",
    detail: "Mastery reached Strong threshold (74/100). 0 confidence floor hits for 5 days. System auto-resolved and archived. Duration: 6 days.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function InterventionTimelinePage() {
  const [activeTab, setActiveTab] = useState<"full" | "resolved">("full");

  const isActive = activeTab === "full";
  const events = isActive ? ACTIVE_EVENTS : RESOLVED_EVENTS;
  const statusLabel = isActive ? "⚠️ Active" : "✅ Resolved";
  const statusBg = isActive ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)";
  const statusColor = isActive ? "#92400e" : C.mint;
  const subtitle = isActive ? "P2 · G2–3 · Started Mar 22, 2026" : "P2 · G2–3 · Resolved Mar 28, 2026";

  return (
    <AppFrame audience="teacher">
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* Page heading */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.blue, letterSpacing: "-0.3px", marginBottom: 4 }}>Intervention Timeline</div>
            <div style={{ fontSize: 13, color: C.muted }}>Full history for Jordan · Fractions: Division</div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: `1px solid ${C.border}` }}>
            {(["full", "resolved"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: activeTab === tab ? C.blue : C.muted,
                  borderBottom: activeTab === tab ? `2px solid ${C.blue}` : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {tab === "full" ? "Full Timeline" : "Resolved History"}
              </button>
            ))}
          </div>

          {/* Timeline card */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 24px", maxWidth: 620 }}>

            {/* Card header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>Jordan — Fractions: Division</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{subtitle}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: statusBg, color: statusColor, flexShrink: 0 }}>
                {statusLabel}
              </span>
            </div>

            {/* Timeline events */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {events.map((ev, idx) => (
                <div key={`${ev.date}-${ev.title}`} style={{ display: "flex", gap: 14, paddingBottom: idx < events.length - 1 ? 20 : 0, position: "relative" }}>
                  {idx < events.length - 1 && (
                    <div style={{ position: "absolute", left: 17, top: 34, bottom: 0, width: 2, background: C.border }} />
                  )}
                  {/* Left column: dot */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, zIndex: 1, position: "relative",
                      background: ev.dotBg, border: `2px solid ${ev.dotBorder}`,
                    }}>
                      {ev.icon}
                    </div>
                  </div>
                  {/* Right column: content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{ev.date}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: ev.detail || ev.noteText || ev.masteryBars ? 5 : 0 }}>{ev.title}</div>
                    {ev.detail && (
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: ev.noteText || ev.masteryBars ? 8 : 0 }}>{ev.detail}</div>
                    )}
                    {ev.noteText && (
                      <div style={{ background: "rgba(56,189,248,0.06)", borderRadius: 8, padding: "9px 11px", fontSize: 11, color: C.muted, lineHeight: 1.5, marginTop: 8, borderLeft: `3px solid ${C.blue}` }}>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: C.blue, letterSpacing: "0.06em", marginBottom: 4 }}>Teacher note</div>
                        {ev.noteText}
                      </div>
                    )}
                    {ev.masteryBars && ev.masteryBars.map((bar) => (
                      <div key={bar.label} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                        <div style={{ fontSize: 11, color: C.muted, minWidth: 36 }}>{bar.label}</div>
                        <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${bar.pct}%`, height: "100%", background: bar.color, borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 800, minWidth: 38, color: bar.color }}>{bar.score}</div>
                      </div>
                    ))}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, marginTop: 5, background: ev.chipBg, color: ev.chipColor }}>
                      {ev.chipLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{ marginTop: 28, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 12 }}>Timeline Event Types</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { icon: "⚠️", label: "Trigger", bg: "rgba(245,158,11,0.15)", color: "#92400e" },
                { icon: "🗒️", label: "Teacher note", bg: "rgba(56,189,248,0.15)", color: C.blue },
                { icon: "📈", label: "Mastery transition", bg: "rgba(34,197,94,0.15)", color: C.mint },
                { icon: "⚙️", label: "System adjustment", bg: "rgba(255,255,255,0.06)", color: C.muted },
                { icon: "✅", label: "Resolution", bg: "rgba(34,197,94,0.15)", color: C.mint },
              ].map((leg) => (
                <span key={leg.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, padding: "4px 10px", borderRadius: 20, background: leg.bg, color: leg.color, fontWeight: 600 }}>
                  {leg.icon} {leg.label}
                </span>
              ))}
            </div>
          </div>

          {/* Privacy note */}
          <div style={{ marginTop: 16, fontSize: 12, color: C.muted, background: "rgba(56,189,248,0.05)", border: `1px solid rgba(56,189,248,0.12)`, borderRadius: 8, padding: "10px 14px", lineHeight: 1.6 }}>
            🔒 Teacher notes are private to you. No accuracy %, wrong answers, or session-level data is shown in this timeline.
            Resolved interventions are archived for 90 days, then anonymised.
          </div>

          {/* Back link */}
          <div style={{ marginTop: 20 }}>
            <a href="/teacher/support" style={{ fontSize: 13, fontWeight: 600, color: C.blue, textDecoration: "none" }}>← Back to Support Queue</a>
          </div>

        </div>
      </div>
    </AppFrame>
  );
}
