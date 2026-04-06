"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

// ─── API types ────────────────────────────────────────────────────────────────

type ApiReport = {
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

// ─── Avatar helper ────────────────────────────────────────────────────────────

function avatarEmoji(key: string): string {
  if (!key) return "⭐";
  const k = key.toLowerCase();
  if (k.includes("bunny")) return "🐰";
  if (k.includes("bear")) return "🐻";
  if (k.includes("lion")) return "🦁";
  if (k.includes("fox")) return "🦊";
  if (k.includes("panda")) return "🐼";
  if (k.includes("owl")) return "🦉";
  if (k.includes("cat")) return "🐱";
  if (k.includes("dog")) return "🐶";
  if (k.includes("dragon")) return "🐉";
  return "⭐";
}

// ─── Data mapping helpers ─────────────────────────────────────────────────────

function minutesToHoursStr(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  return `${(minutes / 60).toFixed(1)}h`;
}

function formatSessionDate(startedAt: string): string {
  const d = new Date(startedAt);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function skillStatus(pct: number, sessions: number): "Strong" | "Building" | "Just started" {
  if (sessions <= 1 && pct < 50) return "Just started";
  if (pct >= 70) return "Strong";
  return "Building";
}

function skillBarColor(pct: number): string {
  if (pct >= 70) return "#9b72ff";
  if (pct >= 40) return "#ffd166";
  return "rgba(155,114,255,0.3)";
}

function skillPctColor(pct: number): string {
  if (pct >= 70) return "#9b72ff";
  if (pct >= 40) return "#a07000";
  return "rgba(255,255,255,0.38)";
}

function mapReportToUI(report: ApiReport): {
  weekLabel: string;
  displayName: string;
  launchBandCode: string;
  headlineStats: StatTileData[];
  skills: SkillRow[];
  sessionLog: SessionLogRow[];
  heatmap: HeatmapDay[];
  engagementSummary: { label: string; value: string; color: string }[];
} {
  const { stats, skills, sessionLog, heatmap } = report;

  const headlineStats: StatTileData[] = [
    { label: "Stars earned", value: `⭐ ${stats.starsEarned}`, color: "#ffd166", delta: "", deltaDir: "same" },
    { label: "Sessions", value: String(stats.sessions), color: "#9b72ff", delta: "", deltaDir: "same" },
    { label: "Learning time", value: minutesToHoursStr(stats.learningMinutes), color: "#58e8c1", delta: "", deltaDir: "same" },
    { label: "New badges", value: String(stats.newBadges), color: "#ff7b6b", delta: "", deltaDir: "same" },
    { label: "Day streak", value: `🔥 ${stats.streakDays}`, color: "#9b72ff", delta: "", deltaDir: "same" },
  ];

  const skillRows: SkillRow[] = skills.map((s) => ({
    name: s.skillName,
    subject: s.subject ?? "General",
    pct: s.masteryPct,
    barColor: skillBarColor(s.masteryPct),
    pctColor: skillPctColor(s.masteryPct),
    sessions: s.sessionCount,
    delta: "",
    deltaDir: "same",
    status: skillStatus(s.masteryPct, s.sessionCount),
  }));

  const sessionLogRows: SessionLogRow[] = sessionLog.map((s) => ({
    date: formatSessionDate(s.startedAt),
    stars: s.starsEarned,
    skills: "",
    duration: s.durationMinutes != null ? `${s.durationMinutes} min` : "—",
    perfect: s.totalQuestions > 0 && s.correctCount === s.totalQuestions,
  }));

  const heatmapDays: HeatmapDay[] = heatmap.map((h) => ({
    label: h.dayLabel,
    sessions: h.sessionCount,
    active: h.sessionCount > 0,
  }));

  const activeDays = heatmap.filter((h) => h.sessionCount > 0).length;
  const avgSessionMin = stats.sessions > 0
    ? Math.round(stats.learningMinutes / stats.sessions)
    : 0;

  const engagementSummary = [
    { label: "Total learning time", value: minutesToHoursStr(stats.learningMinutes), color: "#9b72ff" },
    { label: "Avg session length", value: `${avgSessionMin} min`, color: "#ffd166" },
    { label: "Days active", value: `${activeDays} / 7`, color: "#ff7b6b" },
  ];

  return {
    weekLabel: report.weekLabel,
    displayName: report.displayName,
    launchBandCode: report.launchBandCode,
    headlineStats,
    skills: skillRows,
    sessionLog: sessionLogRows,
    heatmap: heatmapDays,
    engagementSummary,
  };
}

// ─── Static suggestions (kept as-is) ─────────────────────────────────────────

const SUGGESTIONS = [
  {
    icon: "🎵",
    title: "Keep the rhyming momentum going!",
    body: "Try playing rhyme games during car rides: \"I say cat, you say a word that rhymes!\" Nursery rhymes at bedtime also reinforce these patterns naturally.",
    tag: "📖 Reading · High impact",
    tagBg: "rgba(155,114,255,0.18)",
    tagColor: "#c4a8ff",
    iconBg: "rgba(155,114,255,0.2)",
  },
  {
    icon: "🔢",
    title: "Help counting click for your child",
    body: "Real-world counting helps enormously — try counting stairs, apples at the store, or steps to the bedroom. Touching objects while counting is especially effective for K-age kids.",
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
      {stat.delta && (
        <div style={{ fontSize: "0.68rem", fontWeight: 600, color: deltaColor }}>
          {stat.delta}
        </div>
      )}
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

function BarChart({ heatmap }: { heatmap: HeatmapDay[] }) {
  const maxSessions = Math.max(...heatmap.map((d) => d.sessions), 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "6px",
        height: "80px",
      }}
    >
      {heatmap.map((d) => {
        const pct = Math.round((d.sessions / maxSessions) * 100);
        return (
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
                height: `${Math.max(pct * 0.64, d.sessions === 0 ? 4 : 4)}px`,
                borderRadius: "3px 3px 0 0",
                background:
                  d.sessions === 0
                    ? "rgba(255,255,255,0.06)"
                    : pct === 100
                    ? "#9b72ff"
                    : "rgba(155,114,255,0.55)",
                alignSelf: "flex-end",
              }}
            />
            <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.38)" }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function ParentWeeklyReportPageInner() {
  const [tab, setTab] = useState<Tab>("full");
  const [weekOffset, setWeekOffset] = useState(0);
  const [report, setReport] = useState<ApiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const studentId =
      searchParams.get("studentId") ??
      (typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null);

    if (!studentId) {
      setError("No student selected. Please go back and select a child.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/parent/report?studentId=${encodeURIComponent(studentId)}&weekOffset=${weekOffset}`)
      .then(async (res) => {
        if (res.status === 401) throw new Error("Session expired. Please sign in again.");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Failed to load report.");
        }
        return res.json() as Promise<{ report: ApiReport }>;
      })
      .then(({ report: r }) => {
        setReport(r);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load report.");
        setLoading(false);
      });
  }, [weekOffset, searchParams]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "full", label: "📊 Full Report" },
    { id: "skills", label: "📚 Skills" },
    { id: "habits", label: "⏱ Habits" },
    { id: "suggestions", label: "💡 Suggestions" },
  ];

  const mapped = report ? mapReportToUI(report) : null;

  return (
    <AppFrame audience="parent" currentPath="/parent/report">
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

          {/* Loading state */}
          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "300px",
                fontSize: "1rem",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Loading report…
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div
              style={{
                padding: "32px",
                background: "rgba(255,123,107,0.1)",
                border: "1px solid rgba(255,123,107,0.3)",
                borderRadius: "16px",
                textAlign: "center",
                color: "#ff7b6b",
                fontSize: "0.92rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Report content */}
          {!loading && !error && mapped && (
            <>
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
                  {mapped.displayName}&apos;s week 🌟
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.45)",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>{mapped.weekLabel}</span>
                  <button
                    onClick={() => setWeekOffset((o) => o + 1)}
                    style={{
                      padding: "3px 10px",
                      borderRadius: "7px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: "rgba(155,114,255,0.12)",
                      color: "#c4a8ff",
                      border: "1px solid rgba(155,114,255,0.25)",
                      cursor: "pointer",
                    }}
                  >
                    ← Previous week
                  </button>
                  {weekOffset > 0 && (
                    <button
                      onClick={() => setWeekOffset((o) => o - 1)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "7px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background: "rgba(155,114,255,0.12)",
                        color: "#c4a8ff",
                        border: "1px solid rgba(155,114,255,0.25)",
                        cursor: "pointer",
                      }}
                    >
                      Next week →
                    </button>
                  )}
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
                    {avatarEmoji(report?.avatarKey ?? "")}
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
                      {mapped.launchBandCode} Band
                    </div>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "rgba(255,255,255,0.52)",
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {mapped.displayName} completed {report?.stats.sessions ?? 0} sessions this week and earned {report?.stats.starsEarned ?? 0} stars.
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
                    {mapped.headlineStats.map((s) => (
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
                          {mapped.skills.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                style={{
                                  padding: "20px 12px",
                                  fontSize: "0.82rem",
                                  color: "rgba(255,255,255,0.38)",
                                  textAlign: "center",
                                }}
                              >
                                No skills practiced this week yet.
                              </td>
                            </tr>
                          ) : (
                            mapped.skills.map((skill, i) => (
                              <SkillTableRow
                                key={skill.name}
                                skill={skill}
                                isLast={i === mapped.skills.length - 1}
                              />
                            ))
                          )}
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
                        {mapped.sessionLog.length} sessions this week
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
                    {mapped.sessionLog.length === 0 ? (
                      <div
                        style={{
                          padding: "20px 12px",
                          fontSize: "0.82rem",
                          color: "rgba(255,255,255,0.38)",
                          textAlign: "center",
                        }}
                      >
                        No sessions this week yet.
                      </div>
                    ) : (
                      mapped.sessionLog.map((row, i) => (
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
                              i < mapped.sessionLog.length - 1
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
                      ))
                    )}

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
                    Detailed mastery levels · {mapped.weekLabel}
                  </div>

                  {mapped.skills.length === 0 ? (
                    <div
                      style={{
                        padding: "32px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(155,114,255,0.18)",
                        borderRadius: "16px",
                        textAlign: "center",
                        color: "rgba(255,255,255,0.38)",
                        fontSize: "0.9rem",
                      }}
                    >
                      No skills practiced this week.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "20px",
                        marginBottom: "20px",
                      }}
                    >
                      {mapped.skills.map((skill) => (
                        <div
                          key={skill.name}
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(155,114,255,0.18)",
                            borderRadius: "16px",
                            padding: "22px 24px",
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8", marginBottom: "18px" }}>
                            {skill.subject}
                          </div>
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "5px",
                              }}
                            >
                              <span style={{ fontWeight: 600, fontSize: "0.84rem", color: "#f0f6ff" }}>
                                {skill.name}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: "0.82rem", color: skill.barColor }}>
                                {skill.pct}%
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
                                  width: `${skill.pct}%`,
                                  background: skill.barColor,
                                  borderRadius: "4px",
                                }}
                              />
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.38)", marginTop: "4px" }}>
                              {skill.sessions} session{skill.sessions !== 1 ? "s" : ""} · {skill.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                      <BarChart heatmap={mapped.heatmap} />
                    </div>

                    {/* Heatmap activity */}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(155,114,255,0.18)",
                        borderRadius: "16px",
                        padding: "22px 24px",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e4f8", marginBottom: "18px" }}>
                        📆 Activity heatmap
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {mapped.heatmap.map((day) => (
                          <div
                            key={day.label}
                            style={{
                              flex: "1 1 60px",
                              padding: "12px 8px",
                              borderRadius: "10px",
                              background: day.active ? "rgba(155,114,255,0.22)" : "rgba(255,255,255,0.04)",
                              border: day.active ? "1px solid rgba(155,114,255,0.4)" : "1px solid rgba(255,255,255,0.07)",
                              textAlign: "center",
                            }}
                          >
                            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: day.active ? "#c4a8ff" : "rgba(255,255,255,0.28)", marginBottom: "4px" }}>
                              {day.label}
                            </div>
                            <div style={{ fontSize: "1rem" }}>{day.active ? "✓" : "—"}</div>
                            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.38)", marginTop: "2px" }}>
                              {day.sessions} {day.sessions === 1 ? "session" : "sessions"}
                            </div>
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
                      {mapped.engagementSummary.map((item) => (
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
                    Ways to support {mapped.displayName}&apos;s learning beyond the app
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
                      {mapped.displayName} completed {report?.stats.sessions ?? 0} sessions and earned {report?.stats.starsEarned ?? 0} stars this week.
                      {report?.stats.streakDays != null && report.stats.streakDays > 0 && (
                        <> Current streak: {report.stats.streakDays} day{report.stats.streakDays !== 1 ? "s" : ""}. Keep it going!</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom spacer */}
              <div style={{ height: "56px" }} />
            </>
          )}
        </div>
      </div>
    </AppFrame>
  );
}

export default function ParentWeeklyReportPage() {
  return (
    <Suspense fallback={<div style={{ background: "#100b2e", minHeight: "100vh" }} />}>
      <ParentWeeklyReportPageInner />
    </Suspense>
  );
}
