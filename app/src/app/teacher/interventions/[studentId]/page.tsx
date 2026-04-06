"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ---------------------------------------------------------------------------
// Colour palette
// ---------------------------------------------------------------------------
const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
};

// ---------------------------------------------------------------------------
// Stub data
// ---------------------------------------------------------------------------
type ActionItem = {
  done: boolean;
  title: string;
  desc: string;
  due: string;
};

type TimelineEvent = {
  icon: string;
  dotBg: string;
  date: string;
  title: string;
  detail: string;
};

const INTERVENTION = {
  studentName: "Maya",
  skill: "Fractions: Division",
  band: "P2 · G2–3",
  trigger: "Confidence floor",
  openedDate: "Mar 22, 2026",
  daysActive: 3,
  status: "active" as const,
  masteryBefore: 32,
  masteryNow: 46,
  masteryBeforeLabel: "Just started",
  masteryNowLabel: "Building",
  sessionsSinceFlag: 4,
  floorHitsSinceFlag: 1,
  trend: "↑ improving",
  actions: [
    {
      done: true,
      title: "Check-in with Maya",
      desc: "Asked how fractions were going. Maya mentioned confusion with the equal parts idea.",
      due: "Mar 22",
    },
    {
      done: true,
      title: "Suggest visual model",
      desc: "Recommended pizza-slice diagram. Logged note for reference.",
      due: "Mar 22",
    },
    {
      done: false,
      title: "Follow-up in 2 sessions",
      desc: "Review mastery progress — if still below 65 after 2 more sessions, escalate.",
      due: "Due: Mar 26",
    },
  ] as ActionItem[],
  timeline: [
    {
      icon: "⚠️",
      dotBg: "rgba(245,158,11,0.2)",
      date: "Mar 22, 2026 — 9:14am",
      title: "Support queue triggered — Confidence floor",
      detail:
        "confidence_floor_hit reached 3× threshold on Fractions: Division. System flagged for teacher review.",
    },
    {
      icon: "🗒️",
      dotBg: "rgba(56,189,248,0.15)",
      date: "Mar 22, 2026 — 2:30pm",
      title: "Teacher check-in logged",
      detail:
        "Teacher acknowledged queue item and logged note: "Spoke with Maya. Visual model suggested."",
    },
    {
      icon: "📈",
      dotBg: "rgba(34,197,94,0.15)",
      date: "Mar 24, 2026 — 4:08pm",
      title: "Mastery increased to 46/100",
      detail:
        "Maya completed 2 sessions on Fractions: Division. Mastery moved from Just started → Building. 1 floor hit (vs 3 before).",
    },
  ] as TimelineEvent[],
};

// ---------------------------------------------------------------------------
// Card wrapper
// ---------------------------------------------------------------------------
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          color: C.muted,
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TeacherInterventionDetailPage() {
  const params = useParams();
  const studentId = (params?.studentId as string | undefined) ?? "s-maya";

  const data = INTERVENTION;
  const [actions, setActions] = useState<ActionItem[]>(data.actions);

  function toggleAction(idx: number) {
    setActions((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, done: !a.done } : a))
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: C.text,
          paddingBottom: 60,
        }}
      >
        {/* ── Topbar ── */}
        <div
          style={{
            borderBottom: `1px solid ${C.border}`,
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Link
            href={`/teacher/students/${studentId}`}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.muted,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            ← Student
          </Link>
          <span style={{ color: C.border, fontSize: 16 }}>/</span>
          <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>
            Intervention: {data.studentName} · {data.skill}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Link
              href="/teacher"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.blue,
                textDecoration: "none",
                padding: "6px 14px",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: 8,
              }}
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* ── Intervention header card ── */}
        <div
          style={{
            margin: "22px 28px 0",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderTop: `3px solid ${C.amber}`,
            borderRadius: 14,
            padding: "20px 22px",
          }}
        >
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
            <span style={{ fontSize: 36, flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 6 }}>
                {data.studentName} — {data.skill}
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                Triggered: Confidence floor hit 3× on {data.skill} ({data.band})
                <br />
                Opened: {data.openedDate} · Status: Active
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginTop: 10 }}>
                {[
                  { label: "Confidence floor", bg: "rgba(245,158,11,0.15)", color: C.amber },
                  { label: data.band, bg: "rgba(255,255,255,0.07)", color: C.muted },
                  { label: `Day ${data.daysActive} of intervention`, bg: "rgba(255,255,255,0.07)", color: C.muted },
                ].map(({ label, bg, color }) => (
                  <span
                    key={label}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: bg,
                      color,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: `1.5px solid rgba(56,189,248,0.35)`,
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.blue,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Log note
              </button>
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  background: C.mint,
                  border: "none",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#100b2e",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Mark resolved
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { val: `${data.masteryBefore}→${data.masteryNow}`, lbl: "Mastery (before → now)" },
              { val: String(data.sessionsSinceFlag), lbl: "Sessions since flag" },
              { val: String(data.floorHitsSinceFlag), lbl: "Floor hits since flag" },
              { val: data.trend, lbl: "Trend", valColor: C.mint },
            ].map(({ val, lbl, valColor }) => (
              <div
                key={lbl}
                style={{
                  textAlign: "center" as const,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "10px 18px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: valColor ?? C.text,
                  }}
                >
                  {val}
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-column: mastery progress + action plan ── */}
        <div
          style={{
            margin: "16px 28px 0",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {/* Mastery progress */}
          <Card title={`Mastery Progress — ${data.skill}`}>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
              {/* Before */}
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Before intervention ({data.openedDate})
              </div>
              <div
                style={{
                  height: 12,
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: 6,
                  overflow: "hidden",
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    width: `${data.masteryBefore}%`,
                    height: "100%",
                    background: "rgba(255,255,255,0.25)",
                    borderRadius: 6,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  marginBottom: 10,
                }}
              >
                <span style={{ color: C.muted }}>{data.masteryBefore} / 100</span>
                <span style={{ color: C.muted }}>🌱 {data.masteryBeforeLabel}</span>
              </div>

              {/* Arrow */}
              <div style={{ textAlign: "center" as const, fontSize: 22, color: C.mint, marginBottom: 10 }}>
                ↓
              </div>

              {/* Now */}
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Current (Mar 24)
              </div>
              <div
                style={{
                  height: 12,
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: 6,
                  overflow: "hidden",
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    width: `${data.masteryNow}%`,
                    height: "100%",
                    background: C.blue,
                    borderRadius: 6,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  marginBottom: 12,
                }}
              >
                <span style={{ fontWeight: 800, color: C.mint }}>{data.masteryNow} / 100</span>
                <span style={{ fontWeight: 700, color: C.blue }}>
                  📈 {data.masteryNowLabel}
                </span>
              </div>

              {/* Progress note */}
              <div
                style={{
                  padding: "8px 12px",
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.mint,
                }}
              >
                ↑ +{data.masteryNow - data.masteryBefore} mastery points in {data.daysActive} days — Maya is responding well.
              </div>
            </div>
          </Card>

          {/* Action plan */}
          <Card title="Action Plan">
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {actions.map((action, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleAction(i)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      border: action.done ? "none" : "2px solid rgba(56,189,248,0.35)",
                      background: action.done ? C.mint : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 900,
                      color: action.done ? "#100b2e" : "transparent",
                      flexShrink: 0,
                      marginTop: 1,
                      cursor: "pointer",
                    }}
                  >
                    {action.done ? "✓" : ""}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: action.done ? C.muted : C.text,
                        textDecoration: action.done ? "line-through" : "none",
                        marginBottom: 3,
                      }}
                    >
                      {action.title}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4, marginBottom: 3 }}>
                      {action.desc}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(139,148,158,0.7)" }}>{action.due}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              style={{
                marginTop: 10,
                width: "100%",
                padding: "9px",
                background: "transparent",
                border: `1.5px solid rgba(56,189,248,0.3)`,
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                color: C.blue,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              + Add action
            </button>
          </Card>
        </div>

        {/* ── Timeline ── */}
        <div style={{ margin: "16px 28px 0" }}>
          <Card title="Intervention Timeline">
            <div style={{ display: "flex", flexDirection: "column" as const }}>
              {data.timeline.map((event, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    paddingBottom: i < data.timeline.length - 1 ? 20 : 0,
                    position: "relative" as const,
                  }}
                >
                  {/* Connector line */}
                  {i < data.timeline.length - 1 && (
                    <div
                      style={{
                        position: "absolute" as const,
                        left: 15,
                        top: 32,
                        bottom: 0,
                        width: 2,
                        background: C.border,
                      }}
                    />
                  )}
                  {/* Dot */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: event.dotBg,
                      border: `1px solid ${C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      flexShrink: 0,
                      position: "relative" as const,
                      zIndex: 1,
                    }}
                  >
                    {event.icon}
                  </div>
                  {/* Body */}
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>
                      {event.date}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                      {event.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppFrame>
  );
}
