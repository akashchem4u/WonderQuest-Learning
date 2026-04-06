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

function accuracyPct(s: RosterStudent): number {
  if (!s.totalLast7d) return 0;
  return Math.round((s.correctLast7d / s.totalLast7d) * 100);
}

function daysSinceSession(lastSessionAt: string | null): number | null {
  if (!lastSessionAt) return null;
  const then = new Date(lastSessionAt).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function StudentPill({
  student,
  accent,
  detail,
}: {
  student: RosterStudent;
  accent: string;
  detail: string;
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
      {/* Section header */}
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
      <div
        style={{
          height: 14,
          width: "50%",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 6,
          marginBottom: 14,
        }}
      />
      {[1, 2].map((i) => (
        <div
          key={i}
          style={{
            height: 52,
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10,
            marginBottom: 8,
          }}
        />
      ))}
    </div>
  );
}

export default function FeedbackPanelPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  // Confidence signals: students in intervention queue
  const confidenceStudents = roster.filter((s) => s.inInterventionQueue);

  // Hint patterns: students with low accuracy (<50%) and at least 3 sessions in 7d
  const hintPatternStudents = roster.filter(
    (s) => s.sessionsLast7d >= 3 && accuracyPct(s) < 50,
  );

  // Absence flags: no sessions in 7+ days OR lastSessionAt null
  const absenceStudents = roster.filter((s) => {
    const days = daysSinceSession(s.lastSessionAt);
    return days === null || days >= 7;
  });

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
        {/* ── Header ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 4 }}>
            💬 Feedback Panel — Student Signals
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Signals derived from live play data. Updated each time students complete a session.
          </div>
        </div>

        {/* ── Info banner ── */}
        <div
          style={{
            background: "rgba(155,114,255,0.10)",
            border: `1px solid rgba(155,114,255,0.28)`,
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>
            <strong>Auto-detected from play sessions.</strong> No manual entry needed. These signals
            surface students who may need your attention based on their in-game behaviour.
          </div>
        </div>

        {/* ── Error state ── */}
        {error && (
          <div
            style={{
              background: C.surface,
              borderRadius: 14,
              padding: "20px 22px",
              border: `1px solid rgba(239,68,68,0.3)`,
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
                border: `1.5px solid rgba(239,68,68,0.4)`,
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

        {/* ── Sections ── */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
          {loading ? (
            <>
              <SkeletonSection />
              <SkeletonSection />
              <SkeletonSection />
            </>
          ) : (
            <>
              {/* Section 1: Confidence Signals */}
              <Section
                icon="📉"
                title="Confidence Signals"
                subtitle="Students flagged in the intervention queue — hitting skill floors repeatedly."
                accentColor={C.amber}
                empty={confidenceStudents.length === 0}
              >
                {confidenceStudents.map((s) => (
                  <StudentPill
                    key={s.studentId}
                    student={s}
                    accent={C.amber}
                    detail={`In intervention queue · ${s.sessionsLast7d} session${s.sessionsLast7d === 1 ? "" : "s"} this week`}
                  />
                ))}
              </Section>

              {/* Section 2: Hint Patterns */}
              <Section
                icon="💡"
                title="Hint Patterns"
                subtitle="Students with low accuracy this week — may be relying on hints or struggling with content."
                accentColor={C.violet}
                empty={hintPatternStudents.length === 0}
              >
                {hintPatternStudents.map((s) => (
                  <StudentPill
                    key={s.studentId}
                    student={s}
                    accent={C.violet}
                    detail={`${accuracyPct(s)}% accuracy · ${s.sessionsLast7d} session${s.sessionsLast7d === 1 ? "" : "s"} this week`}
                  />
                ))}
              </Section>

              {/* Section 3: Absence Flags */}
              <Section
                icon="📅"
                title="Absence Flags"
                subtitle="Students with no sessions in 7 or more days — may need a check-in."
                accentColor={C.blue}
                empty={absenceStudents.length === 0}
              >
                {absenceStudents.map((s) => {
                  const days = daysSinceSession(s.lastSessionAt);
                  const detail =
                    days === null
                      ? "No sessions recorded yet"
                      : `Last session ${days} day${days === 1 ? "" : "s"} ago`;
                  return (
                    <StudentPill
                      key={s.studentId}
                      student={s}
                      accent={C.blue}
                      detail={detail}
                    />
                  );
                })}
              </Section>
            </>
          )}
        </div>

        {/* ── Footer links ── */}
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
            href="/teacher/support"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.blue,
              textDecoration: "none",
              padding: "5px 12px",
              borderRadius: 8,
              background: "rgba(56,189,248,0.08)",
              border: `1px solid rgba(56,189,248,0.2)`,
            }}
          >
            Support queue →
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
              border: `1px solid rgba(245,158,11,0.2)`,
            }}
          >
            Intervention Overview →
          </a>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: C.muted, fontStyle: "italic" }}>
            Signals refresh each session. Data is class-level only — no cross-class comparisons.
          </span>
        </div>
      </div>
    </AppFrame>
  );
}
