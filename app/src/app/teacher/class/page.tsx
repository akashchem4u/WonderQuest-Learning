import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard } from "@/components/ui";
import { hasTeacherAccess, isTeacherAccessConfigured } from "@/lib/teacher-access";
import TeacherGate from "@/app/teacher/teacher-gate";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Colour palette (design spec)
// ---------------------------------------------------------------------------
const BASE = "#100b2e";
const MINT = "#58e8c1";
const VIOLET = "#9b72ff";
const GOLD = "#ffd166";
const CORAL = "#ff7b6b";

// ---------------------------------------------------------------------------
// Stub data
// ---------------------------------------------------------------------------

type StudentTier = "strong" | "building" | "support";
type Band = "P0" | "P1" | "P2" | "P3";

type StudentStub = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  band: Band;
  accuracy: number;
  masteryPct: number;
  sessions: number;
  stars: number;
  streak: boolean;
  tier: StudentTier;
  inQueue: boolean;
};

type SkillCoverageEntry = {
  name: string;
  count: number;
  total: number;
};

type BandDistEntry = {
  band: Band;
  label: string;
  color: string;
  count: number;
};

type DaySession = {
  day: string;
  count: number;
};

type QueueItem = {
  label: string;
  count: number;
  color: string;
};

const STUDENTS: StudentStub[] = [
  {
    id: "bella",
    name: "Bella",
    initials: "B",
    avatarColor: "#ec4899",
    band: "P3",
    accuracy: 88,
    masteryPct: 88,
    sessions: 4,
    stars: 92,
    streak: true,
    tier: "strong",
    inQueue: false,
  },
  {
    id: "ethan",
    name: "Ethan",
    initials: "E",
    avatarColor: "#16a34a",
    band: "P2",
    accuracy: 65,
    masteryPct: 65,
    sessions: 7,
    stars: 118,
    streak: true,
    tier: "building",
    inQueue: false,
  },
  {
    id: "marcus",
    name: "Marcus",
    initials: "M",
    avatarColor: "#0ea5e9",
    band: "P2",
    accuracy: 72,
    masteryPct: 72,
    sessions: 5,
    stars: 78,
    streak: false,
    tier: "building",
    inQueue: false,
  },
  {
    id: "aisha",
    name: "Aisha",
    initials: "A",
    avatarColor: "#f59e0b",
    band: "P2",
    accuracy: 80,
    masteryPct: 80,
    sessions: 6,
    stars: 101,
    streak: true,
    tier: "strong",
    inQueue: false,
  },
  {
    id: "priya",
    name: "Priya",
    initials: "P",
    avatarColor: "#8b5cf6",
    band: "P1",
    accuracy: 52,
    masteryPct: 52,
    sessions: 2,
    stars: 28,
    streak: false,
    tier: "building",
    inQueue: false,
  },
  {
    id: "jordan",
    name: "Jordan",
    initials: "J",
    avatarColor: "#475569",
    band: "P2",
    accuracy: 38,
    masteryPct: 38,
    sessions: 3,
    stars: 41,
    streak: false,
    tier: "support",
    inQueue: true,
  },
  {
    id: "lena",
    name: "Lena",
    initials: "L",
    avatarColor: "#e11d48",
    band: "P3",
    accuracy: 83,
    masteryPct: 83,
    sessions: 5,
    stars: 87,
    streak: false,
    tier: "strong",
    inQueue: false,
  },
  {
    id: "noah",
    name: "Noah",
    initials: "N",
    avatarColor: "#0891b2",
    band: "P2",
    accuracy: 44,
    masteryPct: 44,
    sessions: 2,
    stars: 33,
    streak: false,
    tier: "support",
    inQueue: true,
  },
  {
    id: "grace",
    name: "Grace",
    initials: "G",
    avatarColor: "#059669",
    band: "P1",
    accuracy: 61,
    masteryPct: 61,
    sessions: 4,
    stars: 55,
    streak: false,
    tier: "building",
    inQueue: false,
  },
  {
    id: "sam",
    name: "Sam",
    initials: "S",
    avatarColor: "#7c3aed",
    band: "P0",
    accuracy: 48,
    masteryPct: 48,
    sessions: 3,
    stars: 22,
    streak: false,
    tier: "building",
    inQueue: false,
  },
  {
    id: "maya",
    name: "Maya",
    initials: "M",
    avatarColor: "#b45309",
    band: "P2",
    accuracy: 70,
    masteryPct: 70,
    sessions: 5,
    stars: 64,
    streak: true,
    tier: "building",
    inQueue: false,
  },
  {
    id: "oliver",
    name: "Oliver",
    initials: "O",
    avatarColor: "#1d4ed8",
    band: "P3",
    accuracy: 76,
    masteryPct: 76,
    sessions: 4,
    stars: 73,
    streak: true,
    tier: "building",
    inQueue: false,
  },
];

const BAND_DISTRIBUTION: BandDistEntry[] = [
  { band: "P0", label: "P0 · Pre-K", color: GOLD, count: 1 },
  { band: "P1", label: "P1 · K–1", color: VIOLET, count: 2 },
  { band: "P2", label: "P2 · G2–3", color: MINT, count: 7 },
  { band: "P3", label: "P3 · G4–5", color: CORAL, count: 3 },
];

const SKILL_COVERAGE: SkillCoverageEntry[] = [
  { name: "Long Division", count: 9, total: 12 },
  { name: "Fractions: Adding Unlike", count: 7, total: 12 },
  { name: "Multiplication: Advanced", count: 5, total: 12 },
  { name: "Place Value: Thousands", count: 4, total: 12 },
  { name: "Subtraction: Regrouping", count: 3, total: 12 },
  { name: "Reading Clocks", count: 2, total: 12 },
];

const WEEK_SESSIONS: DaySession[] = [
  { day: "M", count: 8 },
  { day: "T", count: 10 },
  { day: "W", count: 12 },
  { day: "Th", count: 11 },
  { day: "F", count: 0 },
];

const QUEUE_ITEMS: QueueItem[] = [
  { label: "Confidence floor", count: 2, color: CORAL },
  { label: "Absence follow-up", count: 1, color: GOLD },
  { label: "Band ceiling (ready)", count: 1, color: MINT },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bandColor(band: Band): string {
  if (band === "P0") return GOLD;
  if (band === "P1") return VIOLET;
  if (band === "P2") return MINT;
  return CORAL;
}

function bandBg(band: Band): string {
  return `${bandColor(band)}22`;
}

function tierColor(tier: StudentTier): string {
  if (tier === "strong") return MINT;
  if (tier === "building") return VIOLET;
  return CORAL;
}

function tierLabel(tier: StudentTier): string {
  if (tier === "strong") return "Strong";
  if (tier === "building") return "Building";
  return "Needs support";
}

const MAX_WEEK_SESSIONS = Math.max(...WEEK_SESSIONS.map((d) => d.count), 1);

// ---------------------------------------------------------------------------
// Sub-components (inline)
// ---------------------------------------------------------------------------

function StatTileBlock({
  value,
  label,
  delta,
  deltaUp,
}: {
  value: string;
  label: string;
  delta?: string;
  deltaUp?: boolean;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "16px 18px",
        flex: "1 1 0",
        minWidth: "120px",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: 900,
          color: "#fff",
          lineHeight: 1.1,
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "rgba(255,255,255,0.45)",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: delta ? "4px" : "0",
        }}
      >
        {label}
      </div>
      {delta ? (
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: deltaUp === false ? GOLD : MINT,
          }}
        >
          {delta}
        </div>
      ) : null}
    </div>
  );
}

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TeacherClassPage() {
  const configured = isTeacherAccessConfigured();
  const hasAccess = await hasTeacherAccess();

  if (!hasAccess) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <main className="page-shell page-shell-split">
          <section className="page-hero">
            <div>
              <span className="eyebrow">Teacher dashboard</span>
              <h1>Access your class dashboard.</h1>
            </div>
          </section>
          <ShellCard className="shell-card-emphasis" eyebrow="Teacher" title="Unlock teacher dashboard">
            <TeacherGate configured={configured} />
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div
        style={{
          minHeight: "100vh",
          background: BASE,
          padding: "0 0 56px",
        }}
      >
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div
          style={{
            padding: "28px 32px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
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
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              marginBottom: "18px",
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
            Class Summary
          </div>

          <h1
            style={{
              fontSize: "26px",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Full class overview
          </h1>
        </div>

        {/* ── Stat tiles ──────────────────────────────────────────────── */}
        <div
          style={{
            padding: "24px 32px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <StatTileBlock value="12" label="Students enrolled" delta="↑2 this week" deltaUp />
            <StatTileBlock value="⭐ 986" label="Stars earned" delta="↑143" deltaUp />
            <StatTileBlock value="8" label="Skills mastered" delta="↓1 vs last week" deltaUp={false} />
            <StatTileBlock value="10" label="Active streaks" delta="↑3" deltaUp />
          </div>
        </div>

        {/* ── 2-column main layout ─────────────────────────────────────── */}
        <div
          style={{
            padding: "28px 32px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* ── LEFT: Student roster ───────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "4px",
              }}
            >
              Student Roster
            </div>

            {STUDENTS.map((student) => (
              <Link
                href={`/teacher/students/${student.id}`}
                key={student.id}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: student.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 900,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {student.initials}
                  </div>

                  {/* Name + band */}
                  <div style={{ flex: "1 1 0", minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "3px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: "#fff",
                        }}
                      >
                        {student.name}
                      </span>
                      {student.streak && (
                        <span style={{ fontSize: "12px" }}>🔥</span>
                      )}
                      {student.inQueue && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            background: `${CORAL}22`,
                            color: CORAL,
                            border: `1px solid ${CORAL}44`,
                            borderRadius: "5px",
                            padding: "1px 6px",
                          }}
                        >
                          ⚠ Queue
                        </span>
                      )}
                    </div>

                    {/* Accuracy bar */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: "3px",
                          height: "4px",
                          maxWidth: "100px",
                        }}
                      >
                        <div
                          style={{
                            width: `${student.masteryPct}%`,
                            height: "4px",
                            borderRadius: "3px",
                            background: tierColor(student.tier),
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {student.accuracy}%
                      </span>
                    </div>
                  </div>

                  {/* Band chip */}
                  <div
                    style={{
                      background: bandBg(student.band),
                      color: bandColor(student.band),
                      border: `1px solid ${bandColor(student.band)}44`,
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "3px 8px",
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                    }}
                  >
                    {student.band}
                  </div>

                  {/* Tier badge */}
                  <div
                    style={{
                      background: `${tierColor(student.tier)}18`,
                      color: tierColor(student.tier),
                      border: `1px solid ${tierColor(student.tier)}33`,
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "3px 9px",
                      flexShrink: 0,
                      minWidth: "78px",
                      textAlign: "center",
                    }}
                  >
                    {tierLabel(student.tier)}
                  </div>

                  {/* Arrow */}
                  <div
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ── RIGHT: Analytics ───────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* Band distribution */}
            <SectionCard title="Band Distribution">
              {BAND_DISTRIBUTION.map((entry) => (
                <div
                  key={entry.band}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "72px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: entry.color,
                      flexShrink: 0,
                    }}
                  >
                    {entry.label}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: "4px",
                      height: "7px",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.round((entry.count / 12) * 100)}%`,
                        height: "7px",
                        borderRadius: "4px",
                        background: entry.color,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                      fontWeight: 700,
                      width: "18px",
                      textAlign: "right",
                    }}
                  >
                    {entry.count}
                  </div>
                </div>
              ))}
            </SectionCard>

            {/* Daily sessions bar chart */}
            <SectionCard title="Daily Sessions — This Week">
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-end",
                  height: "72px",
                  marginBottom: "6px",
                }}
              >
                {WEEK_SESSIONS.map((day) => {
                  const barH = day.count
                    ? Math.round((day.count / MAX_WEEK_SESSIONS) * 60)
                    : 4;
                  const barColor = day.count ? VIOLET : "rgba(255,255,255,0.1)";

                  return (
                    <div
                      key={day.day}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {day.count > 0 ? day.count : "—"}
                      </span>
                      <div
                        style={{
                          width: "100%",
                          height: `${barH}px`,
                          background: barColor,
                          borderRadius: "3px 3px 0 0",
                          minHeight: "4px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        {day.day}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                Sessions per day · Average: 10.2
              </div>
            </SectionCard>

            {/* Skill coverage */}
            <SectionCard title="Skills in Progress">
              {SKILL_COVERAGE.map((skill) => (
                <div
                  key={skill.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {skill.name}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "3px",
                        height: "4px",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.round((skill.count / skill.total) * 100)}%`,
                          height: "4px",
                          borderRadius: "3px",
                          background: MINT,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: MINT,
                        minWidth: "54px",
                        textAlign: "right",
                      }}
                    >
                      {skill.count}/{skill.total}
                    </span>
                  </div>
                </div>
              ))}
            </SectionCard>

            {/* Support queue summary */}
            <SectionCard
              title="Support Queue"
              action={
                <Link
                  href="/teacher/support"
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: MINT,
                    textDecoration: "none",
                  }}
                >
                  Review →
                </Link>
              }
            >
              {QUEUE_ITEMS.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: item.color,
                    }}
                  >
                    {item.count} {item.count === 1 ? "student" : "students"}
                  </span>
                </div>
              ))}

              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 12px",
                  background: `${CORAL}14`,
                  border: `1px solid ${CORAL}33`,
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                4 open queue items this week.{" "}
                <Link
                  href="/teacher/support"
                  style={{
                    color: CORAL,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Open support view
                </Link>
              </div>
            </SectionCard>

            {/* Recent class activity */}
            <SectionCard title="Recent Class Activity">
              {[
                { text: "Ethan completed Long Division — 7 sessions this week 🔥", time: "Today" },
                { text: "Bella mastered Fractions: Adding Unlike", time: "Yesterday" },
                { text: "Jordan flagged for confidence support", time: "Yesterday" },
                { text: "Aisha reached P2 band ceiling — ready to advance", time: "Mon" },
                { text: "Noah missed 2 sessions — follow-up recommended", time: "Mon" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "7px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: VIOLET,
                      flexShrink: 0,
                      marginTop: "5px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.65)",
                        lineHeight: 1.45,
                      }}
                    >
                      {item.text}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.25)",
                        marginTop: "2px",
                      }}
                    >
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </SectionCard>
          </div>
        </div>

        {/* ── Footer disclaimer ───────────────────────────────────────── */}
        <div
          style={{
            padding: "0 32px",
            fontSize: "11px",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          Class-level mastery bars shown. Individual accuracy % not displayed to students. 🔥 = active streak.
        </div>
      </div>
    </AppFrame>
  );
}
