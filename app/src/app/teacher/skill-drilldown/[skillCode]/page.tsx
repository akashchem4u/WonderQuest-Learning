"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../../teacher-gate";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  red: "#ff7b6b",
};

// ── Stub skill data ───────────────────────────────────────────────────────────
const SKILL_DATA: Record<string, {
  name: string;
  icon: string;
  band: string;
  subject: string;
  difficulty: string;
  studentsOnSkill: number;
  strongThisWeek: number;
  totalSessions: number;
  classAvgAccuracy: number;
  distribution: { status: string; emoji: string; count: number; pct: number; color: string }[];
  trendWeeks: { label: string; sessions: number; pct: number }[];
  insight: string;
  students: { name: string; mastery: number; status: "Strong" | "Building" | "Started"; sessions: number; stars: number; lastActive: string }[];
}> = {
  default: {
    name: "Fractions: Addition",
    icon: "➕",
    band: "P2 · Grade 2–3",
    subject: "Mathematics",
    difficulty: "Intermediate",
    studentsOnSkill: 18,
    strongThisWeek: 8,
    totalSessions: 47,
    classAvgAccuracy: 72,
    distribution: [
      { status: "Strong",      emoji: "💪", count: 8, pct: 44, color: C.mint   },
      { status: "Building",    emoji: "📈", count: 6, pct: 33, color: C.blue   },
      { status: "Just started",emoji: "🌱", count: 4, pct: 22, color: C.muted  },
    ],
    trendWeeks: [
      { label: "Week 1",   sessions: 8,  pct: 17  },
      { label: "Week 2",   sessions: 12, pct: 26  },
      { label: "Week 3",   sessions: 18, pct: 38  },
      { label: "This wk",  sessions: 47, pct: 100 },
    ],
    insight: "5 students have had 4+ sessions on this skill without advancing to Strong — consider a group review activity for the \"equal parts\" concept.",
    students: [
      { name: "Bella",  mastery: 88, status: "Strong",   sessions: 8, stars: 24, lastActive: "Today"     },
      { name: "Aarav",  mastery: 76, status: "Strong",   sessions: 6, stars: 18, lastActive: "Today"     },
      { name: "Carlos", mastery: 58, status: "Building", sessions: 5, stars: 12, lastActive: "Yesterday" },
      { name: "Ethan",  mastery: 51, status: "Building", sessions: 4, stars: 9,  lastActive: "Today"     },
      { name: "Jordan", mastery: 32, status: "Started",  sessions: 4, stars: 6,  lastActive: "2 days ago"},
      { name: "Sam",    mastery: 28, status: "Started",  sessions: 3, stars: 5,  lastActive: "Today"     },
    ],
  },
  "blending-sounds": {
    name: "Blending Sounds",
    icon: "🔤",
    band: "P1 · Grade K–1",
    subject: "Reading",
    difficulty: "Foundational",
    studentsOnSkill: 6,
    strongThisWeek: 2,
    totalSessions: 22,
    classAvgAccuracy: 63,
    distribution: [
      { status: "Strong",      emoji: "💪", count: 2, pct: 33, color: C.mint  },
      { status: "Building",    emoji: "📈", count: 3, pct: 50, color: C.blue  },
      { status: "Just started",emoji: "🌱", count: 1, pct: 17, color: C.muted },
    ],
    trendWeeks: [
      { label: "Week 1",  sessions: 4,  pct: 18 },
      { label: "Week 2",  sessions: 8,  pct: 36 },
      { label: "Week 3",  sessions: 10, pct: 45 },
      { label: "This wk", sessions: 22, pct: 100 },
    ],
    insight: "3 students are consistently requesting hints on CVC words — a targeted small-group session may help.",
    students: [
      { name: "Aaliya",  mastery: 81, status: "Strong",   sessions: 6, stars: 20, lastActive: "Today"     },
      { name: "Priya",   mastery: 55, status: "Building", sessions: 5, stars: 10, lastActive: "Today"     },
      { name: "Emma",    mastery: 48, status: "Building", sessions: 4, stars: 7,  lastActive: "Yesterday" },
      { name: "Ben",     mastery: 44, status: "Building", sessions: 4, stars: 8,  lastActive: "Today"     },
      { name: "Chloe",   mastery: 71, status: "Strong",   sessions: 5, stars: 14, lastActive: "Today"     },
      { name: "Marcus",  mastery: 18, status: "Started",  sessions: 3, stars: 3,  lastActive: "4 days ago"},
    ],
  },
  "skip-counting": {
    name: "Skip Counting",
    icon: "🔢",
    band: "P1 · Grade K–1",
    subject: "Mathematics",
    difficulty: "Foundational",
    studentsOnSkill: 4,
    strongThisWeek: 1,
    totalSessions: 14,
    classAvgAccuracy: 58,
    distribution: [
      { status: "Strong",      emoji: "💪", count: 1, pct: 25, color: C.mint  },
      { status: "Building",    emoji: "📈", count: 2, pct: 50, color: C.blue  },
      { status: "Just started",emoji: "🌱", count: 1, pct: 25, color: C.muted },
    ],
    trendWeeks: [
      { label: "Week 1",  sessions: 2, pct: 14  },
      { label: "Week 2",  sessions: 5, pct: 36  },
      { label: "Week 3",  sessions: 7, pct: 50  },
      { label: "This wk", sessions: 14, pct: 100 },
    ],
    insight: "Priya has repeatedly requested hints on the 5s and 10s pattern — consider using a number-line visual.",
    students: [
      { name: "Daniel", mastery: 66, status: "Strong",   sessions: 4, stars: 12, lastActive: "Today"     },
      { name: "Priya",  mastery: 52, status: "Building", sessions: 4, stars: 8,  lastActive: "Today"     },
      { name: "Jordan", mastery: 45, status: "Building", sessions: 3, stars: 6,  lastActive: "Yesterday" },
      { name: "Tommy",  mastery: 22, status: "Started",  sessions: 3, stars: 4,  lastActive: "2 days ago"},
    ],
  },
};

function getSkillData(code: string) {
  return SKILL_DATA[code] ?? SKILL_DATA["default"];
}

function statusColor(s: "Strong" | "Building" | "Started") {
  if (s === "Strong")   return { bg: C.mint + "22",   color: C.mint  };
  if (s === "Building") return { bg: C.blue + "22",   color: C.blue  };
  return                       { bg: "rgba(255,255,255,0.06)", color: C.muted };
}

function statusEmoji(s: "Strong" | "Building" | "Started") {
  if (s === "Strong")   return "💪";
  if (s === "Building") return "📈";
  return "🌱";
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SkillDrilldownPage() {
  const params = useParams();
  const skillCode = typeof params.skillCode === "string" ? params.skillCode : "default";
  const skill = getSkillData(skillCode);

  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/skills">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, minHeight: "100vh", padding: "24px 28px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 18, display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/teacher" style={{ color: C.blue, textDecoration: "none" }}>Classroom</Link>
          <span style={{ color: C.border }}>›</span>
          <Link href="/teacher/skills" style={{ color: C.blue, textDecoration: "none" }}>Skill Trends</Link>
          <span style={{ color: C.border }}>›</span>
          <span>{skill.name}</span>
        </div>

        {/* ── Skill header card ── */}
        <div style={{
          background: C.surface,
          borderRadius: 14,
          padding: "18px 20px",
          border: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 16,
          flexWrap: "wrap",
        }}>
          <div style={{ fontSize: 40, flexShrink: 0 }}>{skill.icon}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.text, marginBottom: 4 }}>{skill.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{skill.band} · {skill.subject}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: C.mint + "22", color: C.mint }}>{skill.band}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: C.blue + "22", color: C.blue }}>{skill.subject}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: C.muted }}>{skill.difficulty}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { val: skill.studentsOnSkill, lbl: "Students on skill" },
              { val: skill.strongThisWeek,  lbl: "Strong this week"  },
              { val: skill.totalSessions,   lbl: "Total sessions"    },
              { val: `${skill.classAvgAccuracy}%`, lbl: "Class avg accuracy" },
            ].map((s) => (
              <div key={s.lbl} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{s.val}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-col: distribution + trend ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Distribution */}
          <div style={{ background: C.surface, borderRadius: 14, padding: "16px 20px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.text, marginBottom: 14 }}>
              Class distribution — {skill.name}
            </div>
            {skill.distribution.map((d) => (
              <div key={d.status} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 0", borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, minWidth: 120, color: d.color }}>
                  {d.emoji} {d.status}
                </div>
                <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${d.pct}%`, height: "100%", background: d.color, borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.text, minWidth: 24, textAlign: "right" }}>{d.count}</div>
              </div>
            ))}
            <div style={{
              marginTop: 14,
              padding: "12px",
              background: C.amber + "18",
              borderRadius: 8,
              fontSize: 12,
              color: C.amber,
              lineHeight: 1.5,
            }}>
              📌 {skill.insight}
            </div>
          </div>

          {/* Trend */}
          <div style={{ background: C.surface, borderRadius: 14, padding: "16px 20px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.text, marginBottom: 14 }}>
              Sessions trend — 4 weeks
            </div>
            {skill.trendWeeks.map((w) => (
              <div key={w.label} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "5px 0",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, minWidth: 40 }}>{w.label}</div>
                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${w.pct}%`, height: "100%", background: C.blue, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 10, color: C.muted, minWidth: 44, textAlign: "right" }}>{w.sessions} sess.</div>
              </div>
            ))}
            <div style={{
              marginTop: 14,
              padding: "10px 12px",
              background: C.blue + "12",
              borderRadius: 8,
              fontSize: 12,
              color: C.blue,
              lineHeight: 1.4,
            }}>
              ℹ️ Class accuracy shown as a class-level average only. Individual student accuracy is not shown here to avoid unfair comparisons.
            </div>
          </div>
        </div>

        {/* ── Student table ── */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}` }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.text }}>
              Students on this skill
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Name", "Mastery", "Status", "Sessions", "Stars", "Last active"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left",
                    padding: "8px 16px",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    color: C.muted,
                    background: "rgba(255,255,255,0.02)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skill.students.map((s) => {
                const sc = statusColor(s.status);
                return (
                  <tr key={s.name} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 16px", fontWeight: 700, color: C.text }}>{s.name}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 80, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", display: "inline-block" }}>
                          <div style={{
                            width: `${s.mastery}%`,
                            height: "100%",
                            borderRadius: 3,
                            background: s.status === "Strong" ? C.mint : s.status === "Building" ? C.blue : C.muted,
                          }} />
                        </div>
                        <span style={{ fontSize: 11, color: C.muted }}>{s.mastery}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                        background: sc.bg, color: sc.color,
                      }}>
                        {statusEmoji(s.status)} {s.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", color: C.muted }}>{s.sessions}</td>
                    <td style={{ padding: "10px 16px", color: C.text, fontWeight: 600 }}>⭐ {s.stars}</td>
                    <td style={{ padding: "10px 16px", color: C.muted }}>{s.lastActive}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{
            padding: "8px 16px",
            fontSize: 11,
            color: C.muted,
            borderTop: `1px solid ${C.border}`,
          }}>
            Showing {skill.students.length} of {skill.studentsOnSkill} — Load more
          </div>
        </div>

      </div>
    </AppFrame>
  );
}
