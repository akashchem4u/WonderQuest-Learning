"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
} as const;

// ── Roster shape from /api/teacher/class ──────────────────────────────────
interface Student {
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
}

interface ClassData {
  roster: Student[];
}

// ── Computed stats ─────────────────────────────────────────────────────────
interface Stats {
  total: number;
  activeCount: number;
  supportQueueCount: number;
  avgStreak: number;
  onStreakCount: number;
  longStreakCount: number;   // streak >= 7
  midStreakCount: number;    // streak 3-6
  noStreakCount: number;     // streak 0
  avgAccuracy: number;       // correctLast7d / totalLast7d
  highAccuracyCount: number; // accuracy >= 0.8
  buildingCount: number;     // accuracy 0.5-0.79
}

function computeStats(roster: Student[]): Stats {
  const total = roster.length;
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const activeCount = roster.filter((s) => {
    if (!s.lastSessionAt) return false;
    return now - new Date(s.lastSessionAt).getTime() <= sevenDaysMs;
  }).length;

  const supportQueueCount = roster.filter((s) => s.inInterventionQueue).length;

  const onStreakCount = roster.filter((s) => s.streak > 0).length;
  const longStreakCount = roster.filter((s) => s.streak >= 7).length;
  const midStreakCount = roster.filter((s) => s.streak >= 3 && s.streak < 7).length;
  const noStreakCount = roster.filter((s) => s.streak === 0).length;

  const avgStreak =
    total === 0
      ? 0
      : Math.round(roster.reduce((acc, s) => acc + s.streak, 0) / total);

  const accuracies = roster
    .filter((s) => s.totalLast7d > 0)
    .map((s) => s.correctLast7d / s.totalLast7d);

  const avgAccuracy =
    accuracies.length === 0
      ? 0
      : accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

  const highAccuracyCount = accuracies.filter((a) => a >= 0.8).length;
  const buildingCount = accuracies.filter((a) => a >= 0.5 && a < 0.8).length;

  return {
    total,
    activeCount,
    supportQueueCount,
    avgStreak,
    onStreakCount,
    longStreakCount,
    midStreakCount,
    noStreakCount,
    avgAccuracy,
    highAccuracyCount,
    buildingCount,
  };
}

// ── Stub stats for loading / error states ─────────────────────────────────
const STUB: Stats = {
  total: 0,
  activeCount: 0,
  supportQueueCount: 0,
  avgStreak: 0,
  onStreakCount: 0,
  longStreakCount: 0,
  midStreakCount: 0,
  noStreakCount: 0,
  avgAccuracy: 0,
  highAccuracyCount: 0,
  buildingCount: 0,
};

// ── SparkBar component ─────────────────────────────────────────────────────
function SparkBar({ color }: { color: string }) {
  const heights = [8, 12, 10, 15, 18, 16, 20];
  const activeFrom = 3;
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 22 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 6,
            borderRadius: 2,
            background: i >= activeFrom ? color : "rgba(255,255,255,0.1)",
            height: h,
          }}
        />
      ))}
    </div>
  );
}

// ── Circle stat ────────────────────────────────────────────────────────────
function CircleStat({
  value,
  label,
  color,
  bgColor,
}: {
  value: string | number;
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        flexShrink: 0,
        border: `1.5px solid ${color}40`,
      }}
    >
      <span style={{ fontSize: 17, fontWeight: 900, lineHeight: 1, color }}>
        {value}
      </span>
      <span
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginTop: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
type BadgeVariant = "green" | "amber" | "violet";
function Badge({ variant, children }: { variant: BadgeVariant; children: string }) {
  const styles: Record<BadgeVariant, React.CSSProperties> = {
    green: { background: "rgba(34,197,94,0.15)", color: C.mint },
    amber: { background: "rgba(245,158,11,0.15)", color: C.amber },
    violet: { background: "rgba(155,114,255,0.15)", color: C.violet },
  };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 800,
        padding: "3px 10px",
        borderRadius: 8,
        ...styles[variant],
      }}
    >
      {children}
    </span>
  );
}

// ── Segment bar ────────────────────────────────────────────────────────────
function SegBar({ segs }: { segs: { flex: number; color: string }[] }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 6,
      }}
    >
      {segs.map((s, i) => (
        <div key={i} style={{ flex: s.flex, height: 8, background: s.color }} />
      ))}
    </div>
  );
}

// ── Nav link button ────────────────────────────────────────────────────────
function NavBtn({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        padding: "10px 22px",
        borderRadius: 10,
        background: "rgba(155,114,255,0.12)",
        border: `1px solid rgba(155,114,255,0.3)`,
        color: C.violet,
        fontSize: 13,
        fontWeight: 700,
        textDecoration: "none",
        fontFamily: "system-ui,-apple-system,sans-serif",
        transition: "background 0.15s",
      }}
    >
      {children}
    </a>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ClassHealthPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

  const [stats, setStats] = useState<Stats>(STUB);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const teacherId = getTeacherId();
    fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ClassData>;
      })
      .then((data) => {
        setStats(computeStats(data.roster ?? []));
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  const engagementBadge: BadgeVariant =
    stats.total === 0
      ? "amber"
      : stats.activeCount / stats.total >= 0.75
      ? "green"
      : "amber";

  const masteryBadge: BadgeVariant =
    stats.highAccuracyCount > stats.buildingCount ? "green" : "amber";

  const queueBadge: BadgeVariant =
    stats.supportQueueCount === 0 ? "green" : "amber";

  const streakBadge: BadgeVariant =
    stats.total === 0
      ? "amber"
      : stats.onStreakCount / stats.total >= 0.5
      ? "green"
      : "amber";

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/class-health">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/class-health">
      <div
        style={{
          background: C.base,
          minHeight: "100vh",
          padding: "28px 24px",
          fontFamily: "system-ui,-apple-system,sans-serif",
          color: C.text,
        }}
      >
        {/* ── Page header ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 28, maxWidth: 900 }}>
          <div
            style={{ fontSize: 26, fontWeight: 900, color: C.text, marginBottom: 4 }}
          >
            📊 Class Health
          </div>
          <div style={{ fontSize: 14, color: C.muted }}>
            Teacher view · This week
            {loading && (
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 12,
                  color: C.violet,
                  fontWeight: 700,
                }}
              >
                Loading…
              </span>
            )}
            {error && (
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 12,
                  color: C.amber,
                  fontWeight: 700,
                }}
              >
                Using stub data
              </span>
            )}
          </div>
        </div>

        {/* ── 2×2 card grid ─────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
            maxWidth: 880,
            marginBottom: 28,
          }}
        >
          {/* ─ Engagement ─ */}
          <div
            style={{
              background: C.surface,
              borderRadius: 14,
              padding: "18px 20px",
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🏃</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
                  Engagement
                </span>
              </div>
              <Badge variant={engagementBadge}>
                {engagementBadge === "green" ? "Good" : "Watch"}
              </Badge>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <CircleStat
                value={stats.activeCount}
                label="Active"
                color={C.mint}
                bgColor="rgba(34,197,94,0.12)"
              />
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
                <strong style={{ color: C.text }}>{stats.activeCount}</strong>
                {stats.total > 0 && (
                  <span> of {stats.total}</span>
                )}{" "}
                students active this week
                <br />
                Session activity in the last 7 days
              </div>
            </div>

            <SparkBar color={C.mint} />

            <a
              href="/teacher/class"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: C.violet,
                textDecoration: "none",
                marginTop: 8,
              }}
            >
              View student activity →
            </a>
          </div>

          {/* ─ Mastery Velocity ─ */}
          <div
            style={{
              background: C.surface,
              borderRadius: 14,
              padding: "18px 20px",
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>💪</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
                  Mastery Velocity
                </span>
              </div>
              <Badge variant={masteryBadge}>
                {masteryBadge === "green" ? "Good" : "Watch"}
              </Badge>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <CircleStat
                value={`${Math.round(stats.avgAccuracy * 100)}%`}
                label="Accuracy"
                color={C.gold}
                bgColor="rgba(255,209,102,0.12)"
              />
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
                <strong style={{ color: C.text }}>
                  {stats.highAccuracyCount}
                </strong>{" "}
                students at strong accuracy
                <br />
                <strong style={{ color: C.text }}>
                  {stats.buildingCount}
                </strong>{" "}
                building toward mastery
              </div>
            </div>

            <SegBar
              segs={[
                {
                  flex: Math.max(stats.highAccuracyCount, 1),
                  color: C.mint,
                },
                {
                  flex: Math.max(stats.buildingCount, 1),
                  color: C.amber,
                },
                {
                  flex: Math.max(
                    stats.total - stats.highAccuracyCount - stats.buildingCount,
                    1
                  ),
                  color: "rgba(255,255,255,0.1)",
                },
              ]}
            />
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              {[
                { dot: C.mint, label: `Strong (${stats.highAccuracyCount})` },
                { dot: C.amber, label: `Building (${stats.buildingCount})` },
                {
                  dot: "rgba(255,255,255,0.2)",
                  label: `Early (${Math.max(
                    stats.total - stats.highAccuracyCount - stats.buildingCount,
                    0
                  )})`,
                },
              ].map((leg) => (
                <div
                  key={leg.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    color: C.muted,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: leg.dot,
                    }}
                  />
                  {leg.label}
                </div>
              ))}
            </div>

            <a
              href="/teacher/skill-mastery"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: C.violet,
                textDecoration: "none",
              }}
            >
              View skill breakdown →
            </a>
          </div>

          {/* ─ Support Queue ─ */}
          <div
            style={{
              background: C.surface,
              borderRadius: 14,
              padding: "18px 20px",
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
                  Support Queue
                </span>
              </div>
              <Badge variant={queueBadge}>
                {stats.supportQueueCount === 0
                  ? "All clear"
                  : `${stats.supportQueueCount} open`}
              </Badge>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <CircleStat
                value={stats.supportQueueCount}
                label="Need help"
                color={C.amber}
                bgColor="rgba(245,158,11,0.12)"
              />
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
                {stats.supportQueueCount === 0 ? (
                  <>
                    No students flagged for
                    <br />
                    intervention right now.
                  </>
                ) : (
                  <>
                    <strong style={{ color: C.text }}>
                      {stats.supportQueueCount}
                    </strong>{" "}
                    student
                    {stats.supportQueueCount !== 1 ? "s" : ""} flagged for
                    <br />
                    teacher check-in or follow-up.
                  </>
                )}
              </div>
            </div>

            <SparkBar color={C.amber} />

            <a
              href="/teacher/support"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: C.violet,
                textDecoration: "none",
                marginTop: 8,
              }}
            >
              Review support queue →
            </a>
          </div>

          {/* ─ Streak Health ─ */}
          <div
            style={{
              background: C.surface,
              borderRadius: 14,
              padding: "18px 20px",
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🔥</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
                  Streak Health
                </span>
              </div>
              <Badge variant={streakBadge}>
                {streakBadge === "green" ? "Great" : "Watch"}
              </Badge>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <CircleStat
                value={stats.onStreakCount}
                label="On streak"
                color={C.violet}
                bgColor="rgba(155,114,255,0.12)"
              />
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
                <strong style={{ color: C.text }}>{stats.onStreakCount}</strong>
                {stats.total > 0 && <span> of {stats.total}</span>} on active
                streak
                <br />
                Avg streak:{" "}
                <strong style={{ color: C.text }}>{stats.avgStreak}</strong> days
              </div>
            </div>

            <SegBar
              segs={[
                { flex: Math.max(stats.longStreakCount, 1), color: C.gold },
                { flex: Math.max(stats.midStreakCount, 1), color: C.mint },
                { flex: Math.max(stats.noStreakCount, 1), color: "rgba(255,255,255,0.1)" },
              ]}
            />
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              {[
                { dot: C.gold, label: `7+ days (${stats.longStreakCount})` },
                { dot: C.mint, label: `3–6 days (${stats.midStreakCount})` },
                {
                  dot: "rgba(255,255,255,0.2)",
                  label: `No streak (${stats.noStreakCount})`,
                },
              ].map((leg) => (
                <div
                  key={leg.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    color: C.muted,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: leg.dot,
                    }}
                  />
                  {leg.label}
                </div>
              ))}
            </div>

            <a
              href="/teacher/class"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: C.violet,
                textDecoration: "none",
              }}
            >
              View streak breakdown →
            </a>
          </div>
        </div>

        {/* ── Footer nav ────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 880 }}>
          <NavBtn href="/teacher/support">Support Queue</NavBtn>
          <NavBtn href="/teacher/class">Full Class Roster</NavBtn>
        </div>
      </div>
    </AppFrame>
  );
}
