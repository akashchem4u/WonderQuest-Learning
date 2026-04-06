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
type SkillStatus = "strong" | "building" | "started";

type SkillEntry = {
  name: string;
  score: number;
  status: SkillStatus;
};

type SessionEntry = {
  date: string;
  skill: string;
  stars: number;
  perfect: boolean;
};

type WeekDay = {
  label: string;
  count: number;
};

const STUDENT = {
  name: "Maya",
  initials: "M",
  avatarColor: "#9b72ff",
  band: "P2 \u00b7 G2\u20133",
  bandBg: "rgba(155,114,255,0.15)",
  bandColor: "#9b72ff",
  activeSince: "Sep 2025",
  starsThisWeek: 18,
  sessionsThisWeek: 5,
  streak: 3,
  skillsInQueue: 2,
  inQueue: true,
  queueNote: "Confidence floor 3\u00d7 on Fractions: Division",
  skills: [
    { name: "Fractions: Addition", score: 51, status: "building" as SkillStatus },
    { name: "Fractions: Division", score: 32, status: "started" as SkillStatus },
    { name: "Place Value: Tens", score: 74, status: "strong" as SkillStatus },
    { name: "Addition: Regrouping", score: 68, status: "strong" as SkillStatus },
    { name: "Multiplication: \u00d72\u2013\u00d75", score: 44, status: "building" as SkillStatus },
  ] as SkillEntry[],
  sessions: [
    { date: "Today", skill: "Fractions: Addition", stars: 4, perfect: false },
    { date: "Today", skill: "Fractions: Division", stars: 2, perfect: false },
    { date: "Yesterday", skill: "Multiplication: \u00d72\u2013\u00d75", stars: 6, perfect: true },
    { date: "Mon", skill: "Place Value: Tens", stars: 5, perfect: false },
  ] as SessionEntry[],
  weekActivity: [
    { label: "Mon", count: 1 },
    { label: "Tue", count: 2 },
    { label: "Wed", count: 0 },
    { label: "Thu", count: 0 },
    { label: "Fri", count: 2 },
  ] as WeekDay[],
  teacherNote:
    "Spoke with Maya on Wednesday. She mentioned fractions are confusing \u2014 specifically the equal parts idea. Suggested visual model (pizza slices). Will monitor progress over next 2 sessions before escalating.",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function skillBarColor(status: SkillStatus): string {
  if (status === "strong") return C.mint;
  if (status === "building") return C.blue;
  return "rgba(255,255,255,0.2)";
}

function skillBadgeStyle(status: SkillStatus): React.CSSProperties {
  if (status === "strong")
    return { background: "rgba(34,197,94,0.15)", color: C.mint, border: "1px solid rgba(34,197,94,0.35)" };
  if (status === "building")
    return { background: "rgba(56,189,248,0.15)", color: C.blue, border: "1px solid rgba(56,189,248,0.35)" };
  return { background: "rgba(255,255,255,0.07)", color: C.muted, border: "1px solid rgba(255,255,255,0.12)" };
}

function skillStatusLabel(status: SkillStatus): string {
  if (status === "strong") return "Strong";
  if (status === "building") return "Building";
  return "Just started";
}

function weekBarMax(days: WeekDay[]): number {
  return Math.max(...days.map((d) => d.count), 1);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Card({
  title,
  titleRight,
  children,
}: {
  title: string;
  titleRight?: React.ReactNode;
  children: React.ReactNode;
}) {
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
            color: C.muted,
          }}
        >
          {title}
        </span>
        {titleRight}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TeacherStudentDetailPage() {
  const params = useParams();
  const studentId = params?.studentId as string | undefined;

  const student = STUDENT;
  const maxWeek = weekBarMax(student.weekActivity);

  const [noteExpanded, setNoteExpanded] = useState(false);

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
            href="/teacher/class"
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
            {"← Class"}
          </Link>
          <span style={{ color: C.border, fontSize: 16 }}>/</span>
          <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>
            {student.name}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Link
              href="/teacher/command"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.blue,
                textDecoration: "none",
                padding: "6px 14px",
                border: `1px solid rgba(56,189,248,0.3)`,
                borderRadius: 8,
              }}
            >
              Command Center
            </Link>
          </div>
        </div>

        {/* ── Student profile header ── */}
        <div
          style={{
            margin: "22px 28px 0",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "20px 22px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            {/* Avatar */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: student.avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {student.initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 6 }}>
                {student.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 14,
                    background: student.bandBg,
                    color: student.bandColor,
                    border: `1px solid ${student.bandColor}44`,
                  }}
                >
                  {student.band}
                </span>
                <span style={{ fontSize: 11, color: C.muted }}>
                  Active since {student.activeSince}
                </span>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap" as const }}>
                {[
                  { val: `\u2b50 ${student.starsThisWeek}`, lbl: "Stars this week" },
                  { val: String(student.sessionsThisWeek), lbl: "Sessions this week" },
                  { val: student.streak > 0 ? `\uD83D\uDD25 ${student.streak}d` : "\u2014", lbl: "Current streak" },
                  { val: String(student.skillsInQueue), lbl: "Skills in queue" },
                ].map(({ val, lbl }) => (
                  <div key={lbl} style={{ textAlign: "center" as const }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{val}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Queue flag */}
              {student.inQueue && (
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 14px",
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.35)",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.amber,
                  }}
                >
                  <span>⚠️</span>
                  <span>In support queue — {student.queueNote}</span>
                  <Link
                    href={`/teacher/interventions/${studentId ?? "s-maya"}`}
                    style={{
                      marginLeft: "auto",
                      padding: "5px 12px",
                      background: C.amber,
                      color: "#100b2e",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 800,
                      textDecoration: "none",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    View queue item
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Content grid ── */}
        <div
          style={{
            margin: "18px 28px 0",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {/* Skills */}
          <Card title="Skills" titleRight={
            <span style={{ fontSize: 11, fontWeight: 700, color: C.blue, cursor: "pointer" }}>
              View all
            </span>
          }>
            {student.skills.map((skill, i) => (
              <div
                key={skill.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  borderBottom: i < student.skills.length - 1 ? `1px solid ${C.border}` : "none",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.text,
                  }}
                >
                  {skill.name}
                </span>
                <div
                  style={{
                    width: 60,
                    height: 5,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 3,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: `${skill.score}%`,
                      height: "100%",
                      background: skillBarColor(skill.status),
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: C.muted, minWidth: 28, textAlign: "right" as const }}>
                  {skill.score}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                    whiteSpace: "nowrap" as const,
                    ...skillBadgeStyle(skill.status),
                  }}
                >
                  {skillStatusLabel(skill.status)}
                </span>
              </div>
            ))}
          </Card>

          {/* Recent sessions */}
          <Card title="Recent Sessions">
            {student.sessions.map((sess, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 0",
                  borderBottom: i < student.sessions.length - 1 ? `1px solid ${C.border}` : "none",
                  fontSize: 11,
                }}
              >
                <span style={{ minWidth: 68, color: C.muted, fontWeight: 600 }}>{sess.date}</span>
                <span style={{ flex: 1, fontWeight: 700, color: C.text }}>{sess.skill}</span>
                <span style={{ color: C.muted }}>\u2b50 {sess.stars}</span>
                {sess.perfect && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 6,
                      background: "rgba(255,209,102,0.15)",
                      color: C.gold,
                      border: "1px solid rgba(255,209,102,0.35)",
                    }}
                  >
                    \u2b50 Perfect
                  </span>
                )}
              </div>
            ))}
          </Card>

          {/* Sessions this week */}
          <Card title="Sessions This Week">
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 7 }}>
              {student.weekActivity.map((day) => (
                <div key={day.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, minWidth: 28 }}>
                    {day.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    {day.count > 0 && (
                      <div
                        style={{
                          width: `${(day.count / maxWeek) * 100}%`,
                          height: "100%",
                          background: C.blue,
                          borderRadius: 3,
                        }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: C.muted, minWidth: 20, textAlign: "right" as const }}>
                    {day.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Teacher note */}
          <Card
            title="Teacher Note"
            titleRight={
              <button
                onClick={() => setNoteExpanded(!noteExpanded)}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.blue,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                type="button"
              >
                Edit
              </button>
            }
          >
            <div
              style={{
                background: "rgba(56,189,248,0.06)",
                border: "1px solid rgba(56,189,248,0.18)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                color: "rgba(240,246,255,0.75)",
                lineHeight: 1.6,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  color: C.blue,
                  marginBottom: 6,
                }}
              >
                Private note \u2014 visible to teacher only
              </div>
              {student.teacherNote}
            </div>
            <button
              type="button"
              style={{
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
              + Add / edit note
            </button>
          </Card>
        </div>
      </div>
    </AppFrame>
  );
}
