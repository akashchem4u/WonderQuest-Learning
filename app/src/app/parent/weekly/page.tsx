"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE   = "#100b2e";
const VIOLET = "#9b72ff";
const MINT   = "#22c55e";
const GOLD   = "#ffd166";
const AMBER  = "#f59e0b";
const TEXT   = "#f0f6ff";
const MUTED  = "#8b949e";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.06)";

// ─── API types ────────────────────────────────────────────────────────────────

type WeeklyReport = {
  studentId: string;
  displayName: string;
  launchBandCode: string;
  avatarKey: string;
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  stats: {
    starsEarned: number;
    sessions: number;
    learningMinutes: number;
    newBadges: number;
    streakDays: number;
  };
  skills: {
    skillId: string;
    skillName: string;
    subject: string;
    correctCount: number;
    totalCount: number;
    masteryPct: number;
    sessionCount: number;
  }[];
  sessionLog: {
    sessionId: string;
    startedAt: string;
    sessionMode: string;
    starsEarned: number;
    correctCount: number;
    totalQuestions: number;
    durationMinutes: number | null;
    effectivenessScore: number | null;
  }[];
  heatmap: {
    dayLabel: string;
    date: string;
    sessionCount: number;
  }[];
};

// ─── Derived UI types ─────────────────────────────────────────────────────────

type WeekTab = "full" | "skills" | "habits" | "suggestions";

type StatTile = {
  label: string;
  value: string;
  color: string;
  delta: string;
  deltaDir: "up" | "down" | "same";
};

type SkillRow = {
  name: string;
  subject: string;
  pct: number;
  barColor: string;
  pctColor: string;
  sessions: number;
  delta: string;
  deltaDir: "up" | "down" | "same" | "new";
  status: "Strong" | "Building" | "Just started";
};

type SessionRow = {
  date: string;
  stars: number;
  skills: string;
  duration: string;
  perfect: boolean;
};

type HeatmapDay = { label: string; sessions: number; active: boolean };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function masteryStatus(pct: number): "Strong" | "Building" | "Just started" {
  if (pct >= 65) return "Strong";
  if (pct >= 40) return "Building";
  return "Just started";
}

function skillRowFromApi(sk: WeeklyReport["skills"][number]): SkillRow {
  const status = masteryStatus(sk.masteryPct);
  const barColor = status === "Strong" ? VIOLET : status === "Building" ? GOLD : "rgba(155,114,255,0.3)";
  const pctColor = status === "Strong" ? VIOLET : status === "Building" ? AMBER : MUTED;
  return {
    name: sk.skillName,
    subject: sk.subject,
    pct: sk.masteryPct,
    barColor,
    pctColor,
    sessions: sk.sessionCount,
    delta: "—",
    deltaDir: "same",
    status,
  };
}

function formatSessionDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function buildStatTiles(report: WeeklyReport): StatTile[] {
  const hrs = (report.stats.learningMinutes / 60).toFixed(1);
  return [
    { label: "Stars earned",  value: `⭐ ${report.stats.starsEarned}`, color: GOLD,   delta: "This week",      deltaDir: "up"   },
    { label: "Sessions",      value: `${report.stats.sessions}`,       color: VIOLET, delta: "This week",      deltaDir: "up"   },
    { label: "Learning time", value: `${hrs}h`,                        color: MINT,   delta: `${report.stats.learningMinutes} min total`, deltaDir: "same" },
    { label: "New badges",    value: `${report.stats.newBadges}`,      color: AMBER,  delta: "This week",      deltaDir: "up"   },
    { label: "Day streak",    value: `🔥 ${report.stats.streakDays}`,  color: VIOLET, delta: "Current streak", deltaDir: "up"   },
  ];
}

// ─── Helper components ────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "20px",
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "1rem",
        fontWeight: 700,
        color: TEXT,
        marginBottom: "18px",
      }}
    >
      <span>{icon}</span>
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: SkillRow["status"] }) {
  const map = {
    Strong:         { bg: "rgba(34,197,94,0.15)",    color: "#4ade80" },
    Building:       { bg: "rgba(255,209,102,0.15)",  color: GOLD      },
    "Just started": { bg: "rgba(155,114,255,0.15)",  color: "#c4a8ff" },
  };
  const s = map[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "0.68rem",
        fontWeight: 700,
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  );
}

function SkillBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      style={{
        height: "7px",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "4px",
        overflow: "hidden",
        minWidth: "100px",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: "4px",
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ textAlign: "center", padding: "80px 0", color: MUTED }}>
      <div style={{ fontSize: "2rem", marginBottom: "16px" }}>📊</div>
      <div style={{ fontSize: "0.9rem" }}>Loading weekly report…</div>
    </div>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function FullReportTab({
  report,
  weekOffset,
  setWeekOffset,
}: {
  report: WeeklyReport;
  weekOffset: number;
  setWeekOffset: (n: number) => void;
}) {
  const headline = buildStatTiles(report);

  const skillRows: SkillRow[] = report.skills.map(skillRowFromApi);

  const sessionRows: SessionRow[] = report.sessionLog.map((s) => ({
    date: formatSessionDate(s.startedAt),
    stars: s.starsEarned,
    skills: report.skills
      .filter(() => true) // session-level skill names not in this shape; use mode
      .slice(0, 2)
      .map((sk) => sk.skillName)
      .join(", ") || s.sessionMode,
    duration: s.durationMinutes != null ? `${s.durationMinutes} min` : "—",
    perfect: s.correctCount === s.totalQuestions && s.totalQuestions > 0,
  }));

  return (
    <>
      {/* Header */}
      <div
        style={{
          background: SURFACE,
          border: `1px solid rgba(155,114,255,0.2)`,
          borderRadius: "20px",
          padding: "32px 36px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: VIOLET,
            marginBottom: "6px",
          }}
        >
          Weekly Learning Report
        </div>
        <div
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: TEXT,
            marginBottom: "4px",
          }}
        >
          {report.displayName}&apos;s week 🌟
        </div>
        <div style={{ fontSize: "0.88rem", color: MUTED, marginBottom: "16px" }}>
          {report.weekLabel}
        </div>

        {/* Week nav */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            style={{
              padding: "7px 14px",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${BORDER}`,
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: TEXT,
              cursor: "pointer",
            }}
          >
            ← Prev week
          </button>
          {weekOffset > 0 && (
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              style={{
                padding: "7px 14px",
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${BORDER}`,
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: TEXT,
                cursor: "pointer",
              }}
            >
              Next week →
            </button>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(155,114,255,0.3), rgba(155,114,255,0.1))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
              border: `2px solid rgba(155,114,255,0.3)`,
            }}
          >
            🦁
          </div>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 12px",
                borderRadius: "16px",
                fontSize: "0.72rem",
                fontWeight: 700,
                background: "rgba(155,114,255,0.15)",
                border: `1.5px solid rgba(155,114,255,0.3)`,
                color: "#c4a8ff",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: VIOLET,
                  flexShrink: 0,
                }}
              />
              {report.launchBandCode} Band
            </div>
            <div style={{ fontSize: "0.85rem", lineHeight: 1.5, color: MUTED }}>
              {report.stats.sessions > 0
                ? `${report.displayName} completed ${report.stats.sessions} session${report.stats.sessions !== 1 ? "s" : ""} and earned ${report.stats.starsEarned} stars this week.`
                : `No sessions yet this week. Check back after ${report.displayName} plays!`}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={{
                padding: "9px 16px",
                background: "rgba(255,255,255,0.06)",
                border: `1.5px solid ${BORDER}`,
                borderRadius: "10px",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: TEXT,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              📄 PDF
            </button>
            <button
              style={{
                padding: "9px 16px",
                background: "rgba(255,255,255,0.06)",
                border: `1.5px solid ${BORDER}`,
                borderRadius: "10px",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: TEXT,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              📧 Email
            </button>
          </div>
        </div>
      </div>

      {/* Headline stats */}
      <div
        style={{
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        {headline.map((s) => {
          const dc =
            s.deltaDir === "up" ? "#50e890"
            : s.deltaDir === "down" ? "#ff7b6b"
            : MUTED;
          return (
            <div
              key={s.label}
              style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: "14px",
                padding: "18px 16px",
                textAlign: "center",
                flex: "1 1 130px",
              }}
            >
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: "5px" }}>
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  color: MUTED,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "6px",
                }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, color: dc }}>{s.delta}</div>
            </div>
          );
        })}
      </div>

      {/* Skills table */}
      {skillRows.length > 0 && (
        <SectionCard>
          <SectionTitle icon="📚">Skills practiced this week</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Skill", "Subject", "Mastery", "", "Sessions", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skillRows.map((sk) => (
                  <tr key={sk.name}>
                    <td style={{ padding: "12px", borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: "0.84rem", fontWeight: 600, color: TEXT }}>{sk.name}</div>
                    </td>
                    <td style={{ padding: "12px", borderBottom: `1px solid ${BORDER}`, fontSize: "0.72rem", color: MUTED }}>
                      {sk.subject}
                    </td>
                    <td style={{ padding: "12px", borderBottom: `1px solid ${BORDER}`, minWidth: "120px" }}>
                      <SkillBar pct={sk.pct} color={sk.barColor} />
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: `1px solid ${BORDER}`,
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: sk.pctColor,
                        width: "44px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sk.pct}%
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: `1px solid ${BORDER}`,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: MUTED,
                        textAlign: "center",
                      }}
                    >
                      {sk.sessions}
                    </td>
                    <td style={{ padding: "12px", borderBottom: `1px solid ${BORDER}` }}>
                      <StatusPill status={sk.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Session log */}
      {sessionRows.length > 0 && (
        <SectionCard>
          <SectionTitle icon="📅">Session log</SectionTitle>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 14px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "8px",
              fontSize: "0.7rem",
              fontWeight: 600,
              color: MUTED,
              marginBottom: "8px",
            }}
          >
            <span style={{ width: "90px" }}>Date</span>
            <span style={{ width: "55px" }}>Stars</span>
            <span style={{ flex: 1 }}>Mode</span>
            <span style={{ width: "55px", textAlign: "right" }}>Time</span>
            <span style={{ width: "20px" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sessionRows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  background: "rgba(155,114,255,0.06)",
                  borderRadius: "10px",
                  border: `1px solid rgba(155,114,255,0.12)`,
                }}
              >
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: VIOLET, width: "90px", flexShrink: 0 }}>
                  {row.date}
                </span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: GOLD, width: "55px", flexShrink: 0 }}>
                  ⭐ {row.stars}
                </span>
                <span style={{ flex: 1, fontSize: "0.78rem", color: MUTED }}>{row.skills}</span>
                <span style={{ fontSize: "0.72rem", color: MUTED, width: "55px", textAlign: "right", flexShrink: 0 }}>
                  {row.duration}
                </span>
                <span style={{ width: "20px", textAlign: "center", fontSize: "0.9rem" }}>
                  {row.perfect ? "⭐" : ""}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "12px",
              padding: "8px 14px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "8px",
              fontSize: "0.75rem",
              color: MUTED,
            }}
          >
            ⭐ = Perfect session (every question correct)
          </div>
        </SectionCard>
      )}

      {report.stats.sessions === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: MUTED, fontSize: "0.9rem" }}>
          No sessions this week yet. Check back after {report.displayName} plays!
        </div>
      )}
    </>
  );
}

function SkillsTab({ report }: { report: WeeklyReport }) {
  const readingSkills = report.skills.filter((sk) =>
    sk.subject?.toLowerCase().includes("read") ||
    sk.subject?.toLowerCase().includes("phonics") ||
    sk.subject?.toLowerCase().includes("spell") ||
    sk.subject?.toLowerCase().includes("vocab"),
  );
  const mathSkills = report.skills.filter((sk) =>
    sk.subject?.toLowerCase().includes("math") ||
    sk.subject?.toLowerCase().includes("number"),
  );
  const otherSkills = report.skills.filter(
    (sk) => !readingSkills.includes(sk) && !mathSkills.includes(sk),
  );

  const skillColorFor = (pct: number) => (pct >= 65 ? VIOLET : pct >= 40 ? GOLD : "rgba(155,114,255,0.4)");

  return (
    <>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>
        📚 Skills Breakdown
      </div>
      <div style={{ fontSize: "0.85rem", color: MUTED, marginBottom: "24px" }}>
        Detailed mastery levels for {report.displayName} · {report.weekLabel}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Reading */}
        {readingSkills.length > 0 && (
          <SectionCard>
            <SectionTitle icon="📖">Reading &amp; Phonics</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {readingSkills.map((sk) => {
                const color = skillColorFor(sk.masteryPct);
                const status = masteryStatus(sk.masteryPct);
                const statusColor = status === "Strong" ? "#50e890" : status === "Building" ? MUTED : VIOLET;
                const statusText = status === "Strong" ? "Strong mastery" : status === "Building" ? "Building toward mastery" : "Just started — early days";
                return (
                  <div key={sk.skillId}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT }}>{sk.skillName}</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color }}>{sk.masteryPct}%</span>
                    </div>
                    <SkillBar pct={sk.masteryPct} color={color} />
                    <div style={{ fontSize: "0.72rem", color: statusColor, marginTop: "3px" }}>{statusText}</div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Math */}
        {mathSkills.length > 0 && (
          <SectionCard>
            <SectionTitle icon="➕">Math</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {mathSkills.map((sk) => {
                const color = skillColorFor(sk.masteryPct);
                const status = masteryStatus(sk.masteryPct);
                const statusColor = status === "Strong" ? "#50e890" : status === "Building" ? MUTED : VIOLET;
                const statusText = status === "Strong" ? "Strong mastery" : status === "Building" ? "Stable — needs more practice sessions" : "Just started — great first step!";
                return (
                  <div key={sk.skillId}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT }}>{sk.skillName}</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color }}>{sk.masteryPct}%</span>
                    </div>
                    <SkillBar pct={sk.masteryPct} color={color} />
                    <div style={{ fontSize: "0.72rem", color: statusColor, marginTop: "3px" }}>{statusText}</div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Other */}
        {otherSkills.length > 0 && (
          <SectionCard>
            <SectionTitle icon="🌟">Other skills</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {otherSkills.map((sk) => {
                const color = skillColorFor(sk.masteryPct);
                return (
                  <div key={sk.skillId}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT }}>{sk.skillName}</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color }}>{sk.masteryPct}%</span>
                    </div>
                    <SkillBar pct={sk.masteryPct} color={color} />
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}
      </div>

      {report.skills.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: MUTED, fontSize: "0.9rem" }}>
          No skills practiced this week yet.
        </div>
      )}
    </>
  );
}

function HabitsTab({ report }: { report: WeeklyReport }) {
  const maxSessions = Math.max(...report.heatmap.map((d) => d.sessionCount), 1);
  const heatmap: HeatmapDay[] = report.heatmap.map((d) => ({
    label: d.dayLabel,
    sessions: d.sessionCount,
    active: d.sessionCount > 0,
  }));

  const totalMins = report.stats.learningMinutes;
  const avgSession = report.stats.sessions > 0
    ? Math.round(totalMins / report.stats.sessions)
    : 0;
  const perfectSessions = report.sessionLog.filter(
    (s) => s.correctCount === s.totalQuestions && s.totalQuestions > 0,
  ).length;
  const daysActive = report.heatmap.filter((d) => d.sessionCount > 0).length;

  const engagement = [
    { label: "Total learning time", value: `${(totalMins / 60).toFixed(1)}h`,         color: VIOLET },
    { label: "Avg session length",  value: `${avgSession} min`,                        color: GOLD   },
    { label: "Perfect sessions",    value: `${perfectSessions} / ${report.stats.sessions}`, color: MINT   },
    { label: "Days active",         value: `${daysActive} / 7`,                        color: AMBER  },
  ];

  return (
    <>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>
        ⏱️ Time &amp; Habits
      </div>
      <div style={{ fontSize: "0.85rem", color: MUTED, marginBottom: "24px" }}>
        Session patterns and consistency for {report.displayName} this week
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <SectionCard>
          <SectionTitle icon="📅">Sessions per day</SectionTitle>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
            {heatmap.map((day) => (
              <div key={day.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 }}>
                <div
                  style={{
                    width: "100%",
                    borderRadius: "3px 3px 0 0",
                    background: day.active ? VIOLET : "rgba(255,255,255,0.06)",
                    height: `${(day.sessions / maxSessions) * 70 + (day.active ? 4 : 0)}px`,
                    minHeight: "4px",
                    transition: "height 0.4s ease",
                  }}
                />
                <span style={{ fontSize: "0.62rem", color: MUTED }}>{day.label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "12px", fontSize: "0.76rem", color: MUTED }}>
            {daysActive} active day{daysActive !== 1 ? "s" : ""} this week.
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle icon="⏰">Typical play times</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: "🌅", label: "Morning (7–9 AM)",   sub: "Check app for details", pct: "—" },
              { icon: "🌤️", label: "Afternoon (3–5 PM)", sub: "Check app for details", pct: "—" },
              { icon: "🌙", label: "Evening (6–8 PM)",   sub: "Check app for details", pct: "—" },
            ].map((t) => (
              <div
                key={t.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  background: "rgba(155,114,255,0.06)",
                  borderRadius: "10px",
                  border: `1px solid ${BORDER}`,
                }}
              >
                <span style={{ fontSize: "1.3rem" }}>{t.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: TEXT }}>{t.label}</div>
                  <div style={{ fontSize: "0.72rem", color: MUTED }}>{t.sub}</div>
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: VIOLET }}>{t.pct}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <SectionTitle icon="🎯">Engagement summary</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
          {engagement.map((e) => (
            <div
              key={e.label}
              style={{
                textAlign: "center",
                padding: "16px 14px",
                background: "rgba(155,114,255,0.06)",
                borderRadius: "12px",
                border: `1px solid ${BORDER}`,
              }}
            >
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: e.color, marginBottom: "4px" }}>{e.value}</div>
              <div style={{ fontSize: "0.7rem", color: MUTED }}>{e.label}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

function SuggestionsTab({ report }: { report: WeeklyReport }) {
  const lowSkills = report.skills.filter((sk) => sk.masteryPct < 65);

  return (
    <>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>
        💡 Suggestions for this week
      </div>
      <div style={{ fontSize: "0.85rem", color: MUTED, marginBottom: "24px" }}>
        Ways to support {report.displayName}&apos;s learning beyond the app
      </div>

      {lowSkills.length === 0 ? (
        <div
          style={{
            padding: "18px 22px",
            background: "rgba(34,197,94,0.08)",
            border: `1px solid rgba(34,197,94,0.2)`,
            borderRadius: "14px",
            marginBottom: "16px",
            fontSize: "0.88rem",
            color: "#4ade80",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: TEXT }}>All skills at Strong status!</strong>
          <br />
          {report.displayName} is doing great — no specific support areas this week. Keep up the regular sessions!
        </div>
      ) : (
        lowSkills.map((sk) => (
          <div
            key={sk.skillId}
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: "16px",
              padding: "22px",
              marginBottom: "16px",
              display: "grid",
              gridTemplateColumns: "44px 1fr",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                background: sk.masteryPct < 40 ? "rgba(155,114,255,0.18)" : "rgba(255,209,102,0.15)",
                flexShrink: 0,
              }}
            >
              {sk.masteryPct < 40 ? "🌱" : "🔢"}
            </div>
            <div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>
                Help {report.displayName} with: {sk.skillName}
              </div>
              <div style={{ fontSize: "0.82rem", lineHeight: 1.6, color: MUTED, marginBottom: "10px" }}>
                Currently at {sk.masteryPct}% mastery — {sk.masteryPct < 40 ? "just getting started" : "building up"}. Try incorporating {sk.skillName.toLowerCase()} into everyday moments: during meals, walks, or bedtime routines.
              </div>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  background: sk.masteryPct < 40 ? "rgba(155,114,255,0.18)" : "rgba(255,209,102,0.15)",
                  color: sk.masteryPct < 40 ? "#c4a8ff" : GOLD,
                }}
              >
                {sk.subject} · {masteryStatus(sk.masteryPct)}
              </span>
            </div>
          </div>
        ))
      )}

      <div
        style={{
          padding: "18px 22px",
          background: "rgba(155,114,255,0.08)",
          border: `1.5px solid rgba(155,114,255,0.25)`,
          borderRadius: "14px",
          marginTop: "4px",
        }}
      >
        <div
          style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            color: VIOLET,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: "8px",
          }}
        >
          🌟 Overall this week
        </div>
        <div style={{ fontSize: "0.85rem", lineHeight: 1.6, color: MUTED }}>
          {report.stats.sessions > 0
            ? `${report.displayName} completed ${report.stats.sessions} session${report.stats.sessions !== 1 ? "s" : ""} and earned ${report.stats.starsEarned} stars. ${report.stats.streakDays > 0 ? `Current streak: ${report.stats.streakDays} day${report.stats.streakDays !== 1 ? "s" : ""}!` : ""} Keep the routine going — consistency is the biggest driver of progress.`
            : `No sessions yet this week. Encourage ${report.displayName} to play — even one session builds the habit.`}
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { id: WeekTab; label: string }[] = [
  { id: "full",        label: "📊 Full Report" },
  { id: "skills",      label: "📚 Skills"      },
  { id: "habits",      label: "⏱️ Habits"       },
  { id: "suggestions", label: "💡 Suggestions"  },
];

export default function ParentWeeklyPage() {
  const [activeTab, setActiveTab] = useState<WeekTab>("full");
  const [weekOffset, setWeekOffset] = useState(0);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId =
      typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null;
    if (!studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(
      `/api/parent/report?studentId=${encodeURIComponent(studentId)}&weekOffset=${weekOffset}`,
    )
      .then((r) => r.json())
      .then((data) => {
        setReport(data.report ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [weekOffset]);

  return (
    <AppFrame audience="parent">
      <div
        style={{
          minHeight: "100vh",
          background: BASE,
          color: TEXT,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "16px 32px 0",
            borderBottom: `1px solid ${BORDER}`,
            overflowX: "auto",
            background: "rgba(22,27,34,0.95)",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "10px 18px",
                border: "none",
                background: "transparent",
                color: activeTab === t.id ? TEXT : MUTED,
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: "6px 6px 0 0",
                borderBottom: activeTab === t.id ? `2px solid ${VIOLET}` : "2px solid transparent",
                whiteSpace: "nowrap",
                transition: "all 0.18s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            padding: "36px 32px",
          }}
        >
          {loading && <LoadingState />}
          {!loading && !report && (
            <div style={{ textAlign: "center", padding: "60px 0", color: MUTED, fontSize: "0.9rem" }}>
              No data available. Make sure a student is selected.
            </div>
          )}
          {!loading && report && (
            <>
              {activeTab === "full" && (
                <FullReportTab
                  report={report}
                  weekOffset={weekOffset}
                  setWeekOffset={setWeekOffset}
                />
              )}
              {activeTab === "skills"      && <SkillsTab report={report} />}
              {activeTab === "habits"      && <HabitsTab report={report} />}
              {activeTab === "suggestions" && <SuggestionsTab report={report} />}
            </>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
