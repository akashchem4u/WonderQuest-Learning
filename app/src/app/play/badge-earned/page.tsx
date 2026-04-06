"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

const C = {
  bg: "#100b2e",
  card: "#1e1840",
  border: "#2a2060",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#22c55e",
  text: "#e8e0ff",
  muted: "#9080c0",
};

type Rarity = "Common" | "Rare" | "Legendary";

interface BadgeInfo {
  desc: string;
  rarity: Rarity;
}

const BADGE_MAP: Record<string, BadgeInfo> = {
  "First Steps": {
    desc: "You answered your very first question — the adventure begins!",
    rarity: "Common",
  },
  "On Fire": {
    desc: "You got 5 questions right in a row without stopping. You're blazing!",
    rarity: "Rare",
  },
  "Comeback Kid": {
    desc: "You hit a tough question, asked for help, and kept going until you got it!",
    rarity: "Legendary",
  },
  "Speed Star": {
    desc: "You answered 3 questions super fast — quick thinking!",
    rarity: "Rare",
  },
  "Explorer": {
    desc: "You tried a brand new topic for the first time. Curiosity rules!",
    rarity: "Common",
  },
  "Unstoppable": {
    desc: "You played 7 days in a row. Nothing can stop you!",
    rarity: "Legendary",
  },
  "Sharp Mind": {
    desc: "You got every question right in a full quiz. Perfect score!",
    rarity: "Rare",
  },
  "Helper": {
    desc: "You used the hints wisely and still figured it out yourself. Smart!",
    rarity: "Common",
  },
};

const RARITY_STYLES: Record<Rarity, { color: string; bg: string; stars: number }> = {
  Common: { color: C.mint, bg: "#0d2e1a", stars: 1 },
  Rare: { color: C.violet, bg: "#1a0e3a", stars: 2 },
  Legendary: { color: C.gold, bg: "#2e1a00", stars: 3 },
};

const SHIMMER_DOTS = [
  { color: C.gold, left: "8%", duration: "2.8s", delay: "0s" },
  { color: "#ff9b22", left: "28%", duration: "2.4s", delay: "0.4s" },
  { color: C.gold, left: "50%", duration: "3s", delay: "0.2s" },
  { color: C.violet, left: "72%", duration: "2.6s", delay: "0.6s" },
  { color: C.gold, left: "88%", duration: "2.9s", delay: "0.1s" },
];

// ── Inner page (uses useSearchParams) ────────────────────────────────────────

function BadgeEarnedInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const badgeName = searchParams.get("badge") ?? "First Steps";
  const badgeEmoji = searchParams.get("emoji") ?? "🏅";

  const info: BadgeInfo = BADGE_MAP[badgeName] ?? {
    desc: "You did something amazing and earned this special badge. Keep it up!",
    rarity: "Common",
  };

  const rarity = info.rarity;
  const rarityStyle = RARITY_STYLES[rarity];

  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/play");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  return (
    <AppFrame audience="kid">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes shimmer-rise {
          0%   { transform: translateY(600px); opacity: 0; }
          15%  { opacity: 0.9; }
          85%  { opacity: 0.6; }
          100% { transform: translateY(-20px); opacity: 0; }
        }
        @keyframes badge-scale-in {
          0%   { transform: scale(0.3); opacity: 0; }
          60%  { transform: scale(1.12); opacity: 1; }
          80%  { transform: scale(0.96); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 24px ${rarityStyle.color}88, 0 0 48px ${rarityStyle.color}33; }
          50%       { box-shadow: 0 0 40px ${rarityStyle.color}cc, 0 0 80px ${rarityStyle.color}55; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes chip-pop {
          from { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.18); }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes countdown-tick {
          from { transform: scale(1.2); }
          to   { transform: scale(1); }
        }
      `}</style>

      <div style={{
        ...FONT,
        background: `radial-gradient(ellipse at 50% 30%, #1e0e4a 0%, ${C.bg} 70%)`,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px 48px",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Shimmer particles */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
          {SHIMMER_DOTS.map((dot, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: dot.color,
              left: dot.left,
              animation: `shimmer-rise ${dot.duration} ${dot.delay} linear infinite`,
              opacity: 0,
            }} />
          ))}
        </div>

        {/* Main content */}
        <div style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          maxWidth: 400,
          width: "100%",
        }}>

          {/* Headline */}
          <div style={{
            fontSize: "1rem",
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: rarityStyle.color,
            animation: "fade-up 0.4s ease-out both",
          }}>
            🎉 NEW BADGE!
          </div>

          {/* Badge circle */}
          <div style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: `radial-gradient(circle at 40% 35%, ${rarityStyle.bg}, #0a061e)`,
            border: `3px solid ${rarityStyle.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "5rem",
            animation: "badge-scale-in 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s both, glow-pulse 2.5s ease-in-out 0.8s infinite",
            flexShrink: 0,
          }}>
            {badgeEmoji}
          </div>

          {/* Badge name */}
          <div style={{
            fontSize: "2rem",
            fontWeight: 900,
            color: "#fff",
            textAlign: "center",
            lineHeight: 1.2,
            animation: "fade-up 0.4s 0.55s ease-out both",
          }}>
            {badgeName}
          </div>

          {/* Rarity chip */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: rarityStyle.bg,
            border: `2px solid ${rarityStyle.color}`,
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: "0.85rem",
            fontWeight: 900,
            color: rarityStyle.color,
            animation: "chip-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.7s both",
          }}>
            {"⭐".repeat(rarityStyle.stars)}
            &nbsp;{rarity}
          </div>

          {/* Description */}
          <div style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            color: C.text,
            textAlign: "center",
            lineHeight: 1.5,
            background: C.card,
            border: `1.5px solid ${C.border}`,
            borderRadius: 16,
            padding: "16px 20px",
            animation: "fade-up 0.4s 0.85s ease-out both",
          }}>
            {info.desc}
          </div>

          {/* Buttons */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: "100%",
            animation: "fade-up 0.4s 1s ease-out both",
          }}>
            <button
              onClick={() => router.push("/play")}
              style={{
                ...FONT,
                width: "100%",
                height: 58,
                borderRadius: 29,
                border: "none",
                background: `linear-gradient(135deg, ${C.violet}, #7248e8)`,
                color: "#fff",
                fontSize: "1.15rem",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: `0 4px 20px ${C.violet}55`,
              }}
            >
              Keep playing! 🚀
            </button>

            <button
              onClick={() => router.push("/child/badges")}
              style={{
                ...FONT,
                width: "100%",
                height: 52,
                borderRadius: 26,
                border: `2px solid ${C.border}`,
                background: C.card,
                color: C.text,
                fontSize: "1rem",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Show off! 🏅
            </button>
          </div>

          {/* Countdown */}
          <div style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: C.muted,
            animation: "fade-up 0.4s 1.2s ease-out both",
          }}>
            Returning to play in{" "}
            <span style={{
              color: rarityStyle.color,
              fontWeight: 900,
              display: "inline-block",
              animation: "countdown-tick 0.3s ease-out",
              key: countdown,
            } as React.CSSProperties}>
              {countdown}s
            </span>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

// ── Page export with Suspense boundary ───────────────────────────────────────

export default function PlayBadgeEarnedPage() {
  return (
    <Suspense fallback={
      <div style={{ ...FONT, background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: "1.2rem", fontWeight: 700 }}>
        Loading...
      </div>
    }>
      <BadgeEarnedInner />
    </Suspense>
  );
}
