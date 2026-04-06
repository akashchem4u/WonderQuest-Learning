"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { ShellCard, StatTile } from "@/components/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type ParentAccessResponse = {
  guardian: {
    id: string;
    username: string;
    displayName: string;
  };
  linkedChild: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  } | null;
  linkedChildren: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  }[];
  childDashboards: {
    studentId: string;
    sessionCount: number;
    completedSessions: number;
    totalTimeSpentMs: number;
    effectiveTimeSpentMs: number;
    averageEffectiveness: number | null;
    completionRate: number | null;
    effectiveRatio: number | null;
    lastSessionAt: string | null;
    recommendedFocus: string;
    readinessLabel: string;
    strengths: { skillCode: string; displayName: string; masteryRate: number; attempts: number }[];
    supportAreas: { skillCode: string; displayName: string; masteryRate: number; attempts: number }[];
    recentSessions: {
      id: string;
      sessionMode: string;
      startedAt: string;
      endedAt: string | null;
      effectivenessScore: number | null;
      totalQuestions: number;
    }[];
  }[];
  childDashboard: {
    studentId: string;
    strengths: { skillCode: string; displayName: string; masteryRate: number; attempts: number }[];
    supportAreas: { skillCode: string; displayName: string; masteryRate: number; attempts: number }[];
  } | null;
};

// ─── Stub data helpers ────────────────────────────────────────────────────────

type SessionEntry = {
  date: string;
  stars: number;
  durationMin: number;
  perfect: boolean;
};

type SkillStub = {
  icon: string;
  subject: string;
  subjectTag: string;
  status: "strong" | "building" | "started";
  masteryScore: number;
  starsThisWeek: number;
  starsDelta: string;
  sessions: number;
  sessionsDelta: string;
  timeMin: number;
  timeDelta: string;
  perfectSessions: number;
  perfectDelta: string;
  weeklyStars: number[];
  weeklyLabels: string[];
  weeklyTrend: string;
  sessionLog: SessionEntry[];
  supportTip: string;
  celebrationNote: string;
  relatedSkills: { icon: string; name: string; code: string }[];
  explainer: string;
};

const SKILL_STUBS: Record<string, SkillStub> = {
  "sight-words": {
    icon: "📖",
    subject: "Reading",
    subjectTag: "🌿 Reading",
    status: "strong",
    masteryScore: 88,
    starsThisWeek: 18,
    starsDelta: "↑ +6 vs last week",
    sessions: 5,
    sessionsDelta: "↑ +2 vs last week",
    timeMin: 38,
    timeDelta: "→ Similar",
    perfectSessions: 4,
    perfectDelta: "↑ Most ever",
    weeklyStars: [7, 9, 11, 10, 18],
    weeklyLabels: ["Mar 3", "Mar 10", "Mar 17", "Mar 24", "This wk"],
    weeklyTrend: "↑ Best week so far!",
    sessionLog: [
      { date: "Today, 3:22pm", stars: 4, durationMin: 8, perfect: true },
      { date: "Mon, 4:10pm", stars: 3, durationMin: 7, perfect: false },
      { date: "Mon, 4:20pm", stars: 4, durationMin: 8, perfect: true },
      { date: "Sun, 5:15pm", stars: 4, durationMin: 9, perfect: true },
      { date: "Sat, 5:05pm", stars: 3, durationMin: 6, perfect: false },
    ],
    supportTip: "",
    celebrationNote: "Keep encouraging reading aloud — it reinforces all sight words naturally.",
    relatedSkills: [
      { icon: "🔤", name: "Blending sounds", code: "blending-sounds" },
      { icon: "📝", name: "CVC spelling", code: "cvc-spelling" },
    ],
    explainer: "Sight words are common words children recognise by memory rather than sounding out. Strong sight-word recognition speeds up reading fluency and frees attention for harder words.",
  },
  "blending-sounds": {
    icon: "🔤",
    subject: "Reading",
    subjectTag: "🌿 Reading",
    status: "building",
    masteryScore: 48,
    starsThisWeek: 6,
    starsDelta: "↑ +2 vs last week",
    sessions: 2,
    sessionsDelta: "→ Same",
    timeMin: 16,
    timeDelta: "↑ +6 min",
    perfectSessions: 0,
    perfectDelta: "Building up",
    weeklyStars: [0, 2, 3, 4, 6],
    weeklyLabels: ["Mar 3", "Mar 10", "Mar 17", "Mar 24", "This wk"],
    weeklyTrend: "↑ Improving week over week",
    sessionLog: [
      { date: "Today, 3:40pm", stars: 3, durationMin: 9, perfect: false },
      { date: "Mon, 4:55pm", stars: 3, durationMin: 7, perfect: false },
    ],
    supportTip: "Read picture books aloud together and pause at new words. Ask 'what sounds do you hear?' before reading the word — this mirrors exactly what WonderQuest is teaching.",
    celebrationNote: "",
    relatedSkills: [
      { icon: "📖", name: "Sight words", code: "sight-words" },
      { icon: "📝", name: "CVC spelling", code: "cvc-spelling" },
    ],
    explainer: "Blending is the ability to push individual sounds together to form a word. It is a core phonics skill — once it clicks, new words become decodable without memorisation.",
  },
  "counting-objects": {
    icon: "🔢",
    subject: "Maths",
    subjectTag: "🔢 Maths",
    status: "strong",
    masteryScore: 92,
    starsThisWeek: 21,
    starsDelta: "↑ +8 vs last week",
    sessions: 6,
    sessionsDelta: "↑ +3 vs last week",
    timeMin: 42,
    timeDelta: "↑ +10 min",
    perfectSessions: 5,
    perfectDelta: "↑ Personal best",
    weeklyStars: [5, 8, 11, 13, 21],
    weeklyLabels: ["Mar 3", "Mar 10", "Mar 17", "Mar 24", "This wk"],
    weeklyTrend: "↑ Best week ever!",
    sessionLog: [
      { date: "Today, 4:00pm", stars: 4, durationMin: 8, perfect: true },
      { date: "Tue, 3:50pm", stars: 4, durationMin: 7, perfect: true },
      { date: "Mon, 4:30pm", stars: 3, durationMin: 6, perfect: false },
      { date: "Sun, 5:00pm", stars: 4, durationMin: 8, perfect: true },
      { date: "Sat, 4:45pm", stars: 3, durationMin: 7, perfect: false },
      { date: "Fri, 4:10pm", stars: 3, durationMin: 6, perfect: false },
    ],
    supportTip: "",
    celebrationNote: "Counting is a real strength right now. Use snacks or small objects to keep this feeling easy and fun at home.",
    relatedSkills: [
      { icon: "➕", name: "Simple addition", code: "simple-addition" },
      { icon: "🔢", name: "Number recognition", code: "number-recognition" },
    ],
    explainer: "Counting objects builds one-to-one correspondence — the understanding that each number word matches exactly one object. This foundation underpins all early arithmetic.",
  },
  "cvc-spelling": {
    icon: "📝",
    subject: "Spelling",
    subjectTag: "✏️ Spelling",
    status: "started",
    masteryScore: 28,
    starsThisWeek: 3,
    starsDelta: "→ New skill",
    sessions: 1,
    sessionsDelta: "→ First week",
    timeMin: 7,
    timeDelta: "→ Just started",
    perfectSessions: 0,
    perfectDelta: "Just starting",
    weeklyStars: [0, 0, 0, 0, 3],
    weeklyLabels: ["Mar 3", "Mar 10", "Mar 17", "Mar 24", "This wk"],
    weeklyTrend: "New skill — great first session!",
    sessionLog: [
      { date: "Today, 4:15pm", stars: 3, durationMin: 7, perfect: false },
    ],
    supportTip: "Write three-letter words (cat, dog, sun) on paper and let your child trace them. Short, calm, and playful is the goal — no pressure to memorise yet.",
    celebrationNote: "",
    relatedSkills: [
      { icon: "🔤", name: "Blending sounds", code: "blending-sounds" },
      { icon: "📖", name: "Sight words", code: "sight-words" },
    ],
    explainer: "CVC (consonant-vowel-consonant) words like 'cat', 'dog', and 'sun' are the simplest spelled words. Mastering them builds confidence and transfers directly to reading fluency.",
  },
};

// ─── Utility functions ────────────────────────────────────────────────────────

function formatSkillName(code: string): string {
  return code
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getDefaultStub(code: string): SkillStub {
  return {
    icon: "✨",
    subject: "Learning",
    subjectTag: "✨ Learning",
    status: "building",
    masteryScore: 55,
    starsThisWeek: 9,
    starsDelta: "↑ +3 vs last week",
    sessions: 3,
    sessionsDelta: "↑ +1 vs last week",
    timeMin: 22,
    timeDelta: "→ Similar",
    perfectSessions: 1,
    perfectDelta: "↑ First one!",
    weeklyStars: [2, 4, 5, 6, 9],
    weeklyLabels: ["Mar 3", "Mar 10", "Mar 17", "Mar 24", "This wk"],
    weeklyTrend: "↑ Steady progress",
    sessionLog: [
      { date: "Today, 3:30pm", stars: 3, durationMin: 8, perfect: false },
      { date: "Wed, 4:00pm", stars: 3, durationMin: 7, perfect: false },
      { date: "Mon, 4:20pm", stars: 3, durationMin: 7, perfect: true },
    ],
    supportTip: `Keep practice short around ${formatSkillName(code).toLowerCase()} — 5–10 minutes of calm, focused play is more effective than longer sessions.`,
    celebrationNote: "",
    relatedSkills: [
      { icon: "📖", name: "Sight words", code: "sight-words" },
      { icon: "🔢", name: "Counting objects", code: "counting-objects" },
    ],
    explainer: `${formatSkillName(code)} is an important skill in your child's learning journey. Consistent short practice sessions help build lasting confidence and fluency.`,
  };
}

function getStatusColor(status: "strong" | "building" | "started"): string {
  if (status === "strong") return "#58e8c1";
  if (status === "building") return "#ffd166";
  return "#ff7b6b";
}

function getStatusLabel(status: "strong" | "building" | "started"): string {
  if (status === "strong") return "⭐ Strong";
  if (status === "building") return "🌱 Building";
  return "🚀 Just started";
}

function getMasteryFillColor(status: "strong" | "building" | "started"): string {
  if (status === "strong") return "linear-gradient(90deg, #9b72ff, #58e8c1)";
  if (status === "building") return "linear-gradient(90deg, #ffd166, #ffb347)";
  return "linear-gradient(90deg, #ff7b6b, #ffd166)";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SparkChart({ values, labels, trend }: { values: number[]; labels: string[]; trend: string }) {
  const maxVal = Math.max(...values, 1);
  const maxHeightPx = 48;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: `${maxHeightPx + 4}px`, marginBottom: "8px" }}>
        {values.map((v, i) => {
          const heightPx = Math.max(Math.round((v / maxVal) * maxHeightPx), v === 0 ? 0 : 4);
          const isLast = i === values.length - 1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${heightPx}px`,
                borderRadius: "4px 4px 0 0",
                background: isLast ? "#9b72ff" : "rgba(155,114,255,0.25)",
                transition: "height 0.3s ease",
                alignSelf: "flex-end",
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        {labels.map((lbl, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              fontSize: "9px",
              color: "rgba(255,255,255,0.4)",
              textAlign: "center",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {lbl}
          </span>
        ))}
      </div>
      <div style={{ fontSize: "11px", color: "#58e8c1", fontWeight: 700, marginTop: "8px" }}>{trend}</div>
    </div>
  );
}

function SessionLogItem({ entry }: { entry: SessionEntry }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600, minWidth: "100px", flexShrink: 0 }}>
        {entry.date}
      </span>
      <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>
        ⭐ {entry.stars} stars
      </span>
      {entry.perfect && (
        <span
          style={{
            background: "rgba(255,209,102,0.15)",
            border: "1px solid rgba(255,209,102,0.3)",
            borderRadius: "20px",
            padding: "2px 8px",
            fontSize: "10px",
            fontWeight: 700,
            color: "#ffd166",
          }}
        >
          ⭐ Perfect session
        </span>
      )}
      <span style={{ marginLeft: "auto", fontSize: "11px", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
        {entry.durationMin}m
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PageProps = {
  params: Promise<{ skillCode: string }>;
};

export default function ParentSkillDetailPage({ params }: PageProps) {
  const [skillCode, setSkillCode] = useState<string>("");
  const [authResult, setAuthResult] = useState<ParentAccessResponse | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Resolve async params
  useEffect(() => {
    params.then(({ skillCode: code }) => setSkillCode(code));
  }, [params]);

  // Cookie-based session restore (same pattern as parent/page.tsx)
  useEffect(() => {
    let cancelled = false;

    async function trySessionRestore() {
      try {
        const response = await fetch("/api/parent/session", { method: "GET" });
        if (!response.ok || cancelled) {
          setAuthChecked(true);
          return;
        }
        const payload = (await response.json()) as ParentAccessResponse;
        if (cancelled) return;
        setAuthResult(payload);
      } catch {
        // No valid session
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    }

    void trySessionRestore();
    return () => { cancelled = true; };
  }, []);

  const stub = skillCode
    ? (SKILL_STUBS[skillCode] ?? getDefaultStub(skillCode))
    : null;

  const skillDisplayName = skillCode ? formatSkillName(skillCode) : "";
  const childName =
    authResult?.linkedChild?.displayName ??
    authResult?.linkedChildren[0]?.displayName ??
    "your child";

  const statusColor = stub ? getStatusColor(stub.status) : "#9b72ff";
  const isStrong = stub?.status === "strong";

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!authChecked || !stub) {
    return (
      <AppFrame audience="parent" currentPath="/parent">
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "3px solid rgba(155,114,255,0.2)",
              borderTopColor: "#9b72ff",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div
        style={{
          minHeight: "100vh",
          background: "#100b2e",
          padding: "0 0 48px",
        }}
      >
        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "20px 32px 16px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/parent"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#9b72ff",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(155,114,255,0.1)",
              border: "1px solid rgba(155,114,255,0.2)",
              flexShrink: 0,
            }}
          >
            ← Family Hub
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                flexShrink: 0,
              }}
            >
              {stub.icon}
            </div>
            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {skillDisplayName}
              </h1>
              <div style={{ display: "flex", gap: "8px", marginTop: "5px", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "rgba(88,232,193,0.12)",
                    color: "#58e8c1",
                    border: "1px solid rgba(88,232,193,0.25)",
                    borderRadius: "20px",
                    padding: "3px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {stub.subjectTag}
                </span>
                <span
                  style={{
                    background: `${statusColor}18`,
                    color: statusColor,
                    border: `1px solid ${statusColor}40`,
                    borderRadius: "20px",
                    padding: "3px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {getStatusLabel(stub.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat tiles row ────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
            padding: "24px 32px 0",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <StatTile
              label="Stars this week"
              value={`⭐ ${stub.starsThisWeek}`}
              detail={stub.starsDelta}
            />
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <StatTile
              label="Sessions"
              value={String(stub.sessions)}
              detail={stub.sessionsDelta}
            />
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <StatTile
              label="Time on skill"
              value={`${stub.timeMin}m`}
              detail={stub.timeDelta}
            />
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <StatTile
              label="Perfect sessions"
              value={stub.perfectSessions === 0 ? "0×" : `🔥 ${stub.perfectSessions}×`}
              detail={stub.perfectDelta}
            />
          </div>
        </div>

        {/* ── Two-column main layout ────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
            padding: "20px 32px 0",
          }}
        >
          {/* ── LEFT column ─────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Mastery progress */}
            <ShellCard
              title="Mastery progress"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  height: "12px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  margin: "12px 0 6px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${stub.masteryScore}%`,
                    borderRadius: "6px",
                    background: getMasteryFillColor(stub.status),
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: "10px",
                }}
              >
                <span>0</span>
                <span style={{ color: statusColor, fontWeight: 800 }}>{stub.masteryScore} / 100</span>
                <span>100</span>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {stub.status === "strong"
                  ? `${childName} is very strong here — approaching the top of this skill!`
                  : stub.status === "building"
                  ? `${childName} is building confidence. Consistent practice over 2–3 more weeks will help it click.`
                  : `${childName} has just started this skill. Early sessions look great — keep the momentum going!`}
              </p>
            </ShellCard>

            {/* Weekly sparkline */}
            <ShellCard
              title="Stars over 5 weeks"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <div style={{ marginTop: "12px" }}>
                <SparkChart
                  values={stub.weeklyStars}
                  labels={stub.weeklyLabels}
                  trend={stub.weeklyTrend}
                />
              </div>
            </ShellCard>

            {/* Support tip or celebration */}
            {isStrong ? (
              <div
                style={{
                  background: "rgba(88,232,193,0.08)",
                  border: "1px solid rgba(88,232,193,0.2)",
                  borderLeft: "4px solid #58e8c1",
                  borderRadius: "12px",
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#58e8c1",
                    marginBottom: "6px",
                  }}
                >
                  🎉 {childName} is great at this!
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {stub.celebrationNote}
                </p>
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(255,209,102,0.07)",
                  border: "1px solid rgba(255,209,102,0.2)",
                  borderLeft: "4px solid #ffd166",
                  borderRadius: "12px",
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#ffd166",
                    marginBottom: "6px",
                  }}
                >
                  💡 Support tip for {skillDisplayName}
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {stub.supportTip}
                </p>
              </div>
            )}

            {/* What this means */}
            <ShellCard
              title="What this means"
              eyebrow="For parents"
              style={{
                background: "rgba(155,114,255,0.06)",
                border: "1px solid rgba(155,114,255,0.15)",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.7,
                  margin: "10px 0 0",
                }}
              >
                {stub.explainer}
              </p>
            </ShellCard>
          </div>

          {/* ── RIGHT column ────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Session log */}
            <ShellCard
              title="Sessions this week"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <div style={{ marginTop: "4px" }}>
                {stub.sessionLog.length === 0 ? (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.35)",
                      padding: "16px 0",
                      textAlign: "center",
                    }}
                  >
                    No sessions yet this week.
                  </p>
                ) : (
                  stub.sessionLog.map((entry, i) => (
                    <div
                      key={i}
                      style={
                        i === stub.sessionLog.length - 1
                          ? { borderBottom: "none" }
                          : undefined
                      }
                    >
                      <SessionLogItem entry={entry} />
                    </div>
                  ))
                )}
              </div>
            </ShellCard>

            {/* Encourage action card */}
            <div
              style={{
                background: "rgba(255,123,107,0.08)",
                border: "1px solid rgba(255,123,107,0.2)",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#ff7b6b",
                  marginBottom: "8px",
                }}
              >
                💬 Encourage {childName}
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.6,
                  margin: "0 0 14px",
                }}
              >
                {isStrong
                  ? `Tell ${childName} you noticed how well they're doing with ${skillDisplayName.toLowerCase()} — even a quick mention means a lot.`
                  : `${childName} is putting real effort into ${skillDisplayName.toLowerCase()}. A calm "I noticed you're working hard on this" goes a long way.`}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {["Great effort!", "I noticed!", "Keep it up!"].map((msg) => (
                  <span
                    key={msg}
                    style={{
                      background: "rgba(255,123,107,0.12)",
                      border: "1px solid rgba(255,123,107,0.25)",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#ff7b6b",
                    }}
                  >
                    {msg}
                  </span>
                ))}
              </div>
            </div>

            {/* Related skills */}
            <ShellCard
              title="Related skills"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <div style={{ marginTop: "8px" }}>
                {stub.relatedSkills.map((related, i) => (
                  <Link
                    key={related.code}
                    href={`/parent/skills/${related.code}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 0",
                      borderBottom:
                        i < stub.relatedSkills.length - 1
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "none",
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.07)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {related.icon}
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#fff",
                        flex: 1,
                      }}
                    >
                      {related.name}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>›</span>
                  </Link>
                ))}
              </div>
            </ShellCard>

            {/* Auth context — only shown when not authenticated (session preview) */}
            {!authResult && (
              <div
                style={{
                  background: "rgba(155,114,255,0.08)",
                  border: "1px solid rgba(155,114,255,0.2)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#9b72ff",
                    marginBottom: "4px",
                  }}
                >
                  Preview mode
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.45)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Sign in from{" "}
                  <Link href="/parent" style={{ color: "#9b72ff", fontWeight: 600 }}>
                    Family Hub
                  </Link>{" "}
                  to see live data for your child.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
