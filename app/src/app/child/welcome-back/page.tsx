"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

const PLAY_URL = "/play?sessionMode=guided-quest&entry=returning";

const FONT: React.CSSProperties = { fontFamily: "'Nunito', system-ui, sans-serif" };

type SessionData = {
  student: { displayName: string; launchBandCode: string };
  progression: { totalPoints: number; currentLevel: number; badgeCount: number; trophyCount: number };
};

const AVATARS = ["🦁", "🐉", "🦊", "🦋", "🐻", "🦄", "🦅", "🐸"];

function pickAvatar(name: string): string {
  const idx = name.charCodeAt(0) % AVATARS.length;
  return AVATARS[idx];
}

export default function ChildWelcomeBackPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [countdown,   setCountdown]   = useState(2);

  // Load session
  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => r.json())
      .then((data: SessionData) => {
        if (data?.student?.displayName) setDisplayName(data.student.displayName);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Auto-redirect countdown (starts once loading is done)
  useEffect(() => {
    if (loading) return;
    if (countdown <= 0) {
      router.replace(PLAY_URL);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [loading, countdown, router]);

  const name   = displayName ?? "Explorer";
  const avatar = pickAvatar(name);

  const C = {
    bg:     "#100b2e",
    gold:   "#ffd166",
    violet: "#9b72ff",
    text:   "#f0eaff",
    muted:  "#9b8ec4",
  };

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
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes wq-fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      <div style={{
        ...FONT,
        background: C.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        gap: 28,
        textAlign: "center",
      }}>

        {/* Avatar */}
        <div style={{
          fontSize: 80,
          lineHeight: 1,
          animation: "wq-float 3s ease-in-out infinite",
        }}>
          {avatar}
        </div>

        {/* Greeting */}
        <div style={{ animation: "wq-fade-in 0.5s ease-out both" }}>
          <h1 style={{
            ...FONT,
            fontSize: 28,
            fontWeight: 900,
            color: C.text,
            margin: "0 0 10px",
            lineHeight: 1.2,
          }}>
            Welcome back, {name}!
          </h1>
          <p style={{ ...FONT, fontSize: 16, color: C.gold, fontWeight: 700, margin: 0 }}>
            Ready to continue your adventure? 🚀
          </p>
        </div>

        {/* Countdown hint */}
        <div style={{
          ...FONT,
          fontSize: 14,
          color: C.muted,
          fontWeight: 700,
          animation: "wq-fade-in 0.5s 0.2s ease-out both",
        }}>
          {countdown > 0
            ? `Starting in ${countdown}…`
            : "Off we go!"}
        </div>

        {/* Progress bar */}
        <div style={{
          width: "100%",
          maxWidth: 320,
          height: 6,
          borderRadius: 3,
          background: "rgba(155,114,255,0.2)",
          overflow: "hidden",
          animation: "wq-fade-in 0.5s 0.3s ease-out both",
        }}>
          <div style={{
            height: "100%",
            borderRadius: 3,
            background: `linear-gradient(90deg, ${C.violet}, ${C.gold})`,
            width: countdown === 2 ? "0%" : countdown === 1 ? "50%" : "100%",
            transition: "width 1s linear",
          }} />
        </div>

        {/* Skip button */}
        <button
          onClick={() => router.replace(PLAY_URL)}
          style={{
            ...FONT,
            padding: "16px 40px",
            minHeight: 56,
            borderRadius: 16,
            border: "none",
            background: `linear-gradient(135deg, ${C.gold}, #e09000)`,
            color: "#1a0800",
            fontSize: 17,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(255,209,102,0.35)",
            animation: "wq-fade-in 0.5s 0.4s ease-out both",
          }}
        >
          Skip — Go now! 🚀
        </button>
      </div>
    </AppFrame>
  );
}
