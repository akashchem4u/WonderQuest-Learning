"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  violet: "#9b72ff",
  violetDim: "rgba(155,114,255,0.12)",
  mint: "#22c55e",
  mintDim: "rgba(34,197,94,0.10)",
  mintBorder: "rgba(34,197,94,0.25)",
  coral: "#f87171",
  coralDim: "rgba(248,113,113,0.10)",
  coralBorder: "rgba(248,113,113,0.25)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  faint: "rgba(255,255,255,0.08)",
  border: "rgba(155,114,255,0.2)",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────

type RawSkill = {
  skillCode?: string;
  displayName?: string;
  skillName?: string;
  subjectCode?: string;
  launchBandCode?: string;
  masteryScore?: number;
  masteryPct?: number;
  attempts?: number;
};

type ChildRecord = {
  displayName?: string;
};

type SkillsPayload = {
  child?: ChildRecord;
  skills?: RawSkill[];
};

type NormSkill = {
  skillCode: string;
  skillName: string;
  subjectCode: string;
  bandCode: string;
  masteryPct: number;
};

// ── Normalise ──────────────────────────────────────────────────────────────

function normalise(raw: RawSkill): NormSkill {
  return {
    skillCode: raw.skillCode ?? "",
    skillName: raw.displayName ?? raw.skillName ?? raw.skillCode ?? "Unknown skill",
    subjectCode: raw.subjectCode ?? "",
    bandCode: raw.launchBandCode ?? "",
    masteryPct: Math.round(raw.masteryScore ?? raw.masteryPct ?? 0),
  };
}

// ── Practice tip ──────────────────────────────────────────────────────────

function getPracticeTip(skillName: string, _bandCode: string): string {
  const name = skillName.toLowerCase();
  if (name.includes("count")) return "Count objects around the house together — toys, steps, snacks!";
  if (name.includes("letter") || name.includes("phonics")) return "Point out letters on cereal boxes or street signs.";
  if (name.includes("shape")) return "Find shapes in everyday objects — circle plates, square windows.";
  if (name.includes("add") || name.includes("sum")) return "Use fingers or small objects to add numbers while cooking.";
  if (name.includes("subtract") || name.includes("minus")) return "Play 'take away' games with snacks or toys.";
  if (name.includes("read") || name.includes("word")) return "Read 2 pages of a book together before bedtime.";
  if (name.includes("pattern")) return "Make patterns with colored blocks or crayons.";
  if (name.includes("time") || name.includes("clock")) return "Point to the clock and say the time together twice a day.";
  if (name.includes("fraction")) return "Cut a sandwich in half and talk about halves and quarters.";
  if (name.includes("multiply")) return "Count by 2s or 5s while walking or doing chores.";
  return `Spend 5 minutes practicing ${name} together today.`;
}

// ── Categorise skills ──────────────────────────────────────────────────────

function categorise(skills: NormSkill[]) {
  const strengths = skills.filter((s) => s.masteryPct >= 70);
  const needsWork = skills.filter((s) => s.masteryPct < 40);
  return { strengths, needsWork };
}

// ── Cookie helper ──────────────────────────────────────────────────────────

function getStudentIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("wonderquest-child-id="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 800,
        textTransform: "uppercase" as const,
        letterSpacing: "0.07em",
        color: C.muted,
        marginBottom: 12,
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
        height: 6,
        background: C.faint,
        borderRadius: 4,
        overflow: "hidden",
        marginTop: 6,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: color,
          borderRadius: 4,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

function FocusSkillCard({ skill }: { skill: NormSkill }) {
  const tip = getPracticeTip(skill.skillName, skill.bandCode);
  const playHref = `/child?manual=1&skill=${encodeURIComponent(skill.skillCode)}`;
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.coralBorder}`,
        borderRadius: 16,
        padding: "16px 18px",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{skill.skillName}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.coral, flexShrink: 0 }}>
          {skill.masteryPct}%
        </div>
      </div>
      <MasteryBar pct={skill.masteryPct} color={C.coral} />
      <div
        style={{
          marginTop: 10,
          fontSize: 13,
          color: "rgba(255,255,255,0.7)",
          lineHeight: 1.55,
          background: C.coralDim,
          border: `1px solid ${C.coralBorder}`,
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        {tip}
      </div>
      <Link
        href={playHref}
        style={{
          display: "inline-block",
          marginTop: 10,
          padding: "7px 16px",
          background: C.coralDim,
          border: `1px solid ${C.coralBorder}`,
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          color: C.coral,
          textDecoration: "none",
        }}
      >
        Add to play session
      </Link>
    </div>
  );
}

function StrengthChip({ skill }: { skill: NormSkill }) {
  return (
    <div
      style={{
        background: C.mintDim,
        border: `1px solid ${C.mintBorder}`,
        borderRadius: 12,
        padding: "10px 14px",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{skill.skillName}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.mint, flexShrink: 0 }}>
          {skill.masteryPct}%
        </div>
      </div>
      <MasteryBar pct={skill.masteryPct} color={C.mint} />
    </div>
  );
}

const DAILY_IDEAS = [
  { icon: "📖", title: "Bedtime reading", desc: "Read 2 pages of a favourite book together before sleep." },
  { icon: "🔢", title: "Counting walk", desc: "Count steps, cars, or birds on your next walk together." },
  { icon: "🏷", title: "Alphabet hunt", desc: "Spot and name letters on labels, signs, or packaging." },
  { icon: "🧩", title: "Shape game", desc: "Name 5 shapes you can find around the house right now." },
  { icon: "🍎", title: "Kitchen maths", desc: "Count and add fruit or snacks while preparing a meal." },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function ParentPracticePage() {
  const [skills, setSkills] = useState<NormSkill[]>([]);
  const [childName, setChildName] = useState<string>("your child");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const studentId =
      getStudentIdFromCookie() ??
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("studentId") ??
          localStorage.getItem("wq_active_student_id")
        : null);

    if (!studentId) {
      setError("No child selected. Please select a child from your dashboard.");
      setLoading(false);
      return;
    }

    fetch(`/api/parent/skills?childId=${encodeURIComponent(studentId)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Failed to load skills (${res.status})`);
        }
        return res.json() as Promise<SkillsPayload>;
      })
      .then((data) => {
        if (data.child?.displayName) setChildName(data.child.displayName.split(" ")[0]);
        const raw: RawSkill[] = data.skills ?? [];
        setSkills(raw.map(normalise));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load skill data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const { strengths, needsWork } = categorise(skills);
  const focusSkills = needsWork.slice(0, 5);
  const strengthDisplay = strengths.slice(0, 3);
  const hasData = skills.length > 0;

  return (
    <AppFrame audience="parent" currentPath="/parent/practice">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          padding: "28px 20px 72px",
          fontFamily: "system-ui,-apple-system,sans-serif",
          color: C.text,
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        {/* Back nav */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/parent"
            style={{ color: C.violet, fontWeight: 700, fontSize: 13, textDecoration: "none" }}
          >
            &larr; Dashboard
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 4 }}>
            Practice Ideas
          </h1>
          {!loading && !error && (
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
              Based on {childName}&apos;s recent learning
            </p>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 32,
              textAlign: "center",
              color: C.muted,
              fontSize: 14,
            }}
          >
            Loading practice suggestions...
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            style={{
              background: C.coralDim,
              border: `1px solid ${C.coralBorder}`,
              borderRadius: 14,
              padding: "16px 20px",
              fontSize: 14,
              color: C.coral,
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !hasData && (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              No practice data yet
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
              Play a few sessions first and we&apos;ll suggest personalised practice ideas!
            </div>
            <Link
              href="/child"
              style={{
                display: "inline-block",
                padding: "10px 24px",
                background: C.violet,
                color: "#fff",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Start playing
            </Link>
          </div>
        )}

        {/* Main content */}
        {!loading && !error && hasData && (
          <>
            {/* Section 1: Focus areas this week */}
            <div style={{ marginBottom: 32 }}>
              <SectionHeading>Focus areas this week</SectionHeading>

              {focusSkills.length === 0 ? (
                <div
                  style={{
                    background: C.mintDim,
                    border: `1px solid ${C.mintBorder}`,
                    borderRadius: 14,
                    padding: "16px 20px",
                    fontSize: 14,
                    color: C.mint,
                  }}
                >
                  {childName}&apos;s looking strong across all skills — no focus areas right now!
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
                    These skills need the most practice. Each card includes a friendly tip you can try at home.
                  </div>
                  {focusSkills.map((skill) => (
                    <FocusSkillCard key={skill.skillCode} skill={skill} />
                  ))}
                </>
              )}
            </div>

            {/* Section 2: Building on strengths */}
            {strengthDisplay.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <SectionHeading>Building on strengths</SectionHeading>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
                  {childName} is doing well in these areas — keep celebrating the wins!
                </div>
                {strengthDisplay.map((skill) => (
                  <StrengthChip key={skill.skillCode} skill={skill} />
                ))}
              </div>
            )}

            {/* Section 3: 5-minute daily ideas */}
            <div style={{ marginBottom: 32 }}>
              <SectionHeading>5-minute daily ideas</SectionHeading>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
                Quick activities that fit into any day — no prep needed.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DAILY_IDEAS.map((idea) => (
                  <div
                    key={idea.title}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 14,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: C.violetDim,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {idea.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}
                      >
                        {idea.title}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                        {idea.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer links */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Link
                href="/parent/report"
                style={{ fontSize: 13, fontWeight: 700, color: C.violet, textDecoration: "none" }}
              >
                Full report
              </Link>
              <Link
                href="/parent/skills"
                style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none" }}
              >
                All skills
              </Link>
              <Link
                href="/parent/planner"
                style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none" }}
              >
                Practice planner
              </Link>
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
