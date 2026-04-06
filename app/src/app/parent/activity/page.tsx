"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE = "#100b2e";
const VIOLET = "#9b72ff";
const GOLD = "#ffd166";
const MINT = "#4ade80";
const CORAL = "#f87171";
const TEXT = "#f0f6ff";
const MUTED = "#8b949e";
const SURFACE = "#161b22";
const BORDER = "rgba(255,255,255,0.06)";

// ─── Types ────────────────────────────────────────────────────────────────────

type RecentSession = {
  sessionId: string;
  startedAt: string;
  sessionMode: string;
  starsEarned: number;
  correctCount: number;
  totalQuestions: number;
  durationMinutes: number | null;
  skillNames: string[];
};

type DayGroup = {
  dateStr: string;
  sessions: RecentSession[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByDay(sessions: RecentSession[]): Map<string, RecentSession[]> {
  const groups = new Map<string, RecentSession[]>();
  for (const s of sessions) {
    const key = new Date(s.startedAt).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  return groups;
}

function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function accuracyColor(pct: number): string {
  if (pct >= 80) return MINT;
  if (pct >= 60) return GOLD;
  return CORAL;
}

// ─── Summary stats derivation ─────────────────────────────────────────────────

type Stats = {
  totalSessions: number;
  sessionsThisWeek: number;
  avgAccuracy: number | null;
  streakDays: number;
};

function deriveStats(sessions: RecentSession[]): Stats {
  const total = sessions.length;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const sessionsThisWeek = sessions.filter((s) => new Date(s.startedAt) >= weekStart).length;

  const sessionsWithData = sessions.filter((s) => s.totalQuestions > 0);
  const avgAccuracy =
    sessionsWithData.length > 0
      ? Math.round(
          sessionsWithData.reduce(
            (sum, s) => sum + (s.correctCount / s.totalQuestions) * 100,
            0,
          ) / sessionsWithData.length,
        )
      : null;

  const daySet = new Set(sessions.map((s) => new Date(s.startedAt).toDateString()));
  let streakDays = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (daySet.has(cursor.toDateString())) {
    streakDays++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { totalSessions: total, sessionsThisWeek, avgAccuracy, streakDays };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: string;
  accent: string;
}) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: "100px",
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: "14px",
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ fontSize: "1.4rem" }}>{icon}</div>
      <div style={{ fontSize: "1.35rem", fontWeight: 800, color: accent, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "0.68rem", fontWeight: 600, color: MUTED, lineHeight: 1.3 }}>
        {label}
      </div>
    </div>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  const isGuided = mode?.toLowerCase() === "guided";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "20px",
        fontSize: "0.68rem",
        fontWeight: 700,
        background: isGuided ? "rgba(56,189,248,0.15)" : "rgba(155,114,255,0.15)",
        color: isGuided ? "#38bdf8" : VIOLET,
        whiteSpace: "nowrap",
      }}
    >
      {isGuided ? "Guided" : "Challenge"}
    </span>
  );
}

function SkillChip({ name }: { name: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "20px",
        fontSize: "0.65rem",
        fontWeight: 600,
        background: "rgba(255,255,255,0.06)",
        color: TEXT,
        border: `1px solid rgba(255,255,255,0.1)`,
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </span>
  );
}

function SessionCard({ session }: { session: RecentSession }) {
  const hasQuestions = session.totalQuestions > 0;
  const accuracy = hasQuestions
    ? Math.round((session.correctCount / session.totalQuestions) * 100)
    : null;
  const accColor = accuracy != null ? accuracyColor(accuracy) : MUTED;
  const skillList = Array.isArray(session.skillNames) ? session.skillNames.slice(0, 3) : [];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${BORDER}`,
        borderRadius: "14px",
        padding: "14px 16px",
        marginBottom: "10px",
      }}
    >
      {/* Row 1: icon + title + time */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "17px",
            flexShrink: 0,
            background: "rgba(155,114,255,0.18)",
          }}
        >
          🎯
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.84rem", fontWeight: 700, color: TEXT }}>
              Session complete
            </span>
            <ModeBadge mode={session.sessionMode} />
          </div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.28)", marginTop: "1px" }}>
            {formatTime(session.startedAt)}
          </div>
        </div>
      </div>

      {/* Row 2: stats strip */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginTop: "12px",
          alignItems: "center",
        }}
      >
        {hasQuestions && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "0.68rem", color: MUTED, fontWeight: 600 }}>Questions</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: accColor }}>
              {session.correctCount} of {session.totalQuestions} correct{" "}
              <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>({accuracy}%)</span>
            </span>
          </div>
        )}

        {session.durationMinutes != null && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "0.68rem", color: MUTED, fontWeight: 600 }}>Duration</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: TEXT }}>
              {session.durationMinutes} min
            </span>
          </div>
        )}

        {session.starsEarned > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "0.68rem", color: MUTED, fontWeight: 600 }}>Points</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: GOLD }}>
              +{session.starsEarned} ⭐
            </span>
          </div>
        )}
      </div>

      {/* Row 3: skill chips */}
      {skillList.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
          {skillList.map((name) => (
            <SkillChip key={name} name={name} />
          ))}
          {session.skillNames.length > 3 && (
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "20px",
                fontSize: "0.65rem",
                fontWeight: 600,
                color: MUTED,
              }}
            >
              +{session.skillNames.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function ParentActivityPage() {
  const [sessions, setSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const studentId =
      typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null;
    if (!studentId) {
      setLoading(false);
      return;
    }
    fetch(`/api/parent/activity?studentId=${encodeURIComponent(studentId)}&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = deriveStats(sessions);
  const visibleSessions = showAll ? sessions : sessions.slice(0, PAGE_SIZE);
  const dayGroups = groupByDay(visibleSessions);

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div
        style={{
          minHeight: "100vh",
          background: BASE,
          color: TEXT,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          padding: "32px",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Page header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "28px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: VIOLET,
                  marginBottom: "4px",
                }}
              >
                Activity Feed
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: TEXT, margin: 0 }}>
                📋 Recent activity
              </h1>
            </div>
          </div>

          {/* Privacy note */}
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(56,189,248,0.07)",
              border: "1px solid rgba(56,189,248,0.18)",
              borderRadius: "10px",
              fontSize: "0.75rem",
              color: "rgba(56,189,248,0.8)",
              lineHeight: 1.5,
              marginBottom: "24px",
            }}
          >
            🔒 This feed shows positive milestones only — sessions, badges, levels, and streaks.
            Wrong-answer details are never shown.
          </div>

          {/* Summary stats strip */}
          {!loading && sessions.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <StatCard
                icon="🎮"
                label="Total sessions"
                value={String(stats.totalSessions)}
                accent={VIOLET}
              />
              <StatCard
                icon="📅"
                label="This week"
                value={String(stats.sessionsThisWeek)}
                accent={TEXT}
              />
              <StatCard
                icon="🎯"
                label="Avg accuracy"
                value={stats.avgAccuracy != null ? `${stats.avgAccuracy}%` : "—"}
                accent={stats.avgAccuracy != null ? accuracyColor(stats.avgAccuracy) : MUTED}
              />
              <StatCard
                icon="🔥"
                label="Streak days"
                value={String(stats.streakDays)}
                accent={GOLD}
              />
            </div>
          )}

          {/* Feed card */}
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: "20px",
              padding: "24px",
            }}
          >
            {loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: MUTED,
                  fontSize: "0.88rem",
                }}
              >
                Loading activity…
              </div>
            )}

            {!loading && sessions.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎮</div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: TEXT,
                    marginBottom: "6px",
                  }}
                >
                  No sessions yet
                </div>
                <div style={{ fontSize: "0.8rem", color: MUTED }}>
                  No sessions yet — once your child starts playing, their activity will appear
                  here! 🎮
                </div>
              </div>
            )}

            {!loading && sessions.length > 0 && (
              <>
                {Array.from(dayGroups.entries()).map(([dateKey, daySessions]) => (
                  <div key={dateKey} style={{ marginBottom: "20px" }}>
                    {/* Day header */}
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: MUTED,
                        marginBottom: "10px",
                        paddingBottom: "6px",
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      {formatDayHeader(dateKey)}
                    </div>
                    {daySessions.map((s) => (
                      <SessionCard key={s.sessionId} session={s} />
                    ))}
                  </div>
                ))}

                {/* Load more */}
                {sessions.length > PAGE_SIZE && (
                  <div
                    style={{
                      textAlign: "center",
                      paddingTop: "14px",
                      borderTop: `1px solid ${BORDER}`,
                      marginTop: "4px",
                    }}
                  >
                    <button
                      onClick={() => setShowAll((v) => !v)}
                      style={{
                        background: "transparent",
                        border: `1.5px solid rgba(155,114,255,0.25)`,
                        borderRadius: "10px",
                        padding: "9px 24px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: VIOLET,
                        cursor: "pointer",
                        fontFamily: "system-ui",
                      }}
                    >
                      {showAll ? "Show less" : `Show more (${sessions.length - PAGE_SIZE} more)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Accuracy guide */}
          <div
            style={{
              marginTop: "24px",
              padding: "18px 20px",
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: MUTED,
                marginBottom: "12px",
              }}
            >
              Accuracy guide
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { color: MINT, label: "≥ 80% — Great" },
                { color: GOLD, label: "60–79% — Good" },
                { color: CORAL, label: "< 60% — Needs practice" },
              ].map((e) => (
                <div
                  key={e.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 10px",
                    background: `${e.color}18`,
                    borderRadius: "20px",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: e.color,
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: e.color,
                      display: "inline-block",
                    }}
                  />
                  {e.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
