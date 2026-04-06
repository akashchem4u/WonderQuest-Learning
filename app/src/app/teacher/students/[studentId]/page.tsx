import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard, StatTile } from "@/components/ui";
import { hasTeacherAccess, isTeacherAccessConfigured } from "@/lib/teacher-access";
import TeacherGate from "@/app/teacher/teacher-gate";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Colour palette (design spec)
// ---------------------------------------------------------------------------
const MINT = "#58e8c1";
const VIOLET = "#9b72ff";
const GOLD = "#ffd166";
const CORAL = "#ff7b6b";

// ---------------------------------------------------------------------------
// Stub data helpers
// ---------------------------------------------------------------------------

type SkillStatus = "strong" | "building" | "started";

type SkillEntry = {
  name: string;
  score: number;
  status: SkillStatus;
};

type SessionEntry = {
  date: string;
  skill: string;
  stars: number;
  perfect: boolean;
};

type WeekDay = {
  label: string;
  count: number;
};

type StudentStub = {
  name: string;
  initials: string;
  avatarColor: string;
  band: string;
  bandColor: string;
  activeSince: string;
  starsThisWeek: number;
  sessionsThisWeek: number;
  streak: number;
  strongSkillsCount: number;
  inQueue: boolean;
  queueNote: string;
  skills: SkillEntry[];
  sessions: SessionEntry[];
  weekActivity: WeekDay[];
  bandInfo: string;
  interventionHistory: string[];
  recommendedActions: string[];
  teacherNote: string;
};

function deriveStudentStub(studentId: string): StudentStub {
  // Use a simple hash of the id to deterministically vary stub data
  const hash = [...studentId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const variant = hash % 3;

  const variants: StudentStub[] = [
    {
      name: "Jordan",
      initials: "J",
      avatarColor: "#475569",
      band: "P2 · G2–3",
      bandColor: MINT,
      activeSince: "Sep 2025",
      starsThisWeek: 14,
      sessionsThisWeek: 4,
      streak: 1,
      strongSkillsCount: 2,
      inQueue: true,
      queueNote: "Confidence floor 3× on Fractions: Division",
      skills: [
        { name: "Fractions: Addition", score: 51, status: "building" },
        { name: "Fractions: Division", score: 32, status: "started" },
        { name: "Place Value: Tens", score: 74, status: "strong" },
        { name: "Addition: Regrouping", score: 68, status: "strong" },
        { name: "Multiplication: ×2–×5", score: 44, status: "building" },
      ],
      sessions: [
        { date: "Today", skill: "Fractions: Addition", stars: 4, perfect: false },
        { date: "Today", skill: "Fractions: Division", stars: 2, perfect: false },
        { date: "Yesterday", skill: "Multiplication: ×2–×5", stars: 6, perfect: true },
        { date: "Mon", skill: "Place Value: Tens", stars: 5, perfect: false },
      ],
      weekActivity: [
        { label: "Mon", count: 1 },
        { label: "Tue", count: 2 },
        { label: "Wed", count: 0 },
        { label: "Thu", count: 0 },
        { label: "Fri", count: 1 },
      ],
      bandInfo: "P2 maps to Grade 2–3 curriculum level. Focus areas: fractions foundations, two-digit operations.",
      interventionHistory: [
        "Week of Mar 17 — Added to support queue: confidence floor on Fractions: Division",
        "Week of Mar 10 — Teacher note: introduced visual model for equal parts",
      ],
      recommendedActions: [
        "Review Fractions: Division over next 2 sessions",
        "Consider visual manipulatives (fraction tiles) for equal-parts concept",
        "Monitor Multiplication: ×2–×5 progress before advancing",
      ],
      teacherNote:
        "Spoke with Jordan on Wednesday. They mentioned fractions are confusing — specifically the equal parts idea. Suggested visual model (pizza slices). Will monitor progress over next 2 sessions before escalating.",
    },
    {
      name: "Bella",
      initials: "B",
      avatarColor: CORAL,
      band: "P3 · G4–5",
      bandColor: CORAL,
      activeSince: "Sep 2025",
      starsThisWeek: 52,
      sessionsThisWeek: 14,
      streak: 7,
      strongSkillsCount: 5,
      inQueue: false,
      queueNote: "",
      skills: [
        { name: "Long Division", score: 88, status: "strong" },
        { name: "Fractions: Comparing", score: 82, status: "strong" },
        { name: "Word Problems: Multi-step", score: 74, status: "strong" },
        { name: "Algebra: Basic expressions", score: 62, status: "building" },
        { name: "Geometry: Perimeter", score: 55, status: "building" },
      ],
      sessions: [
        { date: "Today", skill: "Long Division", stars: 10, perfect: true },
        { date: "Today", skill: "Algebra: Basic expressions", stars: 8, perfect: false },
        { date: "Yesterday", skill: "Fractions: Comparing", stars: 12, perfect: true },
        { date: "Tue", skill: "Word Problems: Multi-step", stars: 9, perfect: false },
      ],
      weekActivity: [
        { label: "Mon", count: 2 },
        { label: "Tue", count: 3 },
        { label: "Wed", count: 2 },
        { label: "Thu", count: 3 },
        { label: "Fri", count: 2 },
      ],
      bandInfo: "P3 maps to Grade 4–5 curriculum level. High performer — approaching advanced topics.",
      interventionHistory: [
        "No support queue entries. On track across all skills.",
      ],
      recommendedActions: [
        "Consider unlocking P4 challenge content",
        "Algebra: Basic expressions needs 2–3 more strong sessions before advancing",
      ],
      teacherNote: "Bella is excelling across all skill areas. Recommend discussing stretch goals next check-in.",
    },
    {
      name: "Marcus",
      initials: "M",
      avatarColor: VIOLET,
      band: "P1 · G1–2",
      bandColor: VIOLET,
      activeSince: "Oct 2025",
      starsThisWeek: 8,
      sessionsThisWeek: 2,
      streak: 0,
      strongSkillsCount: 1,
      inQueue: true,
      queueNote: "Low session frequency — below 3 sessions per week for 2 weeks",
      skills: [
        { name: "Counting: to 100", score: 78, status: "strong" },
        { name: "Addition: Single digit", score: 45, status: "building" },
        { name: "Subtraction: Basics", score: 28, status: "started" },
        { name: "Shapes: 2D recognition", score: 33, status: "started" },
      ],
      sessions: [
        { date: "Yesterday", skill: "Addition: Single digit", stars: 4, perfect: false },
        { date: "Mon", skill: "Counting: to 100", stars: 5, perfect: false },
      ],
      weekActivity: [
        { label: "Mon", count: 1 },
        { label: "Tue", count: 0 },
        { label: "Wed", count: 0 },
        { label: "Thu", count: 1 },
        { label: "Fri", count: 0 },
      ],
      bandInfo: "P1 maps to Grade 1–2 curriculum level. Building foundational number sense.",
      interventionHistory: [
        "Week of Mar 24 — Flagged for low engagement (< 3 sessions / week)",
        "Week of Mar 17 — Same low-frequency flag",
      ],
      recommendedActions: [
        "Check in with family about device access or schedule barriers",
        "Prioritise short daily sessions over longer infrequent ones",
        "Subtraction: Basics — may benefit from physical manipulatives at home",
      ],
      teacherNote: "Marcus is quiet in class but engaged when one-on-one. Worth a brief check-in to see if anything is blocking home practice.",
    },
  ];

  return variants[variant];
}

function skillBarColor(status: SkillStatus): string {
  if (status === "strong") return MINT;
  if (status === "building") return VIOLET;
  return "#4a4a6a";
}

function skillStatusLabel(status: SkillStatus): string {
  if (status === "strong") return "Strong";
  if (status === "building") return "Building";
  return "Just started";
}

function skillStatusStyle(status: SkillStatus): React.CSSProperties {
  if (status === "strong") {
    return { background: `${MINT}22`, color: MINT, border: `1px solid ${MINT}44` };
  }
  if (status === "building") {
    return { background: `${VIOLET}22`, color: VIOLET, border: `1px solid ${VIOLET}44` };
  }
  return { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)" };
}

function weekBarMax(days: WeekDay[]): number {
  return Math.max(...days.map((d) => d.count), 1);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type PageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function TeacherStudentDetailPage({ params }: PageProps) {
  const { studentId } = await params;

  const configured = isTeacherAccessConfigured();
  const hasAccess = await hasTeacherAccess();

  if (!hasAccess) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <TeacherGate configured={configured} />
      </AppFrame>
    );
  }

  const student = deriveStudentStub(studentId);
  const maxWeekCount = weekBarMax(student.weekActivity);

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div
        style={{
          minHeight: "100vh",
          background: "#100b2e",
          padding: "0 0 48px",
        }}
      >
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div
          style={{
            padding: "28px 32px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Link
            href="/teacher"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              textDecoration: "none",
              marginBottom: "16px",
              letterSpacing: "0.01em",
            }}
          >
            ← Classroom Board
          </Link>

          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: MINT,
              marginBottom: "6px",
            }}
          >
            Student Detail
          </div>

          {/* Name + avatar row */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: student.avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: 900,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {student.initials}
            </div>
            <div>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1.15,
                  marginBottom: "4px",
                }}
              >
                {student.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "14px",
                    background: `${student.bandColor}22`,
                    color: student.bandColor,
                    border: `1px solid ${student.bandColor}44`,
                  }}
                >
                  {student.band}
                </span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                  Active since {student.activeSince}
                </span>
              </div>
            </div>
          </div>

          {/* 4 stat tiles */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <StatTile
              label="Stars this week"
              value={`⭐ ${student.starsThisWeek}`}
            />
            <StatTile
              label="Sessions this week"
              value={String(student.sessionsThisWeek)}
            />
            <StatTile
              label="Current streak"
              value={student.streak > 0 ? `🔥 ${student.streak}d` : "—"}
            />
            <StatTile
              label="Strong skills"
              value={String(student.strongSkillsCount)}
            />
          </div>

          {/* Queue flag */}
          {student.inQueue ? (
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: `${GOLD}18`,
                border: `1px solid ${GOLD}44`,
                fontSize: "12px",
                fontWeight: 700,
                color: GOLD,
              }}
            >
              <span>⚠️</span>
              <span>In support queue — {student.queueNote}</span>
              <Link
                href="/teacher"
                style={{
                  marginLeft: "auto",
                  padding: "5px 12px",
                  background: GOLD,
                  color: "#100b2e",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 800,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                View queue item
              </Link>
            </div>
          ) : null}
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "24px 32px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}

          {/* Skills mastery */}
          <ShellCard title="Skills Mastery" eyebrow="Curriculum progress">
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {student.skills.map((skill, i) => (
                <div
                  key={skill.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 0",
                    borderBottom:
                      i < student.skills.length - 1
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {skill.name}
                  </span>
                  {/* Mastery bar */}
                  <div
                    style={{
                      width: "64px",
                      height: "5px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "3px",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: `${skill.score}%`,
                        height: "100%",
                        background: skillBarColor(skill.status),
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                      minWidth: "28px",
                      textAlign: "right",
                    }}
                  >
                    {skill.score}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "6px",
                      whiteSpace: "nowrap",
                      ...skillStatusStyle(skill.status),
                    }}
                  >
                    {skillStatusLabel(skill.status)}
                  </span>
                </div>
              ))}
            </div>
          </ShellCard>

          {/* Recent sessions */}
          <ShellCard title="Recent Sessions" eyebrow="Session log">
            <div style={{ display: "flex", flexDirection: "column" }}>
              {student.sessions.map((sess, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 0",
                    borderBottom:
                      i < student.sessions.length - 1
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "none",
                    fontSize: "12px",
                  }}
                >
                  <span
                    style={{
                      minWidth: "70px",
                      color: "rgba(255,255,255,0.4)",
                      fontWeight: 600,
                    }}
                  >
                    {sess.date}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    {sess.skill}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>
                    ⭐ {sess.stars}
                  </span>
                  {sess.perfect ? (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "6px",
                        background: `${GOLD}22`,
                        color: GOLD,
                        border: `1px solid ${GOLD}44`,
                      }}
                    >
                      ⭐ Perfect
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </ShellCard>

          {/* Sessions this week (activity bars) */}
          <ShellCard title="Sessions This Week" eyebrow="Weekly activity">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {student.weekActivity.map((day) => (
                <div
                  key={day.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.4)",
                      minWidth: "28px",
                    }}
                  >
                    {day.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "6px",
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    {day.count > 0 ? (
                      <div
                        style={{
                          width: `${(day.count / maxWeekCount) * 100}%`,
                          height: "100%",
                          background: VIOLET,
                          borderRadius: "3px",
                        }}
                      />
                    ) : null}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                      minWidth: "20px",
                      textAlign: "right",
                    }}
                  >
                    {day.count}
                  </span>
                </div>
              ))}
            </div>
          </ShellCard>

          {/* Support notes */}
          <ShellCard title="Teacher Note" eyebrow="Private — not visible to family">
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "12px 14px",
                fontSize: "13px",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.6,
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: VIOLET,
                  marginBottom: "6px",
                }}
              >
                Private note — visible to teacher only
              </div>
              {student.teacherNote}
            </div>
            <button
              style={{
                width: "100%",
                padding: "10px",
                background: "transparent",
                border: `1.5px solid ${VIOLET}66`,
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 700,
                color: VIOLET,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              type="button"
            >
              + Add / edit note
            </button>
          </ShellCard>

          {/* ── RIGHT COLUMN ────────────────────────────────────────── */}

          {/* Band info card */}
          <ShellCard title="Band Information" eyebrow="Curriculum band">
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: `${student.bandColor}22`,
                  border: `1.5px solid ${student.bandColor}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: 900,
                  color: student.bandColor,
                  flexShrink: 0,
                }}
              >
                {student.band.split(" ")[0]}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: "4px",
                  }}
                >
                  {student.band}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.5,
                  }}
                >
                  {student.bandInfo}
                </div>
              </div>
            </div>
          </ShellCard>

          {/* Intervention history */}
          <ShellCard title="Intervention History" eyebrow="Support record">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {student.interventionHistory.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: CORAL,
                      marginTop: "6px",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.6)",
                      lineHeight: 1.5,
                    }}
                  >
                    {entry}
                  </span>
                </div>
              ))}
            </div>
          </ShellCard>

          {/* Recommended actions */}
          <ShellCard title="Recommended Actions" eyebrow="Next steps">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {student.recommendedActions.map((action, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: MINT,
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    {i + 1}.
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.7)",
                      lineHeight: 1.5,
                    }}
                  >
                    {action}
                  </span>
                </div>
              ))}
            </div>
          </ShellCard>
        </div>
      </div>
    </AppFrame>
  );
}
