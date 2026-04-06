"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Stub data ────────────────────────────────────────────────────────────────

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
    supportTip: "Read picture books aloud together and pause at new words. Ask what sounds do you hear? before reading the word — this mirrors exactly what WonderQuest is teaching.",
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
    explainer: "CVC (consonant-vowel-consonant) words like cat, dog, and sun are the simplest spelled words. Mastering them builds confidence and transfers directly to reading fluency.",
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatSkillName(code: string): string {
  return code
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
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
    supportTip: "Keep practice short — 5 to 10 minutes of calm, focused play is more effective than longer sessions.",
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

function getMasteryFill(status: "strong" | "building" | "started"): string {
  if (status === "strong") return "linear-gradient(90deg, #9b72ff, #58e8c1)";
  if (status === "building") return "linear-gradient(90deg, #ffd166, #ffb347)";
  return "linear-gradient(90deg, #ff7b6b, #ffd166)";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SparkChart({ values, labels, trend }: { values: number[]; labels: string[]; trend: string }) {
  const maxVal = Math.max(...values, 1);
  const maxH = 52;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "6px",
          height: `${maxH + 4}px`,
          marginBottom: "8px",
        }}
      >
        {values.map((v, i) => {
          const h = v === 0 ? 0 : Math.max(Math.round((v / maxVal) * maxH), 4);
          const isLast = i === values.length - 1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}px`,
                borderRadius: "4px 4px 0 0",
                background: isLast ? "#9b72ff" : "rgba(155,114,255,0.22)",
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
              color: "rgba(255,255,255,0.38)",
              textAlign: "center",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {lbl}
          </span>
        ))}
      </div>
      <div style={{ fontSize: "11px", color: "#58e8c1", fontWeight: 700, marginTop: "8px" }}>
        {trend}
      </div>
    </div>
  );
}

function SessionRow({ entry, isLast }: { entry: SessionEntry; isLast: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "11px 0",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.45)",
          fontWeight: 600,
          minWidth: "110px",
          flexShrink: 0,
        }}
      >
        {entry.date}
      </span>
      <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
        ⭐ {entry.stars} stars
      </span>
      {entry.perfect && (
        <span
          style={{
            background: "rgba(255,209,102,0.14)",
            border: "1px solid rgba(255,209,102,0.28)",
            borderRadius: "20px",
            padding: "2px 9px",
            fontSize: "10px",
            fontWeight: 700,
            color: "#ffd166",
            flexShrink: 0,
          }}
        >
          ⭐ Perfect session
        </span>
      )}
      <span
        style={{
          marginLeft: "auto",
          fontSize: "11px",
          color: "rgba(255,255,255,0.38)",
          flexShrink: 0,
        }}
      >
        {entry.durationMin}m
      </span>
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function Card({
  title,
  children,
  accent,
}: {
  title?: string;
  children: React.ReactNode;
  accent?: string;
}) {
  const border = accent ? `1px solid ${accent}30` : "1px solid rgba(255,255,255,0.08)";
  const borderLeft = accent ? `4px solid ${accent}` : undefined;
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border,
        borderLeft,
        borderRadius: "14px",
        padding: "20px",
      }}
    >
      {title && (
        <div
          style={{
            fontSize: "13px",
            fontWeight: 800,
            color: "#e8e4f8",
            marginBottom: "14px",
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── API types ────────────────────────────────────────────────────────────────

type ApiSkillProgress = {
  skillCode: string;
  skillName: string;
  subjectCode: string;
  launchBandCode: string;
  correctCount: number;
  totalCount: number;
  masteryPct: number;
  lastPracticed: string | null;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentSkillDetailPage() {
  const params = useParams();
  const skillCode = typeof params?.skillCode === "string" ? params.skillCode : "";

  const baseStub = skillCode ? (SKILL_STUBS[skillCode] ?? getDefaultStub(skillCode)) : null;
  const [stub, setStub] = useState<SkillStub | null>(baseStub);
  const skillDisplayName = skillCode ? formatSkillName(skillCode) : "Skill";
  const statusColor = stub ? getStatusColor(stub.status) : "#9b72ff";
  const isStrong = stub?.status === "strong";

  // Suppress hydration mismatch — stub is always available client-side
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  // Fetch real skill progress and overlay onto stub data
  useEffect(() => {
    if (!skillCode) return;
    const studentId =
      typeof window !== "undefined"
        ? localStorage.getItem("wq_active_student_id")
        : null;
    if (!studentId) return;

    fetch(`/api/parent/skills?studentId=${encodeURIComponent(studentId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.skills || !Array.isArray(data.skills)) return;
        const match = (data.skills as ApiSkillProgress[]).find(
          (s) => s.skillCode === skillCode,
        );
        if (!match) return;

        const masteryPct = match.masteryPct;
        const liveStatus: SkillStub["status"] =
          masteryPct >= 80 ? "strong" : masteryPct >= 40 ? "building" : "started";

        setStub((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            masteryScore: masteryPct,
            status: liveStatus,
            subjectTag: `✨ ${match.subjectCode}`,
          };
        });
      })
      .catch(() => {
        // silently keep stub on error
      });
  }, [skillCode]);

  if (!ready || !stub) {
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
              border: "3px solid rgba(155,114,255,0.18)",
              borderTopColor: "#9b72ff",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
          padding: "0 0 56px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#f0f6ff",
        }}
      >
        {/* ── Top nav bar ────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/parent"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "#9b72ff",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(155,114,255,0.1)",
              border: "1px solid rgba(155,114,255,0.22)",
            }}
          >
            ← Skills
          </Link>

          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            <Link
              href="/parent"
              style={{
                color: "#9b72ff",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "12px",
              }}
            >
              Home
            </Link>
            <span>›</span>
            <span>Skills</span>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              {skillDisplayName}
            </span>
          </div>
        </div>

        {/* ── Page header ────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "28px 32px 0",
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                flexShrink: 0,
              }}
            >
              {stub.icon}
            </div>
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#fff",
                  margin: "0 0 6px",
                  lineHeight: 1.2,
                }}
              >
                {skillDisplayName}
              </h1>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "rgba(88,232,193,0.12)",
                    color: "#58e8c1",
                    border: "1px solid rgba(88,232,193,0.24)",
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
                    background: `${statusColor}1a`,
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

          {/* ── Stat row ─────────────────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {[
              {
                label: "Stars this week",
                value: `⭐ ${stub.starsThisWeek}`,
                delta: stub.starsDelta,
                up: stub.starsDelta.startsWith("↑"),
              },
              {
                label: "Sessions",
                value: String(stub.sessions),
                delta: stub.sessionsDelta,
                up: stub.sessionsDelta.startsWith("↑"),
              },
              {
                label: "Time on skill",
                value: `${stub.timeMin}m`,
                delta: stub.timeDelta,
                up: stub.timeDelta.startsWith("↑"),
              },
              {
                label: "Perfect sessions",
                value: stub.perfectSessions === 0 ? "0×" : `🔥 ${stub.perfectSessions}×`,
                delta: stub.perfectDelta,
                up: stub.perfectDelta.startsWith("↑"),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 900,
                    color: "#fff",
                    marginBottom: "3px",
                    lineHeight: 1.1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "5px",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: stat.up ? "#22c55e" : "rgba(255,255,255,0.38)",
                  }}
                >
                  {stat.delta}
                </div>
              </div>
            ))}
          </div>

          {/* ── Two column layout ────────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {/* LEFT column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Mastery progress */}
              <Card title="Mastery progress">
                <div
                  style={{
                    height: "14px",
                    borderRadius: "7px",
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                    marginBottom: "6px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${stub.masteryScore}%`,
                      borderRadius: "7px",
                      background: getMasteryFill(stub.status),
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.38)",
                    marginBottom: "10px",
                  }}
                >
                  <span>0</span>
                  <span style={{ color: statusColor, fontWeight: 800 }}>
                    {stub.masteryScore} / 100
                  </span>
                  <span>100</span>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {stub.status === "strong"
                    ? `Approaching the top of this skill — really strong work here!`
                    : stub.status === "building"
                    ? "Building confidence. Consistent practice over 2–3 more weeks will help it click."
                    : "Just started this skill. Early sessions look great — keep the momentum going!"}
                </p>
              </Card>

              {/* Week-by-week sparkline */}
              <Card title="Week-by-week stars">
                <SparkChart
                  values={stub.weeklyStars}
                  labels={stub.weeklyLabels}
                  trend={stub.weeklyTrend}
                />
              </Card>

              {/* Support tip or celebration */}
              {isStrong ? (
                <div
                  style={{
                    background: "rgba(88,232,193,0.07)",
                    border: "1px solid rgba(88,232,193,0.2)",
                    borderLeft: "4px solid #58e8c1",
                    borderRadius: "12px",
                    padding: "18px",
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
                    🎉 Great work on this skill!
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.55)",
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
                    padding: "18px",
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
                      color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {stub.supportTip}
                  </p>
                </div>
              )}

              {/* What this means */}
              <div
                style={{
                  background: "rgba(155,114,255,0.06)",
                  border: "1px solid rgba(155,114,255,0.15)",
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#9b72ff",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "6px",
                  }}
                >
                  For parents
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#e8e4f8",
                    marginBottom: "8px",
                  }}
                >
                  What this means
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {stub.explainer}
                </p>
              </div>
            </div>

            {/* RIGHT column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Session log */}
              <Card title="Sessions this week">
                {stub.sessionLog.length === 0 ? (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.32)",
                      padding: "12px 0",
                      textAlign: "center",
                    }}
                  >
                    No sessions yet this week.
                  </p>
                ) : (
                  stub.sessionLog.map((entry, i) => (
                    <SessionRow
                      key={i}
                      entry={entry}
                      isLast={i === stub.sessionLog.length - 1}
                    />
                  ))
                )}
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.28)",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: "10px",
                  }}
                >
                  ⭐ Perfect session = every question correct that session
                </div>
              </Card>

              {/* Related skills */}
              <Card title="Related skills">
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
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "9px",
                        background: "rgba(255,255,255,0.07)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "15px",
                        flexShrink: 0,
                      }}
                    >
                      {related.icon}
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#f0f6ff",
                        flex: 1,
                      }}
                    >
                      {related.name}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "14px" }}>›</span>
                  </Link>
                ))}
              </Card>

              {/* Encourage action */}
              <div
                style={{
                  background: "rgba(155,114,255,0.08)",
                  border: "1px solid rgba(155,114,255,0.18)",
                  borderRadius: "14px",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#9b72ff",
                    marginBottom: "8px",
                  }}
                >
                  💬 Say something encouraging
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.6,
                    margin: "0 0 12px",
                  }}
                >
                  {isStrong
                    ? `Let them know you noticed how well they are doing with ${skillDisplayName.toLowerCase()} — even a brief mention means a lot.`
                    : `Your child is putting real effort into ${skillDisplayName.toLowerCase()}. A calm "I noticed you are working hard on this" goes a long way.`}
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Great effort!", "I noticed!", "Keep it up!"].map((msg) => (
                    <span
                      key={msg}
                      style={{
                        background: "rgba(155,114,255,0.14)",
                        border: "1px solid rgba(155,114,255,0.28)",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#c4a8ff",
                      }}
                    >
                      {msg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
