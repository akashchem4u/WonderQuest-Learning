"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "full" | "skills" | "habits" | "suggestions";

type StatTileData = {
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

type SessionLogRow = {
  date: string;
  stars: number;
  skills: string;
  duration: string;
  perfect: boolean;
};

type HeatmapDay = {
  label: string;
  sessions: number;
  active: boolean;
};

// ─── Stub data ────────────────────────────────────────────────────────────────

const WEEK_LABEL = "March 18 – March 24, 2026";

const HEADLINE_STATS: StatTileData[] = [
  { label: "Stars earned", value: "⭐ 42", color: "#ffd166", delta: "↑ 8 vs last week", deltaDir: "up" },
  { label: "Sessions", value: "14", color: "#9b72ff", delta: "↑ 3 sessions", deltaDir: "up" },
  { label: "Learning time", value: "3.2h", color: "#58e8c1", delta: "→ Same as last week", deltaDir: "same" },
  { label: "New badges", value: "2", color: "#ff7b6b", delta: "↑ 2 new", deltaDir: "up" },
  { label: "Day streak", value: "🔥 5", color: "#9b72ff", delta: "↑ 2 days", deltaDir: "up" },
];

const SKILLS: SkillRow[] = [
  { name: "Rhyming words", subject: "Reading", pct: 88, barColor: "#9b72ff", pctColor: "#9b72ff", sessions: 6, delta: "↑ 12%", deltaDir: "up", status: "Strong" },
  { name: "Letter sounds", subject: "Phonics", pct: 74, barColor: "#9b72ff", pctColor: "#9b72ff", sessions: 4, delta: "↑ 6%", deltaDir: "up", status: "Strong" },
  { name: "Counting objects", subject: "Math", pct: 60, barColor: "#ffd166", pctColor: "#a07000", sessions: 2, delta: "→ 0%", deltaDir: "same", status: "Building" },
  { name: "First words", subject: "Reading", pct: 45, barColor: "#ffd166", pctColor: "#a07000", sessions: 2, delta: "↑ 8%", deltaDir: "up", status: "Building" },
  { name: "Simple addition", subject: "Math", pct: 30, barColor: "rgba(155,114,255,0.3)", pctColor: "rgba(255,255,255,0.38)", sessions: 1, delta: "New", deltaDir: "new", status: "Just started" },
];

const SESSION_LOG: SessionLogRow[] = [
  { date: "Today (Fri)", stars: 9, skills: "Rhyming words, Letter sounds", duration: "14 min", perfect: true },
  { date: "Thursday", stars: 9, skills: "Rhyming words, Counting objects", duration: "12 min", perfect: false },
  { date: "Wednesday", stars: 9, skills: "Letter sounds, First words", duration: "15 min", perfect: false },
  { date: "Tuesday", stars: 8, skills: "Rhyming words, Simple addition", duration: "13 min", perfect: false },
  { date: "Monday", stars: 7, skills: "Letter sounds, First words", duration: "11 min", perfect: true },
];

const HEATMAP: HeatmapDay[] = [
  { label: "Mon", sessions: 2, active: true },
  { label: "Tue", sessions: 3, active: true },
  { label: "Wed", sessions: 3, active: true },
  { label: "Thu", sessions: 3, active: true },
  { label: "Fri", sessions: 2, active: true },
  { label: "Sat", sessions: 0, active: false },
  { label: "Sun", sessions: 0, active: false },
];

const ENGAGEMENT_SUMMARY = [
  { label: "Total learning time", value: "3.2h", color: "#9b72ff" },
  { label: "Avg session length", value: "14 min", color: "#ffd166" },
  { label: "Perfect sessions", value: "2 / 14", color: "#58e8c1" },
  { label: "Days active", value: "5 / 7", color: "#ff7b6b" },
];

const SUGGESTIONS = [
  {
    icon: "🎵",
    title: "Keep the rhyming momentum going!",
    body: "Rhyming is at 88% — a huge jump this week! Try playing rhyme games during car rides: \"I say cat, you say a word that rhymes!\" Nursery rhymes at bedtime also reinforce these patterns naturally.",
    tag: "📖 Reading · High impact",
    tagBg: "rgba(155,114,255,0.18)",
    tagColor: "#c4a8ff",
    iconBg: "rgba(155,114,255,0.2)",
  },
  {
    icon: "🔢",
    title: "Help counting click for your child",
    body: "Counting objects is at 60% and stable. Real-world counting helps enormously — try counting stairs, apples at the store, or steps to the bedroom. Touching objects while counting is especially effective for K-age kids.",
    tag: "➕ Math · Building",
    tagBg: "rgba(255,209,102,0.15)",
    tagColor: "#ffd166",
    iconBg: "rgba(255,209,102,0.15)",
  },
  {
    icon: "📚",
    title: "First words — try pointing to words in books",
    body: "When reading together, point to simple words like \"the\", \"is\", \"on\" as you read aloud. Ask your child to spot them on the page. This bridges the WonderQuest practice to real reading.",
    tag: "📖 Reading · Building",
    tagBg: "rgba(88,232,193,0.12)",
    tagColor: "#58e8c1",
    iconBg: "rgba(88,232,193,0.12)",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeadlineStat({ stat }: { stat: StatTileData }) {
  const deltaColor =
    stat.deltaDir === "up" ? "#50e890"
    : stat.deltaDir === "down" ? "#ff7b6b"
    : "rgba(255,255,255,0.38)";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(155,114,255,0.2)",
        borderRadius: "14px",
        padding: "18px 16px",
        textAlign: "center",
        flex: "1 1 130px",
      }}
    >
      <div
        style={{
          fontSize: "1.6rem",
          fontWeight: 900,
          color: stat.color,
          lineHeight: 1,
          marginBottom: "5px",
        }}
      >
        {stat.value}
      </div>
      <div
        style={{
          fontSize: "0.68rem",
          color: "rgba(255,255,255,0.42)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "6px",
        }}
      >
        {stat.label}
      </div>
      <div style={{ fontSize: "0.68rem", fontWeight: 600, color: deltaColor }}>
        {stat.delta}
      </div>
    </div>
  );
}

function SkillTableRow({ skill, isLast }: { skill: SkillRow; isLast: boolean }) {
  const deltaColor =
    skill.deltaDir === "up" ? "#50e890"
    : skill.deltaDir === "down" ? "#ff7b6b"
    : skill.deltaDir === "new" ? "#9b72ff"
    : "rgba(255,255,255,0.38)";

  const statusStyle: React.CSSProperties =
    skill.status === "Strong"
      ? { background: "rgba(80,232,144,0.14)", color: "#50e890" }
      : skill.status === "Building"
      ? { background: "rgba(255,209,102,0.14)", color: "#ffd166" }
      : { background: "rgba(155,114,255,0.18)", color: "#c4a8ff" };

  return (
    <tr
      style={{
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <td style={{ padding: "11px 12px", fontSize: "0.84rem", fontWeight: 600, color: "#f0f6ff" }}>
        {skill.name}
      </td>
      <td style={{ padding: "11px 12px", fontSize: "0.72rem", color: "rgba(255,255,255,0.42)" }}>
        {skill.subject}
      </td>
      <td style={{ padding: "11px 12px", minWidth: "110px" }}>
        <div
          style={{
            height: "7px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${skill.pct}%`,
              background: skill.barColor,
              borderRadius: "4px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </td>
      <td
        style={{
          padding: "11px 8px",
          fontSize: "0.82rem",
          fontWeight: 700,
          color: skill.pctColor,
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        {skill.pct}%
      </td>
      <td
        style={{
          padding: "11px 12px",
          fontSize: "0.78rem",
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
        }}
      >
        {skill.sessions}
      </td>
      <td
        style={{
          padding: "11px 12px",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: deltaColor,
          textAlign: "center",
        }}
      >
        {skill.delta}
      </td>
      <td style={{ padding: "11px 12px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: "12px",
            fontSize: "0.68rem",
            fontWeight: 700,
            ...statusStyle,
          }}
        >
          {skill.status}
        </span>
      </td>
    </tr>
  );
}

function SectionCard({
  title,
  icon,
  children,
  right,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(155,114,255,0.18)",
        borderRadius: "16px",
        padding: "22px 24px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "18px",
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8" }}>{title}</span>
        {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
      </div>
      {children}
    </div>
  );
}

function BarChart() {
  const data = [
    { label: "Mon", pct: 60 },
    { label: "Tue", pct: 80 },
    { label: "Wed", pct: 100 },
    { label: "Thu", pct: 100 },
    { label: "Fri", pct: 60 },
    { label: "Sat", pct: 0 },
    { label: "Sun", pct: 0 },
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "6px",
        height: "80px",
      }}
    >
      {data.map((d) => (
        <div
          key={d.label}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            flex: 1,
          }}
        >
          <div
            style={{
              width: "100%",
              height: `${Math.max(d.pct * 0.64, d.pct === 0 ? 4 : 4)}px`,
              borderRadius: "3px 3px 0 0",
              background:
                d.pct === 0
                  ? "rgba(255,255,255,0.06)"
                  : d.pct === 100
                  ? "#9b72ff"
                  : "rgba(155,114,255,0.55)",
              alignSelf: "flex-end",
            }}
          />
          <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.38)" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ParentWeeklyReportPage() {
  const [tab, setTab] = useState<Tab>("full");

  const TABS: { id: Tab; label: string }[] = [
    { id: "full", label: "📊 Full Report" },
    { id: "skills", label: "📚 Skills" },
    { id: "habits", label: "⏱ Habits" },
    { id: "suggestions", label: "💡 Suggestions" },
  ];

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #100b2e 0%, #1a1248 55%, #0e1a38 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#f0f6ff",
        }}
      >
        {/* ── Top nav ────────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "20px 32px 0",
            maxWidth: 960,
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Link
              href="/parent"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                color: "#9b72ff",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "13px",
                padding: "6px 12px",
                background: "rgba(155,114,255,0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(155,114,255,0.22)",
              }}
            >
              ← Home
            </Link>
            <Link
              href="/parent/practice"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                color: "#ffd166",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "13px",
                padding: "6px 12px",
                background: "rgba(255,209,102,0.08)",
                borderRadius: "8px",
                border: "1px solid rgba(255,209,102,0.2)",
                marginLeft: "auto",
              }}
            >
              Practice Tips →
            </Link>
          </div>

          {/* Report header */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(155,114,255,0.22)",
              borderRadius: "20px",
              padding: "28px 30px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#9b72ff",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px",
              }}
            >
              Weekly Learning Report
            </div>
            <div
              style={{
                fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "4px",
              }}
            >
              {"Maya's week — amazing progress! 🌟"}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.45)",
                marginBottom: "20px",
              }}
            >
              {WEEK_LABEL} · Generated Sunday, March 24
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2a1e5e, #3d2a8a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  flexShrink: 0,
                  border: "2px solid #9b72ff",
                }}
              >
                🦁
              </div>

              {/* Child info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "3px 12px",
                    borderRadius: "16px",
                    background: "rgba(155,114,255,0.18)",
                    border: "1.5px solid rgba(155,114,255,0.35)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#c4a8ff",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#9b72ff",
                      display: "inline-block",
                    }}
                  />
                  K–1 Band · Kindergarten · Level 2 Star Explorer
                </div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.52)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Maya had a great week! She completed all her sessions and earned 2 new badges.
                  Her rhyming skills jumped from building to strong — a significant milestone for Kindergarten.
                </p>
              </div>
            </div>
          </div>

          {/* ── Tab bar ────────────────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              marginBottom: "24px",
              overflowX: "auto",
              paddingBottom: "2px",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  background:
                    tab === t.id
                      ? "rgba(155,114,255,0.22)"
                      : "rgba(255,255,255,0.04)",
                  color: tab === t.id ? "#e0d4ff" : "rgba(255,255,255,0.45)",
                  border: tab === t.id
                    ? "1px solid rgba(155,114,255,0.4)"
                    : "1px solid rgba(255,255,255,0.07)",
                  transition: "all 0.18s",
                } as React.CSSProperties}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ═══════════════ FULL REPORT ═══════════════ */}
          {tab === "full" && (
            <div>
              {/* Headline stats */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "24px",
                }}
              >
                {HEADLINE_STATS.map((s) => (
                  <HeadlineStat key={s.label} stat={s} />
                ))}
              </div>

              {/* Skills table */}
              <SectionCard title="Skills practiced this week" icon="📚">
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        {["Skill", "Subject", "Mastery", "", "Sessions", "vs last week", "Status"].map(
                          (h) => (
                            <th
                              key={h}
                              style={{
                                textAlign: "left",
                                padding: "8px 12px",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.38)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                borderBottom: "1px solid rgba(255,255,255,0.07)",
                              }}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {SKILLS.map((skill, i) => (
                        <SkillTableRow
                          key={skill.name}
                          skill={skill}
                          isLast={i === SKILLS.length - 1}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    padding: "8px 12px",
                    background: "rgba(155,114,255,0.08)",
                    borderRadius: "8px",
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.38)",
                  }}
                >
                  Accuracy % shown for parent context only — children see stars.
                </div>
              </SectionCard>

              {/* Session log */}
              <SectionCard
                title="Session log"
                icon="📅"
                right={
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.38)",
                    }}
                  >
                    {SESSION_LOG.length} sessions this week
                  </span>
                }
              >
                {/* Header row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 60px 1fr 60px 28px",
                    gap: "8px",
                    padding: "8px 12px",
                    background: "rgba(155,114,255,0.08)",
                    borderRadius: "8px",
                    marginBottom: "6px",
                    fontSize: "0.67rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.38)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  <span>Date</span>
                  <span>Stars</span>
                  <span>Skills practiced</span>
                  <span style={{ textAlign: "right" }}>Time</span>
                  <span style={{ textAlign: "center" }}></span>
                </div>

                {/* Rows */}
                {SESSION_LOG.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "90px 60px 1fr 60px 28px",
                      gap: "8px",
                      padding: "11px 12px",
                      borderRadius: "8px",
                      background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                      borderBottom:
                        i < SESSION_LOG.length - 1
                          ? "1px solid rgba(155,114,255,0.07)"
                          : "none",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#c8b8f0" }}>
                      {row.date}
                    </span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffd166" }}>
                      ⭐ {row.stars}
                    </span>
                    <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.48)" }}>
                      {row.skills}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.38)",
                        textAlign: "right",
                      }}
                    >
                      {row.duration}
                    </span>
                    <span style={{ textAlign: "center", fontSize: "0.88rem" }}>
                      {row.perfect ? "⭐" : ""}
                    </span>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: "12px",
                    padding: "8px 12px",
                    background: "rgba(155,114,255,0.08)",
                    borderRadius: "8px",
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.38)",
                  }}
                >
                  ⭐ in last column = perfect session (every question correct)
                </div>
              </SectionCard>
            </div>
          )}

          {/* ═══════════════ SKILLS BREAKDOWN ═══════════════ */}
          {tab === "skills" && (
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#fff", marginBottom: "6px" }}>
                📚 Skills Breakdown
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.42)", marginBottom: "22px" }}>
                Detailed mastery levels and trends · March 18–24
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                {/* Reading & Phonics */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(155,114,255,0.18)",
                    borderRadius: "16px",
                    padding: "22px 24px",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8", marginBottom: "18px" }}>
                    📖 Reading &amp; Phonics
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {[
                      { name: "Rhyming words", pct: 88, color: "#9b72ff", note: "↑ 12% from last week — strong momentum!", noteColor: "#50e890" },
                      { name: "Letter sounds", pct: 74, color: "#9b72ff", note: "↑ 6% steady improvement", noteColor: "#50e890" },
                      { name: "First words", pct: 45, color: "#ffd166", note: "Building toward mastery — normal for K stage", noteColor: "rgba(255,255,255,0.38)" },
                    ].map((item) => (
                      <div key={item.name}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "5px",
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: "0.84rem", color: "#f0f6ff" }}>
                            {item.name}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: "0.82rem", color: item.color }}>
                            {item.pct}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "7px",
                            background: "rgba(255,255,255,0.08)",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${item.pct}%`,
                              background: item.color,
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                        <div style={{ fontSize: "0.7rem", color: item.noteColor, marginTop: "4px" }}>
                          {item.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Math */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(155,114,255,0.18)",
                    borderRadius: "16px",
                    padding: "22px 24px",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8", marginBottom: "18px" }}>
                    ➕ Math
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {[
                      { name: "Counting objects", pct: 60, color: "#ffd166", note: "Stable — needs a few more practice sessions", noteColor: "rgba(255,255,255,0.38)" },
                      { name: "Simple addition", pct: 30, color: "rgba(155,114,255,0.55)", note: "Just started this week — great first step!", noteColor: "#9b72ff" },
                    ].map((item) => (
                      <div key={item.name}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "5px",
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: "0.84rem", color: "#f0f6ff" }}>
                            {item.name}
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              color: item.pct < 40 ? "rgba(255,255,255,0.38)" : "#a07000",
                            }}
                          >
                            {item.pct}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "7px",
                            background: "rgba(255,255,255,0.08)",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${item.pct}%`,
                              background: item.color,
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                        <div style={{ fontSize: "0.7rem", color: item.noteColor, marginTop: "4px" }}>
                          {item.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Curriculum coverage */}
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(155,114,255,0.18)",
                  borderRadius: "16px",
                  padding: "22px 24px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8", marginBottom: "18px" }}>
                  🎯 K–1 Curriculum coverage this week
                </div>
                <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 180px" }}>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.38)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "12px",
                      }}
                    >
                      Phonics
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[
                        { label: "Beginning sounds", done: true },
                        { label: "Rhyming pairs", done: true },
                        { label: "Ending sounds (next)", done: false },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.82rem",
                            color: item.done ? "#f0f6ff" : "rgba(255,255,255,0.32)",
                          }}
                        >
                          <span style={{ color: item.done ? "#50e890" : "rgba(255,255,255,0.18)" }}>
                            {item.done ? "✓" : "○"}
                          </span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: "1 1 180px" }}>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.38)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "12px",
                      }}
                    >
                      Math
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[
                        { label: "Counting to 10", symbol: "✓", color: "#50e890", dimmed: false },
                        { label: "Addition (started)", symbol: "◐", color: "#ffd166", dimmed: false },
                        { label: "Subtraction (later)", symbol: "○", color: "rgba(255,255,255,0.18)", dimmed: true },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.82rem",
                            color: item.dimmed ? "rgba(255,255,255,0.32)" : "#f0f6ff",
                          }}
                        >
                          <span style={{ color: item.color }}>{item.symbol}</span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ HABITS ═══════════════ */}
          {tab === "habits" && (
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#fff", marginBottom: "6px" }}>
                ⏱ Time &amp; Habits
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.42)", marginBottom: "22px" }}>
                Session patterns and consistency this week
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                {/* Sessions per day */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(155,114,255,0.18)",
                    borderRadius: "16px",
                    padding: "22px 24px",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8", marginBottom: "18px" }}>
                    📅 Sessions per day
                  </div>
                  <BarChart />
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "0.74rem",
                      color: "rgba(255,255,255,0.38)",
                    }}
                  >
                    Daily limit: 3 sessions. Maya used her full limit on Wed &amp; Thu.
                  </div>
                </div>

                {/* Typical play times */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(155,114,255,0.18)",
                    borderRadius: "16px",
                    padding: "22px 24px",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8", marginBottom: "18px" }}>
                    ⏰ Typical play times
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { icon: "🌅", label: "Morning (7–9 AM)", detail: "Most active — 6 sessions", pct: "43%" },
                      { icon: "🌤️", label: "Afternoon (3–5 PM)", detail: "5 sessions", pct: "36%" },
                      { icon: "🌙", label: "Evening (6–8 PM)", detail: "3 sessions", pct: "21%" },
                    ].map((t) => (
                      <div
                        key={t.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          background: "rgba(155,114,255,0.08)",
                          borderRadius: "10px",
                          border: "1px solid rgba(155,114,255,0.15)",
                        }}
                      >
                        <span style={{ fontSize: "1.3rem" }}>{t.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#e8e4f8" }}>
                            {t.label}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.42)" }}>
                            {t.detail}
                          </div>
                        </div>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            color: "#9b72ff",
                          }}
                        >
                          {t.pct}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engagement summary */}
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(155,114,255,0.18)",
                  borderRadius: "16px",
                  padding: "22px 24px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8", marginBottom: "18px" }}>
                  🎯 Engagement summary
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {ENGAGEMENT_SUMMARY.map((item) => (
                    <div
                      key={item.label}
                      style={{
                        textAlign: "center",
                        padding: "14px",
                        background: "rgba(155,114,255,0.07)",
                        borderRadius: "12px",
                        border: "1px solid rgba(155,114,255,0.14)",
                      }}
                    >
                      <div style={{ fontSize: "1.3rem", fontWeight: 900, color: item.color, marginBottom: "4px" }}>
                        {item.value}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.38)" }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ SUGGESTIONS ═══════════════ */}
          {tab === "suggestions" && (
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#fff", marginBottom: "6px" }}>
                💡 Suggestions for this week
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.42)", marginBottom: "22px" }}>
                Ways to support {"Maya's"} learning beyond the app
              </div>

              {SUGGESTIONS.map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(155,114,255,0.16)",
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
                      borderRadius: "11px",
                      background: item.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.94rem", color: "#f0f6ff", marginBottom: "6px" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.52)", lineHeight: 1.6 }}>
                      {item.body}
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "10px",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        background: item.tagBg,
                        color: item.tagColor,
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>
                </div>
              ))}

              {/* Overall note */}
              <div
                style={{
                  padding: "18px 22px",
                  background: "rgba(155,114,255,0.1)",
                  borderRadius: "14px",
                  border: "1.5px solid rgba(155,114,255,0.24)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#9b72ff",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "8px",
                  }}
                >
                  🌟 Overall this week
                </div>
                <p style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.62)", lineHeight: 1.6, margin: 0 }}>
                  Maya showed impressive consistency this week — 5 days in a row is a new personal record!
                  Her engagement is highest in the mornings. Keeping that morning routine stable will compound
                  her progress significantly.
                </p>
              </div>
            </div>
          )}

          {/* Bottom spacer */}
          <div style={{ height: "56px" }} />
        </div>
      </div>
    </AppFrame>
  );
}
