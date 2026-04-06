"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatsData = {
  bonusBestStreak?: number;
};

// ─── Bonus Round Intro ────────────────────────────────────────────────────────

function BonusRoundIntro({ bestStreak }: { bestStreak: number | null }) {
  const rules = [
    "You have 30 seconds per question",
    "No wrong answers allowed",
    "Double points on every question!",
  ];

  return (
    <AppFrame audience="kid">
      <style>{`
        @keyframes starBurst {
          0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 12px rgba(255,209,102,0.6)); }
          25%       { transform: scale(1.12) rotate(-6deg); filter: drop-shadow(0 0 24px rgba(255,161,28,0.8)); }
          75%       { transform: scale(1.08) rotate(5deg);  filter: drop-shadow(0 0 20px rgba(255,209,102,0.7)); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,209,102,0); }
          50%       { box-shadow: 0 0 32px 8px rgba(255,209,102,0.28); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,161,28,0.15) 0%, transparent 60%), #0a0812",
          fontFamily: "'Nunito', system-ui, sans-serif",
          color: "#f0f6ff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "linear-gradient(160deg, #1a1428, #0e0e1e)",
            border: "2px solid rgba(255,209,102,0.35)",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 0 80px rgba(255,161,28,0.12), 0 32px 80px rgba(0,0,0,0.6)",
            animation: "glow-pulse 2.5s ease-in-out infinite",
          }}
        >
          {/* Hero */}
          <div
            style={{
              textAlign: "center",
              padding: "40px 28px 28px",
              background: "radial-gradient(ellipse at 50% -10%, rgba(255,209,102,0.22) 0%, transparent 65%)",
              borderBottom: "1px solid rgba(255,209,102,0.15)",
            }}
          >
            <span
              style={{
                fontSize: 96,
                lineHeight: 1,
                display: "block",
                marginBottom: 16,
                animation: "starBurst 1.8s ease-in-out infinite",
              }}
            >
              🌟
            </span>
            <h1
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: "#ffd166",
                margin: 0,
                marginBottom: 8,
                letterSpacing: "0.04em",
                textShadow: "0 0 24px rgba(255,209,102,0.5)",
                lineHeight: 1,
              }}
            >
              BONUS ROUND!
            </h1>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#ffcb60",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Answer 5 questions in a row correctly
              <br />
              for <span style={{ color: "#ff9f1c", fontWeight: 900 }}>2x stars</span>!
            </p>
          </div>

          {/* Rules */}
          <div style={{ padding: "24px 28px 8px", animation: "slide-up 0.5s ease 0.1s both" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: "rgba(255,209,102,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: 14,
              }}
            >
              The Rules
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rules.map((rule, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(255,209,102,0.06)",
                    border: "1px solid rgba(255,209,102,0.14)",
                    borderRadius: 12,
                    padding: "10px 14px",
                    animation: `slide-up 0.4s ease ${0.15 + i * 0.08}s both`,
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>
                    {i === 0 ? "⏱️" : i === 1 ? "🚫" : "💥"}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#ffe08a" }}>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Best streak */}
          {bestStreak !== null && bestStreak > 0 && (
            <div
              style={{
                margin: "16px 28px 0",
                textAlign: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,209,102,0.55)",
              }}
            >
              Your best: {bestStreak}/5 streak ⚡
            </div>
          )}

          {/* CTAs */}
          <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
            <Link
              href="/play?sessionMode=guided-quest&entry=bonus-round&bonusMode=true"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                minHeight: 60,
                background: "linear-gradient(135deg, #ffd166, #ff9f1c)",
                color: "#1a0e00",
                border: "none",
                borderRadius: 18,
                fontFamily: "'Nunito', system-ui, sans-serif",
                fontSize: 20,
                fontWeight: 900,
                cursor: "pointer",
                textDecoration: "none",
                textAlign: "center",
                letterSpacing: "0.02em",
                boxShadow: "0 8px 28px rgba(255,161,28,0.4)",
              }}
            >
              Start Bonus Round 🚀
            </Link>
            <Link
              href="/child/hub"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                minHeight: 44,
                background: "none",
                border: "none",
                fontFamily: "'Nunito', system-ui, sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: "rgba(255,209,102,0.45)",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Maybe later →
            </Link>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────

export default function BonusRoundPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [bestStreak, setBestStreak] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/child/session", { method: "GET" });
        if (!res.ok) {
          if (!cancelled) router.replace("/child");
          return;
        }
        if (!cancelled) setAuthed(true);

        // Fetch bonus stats (best effort)
        try {
          const statsRes = await fetch("/api/child/stats");
          if (statsRes.ok) {
            const stats = (await statsRes.json()) as StatsData;
            if (!cancelled && typeof stats.bonusBestStreak === "number") {
              setBestStreak(stats.bonusBestStreak);
            }
          }
        } catch {
          // non-critical
        }
      } catch {
        if (!cancelled) router.replace("/child");
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <AppFrame audience="kid">
        <div
          style={{
            minHeight: "100vh",
            background: "#0a0812",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "rgba(255,209,102,0.4)",
          }}
        >
          Loading…
        </div>
      </AppFrame>
    );
  }

  if (!authed) return null;

  return <BonusRoundIntro bestStreak={bestStreak} />;
}
