"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";

// ---------------------------------------------------------------------------
// Colour palette
// ---------------------------------------------------------------------------
const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
};

// ---------------------------------------------------------------------------
// Types (matching StudentDetail from teacher-service)
// ---------------------------------------------------------------------------
type StudentDetail = {
  studentId: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
  sessionsLast30d: number;
  correctLast30d: number;
  totalLast30d: number;
  topSkills: { skill: string; correctCount: number; totalCount: number }[];
  recentSessions: {
    sessionId: string;
    startedAt: string;
    sessionMode: string;
    correctCount: number;
    totalQuestions: number;
    effectivenessScore: number | null;
  }[];
  activeInterventions: {
    id: string;
    reason: string;
    skillCode: string | null;
    createdAt: string;
    teacherNote: string | null;
  }[];
  teacherNote: { body: string; updatedAt: string } | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function masteryPct(correct: number, total: number): number {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

type SkillStatus = "strong" | "building" | "started";

function skillStatus(pct: number): SkillStatus {
  if (pct >= 65) return "strong";
  if (pct >= 35) return "building";
  return "started";
}

function skillBarColor(status: SkillStatus): string {
  if (status === "strong") return C.mint;
  if (status === "building") return C.blue;
  return "rgba(255,255,255,0.2)";
}

function skillBadgeStyle(status: SkillStatus): React.CSSProperties {
  if (status === "strong")
    return { background: "rgba(34,197,94,0.15)", color: C.mint, border: "1px solid rgba(34,197,94,0.35)" };
  if (status === "building")
    return { background: "rgba(56,189,248,0.15)", color: C.blue, border: "1px solid rgba(56,189,248,0.35)" };
  return { background: "rgba(255,255,255,0.07)", color: C.muted, border: "1px solid rgba(255,255,255,0.12)" };
}

function skillStatusLabel(status: SkillStatus): string {
  if (status === "strong") return "Strong";
  if (status === "building") return "Building";
  return "Just started";
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString("en", { weekday: "short" });
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function avatarInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Card({
  title,
  titleRight,
  children,
}: {
  title: string;
  titleRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
            color: C.muted,
          }}
        >
          {title}
        </span>
        {titleRight}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TeacherStudentDetailPage() {
  const params = useParams();
  const studentId = params?.studentId as string | undefined;
  const teacherId = getTeacherId();

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteExpanded, setNoteExpanded] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/teacher/students/${studentId}?teacherId=${encodeURIComponent(teacherId)}`)
      .then((r) => r.json())
      .then((data: { student?: StudentDetail; error?: string }) => {
        if (data.error) throw new Error(data.error);
        setStudent(data.student ?? null);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load student");
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 14 }}>
          Loading student…
        </div>
      </AppFrame>
    );
  }

  if (error || !student) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <div style={{ minHeight: "100vh", background: C.base, padding: "40px 28px" }}>
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 18px", color: C.red, fontSize: 13 }}>
            {error ?? "Student not found."}
          </div>
          <Link href="/teacher/class" style={{ display: "inline-block", marginTop: 16, color: C.blue, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            ← Back to class
          </Link>
        </div>
      </AppFrame>
    );
  }

  const initials = avatarInitials(student.displayName);
  const hasActiveIntervention = student.activeInterventions.length > 0;
  const firstIntervention = student.activeInterventions[0];

  // Build week activity from recent sessions (last 7 days by day-of-week)
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const now = new Date();
  for (const sess of student.recentSessions) {
    const d = new Date(sess.startedAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400_000);
    if (diffDays < 7) {
      const lbl = d.toLocaleDateString("en", { weekday: "short" });
      if (lbl in weekCounts) weekCounts[lbl]++;
    }
  }
  const weekActivity = dayLabels.map((lbl) => ({ label: lbl, count: weekCounts[lbl] ?? 0 }));
  const maxWeek = Math.max(...weekActivity.map((d) => d.count), 1);

  const masteryPctOverall = masteryPct(student.correctLast30d, student.totalLast30d);

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: C.text,
          paddingBottom: 60,
        }}
      >
        {/* Topbar */}
        <div
          style={{
            borderBottom: `1px solid ${C.border}`,
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Link
            href="/teacher/class"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.muted,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            ← Class
          </Link>
          <span style={{ color: C.border, fontSize: 16 }}>/</span>
          <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>
            {student.displayName}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Link
              href="/teacher/command"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.blue,
                textDecoration: "none",
                padding: "6px 14px",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: 8,
              }}
            >
              Command Center
            </Link>
          </div>
        </div>

        {/* Student profile header */}
        <div
          style={{
            margin: "22px 28px 0",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "20px 22px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            {/* Avatar */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: C.violet,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 900,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 6 }}>
                {student.displayName}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 14,
                    background: "rgba(155,114,255,0.15)",
                    color: C.violet,
                    border: "1px solid rgba(155,114,255,0.3)",
                  }}
                >
                  {student.launchBandCode}
                </span>
                <span style={{ fontSize: 11, color: C.muted }}>
                  Level {student.currentLevel}
                </span>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap" as const }}>
                {[
                  { val: `⭐ ${student.totalPoints.toLocaleString()}`, lbl: "Total points" },
                  { val: String(student.sessionsLast30d), lbl: "Sessions (30d)" },
                  { val: `${masteryPctOverall}%`, lbl: "Accuracy (30d)" },
                  { val: String(student.badgeCount), lbl: "Badges" },
                ].map(({ val, lbl }) => (
                  <div key={lbl} style={{ textAlign: "center" as const }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{val}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Active intervention flag */}
              {hasActiveIntervention && firstIntervention && (
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 14px",
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.35)",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.amber,
                  }}
                >
                  <span>⚠️</span>
                  <span>Active intervention — {firstIntervention.reason}</span>
                  <Link
                    href={`/teacher/interventions/${studentId ?? ""}`}
                    style={{
                      marginLeft: "auto",
                      padding: "5px 12px",
                      background: C.amber,
                      color: "#100b2e",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 800,
                      textDecoration: "none",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    View intervention
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div
          style={{
            margin: "18px 28px 0",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {/* Top skills */}
          <Card
            title="Skills"
            titleRight={
              <span style={{ fontSize: 11, fontWeight: 700, color: C.blue, cursor: "pointer" }}>
                View all
              </span>
            }
          >
            {student.topSkills.length === 0 ? (
              <div style={{ fontSize: 12, color: C.muted }}>No skill data yet.</div>
            ) : (
              student.topSkills.map((skill, i) => {
                const pct = masteryPct(skill.correctCount, skill.totalCount);
                const status = skillStatus(pct);
                return (
                  <div
                    key={skill.skill}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 0",
                      borderBottom: i < student.topSkills.length - 1 ? `1px solid ${C.border}` : "none",
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: C.text }}>
                      {skill.skill}
                    </span>
                    <div
                      style={{
                        width: 60,
                        height: 5,
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: 3,
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: skillBarColor(status),
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: C.muted, minWidth: 28, textAlign: "right" as const }}>
                      {pct}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 6,
                        whiteSpace: "nowrap" as const,
                        ...skillBadgeStyle(status),
                      }}
                    >
                      {skillStatusLabel(status)}
                    </span>
                  </div>
                );
              })
            )}
          </Card>

          {/* Recent sessions */}
          <Card title="Recent Sessions">
            {student.recentSessions.length === 0 ? (
              <div style={{ fontSize: 12, color: C.muted }}>No sessions yet.</div>
            ) : (
              student.recentSessions.slice(0, 8).map((sess, i) => (
                <div
                  key={sess.sessionId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 0",
                    borderBottom: i < Math.min(student.recentSessions.length, 8) - 1 ? `1px solid ${C.border}` : "none",
                    fontSize: 11,
                  }}
                >
                  <span style={{ minWidth: 68, color: C.muted, fontWeight: 600 }}>
                    {fmtDate(sess.startedAt)}
                  </span>
                  <span style={{ flex: 1, fontWeight: 700, color: C.text }}>
                    {sess.sessionMode}
                  </span>
                  <span style={{ color: C.muted }}>
                    {sess.correctCount}/{sess.totalQuestions}
                  </span>
                  {sess.effectivenessScore != null && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 6,
                        background: "rgba(255,209,102,0.15)",
                        color: C.gold,
                        border: "1px solid rgba(255,209,102,0.35)",
                      }}
                    >
                      ⭐ {Math.round(sess.effectivenessScore)}
                    </span>
                  )}
                </div>
              ))
            )}
          </Card>

          {/* Sessions this week (activity bars) */}
          <Card title="Sessions This Week">
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 7 }}>
              {weekActivity.map((day) => (
                <div key={day.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, minWidth: 28 }}>
                    {day.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    {day.count > 0 && (
                      <div
                        style={{
                          width: `${(day.count / maxWeek) * 100}%`,
                          height: "100%",
                          background: C.blue,
                          borderRadius: 3,
                        }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: C.muted, minWidth: 20, textAlign: "right" as const }}>
                    {day.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Teacher note */}
          <Card
            title="Teacher Note"
            titleRight={
              <button
                onClick={() => setNoteExpanded(!noteExpanded)}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.blue,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                type="button"
              >
                Edit
              </button>
            }
          >
            <div
              style={{
                background: "rgba(56,189,248,0.06)",
                border: "1px solid rgba(56,189,248,0.18)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                color: "rgba(240,246,255,0.75)",
                lineHeight: 1.6,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  color: C.blue,
                  marginBottom: 6,
                }}
              >
                Private note — visible to teacher only
              </div>
              {student.teacherNote ? student.teacherNote.body : "No note yet."}
            </div>
            <button
              type="button"
              style={{
                width: "100%",
                padding: "9px",
                background: "transparent",
                border: "1.5px solid rgba(56,189,248,0.3)",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                color: C.blue,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              + Add / edit note
            </button>
          </Card>
        </div>
      </div>
    </AppFrame>
  );
}
