"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE    = "#100b2e";
const VIOLET  = "#9b72ff";
const BLUE    = "#38bdf8";
const MINT    = "#22c55e";
const GOLD    = "#ffd166";
const AMBER   = "#f59e0b";
const TEXT    = "#f0f6ff";
const MUTED   = "#8b949e";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.06)";

// ─── API type ─────────────────────────────────────────────────────────────────

type SkillProgress = {
  skillCode: string;
  skillName: string;
  subjectCode: string;
  launchBandCode: string;
  correctCount: number;
  totalCount: number;
  masteryPct: number;
  lastPracticed: string | null;
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ExplainerTab = "full" | "modal" | "faq";

type Band = {
  id: string;
  name: string;
  grades: string;
  desc: string;
  dotColor: string;
  borderColor: string;
  bgColor: string;
};

type StatusDef = {
  label: string;
  icon: string;
  bg: string;
  color: string;
  desc: string;
};

type MasteryStep = {
  num: string;
  title: string;
  body: string;
};

type FaqItem = {
  q: string;
  a: string;
};

// ─── Static data ─────────────────────────────────────────────────────────────

const BANDS: Band[] = [
  {
    id: "p0",
    name: "Pre-K Band",
    grades: "Ages 4–5",
    desc: "Letter recognition, phonics foundations, counting to 20",
    dotColor: GOLD,
    borderColor: "rgba(255,209,102,0.4)",
    bgColor: "rgba(255,209,102,0.08)",
  },
  {
    id: "p1",
    name: "K–1 Band",
    grades: "Ages 5–7",
    desc: "Sight words, blending, addition facts, basic spelling",
    dotColor: VIOLET,
    borderColor: "rgba(155,114,255,0.4)",
    bgColor: "rgba(155,114,255,0.08)",
  },
  {
    id: "p2",
    name: "Grades 2–3",
    grades: "Ages 7–9",
    desc: "Fluency, multi-digit math, vocabulary expansion",
    dotColor: MINT,
    borderColor: "rgba(34,197,94,0.35)",
    bgColor: "rgba(34,197,94,0.07)",
  },
  {
    id: "p3",
    name: "Grades 4–5",
    grades: "Ages 9–11",
    desc: "Comprehension, fractions, complex spelling patterns",
    dotColor: AMBER,
    borderColor: "rgba(245,158,11,0.4)",
    bgColor: "rgba(245,158,11,0.07)",
  },
];

const STATUS_DEFS: StatusDef[] = [
  {
    label: "Strong",
    icon: "⭐",
    bg: "rgba(34,197,94,0.15)",
    color: "#4ade80",
    desc: "A solid grasp of this skill. Keep going — higher levels await!",
  },
  {
    label: "Building",
    icon: "🌱",
    bg: "rgba(245,158,11,0.15)",
    color: AMBER,
    desc: "This skill is actively developing. Normal and expected — a few more sessions will build it up.",
  },
  {
    label: "Just started",
    icon: "🌱",
    bg: "rgba(155,114,255,0.15)",
    color: "#c4a8ff",
    desc: "Brand new skill — only seen it a few times. Early days!",
  },
];

const MASTERY_STEPS: MasteryStep[] = [
  {
    num: "1",
    title: "Your child answers questions on a skill",
    body: "WonderQuest tracks how consistently they get them right over multiple sessions — not just one.",
  },
  {
    num: "2",
    title: "The mastery bar fills up",
    body: "It rises when they consistently succeed, and holds steady (doesn't drop) when they get a few wrong — because one bad day doesn't undo learning.",
  },
  {
    num: "3",
    title: "They earn stars along the way",
    body: "Stars reward effort and consistency — not perfection. This keeps learning fun.",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Can the mastery score go down?",
    a: "No — the mastery score only increases or holds steady. One difficult session doesn't undo earlier learning. Progress is always net-positive here.",
  },
  {
    q: "Why doesn't your child see accuracy percentages?",
    a: "Research shows accuracy percentages can reduce motivation and create test anxiety in young learners. They see stars and progress signals. You see fuller data in the weekly report because context helps you understand and support — not judge.",
  },
  {
    q: "Is the K–1 band a grade level placement?",
    a: "No. Band placement is a starting point based on a short placement activity, and it adjusts automatically as your child progresses. A child in the K–1 band who's crushing it will unlock Grades 2–3 content organically.",
  },
  {
    q: "How long does it take to reach Strong status?",
    a: "Typically 4–8 sessions with consistent success will move a skill from Just started to Building. Building to Strong usually takes 3–5 more sessions. Every child's pace is different — all normal.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MASTERY_TARGET = 65;

function masteryStatus(pct: number): "Strong" | "Building" | "Just started" {
  if (pct >= MASTERY_TARGET) return "Strong";
  if (pct >= 40) return "Building";
  return "Just started";
}

function statusStyle(status: "Strong" | "Building" | "Just started") {
  const map = {
    Strong:         { bg: "rgba(34,197,94,0.15)",    color: "#4ade80", bar: MINT   },
    Building:       { bg: "rgba(255,209,102,0.15)",  color: GOLD,      bar: GOLD   },
    "Just started": { bg: "rgba(155,114,255,0.15)",  color: "#c4a8ff", bar: VIOLET },
  };
  return map[status];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: "0.84rem",
        fontWeight: 800,
        color: TEXT,
        marginBottom: "14px",
      }}
    >
      {children}
    </div>
  );
}

function MasteryBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      style={{
        height: "10px",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "5px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${MINT})`,
          borderRadius: "5px",
        }}
      />
    </div>
  );
}

function SkillMasteryList({ skills, loading }: { skills: SkillProgress[]; loading: boolean }) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: MUTED, fontSize: "0.88rem" }}>
        Loading skill data…
      </div>
    );
  }
  if (skills.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🌱</div>
        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>
          No skills practiced yet
        </div>
        <div style={{ fontSize: "0.78rem", color: MUTED }}>
          Skill mastery data will appear here after the first sessions.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {skills.map((sk) => {
        const status = masteryStatus(sk.masteryPct);
        const ss = statusStyle(status);
        const targetDiff = MASTERY_TARGET - sk.masteryPct;
        return (
          <div
            key={sk.skillCode}
            style={{
              padding: "16px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "12px",
              border: `1px solid ${BORDER}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: TEXT }}>{sk.skillName}</div>
                <div style={{ fontSize: "0.72rem", color: MUTED, marginTop: "2px" }}>{sk.subjectCode}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    background: ss.bg,
                    color: ss.color,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {status}
                </span>
                <span style={{ fontSize: "0.88rem", fontWeight: 800, color: ss.color }}>
                  {sk.masteryPct}%
                </span>
              </div>
            </div>
            <MasteryBar pct={sk.masteryPct} color={ss.bar} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "6px",
                fontSize: "0.65rem",
                color: MUTED,
              }}
            >
              <span>0</span>
              <span style={{ color: AMBER }}>Target: {MASTERY_TARGET}%{targetDiff > 0 ? ` (${targetDiff}% to go)` : ""}</span>
              <span style={{ color: "#4ade80" }}>Strong (65+)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FullExplainer({ skills, loading }: { skills: SkillProgress[]; loading: boolean }) {
  return (
    <>
      {/* Eyebrow + intro */}
      <SectionCard>
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: VIOLET,
            marginBottom: "8px",
          }}
        >
          ℹ️ How WonderQuest works
        </div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 900,
            color: TEXT,
            marginBottom: "10px",
            lineHeight: 1.2,
          }}
        >
          Skill mastery benchmark
        </h2>
        <p
          style={{
            fontSize: "0.88rem",
            color: MUTED,
            lineHeight: 1.7,
          }}
        >
          WonderQuest uses learning bands, mastery scores, and stars to show how your child is developing — not percentages or grades. Each skill below shows their current mastery vs the target of 65%.
        </p>
      </SectionCard>

      {/* Live skill mastery */}
      <SectionCard>
        <SectionHeading>Skill mastery vs target</SectionHeading>
        <SkillMasteryList skills={skills} loading={loading} />
      </SectionCard>

      {/* 4 learning bands */}
      <SectionCard>
        <SectionHeading>The 4 learning bands</SectionHeading>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {BANDS.map((band) => (
            <div
              key={band.id}
              style={{
                borderRadius: "12px",
                padding: "16px",
                position: "relative",
                background: band.bgColor,
                border: `2px solid ${band.borderColor}`,
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: band.dotColor,
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                }}
              />
              <div style={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT, marginBottom: "2px" }}>
                {band.name}
              </div>
              <div style={{ fontSize: "0.72rem", color: MUTED, marginBottom: "8px" }}>
                {band.grades}
              </div>
              <div style={{ fontSize: "0.76rem", color: MUTED, lineHeight: 1.4 }}>
                {band.desc}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Skill status badges */}
      <SectionCard>
        <SectionHeading>Skill status badges</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {STATUS_DEFS.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span
                style={{
                  background: s.bg,
                  color: s.color,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: "20px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {s.icon} {s.label}
              </span>
              <span style={{ fontSize: "0.84rem", color: MUTED, lineHeight: 1.5 }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* How the mastery bar works */}
      <SectionCard>
        <SectionHeading>How the mastery bar works</SectionHeading>
        <div
          style={{
            padding: "14px 16px",
            background: "rgba(155,114,255,0.06)",
            border: `1px solid rgba(155,114,255,0.15)`,
            borderRadius: "10px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: TEXT }}>Example skill</span>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: VIOLET }}>74 / 100</span>
          </div>
          <MasteryBar pct={74} color={VIOLET} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "6px",
              fontSize: "0.65rem",
              color: MUTED,
            }}
          >
            <span>Just started</span>
            <span style={{ color: AMBER }}>Building (40–64)</span>
            <span style={{ color: "#4ade80" }}>Strong (65+)</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {MASTERY_STEPS.map((step) => (
            <div key={step.num} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: VIOLET,
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                {step.num}
              </div>
              <div style={{ fontSize: "0.84rem", color: MUTED, lineHeight: 1.6 }}>
                <span style={{ fontWeight: 700, color: TEXT, display: "block", marginBottom: "2px" }}>
                  {step.title}
                </span>
                {step.body}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Why no % callout */}
      <div
        style={{
          padding: "18px 20px",
          background: "rgba(155,114,255,0.1)",
          border: `1px solid rgba(155,114,255,0.25)`,
          borderRadius: "14px",
          fontSize: "0.85rem",
          color: "#c4a8ff",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: TEXT }}>Why doesn't your child see percentages?</strong>
        <br />
        Research shows that showing accuracy percentages to young learners can reduce motivation and create anxiety. Stars celebrate effort. You see fuller data in the weekly report because context helps you understand and support — not judge.
      </div>
    </>
  );
}

function ModalDemo() {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div style={{ marginBottom: "16px", fontSize: "0.85rem", color: MUTED }}>
        Example: tapping "?" next to a mastery bar opens this inline modal.
      </div>

      {/* Trigger row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 18px",
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: "12px",
          marginBottom: "20px",
          maxWidth: "400px",
        }}
      >
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT }}>Rhyming words</span>
        <div
          style={{
            flex: 1,
            height: "8px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div style={{ height: "100%", width: "74%", background: `linear-gradient(90deg, ${VIOLET}, ${MINT})` }} />
        </div>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: VIOLET }}>74</span>
        <button
          onClick={() => setOpen(true)}
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "rgba(155,114,255,0.2)",
            border: `1px solid rgba(155,114,255,0.4)`,
            color: VIOLET,
            fontSize: "0.7rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ?
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,5,20,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: "400px",
              maxWidth: "90vw",
              background: "#1a1f2e",
              borderRadius: "20px",
              padding: "26px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              border: `1px solid rgba(155,114,255,0.2)`,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div style={{ fontSize: "1rem", fontWeight: 800, color: TEXT }}>
                What does this mean?
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.07)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  color: MUTED,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: "0.84rem", color: MUTED, lineHeight: 1.6, marginBottom: "18px" }}>
              The <strong style={{ color: TEXT }}>mastery bar</strong> shows how well your child has learned this skill over time — not just their score in one session.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
              {[
                { label: "⭐ Strong (65+)",        bg: "rgba(34,197,94,0.15)",   color: "#4ade80", desc: "Consistent success across sessions" },
                { label: "🌱 Building (40–64)",    bg: "rgba(245,158,11,0.15)",  color: AMBER,    desc: "Actively developing — normal progress" },
                { label: "🌱 Just started (<40)", bg: "rgba(155,114,255,0.15)", color: "#c4a8ff", desc: "Brand new — early days" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      background: s.bg,
                      color: s.color,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "20px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {s.label}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: MUTED }}>{s.desc}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "rgba(155,114,255,0.1)",
                borderRadius: "10px",
                padding: "14px",
                fontSize: "0.8rem",
                color: "#c4a8ff",
                lineHeight: 1.5,
                marginBottom: "18px",
              }}
            >
              The bar doesn't decrease when your child gets something wrong — learning is non-linear, and one bad session doesn't undo progress.
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                width: "100%",
                padding: "13px",
                background: VIOLET,
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "0.9rem",
                fontWeight: 700,
                fontFamily: "system-ui",
                cursor: "pointer",
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: TEXT, marginBottom: "6px" }}>
        Frequently asked questions
      </div>
      <div style={{ fontSize: "0.85rem", color: MUTED, marginBottom: "24px" }}>
        Common questions from parents about WonderQuest's approach
      </div>
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              borderBottom: i < FAQ_ITEMS.length - 1 ? `1px solid ${BORDER}` : "none",
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "18px 22px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
                {item.q}
              </span>
              <span
                style={{
                  fontSize: "0.9rem",
                  color: VIOLET,
                  flexShrink: 0,
                  transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  display: "inline-block",
                }}
              >
                ▾
              </span>
            </button>
            {openIndex === i && (
              <div
                style={{
                  padding: "0 22px 18px",
                  fontSize: "0.84rem",
                  color: MUTED,
                  lineHeight: 1.7,
                }}
              >
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { id: ExplainerTab; label: string }[] = [
  { id: "full",  label: "📖 Skill Benchmark" },
  { id: "modal", label: "🪟 As Modal"         },
  { id: "faq",   label: "❓ FAQ"               },
];

export default function ParentBenchmarkPage() {
  const [activeTab, setActiveTab] = useState<ExplainerTab>("full");
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId =
      typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null;
    if (!studentId) {
      setLoading(false);
      return;
    }
    fetch(`/api/parent/skills?studentId=${encodeURIComponent(studentId)}`)
      .then((r) => r.json())
      .then((data) => {
        setSkills(data.skills ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppFrame audience="parent" currentPath="/parent">
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
            maxWidth: "700px",
            margin: "0 auto",
            padding: "36px 32px",
          }}
        >
          {activeTab === "full"  && <FullExplainer skills={skills} loading={loading} />}
          {activeTab === "modal" && <ModalDemo />}
          {activeTab === "faq"   && <FaqSection />}
        </div>
      </div>
    </AppFrame>
  );
}
