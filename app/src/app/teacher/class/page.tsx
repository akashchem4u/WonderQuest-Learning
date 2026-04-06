"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
};

// ── Types ─────────────────────────────────────────────────────────────────────

type Band = "P0" | "P1" | "P2" | "P3";
type StudentTier = "strong" | "building" | "support";

type StudentRow = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  band: Band;
  masteryPct: number;
  sessions: number;
  stars: number;
  streak: boolean;
  tier: StudentTier;
  inQueue: boolean;
};

// ── API shape ─────────────────────────────────────────────────────────────────
type RosterStudent = {
  studentId: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  totalPoints: number;
  currentLevel: number;
  sessionsLast7d: number;
  correctLast7d: number;
  totalLast7d: number;
  lastSessionAt: string | null;
  inInterventionQueue: boolean;
  streak: number;
};

// ── Static fallback / UI data ─────────────────────────────────────────────────

const WEEKS = [
  "This week (Mar 24–28)",
  "Last week",
  "Mar 10–14",
  "Mar 3–7",
  "All time",
];

const STAT_TILES = [
  { val: "22", label: "Active students", delta: "↑3 vs last week", up: true },
  { val: "⭐ 1,847", label: "Stars earned", delta: "↑210", up: true },
  { val: "12", label: "Skills mastered", delta: "↓2 vs last week", up: false },
  { val: "16", label: "Active streaks", delta: "↑4", up: true },
  { val: "4", label: "Queue open", delta: "↓1", up: false },
];

const BAND_DISTRIBUTION: { band: Band; label: string; color: string; count: number; total: number }[] = [
  { band: "P0", label: "P0 Pre-K", color: C.gold, count: 2, total: 28 },
  { band: "P1", label: "P1 K–1", color: C.violet, count: 7, total: 28 },
  { band: "P2", label: "P2 G2–3", color: C.mint, count: 15, total: 28 },
  { band: "P3", label: "P3 G4–5", color: "#ff7b6b", count: 4, total: 28 },
];

const DAILY_SESSIONS = [
  { day: "M", count: 14 },
  { day: "T", count: 18 },
  { day: "W", count: 22 },
  { day: "Th", count: 20 },
  { day: "F", count: 0 },
];

const TOP_SKILLS = [
  { name: "Long Division", count: 18 },
  { name: "Fractions: Adding Unlike", count: 12 },
  { name: "Multiplication: Advanced", count: 8 },
  { name: "Place Value: Thousands", count: 6 },
  { name: "Subtraction: Regrouping", count: 5 },
];

const QUEUE_ITEMS = [
  { label: "Confidence floor", count: 2, color: C.amber },
  { label: "Absence follow-up", count: 1, color: C.amber },
  { label: "Band ceiling (ready)", count: 1, color: C.blue },
];

const FALLBACK_STUDENTS: StudentRow[] = [
  {
    id: "bella",
    name: "Bella",
    initials: "B",
    avatarColor: "#ec4899",
    band: "P3",
    masteryPct: 88,
    sessions: 4,
    stars: 92,
    streak: false,
    tier: "strong",
    inQueue: false,
  },
  {
    id: "marcus",
    name: "Marcus",
    initials: "M",
    avatarColor: "#0ea5e9",
    band: "P2",
    masteryPct: 72,
    sessions: 5,
    stars: 78,
    streak: false,
    tier: "building",
    inQueue: false,
  },
  {
    id: "jordan",
    name: "Jordan",
    initials: "J",
    avatarColor: "#475569",
    band: "P2",
    masteryPct: 38,
    sessions: 3,
    stars: 41,
    streak: false,
    tier: "support",
    inQueue: true,
  },
  {
    id: "priya",
    name: "Priya",
    initials: "P",
    avatarColor: "#ec4899",
    band: "P1",
    masteryPct: 52,
    sessions: 2,
    stars: 28,
    streak: false,
    tier: "building",
    inQueue: false,
  },
  {
    id: "ethan",
    name: "Ethan",
    initials: "E",
    avatarColor: "#16a34a",
    band: "P2",
    masteryPct: 65,
    sessions: 7,
    stars: 118,
    streak: true,
    tier: "building",
    inQueue: false,
  },
];

const WEEKLY_COMPARISON = [
  { week: "This week", active: 22, sessions: 88, stars: "1,847", mastered: 12, queue: 4, streak: "4.2 days", isCurrent: true },
  { week: "Last week (Mar 17–21)", active: 19, sessions: 76, stars: "1,637", mastered: 14, queue: 3, streak: "3.8 days", isCurrent: false },
  { week: "Mar 10–14", active: 21, sessions: 84, stars: "1,720", mastered: 18, queue: 2, streak: "4.0 days", isCurrent: false },
  { week: "Mar 3–7", active: 17, sessions: 68, stars: "1,402", mastered: 9, queue: 5, streak: "3.1 days", isCurrent: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const MAX_SESSIONS = Math.max(...DAILY_SESSIONS.map((d) => d.count), 1);

// Avatar colours cycling
const AVATAR_COLORS = [
  "#ec4899", "#0ea5e9", "#16a34a", "#f59e0b", "#9b72ff",
  "#ef4444", "#10b981", "#3b82f6", "#f97316", "#06b6d4",
];

function tierFromMastery(pct: number): StudentTier {
  if (pct >= 70) return "strong";
  if (pct >= 40) return "building";
  return "support";
}

function bandFromCode(code: string): Band {
  if (code === "P0") return "P0";
  if (code === "P1") return "P1";
  if (code === "P3") return "P3";
  return "P2";
}

function masteryFromAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

function mapRosterToStudentRows(roster: RosterStudent[]): StudentRow[] {
  return roster.map((s, idx) => {
    const masteryPct = masteryFromAccuracy(s.correctLast7d, s.totalLast7d);
    const tier = tierFromMastery(masteryPct);
    const initials = s.displayName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return {
      id: s.studentId,
      name: s.displayName,
      initials,
      avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
      band: bandFromCode(s.launchBandCode),
      masteryPct,
      sessions: s.sessionsLast7d,
      stars: s.totalPoints,
      streak: s.streak > 0,
      tier,
      inQueue: s.inInterventionQueue,
    };
  });
}

function tierColor(t: StudentTier): string {
  if (t === "strong") return C.mint;
  if (t === "building") return C.blue;
  return C.amber;
}

function tierLabel(t: StudentTier): string {
  if (t === "strong") return "Strong";
  if (t === "building") return "Building";
  return "Needs support";
}

function bandColor(b: Band): string {
  if (b === "P0") return C.gold;
  if (b === "P1") return C.violet;
  if (b === "P2") return C.mint;
  return "#ff7b6b";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeacherClassPage() {
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeTab, setActiveTab] = useState<"summary" | "compare">("summary");
  const [students, setStudents] = useState<StudentRow[]>(FALLBACK_STUDENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let teacherId = "demo-teacher";
    try {
      const stored = localStorage.getItem("wq_teacher_id");
      if (stored) teacherId = stored;
    } catch {
      // localStorage unavailable
    }

    fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { roster: RosterStudent[] }) => {
        if (data.roster && data.roster.length > 0) {
          setStudents(mapRosterToStudentRows(data.roster));
        }
        // empty roster → keep fallback
      })
      .catch(() => {
        // fetch error → keep fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const glassCard: React.CSSProperties = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "18px 20px",
  };

  const cardTitle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: C.muted,
    marginBottom: 12,
  };

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          fontFamily: "system-ui,-apple-system,sans-serif",
          color: C.text,
          paddingBottom: 56,
        }}
      >
        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "20px 28px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/teacher"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.blue,
              textDecoration: "none",
            }}
          >
            ← Dashboard
          </Link>
          <span style={{ color: C.border, fontSize: 14 }}>|</span>
          <span style={{ fontSize: 12, color: C.muted }}>Class Summary</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <Link
              href="/teacher/command"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.violet,
                textDecoration: "none",
                padding: "6px 14px",
                border: `1px solid ${C.violet}55`,
                borderRadius: 8,
              }}
            >
              Command Center
            </Link>
            <button
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 14px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${C.border}`,
                color: C.text,
                cursor: "pointer",
              }}
            >
              Export PDF
            </button>
          </div>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Page title ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: C.mint,
                  marginBottom: 4,
                }}
              >
                Class Summary
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: 0, lineHeight: 1.2 }}>
                📊 Class 4B Summary
              </h1>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                Weekly snapshot · {students.length} students{loading ? " (loading…)" : ""}
              </div>
            </div>

            {/* Tab switcher */}
            <div style={{ display: "flex", gap: 6 }}>
              {(["summary", "compare"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    background: activeTab === tab ? C.blue : "rgba(255,255,255,0.06)",
                    color: activeTab === tab ? "#0f172a" : C.muted,
                    transition: "all 0.15s",
                  }}
                >
                  {tab === "summary" ? "Class Summary" : "Weekly Comparison"}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: C.muted,
                padding: "12px 0",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: `2px solid ${C.blue}`,
                  borderTopColor: "transparent",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Loading class roster…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {activeTab === "summary" && (
            <>
              {/* ── Week selector ─────────────────────────────────────── */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {WEEKS.map((w, i) => (
                  <button
                    key={w}
                    onClick={() => setActiveWeek(i)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "system-ui,-apple-system,sans-serif",
                      border: "none",
                      background: activeWeek === i ? C.blue : "rgba(255,255,255,0.06)",
                      color: activeWeek === i ? "#0f172a" : C.muted,
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>

              {/* ── Stat tiles ────────────────────────────────────────── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5,1fr)",
                  gap: 10,
                }}
              >
                {STAT_TILES.map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      padding: "14px 16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                      {s.val}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: C.muted,
                        margin: "4px 0 2px",
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: s.up ? C.mint : C.amber,
                      }}
                    >
                      {s.delta}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── 2-col: band dist + daily sessions ─────────────────── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
                  gap: 14,
                }}
              >
                {/* Band distribution */}
                <div style={glassCard}>
                  <div style={cardTitle}>Band Distribution</div>
                  {BAND_DISTRIBUTION.map((b) => (
                    <div
                      key={b.band}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: b.color,
                          width: 68,
                          flexShrink: 0,
                        }}
                      >
                        {b.label}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          background: "rgba(255,255,255,0.07)",
                          borderRadius: 4,
                          height: 8,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.round((b.count / b.total) * 100)}%`,
                            height: "100%",
                            background: b.color,
                            borderRadius: 4,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          fontWeight: 700,
                          width: 20,
                          textAlign: "right",
                        }}
                      >
                        {b.count}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Daily sessions bar chart */}
                <div style={glassCard}>
                  <div style={cardTitle}>Daily Sessions — This Week</div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-end",
                      height: 72,
                      marginBottom: 6,
                    }}
                  >
                    {DAILY_SESSIONS.map((d) => {
                      const barH = d.count
                        ? Math.round((d.count / MAX_SESSIONS) * 60)
                        : 4;
                      return (
                        <div
                          key={d.day}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{ fontSize: 9, fontWeight: 700, color: C.muted }}
                          >
                            {d.count > 0 ? d.count : "—"}
                          </span>
                          <div
                            style={{
                              width: "100%",
                              height: `${barH}px`,
                              background: d.count ? C.blue : "rgba(255,255,255,0.1)",
                              borderRadius: "3px 3px 0 0",
                              minHeight: 4,
                            }}
                          />
                          <span
                            style={{ fontSize: 10, fontWeight: 700, color: C.muted }}
                          >
                            {d.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                    Sessions per day · Average: 18.5
                  </div>
                </div>
              </div>

              {/* ── 2-col: top skills + support queue ─────────────────── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
                  gap: 14,
                }}
              >
                {/* Top skills */}
                <div style={glassCard}>
                  <div style={cardTitle}>Top Skills in Progress This Week</div>
                  {TOP_SKILLS.map((s) => (
                    <div
                      key={s.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: C.text, fontWeight: 600 }}>{s.name}</span>
                      <span style={{ color: C.blue, fontWeight: 700 }}>
                        {s.count} students
                      </span>
                    </div>
                  ))}
                </div>

                {/* Support queue */}
                <div style={glassCard}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div style={cardTitle}>Support Queue This Week</div>
                    <Link
                      href="/teacher/support"
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.mint,
                        textDecoration: "none",
                      }}
                    >
                      Review →
                    </Link>
                  </div>
                  {QUEUE_ITEMS.map((q) => (
                    <div
                      key={q.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: C.text, fontWeight: 600 }}>{q.label}</span>
                      <span style={{ color: q.color, fontWeight: 700 }}>
                        {q.count} {q.count === 1 ? "student" : "students"}
                      </span>
                    </div>
                  ))}
                  <div style={{ marginTop: 12 }}>
                    <Link
                      href="/teacher/support"
                      style={{
                        display: "inline-block",
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.blue,
                        textDecoration: "none",
                        padding: "6px 14px",
                        border: `1px solid ${C.blue}44`,
                        borderRadius: 8,
                      }}
                    >
                      Review queue →
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── Student progress table ─────────────────────────────── */}
              <div style={glassCard}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <div style={cardTitle}>Student Progress This Week</div>
                  <Link
                    href="/teacher/students"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.blue,
                      textDecoration: "none",
                      padding: "5px 12px",
                      border: `1px solid ${C.blue}44`,
                      borderRadius: 8,
                    }}
                  >
                    See all students →
                  </Link>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr>
                        {["", "Student", "Band", "Sessions", "Stars", "Mastery (primary)", "Status"].map(
                          (h) => (
                            <th
                              key={h}
                              style={{
                                textAlign: "left",
                                padding: "8px 10px",
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                color: C.muted,
                                borderBottom: `2px solid ${C.border}`,
                                background: "rgba(255,255,255,0.02)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.id}>
                          <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: s.avatarColor,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 900,
                                color: "#fff",
                              }}
                            >
                              {s.initials}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              borderBottom: `1px solid ${C.border}`,
                              fontWeight: 700,
                              color: C.text,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.name}
                            {s.streak && <span style={{ marginLeft: 4, fontSize: 11 }}>🔥</span>}
                            {s.inQueue && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 9,
                                  fontWeight: 700,
                                  background: `${C.amber}22`,
                                  color: C.amber,
                                  border: `1px solid ${C.amber}44`,
                                  borderRadius: 5,
                                  padding: "1px 5px",
                                }}
                              >
                                ⚠ Queue
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: 5,
                                background: `${bandColor(s.band)}22`,
                                color: bandColor(s.band),
                                border: `1px solid ${bandColor(s.band)}44`,
                              }}
                            >
                              {s.band}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              borderBottom: `1px solid ${C.border}`,
                              color: C.text,
                            }}
                          >
                            {s.sessions}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              borderBottom: `1px solid ${C.border}`,
                              color: C.gold,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ⭐ {s.stars}
                          </td>
                          <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
                            <div
                              style={{
                                width: 60,
                                height: 5,
                                background: "rgba(255,255,255,0.07)",
                                borderRadius: 3,
                                overflow: "hidden",
                                display: "inline-block",
                                verticalAlign: "middle",
                              }}
                            >
                              <div
                                style={{
                                  width: `${s.masteryPct}%`,
                                  height: "100%",
                                  background: tierColor(s.tier),
                                  borderRadius: 3,
                                }}
                              />
                            </div>
                          </td>
                          <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <div
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: tierColor(s.tier),
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>
                                {tierLabel(s.tier)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 10,
                    color: "rgba(255,255,255,0.2)",
                  }}
                >
                  Class-level mastery bars shown. Individual accuracy % not displayed. 🔥 = active streak.
                </div>
              </div>
            </>
          )}

          {activeTab === "compare" && (
            <div style={glassCard}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 16 }}>
                4-Week Class Comparison
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Week", "Active students", "Sessions", "Stars", "Skills mastered", "Queue items", "Avg streak"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "8px 12px",
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: C.muted,
                              borderBottom: `2px solid ${C.border}`,
                              background: "rgba(255,255,255,0.02)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKLY_COMPARISON.map((row) => (
                      <tr
                        key={row.week}
                        style={{
                          background: row.isCurrent
                            ? `${C.blue}10`
                            : "transparent",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 12px",
                            borderBottom: `1px solid ${C.border}`,
                            fontWeight: row.isCurrent ? 800 : 600,
                            color: row.isCurrent ? C.blue : C.muted,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.week}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            borderBottom: `1px solid ${C.border}`,
                            color: C.text,
                            fontWeight: row.isCurrent ? 800 : 400,
                          }}
                        >
                          {row.active}
                          {row.isCurrent && (
                            <span style={{ color: C.mint, fontSize: 10, marginLeft: 4 }}>
                              ↑3
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            borderBottom: `1px solid ${C.border}`,
                            color: C.text,
                          }}
                        >
                          {row.sessions}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            borderBottom: `1px solid ${C.border}`,
                            color: C.text,
                            whiteSpace: "nowrap",
                          }}
                        >
                          ⭐ {row.stars}
                          {row.isCurrent && (
                            <span style={{ color: C.mint, fontSize: 10, marginLeft: 4 }}>
                              ↑
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            borderBottom: `1px solid ${C.border}`,
                            color: C.text,
                          }}
                        >
                          {row.mastered}
                          {row.isCurrent && (
                            <span style={{ color: C.amber, fontSize: 10, marginLeft: 4 }}>
                              ↓2
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            borderBottom: `1px solid ${C.border}`,
                            color: C.text,
                          }}
                        >
                          {row.queue}
                          {row.isCurrent && (
                            <span style={{ color: C.amber, fontSize: 10, marginLeft: 4 }}>
                              ↓1
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            borderBottom: `1px solid ${C.border}`,
                            color: C.text,
                          }}
                        >
                          {row.streak}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                Down deltas are informational — slight week-over-week variation is normal. Down is amber, not red.
              </div>
            </div>
          )}

          {/* ── Footer disclaimer ───────────────────────────────────────── */}
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.2)",
              lineHeight: 1.5,
            }}
          >
            Class-level accuracy aggregate only. Per-student accuracy % not displayed. Export PDF generates a 1-page summary for parent-teacher use.
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
