"use client";

import Link from "next/link";
import { useState } from "react";
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

// ── Stub data ─────────────────────────────────────────────────────────────────

type MasteryStatus = "strong" | "building" | "started";

type StudentRow = {
  id: string;
  name: string;
  mastery: number;
  status: MasteryStatus;
  sessions: number;
  stars: number;
  lastActive: string;
};

const SKILL = {
  name: "Fractions: Addition",
  band: "P2",
  gradeRange: "G2\u20133",
  subject: "Mathematics",
  difficulty: "Intermediate",
  icon: "\u2795",
  studentsOnSkill: 18,
  strongThisWeek: 8,
  totalSessions: 47,
  classAvgAccuracy: 72,
};

const TREND_WEEKS = [
  { label: "Week 1", pct: 40, sessions: 8 },
  { label: "Week 2", pct: 62, sessions: 12 },
  { label: "Week 3", pct: 88, sessions: 18 },
  { label: "This wk", pct: 100, sessions: 47 },
];

const DISTRIBUTION: { label: string; emoji: string; pct: number; count: number; color: string; status: MasteryStatus }[] = [
  { label: "Strong", emoji: "\u{1F4AA}", pct: 44, count: 8, color: C.mint, status: "strong" },
  { label: "Building", emoji: "\u{1F4C8}", pct: 33, count: 6, color: C.blue, status: "building" },
  { label: "Just started", emoji: "\u{1F331}", pct: 22, count: 4, color: C.muted, status: "started" },
];

const STUDENTS: StudentRow[] = [
  { id: "bella", name: "Bella", mastery: 88, status: "strong", sessions: 8, stars: 24, lastActive: "Today" },
  { id: "aarav", name: "Aarav", mastery: 76, status: "strong", sessions: 6, stars: 18, lastActive: "Today" },
  { id: "carlos", name: "Carlos", mastery: 58, status: "building", sessions: 5, stars: 12, lastActive: "Yesterday" },
  { id: "ethan", name: "Ethan", mastery: 51, status: "building", sessions: 4, stars: 9, lastActive: "Today" },
  { id: "jordan", name: "Jordan", mastery: 32, status: "started", sessions: 4, stars: 6, lastActive: "2 days ago" },
  { id: "sam", name: "Sam", mastery: 28, status: "started", sessions: 3, stars: 5, lastActive: "Today" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(s: MasteryStatus): string {
  if (s === "strong") return C.mint;
  if (s === "building") return C.blue;
  return C.muted;
}

function statusLabel(s: MasteryStatus): string {
  if (s === "strong") return "\u{1F4AA} Strong";
  if (s === "building") return "\u{1F4C8} Building";
  return "\u{1F331} Just started";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeacherSkillDrilldownPage() {
  const [activeTab, setActiveTab] = useState<"drilldown" | "compare">("drilldown");

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
    marginBottom: 14,
  };

  const chip: React.CSSProperties = {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
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
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            \u2190 Skills
          </Link>
          <span style={{ color: C.border, fontSize: 14 }}>|</span>
          <span style={{ fontSize: 12, color: C.muted }}>
            {SKILL.band} \u203a {SKILL.name}
          </span>
          <div style={{ marginLeft: "auto" }}>
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
          </div>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Skill header card ──────────────────────────────────────── */}
          <div
            style={{
              ...glassCard,
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 42, flexShrink: 0 }}>{SKILL.icon}</div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div
                style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 3 }}
              >
                {SKILL.name}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                {SKILL.band} \u00b7 {SKILL.gradeRange} \u00b7 {SKILL.subject}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    ...chip,
                    background: `${C.mint}22`,
                    color: C.mint,
                    border: `1px solid ${C.mint}44`,
                  }}
                >
                  {SKILL.band} {SKILL.gradeRange}
                </span>
                <span
                  style={{
                    ...chip,
                    background: `${C.blue}22`,
                    color: C.blue,
                    border: `1px solid ${C.blue}44`,
                  }}
                >
                  {SKILL.subject}
                </span>
                <span
                  style={{
                    ...chip,
                    background: "rgba(255,255,255,0.06)",
                    color: C.muted,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {SKILL.difficulty}
                </span>
              </div>
            </div>

            {/* Stat row */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
              {[
                { val: SKILL.studentsOnSkill, lbl: "Students on skill" },
                { val: SKILL.strongThisWeek, lbl: "Strong this week" },
                { val: SKILL.totalSessions, lbl: "Total sessions" },
                { val: `${SKILL.classAvgAccuracy}%`, lbl: "Class avg accuracy" },
              ].map((s) => (
                <div key={s.lbl} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Two columns: distribution + trend ──────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: 16,
            }}
          >
            {/* Distribution card */}
            <div style={glassCard}>
              <div style={cardTitle}>Class Distribution \u2014 {SKILL.name}</div>

              {DISTRIBUTION.map((d) => (
                <div
                  key={d.status}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: d.color,
                      minWidth: 110,
                    }}
                  >
                    {d.emoji} {d.label}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${d.pct}%`,
                        height: "100%",
                        background: d.color,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: C.text,
                      minWidth: 24,
                      textAlign: "right",
                    }}
                  >
                    {d.count}
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: 14,
                  padding: "12px 14px",
                  background: `${C.amber}18`,
                  border: `1px solid ${C.amber}44`,
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#fde68a",
                  lineHeight: 1.5,
                }}
              >
                \u{1F4CC} 5 students have had 4+ sessions on this skill without advancing to Strong \u2014 consider a group review activity for the \u201Cequal parts\u201D concept.
              </div>
            </div>

            {/* Trend card */}
            <div style={glassCard}>
              <div style={cardTitle}>Sessions Trend \u2014 4 Weeks</div>

              {TREND_WEEKS.map((w) => (
                <div
                  key={w.label}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.muted,
                      minWidth: 48,
                    }}
                  >
                    {w.label}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${w.pct}%`,
                        height: "100%",
                        background: C.blue,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      minWidth: 52,
                      textAlign: "right",
                    }}
                  >
                    {w.sessions} sess.
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: `${C.blue}14`,
                  border: `1px solid ${C.blue}33`,
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#bae6fd",
                  lineHeight: 1.5,
                }}
              >
                \u2139\uFE0F Class accuracy shown as a class-level average only. Individual student accuracy is not shown here to avoid unfair comparisons.
              </div>
            </div>
          </div>

          {/* ── Student table ───────────────────────────────────────────── */}
          <div style={glassCard}>
            <div style={cardTitle}>Students on This Skill</div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr>
                    {["Name", "Mastery", "Status", "Sessions", "Stars", "Last active"].map(
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
                  {STUDENTS.map((s) => (
                    <tr key={s.id}>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: `1px solid ${C.border}`,
                          fontWeight: 700,
                          color: C.text,
                        }}
                      >
                        {s.name}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                          <div
                            style={{
                              width: 80,
                              height: 5,
                              background: "rgba(255,255,255,0.08)",
                              borderRadius: 3,
                              overflow: "hidden",
                              display: "inline-block",
                              verticalAlign: "middle",
                            }}
                          >
                            <div
                              style={{
                                width: `${s.mastery}%`,
                                height: "100%",
                                background: statusColor(s.status),
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 12, color: C.text, fontWeight: 700 }}>
                            {s.mastery}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: `${statusColor(s.status)}22`,
                            color: statusColor(s.status),
                            border: `1px solid ${statusColor(s.status)}44`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {statusLabel(s.status)}
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
                        \u2B50 {s.stars}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          borderBottom: `1px solid ${C.border}`,
                          color: C.muted,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: "8px 10px",
                fontSize: 11,
                color: C.muted,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              Showing 6 of 18 \u2014{" "}
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: C.blue,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 11,
                  padding: 0,
                }}
              >
                Load more
              </button>
            </div>
          </div>

          {/* ── Privacy disclaimer ──────────────────────────────────────── */}
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.2)",
              lineHeight: 1.5,
            }}
          >
            Mastery status (Strong / Building / Just started) shown per student. Mastery score shown as a bar (N/100), never as % text. Class avg accuracy only \u2014 individual accuracy never shown.
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
