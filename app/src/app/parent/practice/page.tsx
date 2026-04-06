"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  faint: "rgba(255,255,255,0.1)",
  border: "rgba(155,114,255,0.2)",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────

type SkillRow = {
  skillCode?: string;
  skillLabel?: string;
  skillName?: string;
  skillId?: string;
  subject?: string;
  subjectCode?: string;
  accuracy?: number;
  masteryPct?: number;
  sessionsCount?: number;
  sessionCount?: number;
  correctCount?: number;
  totalCount?: number;
};

type ReportStats = {
  starsEarned: number;
  sessions: number;
  learningMinutes: number;
  streakDays: number;
};

type ReportData = {
  displayName: string;
  launchBandCode: string;
  stats: ReportStats;
  skills: SkillRow[];
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getStudentIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("wonderquest-child-id="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function skillName(s: SkillRow): string {
  return s.skillLabel ?? s.skillName ?? s.skillCode ?? "Unknown skill";
}

function skillAccuracy(s: SkillRow): number {
  if (typeof s.accuracy === "number") return s.accuracy;
  if (typeof s.masteryPct === "number") return s.masteryPct;
  if (s.correctCount != null && s.totalCount != null && s.totalCount > 0) {
    return Math.round((s.correctCount / s.totalCount) * 100);
  }
  return 0;
}

function skillSessions(s: SkillRow): number {
  return s.sessionsCount ?? s.sessionCount ?? 0;
}

function subjectLabel(s: SkillRow): string {
  const raw = s.subject ?? s.subjectCode ?? "";
  if (raw.toLowerCase().includes("read") || raw.toLowerCase().includes("phonics")) return "Reading";
  if (raw.toLowerCase().includes("math") || raw.toLowerCase().includes("number")) return "Maths";
  return raw || "General";
}

function subjectColor(s: SkillRow): string {
  const sub = subjectLabel(s).toLowerCase();
  if (sub === "reading") return C.mint;
  if (sub === "maths") return C.violet;
  return C.gold;
}

// Sort skills by "needs practice most": lowest accuracy first, tie-break by fewest sessions
function prioritySort(skills: SkillRow[]): SkillRow[] {
  return [...skills].sort((a, b) => {
    const accDiff = skillAccuracy(a) - skillAccuracy(b);
    if (accDiff !== 0) return accDiff;
    return skillSessions(a) - skillSessions(b);
  });
}

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "14px 16px",
        flex: 1,
        minWidth: 0,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Accuracy bar ───────────────────────────────────────────────────────────

function AccuracyBar({ pct, color }: { pct: number; color: string }) {
  const capped = Math.min(100, Math.max(0, pct));
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
          width: `${capped}%`,
          background: color,
          borderRadius: 4,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ParentPracticePage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const studentId = getStudentIdFromCookie();
    if (!studentId) {
      setError("No child selected. Please select a child from your dashboard.");
      setLoading(false);
      return;
    }

    fetch(`/api/parent/report?studentId=${encodeURIComponent(studentId)}&weekOffset=0`)
      .then((r) => r.json())
      .then((data) => {
        if (data.report) {
          setReport(data.report as ReportData);
        } else {
          setError(data.error ?? "Could not load practice data.");
        }
      })
      .catch(() => setError("Could not load practice data."))
      .finally(() => setLoading(false));
  }, []);

  const allSkills = report?.skills ?? [];
  const sorted = prioritySort(allSkills);
  const focusSkills = sorted.slice(0, 3);
  const childName = report?.displayName ?? "your child";
  const stats = report?.stats;

  // Sessions this week from stats
  const sessionsThisWeek = stats?.sessions ?? 0;
  const starsEarned = stats?.starsEarned ?? 0;
  const skillsPracticed = allSkills.length;

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
            ← Dashboard
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 4 }}>
            📚 Practice
          </h1>
          {!loading && !error && (
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
              {childName}&apos;s skill practice overview
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
            Loading practice data…
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 14,
              padding: "16px 20px",
              fontSize: 14,
              color: "#f87171",
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        {/* Main content */}
        {!loading && !error && report && (
          <>
            {/* Quick stats strip */}
            <div
              style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}
            >
              <StatCard icon="🎯" value={sessionsThisWeek} label="Sessions this week" />
              <StatCard icon="⭐" value={starsEarned} label="Stars earned" />
              <StatCard icon="📖" value={skillsPracticed} label="Skills practiced" />
            </div>

            {/* Today's focus */}
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: C.muted,
                  marginBottom: 12,
                }}
              >
                Today&apos;s focus
              </div>

              {focusSkills.length === 0 ? (
                <div
                  style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    borderRadius: 14,
                    padding: "16px 20px",
                    fontSize: 14,
                    color: C.mint,
                  }}
                >
                  🌟 All skills looking strong this week — keep it up!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {focusSkills.map((skill, i) => {
                    const acc = skillAccuracy(skill);
                    const sessions = skillSessions(skill);
                    const color = subjectColor(skill);
                    const label = subjectLabel(skill);
                    return (
                      <div
                        key={skill.skillCode ?? skill.skillId ?? i}
                        style={{
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                          borderRadius: 14,
                          padding: "14px 16px",
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
                            background: `${color}20`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            flexShrink: 0,
                          }}
                        >
                          {label === "Reading" ? "📖" : label === "Maths" ? "🔢" : "✨"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: C.text,
                              marginBottom: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {skillName(skill)}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted }}>
                            {label} · {sessions} {sessions === 1 ? "session" : "sessions"}
                          </div>
                          <AccuracyBar pct={acc} color={color} />
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: acc < 50 ? C.amber : color,
                            flexShrink: 0,
                          }}
                        >
                          {acc}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Skill areas grid */}
            {allSkills.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: C.muted,
                    marginBottom: 12,
                  }}
                >
                  Skill areas
                </div>
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  {sorted.map((skill, i) => {
                    const acc = skillAccuracy(skill);
                    const color = subjectColor(skill);
                    return (
                      <div
                        key={skill.skillCode ?? skill.skillId ?? i}
                        style={{
                          padding: "12px 16px",
                          borderBottom:
                            i < sorted.length - 1 ? `1px solid ${C.faint}` : "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: C.text,
                              marginBottom: 4,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {skillName(skill)}
                          </div>
                          <AccuracyBar pct={acc} color={color} />
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: acc < 50 ? C.amber : color,
                            flexShrink: 0,
                            minWidth: 38,
                            textAlign: "right",
                          }}
                        >
                          {acc}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Start practice CTA */}
            <Link
              href="/play"
              style={{
                display: "block",
                width: "100%",
                padding: "15px 20px",
                background: C.violet,
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 800,
                textAlign: "center",
                textDecoration: "none",
                marginBottom: 16,
                boxSizing: "border-box",
              }}
            >
              Start practice ✨
            </Link>

            {/* Footer links */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Link
                href="/parent/report"
                style={{ fontSize: 13, fontWeight: 700, color: C.violet, textDecoration: "none" }}
              >
                Full report →
              </Link>
              <Link
                href="/parent/planner"
                style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none" }}
              >
                Practice planner →
              </Link>
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
