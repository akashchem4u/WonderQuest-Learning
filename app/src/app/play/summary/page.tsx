"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const C = {
  bg: "#0a0820",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#50e890",
  text: "#e8e0ff",
  surface: "#120e30",
  surface2: "#1a1540",
  border: "#2a2060",
  muted: "#9080c0",
} as const;

interface Stats {
  totalPoints: number;
  currentLevel: number;
  streakDays: number;
  lastSession: { correctAnswers: number; totalQuestions: number; pointsEarned: number } | null;
}

function SummaryPageInner() {
  const params = useSearchParams();

  // URL params take priority; fallback to API
  const pointsParam = params.get("points");
  const correctParam = params.get("correct");
  const totalParam = params.get("total");
  const skillsParam = params.get("skills");
  const streakParam = params.get("streak");

  const hasParams = pointsParam !== null;

  const points = Number(pointsParam ?? 0);
  const correct = Number(correctParam ?? 0);
  const total = Number(totalParam ?? 0);
  const skills = skillsParam ? skillsParam.split(",").filter(Boolean).slice(0, 3) : [];
  const streak = Number(streakParam ?? 0);

  const [apiStats, setApiStats] = useState<Stats | null>(null);
  const [pulsePlayAgain, setPulsePlayAgain] = useState(false);
  const playAgainRef = useRef<HTMLAnchorElement>(null);

  // Fetch from API if no params provided
  useEffect(() => {
    if (hasParams) return;
    fetch("/api/child/stats")
      .then((r) => r.json())
      .then((data: Stats) => setApiStats(data))
      .catch(() => setApiStats(null));
  }, [hasParams]);

  // After 10 seconds, pulse the play again button
  useEffect(() => {
    const id = setTimeout(() => setPulsePlayAgain(true), 10000);
    return () => clearTimeout(id);
  }, []);

  const displayPoints = hasParams ? points : (apiStats?.lastSession?.pointsEarned ?? 0);
  const displayCorrect = hasParams ? correct : (apiStats?.lastSession?.correctAnswers ?? 0);
  const displayTotal = hasParams ? total : (apiStats?.lastSession?.totalQuestions ?? 0);
  const displayStreak = hasParams ? streak : (apiStats?.streakDays ?? 0);
  const displayLevel = apiStats?.currentLevel ?? null;

  const confettiDots = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        left: `${Math.round((i / 24) * 100)}%`,
        size: 6 + (i % 5) * 2,
        color: [C.violet, C.gold, C.mint, "#ff7b6b", "#58e8c1"][i % 5],
        delay: `${(i * 0.18).toFixed(2)}s`,
        duration: `${2.5 + (i % 4) * 0.5}s`,
        xDrift: `${-20 + (i % 7) * 8}px`,
      })),
    [],
  );

  const accuracy = displayTotal > 0 ? Math.round((displayCorrect / displayTotal) * 100) : 0;
  const accuracyColor = accuracy >= 80 ? C.mint : accuracy >= 60 ? C.gold : C.violet;

  const statCards = [
    { emoji: "📝", label: "Questions", value: `${displayTotal}` },
    { emoji: "✅", label: "Correct", value: `${displayCorrect}/${displayTotal}` },
    { emoji: "🔥", label: "Streak", value: `${displayStreak} day${displayStreak !== 1 ? "s" : ""}` },
  ];

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translateY(100vh) rotate(720deg) translateX(var(--x-drift)); opacity: 0; }
        }
        @keyframes star-bounce {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.25); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(155,114,255,0.55); }
          70%  { box-shadow: 0 0 0 14px rgba(155,114,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(155,114,255,0); }
        }
        .summary-pulse { animation: pulse-ring 1.2s ease-in-out infinite; }
      `}</style>

      {/* Confetti layer */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {confettiDots.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.left,
              top: "-16px",
              width: d.size,
              height: d.size,
              borderRadius: i % 3 === 0 ? "50%" : 3,
              background: d.color,
              // @ts-expect-error CSS custom property
              "--x-drift": d.xDrift,
              animation: `confetti-fall ${d.duration} ${d.delay} linear infinite`,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* Page content */}
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          fontFamily: "'Nunito', system-ui, sans-serif",
          color: C.text,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px 48px",
          gap: 24,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            animation: "fade-up 0.5s ease both",
          }}
        >
          <span
            style={{
              fontSize: 72,
              lineHeight: 1,
              animation: "star-bounce 1.5s ease-in-out infinite",
              display: "block",
            }}
            aria-hidden="true"
          >
            ⭐
          </span>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            Quest Complete!
          </h1>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.muted, margin: 0, textAlign: "center" }}>
            You did an amazing job today!
          </p>
        </div>

        {/* Points earned card */}
        <div
          style={{
            background: "linear-gradient(135deg, #2a1800, #1a1000)",
            border: `2px solid ${C.gold}`,
            borderRadius: 20,
            padding: "20px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            boxShadow: "0 0 32px rgba(255,209,102,0.18)",
            animation: "fade-up 0.5s 0.1s ease both",
            minWidth: 220,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900, color: C.gold, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Stars Earned
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: C.gold, lineHeight: 1 }}>
            +{displayPoints}
          </div>
          {displayLevel !== null && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#ffe08a", marginTop: 4 }}>
                Level {displayLevel}
              </div>
              {/* Level progress bar */}
              <div style={{ width: 180, height: 8, background: "#3a2a00", borderRadius: 4, overflow: "hidden", marginTop: 6 }}>
                <div
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${C.gold}, #ffb830)`,
                    borderRadius: 4,
                    width: `${Math.min((displayPoints % 100), 100)}%`,
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Session stats row */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fade-up 0.5s 0.2s ease both",
          }}
        >
          {statCards.map(({ emoji, label, value }) => (
            <div
              key={label}
              style={{
                background: C.surface,
                border: `1.5px solid ${C.border}`,
                borderRadius: 16,
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                minWidth: 90,
              }}
            >
              <span style={{ fontSize: 28 }} aria-hidden="true">{emoji}</span>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>{value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Accuracy mini-bar */}
        {displayTotal > 0 && (
          <div
            style={{
              width: "100%",
              maxWidth: 360,
              animation: "fade-up 0.5s 0.25s ease both",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
              <span>Accuracy</span>
              <span style={{ color: accuracyColor }}>{accuracy}%</span>
            </div>
            <div style={{ height: 10, background: C.surface2, borderRadius: 5, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${accuracyColor}, ${accuracyColor}cc)`,
                  borderRadius: 5,
                  width: `${accuracy}%`,
                  transition: "width 1.2s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* Skills practiced */}
        {skills.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              animation: "fade-up 0.5s 0.3s ease both",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Skills Practiced
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    background: "rgba(155,114,255,0.15)",
                    border: `1px solid rgba(155,114,255,0.35)`,
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.violet,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            animation: "fade-up 0.5s 0.4s ease both",
          }}
        >
          <Link
            ref={playAgainRef}
            href="/play"
            className={pulsePlayAgain ? "summary-pulse" : undefined}
            style={{
              height: 54,
              borderRadius: 27,
              background: `linear-gradient(135deg, ${C.violet}, #7248e8)`,
              color: "#fff",
              fontSize: 17,
              fontWeight: 900,
              padding: "0 36px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(155,114,255,0.35)",
            }}
          >
            Play Again →
          </Link>
          <Link
            href="/child"
            style={{
              height: 44,
              borderRadius: 22,
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              color: "#b89eff",
              fontSize: 14,
              fontWeight: 700,
              padding: "0 24px",
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            Back to Home
          </Link>
        </div>

        {/* Parent share hint */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.muted,
            textAlign: "center",
            animation: "fade-up 0.5s 0.5s ease both",
            opacity: 0.8,
          }}
        >
          Show a parent your score! 🎉
        </div>
      </div>
    </>
  );
}

export default function PlaySummaryPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0a0820", minHeight: "100vh" }} />}>
      <SummaryPageInner />
    </Suspense>
  );
}
