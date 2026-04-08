"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { fetchTeacherId } from "@/lib/teacher-identity";
import { setActiveStudentId } from "@/lib/active-student";
import TeacherGate from "../../teacher-gate";

// ---------------------------------------------------------------------------
// Colour palette
// ---------------------------------------------------------------------------
const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#50e890",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "rgba(155,114,255,0.07)",
  border: "rgba(155,114,255,0.18)",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ReportStudent = {
  id: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  username: string;
};

type ReportStats = {
  totalSessions: number;
  completedSessions: number;
  totalTimeMs: number;
  avgAccuracyPct: number;
  totalPoints: number;
  streakDays: number;
};

type RecentSession = {
  id: string;
  sessionMode: string;
  startedAt: string;
  endedAt: string | null;
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  effectivenessScore: number | null;
};

type SkillEntry = {
  skillCode: string;
  masteryPct: number;
};

type Report = {
  student: ReportStudent;
  stats: ReportStats;
  recentSessions: RecentSession[];
  topSkills: SkillEntry[];
  skillGaps: SkillEntry[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getAvatarSymbol(key: string): string {
  if (key.includes("bunny")) return "🐰";
  if (key.includes("bear")) return "🐻";
  if (key.includes("lion")) return "🦁";
  if (key.includes("fox")) return "🦊";
  if (key.includes("panda")) return "🐼";
  if (key.includes("owl")) return "🦉";
  return "✨";
}

function fmtDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString("en", { weekday: "short" });
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function sessionDuration(sess: RecentSession): string {
  if (!sess.endedAt) return "—";
  const ms = new Date(sess.endedAt).getTime() - new Date(sess.startedAt).getTime();
  return fmtDuration(ms);
}

function sessionAccuracy(sess: RecentSession): string {
  if (!sess.totalQuestions) return "—";
  return `${Math.round((sess.correctAnswers / sess.totalQuestions) * 100)}%`;
}

function bandLabel(code: string): string {
  if (code === "PREK" || code === "P0") return "Pre-K (P0)";
  if (code === "K1" || code === "P1") return "K–1 (P1)";
  if (code === "G23" || code === "P2") return "G2–3 (P2)";
  if (code === "G45" || code === "P3") return "G4–5 (P3)";
  return code;
}

// ---------------------------------------------------------------------------
// Card component
// ---------------------------------------------------------------------------
function Card({
  title,
  children,
  style,
}: {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: 24,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
            color: C.muted,
            marginBottom: 16,
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------
function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: 6,
        background: "rgba(255,255,255,0.08)",
        borderRadius: 3,
        overflow: "hidden",
        marginTop: 4,
      }}
    >
      <div
        style={{
          width: `${Math.min(pct, 100)}%`,
          height: "100%",
          background: color,
          borderRadius: 3,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TeacherStudentReportPage() {
  const params = useParams();
  const studentId = params?.studentId as string | undefined;

  const [authed, setAuthed] = useState(false);
  useEffect(() => { fetchTeacherId().then(id => setAuthed(!!id)); }, []);

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void (async () => {
    if (!authed) return;
    if (!studentId) return;
    // Persist active student so teacher nav context stays consistent
    setActiveStudentId(studentId);
    const teacherId = await fetchTeacherId();
    setLoading(true);
    setError(null);
    fetch(`/api/teacher/students/${studentId}/report?teacherId=${encodeURIComponent(teacherId)}`)
      .then((r) => r.json())
      .then((data: Partial<Report> & { error?: string }) => {
        if (data.error) throw new Error(data.error);
        setReport(data as Report);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load student report");
      })
      .finally(() => setLoading(false));
  })(); }, [studentId, authed]);

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  if (loading) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 14 }}>
          Loading student report…
        </div>
      </AppFrame>
    );
  }

  if (error || !report) {
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

  const { student, stats, recentSessions, topSkills, skillGaps } = report;
  const avatarSymbol = getAvatarSymbol(student.avatarKey);

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
        {/* ── Student hero header ── */}
        <div
          style={{
            padding: "32px 28px 24px",
            borderBottom: "1px solid rgba(155,114,255,0.12)",
          }}
        >
          <Link
            href="/teacher/class"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: C.muted,
              textDecoration: "none",
              marginBottom: 20,
            }}
          >
            ← Back to class
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Avatar */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(155,114,255,0.2)",
                border: "2px solid rgba(155,114,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                flexShrink: 0,
              }}
            >
              {avatarSymbol}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.text, marginBottom: 6 }}>
                {student.displayName}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
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
                  {bandLabel(student.launchBandCode)}
                </span>
                {student.username && (
                  <span style={{ fontSize: 12, color: C.muted }}>@{student.username}</span>
                )}
                {stats.streakDays > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 14,
                      background: "rgba(255,209,102,0.15)",
                      color: C.gold,
                      border: "1px solid rgba(255,209,102,0.3)",
                    }}
                  >
                    🔥 {stats.streakDays}-day streak
                  </span>
                )}
              </div>
            </div>

            {/* Quick back link to Command Center */}
            <Link
              href="/teacher/command"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.blue,
                textDecoration: "none",
                padding: "7px 16px",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: 10,
                flexShrink: 0,
              }}
            >
              Command Center
            </Link>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            padding: "24px 28px 0",
          }}
        >
          {[
            { val: String(stats.totalSessions), lbl: "Total sessions" },
            { val: `${stats.avgAccuracyPct}%`, lbl: "Accuracy" },
            { val: fmtDuration(stats.totalTimeMs), lbl: "Time spent" },
            { val: `⭐ ${stats.totalPoints.toLocaleString()}`, lbl: "Total points" },
          ].map(({ val, lbl }) => (
            <Card key={lbl} style={{ textAlign: "center" as const, padding: "20px 16px" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1.1 }}>{val}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{lbl}</div>
            </Card>
          ))}
        </div>

        {/* ── Content grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            padding: "16px 28px 0",
          }}
        >
          {/* Recent Sessions */}
          <Card title="Recent Sessions">
            {recentSessions.length === 0 ? (
              <div style={{ fontSize: 12, color: C.muted }}>No sessions yet.</div>
            ) : (
              <div>
                {/* Header row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 60px 60px 50px",
                    gap: 8,
                    padding: "0 0 8px",
                    borderBottom: "1px solid rgba(155,114,255,0.12)",
                    fontSize: 10,
                    fontWeight: 800,
                    color: C.muted,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.08em",
                  }}
                >
                  <span>Date</span>
                  <span>Mode</span>
                  <span style={{ textAlign: "center" as const }}>Q's</span>
                  <span style={{ textAlign: "center" as const }}>Accuracy</span>
                  <span style={{ textAlign: "right" as const }}>Time</span>
                </div>
                {recentSessions.map((sess) => (
                  <div
                    key={sess.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr 60px 60px 50px",
                      gap: 8,
                      padding: "9px 0",
                      borderBottom: "1px solid rgba(155,114,255,0.08)",
                      fontSize: 12,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: C.muted, fontWeight: 600 }}>{fmtDate(sess.startedAt)}</span>
                    <span style={{ fontWeight: 700, color: C.text }}>
                      {sess.sessionMode === "guided" ? "Guided" : sess.sessionMode === "self_directed" ? "Self-directed" : sess.sessionMode}
                    </span>
                    <span style={{ textAlign: "center" as const, color: C.muted }}>
                      {sess.totalQuestions > 0 ? `${sess.correctAnswers}/${sess.totalQuestions}` : "—"}
                    </span>
                    <span
                      style={{
                        textAlign: "center" as const,
                        fontWeight: 700,
                        color:
                          sess.totalQuestions > 0
                            ? Math.round((sess.correctAnswers / sess.totalQuestions) * 100) >= 70
                              ? C.mint
                              : C.amber
                            : C.muted,
                      }}
                    >
                      {sessionAccuracy(sess)}
                    </span>
                    <span style={{ textAlign: "right" as const, color: C.muted }}>{sessionDuration(sess)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Skills column */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
            {/* Skill Strengths */}
            <Card title="Skill Strengths">
              {topSkills.length === 0 ? (
                <div style={{ fontSize: 12, color: C.muted }}>No skill data yet.</div>
              ) : (
                topSkills.map((skill) => (
                  <div key={skill.skillCode} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{skill.skillCode}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.mint }}>{skill.masteryPct}%</span>
                    </div>
                    <ProgressBar pct={skill.masteryPct} color={C.mint} />
                  </div>
                ))
              )}
            </Card>

            {/* Skill Gaps */}
            <Card title="Needs Work">
              {skillGaps.length === 0 ? (
                <div style={{ fontSize: 12, color: C.muted }}>
                  {topSkills.length === 0 ? "No skill data yet." : "No major skill gaps — great work!"}
                </div>
              ) : (
                skillGaps.map((skill) => (
                  <div key={skill.skillCode} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{skill.skillCode}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.amber }}>{skill.masteryPct}%</span>
                    </div>
                    <ProgressBar pct={skill.masteryPct} color={C.amber} />
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>

        {/* ── Links to other teacher tools ── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "20px 28px 0",
            flexWrap: "wrap" as const,
          }}
        >
          {[
            { label: "View interventions", href: `/teacher/interventions/${studentId ?? ""}` },
            { label: "Assign content", href: "/teacher/assignment" },
            { label: "Support queue", href: "/teacher/support" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.blue,
                textDecoration: "none",
                padding: "8px 16px",
                border: "1px solid rgba(56,189,248,0.25)",
                borderRadius: 10,
                background: "rgba(56,189,248,0.06)",
              }}
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
