"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.14)",
  text: "#f0f6ff",
  muted: "#8b949e",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
};

// ── Stub data keyed by id ─────────────────────────────────────────────────────
type ActionItem = {
  title: string;
  desc: string;
  date: string;
  done: boolean;
};

type TimelineEvent = {
  icon: string;
  dotBg: string;
  dotBorder: string;
  date: string;
  title: string;
  detail: string;
};

type InterventionData = {
  student: string;
  skill: string;
  triggerDetail: string;
  opened: string;
  status: "Active" | "Resolved";
  statusColor: string;
  chips: { label: string; bg: string; color: string }[];
  masteryBefore: number;
  masteryBeforeLabel: string;
  masteryNow: number;
  masteryNowLabel: string;
  masteryDelta: string;
  deltaNote: string;
  sessionsCount: number;
  floorHitsSinceFlag: number;
  trend: string;
  trendColor: string;
  actions: ActionItem[];
  timeline: TimelineEvent[];
};

const INTERVENTIONS: Record<string, InterventionData> = {
  default: {
    student: "Jordan",
    skill: "Fractions: Division",
    triggerDetail: "Triggered: Confidence floor hit 3× on Fractions: Division (P2 · G2–3)\nOpened: Mar 22, 2026 · Status: Active",
    opened: "Mar 22, 2026",
    status: "Active",
    statusColor: C.amber,
    chips: [
      { label: "Confidence floor", bg: "#fef3c7", color: "#92400e" },
      { label: "P2 · G2–3", bg: "rgba(255,255,255,0.06)", color: C.muted },
      { label: "Day 3 of intervention", bg: "rgba(255,255,255,0.06)", color: C.muted },
    ],
    masteryBefore: 32,
    masteryBeforeLabel: "Just started",
    masteryNow: 46,
    masteryNowLabel: "Building",
    masteryDelta: "32→46",
    deltaNote: "+14 mastery points in 3 days — Jordan is responding well.",
    sessionsCount: 4,
    floorHitsSinceFlag: 1,
    trend: "↑ improving",
    trendColor: C.mint,
    actions: [
      { title: "Check-in with Jordan", desc: "Asked how fractions were going. Jordan mentioned confusion with \"equal parts\" idea.", date: "Mar 22", done: true },
      { title: "Suggest visual model", desc: "Recommended pizza-slice diagram. Logged note for reference.", date: "Mar 22", done: true },
      { title: "Follow-up in 2 sessions", desc: "Review mastery progress — if still below 65 after 2 more sessions, escalate.", date: "Due: Mar 26", done: false },
    ],
    timeline: [
      {
        icon: "⚠️",
        dotBg: "#fef3c7",
        dotBorder: "#f59e0b",
        date: "Mar 22, 2026 — 9:14am",
        title: "Support queue triggered — Confidence floor",
        detail: "confidence_floor_hit reached 3× threshold on Fractions: Division. System flagged for teacher review.",
      },
      {
        icon: "🗒️",
        dotBg: "rgba(56,189,248,0.15)",
        dotBorder: "#38bdf8",
        date: "Mar 22, 2026 — 2:30pm",
        title: "Teacher check-in logged",
        detail: "Ms. Sharma acknowledged queue item and logged note: \"Spoke with Jordan. Visual model suggested.\"",
      },
      {
        icon: "📈",
        dotBg: "rgba(34,197,94,0.15)",
        dotBorder: "#22c55e",
        date: "Mar 24, 2026 — 4:08pm",
        title: "Mastery increased to 46/100",
        detail: "Jordan completed 2 sessions on Fractions: Division. Mastery moved from Just started → Building. 1 floor hit (vs 3 before).",
      },
    ],
  },
};

function getIntervention(id: string): InterventionData {
  return INTERVENTIONS[id] ?? INTERVENTIONS.default;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function InterventionDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "default";
  const data = getIntervention(id);
  const [showLogNote, setShowLogNote] = useState(false);
  const [actions, setActions] = useState(data.actions);

  const toggleAction = (idx: number) => {
    setActions((prev) => prev.map((a, i) => (i === idx ? { ...a, done: !a.done } : a)));
  };

  return (
    <AppFrame audience="teacher">
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 60px" }}>

          {/* Breadcrumb */}
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 16 }}>
            <span style={{ color: C.blue, cursor: "pointer" }}>Support Queue</span>
            {" › "}
            Intervention: {data.student} · {data.skill}
          </div>

          {/* Intervention header card */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: `4px solid ${data.status === "Active" ? C.amber : C.mint}`, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 36, flexShrink: 0 }}>{data.status === "Active" ? "⚠️" : "✅"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>{data.student} — {data.skill}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5, whiteSpace: "pre-line" }}>{data.triggerDetail}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {data.chips.map((chip) => (
                    <span key={chip.label} style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: chip.bg, color: chip.color }}>{chip.label}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => setShowLogNote(true)}
                  style={{ padding: "8px 16px", background: "transparent", border: `1.5px solid ${C.blue}`, borderRadius: 10, fontSize: 12, fontWeight: 700, color: C.blue, cursor: "pointer" }}
                >
                  Log note
                </button>
                <button style={{ padding: "8px 16px", background: C.mint, border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                  Mark resolved
                </button>
              </div>
            </div>

            {/* Stat row */}
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { val: data.masteryDelta, lbl: "Mastery (before → now)" },
                { val: String(data.sessionsCount), lbl: "Sessions since flag" },
                { val: String(data.floorHitsSinceFlag), lbl: "Floor hits since flag" },
                { val: data.trend, lbl: "Trend", valColor: data.trendColor },
              ].map((stat) => (
                <div key={stat.lbl} style={{ textAlign: "center", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 16px", flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: stat.valColor ?? C.text }}>{stat.val}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{stat.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Log note modal (inline) */}
          {showLogNote && (
            <div style={{ background: C.surface, border: `1px solid ${C.blue}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 10 }}>Log a note for this intervention</div>
              <textarea
                placeholder="Write your note here..."
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, fontSize: 13, color: C.text, resize: "vertical", minHeight: 80 }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button style={{ padding: "8px 18px", background: C.blue, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>Save note</button>
                <button onClick={() => setShowLogNote(false)} style={{ padding: "8px 18px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.muted, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Two column */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

            {/* Mastery progress card */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: C.text, marginBottom: 12 }}>
                Mastery progress — {data.skill}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Before intervention ({data.opened})</div>
              <div style={{ height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 4 }}>
                <div style={{ width: `${data.masteryBefore}%`, height: "100%", background: C.muted, borderRadius: 6 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginBottom: 8 }}>
                <span>{data.masteryBefore} / 100</span>
                <span>🌱 {data.masteryBeforeLabel}</span>
              </div>
              <div style={{ textAlign: "center", fontSize: 18, color: C.mint, margin: "4px 0" }}>↓</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Current (Mar 24)</div>
              <div style={{ height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 4 }}>
                <div style={{ width: `${data.masteryNow}%`, height: "100%", background: C.blue, borderRadius: 6 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 10 }}>
                <span style={{ fontWeight: 800, color: C.mint }}>{data.masteryNow} / 100</span>
                <span style={{ fontSize: 10, color: C.blue, fontWeight: 700 }}>📈 {data.masteryNowLabel}</span>
              </div>
              <div style={{ padding: "8px 10px", background: "rgba(34,197,94,0.12)", borderRadius: 8, fontSize: 11, color: C.mint, fontWeight: 700 }}>
                ↑ {data.deltaNote}
              </div>
            </div>

            {/* Action plan card */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: C.text, marginBottom: 12 }}>Action plan</div>
              {actions.map((action, idx) => (
                <div key={action.title} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 8, border: `1.5px solid ${C.border}`, cursor: "pointer" }} onClick={() => toggleAction(idx)}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5,
                    border: action.done ? "none" : `2px solid rgba(155,114,255,0.4)`,
                    background: action.done ? C.mint : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 900, color: "#fff", flexShrink: 0, marginTop: 1,
                  }}>
                    {action.done ? "✓" : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{action.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{action.desc}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{action.date}</div>
                  </div>
                </div>
              ))}
              <button style={{ marginTop: 8, width: "100%", padding: 9, background: "rgba(255,255,255,0.04)", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 12, fontWeight: 700, color: C.blue, cursor: "pointer" }}>
                + Add action
              </button>
            </div>

          </div>

          {/* Timeline card */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: C.text, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Intervention timeline</span>
              <a href={`/teacher/intervention-timeline?id=${id}`} style={{ fontSize: 11, fontWeight: 700, color: C.blue, textDecoration: "none" }}>View full history →</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {data.timeline.map((ev, idx) => (
                <div key={ev.title} style={{ display: "flex", gap: 12, paddingBottom: idx < data.timeline.length - 1 ? 16 : 0, position: "relative" }}>
                  {idx < data.timeline.length - 1 && (
                    <div style={{ position: "absolute", left: 15, top: 30, bottom: 0, width: 2, background: C.border }} />
                  )}
                  <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, position: "relative", zIndex: 1, background: ev.dotBg, border: `2px solid ${ev.dotBorder}` }}>
                    {ev.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{ev.date}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>{ev.title}</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{ev.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppFrame>
  );
}
