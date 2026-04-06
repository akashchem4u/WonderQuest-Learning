"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

const C = {
  bg: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  coral: "#ff7b6b",
  red: "#ef4444",
  faint: "rgba(255,255,255,0.05)",
} as const;

type RosterStudent = {
  studentId: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  totalPoints: number;
  currentLevel: number;
  sessionsLast7d: number;
  correctLast7d: number;
  totalLast7d: number;
  lastSessionAt: string | null;
  inInterventionQueue: boolean;
  streak: number;
};

function avatarColor(name: string): string {
  const colors = ["#475569", "#ec4899", "#0ea5e9", "#16a34a", "#f59e0b", "#8b5cf6", "#0d9065"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function isThisWeek(iso: string | null): boolean {
  if (!iso) return false;
  const d = daysSince(iso);
  return d !== null && d <= 7;
}

// Determine if a student had a "win" this week
function winReason(s: RosterStudent): string | null {
  // On a 3+ day streak
  if (s.streak >= 3) return `${s.streak}-day streak`;
  // First-ever session this week (totalPoints very low & had a session)
  if (s.sessionsLast7d >= 1 && s.totalPoints <= 50) return "Earned their first session!";
  // High accuracy session this week
  if (s.sessionsLast7d >= 1 && s.totalLast7d > 0) {
    const acc = Math.round((s.correctLast7d / s.totalLast7d) * 100);
    if (acc >= 80) return `${acc}% accuracy this week`;
  }
  return null;
}

function StudentPill({
  student,
  accent,
  detail,
  extra,
}: {
  student: RosterStudent;
  accent: string;
  detail: string;
  extra?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 10,
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: avatarColor(student.displayName),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 900,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {initial(student.displayName)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{student.displayName}</div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{detail}</div>
      </div>
      {extra ? (
        extra
      ) : (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 8,
            background: `${accent}20`,
            color: accent,
            flexShrink: 0,
          }}
        >
          {student.launchBandCode}
        </span>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  accentColor,
  children,
  empty,
}: {
  icon: string;
  title: string;
  subtitle: string;
  accentColor: string;
  children: React.ReactNode;
  empty: boolean;
}) {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        padding: "20px 22px",
        border: `1px solid ${C.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${accentColor}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{title}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{subtitle}</div>
        </div>
      </div>

      {empty ? (
        <div
          style={{
            textAlign: "center" as const,
            padding: "20px 12px",
            color: C.muted,
            fontSize: 12,
            fontStyle: "italic",
          }}
        >
          No signals detected — all clear.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>{children}</div>
      )}
    </div>
  );
}

function TipCard({ tip }: { tip: string }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "rgba(155,114,255,0.06)",
        borderRadius: 10,
        border: `1px solid rgba(155,114,255,0.15)`,
        fontSize: 12,
        color: C.text,
        lineHeight: 1.6,
      }}
    >
      {tip}
    </div>
  );
}

function SkeletonSection() {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        padding: "20px 22px",
        border: `1px solid ${C.border}`,
      }}
    >
      <div style={{ height: 14, width: "50%", background: "rgba(255,255,255,0.06)", borderRadius: 6, marginBottom: 14 }} />
      {[1, 2].map((i) => (
        <div key={i} style={{ height: 52, background: "rgba(255,255,255,0.03)", borderRadius: 10, marginBottom: 8 }} />
      ))}
    </div>
  );
}

export default function FeedbackPanelPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(!!getTeacherId());
  }, []);

  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) return;
    const teacherId = getTeacherId();
    fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ roster: RosterStudent[] }>;
      })
      .then((data) => {
        setRoster(data.roster ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load class data. Please try again.");
        setLoading(false);
      });
  }, [authed]);

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/feedback-panel">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
          }}
        >
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  // ── This week's wins ──────────────────────────────────────────────────────
  const winsThisWeek = roster
    .map((s) => ({ student: s, reason: winReason(s) }))
    .filter(({ reason }) => reason !== null) as { student: RosterStudent; reason: string }[];

  // ── Needs attention: inactive 5+ days ────────────────────────────────────
  const inactiveStudents = roster
    .map((s) => ({ student: s, days: daysSince(s.lastSessionAt) }))
    .filter(({ days }) => days === null || days >= 5)
    .sort((a, b) => {
      const aDays = a.days ?? 9999;
      const bDays = b.days ?? 9999;
      return bDays - aDays;
    });

  // ── Teaching suggestions based on class bands ─────────────────────────────
  const bands = new Set(roster.map((s) => s.launchBandCode));
  const tips: string[] = [];
  const hasPrek = [...bands].some((b) => b === "PREK" || b === "P0");
  const hasK1 = [...bands].some((b) => b === "K1" || b === "P1" || b === "P2");
  const hasG23Plus = [...bands].some((b) =>
    ["G2", "G3", "P3", "P4", "P5"].includes(b),
  );

  if (hasPrek) {
    tips.push(
      "Young learners benefit from 5-minute sessions — encourage short, frequent play rather than long sittings.",
    );
  }
  if (hasK1) {
    tips.push(
      "Phonics and counting come before abstract math — check their letter skills and number recognition before moving ahead.",
    );
  }
  if (hasG23Plus) {
    tips.push(
      "These students can self-direct — try assigning them the challenge mode and review their accuracy trends weekly.",
    );
  }
  if (tips.length === 0) {
    tips.push(
      "Keep sessions consistent — students who play at least 3 times per week show the fastest mastery gains.",
      "Review the Skill Mastery page to spot which skills are lagging across the whole class.",
      "Celebrate streaks openly — public recognition of streaks motivates the whole class to keep going.",
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/feedback-panel">
      <div
        style={{
          padding: "28px 20px 72px",
          minHeight: "100vh",
          background: C.bg,
          fontFamily: "system-ui,-apple-system,sans-serif",
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 4 }}>
            Feedback Panel
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Actionable insights from live class data. Updated each time students complete a session.
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div
            style={{
              background: C.surface,
              borderRadius: 14,
              padding: "20px 22px",
              border: "1px solid rgba(239,68,68,0.3)",
              textAlign: "center" as const,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 8 }}>{error}</div>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "7px 18px",
                borderRadius: 8,
                background: "transparent",
                border: "1.5px solid rgba(239,68,68,0.4)",
                color: C.red,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
          {loading ? (
            <>
              <SkeletonSection />
              <SkeletonSection />
              <SkeletonSection />
            </>
          ) : (
            <>
              {/* Section 1: This week's wins */}
              <Section
                icon="🔥"
                title="This week's wins"
                subtitle="Students on a streak, earning their first session, or posting great accuracy this week."
                accentColor={C.mint}
                empty={winsThisWeek.length === 0}
              >
                {winsThisWeek.map(({ student, reason }) => (
                  <StudentPill
                    key={student.studentId}
                    student={student}
                    accent={C.mint}
                    detail={reason}
                  />
                ))}
              </Section>

              {/* Section 2: Needs your attention */}
              <Section
                icon="⚠️"
                title="Needs your attention"
                subtitle="Students who haven't played in 5 or more days — a quick check-in can help."
                accentColor={C.coral}
                empty={inactiveStudents.length === 0}
              >
                {inactiveStudents.map(({ student, days }) => {
                  const daysLabel =
                    days === null
                      ? "No sessions recorded yet"
                      : `${days} day${days === 1 ? "" : "s"} inactive`;
                  return (
                    <StudentPill
                      key={student.studentId}
                      student={student}
                      accent={C.coral}
                      detail={daysLabel}
                      extra={
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 8,
                              background: `${C.coral}20`,
                              color: C.coral,
                            }}
                          >
                            {daysLabel}
                          </span>
                          <a
                            href={`/teacher/students/${student.studentId}`}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: C.blue,
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            View report →
                          </a>
                        </div>
                      }
                    />
                  );
                })}
              </Section>

              {/* Section 3: Teaching suggestions */}
              <Section
                icon="💡"
                title="Teaching suggestions"
                subtitle="Tailored to your class composition — based on the learning bands in your roster."
                accentColor={C.violet}
                empty={false}
              >
                {tips.map((tip, i) => (
                  <TipCard key={i} tip={tip} />
                ))}
              </Section>
            </>
          )}
        </div>

        {/* Footer links */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            gap: 16,
            flexWrap: "wrap" as const,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Jump to:</span>
          <a
            href="/teacher/skill-mastery"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.mint,
              textDecoration: "none",
              padding: "5px 12px",
              borderRadius: 8,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            Skill Mastery →
          </a>
          <a
            href="/teacher/intervention-overview"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.amber,
              textDecoration: "none",
              padding: "5px 12px",
              borderRadius: 8,
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            Intervention Overview →
          </a>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: C.muted, fontStyle: "italic" }}>
            Data is class-level only — no cross-class comparisons.
          </span>
        </div>
      </div>
    </AppFrame>
  );
}
