"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Colors ──────────────────────────────────────────────────────────────────
// Base: #100b2e  Mint: #58e8c1  Violet: #9b72ff  Gold: #ffd166  Coral: #ff7b6b

// ─── Challenge data (static prototype) ───────────────────────────────────────

type DifficultyStars = 1 | 2 | 3 | 4 | 5;

type DailyChallenge = {
  id: string;
  name: string;
  skill: string;
  subjectEmoji: string;
  difficulty: DifficultyStars;
  xpReward: number;
  xpLabel: string;
  mascot: string;
  themeGradient: string;
};

type PastChallenge = {
  date: string;
  label: string;
  name: string;
  completed: boolean;
};

const TODAY_CHALLENGE: DailyChallenge = {
  id: "dc-2026-04-05",
  name: "The Star Chart Mystery",
  skill: "Number Patterns",
  subjectEmoji: "📐",
  difficulty: 3,
  xpReward: 50,
  xpLabel: "Star Dust",
  mascot: "🚀",
  themeGradient: "linear-gradient(135deg, #0d0d2b 0%, #1a1060 50%, #2d0b6b 100%)",
};

// Compute "last 3 days" relative to today (2026-04-05)
function getPastChallenges(): PastChallenge[] {
  const today = new Date();
  const days: PastChallenge[] = [];
  for (let offset = 1; offset <= 3; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const label = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    // Seed deterministic completion based on offset
    const completed = offset !== 2; // day-before-yesterday was missed
    days.push({
      date: d.toISOString().slice(0, 10),
      label,
      name: offset === 1 ? "The Crystal Maze" : offset === 2 ? "Fraction Forest" : "Word Builder Race",
      completed,
    });
  }
  return days;
}

// ─── Streak helpers ───────────────────────────────────────────────────────────

function computeStreakFromPast(past: PastChallenge[]): number {
  // Count consecutive completions starting from most recent day
  let streak = 0;
  for (const day of past) {
    if (day.completed) streak++;
    else break;
  }
  return streak;
}

// ─── Countdown timer ─────────────────────────────────────────────────────────

function useCountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number }>({
    h: 0,
    m: 0,
    s: 0,
  });

  useEffect(() => {
    function compute() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());
      const totalSeconds = Math.floor(diff / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      setTimeLeft({ h, m, s });
    }
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

// ─── Challenge Launcher view ──────────────────────────────────────────────────

function DailyChallengeLauncher() {
  const challenge = TODAY_CHALLENGE;
  const past = getPastChallenges();
  const streak = computeStreakFromPast(past);
  const showStreakBonus = streak >= 3;
  const streakBonusXp = 25;
  const timeLeft = useCountdownToMidnight();

  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{
          minHeight: "100vh",
          background: "#100b2e",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#fff",
        }}
      >
        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#0d0924",
            borderBottom: "2px solid #1e1860",
            padding: "0 24px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Link
            href="/child"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#9b72ff",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
          <div style={{ width: "1px", height: "20px", background: "#2a2060" }} />
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff" }}>
            Daily Challenge ⚡
          </div>
          <div style={{ flex: 1 }} />
          {/* Streak indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#ff9d3b",
            }}
          >
            🔥 {streak} day streak
          </div>
        </div>

        {/* ── Page content ──────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "32px 20px 60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "28px",
          }}
        >
          {/* ── Section eyebrow ── */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#9b72ff",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "4px",
              }}
            >
              Today&rsquo;s Challenge
            </div>
            <div style={{ fontSize: "13px", color: "#7a6090", fontWeight: 700 }}>
              {todayLabel}
            </div>
          </div>

          {/* ── Main challenge card ───────────────────────────────────── */}
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#161b22",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
            }}
          >
            {/* Themed gradient header */}
            <div
              style={{
                background: challenge.themeGradient,
                padding: "28px 24px 22px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {/* Today badge */}
              <div
                style={{
                  background: "linear-gradient(90deg,#c9a000,#ffd166)",
                  borderRadius: "20px",
                  color: "#1a1000",
                  fontSize: "10px",
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  padding: "4px 12px",
                  textTransform: "uppercase",
                }}
              >
                Today&rsquo;s Challenge ⚡
              </div>

              {/* Date */}
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {todayLabel}
              </div>

              {/* Mascot */}
              <div
                style={{
                  fontSize: "64px",
                  lineHeight: 1,
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
                }}
              >
                {challenge.mascot}
              </div>

              {/* Quest name */}
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#fff",
                  textAlign: "center",
                  lineHeight: 1.25,
                }}
              >
                {challenge.name}
              </div>
            </div>

            {/* Card body */}
            <div
              style={{
                padding: "20px 24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Chips row: skill + difficulty stars */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {/* Skill chip */}
                <span
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "5px 12px",
                    color: "#f0f6ff",
                    whiteSpace: "nowrap",
                  }}
                >
                  {challenge.subjectEmoji} {challenge.skill}
                </span>

                {/* Difficulty stars */}
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      style={{
                        fontSize: "14px",
                        opacity: n <= challenge.difficulty ? 1 : 0.2,
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </span>
              </div>

              {/* XP reward badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    background: "rgba(88,232,193,0.12)",
                    border: "1.5px solid rgba(88,232,193,0.35)",
                    borderRadius: "20px",
                    color: "#58e8c1",
                    fontSize: "13px",
                    fontWeight: 800,
                    padding: "6px 14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  +{challenge.xpReward} {challenge.xpLabel}! ✨
                </span>
              </div>

              {/* Countdown timer */}
              <div
                style={{
                  background: "rgba(155,114,255,0.08)",
                  border: "1px solid rgba(155,114,255,0.2)",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#b8a0e8",
                }}
              >
                <span>Resets in</span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "#9b72ff",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "1px",
                  }}
                >
                  {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
                </span>
              </div>

              {/* Accept Challenge CTA */}
              <Link
                href="/play?sessionMode=daily-challenge"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 24px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "17px",
                  fontWeight: 900,
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(155,114,255,0.4)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  minHeight: "52px",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                Accept Challenge! 🚀
              </Link>

              {/* Explore freely alt-link */}
              <Link
                href="/child"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  color: "#8b949e",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                  minHeight: "44px",
                  transition: "color 0.2s",
                }}
              >
                Explore freely instead →
              </Link>

              <div
                style={{
                  fontSize: "12px",
                  color: "#5a4080",
                  textAlign: "center",
                  fontWeight: 700,
                }}
              >
                New challenge tomorrow ✨
              </div>
            </div>
          </div>

          {/* ── Streak bonus card (3+ day streak) ────────────────────── */}
          {showStreakBonus && (
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                background:
                  "linear-gradient(135deg, rgba(255,209,102,0.12) 0%, rgba(255,209,102,0.06) 100%)",
                border: "2px solid rgba(255,209,102,0.4)",
                borderRadius: "20px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 0 24px rgba(255,209,102,0.12)",
              }}
            >
              <div style={{ fontSize: "40px", lineHeight: 1, flexShrink: 0 }}>🏆</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "#ffd166",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    marginBottom: "4px",
                  }}
                >
                  Streak Bonus!
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "#fff",
                    marginBottom: "4px",
                  }}
                >
                  {streak}-day streak — you&rsquo;re on fire!
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#b8a0e8",
                    fontWeight: 700,
                  }}
                >
                  Complete today to earn an extra{" "}
                  <span style={{ color: "#ffd166", fontWeight: 900 }}>
                    +{streakBonusXp} {challenge.xpLabel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Previous challenges ───────────────────────────────────── */}
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#9b72ff",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "14px",
              }}
            >
              Last 3 Days
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {past.map((day) => (
                <div
                  key={day.date}
                  style={{
                    background: day.completed
                      ? "rgba(88,232,193,0.06)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${day.completed ? "rgba(88,232,193,0.2)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: "14px",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  {/* Status icon */}
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: day.completed
                        ? "rgba(88,232,193,0.15)"
                        : "rgba(255,255,255,0.05)",
                      border: `2px solid ${day.completed ? "#58e8c1" : "#3a3060"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: 900,
                      color: day.completed ? "#58e8c1" : "#5a4080",
                      flexShrink: 0,
                    }}
                  >
                    {day.completed ? "✓" : "✗"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 900,
                        color: day.completed ? "#fff" : "#5a4080",
                        marginBottom: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {day.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#5a4080",
                      }}
                    >
                      {day.label}
                    </div>
                  </div>

                  {/* Completion label */}
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 900,
                      color: day.completed ? "#58e8c1" : "#3a3060",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      flexShrink: 0,
                    }}
                  >
                    {day.completed ? "Done" : "Missed"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Keyframe animations */}
        <style>{`
          @keyframes pulseViolet {
            0%, 100% { box-shadow: 0 6px 20px rgba(155,114,255,0.4); }
            50% { box-shadow: 0 6px 28px rgba(155,114,255,0.65); }
          }
        `}</style>
      </div>
    </AppFrame>
  );
}

// ─── PIN gate ─────────────────────────────────────────────────────────────────

type PinGateState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "authed" };

export default function ChildChallengePage() {
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [gateState, setGateState] = useState<PinGateState>({ status: "idle" });

  // Attempt session restore on mount
  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch("/api/child/session", { method: "GET" });
        if (res.ok && !cancelled) {
          setGateState({ status: "authed" });
        }
      } catch {
        // no active session — show gate
      }
    }
    void checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  function appendDigit(d: string) {
    setPin((cur) => (cur.length >= 4 ? cur : cur + d));
  }

  function removeDigit() {
    setPin((cur) => cur.slice(0, -1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || pin.length !== 4) return;
    setGateState({ status: "submitting" });
    try {
      const res = await fetch("/api/child/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin, displayName: "", avatarKey: "", launchBandCode: "" }),
      });
      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "Access denied.");
      }
      setGateState({ status: "authed" });
    } catch (err) {
      setGateState({
        status: "error",
        message: err instanceof Error ? err.message : "Access denied.",
      });
      setPin("");
    }
  }

  if (gateState.status === "authed") {
    return <DailyChallengeLauncher />;
  }

  // ── Gate UI ──────────────────────────────────────────────────────────────────
  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{
          minHeight: "100vh",
          background: "#100b2e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#fff",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "28px",
            padding: "36px 32px",
            width: "100%",
            maxWidth: "380px",
            textAlign: "center",
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>⚡</div>

          <div
            style={{ fontSize: "22px", fontWeight: 900, color: "#fff", marginBottom: "6px" }}
          >
            Daily Challenge
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#7a6090",
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            Enter your username and PIN to accept today&rsquo;s challenge
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "2px solid #2a2060",
                background: "#1a1060",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "15px",
                fontWeight: 700,
                marginBottom: "16px",
                outline: "none",
              }}
            />

            {/* PIN dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: pin.length > i ? "#9b72ff" : "#2a2060",
                    border: `2px solid ${pin.length > i ? "#9b72ff" : "#3a3070"}`,
                    transition: "background 0.15s",
                  }}
                />
              ))}
            </div>

            {/* PIN keypad */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => appendDigit(d)}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    border: "2px solid #2a2060",
                    background: "#1a1060",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: "20px",
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                >
                  {d}
                </button>
              ))}
              {/* Row 4: blank / 0 / backspace */}
              <div />
              <button
                type="button"
                onClick={() => appendDigit("0")}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "2px solid #2a2060",
                  background: "#1a1060",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "20px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                0
              </button>
              <button
                type="button"
                onClick={removeDigit}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "2px solid #2a2060",
                  background: "#1a1060",
                  color: "#9b72ff",
                  fontFamily: "inherit",
                  fontSize: "18px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                ⌫
              </button>
            </div>

            {/* Error */}
            {gateState.status === "error" && (
              <div
                style={{
                  background: "rgba(255,123,107,0.12)",
                  border: "1px solid #ff7b6b",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#ff7b6b",
                  marginBottom: "14px",
                }}
              >
                {gateState.message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={
                !username || pin.length !== 4 || gateState.status === "submitting"
              }
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: username && pin.length === 4 ? "#9b72ff" : "#2a2060",
                color: username && pin.length === 4 ? "#fff" : "#5a4080",
                fontFamily: "inherit",
                fontSize: "16px",
                fontWeight: 900,
                cursor: username && pin.length === 4 ? "pointer" : "default",
                transition: "background 0.2s",
              }}
            >
              {gateState.status === "submitting"
                ? "Checking..."
                : "See Today's Challenge ⚡"}
            </button>
          </form>

          {/* Back link */}
          <div style={{ marginTop: "20px" }}>
            <Link
              href="/child"
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#5a4080",
                textDecoration: "none",
              }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
