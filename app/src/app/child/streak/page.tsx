"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  base:     "#100b2e",
  bgDark:   "#0d0924",
  amber:    "#ff9d3b",
  gold:     "#ffd166",
  violet:   "#9b72ff",
  mint:     "#50e890",
  text:     "#e8e0ff",
  surface:  "#1a1060",
  surface2: "rgba(255,255,255,0.04)",
  border:   "#2a2060",
  muted:    "#7a6090",
  font:     "'Nunito', system-ui, sans-serif",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type StatsData = {
  streakDays: number;
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
};

type HistorySession = {
  startedAt: string;
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function buildCalendar(
  year: number,
  month: number,
  activeDays: Set<number>,
): { day: number | null; active: boolean; isToday: boolean }[][] {
  const totalDays  = getDaysInMonth(year, month);
  const firstDow   = getFirstDayOfWeek(year, month);
  const todayDate  = new Date();
  const isThisMonth = todayDate.getFullYear() === year && todayDate.getMonth() === month;
  const todayDay   = isThisMonth ? todayDate.getDate() : -1;

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: { day: number | null; active: boolean; isToday: boolean }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(
      cells.slice(i, i + 7).map((day) => ({
        day,
        active: day !== null && activeDays.has(day),
        isToday: day === todayDay,
      })),
    );
  }
  return weeks;
}

function nextMilestone(streak: number): { need: number; target: number; badge: string } {
  const milestones = [3, 7, 10, 14, 21, 30, 50, 100];
  for (const m of milestones) {
    if (streak < m) {
      const badge = m >= 30 ? "💎" : m >= 14 ? "🌟" : m >= 7 ? "⚡" : "🔥";
      return { need: m - streak, target: m, badge };
    }
  }
  return { need: 0, target: 100, badge: "💎" };
}

function longestStreakFromActiveDays(activeDays: Set<number>, year: number, month: number): number {
  // Simple estimate from continuous days in month
  const sorted = Array.from(activeDays).sort((a, b) => a - b);
  let longest = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0 || sorted[i] === sorted[i - 1] + 1) {
      run++;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
  }
  return longest;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChildStreakPage() {
  const router = useRouter();
  const [stats, setStats]       = useState<StatsData | null>(null);
  const [history, setHistory]   = useState<HistorySession[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // Auth check
    fetch("/api/child/session")
      .then((r) => {
        if (!r.ok) { router.replace("/child"); return null; }
        return r.json();
      })
      .catch(() => { router.replace("/child"); return null; })
      .then((session) => {
        if (!session) return;
        return Promise.all([
          fetch("/api/child/stats").then((r) => r.ok ? r.json() : null),
          fetch("/api/child/history").then((r) => r.ok ? r.json() : null),
        ]).then(([s, h]: [StatsData | null, { sessions?: HistorySession[] } | null]) => {
          if (s) setStats(s);
          if (h?.sessions) setHistory(h.sessions);
          else if (Array.isArray(h)) setHistory(h as HistorySession[]);
        }).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [router]);

  const streak  = stats?.streakDays ?? 0;
  const now     = new Date();
  const year    = now.getFullYear();
  const month   = now.getMonth();

  const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const DOW_LABELS = ["S","M","T","W","T","F","S"];

  // Build active-days set from history (days in current month that had sessions)
  const activeDays = new Set<number>(
    history
      .map((s) => {
        const d = new Date(s.startedAt ?? (s as unknown as Record<string, string>).started_at ?? "");
        if (d.getFullYear() === year && d.getMonth() === month) return d.getDate();
        return null;
      })
      .filter((d): d is number => d !== null),
  );

  // Ensure today is not prematurely marked active (we don't know from limited data)
  const calendar = buildCalendar(year, month, activeDays);
  const ms = nextMilestone(streak);
  const bestInMonth = longestStreakFromActiveDays(activeDays, year, month);
  const longestStreak = Math.max(streak, bestInMonth);

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.font, color: C.muted, fontSize: 18, fontWeight: 700 }}>
          Loading your streak...
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @keyframes flame-pulse { 0%,100%{transform:scale(1) rotate(-3deg)} 50%{transform:scale(1.15) rotate(3deg)} }
        @keyframes badge-pop   { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes glow-gold   { 0%,100%{box-shadow:0 0 0 0 rgba(255,209,102,0.4)} 50%{box-shadow:0 0 0 12px rgba(255,209,102,0)} }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.base, fontFamily: C.font, paddingBottom: 56 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 20px" }}>

          {/* ── Page title ── */}
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.violet, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>WonderQuest</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.text }}>Streak Stats</div>
          </div>

          {/* ── Current streak hero ── */}
          <div style={{
            background: streak > 0
              ? "linear-gradient(135deg,#2a1808 0%,#1a1060 100%)"
              : "linear-gradient(135deg,#1a1060 0%,#0d0924 100%)",
            border: `2px solid ${streak > 0 ? C.amber : C.border}`,
            borderRadius: 24,
            padding: "28px 24px",
            textAlign: "center",
            marginBottom: 20,
            position: "relative",
            overflow: "hidden",
            animation: streak >= 7 ? "glow-gold 2.5s ease infinite" : undefined,
          }}>
            {/* BG watermark */}
            <div style={{ position: "absolute", top: -10, right: -10, fontSize: 120, opacity: 0.06, pointerEvents: "none" }}>🔥</div>

            <span style={{ fontSize: 52, display: "inline-block", animation: streak > 0 ? "flame-pulse 1.5s ease-in-out infinite" : undefined }}>🔥</span>

            <div style={{ fontSize: 72, fontWeight: 900, color: streak > 0 ? C.gold : C.muted, lineHeight: 1, marginTop: 8, textShadow: streak > 0 ? "0 4px 20px rgba(255,209,102,0.4)" : undefined }}>
              {streak}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: streak > 0 ? C.amber : C.muted, marginBottom: 8 }}>
              {streak === 1 ? "day in a row!" : "days in a row!"}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(232,224,255,0.65)", lineHeight: 1.45 }}>
              {streak > 0
                ? "Come back tomorrow to keep your streak alive!"
                : "Complete a quest today to start your streak!"}
            </div>
          </div>

          {/* ── Longest streak ── */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 36 }}>🏅</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.violet, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Personal Best</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>
                {longestStreak > 0 ? `${longestStreak} days` : "No streak yet"}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>
                {longestStreak > 0 ? "Your longest streak so far" : "Start your first streak today!"}
              </div>
            </div>
          </div>

          {/* ── Milestone bar ── */}
          <div style={{
            background: "rgba(155,114,255,0.1)",
            border: `2px solid rgba(155,114,255,0.35)`,
            borderRadius: 16,
            padding: "14px 18px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            animation: "badge-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
          }}>
            <span style={{ fontSize: 28 }}>{ms.badge}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.violet }}>Next milestone</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(196,160,255,0.85)" }}>
                {ms.need > 0
                  ? `${ms.need} more day${ms.need !== 1 ? "s" : ""} → ${ms.badge} ${ms.target}-day badge!`
                  : "You've hit all milestones — legendary! 💎"}
              </div>
            </div>
          </div>

          {/* ── Monthly calendar ── */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "18px 20px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{MONTH_NAMES[month]} {year}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Active days highlighted</div>
            </div>

            {/* Day-of-week header */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
              {DOW_LABELS.map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: C.muted, textTransform: "uppercase" }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {calendar.map((week, wi) => (
              <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      background: cell.day === null
                        ? "transparent"
                        : cell.active
                          ? "rgba(155,114,255,0.6)"
                          : cell.isToday
                            ? "rgba(255,209,102,0.15)"
                            : "rgba(255,255,255,0.05)",
                      border: cell.isToday
                        ? `2px solid ${C.gold}`
                        : cell.active
                          ? `2px solid ${C.violet}`
                          : "2px solid transparent",
                      color: cell.active
                        ? "#fff"
                        : cell.isToday
                          ? C.gold
                          : cell.day !== null ? "rgba(232,224,255,0.5)" : "transparent",
                      boxShadow: cell.active ? `0 0 6px rgba(155,114,255,0.5)` : undefined,
                    }}
                  >
                    {cell.day ?? ""}
                  </div>
                ))}
              </div>
            ))}

            <div style={{ marginTop: 12, display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(155,114,255,0.6)", border: `2px solid ${C.violet}` }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Active day</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${C.gold}` }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Today</span>
              </div>
            </div>
          </div>

          {/* ── Weekly dots ── */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "16px 20px", marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.violet, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>This Week</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((label, i) => {
                const dow = new Date().getDay();
                const isToday  = i === dow;
                const isPast   = i < dow;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: isToday ? C.violet : isPast ? "rgba(155,114,255,0.35)" : "rgba(255,255,255,0.04)",
                      border: `2px solid ${isToday ? C.violet : isPast ? "rgba(155,114,255,0.5)" : C.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14,
                      boxShadow: isToday ? `0 0 10px ${C.violet}80` : undefined,
                    }}>
                      {isToday ? "⚡" : isPast ? "🔥" : ""}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: isToday ? C.violet : isPast ? "rgba(155,114,255,0.7)" : C.muted }}>
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Streak shield ── */}
          {streak > 0 && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px", marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.violet, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Streak Shield 🛡️</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 32 }}>🛡️</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#c4a0ff", lineHeight: 1.4 }}>Miss a day? Your streak is protected for 1 day per shield.</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontWeight: 700 }}>0 shields active · Ask a parent to enable shields</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Footer nav ── */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            {[
              { href: "/child/hub", label: "← Hub" },
              { href: "/child/daily-challenge", label: "Daily Challenge →" },
            ].map((l) => (
              <a key={l.href} href={l.href} style={{ fontSize: 13, fontWeight: 700, color: C.violet, textDecoration: "none" }}>
                {l.label}
              </a>
            ))}
          </div>

        </div>
      </div>
    </AppFrame>
  );
}
