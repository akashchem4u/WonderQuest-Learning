"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Session type ─────────────────────────────────────────────────────────────

type SessionData = {
  student: { displayName: string; avatarKey: string; launchBandCode: string };
  progression: { totalPoints: number; currentLevel: number; badgeCount: number; trophyCount: number };
};

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  amber: "#ff9d3b",
  gold: "#ffd166",
  violet: "#9b72ff",
  mint: "#50e890",
  text: "#f0f6ff",
  surface: "#1a1060",
  surface2: "rgba(255,255,255,0.04)",
  border: "#2a2060",
  muted: "#7a6090",
} as const;

type StreakState = "active" | "long" | "broken" | "restored";

type DayDot = { label: string; state: "done" | "today" | "empty" };
type Milestone = { emoji: string; label: string; reward: string; state: "done" | "current" | "locked" };

const STATES: { id: StreakState; label: string }[] = [
  { id: "active", label: "Active (5-day)" },
  { id: "long", label: "Long (21-day)" },
  { id: "broken", label: "Broken" },
  { id: "restored", label: "Restored" },
];

const DATA: Record<StreakState, {
  streakCount: number | null;
  heroLabel: string;
  heroUnit: string;
  heroSub: string;
  heroBorder: string;
  heroBg: string;
  heroCountColor: string;
  heroLabelColor: string;
  heroUnitColor: string;
  dots: DayDot[];
  milestones: Milestone[];
}> = {
  active: {
    streakCount: 5,
    heroLabel: "🔥 Quest Streak",
    heroUnit: "days in a row!",
    heroSub: "Keep going — you're on a roll! Quest today to keep the streak alive.",
    heroBorder: C.amber,
    heroBg: "linear-gradient(135deg, #2a1808, #1a1060)",
    heroCountColor: C.gold,
    heroLabelColor: C.amber,
    heroUnitColor: C.amber,
    dots: [
      { label: "Mon", state: "done" }, { label: "Tue", state: "done" }, { label: "Wed", state: "done" },
      { label: "Thu", state: "done" }, { label: "Fri ✓", state: "today" }, { label: "Sat", state: "empty" }, { label: "Sun", state: "empty" },
    ],
    milestones: [
      { emoji: "🔥", label: "3-Day Streak", reward: "✓ Earned +5 XP", state: "done" },
      { emoji: "⚡", label: "7-Day Streak", reward: "Unlocks: Hot badge", state: "current" },
      { emoji: "🌟", label: "14-Day Streak", reward: "Unlocks: Super streak trophy", state: "locked" },
      { emoji: "💎", label: "30-Day Streak", reward: "Unlocks: Legendary status", state: "locked" },
    ],
  },
  long: {
    streakCount: 21,
    heroLabel: "🔥 LEGENDARY STREAK!",
    heroUnit: "DAYS IN A ROW!",
    heroSub: "You are absolutely on fire — 21 days without missing a quest!",
    heroBorder: C.gold,
    heroBg: "linear-gradient(135deg, #2a2010, #1a1060)",
    heroCountColor: C.gold,
    heroLabelColor: C.gold,
    heroUnitColor: C.gold,
    dots: [
      { label: "Mon", state: "done" }, { label: "Tue", state: "done" }, { label: "Wed", state: "done" },
      { label: "Thu", state: "done" }, { label: "Fri", state: "done" }, { label: "Sat", state: "done" }, { label: "Sun ✓", state: "today" },
    ],
    milestones: [
      { emoji: "🔥", label: "3-Day ✓", reward: "+5 XP earned", state: "done" },
      { emoji: "⚡", label: "7-Day ✓", reward: "Hot badge earned", state: "done" },
      { emoji: "🌟", label: "14-Day ✓", reward: "Super streak trophy", state: "done" },
      { emoji: "💎", label: "30-Day Streak", reward: "Legendary status · 9 days to go!", state: "current" },
    ],
  },
  broken: {
    streakCount: null,
    heroLabel: "",
    heroUnit: "",
    heroSub: "",
    heroBorder: C.border,
    heroBg: "linear-gradient(135deg, #1a1060, #0d0924)",
    heroCountColor: C.text,
    heroLabelColor: C.muted,
    heroUnitColor: C.muted,
    dots: [
      { label: "Mon", state: "done" }, { label: "Tue", state: "done" }, { label: "Wed", state: "empty" },
      { label: "Thu", state: "empty" }, { label: "Fri ← today!", state: "today" }, { label: "Sat", state: "empty" }, { label: "Sun", state: "empty" },
    ],
    milestones: [
      { emoji: "🔥", label: "3-Day Streak", reward: "Unlocks: +5 XP bonus", state: "current" },
      { emoji: "⚡", label: "7-Day Streak", reward: "Unlocks: Hot badge", state: "locked" },
      { emoji: "🌟", label: "14-Day Streak", reward: "Unlocks: Super streak trophy", state: "locked" },
      { emoji: "💎", label: "30-Day Streak", reward: "Unlocks: Legendary status", state: "locked" },
    ],
  },
  restored: {
    streakCount: 1,
    heroLabel: "🔥 Streak Restored!",
    heroUnit: "fresh start!",
    heroSub: "You're back — and you earned a bonus for returning! Your stars were safe the whole time.",
    heroBorder: C.mint,
    heroBg: "linear-gradient(135deg, #0a2a15, #1a1060)",
    heroCountColor: C.mint,
    heroLabelColor: C.mint,
    heroUnitColor: C.mint,
    dots: [
      { label: "Mon", state: "empty" }, { label: "Tue", state: "empty" }, { label: "Wed", state: "empty" },
      { label: "Thu", state: "empty" }, { label: "Fri Day 1!", state: "today" }, { label: "Sat", state: "empty" }, { label: "Sun", state: "empty" },
    ],
    milestones: [
      { emoji: "🔥", label: "3-Day Streak", reward: "Unlocks: +5 XP bonus", state: "current" },
      { emoji: "⚡", label: "7-Day Streak", reward: "Unlocks: Hot badge", state: "locked" },
      { emoji: "🌟", label: "14-Day Streak", reward: "Unlocks: Super streak trophy", state: "locked" },
      { emoji: "💎", label: "30-Day Streak", reward: "Unlocks: Legendary status", state: "locked" },
    ],
  },
};

function DotStyle(state: "done" | "today" | "empty", variant: StreakState): React.CSSProperties {
  const base: React.CSSProperties = {
    width: 36, height: 36, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18,
    transition: "all 0.2s",
    border: `2px solid ${C.border}`,
    background: C.surface,
  };
  if (state === "done") return { ...base, background: "#2a1808", borderColor: C.amber };
  if (state === "today") {
    const colors: Record<StreakState, string> = { active: C.amber, long: C.gold, broken: C.violet, restored: C.mint };
    return { ...base, background: colors[variant], borderColor: colors[variant], boxShadow: `0 0 12px ${colors[variant]}80`, animation: "today-glow 1.5s ease-in-out infinite" };
  }
  return { ...base, opacity: 0.3 };
}

function MilestoneStyle(state: "done" | "current" | "locked"): React.CSSProperties {
  if (state === "done") return { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 14, flex: 1, minWidth: 140, background: "#2a1808", border: `2px solid ${C.amber}`, color: C.gold, fontSize: 14, fontWeight: 900 };
  if (state === "current") return { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 14, flex: 1, minWidth: 140, background: C.surface, border: `2px solid ${C.violet}`, color: "#c4a0ff", fontSize: 14, fontWeight: 900 };
  return { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 14, flex: 1, minWidth: 140, background: C.surface, border: `2px solid ${C.border}`, color: C.muted, fontSize: 14, fontWeight: 900, opacity: 0.5 };
}

export default function ChildStreakPage() {
  const [view, setView] = useState<StreakState>("active");
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => r.json())
      .then((data: SessionData) => setSession(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // streakCount not yet in API; derive best view from totalPoints as proxy
  // totalPoints > 0 = active learner; show "active" state
  // We override DATA[view].streakCount with the level for display context
  const liveStreakCount = session ? (session.progression.currentLevel > 1 ? session.progression.currentLevel : 1) : null;
  const d = {
    ...DATA[view],
    streakCount: view === "active" && session ? liveStreakCount : DATA[view].streakCount,
  };

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', system-ui, sans-serif", color: C.muted, fontSize: 18, fontWeight: 700 }}>
          Loading your streak...
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @keyframes today-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(255,157,59,0.5); } 50% { box-shadow: 0 0 0 8px rgba(255,157,59,0); } }
        @keyframes chip-pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.base, fontFamily: "'Nunito', system-ui, sans-serif", padding: "28px 32px 60px", maxWidth: 800, margin: "0 auto" }}>
        {/* Dev tab bar */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {STATES.map((s) => (
            <button
              key={s.id}
              onClick={() => setView(s.id)}
              style={{
                padding: "8px 14px", background: view === s.id ? C.violet : C.surface, border: `2px solid ${view === s.id ? C.violet : C.border}`,
                borderRadius: 8, color: view === s.id ? "#fff" : "rgba(255,255,255,0.5)", fontFamily: "'Nunito', system-ui", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Broken state ── */}
        {view === "broken" ? (
          <>
            <div style={{ background: "linear-gradient(135deg, #1a1060, #0d0924)", border: `2px solid ${C.border}`, borderRadius: 24, padding: 28, textAlign: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 56, display: "block", marginBottom: 12 }}>😮</span>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 8 }}>Your streak paused for a bit!</div>
              <div style={{ fontSize: 14, color: "#b8a0e8", fontWeight: 700, marginBottom: 20, lineHeight: 1.4 }}>That&apos;s totally okay — everyone takes a break sometimes! You can start a brand new streak today and all your stars are safe!</div>
              <button
                onClick={() => setView("restored")}
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #9b72ff, #7c4ddb)", color: "#fff", fontFamily: "'Nunito', system-ui", fontSize: 17, fontWeight: 900, cursor: "pointer", boxShadow: "0 6px 20px rgba(155,114,255,0.4)" }}
              >
                Start a New Streak Today! 🔥
              </button>
            </div>
            <div style={{ background: "rgba(80,232,144,0.08)", border: "2px solid rgba(80,232,144,0.25)", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 22 }}>⭐</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.mint }}>All 42 stars are safe — nothing was lost!</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, color: C.violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Previous Best</div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <span style={{ fontSize: 36 }}>🏆</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>5-day best streak</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Beat it by starting today!</div>
              </div>
            </div>
          </>
        ) : (
          /* ── Normal hero ── */
          <div style={{ background: d.heroBg, border: `2px solid ${d.heroBorder}`, borderRadius: 24, padding: 28, textAlign: "center", marginBottom: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -10, right: -10, fontSize: 120, opacity: 0.06, pointerEvents: "none" }}>🔥</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: d.heroLabelColor, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{d.heroLabel}</div>
            {view === "restored" ? (
              <>
                <div style={{ fontSize: 60, fontWeight: 900, color: d.heroCountColor, lineHeight: 1, marginBottom: 4 }}>Day 1</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: d.heroUnitColor, marginBottom: 16 }}>{d.heroUnit}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 72, fontWeight: 900, color: d.heroCountColor, lineHeight: 1, marginBottom: 8, textShadow: "0 4px 20px rgba(255,209,102,0.4)" }}>{d.streakCount}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: d.heroUnitColor, marginBottom: 16 }}>{d.heroUnit}</div>
              </>
            )}
            <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(184,160,160,0.8)" }}>{d.heroSub}</div>

            {/* Restored bonus chips */}
            {view === "restored" && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 18, background: "#2a2010", border: `2px solid ${C.gold}`, color: C.gold, fontSize: 14, fontWeight: 900, animation: "chip-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}>⭐ +1 return bonus</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 18, background: "rgba(80,232,144,0.1)", border: `2px solid ${C.mint}`, color: C.mint, fontSize: 14, fontWeight: 900, animation: "chip-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.2s both" }}>✨ +30 XP</div>
              </div>
            )}
          </div>
        )}

        {/* Weekly dots */}
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 900, color: d.heroBorder === C.border ? C.violet : d.heroBorder, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          {view === "long" ? "This Week (Week 3!)" : "This Week"}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
          {d.dots.map((dot, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={DotStyle(dot.state, view)}>
                {dot.state === "done" ? "🔥" : dot.state === "today" ? (view === "restored" ? "🔥" : view === "broken" ? "✦" : "🔥") : "○"}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: dot.state === "done" ? C.amber : dot.state === "today" ? C.gold : C.muted }}>
                {dot.label}
              </div>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div style={{ fontSize: 12, fontWeight: 900, color: d.heroBorder === C.border ? C.violet : d.heroBorder, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          {view === "broken" ? "Streak Goals (Start Here!)" : view === "restored" ? "Streak Goals (Start Here!)" : "Streak Goals"}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          {d.milestones.slice(0, 2).map((m, i) => (
            <div key={i} style={MilestoneStyle(m.state)}>
              <span>{m.emoji}</span>
              <div>
                <div>{m.label}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{m.reward}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {d.milestones.slice(2).map((m, i) => (
            <div key={i} style={MilestoneStyle(m.state)}>
              <span>{m.emoji}</span>
              <div>
                <div>{m.label}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{m.reward}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Streak shield (active/long only) */}
        {(view === "active" || view === "long") && (
          <div style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: C.violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Streak Shield 🛡️</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 36 }}>🛡️</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#c4a0ff", lineHeight: 1.4 }}>Miss a day? Your streak is protected for 1 day per shield.</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontWeight: 700 }}>0 shields active · Ask a parent to enable shields</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { href: "/child", label: "← Home" },
            { href: "/child/badges", label: "Badges" },
            { href: "/child/map", label: "Map" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
