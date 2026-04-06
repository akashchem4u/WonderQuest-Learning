import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard } from "@/components/ui";
import { hasTeacherAccess, isTeacherAccessConfigured } from "@/lib/teacher-access";
import TeacherGate from "@/app/teacher/teacher-gate";

export const dynamic = "force-dynamic";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  mint: "#58e8c1",
  violet: "#9b72ff",
  gold: "#ffd166",
  coral: "#ff7b6b",
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.1)",
  text: "#ffffff",
  muted: "rgba(216,240,234,0.6)",
  amber: "#f59e0b",
  amberBg: "rgba(245,158,11,0.12)",
  amberBorder: "rgba(245,158,11,0.35)",
  blue: "#3b82f6",
  blueBg: "rgba(59,130,246,0.12)",
  blueBorder: "rgba(59,130,246,0.35)",
};

// ── Shared style objects ──────────────────────────────────────────────────────
const glassCard: React.CSSProperties = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 16,
  padding: "20px 24px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: C.mint,
  marginBottom: 6,
};

const chipStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 700,
  background: "rgba(255,255,255,0.08)",
  border: `1px solid ${C.cardBorder}`,
  color: C.muted,
};

// ── Stub data ─────────────────────────────────────────────────────────────────
type TriggerType = "confidence-floor" | "absence" | "hint-pattern" | "band-ceiling";
type SupportTier = "needs-support" | "watch" | "on-track" | "strong";

type Student = {
  id: string;
  name: string;
  band: string;
  bandLabel: string;
  topStruggleSkill: string;
  accuracy: number;
  lastSession: string;
  tier: SupportTier;
  trigger: TriggerType;
  triggerDetail: string;
  triggeredAt: string;
};

const STUDENTS: Student[] = [
  {
    id: "student-jordan",
    name: "Jordan",
    band: "P2",
    bandLabel: "G2–3",
    topStruggleSkill: "Fractions: Division",
    accuracy: 44,
    lastSession: "2 days ago",
    tier: "needs-support",
    trigger: "confidence-floor",
    triggerDetail: "Confidence floor hit 3× on Fractions: Division this week",
    triggeredAt: "2 days ago",
  },
  {
    id: "student-priya",
    name: "Priya",
    band: "P1",
    bandLabel: "K–1",
    topStruggleSkill: "Counting: Skip Count",
    accuracy: 51,
    lastSession: "5 days ago",
    tier: "needs-support",
    trigger: "absence",
    triggerDetail: "No sessions in 5 days — last active Thursday",
    triggeredAt: "5 days ago",
  },
  {
    id: "student-sam",
    name: "Sam",
    band: "P2",
    bandLabel: "G2–3",
    topStruggleSkill: "Place Value: Hundreds",
    accuracy: 48,
    lastSession: "Today",
    tier: "needs-support",
    trigger: "hint-pattern",
    triggerDetail: "5+ hint requests on Place Value: Hundreds this week",
    triggeredAt: "Today",
  },
  {
    id: "student-maya",
    name: "Maya",
    band: "P2",
    bandLabel: "G2–3",
    topStruggleSkill: "Addition: Regrouping",
    accuracy: 57,
    lastSession: "Yesterday",
    tier: "watch",
    trigger: "hint-pattern",
    triggerDetail: "Repeated hints on Addition: Regrouping — 4 this week",
    triggeredAt: "Yesterday",
  },
  {
    id: "student-alex",
    name: "Alex",
    band: "P1",
    bandLabel: "K–1",
    topStruggleSkill: "Shapes: Attributes",
    accuracy: 63,
    lastSession: "Today",
    tier: "watch",
    trigger: "confidence-floor",
    triggerDetail: "Confidence floor hit 2× on Shapes: Attributes",
    triggeredAt: "3 days ago",
  },
  {
    id: "student-marcus",
    name: "Marcus",
    band: "P2",
    bandLabel: "G2–3",
    topStruggleSkill: "Multiplication: Arrays",
    accuracy: 88,
    lastSession: "Today",
    tier: "strong",
    trigger: "band-ceiling",
    triggerDetail: "Consistently reaching P2 ceiling — ready to advance to P3",
    triggeredAt: "3 weeks ago",
  },
  {
    id: "student-lily",
    name: "Lily",
    band: "P3",
    bandLabel: "G4–5",
    topStruggleSkill: "Division: Long Form",
    accuracy: 79,
    lastSession: "Yesterday",
    tier: "on-track",
    trigger: "absence",
    triggerDetail: "Missed 2 sessions this week — usually active daily",
    triggeredAt: "2 days ago",
  },
  {
    id: "student-noah",
    name: "Noah",
    band: "P2",
    bandLabel: "G2–3",
    topStruggleSkill: "Subtraction: Borrowing",
    accuracy: 70,
    lastSession: "Today",
    tier: "on-track",
    trigger: "confidence-floor",
    triggerDetail: "Confidence floor hit 1× on Subtraction: Borrowing",
    triggeredAt: "Today",
  },
  {
    id: "student-sofia",
    name: "Sofia",
    band: "P3",
    bandLabel: "G4–5",
    topStruggleSkill: "Fractions: Comparing",
    accuracy: 91,
    lastSession: "Today",
    tier: "strong",
    trigger: "band-ceiling",
    triggerDetail: "Mastery signals strong across all P3 skills — candidate for P4",
    triggeredAt: "1 week ago",
  },
];

// ── Derived stats ─────────────────────────────────────────────────────────────
const needsSupportCount = STUDENTS.filter((s) => s.tier === "needs-support").length;
const watchCount = STUDENTS.filter((s) => s.tier === "watch").length;
const strongCount = STUDENTS.filter((s) => s.tier === "strong").length;

// ── Trigger helpers ───────────────────────────────────────────────────────────
function getTriggerIcon(trigger: TriggerType) {
  if (trigger === "confidence-floor") return "⚠️";
  if (trigger === "absence") return "📅";
  if (trigger === "hint-pattern") return "💡";
  return "💙";
}

function getTriggerLabel(trigger: TriggerType) {
  if (trigger === "confidence-floor") return "Confidence floor";
  if (trigger === "absence") return "Absence";
  if (trigger === "hint-pattern") return "Hint pattern";
  return "Band ceiling";
}

function getTierLabel(tier: SupportTier) {
  if (tier === "needs-support") return "Needs Support";
  if (tier === "watch") return "Watch Closely";
  if (tier === "on-track") return "On Track";
  return "Strong";
}

function getTierColor(tier: SupportTier) {
  if (tier === "needs-support") return C.coral;
  if (tier === "watch") return C.gold;
  if (tier === "on-track") return C.mint;
  return C.violet;
}

function isBandCeiling(s: Student) {
  return s.trigger === "band-ceiling";
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
type FilterTab = "all" | "needs-support" | "watch" | "on-track" | "strong";

type SupportQueuePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : value?.[0];
}

export default async function TeacherSupportQueuePage({
  searchParams,
}: SupportQueuePageProps) {
  const configured = isTeacherAccessConfigured();
  const unlocked = await hasTeacherAccess();

  // ── Gate ───────────────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <main
          style={{
            minHeight: "100vh",
            background: C.base,
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <section style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 560 }}>
            <span style={eyebrowStyle}>Teacher dashboard</span>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1.2 }}>
              Access your support queue.
            </h1>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
              This view shows students who need your attention — separated from individual
              family views.
            </p>
          </section>

          <div style={{ ...glassCard, maxWidth: 480 }}>
            <ShellCard
              className="shell-card-emphasis"
              eyebrow="Teacher"
              title="Unlock teacher dashboard"
            >
              <TeacherGate configured={configured} />
            </ShellCard>
          </div>
        </main>
      </AppFrame>
    );
  }

  // ── Resolve filter param ──────────────────────────────────────────────────
  const resolvedParams = searchParams ? await searchParams : {};
  const rawFilter = getSingleParam(resolvedParams.filter);
  const activeFilter: FilterTab =
    rawFilter === "needs-support" ||
    rawFilter === "watch" ||
    rawFilter === "on-track" ||
    rawFilter === "strong"
      ? rawFilter
      : "all";

  const visibleStudents =
    activeFilter === "all"
      ? STUDENTS
      : STUDENTS.filter((s) => s.tier === activeFilter);

  // ── Page ──────────────────────────────────────────────────────────────────
  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <main
        style={{
          minHeight: "100vh",
          background: C.base,
          padding: "28px 24px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >

        {/* ── Header ────────────────────────────────────────────────────── */}
        <section style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Link
            href="/teacher"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.muted,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 4,
            }}
          >
            ← Classroom Board
          </Link>
          <span style={eyebrowStyle}>Support Queue</span>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: C.text,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Students who need your attention
          </h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginTop: 4 }}>
            Queue updates automatically as new triggers are detected. Skill-pattern data only — no specific answers surfaced.
          </p>
        </section>

        {/* ── Stat tiles ────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          {/* Needs support */}
          <div
            style={{
              ...glassCard,
              borderLeft: `3px solid ${C.coral}`,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.coral }}>
              Needs Support
            </span>
            <span style={{ fontSize: 36, fontWeight: 900, color: C.text, lineHeight: 1 }}>
              {needsSupportCount}
            </span>
            <span style={{ fontSize: 12, color: C.muted }}>students flagged</span>
          </div>

          {/* Watching */}
          <div
            style={{
              ...glassCard,
              borderLeft: `3px solid ${C.gold}`,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold }}>
              Watch Closely
            </span>
            <span style={{ fontSize: 36, fontWeight: 900, color: C.text, lineHeight: 1 }}>
              {watchCount}
            </span>
            <span style={{ fontSize: 12, color: C.muted }}>monitor this week</span>
          </div>

          {/* Strong */}
          <div
            style={{
              ...glassCard,
              borderLeft: `3px solid ${C.violet}`,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.violet }}>
              Strong
            </span>
            <span style={{ fontSize: 36, fontWeight: 900, color: C.text, lineHeight: 1 }}>
              {strongCount}
            </span>
            <span style={{ fontSize: 12, color: C.muted }}>at or above ceiling</span>
          </div>
        </div>

        {/* ── Main layout: list + right rail ────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr minmax(0, 280px)",
            gap: 20,
            alignItems: "start",
          }}
        >

          {/* ── Left: filter tabs + student cards ─────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Filter tabs */}
            <div
              role="tablist"
              aria-label="Filter students by tier"
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {(
                [
                  { id: "all", label: "All" },
                  { id: "needs-support", label: "Needs Support" },
                  { id: "watch", label: "Watch Closely" },
                  { id: "on-track", label: "On Track" },
                  { id: "strong", label: "Strong" },
                ] as { id: FilterTab; label: string }[]
              ).map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={tab.id === "all" ? "/teacher/support" : `/teacher/support?filter=${tab.id}`}
                    role="tab"
                    aria-selected={isActive}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: "none",
                      border: `1.5px solid ${isActive ? C.mint : C.cardBorder}`,
                      background: isActive ? "rgba(88,232,193,0.15)" : C.cardBg,
                      color: isActive ? C.mint : C.muted,
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            {/* Student cards list */}
            {visibleStudents.length === 0 ? (
              <div
                style={{
                  ...glassCard,
                  textAlign: "center",
                  padding: "48px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 40 }}>🎉</span>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, margin: 0 }}>
                  All clear!
                </h2>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, maxWidth: 320 }}>
                  No students in this tier right now. The queue updates automatically when new triggers are detected.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {visibleStudents.map((student) => {
                  const isCeiling = isBandCeiling(student);
                  const accentColor = isCeiling ? C.blue : C.amber;
                  const accentBg = isCeiling ? C.blueBg : C.amberBg;
                  const accentBorder = isCeiling ? C.blueBorder : C.amberBorder;
                  const tierColor = getTierColor(student.tier);

                  return (
                    <div
                      key={student.id}
                      style={{
                        background: C.cardBg,
                        border: `1px solid ${C.cardBorder}`,
                        borderLeft: `4px solid ${accentColor}`,
                        borderRadius: 14,
                        padding: "18px 20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {/* Card header row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        {/* Trigger icon */}
                        <span
                          style={{
                            fontSize: 22,
                            flexShrink: 0,
                            marginTop: 1,
                            lineHeight: 1,
                          }}
                          aria-hidden="true"
                        >
                          {getTriggerIcon(student.trigger)}
                        </span>

                        {/* Name + trigger detail + chips */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <span
                              style={{
                                fontSize: 15,
                                fontWeight: 800,
                                color: C.text,
                              }}
                            >
                              {student.name}
                            </span>
                            {/* Band chip */}
                            <span
                              style={{
                                ...chipStyle,
                                fontSize: 10,
                                padding: "2px 9px",
                              }}
                            >
                              {student.band} · {student.bandLabel}
                            </span>
                            {/* Tier chip */}
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 9px",
                                borderRadius: 20,
                                fontSize: 10,
                                fontWeight: 700,
                                background: `${tierColor}1a`,
                                border: `1px solid ${tierColor}55`,
                                color: tierColor,
                              }}
                            >
                              {getTierLabel(student.tier)}
                            </span>
                          </div>

                          <p
                            style={{
                              fontSize: 12,
                              color: C.muted,
                              margin: 0,
                              lineHeight: 1.4,
                            }}
                          >
                            {student.triggerDetail}
                          </p>

                          {/* Meta chips */}
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 9px",
                                borderRadius: 20,
                                fontSize: 10,
                                fontWeight: 700,
                                background: accentBg,
                                border: `1px solid ${accentBorder}`,
                                color: accentColor,
                              }}
                            >
                              {getTriggerLabel(student.trigger)}
                            </span>
                            <span style={{ ...chipStyle, fontSize: 10, padding: "2px 9px" }}>
                              Top struggle: {student.topStruggleSkill}
                            </span>
                            <span style={{ ...chipStyle, fontSize: 10, padding: "2px 9px" }}>
                              Accuracy {student.accuracy}%
                            </span>
                            <span style={{ ...chipStyle, fontSize: 10, padding: "2px 9px" }}>
                              Last session: {student.lastSession}
                            </span>
                          </div>
                        </div>

                        {/* Right: triggered time + action */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 8,
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>
                            {student.triggeredAt}
                          </span>
                          <Link
                            href={`/teacher/students/${student.id}`}
                            style={{
                              padding: "7px 14px",
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 700,
                              textDecoration: "none",
                              background: isCeiling
                                ? "rgba(59,130,246,0.2)"
                                : "rgba(88,232,193,0.15)",
                              border: `1px solid ${isCeiling ? C.blueBorder : "rgba(88,232,193,0.35)"}`,
                              color: isCeiling ? C.blue : C.mint,
                              whiteSpace: "nowrap",
                            }}
                          >
                            View details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right rail ────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Quick actions */}
            <div style={{ ...glassCard, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: C.mint,
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Quick Actions
                </span>
              </div>

              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: `1.5px solid rgba(88,232,193,0.35)`,
                  background: "rgba(88,232,193,0.1)",
                  color: C.mint,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span aria-hidden="true">👥</span>
                Assign group session
              </button>

              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: `1.5px solid rgba(255,209,102,0.35)`,
                  background: "rgba(255,209,102,0.1)",
                  color: C.gold,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span aria-hidden="true">📝</span>
                Send parent note
              </button>
            </div>

            {/* Class health summary */}
            <div style={{ ...glassCard, display: "flex", flexDirection: "column", gap: 14 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: C.mint,
                }}
              >
                Class Health
              </span>

              {(
                [
                  {
                    label: "Needs Support",
                    count: needsSupportCount,
                    total: STUDENTS.length,
                    color: C.coral,
                  },
                  {
                    label: "Watch Closely",
                    count: watchCount,
                    total: STUDENTS.length,
                    color: C.gold,
                  },
                  {
                    label: "On Track",
                    count: STUDENTS.filter((s) => s.tier === "on-track").length,
                    total: STUDENTS.length,
                    color: C.mint,
                  },
                  {
                    label: "Strong",
                    count: strongCount,
                    total: STUDENTS.length,
                    color: C.violet,
                  },
                ] as { label: string; count: number; total: number; color: string }[]
              ).map(({ label, count, total, color }) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>
                        {label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>
                        {count}
                        <span style={{ fontSize: 10, fontWeight: 400, color: C.muted }}>
                          {" "}/ {total}
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 5,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          borderRadius: 3,
                          background: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <Link
                href="/teacher"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.muted,
                  textDecoration: "none",
                  padding: "8px 0",
                  borderTop: `1px solid ${C.cardBorder}`,
                  marginTop: 2,
                }}
              >
                View full classroom board →
              </Link>
            </div>

          </div>
        </div>
      </main>
    </AppFrame>
  );
}
