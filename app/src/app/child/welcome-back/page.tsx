"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = { fontFamily: "'Nunito', system-ui, sans-serif" };

const C = {
  bg:      "#100b2e",
  surface: "#161b22",
  border:  "#2a2060",
  violet:  "#9b72ff",
  gold:    "#ffd166",
  mint:    "#50e890",
  text:    "#f0f6ff",
  muted:   "#9b8ec4",
};

type Stats = {
  totalPoints: number;
  currentLevel: number;
  streakDays: number;
  displayName: string | null;
  lastSkillName: string | null;
  lastSession: { correctAnswers: number; totalQuestions: number; pointsEarned: number } | null;
};

const AVATARS = ["🦁", "🐉", "🦊", "🦋", "🐻", "🦄", "🦅", "🐸"];

function pickAvatar(name: string): string {
  return AVATARS[name.charCodeAt(0) % AVATARS.length];
}

function StarBar({ points }: { points: number }) {
  // Simple level progress bar capped at 100
  const pct = Math.min(100, (points % 500) / 5);
  return (
    <div style={{
      width: "100%",
      height: 8,
      borderRadius: 4,
      background: "rgba(155,114,255,0.18)",
      overflow: "hidden",
    }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        borderRadius: 4,
        background: `linear-gradient(90deg, ${C.violet}, ${C.gold})`,
        transition: "width 1.2s ease-out",
      }} />
    </div>
  );
}

export default function ChildWelcomeBackPage() {
  const router = useRouter();
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/child/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Stats) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const name   = stats?.displayName ?? "Explorer";
  const avatar = pickAvatar(name);
  const streak = stats?.streakDays ?? 0;
  const lastSkill = stats?.lastSkillName ?? null;
  const points = stats?.totalPoints ?? 0;
  const level  = stats?.currentLevel ?? 1;

  if (loading) {
    return (
      <AppFrame audience="kid">
        <div style={{
          ...FONT, background: C.bg, minHeight: "100vh",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.muted, fontSize: 16, fontWeight: 700,
        }}>
          Loading your adventure...
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="kid">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes wq-float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes wq-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes wq-pulse-glow {
          0%, 100% { box-shadow: 0 0 18px rgba(155,114,255,0.3); }
          50%       { box-shadow: 0 0 36px rgba(255,209,102,0.45); }
        }
        @keyframes wq-shake {
          0%, 100% { transform: rotate(0deg); }
          20%       { transform: rotate(-10deg); }
          40%       { transform: rotate(10deg); }
          60%       { transform: rotate(-6deg); }
          80%       { transform: rotate(6deg); }
        }
      `}</style>

      <div style={{
        ...FONT,
        background: `radial-gradient(ellipse at 60% 10%, rgba(155,114,255,0.15) 0%, transparent 60%),
                     radial-gradient(ellipse at 10% 80%, rgba(255,209,102,0.08) 0%, transparent 50%),
                     ${C.bg}`,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px 60px",
        gap: 0,
        textAlign: "center",
      }}>

        {/* Floating avatar */}
        <div style={{
          fontSize: 88,
          lineHeight: 1,
          animation: "wq-float 3.5s ease-in-out infinite",
          marginBottom: 20,
          filter: "drop-shadow(0 8px 24px rgba(155,114,255,0.4))",
        }}>
          {avatar}
        </div>

        {/* Greeting */}
        <div style={{
          animation: "wq-fade-up 0.45s ease-out both",
          marginBottom: 6,
        }}>
          <h1 style={{
            ...FONT,
            fontSize: 30,
            fontWeight: 900,
            color: C.text,
            margin: "0 0 6px",
            lineHeight: 1.2,
          }}>
            Welcome back, <span style={{ color: C.gold }}>{name}</span>!
          </h1>
          <p style={{ ...FONT, fontSize: 16, color: C.violet, fontWeight: 700, margin: 0 }}>
            Ready to continue your adventure? 🚀
          </p>
        </div>

        {/* Stats cards row */}
        <div style={{
          display: "flex",
          gap: 12,
          marginTop: 24,
          marginBottom: 20,
          width: "100%",
          maxWidth: 400,
          animation: "wq-fade-up 0.45s 0.1s ease-out both",
        }}>
          {/* Streak card */}
          <div style={{
            flex: 1,
            background: streak > 0
              ? "linear-gradient(135deg, rgba(255,209,102,0.18), rgba(255,160,0,0.1))"
              : C.surface,
            border: `1.5px solid ${streak > 0 ? C.gold : C.border}`,
            borderRadius: 16,
            padding: "14px 10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            animation: streak > 0 ? "wq-pulse-glow 2.5s ease-in-out infinite" : undefined,
          }}>
            <span style={{
              fontSize: 28,
              lineHeight: 1,
              animation: streak > 2 ? "wq-shake 1.8s ease-in-out infinite" : undefined,
            }}>
              {streak > 0 ? "🔥" : "💤"}
            </span>
            <div style={{ ...FONT, fontSize: 20, fontWeight: 900, color: streak > 0 ? C.gold : C.muted }}>
              {streak}
            </div>
            <div style={{ ...FONT, fontSize: 11, fontWeight: 700, color: C.muted, lineHeight: 1.3 }}>
              {streak === 1 ? "day streak" : "day streak"}
            </div>
          </div>

          {/* Level card */}
          <div style={{
            flex: 1,
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            borderRadius: 16,
            padding: "14px 10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>⭐</span>
            <div style={{ ...FONT, fontSize: 20, fontWeight: 900, color: C.violet }}>
              {level}
            </div>
            <div style={{ ...FONT, fontSize: 11, fontWeight: 700, color: C.muted, lineHeight: 1.3 }}>
              level
            </div>
          </div>

          {/* Points card */}
          <div style={{
            flex: 1,
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            borderRadius: 16,
            padding: "14px 10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>🏆</span>
            <div style={{ ...FONT, fontSize: 20, fontWeight: 900, color: C.mint }}>
              {points.toLocaleString()}
            </div>
            <div style={{ ...FONT, fontSize: 11, fontWeight: 700, color: C.muted, lineHeight: 1.3 }}>
              points
            </div>
          </div>
        </div>

        {/* Streak banner or last skill banner */}
        {(streak > 0 || lastSkill) && (
          <div style={{
            width: "100%",
            maxWidth: 400,
            marginBottom: 20,
            animation: "wq-fade-up 0.45s 0.2s ease-out both",
          }}>
            {streak > 0 && (
              <div style={{
                ...FONT,
                background: "linear-gradient(135deg, rgba(255,209,102,0.14), rgba(255,160,0,0.08))",
                border: `1.5px solid rgba(255,209,102,0.4)`,
                borderRadius: 14,
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 700,
                color: C.gold,
                marginBottom: lastSkill ? 8 : 0,
                lineHeight: 1.5,
              }}>
                🔥 You&apos;re on a <strong>{streak} day streak</strong>! Keep it up!
              </div>
            )}
            {lastSkill && (
              <div style={{
                ...FONT,
                background: "rgba(155,114,255,0.1)",
                border: `1.5px solid rgba(155,114,255,0.3)`,
                borderRadius: 14,
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 700,
                color: "#c4b0ff",
                lineHeight: 1.5,
              }}>
                Last time you practiced: <strong style={{ color: C.text }}>{lastSkill}</strong>
              </div>
            )}
          </div>
        )}

        {/* Level progress bar */}
        <div style={{
          width: "100%",
          maxWidth: 400,
          marginBottom: 24,
          animation: "wq-fade-up 0.45s 0.25s ease-out both",
        }}>
          <div style={{
            ...FONT,
            fontSize: 11,
            fontWeight: 700,
            color: C.muted,
            marginBottom: 6,
            textAlign: "left",
          }}>
            Progress to next level
          </div>
          <StarBar points={points} />
        </div>

        {/* CTA buttons */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 400,
          animation: "wq-fade-up 0.45s 0.3s ease-out both",
        }}>
          <Link href="/play" style={{ textDecoration: "none" }}>
            <button style={{
              ...FONT,
              width: "100%",
              minHeight: 60,
              borderRadius: 18,
              border: "none",
              background: `linear-gradient(135deg, ${C.gold}, #e09000)`,
              color: "#1a0800",
              fontSize: 18,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 6px 28px rgba(255,209,102,0.4)",
              letterSpacing: "0.01em",
            }}>
              Continue Playing 🚀
            </button>
          </Link>

          <Link href="/child/progress" style={{ textDecoration: "none" }}>
            <button style={{
              ...FONT,
              width: "100%",
              minHeight: 52,
              borderRadius: 18,
              border: `2px solid ${C.violet}`,
              background: "rgba(155,114,255,0.12)",
              color: "#c4b0ff",
              fontSize: 16,
              fontWeight: 900,
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}>
              See My Progress ✨
            </button>
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
