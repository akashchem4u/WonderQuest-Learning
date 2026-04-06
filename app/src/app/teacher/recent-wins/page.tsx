"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  surfaceAlt: "rgba(255,255,255,0.04)",
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

// ── Win card shape ─────────────────────────────────────────────────────────
interface WinCard {
  id: string;
  icon: string;
  headline: string;
  detail: string;
  time: string;
  chipLabel: string;
  chipBg: string;
  chipColor: string;
  encouragement: string;
}

// ── Time helpers ──────────────────────────────────────────────────────────
function hoursAgo(iso: string | null): number {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
}

function friendlyTime(iso: string | null): string {
  if (!iso) return "Unknown";
  const h = hoursAgo(iso);
  if (h < 1) return "Just now";
  if (h < 24) return `${Math.floor(h)}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ── Avatar emoji from key ─────────────────────────────────────────────────
function avatarEmoji(key: string): string {
  const map: Record<string, string> = {
    fox: "🦊", owl: "🦉", bear: "🐻", cat: "🐱", dog: "🐶",
    rabbit: "🐰", penguin: "🐧", lion: "🦁", tiger: "🐯", panda: "🐼",
    dragon: "🐲", unicorn: "🦄", star: "⭐", rocket: "🚀",
  };
  return map[key?.toLowerCase()] ?? "🙂";
}

// ── Derive wins from roster ───────────────────────────────────────────────
function deriveWins(roster: Student[]): WinCard[] {
  const wins: WinCard[] = [];
  if (roster.length === 0) return wins;

  // 1. Active today — lastSessionAt within 24 hours
  const activeToday = roster.filter((s) => hoursAgo(s.lastSessionAt) <= 24);
  activeToday.forEach((s) => {
    wins.push({
      id: `active-${s.studentId}`,
      icon: "🔥",
      headline: `${avatarEmoji(s.avatarKey)} ${s.displayName} played today!`,
      detail: `Logged in and played a session today. Keep the momentum going!`,
      time: `Last active ${friendlyTime(s.lastSessionAt)}`,
      chipLabel: "Active today",
      chipBg: "rgba(245,158,11,0.14)",
      chipColor: "#fbbf24",
      encouragement: "Keep it up!",
    });
  });

  // 2. Most sessions — top 20% by sessionsLast7d (min 2 sessions to qualify)
  const withSessions = roster.filter((s) => s.sessionsLast7d >= 2);
  if (withSessions.length > 0) {
    const sorted = [...withSessions].sort((a, b) => b.sessionsLast7d - a.sessionsLast7d);
    const topCount = Math.max(1, Math.ceil(sorted.length * 0.2));
    sorted.slice(0, topCount).forEach((s) => {
      wins.push({
        id: `sessions-${s.studentId}`,
        icon: "📚",
        headline: `${avatarEmoji(s.avatarKey)} ${s.displayName} is a dedicated learner!`,
        detail: `${s.sessionsLast7d} sessions this week · Level ${s.currentLevel} · ${s.totalPoints.toLocaleString()} total points.`,
        time: "This week · Most sessions",
        chipLabel: "Most sessions",
        chipBg: "rgba(34,197,94,0.12)",
        chipColor: "#4ade80",
        encouragement: "Keep it up!",
      });
    });
  }

  // 3. On a roll — lastSessionAt within 3 days (but not already Active today)
  const activeTodayIds = new Set(activeToday.map((s) => s.studentId));
  const onARoll = roster.filter(
    (s) => !activeTodayIds.has(s.studentId) && hoursAgo(s.lastSessionAt) <= 72
  );
  onARoll.forEach((s) => {
    wins.push({
      id: `roll-${s.studentId}`,
      icon: "⭐",
      headline: `${avatarEmoji(s.avatarKey)} ${s.displayName} is on a roll!`,
      detail: `Active in the last 3 days with ${s.sessionsLast7d} session${s.sessionsLast7d !== 1 ? "s" : ""} this week.`,
      time: `Last active ${friendlyTime(s.lastSessionAt)}`,
      chipLabel: "On a roll",
      chipBg: "rgba(155,114,255,0.14)",
      chipColor: C.violet,
      encouragement: "Keep it up!",
    });
  });

  // 4. High accuracy performers — >= 80% accuracy with meaningful volume
  const sessionIds = new Set([
    ...activeToday.map((s) => s.studentId),
    ...onARoll.map((s) => s.studentId),
  ]);
  const highAccuracy = roster.filter(
    (s) =>
      !sessionIds.has(s.studentId) &&
      s.totalLast7d >= 5 &&
      s.correctLast7d / s.totalLast7d >= 0.8
  );
  highAccuracy.forEach((s) => {
    const pct = Math.round((s.correctLast7d / s.totalLast7d) * 100);
    wins.push({
      id: `accuracy-${s.studentId}`,
      icon: "🚀",
      headline: `${avatarEmoji(s.avatarKey)} ${s.displayName} — ${pct}% accuracy this week!`,
      detail: `${s.correctLast7d} correct of ${s.totalLast7d} answers. May be ready for band advancement.`,
      time: "This week · High accuracy",
      chipLabel: "Top performer",
      chipBg: "rgba(255,209,102,0.14)",
      chipColor: C.gold,
      encouragement: "Keep it up!",
    });
  });

  return wins;
}

// ── Stats bar values ───────────────────────────────────────────────────────
interface SummaryStats {
  totalWins: number;
  activeToday: number;
  onARoll: number;
}

function computeSummary(roster: Student[], wins: WinCard[]): SummaryStats {
  const activeToday = roster.filter((s) => hoursAgo(s.lastSessionAt) <= 24).length;
  const onARoll = roster.filter(
    (s) => hoursAgo(s.lastSessionAt) > 24 && hoursAgo(s.lastSessionAt) <= 72
  ).length;
  return {
    totalWins: wins.length,
    activeToday,
    onARoll,
  };
}

// ── Stat pill ─────────────────────────────────────────────────────────────
function StatPill({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "12px 18px",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Win card ──────────────────────────────────────────────────────────────
function WinCardView({ win }: { win: WinCard }) {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 14,
        padding: "16px 18px",
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span
          style={{
            fontSize: 28,
            flexShrink: 0,
            lineHeight: 1,
            marginTop: 1,
          }}
        >
          {win.icon}
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: C.text,
              lineHeight: 1.35,
              marginBottom: 4,
            }}
          >
            {win.headline}
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.muted,
              lineHeight: 1.5,
              marginBottom: 6,
            }}
          >
            {win.detail}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 10,
                background: win.chipBg,
                color: win.chipColor,
              }}
            >
              {win.chipLabel}
            </span>
            <span style={{ fontSize: 11, color: C.muted }}>{win.time}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.mint,
                marginLeft: "auto",
              }}
            >
              {win.encouragement}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        padding: "48px 32px",
        border: `1px solid ${C.border}`,
        textAlign: "center",
        maxWidth: 460,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 800,
          color: C.text,
          marginBottom: 10,
        }}
      >
        Wins are on the way!
      </div>
      <div
        style={{
          fontSize: 13,
          color: C.muted,
          lineHeight: 1.7,
          maxWidth: 340,
          margin: "0 auto",
        }}
      >
        Once your students start playing, their wins will appear here! 🎉
      </div>
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
      }}
    >
      {children}
    </a>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function RecentWinsPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(!!getTeacherId());
  }, []);

  const [wins, setWins] = useState<WinCard[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    totalWins: 0,
    activeToday: 0,
    onARoll: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) return;
    const teacherId = getTeacherId();
    fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const roster: Student[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.roster)
          ? data.roster
          : Array.isArray(data?.students)
          ? data.students
          : [];
        const derived = deriveWins(roster);
        setWins(derived);
        setSummary(computeSummary(roster, derived));
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [authed]);

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/recent-wins">
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

  return (
    <AppFrame audience="teacher" currentPath="/teacher/recent-wins">
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
        <div style={{ marginBottom: 24, maxWidth: 900 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: C.text,
              marginBottom: 4,
            }}
          >
            🎉 Recent Wins
          </div>
          <div style={{ fontSize: 14, color: C.muted }}>
            Active students, top performers, and milestones worth celebrating
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
                Could not load data
              </span>
            )}
          </div>
        </div>

        {/* ── Stats bar ─────────────────────────────────────────────── */}
        {!loading && wins.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 28,
              maxWidth: 900,
            }}
          >
            <StatPill
              icon="🎉"
              value={summary.totalWins}
              label="Wins to celebrate"
              color={C.gold}
            />
            <StatPill
              icon="🔥"
              value={summary.activeToday}
              label="Active today"
              color={C.amber}
            />
            <StatPill
              icon="⭐"
              value={summary.onARoll}
              label="On a roll (3 days)"
              color={C.mint}
            />
          </div>
        )}

        {/* ── Win cards grid ────────────────────────────────────────── */}
        {!loading && wins.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 14,
              maxWidth: 900,
              marginBottom: 32,
            }}
          >
            {wins.map((win) => (
              <WinCardView key={win.id} win={win} />
            ))}
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────── */}
        {!loading && wins.length === 0 && (
          <div style={{ marginBottom: 32 }}>
            <EmptyState />
          </div>
        )}

        {/* ── Loading skeleton ──────────────────────────────────────── */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 14,
              maxWidth: 900,
              marginBottom: 32,
            }}
          >
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                style={{
                  background: C.surface,
                  borderRadius: 14,
                  height: 110,
                  border: `1px solid ${C.border}`,
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Footer nav ────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            maxWidth: 900,
            marginBottom: 32,
          }}
        >
          <NavBtn href="/teacher/class">Full Class Roster</NavBtn>
          <NavBtn href="/teacher/skill-mastery">Skill Mastery</NavBtn>
        </div>

        {/* ── Teacher encouragement note ────────────────────────────── */}
        <div
          style={{
            maxWidth: 900,
            background: "rgba(255,209,102,0.07)",
            border: "1px solid rgba(255,209,102,0.18)",
            borderRadius: 12,
            padding: "14px 18px",
            fontSize: 13,
            color: C.gold,
            fontWeight: 600,
            lineHeight: 1.6,
          }}
        >
          💡 Recognizing progress keeps students motivated — share these wins in class!
        </div>
      </div>
    </AppFrame>
  );
}
