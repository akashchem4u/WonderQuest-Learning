import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard } from "@/components/ui";
import { hasTeacherAccess, isTeacherAccessConfigured } from "@/lib/teacher-access";
import TeacherGate from "@/app/teacher/teacher-gate";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Colour palette
// ---------------------------------------------------------------------------
const C = {
  base: "#100b2e",
  mint: "#58e8c1",
  violet: "#9b72ff",
  gold: "#ffd166",
  coral: "#ff7b6b",
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.10)",
  text: "#ffffff",
  muted: "rgba(216,240,234,0.6)",
  amber: "#f59e0b",
  amberBg: "rgba(245,158,11,0.12)",
  amberBorder: "rgba(245,158,11,0.35)",
  green: "#22c55e",
  greenBg: "rgba(34,197,94,0.12)",
  greenBorder: "rgba(34,197,94,0.35)",
};

// ---------------------------------------------------------------------------
// Shared micro-styles
// ---------------------------------------------------------------------------
const glassCard: React.CSSProperties = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 16,
  padding: "20px 24px",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.11em",
  color: C.mint,
  marginBottom: 14,
};

// ---------------------------------------------------------------------------
// Stub types
// ---------------------------------------------------------------------------
type InterventionStatus = "active" | "improving" | "resolved";

type TimelineEvent = {
  icon: string;
  dotColor: string;
  date: string;
  title: string;
  detail: string;
};

type ActionItem = {
  done: boolean;
  title: string;
  desc: string;
  due: string;
};

type WeekBar = {
  label: string;
  value: number;
};

type ContactEntry = {
  date: string;
  method: string;
  note: string;
};

type InterventionStub = {
  studentName: string;
  studentInitials: string;
  avatarColor: string;
  skill: string;
  band: string;
  triggerReason: string;
  openedAt: string;
  daysActive: number;
  status: InterventionStatus;
  masteryBefore: number;
  masteryCurrent: number;
  masteryBeforeLabel: string;
  masteryCurrentLabel: string;
  sessionsSinceFlag: number;
  floorHitsSinceFlag: number;
  trend: string;
  trendColor: string;
  // Left column
  timeline: TimelineEvent[];
  focusSkillName: string;
  focusSkillScore: number;
  focusSkillNote: string;
  strategyTitle: string;
  strategyBody: string;
  strategyTip: string;
  // Right column
  weekBars: WeekBar[];
  contactLog: ContactEntry[];
  nextSteps: ActionItem[];
};

// ---------------------------------------------------------------------------
// Stub data factory
// ---------------------------------------------------------------------------
function deriveInterventionStub(studentId: string): InterventionStub {
  const hash = [...studentId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const variant = hash % 3;

  const variants: InterventionStub[] = [
    // ── Variant 0 — Jordan, active/improving ─────────────────────────────
    {
      studentName: "Jordan",
      studentInitials: "J",
      avatarColor: "#475569",
      skill: "Fractions: Division",
      band: "P2 · G2–3",
      triggerReason: "Confidence floor hit 3× on Fractions: Division",
      openedAt: "Mar 22, 2026",
      daysActive: 3,
      status: "improving",
      masteryBefore: 32,
      masteryCurrent: 46,
      masteryBeforeLabel: "Just started",
      masteryCurrentLabel: "Building",
      sessionsSinceFlag: 4,
      floorHitsSinceFlag: 1,
      trend: "↑ improving",
      trendColor: C.green,
      timeline: [
        {
          icon: "⚠️",
          dotColor: C.amber,
          date: "Mar 22, 2026 — 9:14am",
          title: "Support queue triggered — Confidence floor",
          detail:
            "confidence_floor_hit reached 3× threshold on Fractions: Division. System flagged for teacher review.",
        },
        {
          icon: "🗒️",
          dotColor: C.violet,
          date: "Mar 22, 2026 — 2:30pm",
          title: "Teacher check-in logged",
          detail:
            "Spoke with Jordan. Visual model (pizza-slice diagram) suggested for equal-parts concept.",
        },
        {
          icon: "📈",
          dotColor: C.green,
          date: "Mar 24, 2026 — 4:08pm",
          title: "Mastery status: Just started → Building",
          detail:
            "Jordan completed 2 sessions on Fractions: Division. Mastery moved from 32 → 46. 1 floor hit vs 3 before.",
        },
      ],
      focusSkillName: "Fractions: Division",
      focusSkillScore: 46,
      focusSkillNote:
        "Building. Progress visible over last 3 days — equal-parts concept still needs consolidation.",
      strategyTitle: "Visual model — equal parts",
      strategyBody:
        "Use concrete area models (pizza slices, folded paper) before abstract notation. Jordan responds well to visual anchors before symbolic work.",
      strategyTip:
        "If still below 65 after 2 more sessions, consider a short small-group pull-out to reinforce the partition concept.",
      weekBars: [
        { label: "Mon", value: 1 },
        { label: "Tue", value: 2 },
        { label: "Wed", value: 0 },
        { label: "Thu", value: 2 },
        { label: "Fri", value: 1 },
      ],
      contactLog: [
        {
          date: "Mar 22",
          method: "In-person",
          note: "Brief check-in before class. Jordan mentioned fractions feel confusing.",
        },
        {
          date: "Mar 23",
          method: "App message",
          note: "Sent resource link to parent — visual fraction model activity.",
        },
      ],
      nextSteps: [
        {
          done: true,
          title: "Check-in with Jordan",
          desc: "Asked how fractions were going. Noted confusion with equal-parts idea.",
          due: "Mar 22",
        },
        {
          done: true,
          title: "Suggest visual model",
          desc: "Recommended pizza-slice diagram. Logged note for reference.",
          due: "Mar 22",
        },
        {
          done: false,
          title: "Follow-up in 2 sessions",
          desc: "Review mastery progress. If still below 65 after 2 more sessions, escalate.",
          due: "Due: Mar 26",
        },
        {
          done: false,
          title: "Contact parent if no improvement",
          desc: "Send home update and suggest practising with manipulatives.",
          due: "Due: Mar 28",
        },
      ],
    },

    // ── Variant 1 — Bella, resolved ──────────────────────────────────────
    {
      studentName: "Bella",
      studentInitials: "B",
      avatarColor: C.coral,
      skill: "Geometry: Perimeter",
      band: "P3 · G4–5",
      triggerReason: "Hint usage above threshold for 2 consecutive sessions",
      openedAt: "Mar 18, 2026",
      daysActive: 10,
      status: "resolved",
      masteryBefore: 48,
      masteryCurrent: 72,
      masteryBeforeLabel: "Building",
      masteryCurrentLabel: "Strong",
      sessionsSinceFlag: 9,
      floorHitsSinceFlag: 0,
      trend: "✓ resolved",
      trendColor: C.green,
      timeline: [
        {
          icon: "⚠️",
          dotColor: C.amber,
          date: "Mar 18, 2026 — 11:02am",
          title: "Support queue triggered — Hint pattern",
          detail:
            "Hint usage above threshold for 2 consecutive sessions on Geometry: Perimeter.",
        },
        {
          icon: "🗒️",
          dotColor: C.violet,
          date: "Mar 18, 2026 — 3:15pm",
          title: "Teacher review logged",
          detail:
            "Observed Bella working through perimeter problems. Confusion around irregular shapes.",
        },
        {
          icon: "📈",
          dotColor: C.green,
          date: "Mar 22, 2026 — 2:40pm",
          title: "Mastery status: Building → Strong",
          detail:
            "Mastery crossed 70 threshold. Hint usage dropped. Bella is applying formula independently.",
        },
        {
          icon: "✅",
          dotColor: C.mint,
          date: "Mar 28, 2026 — 10:00am",
          title: "Intervention resolved",
          detail:
            "Mastery held at 72 for 5 days with 0 floor hits. Marked resolved — auto-monitoring continues.",
        },
      ],
      focusSkillName: "Geometry: Perimeter",
      focusSkillScore: 72,
      focusSkillNote:
        "Strong. Bella reached proficiency after focused work on irregular shapes. Monitoring continues automatically.",
      strategyTitle: "Step-by-step perimeter tracing",
      strategyBody:
        "Label each side before summing. Bella benefited from tracing each segment with a finger to avoid skip-counting errors on irregular polygons.",
      strategyTip:
        "Bella is now ready for area integration. Consider pairing perimeter and area problems in the same session.",
      weekBars: [
        { label: "Mon", value: 3 },
        { label: "Tue", value: 2 },
        { label: "Wed", value: 3 },
        { label: "Thu", value: 2 },
        { label: "Fri", value: 2 },
      ],
      contactLog: [
        {
          date: "Mar 18",
          method: "In-person",
          note: "Reviewed session data with Bella. Explained irregular shape strategy.",
        },
        {
          date: "Mar 25",
          method: "App message",
          note: "Sent update to parent — Bella has reached Strong on Perimeter.",
        },
      ],
      nextSteps: [
        {
          done: true,
          title: "Identify confusion source",
          desc: "Observed irregular-shape difficulty during class check-in.",
          due: "Mar 18",
        },
        {
          done: true,
          title: "Introduce tracing strategy",
          desc: "Reviewed side-labelling technique with Bella.",
          due: "Mar 19",
        },
        {
          done: true,
          title: "Monitor for 5 sessions",
          desc: "Tracked hint usage — dropped to zero by session 4.",
          due: "Mar 24",
        },
        {
          done: true,
          title: "Mark resolved",
          desc: "Mastery held Strong for 5 days. Intervention archived.",
          due: "Mar 28",
        },
      ],
    },

    // ── Variant 2 — Marcus, active/flagged ───────────────────────────────
    {
      studentName: "Marcus",
      studentInitials: "M",
      avatarColor: C.violet,
      skill: "Subtraction: Basics",
      band: "P1 · G1–2",
      triggerReason: "Low session frequency — below 3 sessions / week for 2 weeks",
      openedAt: "Mar 24, 2026",
      daysActive: 7,
      status: "active",
      masteryBefore: 28,
      masteryCurrent: 33,
      masteryBeforeLabel: "Just started",
      masteryCurrentLabel: "Just started",
      sessionsSinceFlag: 2,
      floorHitsSinceFlag: 2,
      trend: "→ stalled",
      trendColor: C.gold,
      timeline: [
        {
          icon: "⚠️",
          dotColor: C.amber,
          date: "Mar 24, 2026 — 8:45am",
          title: "Support queue triggered — Low engagement",
          detail:
            "Session frequency below 3/week threshold for 2 consecutive weeks. Subtraction: Basics mastery unchanged.",
        },
        {
          icon: "🗒️",
          dotColor: C.violet,
          date: "Mar 25, 2026 — 12:30pm",
          title: "Teacher note logged",
          detail:
            "Marcus is attentive in class but device access at home may be limited. Follow-up planned with family.",
        },
        {
          icon: "📊",
          dotColor: C.gold,
          date: "Mar 30, 2026 — 4:00pm",
          title: "No mastery change after 7 days",
          detail:
            "Mastery at 33/100 — Just started. Floor hits unchanged. Escalation consideration noted.",
        },
      ],
      focusSkillName: "Subtraction: Basics",
      focusSkillScore: 33,
      focusSkillNote:
        "Just started. Minimal progress over 7 days — low session frequency is the primary blocker. Consider home-access barriers.",
      strategyTitle: "Physical manipulatives + short sessions",
      strategyBody:
        "Marcus responds better to physical objects (counters, fingers) before digital practice. Short 5–10 min sessions are more sustainable than longer infrequent ones.",
      strategyTip:
        "Consider connecting with parent or guardian about device access schedule. Even 1 short session per day would meaningfully change the trajectory.",
      weekBars: [
        { label: "Mon", value: 1 },
        { label: "Tue", value: 0 },
        { label: "Wed", value: 0 },
        { label: "Thu", value: 1 },
        { label: "Fri", value: 0 },
      ],
      contactLog: [
        {
          date: "Mar 25",
          method: "In-person",
          note: "Asked Marcus about home practice — mentioned the tablet is shared with siblings.",
        },
      ],
      nextSteps: [
        {
          done: true,
          title: "Log initial note",
          desc: "Documented low-frequency flag and spoke with Marcus in class.",
          due: "Mar 25",
        },
        {
          done: false,
          title: "Contact family",
          desc: "Reach out to parent / guardian about device access and suggest a daily routine.",
          due: "Due: Apr 1",
        },
        {
          done: false,
          title: "Re-assess in 1 week",
          desc: "If session count does not reach 3/week, consider escalation to admin.",
          due: "Due: Apr 7",
        },
      ],
    },
  ];

  return variants[variant];
}

// ---------------------------------------------------------------------------
// Helper renderers
// ---------------------------------------------------------------------------

function statusBadge(status: InterventionStatus) {
  if (status === "resolved") {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          padding: "4px 12px",
          borderRadius: 20,
          background: C.greenBg,
          color: C.green,
          border: `1px solid ${C.greenBorder}`,
          letterSpacing: "0.04em",
        }}
      >
        Resolved
      </span>
    );
  }
  if (status === "improving") {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          padding: "4px 12px",
          borderRadius: 20,
          background: "rgba(88,232,193,0.12)",
          color: C.mint,
          border: `1px solid rgba(88,232,193,0.35)`,
          letterSpacing: "0.04em",
        }}
      >
        Improving
      </span>
    );
  }
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 800,
        padding: "4px 12px",
        borderRadius: 20,
        background: C.amberBg,
        color: C.amber,
        border: `1px solid ${C.amberBorder}`,
        letterSpacing: "0.04em",
      }}
    >
      Active
    </span>
  );
}

function masteryBarColor(score: number): string {
  if (score >= 70) return C.mint;
  if (score >= 50) return C.violet;
  return "#4a4a6a";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type PageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function TeacherInterventionDetailPage({ params }: PageProps) {
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

  const d = deriveInterventionStub(studentId);
  const weekMax = Math.max(...d.weekBars.map((b) => b.value), 1);
  const headerAccentColor = d.status === "resolved" ? C.green : d.status === "improving" ? C.mint : C.gold;

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          paddingBottom: 56,
        }}
      >

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div
          style={{
            padding: "28px 32px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            borderTop: `3px solid ${headerAccentColor}`,
          }}
        >
          {/* Back link */}
          <Link
            href="/teacher/support"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              marginBottom: 18,
              letterSpacing: "0.01em",
            }}
          >
            ← Support Queue
          </Link>

          {/* Eyebrow */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: C.mint,
              marginBottom: 6,
            }}
          >
            Intervention
          </div>

          {/* Name row + status badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: d.avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {d.studentInitials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1.15,
                  marginBottom: 4,
                }}
              >
                {d.studentName}
              </h1>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 4,
                }}
              >
                {d.skill}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {statusBadge(d.status)}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {d.band}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  Day {d.daysActive} of intervention
                </span>
              </div>
            </div>
          </div>

          {/* Trigger sub-line */}
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.6,
            }}
          >
            Triggered: {d.triggerReason}&nbsp;·&nbsp;Opened: {d.openedAt}
          </div>

          {/* Stat row */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 20,
            }}
          >
            {[
              { label: "Mastery (before → now)", value: `${d.masteryBefore}→${d.masteryCurrent}` },
              { label: "Sessions since flag", value: String(d.sessionsSinceFlag) },
              { label: "Floor hits since flag", value: String(d.floorHitsSinceFlag) },
              { label: "Trend", value: d.trend, color: d.trendColor },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "10px 18px",
                  textAlign: "center",
                  minWidth: 110,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: stat.color ?? "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.35)",
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body — two-column grid ───────────────────────────────────── */}
        <div
          style={{
            padding: "24px 32px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >

          {/* ═══════════════════ LEFT COLUMN ═══════════════════════════ */}

          {/* Intervention timeline */}
          <ShellCard title="Intervention Timeline" eyebrow="Event history">
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {d.timeline.map((ev, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    paddingBottom: i < d.timeline.length - 1 ? 20 : 0,
                    position: "relative",
                  }}
                >
                  {/* Connector line */}
                  {i < d.timeline.length - 1 ? (
                    <div
                      style={{
                        position: "absolute",
                        left: 14,
                        top: 30,
                        bottom: 0,
                        width: 2,
                        background: "rgba(255,255,255,0.08)",
                      }}
                    />
                  ) : null}

                  {/* Dot */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: `${ev.dotColor}22`,
                      border: `1.5px solid ${ev.dotColor}66`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      flexShrink: 0,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {ev.icon}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.35)",
                        fontWeight: 700,
                        marginBottom: 4,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {ev.date}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#fff",
                        marginBottom: 4,
                        lineHeight: 1.3,
                      }}
                    >
                      {ev.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: 1.55,
                      }}
                    >
                      {ev.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ShellCard>

          {/* Current focus skill card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ShellCard title="Current Focus Skill" eyebrow="Intervention target">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${C.violet}22`,
                    border: `1.5px solid ${C.violet}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  🎯
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#fff",
                      marginBottom: 2,
                    }}
                  >
                    {d.focusSkillName}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                    Mastery: {d.focusSkillScore}/100
                  </div>
                </div>
              </div>

              {/* Mastery bar */}
              <div
                style={{
                  height: 8,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: `${d.focusSkillScore}%`,
                    height: "100%",
                    background: masteryBarColor(d.focusSkillScore),
                    borderRadius: 4,
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.55,
                }}
              >
                {d.focusSkillNote}
              </div>
            </ShellCard>

            {/* Recommended strategy card */}
            <ShellCard title="Recommended Strategy" eyebrow="Teacher guidance">
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: C.mint,
                  marginBottom: 8,
                }}
              >
                {d.strategyTitle}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                {d.strategyBody}
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  background: `${C.mint}0d`,
                  border: `1px solid ${C.mint}33`,
                  borderRadius: 10,
                  fontSize: 12,
                  color: C.mint,
                  lineHeight: 1.55,
                }}
              >
                <strong>Next escalation point:</strong> {d.strategyTip}
              </div>
            </ShellCard>
          </div>

          {/* ═══════════════════ RIGHT COLUMN ══════════════════════════ */}

          {/* Progress chart — weekly session bars */}
          <ShellCard title="Weekly Session Activity" eyebrow="Progress chart">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* Bars */}
              {d.weekBars.map((bar) => (
                <div
                  key={bar.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.4)",
                      minWidth: 28,
                    }}
                  >
                    {bar.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    {bar.value > 0 ? (
                      <div
                        style={{
                          width: `${(bar.value / weekMax) * 100}%`,
                          height: "100%",
                          background: bar.value >= 2 ? C.mint : C.violet,
                          borderRadius: 4,
                        }}
                      />
                    ) : null}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: bar.value > 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
                      minWidth: 18,
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {bar.value}
                  </span>
                </div>
              ))}

              {/* Legend note */}
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  paddingTop: 8,
                }}
              >
                Sessions per day this week. Target: 3+ per week for steady mastery growth.
              </div>
            </div>
          </ShellCard>

          {/* Parent contact log */}
          <ShellCard title="Parent Contact Log" eyebrow="Private — teacher only">
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {d.contactLog.length === 0 ? (
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.3)",
                    fontStyle: "italic",
                    padding: "8px 0",
                  }}
                >
                  No contact logged yet.
                </div>
              ) : (
                d.contactLog.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom:
                        i < d.contactLog.length - 1
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "none",
                    }}
                  >
                    {/* Date+method column */}
                    <div style={{ minWidth: 80, flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.5)",
                          marginBottom: 2,
                        }}
                      >
                        {entry.date}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 7px",
                          borderRadius: 6,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {entry.method}
                      </span>
                    </div>
                    {/* Note */}
                    <div
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.55,
                      }}
                    >
                      {entry.note}
                    </div>
                  </div>
                ))
              )}

              <button
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: "9px",
                  background: "transparent",
                  border: `1.5px solid ${C.violet}55`,
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.violet,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                type="button"
              >
                + Log contact
              </button>
            </div>
          </ShellCard>

          {/* Next steps checklist */}
          <div style={{ gridColumn: "1 / -1" }}>
            <ShellCard title="Next Steps" eyebrow="Action checklist — private">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {d.nextSteps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: step.done
                        ? "rgba(34,197,94,0.05)"
                        : "rgba(255,255,255,0.03)",
                      border: step.done
                        ? `1px solid rgba(34,197,94,0.2)`
                        : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: step.done
                          ? "2px solid " + C.green
                          : "2px solid rgba(255,255,255,0.2)",
                        background: step.done ? C.green : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 900,
                        color: step.done ? "#fff" : "transparent",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {step.done ? "✓" : ""}
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: step.done ? "rgba(255,255,255,0.5)" : "#fff",
                          marginBottom: 2,
                          textDecoration: step.done ? "line-through" : "none",
                        }}
                      >
                        {step.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.4)",
                          lineHeight: 1.5,
                        }}
                      >
                        {step.desc}
                      </div>
                    </div>

                    {/* Due date */}
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: step.done ? "rgba(255,255,255,0.25)" : C.gold,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {step.due}
                    </div>
                  </div>
                ))}

                <button
                  style={{
                    marginTop: 4,
                    width: "100%",
                    padding: "10px",
                    background: "transparent",
                    border: `1.5px solid rgba(255,209,102,0.35)`,
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.gold,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  type="button"
                >
                  + Add action item
                </button>
              </div>
            </ShellCard>
          </div>

        </div>
      </div>
    </AppFrame>
  );
}
