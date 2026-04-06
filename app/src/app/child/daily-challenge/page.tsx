"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Palette ──────────────────────────────────────────────────────────────────
const bg       = "#100b2e";
const bgDark   = "#0d0924";
const violet   = "#9b72ff";
const gold     = "#ffd166";
const mint     = "#50e890";
const text     = "#e8e0ff";
const muted    = "#7a6090";
const surface  = "#1a1060";
const border   = "#2a2060";
const amber    = "#ff9d3b";
const font     = "'Nunito', system-ui, sans-serif";

// ─── Challenge emoji pool — one per day-of-week ───────────────────────────────
const DAILY_EMOJIS = ["🎯", "⚡", "🌟", "🚀", "🏆", "🔮", "🎮"];

// ─── Types ────────────────────────────────────────────────────────────────────
type StatsData = {
  streakDays: number;
  totalPoints: number;
  currentLevel: number;
};

type ChallengeStatus = "not-started" | "in-progress" | "completed";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDailyEmoji(): string {
  const dow = new Date().getDay(); // 0=Sun…6=Sat
  return DAILY_EMOJIS[dow] ?? "🎯";
}

function formatToday(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function getWeekDots(): { label: string; active: boolean; isToday: boolean }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().getDay();
  return days.map((label, i) => ({
    label,
    // Dots up to and including today are "active" — simple heuristic
    active: i < today,
    isToday: i === today,
  }));
}

function nextMilestone(streak: number): string {
  const milestones = [3, 7, 10, 14, 21, 30, 50, 100];
  for (const m of milestones) {
    if (streak < m) {
      const need = m - streak;
      const badge = m >= 30 ? "💎" : m >= 14 ? "🌟" : m >= 7 ? "⚡" : "🔥";
      return `${need} more day${need !== 1 ? "s" : ""} → ${badge} ${m}-day badge!`;
    }
  }
  return "Legendary streak — keep going! 💎";
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DailyChallengePage() {
  const router = useRouter();
  const [stats, setStats]   = useState<StatsData | null>(null);
  const [status, setStatus] = useState<ChallengeStatus>("not-started");
  const [loading, setLoading] = useState(true);

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
        // Fetch stats
        return fetch("/api/child/stats")
          .then((r) => r.ok ? r.json() : null)
          .then((s: StatsData | null) => {
            if (s) setStats(s);
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [router]);

  const emoji    = getDailyEmoji();
  const todayStr = formatToday();
  const dots     = getWeekDots();
  const streak   = stats?.streakDays ?? 0;
  const milestone = nextMilestone(streak);
  const isCompleted = status === "completed";

  function handleAccept() {
    setStatus("in-progress");
    router.push("/play?sessionMode=guided-quest&entry=daily-challenge");
  }

  // ── card border / bg tint based on status
  const cardBorder =
    isCompleted ? gold :
    status === "in-progress" ? amber :
    violet;
  const cardBg =
    isCompleted ? "linear-gradient(135deg,#2a2010 0%,#1a1060 100%)" :
    status === "in-progress" ? "linear-gradient(135deg,#2a1808 0%,#1a1060 100%)" :
    `linear-gradient(135deg,${bgDark} 0%,${surface} 100%)`;

  const statusLabel: Record<ChallengeStatus, string> = {
    "not-started": "Not started",
    "in-progress": "In progress",
    "completed":   "Completed ✓",
  };
  const statusColor: Record<ChallengeStatus, string> = {
    "not-started": muted,
    "in-progress": amber,
    "completed":   mint,
  };

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, color: muted, fontSize: 18, fontWeight: 700 }}>
          Loading challenge...
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @keyframes flame-pulse { 0%,100%{transform:scale(1) rotate(-3deg)} 50%{transform:scale(1.15) rotate(3deg)} }
        @keyframes badge-pop   { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes glow-ring   { 0%,100%{box-shadow:0 0 0 0 rgba(255,209,102,0.4)} 50%{box-shadow:0 0 0 10px rgba(255,209,102,0)} }
      `}</style>

      <div style={{ minHeight: "100vh", background: bg, fontFamily: font, paddingBottom: 56 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 20px" }}>

          {/* ── Page title ── */}
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: violet, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>WonderQuest</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: text }}>Daily Challenge</div>
          </div>

          {/* ── Challenge card ── */}
          <div style={{
            background: cardBg,
            border: `2px solid ${cardBorder}`,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: `0 8px 40px rgba(0,0,0,0.5)`,
            marginBottom: 20,
            animation: isCompleted ? "glow-ring 2.5s ease infinite" : undefined,
          }}>

            {/* Card header */}
            <div style={{ padding: "28px 24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.2)" }}>

              {/* "Daily Challenge" badge */}
              <div style={{
                background: "linear-gradient(90deg,#c9a000,#ffd166)",
                borderRadius: 20, color: "#1a1000",
                fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
                padding: "4px 12px", textTransform: "uppercase",
                animation: "badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
              }}>
                Daily Challenge ⚡
              </div>

              {/* Date */}
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(232,224,255,0.5)" }}>{todayStr}</div>

              {/* Emoji */}
              <span style={{ fontSize: 72, lineHeight: 1, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))" }}>{emoji}</span>

              {/* Description */}
              <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(232,224,255,0.8)", textAlign: "center", lineHeight: 1.45, maxWidth: 320 }}>
                Answer 5 questions with 80%+ accuracy to earn bonus stars!
              </div>

              {/* Status chip */}
              <div style={{
                background: "rgba(0,0,0,0.3)",
                border: `1.5px solid ${statusColor[status]}`,
                borderRadius: 20,
                color: statusColor[status],
                fontSize: 12, fontWeight: 700,
                padding: "4px 12px",
              }}>
                {statusLabel[status]}
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* 2x stars reward badge */}
              <div style={{
                background: isCompleted ? "rgba(255,209,102,0.15)" : "rgba(255,209,102,0.08)",
                border: `2px solid ${isCompleted ? gold : "rgba(255,209,102,0.3)"}`,
                borderRadius: 14,
                color: gold,
                fontSize: 15, fontWeight: 800,
                padding: "10px 16px",
                textAlign: "center",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                ✨ Earn 2× stars today!
              </div>

              {/* CTA button */}
              {status === "not-started" && (
                <button
                  onClick={handleAccept}
                  style={{ background: "linear-gradient(135deg,#9b72ff,#7c4ddb)", border: "none", borderRadius: 14, color: "#fff", cursor: "pointer", fontFamily: font, fontSize: 17, fontWeight: 800, minHeight: 52, padding: "12px 24px", width: "100%", boxShadow: "0 6px 20px rgba(155,114,255,0.4)" }}
                >
                  ▶ Accept Challenge
                </button>
              )}
              {status === "in-progress" && (
                <button
                  onClick={handleAccept}
                  style={{ background: "linear-gradient(135deg,#ff9d3b,#e07000)", border: "none", borderRadius: 14, color: "#fff", cursor: "pointer", fontFamily: font, fontSize: 17, fontWeight: 800, minHeight: 52, padding: "12px 24px", width: "100%", boxShadow: "0 6px 20px rgba(255,157,59,0.4)", animation: "glow-ring 2s ease infinite" }}
                >
                  🔥 Continue Challenge
                </button>
              )}
              {isCompleted && (
                <div style={{ background: "rgba(80,232,144,0.12)", border: "2px solid rgba(80,232,144,0.4)", borderRadius: 14, color: mint, fontSize: 16, fontWeight: 800, padding: "14px 20px", textAlign: "center" }}>
                  CHALLENGE COMPLETE! 🏆<br />
                  <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>See you tomorrow!</span>
                </div>
              )}

              {/* Explore freely */}
              {status !== "completed" && (
                <button
                  onClick={() => router.push("/child/hub")}
                  style={{ background: "none", border: "none", color: muted, cursor: "pointer", fontFamily: font, fontSize: 14, fontWeight: 600, minHeight: 44, padding: 8, textAlign: "center", width: "100%" }}
                >
                  Explore freely instead →
                </button>
              )}

              <div style={{ color: muted, fontSize: 12, textAlign: "center" }}>New challenge tomorrow ✨</div>
            </div>
          </div>

          {/* ── Streak motivator ── */}
          <div style={{ background: "linear-gradient(135deg,#2a1808,#1a1060)", border: `2px solid ${amber}`, borderRadius: 20, padding: "20px 22px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 36, animation: "flame-pulse 1.5s ease-in-out infinite", display: "inline-block" }}>🔥</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: gold, lineHeight: 1 }}>
                  {streak} day streak!
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,209,102,0.7)", marginTop: 2 }}>
                  {streak > 0
                    ? "Come back tomorrow to keep your streak alive"
                    : "Complete today's challenge to start your streak!"}
                </div>
              </div>
            </div>

            {/* Milestone hint */}
            <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 700, color: "rgba(232,224,255,0.7)" }}>
              {milestone}
            </div>
          </div>

          {/* ── Past 7 days dots ── */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 18, padding: "16px 20px", marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: violet, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>This Week</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {dots.map((d, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: d.isToday ? violet : d.active ? "rgba(155,114,255,0.4)" : "rgba(255,255,255,0.06)",
                    border: `2px solid ${d.isToday ? violet : d.active ? "rgba(155,114,255,0.6)" : border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                    boxShadow: d.isToday ? `0 0 12px ${violet}80` : undefined,
                  }}>
                    {d.isToday ? "⚡" : d.active ? "🔥" : ""}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: d.isToday ? violet : d.active ? "rgba(155,114,255,0.8)" : muted }}>
                    {d.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer nav ── */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            {[
              { href: "/child/hub", label: "← Hub" },
              { href: "/child/streak", label: "Full Streak →" },
            ].map((l) => (
              <a key={l.href} href={l.href} style={{ fontSize: 13, fontWeight: 700, color: violet, textDecoration: "none" }}>
                {l.label}
              </a>
            ))}
          </div>

        </div>
      </div>
    </AppFrame>
  );
}
