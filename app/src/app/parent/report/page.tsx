"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ChildPicker } from "@/components/child-picker";
import { getActiveChildId, setActiveChildId } from "@/lib/active-child";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "full" | "skills" | "habits" | "suggestions" | "growth";

type LinkedChild = {
  id: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
};

type ParentSession = {
  linkedChildren: LinkedChild[];
};

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
    skillsPracticed: string | null;
    durationMinutes: number | null;
    effectivenessScore: number | null;
  }[];
  dailySummaries: {
    date: string;
    dayLabel: string;
    sessionCount: number;
    totalQuestions: number;
    correctCount: number;
    accuracyPct: number | null;
    starsEarned: number;
    totalMinutes: number;
    skills: string[];
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

// ─── Week label helper ────────────────────────────────────────────────────────

function getWeekLabel(offset: number): string {
  if (offset === 0) return "This week";
  if (offset === 1) return "Last week";
  const anchor = new Date();
  anchor.setDate(anchor.getDate() - offset * 7);
  const dayOfWeek = anchor.getDay();
  const daysToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - daysToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${monday.toLocaleDateString([], { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString([], { month: "short", day: "numeric" })}`;
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
    skills: s.skillsPracticed ?? "",
    duration: s.durationMinutes != null ? `${s.durationMinutes} min` : "—",
    perfect: s.totalQuestions > 0 && s.correctCount === s.totalQuestions,
  }));

  const heatmapDays: HeatmapDay[] = heatmap.map((h) => {
    // Derive label from ISO date string as fallback (guards against serialization issues)
    const safeLabel = h.dayLabel && !h.dayLabel.includes("Invalid")
      ? h.dayLabel
      : h.date
        ? new Date(h.date + "T12:00:00.000Z").toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })
        : "—";
    return {
      label: safeLabel,
      sessions: h.sessionCount,
      active: h.sessionCount > 0,
    };
  });

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

// ─── Growth report types ─────────────────────────────────────────────────────

type SubjectMastery = { subject: string; label: string; emoji: string; skillCount: number; masteredCount: number; avgMastery: number; color: string };
type MasteredSkill = { skillName: string; subject: string; proficientAt: string; masteryScore: number };
type SkillInProgress = { skillName: string; subject: string; masteryScore: number; sessionCount: number; priority: string; parentTip: string };
type SkillNotStarted = { skillName: string; subject: string; priority: string; parentAction: string };
type GradeReadiness = { essential: { mastered: number; total: number }; onTrack: { mastered: number; total: number }; enrichment: { mastered: number; total: number }; overallPct: number; bandCode: string; bandLabel: string };
type LearningPattern = { avgSessionMinutes: number | null; totalSessions30d: number; bestDayLabel: string | null; consistencyPct: number; avgAccuracy30d: number | null };

type GrowthReport = {
  studentId: string;
  displayName: string;
  bandCode: string;
  gradeReadiness: GradeReadiness;
  subjectMastery: SubjectMastery[];
  masteredSkills: MasteredSkill[];
  skillsInProgress: SkillInProgress[];
  skillsNotStarted: SkillNotStarted[];
  topStrengths: MasteredSkill[];
  learningPattern: LearningPattern;
};

// ─── Main page ────────────────────────────────────────────────────────────────

type DigestHighlights = {
  sessions: number;
  accuracy: number | null;
  milestones: string[];
  topSkills: string[];
  growthAreas: string[];
};

type WeeklyDigest = {
  narrative: string;
  highlights: DigestHighlights;
};

function ParentWeeklyReportPageInner() {
  const [tab, setTab] = useState<Tab>("full");
  const [weekOffset, setWeekOffset] = useState(0);
  const [report, setReport] = useState<ApiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ParentSession | null>(null);
  const [digest, setDigest] = useState<WeeklyDigest | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [growthReport, setGrowthReport] = useState<GrowthReport | null>(null);
  const [growthLoading, setGrowthLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load parent session to get list of children
  useEffect(() => {
    fetch("/api/parent/session")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Not authenticated"))))
      .then((s: ParentSession) => setSession(s))
      .catch(() => {/* non-fatal, picker just won't show */});
  }, []);

  useEffect(() => {
    const studentId =
      (searchParams.get("studentId") ??
      getActiveChildId()) ||
      (typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null);

    if (!studentId) {
      setError("No student selected. Please go back and select a child.");
      setLoading(false);
      return;
    }
    setActiveChildId(studentId);

    setLoading(true);
    setError(null);

    // Fetch report and digest in parallel
    setDigestLoading(true);
    setDigest(null);

    const reportFetch = fetch(`/api/parent/report?studentId=${encodeURIComponent(studentId)}&weekOffset=${weekOffset}`)
      .then(async (res) => {
        if (res.status === 401) throw new Error("Session expired. Please sign in again.");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Failed to load report.");
        }
        return res.json() as Promise<{ report: ApiReport }>;
      });

    const digestFetch = fetch(`/api/parent/weekly-digest?studentId=${encodeURIComponent(studentId)}&weekOffset=${weekOffset}`)
      .then((res) => (res.ok ? res.json() as Promise<WeeklyDigest> : null))
      .catch(() => null);

    reportFetch
      .then(({ report: r }) => {
        setReport(r);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load report.");
        setLoading(false);
      });

    digestFetch
      .then((d) => { setDigest(d); setDigestLoading(false); })
      .catch(() => setDigestLoading(false));

    // Growth report — not week-dependent; fetch once per student
    setGrowthLoading(true);
    setGrowthReport(null);
    fetch(`/api/parent/growth-report?studentId=${encodeURIComponent(studentId)}`)
      .then((res) => (res.ok ? res.json() as Promise<{ report: GrowthReport }> : null))
      .then((d) => { setGrowthReport(d?.report ?? null); setGrowthLoading(false); })
      .catch(() => setGrowthLoading(false));
  }, [weekOffset, searchParams]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "growth", label: "🌱 My Child" },
    { id: "full", label: "📊 This Week" },
    { id: "skills", label: "📚 Skills" },
    { id: "habits", label: "⏱ Habits" },
    { id: "suggestions", label: "💡 How to Help" },
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
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
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
                minHeight: 44,
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
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
                minHeight: 44,
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Practice Tips →
            </Link>
          </div>

          {/* ── Child picker ──────────────────────────────────────────────── */}
          {session && session.linkedChildren.length > 1 && (
            <ChildPicker
              children={session.linkedChildren}
              activeChildId={searchParams.get("studentId") ?? getActiveChildId() ?? session.linkedChildren[0]?.id ?? ""}
              onSelect={(childId) => {
                setActiveChildId(childId);
                router.push(`/parent/report?studentId=${childId}`);
              }}
            />
          )}

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
                  <span>{getWeekLabel(weekOffset)}</span>
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
                      minHeight: 44,
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
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
                        minHeight: 44,
                        touchAction: "manipulation",
                        WebkitTapHighlightColor: "transparent",
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

              {/* ── AI Weekly Digest ─────────────────────────────────────────────── */}
              {(digestLoading || digest) && (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(155,114,255,0.08) 0%, rgba(56,189,248,0.06) 100%)",
                    border: "1px solid rgba(155,114,255,0.2)",
                    borderRadius: "16px",
                    padding: "20px 24px",
                    marginBottom: "20px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Decorative gradient blob */}
                  <div style={{
                    position: "absolute", top: -20, right: -20, width: 120, height: 120,
                    borderRadius: "50%", background: "rgba(155,114,255,0.08)", pointerEvents: "none",
                  }} />
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      fontSize: 22, flexShrink: 0, marginTop: 2,
                      background: "rgba(155,114,255,0.15)", borderRadius: "50%",
                      width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      🤖
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "0.7rem", fontWeight: 700, color: "#9b72ff",
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6,
                      }}>
                        AI Learning Story
                      </div>
                      {digestLoading && !digest ? (
                        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
                          Generating your personalised summary…
                        </div>
                      ) : digest ? (
                        <>
                          <p style={{ margin: "0 0 12px", fontSize: "0.9rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.65 }}>
                            {digest.narrative}
                          </p>
                          {/* Highlight pills */}
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {digest.highlights.milestones.map((m) => (
                              <span key={m} style={{
                                fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px",
                                borderRadius: 20, background: "rgba(34,197,94,0.15)",
                                border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e",
                              }}>
                                🏅 Mastered: {m}
                              </span>
                            ))}
                            {digest.highlights.topSkills.filter(
                              (s) => !digest.highlights.milestones.includes(s),
                            ).slice(0, 2).map((s) => (
                              <span key={s} style={{
                                fontSize: "0.72rem", padding: "3px 10px", borderRadius: 20,
                                background: "rgba(155,114,255,0.1)",
                                border: "1px solid rgba(155,114,255,0.2)", color: "#c4a8ff",
                              }}>
                                📖 {s}
                              </span>
                            ))}
                            {digest.highlights.growthAreas.slice(0, 1).map((g) => (
                              <span key={g} style={{
                                fontSize: "0.72rem", padding: "3px 10px", borderRadius: 20,
                                background: "rgba(255,209,102,0.1)",
                                border: "1px solid rgba(255,209,102,0.2)", color: "#ffd166",
                              }}>
                                💪 Growing: {g}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

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
                      minHeight: 44,
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                    } as React.CSSProperties}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ═══════════════ MY CHILD — HOLISTIC GROWTH VIEW ═══════════════ */}
              {tab === "growth" && (
                <div>
                  {growthLoading && !growthReport && (
                    <div style={{ textAlign: "center", padding: "60px 24px", color: "rgba(255,255,255,0.4)" }}>
                      Building your child&apos;s full picture…
                    </div>
                  )}

                  {!growthLoading && !growthReport && (
                    <div style={{ textAlign: "center", padding: "40px 24px", color: "rgba(255,255,255,0.4)" }}>
                      Complete a few sessions to unlock the holistic view.
                    </div>
                  )}

                  {growthReport && (() => {
                    const gr = growthReport;
                    const readinessPct = gr.gradeReadiness.overallPct;
                    const readinessColor = readinessPct >= 70 ? "#22c55e" : readinessPct >= 40 ? "#f59e0b" : "#ff7b6b";
                    const readinessLabel = readinessPct >= 80 ? "Exceeding expectations" : readinessPct >= 60 ? "On track" : readinessPct >= 35 ? "Building foundations" : "Early stage";

                    return (
                      <>
                        {/* ── Grade readiness ring ───────────────────────────── */}
                        <div style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(155,114,255,0.18)",
                          borderRadius: 20, padding: "28px 28px 24px",
                          marginBottom: 20, textAlign: "center",
                        }}>
                          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9b72ff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                            {gr.gradeReadiness.bandLabel} · Grade Readiness
                          </div>
                          {/* SVG gauge */}
                          <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                            <svg width="160" height="90" viewBox="0 0 160 90">
                              <path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
                              <path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke={readinessColor}
                                strokeWidth="14" strokeLinecap="round"
                                strokeDasharray={`${Math.PI * 65 * (readinessPct / 100)} ${Math.PI * 65}`}
                                style={{ transition: "stroke-dasharray 0.6s ease", opacity: 0.9 }}
                              />
                            </svg>
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center" }}>
                              <div style={{ fontSize: "2rem", fontWeight: 900, color: readinessColor, lineHeight: 1 }}>{readinessPct}%</div>
                              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{readinessLabel}</div>
                            </div>
                          </div>
                          {/* Tier breakdown */}
                          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
                            {[
                              { label: "Essential skills", d: gr.gradeReadiness.essential, color: "#9b72ff" },
                              { label: "On-track skills", d: gr.gradeReadiness.onTrack, color: "#38bdf8" },
                              { label: "Enrichment", d: gr.gradeReadiness.enrichment, color: "#22c55e" },
                            ].map(({ label, d, color }) => d.total > 0 && (
                              <div key={label} style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "1.1rem", fontWeight: 800, color }}>{d.mastered}<span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>/{d.total}</span></div>
                                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.38)" }}>{label}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ── Subject mastery bars ───────────────────────────── */}
                        <div style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(155,114,255,0.15)",
                          borderRadius: 20, padding: "22px 24px", marginBottom: 20,
                        }}>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8e4f8", marginBottom: 18 }}>📊 Mastery by subject</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {gr.subjectMastery.map((subj) => (
                              <div key={subj.subject}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                  <span style={{ fontSize: "0.82rem", color: "#f0f6ff" }}>{subj.emoji} {subj.label}</span>
                                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: subj.color }}>{subj.avgMastery > 0 ? `${subj.avgMastery}%` : "Not started"}</span>
                                </div>
                                <div style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                                  <div style={{ height: "100%", borderRadius: 4, width: `${Math.max(subj.avgMastery > 0 ? 3 : 0, subj.avgMastery)}%`, background: subj.color, opacity: 0.85, transition: "width 0.5s ease" }} />
                                </div>
                                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
                                  {subj.masteredCount} of {subj.skillCount} skills mastered
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ── Top strengths ──────────────────────────────────── */}
                        {gr.topStrengths.length > 0 && (
                          <div style={{
                            background: "rgba(34,197,94,0.06)",
                            border: "1px solid rgba(34,197,94,0.2)",
                            borderRadius: 20, padding: "22px 24px", marginBottom: 20,
                          }}>
                            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8e4f8", marginBottom: 14 }}>🏅 What {gr.displayName.split(" ")[0]} excels at</div>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                              {gr.topStrengths.map((s) => (
                                <div key={s.skillName} style={{
                                  flex: "1 1 140px", padding: "14px 16px", borderRadius: 14,
                                  background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                                }}>
                                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f0f6ff", marginBottom: 4 }}>{s.skillName}</div>
                                  <div style={{ fontSize: "0.7rem", color: "#22c55e", fontWeight: 600 }}>✓ {s.masteryScore}% mastery</div>
                                  <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                                    Achieved {new Date(s.proficientAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── Skills in progress ─────────────────────────────── */}
                        {gr.skillsInProgress.length > 0 && (
                          <div style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(155,114,255,0.15)",
                            borderRadius: 20, padding: "22px 24px", marginBottom: 20,
                          }}>
                            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8e4f8", marginBottom: 6 }}>🔄 Currently building</div>
                            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Skills in progress — closer than they look</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                              {gr.skillsInProgress.slice(0, 6).map((s) => (
                                <div key={s.skillName}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                    <div>
                                      <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "#f0f6ff" }}>{s.skillName}</span>
                                      {s.priority === "essential" && <span style={{ marginLeft: 8, fontSize: "0.62rem", padding: "1px 7px", borderRadius: 10, background: "rgba(155,114,255,0.2)", color: "#c4a8ff" }}>Essential</span>}
                                    </div>
                                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: s.masteryScore >= 70 ? "#22c55e" : s.masteryScore >= 50 ? "#f59e0b" : "#ff7b6b" }}>{s.masteryScore}%</span>
                                  </div>
                                  <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 8 }}>
                                    <div style={{ height: "100%", borderRadius: 3, width: `${Math.max(3, s.masteryScore)}%`, background: s.masteryScore >= 70 ? "#22c55e" : s.masteryScore >= 50 ? "#f59e0b" : "#ff7b6b", transition: "width 0.5s" }} />
                                  </div>
                                  {/* Parent tip */}
                                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(155,114,255,0.07)", fontSize: "0.74rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                                    💡 <strong style={{ color: "rgba(255,255,255,0.7)" }}>How to help:</strong> {s.parentTip}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── Skills not yet started ─────────────────────────── */}
                        {gr.skillsNotStarted.length > 0 && (
                          <div style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 20, padding: "22px 24px", marginBottom: 20,
                          }}>
                            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8e4f8", marginBottom: 6 }}>🗺️ What&apos;s ahead</div>
                            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Skills not yet started — introducing these is a great next step</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              {gr.skillsNotStarted.map((s) => (
                                <div key={s.skillName} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: "0.83rem", fontWeight: 600, color: "#c8b8f0" }}>{s.skillName}</span>
                                    <span style={{ fontSize: "0.65rem", padding: "1px 8px", borderRadius: 10, background: s.priority === "essential" ? "rgba(155,114,255,0.2)" : "rgba(56,189,248,0.15)", color: s.priority === "essential" ? "#c4a8ff" : "#7dd3fc" }}>{s.priority === "essential" ? "Essential" : "On Track"}</span>
                                  </div>
                                  <div style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                                    👨‍👩‍👧 {s.parentAction}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── Learning patterns ──────────────────────────────── */}
                        <div style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(155,114,255,0.15)",
                          borderRadius: 20, padding: "22px 24px", marginBottom: 20,
                        }}>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8e4f8", marginBottom: 16 }}>📈 Learning patterns · last 30 days</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
                            {[
                              { label: "Total sessions", value: String(gr.learningPattern.totalSessions30d), color: "#9b72ff" },
                              { label: "Avg session length", value: gr.learningPattern.avgSessionMinutes ? `${gr.learningPattern.avgSessionMinutes} min` : "—", color: "#ffd166" },
                              { label: "Best learning day", value: gr.learningPattern.bestDayLabel ?? "—", color: "#22c55e" },
                              { label: "Consistency", value: `${gr.learningPattern.consistencyPct}%`, color: "#38bdf8" },
                              gr.learningPattern.avgAccuracy30d !== null ? { label: "Avg accuracy", value: `${gr.learningPattern.avgAccuracy30d}%`, color: "#ff7b6b" } : null,
                            ].filter(Boolean).map((item) => item && (
                              <div key={item.label} style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.value}</div>
                                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.38)" }}>{item.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ── Mastery timeline ───────────────────────────────── */}
                        {gr.masteredSkills.length > 0 && (
                          <div style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(155,114,255,0.15)",
                            borderRadius: 20, padding: "22px 24px", marginBottom: 20,
                          }}>
                            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8e4f8", marginBottom: 16 }}>🏆 Skills mastered · full journey</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                              {gr.masteredSkills.map((s, i) => (
                                <div key={s.skillName} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                  {/* Timeline spine */}
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #16a34a", marginTop: 6, flexShrink: 0 }} />
                                    {i < gr.masteredSkills.length - 1 && <div style={{ width: 2, flex: 1, background: "rgba(34,197,94,0.2)", minHeight: 24 }} />}
                                  </div>
                                  {/* Content */}
                                  <div style={{ paddingBottom: i < gr.masteredSkills.length - 1 ? 12 : 0 }}>
                                    <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#f0f6ff" }}>{s.skillName}</div>
                                    <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.38)", marginTop: 2 }}>
                                      {new Date(s.proficientAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {s.masteryScore}% mastery
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── Legal disclaimer ───────────────────────────────── */}
                        <div style={{
                          padding: "16px 20px",
                          borderRadius: 14,
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          marginBottom: 8,
                        }}>
                          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                            ℹ️ Important note
                          </div>
                          <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>
                            WonderQuest is a supplemental practice tool designed to support learning through engaging, curriculum-aligned activities.
                            The progress data, skill assessments, and recommendations shown here reflect in-app practice sessions only — they are <strong style={{ color: "rgba(255,255,255,0.45)" }}>not formal academic evaluations</strong> and
                            should not be used to diagnose learning differences, developmental delays, giftedness, or any educational condition.
                            This information is not a substitute for assessment by a qualified educator, school counselor, or licensed learning specialist.
                            For official academic evaluation, please consult your child&apos;s teacher or school.
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

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

                  {/* Proficiency report link */}
                  <Link
                    href="/parent/proficiency"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      background: "rgba(155,114,255,0.1)",
                      border: "1px solid rgba(155,114,255,0.25)",
                      borderRadius: 12,
                      textDecoration: "none",
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18 }}>📊</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#e0d4ff" }}>
                          View Proficiency Report
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                          Track skill mastery across all sessions
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 18, color: "#9b72ff" }}>→</span>
                  </Link>

                  {/* Session log — daily summary cards */}
                  <SectionCard
                    title="Daily learning log"
                    icon="📅"
                    right={
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.38)" }}>
                        {report?.dailySummaries?.reduce((s, d) => s + d.sessionCount, 0) ?? 0} sessions · {report?.dailySummaries?.length ?? 0} active days
                      </span>
                    }
                  >
                    {!report?.dailySummaries || report.dailySummaries.length === 0 ? (
                      <div style={{ padding: "20px 12px", fontSize: "0.82rem", color: "rgba(255,255,255,0.38)", textAlign: "center" }}>
                        No sessions this week yet.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {report.dailySummaries.map((day) => {
                          const accuracy = day.accuracyPct;
                          const accuracyColor = accuracy === null ? "#8b949e"
                            : accuracy >= 80 ? "#22c55e"
                            : accuracy >= 60 ? "#f59e0b"
                            : "#ff7b6b";
                          return (
                            <div key={day.date} style={{
                              padding: "14px 16px",
                              borderRadius: 12,
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(155,114,255,0.12)",
                            }}>
                              {/* Day header */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#c8b8f0" }}>{day.dayLabel}</span>
                                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>{day.date}</span>
                                </div>
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                  {day.totalMinutes > 0 && (
                                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                                      ⏱ {day.totalMinutes} min
                                    </span>
                                  )}
                                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ffd166" }}>
                                    ⭐ {day.starsEarned}
                                  </span>
                                </div>
                              </div>

                              {/* Stats row */}
                              <div style={{ display: "flex", gap: 12, marginBottom: day.skills.length > 0 ? 10 : 0, flexWrap: "wrap" }}>
                                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
                                  {day.sessionCount} session{day.sessionCount !== 1 ? "s" : ""}
                                </span>
                                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
                                  {day.totalQuestions} questions
                                </span>
                                {accuracy !== null && (
                                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: accuracyColor }}>
                                    {accuracy}% accurate
                                  </span>
                                )}
                              </div>

                              {/* Skills pills */}
                              {day.skills.length > 0 && (
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                  {day.skills.map((sk) => (
                                    <span key={sk} style={{
                                      fontSize: "0.68rem", padding: "2px 9px", borderRadius: 20,
                                      background: "rgba(155,114,255,0.12)",
                                      border: "1px solid rgba(155,114,255,0.2)",
                                      color: "#c4a8ff",
                                    }}>
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
