"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE   = "#100b2e";
const VIOLET = "#9b72ff";
const BLUE   = "#38bdf8";
const MINT   = "#22c55e";
const GOLD   = "#ffd166";
const AMBER  = "#f59e0b";
const TEXT   = "#f0f6ff";
const MUTED  = "#8b949e";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.06)";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type TimeBlock = {
  icon: string;
  label: string;
  sub: string;
  pct: string;
};

type Suggestion = {
  icon: string;
  title: string;
  body: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  iconBg: string;
};

// ─── Stub data ────────────────────────────────────────────────────────────────

const WEEK_LABEL = "March 18 – March 24, 2026";

const HEADLINE: StatTile[] = [
  { label: "Stars earned",   value: "⭐ 42",  color: GOLD,   delta: "↑ 8 vs last week",  deltaDir: "up"   },
  { label: "Sessions",       value: "14",     color: VIOLET, delta: "↑ 3 sessions",       deltaDir: "up"   },
  { label: "Learning time",  value: "3.2h",   color: MINT,   delta: "→ Same",             deltaDir: "same" },
  { label: "New badges",     value: "2",      color: AMBER,  delta: "↑ 2 new",            deltaDir: "up"   },
  { label: "Day streak",     value: "🔥 5",   color: VIOLET, delta: "↑ 2 days",           deltaDir: "up"   },
];

const SKILLS: SkillRow[] = [
  { name: "Rhyming words",   subject: "Reading", pct: 88, barColor: VIOLET, pctColor: VIOLET, sessions: 6, delta: "↑ 12%", deltaDir: "up",   status: "Strong"      },
  { name: "Letter sounds",   subject: "Phonics",  pct: 74, barColor: VIOLET, pctColor: VIOLET, sessions: 4, delta: "↑ 6%",  deltaDir: "up",   status: "Strong"      },
  { name: "Counting objects",subject: "Math",     pct: 60, barColor: GOLD,   pctColor: AMBER,  sessions: 2, delta: "→ 0%",  deltaDir: "same", status: "Building"    },
  { name: "First words",     subject: "Reading",  pct: 45, barColor: GOLD,   pctColor: AMBER,  sessions: 2, delta: "↑ 8%",  deltaDir: "up",   status: "Building"    },
  { name: "Simple addition", subject: "Math",     pct: 30, barColor: "rgba(155,114,255,0.3)", pctColor: MUTED, sessions: 1, delta: "New", deltaDir: "new", status: "Just started" },
];

const SESSIONS: SessionRow[] = [
  { date: "Today (Fri)", stars: 9, skills: "Rhyming words, Letter sounds",     duration: "14 min", perfect: true  },
  { date: "Thursday",    stars: 9, skills: "Rhyming words, Counting objects",  duration: "12 min", perfect: false },
  { date: "Wednesday",   stars: 9, skills: "Letter sounds, First words",        duration: "15 min", perfect: false },
  { date: "Tuesday",     stars: 8, skills: "Rhyming words, Simple addition",   duration: "13 min", perfect: false },
  { date: "Monday",      stars: 7, skills: "Letter sounds, First words",        duration: "11 min", perfect: true  },
];

const HEATMAP: HeatmapDay[] = [
  { label: "Mon", sessions: 2, active: true  },
  { label: "Tue", sessions: 3, active: true  },
  { label: "Wed", sessions: 3, active: true  },
  { label: "Thu", sessions: 3, active: true  },
  { label: "Fri", sessions: 2, active: true  },
  { label: "Sat", sessions: 0, active: false },
  { label: "Sun", sessions: 0, active: false },
];

const TIME_BLOCKS: TimeBlock[] = [
  { icon: "🌅", label: "Morning (7–9 AM)",    sub: "Most active — 6 sessions", pct: "43%" },
  { icon: "🌤️",  label: "Afternoon (3–5 PM)", sub: "5 sessions",                pct: "36%" },
  { icon: "🌙", label: "Evening (6–8 PM)",    sub: "3 sessions",                pct: "21%" },
];

const ENGAGEMENT = [
  { label: "Total learning time", value: "3.2h",    color: VIOLET },
  { label: "Avg session length",  value: "14 min",  color: GOLD   },
  { label: "Perfect sessions",    value: "2 / 14",  color: MINT   },
  { label: "Days active",         value: "5 / 7",   color: AMBER  },
];

const SUGGESTIONS: Suggestion[] = [
  {
    icon: "🎵",
    title: "Keep the rhyming momentum going!",
    body: 'Maya\'s rhyming is at 88% — a huge jump this week! Try playing "rhyme games" during car rides: "I say cat, you say a word that rhymes!" Nursery rhymes at bedtime also reinforce these patterns naturally.',
    tag: "📖 Reading · High impact",
    tagBg: "rgba(155,114,255,0.18)",
    tagColor: "#c4a8ff",
    iconBg: "rgba(155,114,255,0.18)",
  },
  {
    icon: "🔢",
    title: "Help counting click for Maya",
    body: "Counting objects is at 60% and hasn't moved this week. Real-world counting helps enormously — try counting stairs, apples at the store, or steps to her bedroom. Touching objects while counting is especially effective for K-age kids.",
    tag: "➕ Math · Building",
    tagBg: "rgba(255,209,102,0.15)",
    tagColor: GOLD,
    iconBg: "rgba(255,209,102,0.15)",
  },
  {
    icon: "📚",
    title: "First words — try pointing to words in books",
    body: "When reading together, point to simple words like \"the\", \"is\", \"on\" as you read aloud. Ask Maya to spot them on the page. This bridges the WonderQuest practice to real reading — exactly the connection that accelerates progress.",
    tag: "📖 Reading · Building",
    tagBg: "rgba(34,197,94,0.12)",
    tagColor: MINT,
    iconBg: "rgba(34,197,94,0.12)",
  },
];

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
    Strong:        { bg: "rgba(34,197,94,0.15)",    color: "#4ade80" },
    Building:      { bg: "rgba(255,209,102,0.15)",  color: GOLD      },
    "Just started":{ bg: "rgba(155,114,255,0.15)",  color: "#c4a8ff" },
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

// ─── Tab content ──────────────────────────────────────────────────────────────

function FullReportTab() {
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
          Maya's week — amazing progress! 🌟
        </div>
        <div style={{ fontSize: "0.88rem", color: MUTED, marginBottom: "24px" }}>
          {WEEK_LABEL} · Generated Sunday, March 24
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
              K–1 Band · Kindergarten · Level 2 Star Explorer
            </div>
            <div style={{ fontSize: "0.85rem", lineHeight: 1.5, color: MUTED }}>
              Maya had a great week! She completed all her sessions and earned 2 new badges. Her rhyming skills jumped from building to strong — a significant milestone for Kindergarten.
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
        {HEADLINE.map((s) => {
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
      <SectionCard>
        <SectionTitle icon="📚">Skills practiced this week</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Skill", "Subject", "Mastery", "", "Sessions", "vs last week", "Status"].map((h) => (
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
              {SKILLS.map((sk) => {
                const dc =
                  sk.deltaDir === "up"   ? "#50e890"
                  : sk.deltaDir === "down" ? "#ff7b6b"
                  : sk.deltaDir === "new"  ? VIOLET
                  : MUTED;
                return (
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
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: `1px solid ${BORDER}`,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: dc,
                        textAlign: "center",
                      }}
                    >
                      {sk.delta}
                    </td>
                    <td style={{ padding: "12px", borderBottom: `1px solid ${BORDER}` }}>
                      <StatusPill status={sk.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Session log */}
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
          <span style={{ flex: 1 }}>Skills practiced</span>
          <span style={{ width: "55px", textAlign: "right" }}>Time</span>
          <span style={{ width: "20px" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {SESSIONS.map((row) => (
            <div
              key={row.date}
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
    </>
  );
}

function SkillsTab() {
  return (
    <>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>
        📚 Skills Breakdown
      </div>
      <div style={{ fontSize: "0.85rem", color: MUTED, marginBottom: "24px" }}>
        Detailed mastery levels and learning trends for Maya · March 18–24
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Reading */}
        <SectionCard>
          <SectionTitle icon="📖">Reading &amp; Phonics</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { name: "Rhyming words", pct: 88, color: VIOLET, delta: "↑ 12% from last week — strong momentum!", dc: "#50e890" },
              { name: "Letter sounds",  pct: 74, color: VIOLET, delta: "↑ 6% steady improvement",               dc: "#50e890" },
              { name: "First words",   pct: 45, color: GOLD,   delta: "Building toward mastery — normal for K stage", dc: MUTED   },
            ].map((s) => (
              <div key={s.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT }}>{s.name}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: s.color }}>{s.pct}%</span>
                </div>
                <SkillBar pct={s.pct} color={s.color} />
                <div style={{ fontSize: "0.72rem", color: s.dc, marginTop: "3px" }}>{s.delta}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Math */}
        <SectionCard>
          <SectionTitle icon="➕">Math</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { name: "Counting objects", pct: 60, color: GOLD,   delta: "Stable — needs a few more practice sessions", dc: MUTED   },
              { name: "Simple addition",  pct: 30, color: "rgba(155,114,255,0.5)", delta: "Just started this week — great first step!", dc: VIOLET },
            ].map((s) => (
              <div key={s.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT }}>{s.name}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: s.color }}>{s.pct}%</span>
                </div>
                <SkillBar pct={s.pct} color={s.color} />
                <div style={{ fontSize: "0.72rem", color: s.dc, marginTop: "3px" }}>{s.delta}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <SectionTitle icon="🎯">K–1 Curriculum coverage this week</SectionTitle>
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
          <div style={{ flex: "1", minWidth: "180px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: MUTED, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phonics</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {[
                { check: "✓", label: "Beginning sounds",     active: true  },
                { check: "✓", label: "Rhyming pairs",         active: true  },
                { check: "○", label: "Ending sounds (next)",  active: false },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem" }}>
                  <span style={{ color: item.active ? MINT : "rgba(255,255,255,0.2)", fontSize: "0.9rem" }}>{item.check}</span>
                  <span style={{ color: item.active ? TEXT : MUTED }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: "1", minWidth: "180px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: MUTED, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Math</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {[
                { check: "✓", label: "Counting to 10",    active: true,  partial: false },
                { check: "◐", label: "Addition (started)",active: false, partial: true  },
                { check: "○", label: "Subtraction (later)",active: false, partial: false },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem" }}>
                  <span style={{ color: item.active ? MINT : item.partial ? GOLD : "rgba(255,255,255,0.2)", fontSize: "0.9rem" }}>{item.check}</span>
                  <span style={{ color: item.active || item.partial ? TEXT : MUTED }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

function HabitsTab() {
  const maxSessions = Math.max(...HEATMAP.map((d) => d.sessions), 1);

  return (
    <>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>
        ⏱️ Time &amp; Habits
      </div>
      <div style={{ fontSize: "0.85rem", color: MUTED, marginBottom: "24px" }}>
        Session patterns and consistency for Maya this week
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <SectionCard>
          <SectionTitle icon="📅">Sessions per day</SectionTitle>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
            {HEATMAP.map((day) => (
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
            Daily limit: 3 sessions. Maya used her full limit on Wed &amp; Thu.
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle icon="⏰">Typical play times</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {TIME_BLOCKS.map((t) => (
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
          {ENGAGEMENT.map((e) => (
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

function SuggestionsTab() {
  return (
    <>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>
        💡 Suggestions for this week
      </div>
      <div style={{ fontSize: "0.85rem", color: MUTED, marginBottom: "24px" }}>
        Ways to support Maya's learning beyond the app
      </div>

      {SUGGESTIONS.map((s) => (
        <div
          key={s.title}
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
              background: s.iconBg,
              flexShrink: 0,
            }}
          >
            {s.icon}
          </div>
          <div>
            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>
              {s.title}
            </div>
            <div style={{ fontSize: "0.82rem", lineHeight: 1.6, color: MUTED, marginBottom: "10px" }}>
              {s.body}
            </div>
            <span
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "0.68rem",
                fontWeight: 700,
                background: s.tagBg,
                color: s.tagColor,
              }}
            >
              {s.tag}
            </span>
          </div>
        </div>
      ))}

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
          Maya showed impressive consistency this week — 5 days in a row is a new personal record! Her engagement is highest in the mornings. If possible, keeping that morning routine stable will compound her progress significantly.
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
          {activeTab === "full"        && <FullReportTab />}
          {activeTab === "skills"      && <SkillsTab />}
          {activeTab === "habits"      && <HabitsTab />}
          {activeTab === "suggestions" && <SuggestionsTab />}
        </div>
      </div>
    </AppFrame>
  );
}
