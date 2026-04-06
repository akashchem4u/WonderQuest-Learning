"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";

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

interface ClassData {
  roster: Student[];
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
}

// ── Derive wins from roster ───────────────────────────────────────────────
function deriveWins(roster: Student[]): WinCard[] {
  const wins: WinCard[] = [];

  if (roster.length === 0) return wins;

  // Sort by totalPoints desc → top mastery performers
  const byPoints = [...roster].sort((a, b) => b.totalPoints - a.totalPoints);
  const topMastery = byPoints.slice(0, 3);
  topMastery.forEach((s, i) => {
    if (s.totalPoints > 0) {
      wins.push({
        id: `mastery-${s.studentId}`,
        icon: "💪",
        headline: `${s.displayName} is a top performer this week!`,
        detail: `${s.totalPoints.toLocaleString()} total points · Level ${s.currentLevel} · ${s.sessionsLast7d} sessions this week.`,
        time: i === 0 ? "This week · Top of class" : "This week",
        chipLabel: "Mastery win",
        chipBg: "rgba(34,197,94,0.12)",
        chipColor: "#4ade80",
      });
    }
  });

  // Streak milestones — streak > 5
  const streakHeroes = roster
    .filter((s) => s.streak > 5)
    .sort((a, b) => b.streak - a.streak);
  streakHeroes.forEach((s) => {
    wins.push({
      id: `streak-${s.studentId}`,
      icon: "🔥",
      headline: `${s.displayName} hit a ${s.streak}-day streak!`,
      detail: `Playing every day this week. Streak started ${s.streak} days ago.`,
      time: "Active now",
      chipLabel: "Streak milestone",
      chipBg: "rgba(245,158,11,0.12)",
      chipColor: "#fbbf24",
    });
  });

  // Near band ceiling — high accuracy (>= 80%) with meaningful volume
  const nearCeiling = roster.filter(
    (s) => s.totalLast7d >= 5 && s.correctLast7d / s.totalLast7d >= 0.8
  );
  nearCeiling.forEach((s) => {
    const pct = Math.round((s.correctLast7d / s.totalLast7d) * 100);
    wins.push({
      id: `ceiling-${s.studentId}`,
      icon: "🚀",
      headline: `${s.displayName} is crushing it — ${pct}% accuracy!`,
      detail: `${s.correctLast7d} correct of ${s.totalLast7d} answers this week. May be ready for band advancement.`,
      time: "This week · High accuracy",
      chipLabel: "Band ceiling",
      chipBg: "rgba(155,114,255,0.12)",
      chipColor: C.violet,
    });
  });

  return wins;
}

// ── Stats bar values ───────────────────────────────────────────────────────
interface SummaryStats {
  totalWins: number;
  streaksAchieved: number;
  skillsMastered: number;
}

function computeSummary(roster: Student[], wins: WinCard[]): SummaryStats {
  const streaksAchieved = roster.filter((s) => s.streak > 5).length;
  const skillsMastered = wins.filter((w) => w.chipLabel === "Mastery win").length;
  return {
    totalWins: wins.length,
    streaksAchieved,
    skillsMastered,
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
            fontSize: 24,
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
        When students master skills, hit streaks, or reach milestones, they'll
        appear here. Usually a few days after the week starts.
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
  const [wins, setWins] = useState<WinCard[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    totalWins: 0,
    streaksAchieved: 0,
    skillsMastered: 0,
  });
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
        const roster = data.roster ?? [];
        const derived = deriveWins(roster);
        setWins(derived);
        setSummary(computeSummary(roster, derived));
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  return (
    <AppFrame audience="teacher">
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
            🎉 Recent Wins — this week
          </div>
          <div style={{ fontSize: 14, color: C.muted }}>
            Skill mastery, streak milestones, and high-accuracy performers
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
              label="Wins this week"
              color={C.gold}
            />
            <StatPill
              icon="💪"
              value={summary.skillsMastered}
              label="Skills mastered"
              color={C.mint}
            />
            <StatPill
              icon="🔥"
              value={summary.streaksAchieved}
              label="Streaks achieved"
              color={C.amber}
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
          }}
        >
          <NavBtn href="/teacher/class">Full Class Roster</NavBtn>
          <NavBtn href="/teacher/skill-mastery">Skill Mastery</NavBtn>
        </div>
      </div>
    </AppFrame>
  );
}
