"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

const LEVEL_NAMES: Record<number, string> = {
  1: "Star Seeker",
  2: "Star Explorer",
  3: "Star Voyager",
  4: "Star Champion",
  5: "Star Legend",
};

const PARTICLES = [
  { size: 6, bg: "#9b72ff", left: "8%",  top: "15%", dur: "3.2s", delay: "0s"   },
  { size: 4, bg: "#ffd166", left: "22%", top: "70%", dur: "2.8s", delay: "0.4s" },
  { size: 5, bg: "#58e8c1", left: "40%", top: "25%", dur: "3.5s", delay: "0.2s" },
  { size: 4, bg: "#ff7b6b", left: "60%", top: "60%", dur: "2.9s", delay: "0.7s" },
  { size: 7, bg: "#ffd166", left: "75%", top: "20%", dur: "3.1s", delay: "0.1s" },
  { size: 5, bg: "#9b72ff", left: "88%", top: "50%", dur: "2.6s", delay: "0.9s" },
  { size: 3, bg: "#ff7b6b", left: "15%", top: "85%", dur: "3.3s", delay: "0.5s" },
  { size: 6, bg: "#58e8c1", left: "50%", top: "80%", dur: "2.7s", delay: "0.3s" },
  { size: 4, bg: "#9b72ff", left: "93%", top: "35%", dur: "3.0s", delay: "0.6s" },
];

const SPARKLES = [
  { left: "10%", top: "10%", delay: "0s"   },
  { left: "30%", top: "40%", delay: "0.5s" },
  { left: "55%", top: "15%", delay: "1.0s" },
  { left: "70%", top: "55%", delay: "0.3s" },
  { left: "85%", top: "25%", delay: "0.8s" },
  { left: "20%", top: "65%", delay: "1.2s" },
  { left: "45%", top: "75%", delay: "0.6s" },
  { left: "92%", top: "70%", delay: "0.2s" },
];

function LevelUpInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const level = Math.min(5, Math.max(1, parseInt(searchParams.get("level") ?? "2", 10) || 2));
  const stars = parseInt(searchParams.get("stars") ?? "25", 10) || 25;
  const levelName = LEVEL_NAMES[level] ?? "Star Legend";

  const [countdown, setCountdown] = useState(5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          router.push("/play");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [mounted, router]);

  return (
    <AppFrame audience="kid" currentPath="/play">
      <style>{`
        @keyframes lu-star-pulse {
          0%, 100% { transform: scale(1) rotate(-3deg); filter: drop-shadow(0 0 24px #ffd16688); }
          50%       { transform: scale(1.18) rotate(3deg); filter: drop-shadow(0 0 48px #ffd166cc); }
        }
        @keyframes lu-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes lu-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lu-badge-drop {
          from { transform: translateY(-80px) scale(0.4); opacity: 0; }
          65%  { transform: translateY(8px) scale(1.08); opacity: 1; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes lu-glow-pulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(155,114,255,0.15), 0 0 0 20px rgba(155,114,255,0.06), 0 0 50px rgba(155,114,255,0.3); }
          50%       { box-shadow: 0 0 0 14px rgba(255,209,102,0.2), 0 0 0 30px rgba(255,209,102,0.07), 0 0 70px rgba(255,209,102,0.4); }
        }
        @keyframes lu-particle {
          0%   { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-120px) scale(0.2); opacity: 0; }
        }
        @keyframes lu-sparkle {
          0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          50%       { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes lu-banner {
          from { opacity: 0; transform: scaleX(0.4) translateY(-10px); }
          60%  { transform: scaleX(1.04) translateY(2px); }
          to   { opacity: 1; transform: scaleX(1) translateY(0); }
        }
        @keyframes lu-countdown {
          from { transform: scale(1.3); opacity: 0.5; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse at 50% 30%, #1e0f5c 0%, #100b2e 45%, #08051a 100%)",
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
        {/* Ambient particles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.bg,
              left: p.left,
              top: p.top,
              animation: `lu-particle ${p.dur} ${p.delay} ease-in infinite`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Sparkle stars */}
        {SPARKLES.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              fontSize: 14,
              animation: `lu-sparkle 2s ${s.delay} ease-in-out infinite`,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            ✦
          </div>
        ))}

        {/* Main card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            maxWidth: 440,
            width: "100%",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* "LEVEL UP" banner */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#ffd166",
              background: "rgba(255,209,102,0.1)",
              border: "1.5px solid rgba(255,209,102,0.3)",
              borderRadius: 30,
              padding: "6px 20px",
              animation: "lu-banner 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            ✨ Level Up!
          </div>

          {/* Star hero */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #9b72ff 0%, #5a28e8 60%, #ffd166 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 72,
              animation: "lu-badge-drop 0.7s 0.2s cubic-bezier(0.34,1.56,0.64,1) both, lu-glow-pulse 2.5s 1s ease-in-out infinite",
            }}
          >
            🌟
          </div>

          {/* Headline */}
          <div style={{ textAlign: "center", animation: "lu-fade-up 0.5s 0.7s ease-out both" }}>
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                lineHeight: 1,
                background: "linear-gradient(135deg, #ffd166 0%, #ff9f40 50%, #9b72ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
              }}
            >
              LEVEL UP! ⭐
            </div>
          </div>

          {/* Level number */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#e8e0ff",
              textAlign: "center",
              animation: "lu-fade-up 0.5s 0.85s ease-out both",
            }}
          >
            You are now{" "}
            <span style={{ color: "#ffd166" }}>Level {level}</span>!
          </div>

          {/* Level name badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, rgba(155,114,255,0.25), rgba(90,40,232,0.15))",
              border: "2px solid rgba(155,114,255,0.5)",
              borderRadius: 40,
              padding: "10px 24px",
              animation: "lu-fade-up 0.5s 1.0s ease-out both, lu-float 3s 1.5s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: 20 }}>🏅</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#c0a8ff" }}>{levelName}</span>
          </div>

          {/* Stars collected */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#9080c0",
              textAlign: "center",
              animation: "lu-fade-up 0.5s 1.15s ease-out both",
            }}
          >
            <span style={{ fontSize: 22 }}>⭐</span>{" "}
            <span style={{ color: "#ffd166", fontWeight: 900, fontSize: 20 }}>{stars}</span>{" "}
            stars collected
          </div>

          {/* Keep going button */}
          <button
            onClick={() => router.push("/play")}
            style={{
              width: "100%",
              height: 58,
              borderRadius: 29,
              border: "none",
              background: "linear-gradient(135deg, #9b72ff 0%, #7248e8 100%)",
              color: "#fff",
              fontSize: 18,
              fontWeight: 900,
              cursor: "pointer",
              fontFamily: "'Nunito', system-ui, sans-serif",
              boxShadow: "0 4px 24px rgba(155,114,255,0.4), 0 0 0 3px rgba(155,114,255,0.15)",
              animation: "lu-fade-up 0.5s 1.3s ease-out both",
              letterSpacing: "0.01em",
            }}
          >
            Keep going! 🚀
          </button>

          {/* Auto-redirect countdown */}
          <div
            key={countdown}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#6050a0",
              animation: "lu-countdown 1s ease-out",
            }}
          >
            Continuing in {countdown}s…
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

export default function PlayLevelUpPage() {
  return (
    <Suspense fallback={<div style={{ background: "#100b2e", minHeight: "100vh" }} />}>
      <LevelUpInner />
    </Suspense>
  );
}
