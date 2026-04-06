"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#22c55e",
  mintSoft: "#58e8c1",
  gold: "#ffd166",
  coral: "#ff7b6b",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
} as const;

// ─── Static data ──────────────────────────────────────────────────────────────

const BANDS = [
  {
    code: "P0",
    name: "Pre-K Band",
    ages: "Ages 4–5",
    color: C.gold,
    border: "rgba(255,209,102,0.35)",
    bg: "rgba(255,209,102,0.08)",
    skills: [
      "Letter recognition (A–Z)",
      "Phonics foundations",
      "Counting to 20",
      "Shape identification",
      "Basic colour words",
    ],
    placement:
      "Your child is building the very first building blocks. Every letter recognised and every counted object is a genuine win.",
  },
  {
    code: "P1",
    name: "K–1 Band",
    ages: "Ages 5–7",
    color: C.violet,
    border: "rgba(155,114,255,0.35)",
    bg: "rgba(155,114,255,0.08)",
    skills: [
      "Sight words (Dolch list)",
      "CVC word blending",
      "Addition & subtraction facts",
      "Basic spelling patterns",
      "Sentence structure",
    ],
    placement:
      "Foundational literacy and numeracy are actively forming. Short, consistent sessions make a huge difference at this stage.",
  },
  {
    code: "P2",
    name: "Grades 2–3",
    ages: "Ages 7–9",
    color: C.mint,
    border: "rgba(88,232,193,0.35)",
    bg: "rgba(88,232,193,0.08)",
    skills: [
      "Reading fluency & comprehension",
      "Multi-digit addition & subtraction",
      "Vocabulary expansion",
      "Spelling rules (digraphs, blends)",
      "Place value & estimation",
    ],
    placement:
      "Reading and number sense are solidifying. Skills now reinforce each other — a great phase for building real confidence.",
  },
  {
    code: "P3",
    name: "Grades 4–5",
    ages: "Ages 9–11",
    color: C.coral,
    border: "rgba(255,123,107,0.35)",
    bg: "rgba(255,123,107,0.08)",
    skills: [
      "Comprehension & inference",
      "Fractions & decimals",
      "Complex spelling patterns",
      "Long multiplication & division",
      "Paragraph writing",
    ],
    placement:
      "Higher-order thinking begins here. Skills become more interconnected — mastering one often unlocks several others.",
  },
  {
    code: "P4",
    name: "Advanced Band",
    ages: "Ages 10–12+",
    color: C.coral,
    border: "rgba(255,123,107,0.25)",
    bg: "rgba(255,123,107,0.05)",
    skills: [
      "Extended reading & analysis",
      "Ratios, percentages & algebra",
      "Persuasive & creative writing",
      "Complex problem solving",
      "Cross-subject application",
    ],
    placement:
      "Your child is working at an advanced level. WonderQuest keeps stretching the challenge to match their pace.",
  },
];

const MASTERY_THRESHOLDS = [
  {
    range: "65–100",
    status: "Strong",
    icon: "⭐",
    color: C.mint,
    bg: "rgba(88,232,193,0.1)",
    border: "rgba(88,232,193,0.25)",
    desc: "Consistent success across multiple sessions — a skill your child can rely on.",
  },
  {
    range: "40–64",
    status: "Building",
    icon: "🌱",
    color: C.gold,
    bg: "rgba(255,209,102,0.1)",
    border: "rgba(255,209,102,0.25)",
    desc: "Actively developing — normal progress. A few more sessions will solidify it.",
  },
  {
    range: "0–39",
    status: "Just started",
    icon: "🚀",
    color: C.coral,
    bg: "rgba(255,123,107,0.1)",
    border: "rgba(255,123,107,0.25)",
    desc: "Brand new skill — your child has only seen it a handful of times. Early days!",
  },
];

const FORMULA_STEPS = [
  {
    num: "1",
    title: "Questions attempted",
    body: "We count every question your child genuinely engages with — not skipped or auto-advanced ones.",
  },
  {
    num: "2",
    title: "Weighted by recency",
    body: "Recent sessions matter more than older ones. A strong week lifts the score; an off day doesn't erase prior learning.",
  },
  {
    num: "3",
    title: "Smoothed across sessions",
    body: "We average across at least 3 sessions before the score stabilises, so one lucky or unlucky session doesn't define it.",
  },
  {
    num: "4",
    title: "Score never decreases",
    body: "Mastery only moves up (or holds steady). This reflects real learning — one bad session doesn't undo weeks of practice.",
  },
];

const WHAT_COUNTS = [
  { emoji: "✅", label: "Correct first attempt" },
  { emoji: "✅", label: "Correct after a single hint" },
  { emoji: "✅", label: "Questions from completed sessions" },
];

const WHAT_DOESNT = [
  { emoji: "❌", label: "Skipped questions" },
  { emoji: "❌", label: "Auto-advanced items" },
  { emoji: "❌", label: "Incomplete (abandoned) sessions" },
];

const EFFECTIVE_TIME_POINTS = [
  {
    icon: "🎯",
    title: "Total time",
    body: "Every second from session start to end — including loading screens, pauses, and distracted moments.",
    highlight: false,
  },
  {
    icon: "⚡",
    title: "Effective time",
    body: "Time spent actively answering questions — the part that actually drives learning. This is the number we highlight.",
    highlight: true,
  },
];

const FAQ_ITEMS = [
  {
    q: "Why don't I see a percentage score for my child?",
    a: "Research consistently shows that displaying raw accuracy percentages to young learners increases anxiety and can undermine motivation. WonderQuest shows stars to children to celebrate effort and consistency. You see fuller data here — in context — because understanding supports, rather than judges.",
  },
  {
    q: "What does it mean if my child is in the P1 band but they're 8 years old?",
    a: "Bands are not grades. They reflect where WonderQuest's adaptive engine is currently challenging your child — not a judgement of where they 'should' be. Every child's learning journey is non-linear. The system will move them forward at exactly the right pace.",
  },
  {
    q: "Can the mastery score go down if my child has a bad session?",
    a: "No. The mastery score only increases or holds steady. This is intentional — learning is non-linear, and one difficult session doesn't undo weeks of real progress. If a skill drops back to 'Building', it means the system has identified a new, harder sub-skill within that topic.",
  },
  {
    q: "How long does it take to reach 'Strong' on a skill?",
    a: "It varies widely by skill difficulty and practice frequency. On average, 4–8 focused sessions (10–15 minutes each) move a new skill from 'Just started' to 'Building'. Reaching 'Strong' typically takes 2–4 more weeks of regular play. Short, frequent sessions consistently outperform long, infrequent ones.",
  },
  {
    q: "Why is effective time sometimes much lower than total time?",
    a: "Children often pause mid-session, get distracted, or leave a session open. The effective time strips all of that out, giving you a true picture of focused learning. A 20-minute total session might have 11 minutes of genuine engagement — and that 11 minutes is what moves the needle.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: C.violet,
          marginBottom: "8px",
          fontFamily: "system-ui",
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          font: "800 1.5rem/1.2 system-ui",
          color: C.text,
          margin: 0,
          marginBottom: subtitle ? "10px" : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            font: "400 0.925rem/1.65 system-ui",
            color: C.muted,
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function BandCard({
  band,
  isActive,
  activeChildName,
}: {
  band: (typeof BANDS)[0];
  isActive?: boolean;
  activeChildName?: string | null;
}) {
  return (
    <div
      style={{
        borderRadius: "16px",
        padding: "22px",
        background: isActive ? band.bg : "rgba(255,255,255,0.03)",
        border: isActive ? `2px solid ${band.color}` : `1px solid ${C.border}`,
        fontFamily: "system-ui",
        position: "relative",
      }}
    >
      {isActive && (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: 14,
            background: C.violet,
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.06em",
            padding: "3px 10px",
            borderRadius: 20,
            textTransform: "uppercase",
            fontFamily: "system-ui",
          }}
        >
          {activeChildName ? `${activeChildName}'s band` : "Your child's band"}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: band.color,
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ font: "800 1rem/1.1 system-ui", color: C.text }}>
            {band.name}
          </div>
          <div
            style={{
              font: "500 0.75rem/1 system-ui",
              color: "rgba(255,255,255,0.45)",
              marginTop: "3px",
            }}
          >
            {band.ages}
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            background: "rgba(255,255,255,0.07)",
            borderRadius: "8px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 800,
            color: band.color,
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}
        >
          {band.code}
        </div>
      </div>

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          marginBottom: "14px",
        }}
      >
        {band.skills.map((skill) => (
          <li
            key={skill}
            style={{
              font: "400 0.8rem/1.4 system-ui",
              color: "rgba(255,255,255,0.65)",
              display: "flex",
              alignItems: "baseline",
              gap: "7px",
            }}
          >
            <span
              style={{ color: band.color, fontSize: "8px", flexShrink: 0 }}
            >
              ●
            </span>
            {skill}
          </li>
        ))}
      </ul>

      <div
        style={{
          fontSize: "12px",
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.45)",
          borderTop: `1px solid ${band.border}`,
          paddingTop: "12px",
          fontStyle: "italic",
          fontFamily: "system-ui",
        }}
      >
        {band.placement}
      </div>
    </div>
  );
}

function FormulaStep({ step }: { step: (typeof FORMULA_STEPS)[0] }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "1px",
          fontFamily: "system-ui",
        }}
      >
        {step.num}
      </div>
      <div>
        <div
          style={{
            font: "700 0.875rem/1.2 system-ui",
            color: C.text,
            marginBottom: "4px",
          }}
        >
          {step.title}
        </div>
        <div
          style={{ font: "400 0.8rem/1.55 system-ui", color: C.muted }}
        >
          {step.body}
        </div>
      </div>
    </div>
  );
}

function FaqItem({
  item,
  open,
  onToggle,
}: {
  item: (typeof FAQ_ITEMS)[0];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "0",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          padding: "18px 0",
          textAlign: "left",
          fontFamily: "system-ui",
        }}
      >
        <span style={{ font: "600 0.9rem/1.4 system-ui", color: C.text }}>
          {item.q}
        </span>
        <span
          style={{
            flexShrink: 0,
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: open
              ? "rgba(155,114,255,0.25)"
              : "rgba(255,255,255,0.07)",
            color: open ? C.violet : "rgba(255,255,255,0.4)",
            fontSize: "14px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "1px",
            fontFamily: "system-ui",
          }}
        >
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div
          style={{
            font: "400 0.85rem/1.65 system-ui",
            color: "rgba(255,255,255,0.6)",
            paddingBottom: "18px",
          }}
        >
          {item.a}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── How it works steps ───────────────────────────────────────────────────────

const HOW_IT_WORKS_STEPS = [
  {
    num: "1",
    icon: "🎮",
    title: "Child plays quests",
    body: "Your child answers curriculum-aligned questions through adventures and mini-games. Each session is capped for focus — quality over quantity.",
  },
  {
    num: "2",
    icon: "🧠",
    title: "AI adapts to their level",
    body: "After each answer, WonderQuest's adaptive engine adjusts difficulty in real time — harder when they're cruising, gentler when they're struggling.",
  },
  {
    num: "3",
    icon: "📊",
    title: "You see real progress",
    body: "Your parent dashboard tracks mastery per skill across sessions, so you see genuine trends — not just one lucky or unlucky day.",
  },
  {
    num: "4",
    icon: "🏫",
    title: "Teachers get insights",
    body: "Linked teachers receive anonymised class-level signals — which skills need reinforcement — without seeing individual child scores.",
  },
];

function normaliseBandCode(raw: string | null): string | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (upper === "P0") return "PREK";
  if (upper === "P1") return "K1";
  if (upper === "P2") return "G23";
  if (upper === "P3") return "G45";
  return upper;
}

export default function ParentBenchmarksPage() {
  const router = useRouter();
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [childBand, setChildBand] = useState<string | null>(null);
  const [childName, setChildName] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parent/session")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/parent/login");
          return null;
        }
        return res.json();
      })
      .then((data: Record<string, unknown> | null) => {
        if (!data) return;
        const childObj = data?.child as Record<string, unknown> | undefined;
        const dashObj = data?.childDashboard as Record<string, unknown> | undefined;
        setChildBand(
          (childObj?.launchBandCode as string | undefined) ??
            (dashObj?.launchBandCode as string | undefined) ??
            null,
        );
        setChildName(
          (childObj?.displayName as string | undefined) ??
            (dashObj?.displayName as string | undefined) ??
            null,
        );
      })
      .catch(() => {
        // Non-fatal — page still renders without personalised band
      })
      .finally(() => setSessionLoading(false));
  }, [router]);

  const activeBandCode = normaliseBandCode(childBand);

  const sectionStyle: React.CSSProperties = {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "52px 32px",
    borderBottom: `1px solid ${C.border}`,
  };

  const cardContainerStyle: React.CSSProperties = {
    background: C.surface,
    borderRadius: "20px",
    border: `1px solid rgba(255,255,255,0.09)`,
    padding: "28px",
  };

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          paddingBottom: "80px",
          fontFamily: "system-ui",
        }}
      >
        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderBottom: `1px solid rgba(255,255,255,0.08)`,
            padding: "18px 32px 16px",
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
              color: C.violet,
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(155,114,255,0.1)",
              border: "1px solid rgba(155,114,255,0.2)",
              flexShrink: 0,
              fontFamily: "system-ui",
            }}
          >
            ← Home
          </Link>

          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.35)",
                marginBottom: "2px",
                fontFamily: "system-ui",
              }}
            >
              BENCHMARKS
            </div>
            <h1
              style={{
                font: "800 1.2rem/1 system-ui",
                color: C.text,
                margin: 0,
              }}
            >
              How WonderQuest measures progress
            </h1>
          </div>
        </div>

        {/* ── Intro strip ─────────────────────────────────────────────────── */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(155,114,255,0.12), rgba(88,232,193,0.06))",
            borderBottom: "1px solid rgba(155,114,255,0.15)",
            padding: "28px 32px",
            maxWidth: "860px",
            margin: "0 auto",
          }}
        >
          <p
            style={{
              font: "400 1rem/1.7 system-ui",
              color: "rgba(255,255,255,0.7)",
              margin: 0,
              maxWidth: "640px",
            }}
          >
            WonderQuest uses{" "}
            <strong style={{ color: C.violet }}>learning bands</strong>,{" "}
            <strong style={{ color: C.mint }}>mastery scores</strong>, and an{" "}
            <strong style={{ color: C.gold }}>adaptive AI</strong> to help
            every child build skills at their own pace. This page explains how
            it all fits together.
          </p>
        </div>

        {/* ── Section 1: How WonderQuest works ──────────────────────────────── */}
        <div style={sectionStyle}>
          <SectionHeading
            eyebrow="Section 1"
            title="How WonderQuest works"
            subtitle="Four steps from your child playing to you seeing real progress."
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.num}
                style={{
                  ...cardContainerStyle,
                  padding: "22px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontFamily: "system-ui",
                  }}
                >
                  {step.num}
                </div>
                <div style={{ fontSize: "1.4rem" }}>{step.icon}</div>
                <div style={{ font: "700 0.9rem/1.2 system-ui", color: C.text }}>
                  {step.title}
                </div>
                <div style={{ font: "400 0.8rem/1.55 system-ui", color: C.muted }}>
                  {step.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2: Learning bands ────────────────────────────────────── */}
        <div style={sectionStyle}>
          <SectionHeading
            eyebrow="Section 2"
            title="Learning Bands explained"
            subtitle="Bands are not grades — they show where the system is currently challenging your child. They move forward as your child progresses."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {BANDS.map((band) => (
              <BandCard
                key={band.code}
                band={band}
                isActive={
                  band.code === activeBandCode ||
                  (band.code === "PREK" && activeBandCode === "P0") ||
                  (band.code === "K1" && activeBandCode === "P1") ||
                  (band.code === "G23" && activeBandCode === "P2") ||
                  (band.code === "G45" && activeBandCode === "P3")
                }
                activeChildName={childName}
              />
            ))}
          </div>

          <div
            style={{
              ...cardContainerStyle,
              background: "rgba(155,114,255,0.07)",
              border: "1px solid rgba(155,114,255,0.2)",
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
            }}
          >
            <span
              style={{ fontSize: "1.3rem", flexShrink: 0, marginTop: "2px" }}
            >
              💡
            </span>
            <p
              style={{
                font: "400 0.875rem/1.6 system-ui",
                color: "rgba(255,255,255,0.6)",
                margin: 0,
              }}
            >
              <strong style={{ color: C.violet }}>
                Band placement is a starting point, not a ceiling.
              </strong>{" "}
              WonderQuest&apos;s adaptive engine continuously adjusts difficulty
              within and between bands based on your child&apos;s recent
              performance. There is no cap on how quickly a child can advance.
            </p>
          </div>
        </div>

        {/* ── Section 3: Mastery score ─────────────────────────────────────── */}
        <div style={sectionStyle}>
          <SectionHeading
            eyebrow="Section 3"
            title="How mastery is measured"
            subtitle="Mastery = 70%+ accuracy on at least 3 attempts. The score never goes down — one off session does not erase prior learning."
          />

          {/* ── Mastery visual bar ── */}
          <div
            style={{
              ...cardContainerStyle,
              marginBottom: "24px",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                font: "700 0.75rem/1 system-ui",
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "14px",
              }}
            >
              Mastery threshold — 70%
            </div>
            <div
              style={{
                height: 16,
                borderRadius: 8,
                background: "rgba(255,255,255,0.08)",
                position: "relative",
                overflow: "visible",
                marginTop: 20,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "70%",
                  background: "linear-gradient(90deg, rgba(255,209,102,0.7), rgba(255,209,102,0.4))",
                  borderRadius: "8px 0 0 8px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "70%",
                  top: 0,
                  height: "100%",
                  width: "30%",
                  background: "linear-gradient(90deg, rgba(34,197,94,0.5), rgba(34,197,94,0.8))",
                  borderRadius: "0 8px 8px 0",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "70%",
                  top: -8,
                  bottom: -8,
                  width: 2,
                  background: C.mint,
                  borderRadius: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "70%",
                  top: -26,
                  transform: "translateX(-50%)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.mint,
                  whiteSpace: "nowrap",
                  fontFamily: "system-ui",
                }}
              >
                70% mastery line
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              <span style={{ font: "600 0.75rem/1 system-ui", color: C.gold }}>
                Building (&lt;70%)
              </span>
              <span style={{ font: "600 0.75rem/1 system-ui", color: C.mint }}>
                Mastered (≥70%)
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "28px",
            }}
          >
            {/* Formula card */}
            <div style={cardContainerStyle}>
              <div
                style={{
                  font: "700 0.8rem/1 system-ui",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "20px",
                }}
              >
                How the score builds
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {FORMULA_STEPS.map((step) => (
                  <FormulaStep key={step.num} step={step} />
                ))}
              </div>
            </div>

            {/* What counts / doesn't */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ ...cardContainerStyle, flex: 1 }}>
                <div
                  style={{
                    font: "700 0.8rem/1 system-ui",
                    color: "rgba(88,232,193,0.8)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "14px",
                  }}
                >
                  What counts
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {WHAT_COUNTS.map(({ emoji, label }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        font: "400 0.85rem/1.3 system-ui",
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      <span>{emoji}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...cardContainerStyle, flex: 1 }}>
                <div
                  style={{
                    font: "700 0.8rem/1 system-ui",
                    color: "rgba(255,123,107,0.8)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "14px",
                  }}
                >
                  What doesn&apos;t count
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {WHAT_DOESNT.map(({ emoji, label }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        font: "400 0.85rem/1.3 system-ui",
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      <span>{emoji}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mastery status thresholds */}
          <div
            style={{
              font: "700 0.8rem/1 system-ui",
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "14px",
            }}
          >
            Score thresholds
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {MASTERY_THRESHOLDS.map((threshold) => (
              <div
                key={threshold.status}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  background: threshold.bg,
                  border: `1px solid ${threshold.border}`,
                }}
              >
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
                  {threshold.icon}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    flexShrink: 0,
                    minWidth: "140px",
                  }}
                >
                  <span
                    style={{
                      font: "800 0.9rem/1 system-ui",
                      color: threshold.color,
                    }}
                  >
                    {threshold.status}
                  </span>
                  <span
                    style={{
                      font: "600 0.75rem/1 system-ui",
                      color: threshold.color,
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: "20px",
                      padding: "2px 8px",
                    }}
                  >
                    {threshold.range}
                  </span>
                </div>
                <span
                  style={{
                    font: "400 0.85rem/1.5 system-ui",
                    color: C.muted,
                  }}
                >
                  {threshold.desc}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "24px",
              padding: "16px 20px",
              borderRadius: "12px",
              background: "rgba(255,209,102,0.07)",
              border: "1px solid rgba(255,209,102,0.2)",
              font: "400 0.85rem/1.6 system-ui",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <strong style={{ color: C.gold }}>
              Why don&apos;t children see percentages?
            </strong>{" "}
            Research shows that displaying raw accuracy scores to young learners
            can increase anxiety and reduce intrinsic motivation. WonderQuest
            shows stars and streaks to children — which celebrate effort and
            consistency. You see fuller data here because context helps you
            support, not judge.
          </div>
        </div>

        {/* ── Section 4: Effective time ────────────────────────────────────── */}
        <div style={sectionStyle}>
          <SectionHeading
            eyebrow="Section 4"
            title={`What "effective time" means`}
            subtitle="Not all session time is equal. Effective time shows how long your child was genuinely engaged — not counting pauses or distractions."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            {EFFECTIVE_TIME_POINTS.map((point) => (
              <div
                key={point.title}
                style={{
                  ...cardContainerStyle,
                  ...(point.highlight
                    ? {
                        background: "rgba(155,114,255,0.1)",
                        border: "1.5px solid rgba(155,114,255,0.3)",
                      }
                    : {}),
                }}
              >
                <div
                  style={{
                    font: "1.5rem/1 system-ui",
                    marginBottom: "12px",
                  }}
                >
                  {point.icon}
                </div>
                <div
                  style={{
                    font: "700 1rem/1.2 system-ui",
                    color: point.highlight ? C.violet : C.text,
                    marginBottom: "8px",
                  }}
                >
                  {point.title}
                </div>
                <p
                  style={{
                    font: "400 0.85rem/1.6 system-ui",
                    color: C.muted,
                    margin: 0,
                  }}
                >
                  {point.body}
                </p>
                {point.highlight && (
                  <div
                    style={{
                      marginTop: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(155,114,255,0.15)",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: C.violet,
                      fontFamily: "system-ui",
                    }}
                  >
                    ⚡ This is the number we highlight
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {[
              {
                label: "10–15 min",
                note: "Ideal effective time per session for ages 4–7",
                color: C.mint,
              },
              {
                label: "15–20 min",
                note: "Ideal effective time per session for ages 8–11",
                color: C.violet,
              },
              {
                label: "3–5x / week",
                note: "Optimal session frequency for lasting skill gains",
                color: C.gold,
              },
            ].map(({ label, note, color }) => (
              <div
                key={label}
                style={{
                  borderRadius: "14px",
                  padding: "18px",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    font: "800 1.4rem/1 system-ui",
                    color,
                    marginBottom: "8px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    font: "400 0.78rem/1.4 system-ui",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  {note}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 5: Your child's current band ─────────────────────────── */}
        <div style={sectionStyle}>
          <SectionHeading
            eyebrow="Section 5"
            title={childName ? `${childName}'s current band` : "Your child's current band"}
            subtitle="A personalised look at where your child is right now in the WonderQuest curriculum."
          />
          {sessionLoading ? (
            <div
              style={{
                font: "400 0.9rem/1.5 system-ui",
                color: C.muted,
                padding: "20px 0",
              }}
            >
              Loading…
            </div>
          ) : activeBandCode ? (
            (() => {
              const ab = BANDS.find(
                (b) =>
                  b.code === activeBandCode ||
                  (b.code === "PREK" && activeBandCode === "P0") ||
                  (b.code === "K1" && activeBandCode === "P1") ||
                  (b.code === "G23" && activeBandCode === "P2") ||
                  (b.code === "G45" && activeBandCode === "P3"),
              );
              if (!ab) return null;
              return (
                <div
                  style={{
                    borderRadius: 16,
                    padding: "28px 24px",
                    background: ab.bg,
                    border: `2px solid ${ab.color}`,
                    maxWidth: 560,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: ab.color,
                      }}
                    />
                    <div>
                      <div style={{ font: "800 1.1rem/1.1 system-ui", color: C.text }}>
                        {ab.name}
                      </div>
                      <div
                        style={{
                          font: "500 0.8rem/1 system-ui",
                          color: "rgba(255,255,255,0.45)",
                          marginTop: 3,
                        }}
                      >
                        {ab.ages}
                      </div>
                    </div>
                    <div
                      style={{
                        marginLeft: "auto",
                        background: C.violet,
                        borderRadius: 20,
                        padding: "4px 14px",
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "0.04em",
                        flexShrink: 0,
                        fontFamily: "system-ui",
                      }}
                    >
                      {ab.code}
                    </div>
                  </div>
                  <div
                    style={{
                      font: "700 0.8rem/1 system-ui",
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 10,
                    }}
                  >
                    Currently working on
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      marginBottom: 18,
                    }}
                  >
                    {ab.skills.map((skill) => (
                      <li
                        key={skill}
                        style={{
                          font: "400 0.875rem/1.4 system-ui",
                          color: "rgba(255,255,255,0.75)",
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{ color: ab.color, fontSize: 9, flexShrink: 0 }}
                        >
                          ●
                        </span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()
          ) : (
            <div
              style={{
                font: "400 0.9rem/1.6 system-ui",
                color: C.muted,
                padding: "16px 20px",
                background: C.surface,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                maxWidth: 480,
              }}
            >
              Band information is not available yet. Once your child completes their
              first session, their learning band will appear here.
            </div>
          )}
        </div>

        {/* ── Section 6: FAQ ───────────────────────────────────────────────── */}
        <div style={{ ...sectionStyle, borderBottom: "none" }}>
          <SectionHeading
            eyebrow="Section 6"
            title="Common questions"
            subtitle="Answers to questions parents ask most often about how WonderQuest measures and reports progress."
          />

          <div style={cardContainerStyle}>
            {FAQ_ITEMS.map((item, idx) => (
              <FaqItem
                key={idx}
                item={item}
                open={openFaqIdx === idx}
                onToggle={() =>
                  setOpenFaqIdx(openFaqIdx === idx ? null : idx)
                }
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              padding: "22px 24px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, rgba(155,114,255,0.12), rgba(88,232,193,0.06))",
              border: "1px solid rgba(155,114,255,0.2)",
            }}
          >
            <div>
              <div
                style={{
                  font: "700 0.95rem/1.2 system-ui",
                  color: C.text,
                  marginBottom: "4px",
                }}
              >
                Ready to see your child&apos;s current progress?
              </div>
              <div
                style={{
                  font: "400 0.83rem/1.4 system-ui",
                  color: C.muted,
                }}
              >
                Head back home for live stats and this week&apos;s highlights.
              </div>
            </div>
            <Link
              href="/parent"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
                color: "#fff",
                font: "700 0.875rem/1 system-ui",
                padding: "11px 22px",
                borderRadius: "10px",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              ← Home
            </Link>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
