"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

const BADGE_DESCRIPTIONS: Record<string, { icon: string; desc: string; color: string; glow: string }> = {
  "First Steps":        { icon: "👟", desc: "You took your very first steps into WonderQuest. The adventure begins!", color: "#58e8c1", glow: "rgba(88,232,193,0.35)" },
  "Quick Learner":      { icon: "⚡", desc: "You answered 5 questions correctly in a row — lightning fast!", color: "#ffd166", glow: "rgba(255,209,102,0.35)" },
  "Star Collector":     { icon: "⭐", desc: "You collected 50 stars — the galaxy shines brighter because of you!", color: "#ffd166", glow: "rgba(255,209,102,0.35)" },
  "Streak Master":      { icon: "🔥", desc: "You kept a 5-day learning streak going — unstoppable!", color: "#ff7b6b", glow: "rgba(255,123,107,0.35)" },
  "Boss Slayer":        { icon: "⚔️", desc: "You defeated the boss question! Only the bravest adventurers do that.", color: "#9b72ff", glow: "rgba(155,114,255,0.35)" },
  "Perfect Session":    { icon: "💎", desc: "You answered every question correctly in a whole session — flawless!", color: "#38bdf8", glow: "rgba(56,189,248,0.35)" },
  "Explorer":           { icon: "🗺️", desc: "You tried 3 different topic areas — a true explorer!", color: "#50e890", glow: "rgba(80,232,144,0.35)" },
  "Night Owl":          { icon: "🦉", desc: "You completed a session after dark — wisdom never sleeps!", color: "#9b72ff", glow: "rgba(155,114,255,0.35)" },
  "Champion":           { icon: "🏆", desc: "You reached the top rank — a true WonderQuest Champion!", color: "#ffd166", glow: "rgba(255,209,102,0.35)" },
};

const DEFAULT_BADGE = { icon: "🏅", desc: "You earned this badge for your amazing efforts in WonderQuest!", color: "#9b72ff", glow: "rgba(155,114,255,0.35)" };

const STAR_POSITIONS = [
  { left: "5%",  top: "8%",  delay: "0s",    size: 18 },
  { left: "88%", top: "6%",  delay: "0.3s",  size: 14 },
  { left: "15%", top: "50%", delay: "0.7s",  size: 12 },
  { left: "80%", top: "45%", delay: "0.2s",  size: 16 },
  { left: "50%", top: "5%",  delay: "1.1s",  size: 10 },
  { left: "92%", top: "80%", delay: "0.5s",  size: 13 },
  { left: "3%",  top: "80%", delay: "0.9s",  size: 11 },
  { left: "40%", top: "90%", delay: "0.4s",  size: 15 },
];

function RewardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const badgeName = searchParams.get("badge") ?? "First Steps";
  const badge = BADGE_DESCRIPTIONS[badgeName] ?? DEFAULT_BADGE;

  return (
    <AppFrame audience="kid" currentPath="/play">
      <style>{`
        @keyframes rw-scale-in {
          from { transform: scale(0.2) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
          80%  { transform: scale(0.96) rotate(-2deg); }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes rw-glow-breathe {
          0%, 100% { filter: drop-shadow(0 0 20px var(--glow)) drop-shadow(0 0 40px var(--glow)); }
          50%       { filter: drop-shadow(0 0 40px var(--glow)) drop-shadow(0 0 80px var(--glow)); }
        }
        @keyframes rw-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rw-star-flash {
          0%   { opacity: 0; transform: scale(0.5) rotate(0deg); }
          40%  { opacity: 1; transform: scale(1.2) rotate(180deg); }
          70%  { opacity: 0.8; transform: scale(0.9) rotate(270deg); }
          100% { opacity: 0.5; transform: scale(1) rotate(360deg); }
        }
        @keyframes rw-ring-expand {
          from { transform: scale(0.5); opacity: 0.8; }
          to   { transform: scale(2.2); opacity: 0; }
        }
        @keyframes rw-badge-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes rw-shine {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: `radial-gradient(ellipse at 50% 35%, rgba(30, 15, 80, 0.95) 0%, #100b2e 50%, #08051a 100%)`,
          fontFamily: "'Nunito', system-ui, sans-serif",
          color: "#e8e0ff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating background stars */}
        {STAR_POSITIONS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              fontSize: s.size,
              animation: `rw-star-flash 3s ${s.delay} ease-in-out infinite`,
              pointerEvents: "none",
              userSelect: "none",
              color: "#ffd166",
              opacity: 0.5,
            }}
          >
            ★
          </div>
        ))}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            maxWidth: 420,
            width: "100%",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* "New Badge" tag */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: badge.color,
              background: `rgba(${badge.glow.slice(5, -1)}, 0.1)`,
              border: `1.5px solid ${badge.color}44`,
              borderRadius: 30,
              padding: "6px 20px",
              animation: "rw-fade-up 0.4s 0.1s ease-out both",
            }}
          >
            🏅 New Badge Earned!
          </div>

          {/* Badge icon with rings */}
          <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Expanding ring 1 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `3px solid ${badge.color}`,
                animation: "rw-ring-expand 2s 0.8s ease-out infinite",
                opacity: 0,
              }}
            />
            {/* Expanding ring 2 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `2px solid ${badge.color}`,
                animation: "rw-ring-expand 2s 1.3s ease-out infinite",
                opacity: 0,
              }}
            />
            {/* Main badge circle */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: `radial-gradient(circle at 40% 35%, ${badge.color}33, rgba(10,5,30,0.9))`,
                border: `3px solid ${badge.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 68,
                boxShadow: `0 0 0 6px ${badge.glow}, 0 0 40px ${badge.glow}`,
                animation: "rw-scale-in 0.7s 0.2s cubic-bezier(0.34,1.56,0.64,1) both, rw-badge-float 3.5s 1.5s ease-in-out infinite",
              }}
            >
              {badge.icon}
            </div>
          </div>

          {/* Badge name */}
          <div
            style={{
              textAlign: "center",
              animation: "rw-fade-up 0.5s 0.8s ease-out both",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                lineHeight: 1.1,
                background: `linear-gradient(90deg, ${badge.color}, #ffffff, ${badge.color})`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "rw-shine 2.5s 1s linear infinite",
                letterSpacing: "-0.01em",
              }}
            >
              {badgeName}
            </div>
          </div>

          {/* Badge description */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1.5px solid ${badge.color}33`,
              borderRadius: 16,
              padding: "16px 20px",
              fontSize: 15,
              fontWeight: 700,
              color: "#c0b0e8",
              textAlign: "center",
              lineHeight: 1.5,
              animation: "rw-fade-up 0.5s 1.0s ease-out both",
            }}
          >
            {badge.desc}
          </div>

          {/* Stars flash row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              animation: "rw-fade-up 0.5s 1.2s ease-out both",
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{
                  fontSize: 24,
                  animation: `rw-star-flash 1.5s ${(i * 0.15).toFixed(2)}s ease-out both`,
                  display: "inline-block",
                }}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push("/play")}
            style={{
              width: "100%",
              height: 58,
              borderRadius: 29,
              border: "none",
              background: `linear-gradient(135deg, ${badge.color} 0%, #7248e8 100%)`,
              color: "#fff",
              fontSize: 20,
              fontWeight: 900,
              cursor: "pointer",
              fontFamily: "'Nunito', system-ui, sans-serif",
              boxShadow: `0 4px 24px ${badge.glow}, 0 0 0 3px ${badge.color}22`,
              animation: "rw-fade-up 0.5s 1.35s ease-out both",
              letterSpacing: "0.01em",
            }}
          >
            Amazing! 🎉
          </button>
        </div>
      </div>
    </AppFrame>
  );
}

export default function PlayRewardPage() {
  return (
    <Suspense fallback={<div style={{ background: "#100b2e", minHeight: "100vh" }} />}>
      <RewardInner />
    </Suspense>
  );
}
